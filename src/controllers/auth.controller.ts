import crypto from 'crypto';
import { NextFunction, Request, Response } from 'express';
import { User } from '../models';
import { auditLog } from '../services/auditLog.service';
import { RequestError } from '../utils/errors';
import { JWTUtils } from '../utils/jwt';
import { logger } from '../utils/logger';
import { CreatedResponse, SuccessResponse } from '../utils/response';

/**
 * Authentication Controller
 * Handles user registration, login, password management, and token operations
 * Uses MongoDB for persistent storage
 */

/**
 * Validate email format
 */
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 */
const isValidPassword = (password: string): boolean => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return passwordRegex.test(password);
};

/**
 * Generate secure random token
 */
const generateSecureToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

export class AuthController {
  /**
   * Register new user
   */
  static register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name, email, password, role = 'user' } = req.body;

      // Validate required fields
      if ( !name || !email || !password) {
        throw new RequestError('All fields are required: name, email, password');
      }

      const firstName = name;
      const lastName = name; // Assuming lastName is optional, can be set to empty string

      if (!isValidEmail(email)) {
        throw new RequestError('Invalid email format');
      }

      if (!isValidPassword(password)) {
        throw new RequestError('Password must be at least 8 characters and contain uppercase, lowercase, and number');
      }

      // Check if user already exists
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        throw new RequestError('User already exists with this email');
      }

      // Create user (password will be hashed by the pre-save middleware)
      const user = new User({
        firstName,
        lastName,
        email: email.toLowerCase(),
        password,
        role,
        isActive: true,
        isEmailVerified: false
      });

      // Generate email verification token
      const verificationToken = generateSecureToken();
      const hashedToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
      
      user.emailVerificationToken = hashedToken;
      user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      await user.save();

      // Audit log for user registration
      await auditLog.logFromRequest(
        req,
        'USER_REGISTERED',
        `New user registered: ${user.email}`,
        {
          userId: user._id.toString(),
          email: user.email,
          role: user.role,
          emailVerificationRequired: true
        }
      );

      logger.info('User registered successfully', {
        userId: user._id.toString(),
        email: user.email,
        role: user.role
      });

      const responseUser = {
        id: user._id.toString(),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt
      };

      const tokenPair = JWTUtils.generateTokenPair({
        userId: user._id.toString(),
        email: user.email,
        role: user.role
      });


      CreatedResponse(res, 'Registration successful. Please check your email for verification link.', {
        user: responseUser,
        token: tokenPair?.accessToken,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * User login
   */
  static login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body;

      // Validate required fields
      if (!email || !password) {
        throw new RequestError('Email and password are required');
      }

      // Find user by email and include password field
      const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
      if (!user) {
        throw new RequestError('Invalid email or password');
      }

      // Check password using the model's comparePassword method
      const isValidPassword = await user.comparePassword(password);
      if (!isValidPassword) {
        logger.warn('Failed login attempt', { email, ip: req.ip });
        throw new RequestError('Invalid email or password');
      }

      // Check if user is active
      if (!user.isActive) {
        throw new RequestError('Account is not active');
      }

      // Generate tokens
      const tokenPair = JWTUtils.generateTokenPair({
        userId: user._id.toString(),
        email: user.email,
        role: user.role
      });

      // Update last login
      user.lastLoginAt = new Date();
      await user.save();

      // Audit log for successful login
      await auditLog.logFromRequest(
        req,
        'USER_LOGIN',
        `User logged in successfully: ${user.email}`,
        {
          userId: user._id.toString(),
          email: user.email,
          role: user.role,
          lastLoginAt: user.lastLoginAt
        }
      );

      logger.info('User logged in successfully', {
        userId: user._id.toString(),
        email: user.email,
        ip: req.ip
      });

      const responseUser = {
        id: user._id.toString(),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        isEmailVerified: user.isEmailVerified,
        lastLoginAt: user.lastLoginAt
      };

      SuccessResponse(res, 'Login successful', {
        user: responseUser,
        token: tokenPair?.accessToken,
      });
    } catch (error) {
      next(error);
    }
  };


}
