import { CacheService } from '@/services/core/cache';
import { Request, Response } from 'express';
import { AnthropicService } from '../services/core/ai/anthropic/anthropic.service';
import { ErrorResponse, SuccessResponse } from '../utils/response';

const contentService = new AnthropicService();

export async function analyzeContent(req: any, res: Response) {
  const { content } = req.body;
  const userId = req.userId || 'anonymous';
  const contentTriesKey = userId + '-content-tries';
  const contentTrialLimit = Number(process.env.CONTENT_TRIAL_LIMIT) || 5;
  const contentTries = CacheService.getCacheInfo(contentTriesKey)?.value || 0;
  console.log('Content tries:', contentTries, contentTriesKey);
  if (contentTries >= contentTrialLimit) {
    return ErrorResponse(
      res,
      `You have reached the content analysis limit of ${contentTrialLimit} tries, Limits are reset every 24 hours.`
    );
  }

  if (!content) {
    return ErrorResponse(res, 'Content is required for analysis');
  } else if (content.length < 20) {
    return ErrorResponse(res, 'Content must be at least 20 characters long');
  } else if (content.length > 500) {
    return ErrorResponse(res, 'Content must not exceed 500 characters');
  }

  let contentKey =
    content.length > 40 ? `${content.slice(0, 20)}...${content.slice(-20)}` : content;
  //replace all non-alphanumeric characters with a dash. amd all spaces with a dash
  contentKey = contentKey.replace(/[^a-zA-Z0-9]+/g, '-').replace(/\s+/g, '-');
  contentKey = contentKey.toLowerCase();

  const info = CacheService.getCacheInfo(contentKey);
  console.log('derived content key:', contentKey);
  console.log('Cache info:', info);
  if (info) {
    // If cache info exists, use it
    return SuccessResponse(res, 'Content analysis successful', info?.value);
  }

  try {
    const result = await contentService.analyzeContent(req, content);
    // update user content tries
    CacheService.saveToCache(contentTriesKey, contentTries + 1, {
      expiresIn: 24 * 60 * 60 * 1000,
    });
    return SuccessResponse(res, 'Content analysis successful', result);
  } catch (error) {
    console.error('Error analyzing content:', error);
    return ErrorResponse(res, 'Failed to analyze content');
  }
}
