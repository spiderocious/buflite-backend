import Anthropic from '@anthropic-ai/sdk';
import { auditLog } from '../../../auditLog.service';
import { Request } from 'express';
import { cacheService } from '@/services/core/cache/cache.service';
import { generateAlphanumericId, generateCacheKey } from '@/utils/idGenerator';
import { analysisMock, videoAnalysisMock } from '../../../../constants/mocks';
import { 
  AnalysisOptions, 
  AnalysisResult, 
  RequestStatus, 
  AnthropicConfig,
  AnalysisContext 
} from './types';

export { RequestStatus } from './types';

export class AnthropicService {
  private anthropic: any;
  private config: AnthropicConfig;
  private cacheService: typeof cacheService;

  constructor() {
    this.config = {
      apiKey: process.env.ANTHROPIC_API_KEY || '',
      model: process.env.ANTHROPIC_MODEL || 'claude-2',
      maxTokens: 20000,
      temperature: 1,
      defaultCacheTTL: 3600, // 1 hour in seconds
    };
    console.log('authenticating with Anthropic service using')

    this.anthropic = new Anthropic({
      apiKey: this.config.apiKey,
    });

    this.cacheService = cacheService;
  }

  async generateResponse(prompt: string, system: string): Promise<string> {
    return new Promise((resolve) => {
      resolve(JSON.stringify(videoAnalysisMock)); // Mock response for testing
    });
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
      });

      return response?.content?.[0]?.text || '';
    } catch (error) {
      throw new Error('Failed to generate response from AI service');
    }
  }

  /**
   * Analyze content with optional caching
   */
  async analyzeContent(
    req: Request, 
    content: string, 
    isVideo: boolean, 
    options: AnalysisOptions = {}
  ): Promise<AnalysisResult> {
    const {
      cacheFirst = true,
      userId = 'anonymous',
      contentType = isVideo ? 'video' : 'post',
      cacheConfig = {}
    } = options;

    const analysisId = generateAlphanumericId(10);
    const context: AnalysisContext = {
      request: req,
      userId,
      contentType,
      analysisId,
      startTime: Date.now()
    };

    // Generate cache key for this content
    const cacheKey = generateCacheKey(content, contentType);

    // Check cache first if enabled
    if (cacheFirst && (cacheConfig.enabled !== false)) {
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
      const platform = process.env.PLATFORM || 'unknown';
      const prompt = await this.formatAnalysisPrompt(content, platform, isVideo);
      const system = process.env.ANTHROPIC_ROLE || 'user';

      const response = await this.generateResponse(prompt, system);
      const parsedResponse = JSON.parse(response);
      
      const result: AnalysisResult = { 
        ...parsedResponse, 
        analysisId 
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

  async formatAnalysisPrompt(content: string, platform: string, isVideo = false): Promise<string> {
    const analysis = isVideo ? process.env.ANTHROPIC_VIDEO_PROMPT : process.env.ANTHROPIC_PROMPT;
    const prompt = `${analysis || ''} Analysis Date: ${new Date().toISOString()}\n\n`;
    return prompt.replace('{{CONTENT}}', content).replace('{{PLATFORM}}', platform);
  }

  async logUsage(context: AnalysisContext, event: string, content: string, response: any): Promise<void> {
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
}
