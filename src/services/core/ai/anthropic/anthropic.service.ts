import config from '@/config';
import { contentAnalysisMock, dashboardMock, videoAnalysisMock } from '@/constants/mocks';
import { PromptType } from '@/constants/prompts';
import { ChatModel, ChatStatus } from '@/models/mongodb/Chats';
import { auditLog } from '@/services/auditLog.service';
import { cacheService } from '@/services/core/cache/cache.service';
import { generateCacheKey, generateUUID } from '@/utils/idGenerator';
import Anthropic from '@anthropic-ai/sdk';
import { Request } from 'express';
import {
  AnalysisContext,
  AnalysisOptions,
  AnalysisResult,
  AnthropicConfig,
  RequestStatus,
} from './types';

export { RequestStatus } from './types';

export class AnthropicService {
  private anthropic: any;
  private config: AnthropicConfig;
  private cacheService: typeof cacheService;
  private static instance: AnthropicService;

  constructor() {
    this.config = {
      apiKey: config.ai.anthropic.apiKey || '',
      model: config.ai.anthropic.model || 'claude-2',
      maxTokens: 5000,
      temperature: 1,
      defaultCacheTTL: 3600, // 1 hour in seconds
    };

    this.anthropic = new Anthropic({
      apiKey: this.config.apiKey,
    });

    this.cacheService = cacheService;
  }

  public static getInstance(): AnthropicService {
    if (!AnthropicService.instance) {
      AnthropicService.instance = new AnthropicService();
    }
    return AnthropicService.instance;
  }

  async generateResponse(
    prompt: string,
    system: string,
    options: {
      useTooling?: boolean;
      contentType?: PromptType;
    } = {}
  ): Promise<string> {
    const useTooling = options?.useTooling || false;
    const tools = useTooling ? this.getTooling() : {};
    if (config.ai.anthropic.mock) {
      return this.getMockResponse(options.contentType || PromptType.CONTENT);
    }
    try {
      const response = await this.anthropic.messages.create({
        model: this.config.model,
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature,
        system,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt,
              },
            ],
          },
        ],
        ...{ ...tools },
      });

      return response?.content?.[0]?.text || '';
    } catch (error) {
      throw new Error('Failed to generate response from AI service');
    }
  }

  async getMockResponse(type: PromptType): Promise<string> {
    const mockToPromptMap: Record<PromptType, string> = {
      [PromptType.CONTENT]: JSON.stringify(contentAnalysisMock),
      [PromptType.VIDEO]: JSON.stringify(videoAnalysisMock),
      [PromptType.DASHBOARD]: JSON.stringify(dashboardMock),
    };
    return await new Promise(resolve => setTimeout(() => resolve(mockToPromptMap[type]), 3000));
  }

  /**
   * Analyze content with optional caching
   */
  async analyzeContent(
    req: Request,
    content: string,
    contentType: PromptType,
    options: AnalysisOptions = {}
  ): Promise<AnalysisResult> {
    const {
      cacheFirst = true,
      userId = 'anonymous',
      cacheConfig = {},
      useTooling = false,
    } = options;

    const analysisId = generateUUID();
    const context: AnalysisContext = {
      request: req,
      userId,
      contentType,
      analysisId,
      startTime: Date.now(),
    };

    // Generate cache key for this content
    const cacheKey = generateCacheKey(content, contentType);

    // Check cache first if enabled
    if (cacheFirst && cacheConfig.enabled !== false) {
      const cachedResult = this.getCachedResult(cacheKey);
      if (cachedResult) {
        await this.logUsage(context, RequestStatus.ANTHROPIC_RESULT, content, {
          response: cachedResult,
          cached: true,
          analysisId,
        });
        return cachedResult;
      }
    }

    // Log the request
    await this.logUsage(context, RequestStatus.ANTHROPIC_REQUEST, content, null);

    try {
      const prompt = await this.getPrompt(content, contentType);

      const response = await this.generateResponse(prompt.content, prompt.system, {
        useTooling,
        contentType,
      });
      const parsedResponse = JSON.parse(response);

      const chatData = {
        id: analysisId,
        message: content,
        response: response,
        sender: userId,
        type: contentType,
        status: ChatStatus.COMPLETED,
        modelName: this.config.model,
      };

      await ChatModel.create(chatData);

      const result: AnalysisResult = {
        ...parsedResponse,
        analysisId,
      };

      // Cache the response if caching is enabled
      if (cacheConfig?.enabled) {
        const ttl = cacheConfig.ttl || this.config.defaultCacheTTL;
        this.cacheResult(cacheKey, result, ttl);
      }

      // Log success
      await this.logUsage(context, RequestStatus.ANTHROPIC_SUCCESS, content, {
        response: result,
        prompt,
        analysisId,
        cached: false,
      });

      return result;
    } catch (error: any) {
      // Log error
      await this.logUsage(context, RequestStatus.ANTHROPIC_ERROR, content, {
        error: error?.message,
        analysisId,
      });
      throw new Error('Failed to analyze content');
    }
  }

  /**
   * Get cached analysis result
   */
  private getCachedResult(cacheKey: string): AnalysisResult | null {
    try {
      const cacheInfo = this.cacheService.getCacheInfo(cacheKey);
      return cacheInfo?.value || null;
    } catch (error) {
      console.warn('Error retrieving from cache:', error);
      return null;
    }
  }

  /**
   * Cache analysis result
   */
  private cacheResult(cacheKey: string, result: AnalysisResult, ttl: number): void {
    try {
      this.cacheService.saveToCache(cacheKey, result, {
        expiresIn: ttl,
      });
    } catch (error) {
      console.warn('Error saving to cache:', error);
    }
  }

  async getPrompt(
    content: string,
    contentType: PromptType
  ): Promise<{ content: string; system: string }> {
    const promptConfig = config.prompts[contentType] || {};
    if (!promptConfig.userPrompt || !promptConfig.systemPrompt) {
      throw new Error(`Missing prompt configuration for content type: ${contentType}`);
    }
    // Format the prompt based on content type
    const formattedPrompt = await this.replacePromptVariables(promptConfig.userPrompt, content);
    return {
      content: this.joinTodaysDateWithPrompt(formattedPrompt),
      system: promptConfig.systemPrompt,
    };
  }

  async replacePromptVariables(prompt: string, content: string) {
    return prompt.replace('{{CONTENT}}', content);
  }

  joinTodaysDateWithPrompt(prompt: string): string {
    const today = new Date().toISOString();
    return `${prompt} Analysis Date: ${today}\n\n`;
  }

  async logUsage(
    context: AnalysisContext,
    event: string,
    content: string,
    response: any
  ): Promise<void> {
    await auditLog.logFromRequest(context.request, event, event, {
      event,
      content,
      response,
      userId: context.userId,
      contentType: context.contentType,
      analysisId: context.analysisId,
      duration: Date.now() - context.startTime,
    });
  }

  getTooling() {
    return {
      tools: [
        {
          name: 'web_search',
          type: 'web_search_20250305',
          user_location: {
            type: 'approximate',
            city: 'Lagos',
            country: 'US',
            region: 'Americas',
          },
        },
      ],
      betas: ['web-search-2025-03-05'],
    };
  }
}

export const contentService = AnthropicService.getInstance();
export default contentService;
