/**
 * Email Service Utilities
 * Helper functions for email service integration and background job support
 */

import { getEmailService, EmailOptions, EmailTemplateOptions } from './core/email';
import { logger } from '../utils/logger';
import config from '../config';

/**
 * Initialize the email service with configuration
 */
export const initializeEmailService = () => {
  try {
    const emailService = getEmailService({
      provider: config.email.provider,
      apiKey: config.email.provider === 'resend' ? config.email.resend.apiKey : config.email.sendgrid.apiKey,
      defaultFrom: config.email.provider === 'resend' ? 
        `${config.email.resend.fromName} <${config.email.resend.fromEmail}>` :
        `${config.email.sendgrid.fromName} <${config.email.sendgrid.fromEmail}>`,
    });

    logger.info('Email service initialized successfully');
    return emailService;
  } catch (error) {
    logger.error('Failed to initialize email service:', error);
    throw error;
  }
};

/**
 * Get email service health status
 */
export const getEmailServiceHealth = async () => {
  try {
    const emailService = getEmailService();
    const health = await emailService.getHealthStatus();
    
    return {
      status: health.healthy ? 'healthy' : 'unhealthy',
      provider: config.email.provider,
      details: health.details,
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      provider: config.email.provider,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Queue email for background processing
 * This integrates with the background jobs system when implemented
 */
export const queueEmail = async (emailOptions: EmailOptions | EmailTemplateOptions) => {
  try {
    // For now, send immediately
    // TODO: Integrate with background jobs system when implemented
    const emailService = getEmailService();
    
    if ('templateId' in emailOptions) {
      return await emailService.sendTemplate(emailOptions);
    } else {
      return await emailService.sendEmail(emailOptions);
    }
  } catch (error) {
    logger.error('Failed to queue email:', error);
    throw error;
  }
};

/**
 * Send welcome email helper
 */
export const sendWelcomeEmail = async (to: string, firstName: string, appName?: string) => {
  const emailService = getEmailService();
  
  return await emailService.sendTemplate({
    to,
    templateId: 'welcome',
    variables: {
      firstName,
      appName: appName || 'Backend Template',
    },
  });
};

/**
 * Send password reset email helper
 */
export const sendPasswordResetEmail = async (
  to: string, 
  firstName: string, 
  resetUrl: string, 
  expirationTime: string = '1 hour'
) => {
  const emailService = getEmailService();
  
  return await emailService.sendTemplate({
    to,
    templateId: 'password-reset',
    variables: {
      firstName,
      resetUrl,
      expirationTime,
      appName: 'Backend Template',
    },
  });
};

/**
 * Send email verification helper
 */
export const sendEmailVerification = async (
  to: string, 
  firstName: string, 
  verificationUrl: string, 
  expirationTime: string = '24 hours'
) => {
  const emailService = getEmailService();
  
  return await emailService.sendTemplate({
    to,
    templateId: 'email-verification',
    variables: {
      firstName,
      verificationUrl,
      expirationTime,
      appName: 'Backend Template',
    },
  });
};

export default {
  initializeEmailService,
  getEmailServiceHealth,
  queueEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendEmailVerification,
};
