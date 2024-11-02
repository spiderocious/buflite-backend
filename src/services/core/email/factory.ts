/**
 * Email Service Factory
 * Factory for creating email service instances based on configuration
 */

import { IEmailService, EmailServiceConfig } from './interface';
import { ResendEmailService } from './resend.service';
import { logger } from '../../../utils/logger';
import { AppError } from '../../../utils/errors';

export class EmailServiceFactory {
  private static instance: IEmailService | null = null;

  /**
   * Create an email service instance based on configuration
   */
  static create(config: EmailServiceConfig): IEmailService {
    switch (config.provider) {
      case 'resend':
        return new ResendEmailService(config);
      
      case 'sendgrid':
        // TODO: Implement SendGridEmailService
        throw new AppError('SendGrid email service not yet implemented', 500);
      
      case 'nodemailer':
        // TODO: Implement NodemailerEmailService
        throw new AppError('Nodemailer email service not yet implemented', 500);
      
      default:
        throw new AppError(`Unsupported email provider: ${config.provider}`, 500);
    }
  }

  /**
   * Get or create a singleton email service instance
   */
  static getInstance(config?: EmailServiceConfig): IEmailService {
    if (!EmailServiceFactory.instance && config) {
      EmailServiceFactory.instance = EmailServiceFactory.create(config);
      logger.info(`✅ Email service initialized with provider: ${config.provider}`);
    } else if (!EmailServiceFactory.instance) {
      throw new AppError('Email service not initialized. Please provide configuration.', 500);
    }

    return EmailServiceFactory.instance;
  }

  /**
   * Reset the singleton instance (useful for testing)
   */
  static reset(): void {
    EmailServiceFactory.instance = null;
  }

  /**
   * Check if service is initialized
   */
  static isInitialized(): boolean {
    return EmailServiceFactory.instance !== null;
  }
}

// Export a convenience function for getting the service
export const getEmailService = (config?: EmailServiceConfig): IEmailService => {
  return EmailServiceFactory.getInstance(config);
};

export default EmailServiceFactory;
