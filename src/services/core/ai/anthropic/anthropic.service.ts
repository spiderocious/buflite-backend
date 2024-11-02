import Anthropic from '@anthropic-ai/sdk';
import { auditLog } from '../../../auditLog.service';
import { Request } from 'express';
import { CacheService } from '@/services/core/cache';
import { generateAlphanumericId } from '@/utils/idGenerator';

export enum RequestStatus {
  ANTHROPIC_SUCCESS = 'ANTHROPIC_SUCCESS',
  ANTHROPIC_ERROR = 'ANTHROPIC_ERROR',
  ANTHROPIC_REQUEST = 'ANTHROPIC_REQUEST',
  ANTHROPIC_RESULT = 'ANTHROPIC_RESULT',
}

export class AnthropicService {
  private anthropic: any;

  constructor() {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  async generateResponse(prompt: string, system: string): Promise<string> {
    try {
      const response = await this.anthropic.messages.create({
        model: process.env.ANTHROPIC_MODEL || 'claude-2',
        max_tokens: 20000,
        temperature: 1,
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

  async analyzeContent(req: Request, content: string): Promise<any> {
    // cut 20 characters from begining, 20 towards end (don't crash if there is less than 20 characters)
    const analysisId = generateAlphanumericId(10);
    const contentKey =
      content.length > 40 ? `${content.slice(0, 20)}...${content.slice(-20)}` : content;

    this.logUsage(req, RequestStatus.ANTHROPIC_REQUEST, content, null);
    try {
      const platform = process.env.PLATFORM || 'unknown';
      const prompt = await this.formatAnalysisPrompt(content, platform);
      const system = process.env.ANTHROPIC_ROLE || 'user';

      const response = await this.generateResponse(prompt, system);
    
      // Log usage
      await this.logUsage(req, RequestStatus.ANTHROPIC_SUCCESS, content, {
        response,
        prompt,
        analysisId,
      });
        

      const parsedResponse = JSON.parse(response);
      // Cache the response
      await CacheService.saveToCache(contentKey, {
        ...parsedResponse,
        analysisId,
      }, {
        expiresIn: 3600000, // cache for 1 hour
      });
      return parsedResponse;
    } catch (error: any) {
      // Log error
      await this.logUsage(req, RequestStatus.ANTHROPIC_ERROR, content, {
        ...error?.message,
        analysisId,
      });
      throw new Error('Failed to analyze content');
    }
  }

  async formatAnalysisPrompt(content: string, platform: string): Promise<string> {
    const prompt = `${process.env.ANTHROPIC_PROMPT || ''} Analysis Date: ${new Date().toISOString()}\n\n`;
    return prompt.replace('{{CONTENT}}', content).replace('{{PLATFORM}}', platform);
  }

  async logUsage(req: Request, event: string, content: string, response: any): Promise<void> {
    await auditLog.logFromRequest(req, event, event, {
      event,
      content,
      response,
    });
  }

}
