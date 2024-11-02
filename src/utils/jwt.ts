/**
 * JWT Utilities
 * Functions for JWT token generation, verification, and management
 */

import jwt, { SignOptions, VerifyOptions } from 'jsonwebtoken';
import crypto from 'crypto';
import { logger } from '../utils/logger';
import config from '../config';
import { AppError } from '../utils/errors';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  type: 'access' | 'refresh';
  iat?: number;
  exp?: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  refreshExpiresIn: number;
}

export interface VerifyTokenResult {
  valid: boolean;
  payload?: TokenPayload;
  error?: string;
  expired?: boolean;
}

export class JWTUtils {
  /**
   * Generate access token
   */
  static generateAccessToken(payload: { userId: string; email: string; role: string }): string {
    try {
      const tokenPayload = {
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
        type: 'access' as const
      };

      return jwt.sign(tokenPayload, config.jwt.secret, { expiresIn: '24h' });
    } catch (error) {
      logger.error('Error generating access token:', error);
      throw new AppError('Failed to generate access token', 500);
    }
  }

  /**
   * Generate refresh token
   */
  static generateRefreshToken(payload: { userId: string; email: string; role: string }): string {
    try {
      const tokenPayload = {
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
        type: 'refresh' as const
      };

      return jwt.sign(tokenPayload, config.jwt.secret, { expiresIn: '7d' });
    } catch (error) {
      logger.error('Error generating refresh token:', error);
      throw new AppError('Failed to generate refresh token', 500);
    }
  }

  /**
   * Generate token pair (access + refresh)
   */
  static generateTokenPair(payload: { userId: string; email: string; role: string }): TokenPair {
    try {
      const accessToken = JWTUtils.generateAccessToken(payload);
      const refreshToken = JWTUtils.generateRefreshToken(payload);

      // Calculate expiration times in seconds
      const accessExpiresIn = JWTUtils.getExpirationTime(config.jwt.expire);
      const refreshExpiresIn = JWTUtils.getExpirationTime(config.jwt.refreshExpire);

      return {
        accessToken,
        refreshToken,
        expiresIn: accessExpiresIn,
        refreshExpiresIn: refreshExpiresIn
      };
    } catch (error) {
      logger.error('Error generating token pair:', error);
      throw new AppError('Failed to generate token pair', 500);
    }
  }

  /**
   * Verify token
   */
  static verifyToken(token: string, tokenType?: 'access' | 'refresh'): VerifyTokenResult {
    try {
      const options: VerifyOptions = {};
      const decoded = jwt.verify(token, config.jwt.secret, options) as TokenPayload;

      // Check token type if specified
      if (tokenType && decoded.type !== tokenType) {
        return {
          valid: false,
          error: `Invalid token type. Expected ${tokenType}, got ${decoded.type}`
        };
      }

      return {
        valid: true,
        payload: decoded
      };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return {
          valid: false,
          error: 'Token has expired',
          expired: true
        };
      } else if (error instanceof jwt.JsonWebTokenError) {
        return {
          valid: false,
          error: 'Invalid token format'
        };
      } else if (error instanceof jwt.NotBeforeError) {
        return {
          valid: false,
          error: 'Token not yet valid'
        };
      } else {
        logger.error('Token verification error:', error);
        return {
          valid: false,
          error: 'Token verification failed'
        };
      }
    }
  }

  /**
   * Verify access token specifically
   */
  static verifyAccessToken(token: string): VerifyTokenResult {
    return JWTUtils.verifyToken(token, 'access');
  }

  /**
   * Verify refresh token specifically
   */
  static verifyRefreshToken(token: string): VerifyTokenResult {
    return JWTUtils.verifyToken(token, 'refresh');
  }

  /**
   * Extract token from Authorization header
   */
  static extractTokenFromHeader(authHeader: string | undefined): string | null {
    if (!authHeader) {
      return null;
    }

    // Check for Bearer token format
    const bearerMatch = authHeader.match(/^Bearer\s+(.+)$/i);
    if (bearerMatch) {
      return bearerMatch[1];
    }

    // Return the header value as-is if not Bearer format
    return authHeader;
  }

  /**
   * Decode token without verification (for debugging/logging)
   */
  static decodeToken(token: string): any {
    try {
      return jwt.decode(token, { complete: true });
    } catch (error) {
      logger.error('Error decoding token:', error);
      return null;
    }
  }

  /**
   * Get token expiration time in seconds
   */
  static getTokenExpiration(token: string): number | null {
    try {
      const decoded = jwt.decode(token) as any;
      return decoded?.exp || null;
    } catch (error) {
      logger.error('Error getting token expiration:', error);
      return null;
    }
  }

  /**
   * Check if token is expired
   */
  static isTokenExpired(token: string): boolean {
    const exp = JWTUtils.getTokenExpiration(token);
    if (!exp) return true;
    
    return Date.now() >= exp * 1000;
  }

  /**
   * Generate secure random token for email verification, password reset, etc.
   */
  static generateSecureToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Hash token for storage
   */
  static hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * Get time remaining until token expires (in seconds)
   */
  static getTimeToExpiration(token: string): number | null {
    const exp = JWTUtils.getTokenExpiration(token);
    if (!exp) return null;
    
    const now = Math.floor(Date.now() / 1000);
    return Math.max(0, exp - now);
  }

  /**
   * Convert time string to seconds
   */
  private static getExpirationTime(timeString: string): number {
    const timeValue = parseInt(timeString);
    const timeUnit = timeString.slice(-1);

    switch (timeUnit) {
      case 's':
        return timeValue;
      case 'm':
        return timeValue * 60;
      case 'h':
        return timeValue * 60 * 60;
      case 'd':
        return timeValue * 24 * 60 * 60;
      default:
        // Default to seconds if no unit specified
        return timeValue;
    }
  }

  /**
   * Generate secure random token for email verification, password reset, etc.
   */
  static generateVerificationToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Hash verification token for storage
   */
  static hashVerificationToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}

// Export convenience functions
export const generateAccessToken = JWTUtils.generateAccessToken;
export const generateRefreshToken = JWTUtils.generateRefreshToken;
export const generateTokenPair = JWTUtils.generateTokenPair;
export const verifyToken = JWTUtils.verifyToken;
export const verifyAccessToken = JWTUtils.verifyAccessToken;
export const verifyRefreshToken = JWTUtils.verifyRefreshToken;
export const extractTokenFromHeader = JWTUtils.extractTokenFromHeader;

export default JWTUtils;
