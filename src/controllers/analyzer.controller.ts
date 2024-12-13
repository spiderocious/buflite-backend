import { Request, Response } from 'express';
import { PromptType } from '../constants';
import { ChatModel } from '../models/mongodb/Chats';
import contentService from '../services/core/ai/anthropic/anthropic.service';
import { trialLimitService } from '../services/trialLimit.service';
import { ErrorResponse, SuccessResponse } from '../utils/response';


export async function analyzeContent(req: Request, res: Response) {
  const { content, type } = req.body;
  const contentType = type || 'content'; // can be video
  const userId = (req as any).userId || 'anonymous';

  // Input validation
  if (!content) {
    return ErrorResponse(res, 'Content is required for analysis');
  } else if (content.length < 20) {
    return ErrorResponse(res, 'Content must be at least 20 characters long');
  } else if (content.length > 10000) {
    return ErrorResponse(res, 'Content must not exceed 10000 characters');
  }

  // Check trial limits
  if (trialLimitService.checkLimit(userId, contentType)) {
    const trialLimit = trialLimitService.getTrialLimit();
    return ErrorResponse(
      res,
      `You have reached the content analysis limit of ${trialLimit} tries. Limits are reset every 24 hours.`,
      { 
        remainingTrials: 0,
        trialLimit,
        timeUntilReset: trialLimitService.getTimeUntilReset(userId, contentType)
      }
    );
  }

  try {
    const isVideo = contentType === 'video' ? PromptType.VIDEO : PromptType.CONTENT;
    // Call service with caching enabled by default
    const result = await contentService.analyzeContent(req, content, isVideo, {
      cacheFirst: true,
      userId,
      contentType,
      cacheConfig: {
        ttl: 3600, // Cache for 1 hour
        enabled: true
      }
    });

    // Increment trial count after successful analysis
    trialLimitService.incrementCount(userId, contentType);

    // Return success response with additional metadata
    return SuccessResponse(res, 'Content analysis successful', {
      ...result,
      metadata: {
        remainingTrials: trialLimitService.getRemainingTrials(userId, contentType),
        trialLimit: trialLimitService.getTrialLimit(),
        contentType,
        userId: userId === 'anonymous' ? undefined : userId
      }
    });
  } catch (error) {
    return ErrorResponse(res, 'Failed to analyze content', {
      remainingTrials: trialLimitService.getRemainingTrials(userId, contentType),
      trialLimit: trialLimitService.getTrialLimit()
    });
  }
}

export async function getAnalyzedContent(req: Request, res: Response) {
  const { type } = req.params;
  const userId = (req as any).userId || 'anonymous';
  console.log({ sender: userId, type });
  const chats = await ChatModel.find({ sender: userId, type }).sort({ createdAt: -1 });
  return SuccessResponse(res, 'Retrieved analyzed content', {
    chats
  })
}