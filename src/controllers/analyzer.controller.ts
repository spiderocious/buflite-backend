import { Request, Response } from 'express';
import contentService from '../services/core/ai/anthropic/anthropic.service';
import { trialLimitService } from '../services/trialLimit.service';
import { ErrorResponse, SuccessResponse } from '../utils/response';


export async function analyzeContent(req: Request, res: Response) {
  const { content, type } = req.body;
  const contentType = type || 'post'; // can be video
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
    const isVideo = contentType === 'video';
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
    console.error('Error analyzing content:', error);
    return ErrorResponse(res, 'Failed to analyze content', {
      remainingTrials: trialLimitService.getRemainingTrials(userId, contentType),
      trialLimit: trialLimitService.getTrialLimit()
    });
  }
}
