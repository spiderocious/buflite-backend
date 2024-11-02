/**
 * Resend Email Service Implementation
 * Production-ready email service using Resend API
 */

import { Resend } from 'resend';
import { 
  IEmailService, 
  EmailOptions, 
  EmailTemplateOptions, 
  EmailResult, 
  EmailDeliveryStatus, 
  EmailTemplate,
  EmailServiceConfig 
} from './interface';
import { logger } from '../../../utils/logger';
import { AppError } from '../../../utils/errors';

export class ResendEmailService implements IEmailService {
  private resend: Resend;
  private config: EmailServiceConfig;
  private templates: Map<string, EmailTemplate> = new Map();

  constructor(config: EmailServiceConfig) {
    if (!config.apiKey) {
      throw new AppError('Resend API key is required', 500);
    }
    
    this.config = config;
    this.resend = new Resend(config.apiKey);
    this.loadTemplates();
    
    logger.info('ResendEmailService initialized');
  }

  /**
   * Send a simple email
   */
  async sendEmail(options: EmailOptions): Promise<EmailResult> {
    try {
      const emailData = {
        from: options.from || this.config.defaultFrom,
        to: Array.isArray(options.to) ? options.to : [options.to],
        subject: options.subject,
        html: options.html,
        text: options.text || '', // Resend requires either text or html
        reply_to: options.replyTo,
        cc: options.cc ? (Array.isArray(options.cc) ? options.cc : [options.cc]) : undefined,
        bcc: options.bcc ? (Array.isArray(options.bcc) ? options.bcc : [options.bcc]) : undefined,
        attachments: options.attachments?.map(att => ({
          filename: att.filename,
          content: att.content,
          content_type: att.contentType,
        })),
        headers: options.headers,
      };

      const result = await this.resend.emails.send(emailData);

      if (result.error) {
        logger.error('Resend email error:', result.error);
        return {
          success: false,
          error: result.error.message,
          provider: 'resend',
          timestamp: new Date(),
        };
      }

      logger.info(`Email sent successfully via Resend: ${result.data?.id}`);
      return {
        success: true,
        messageId: result.data?.id,
        provider: 'resend',
        timestamp: new Date(),
      };

    } catch (error) {
      logger.error('Failed to send email via Resend:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        provider: 'resend',
        timestamp: new Date(),
      };
    }
  }

  /**
   * Send an email using a template
   */
  async sendTemplate(options: EmailTemplateOptions): Promise<EmailResult> {
    try {
      const template = this.templates.get(options.templateId);
      if (!template) {
        throw new AppError(`Template '${options.templateId}' not found`, 400);
      }

      // Replace template variables
      let html = template.html;
      let subject = template.subject;

      for (const [key, value] of Object.entries(options.variables)) {
        const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
        html = html.replace(regex, String(value));
        subject = subject.replace(regex, String(value));
      }

      const emailOptions: EmailOptions = {
        to: options.to,
        from: options.from,
        subject,
        html,
        replyTo: options.replyTo,
        cc: options.cc,
        bcc: options.bcc,
        priority: options.priority,
        headers: options.headers,
      };

      return await this.sendEmail(emailOptions);

    } catch (error) {
      logger.error('Failed to send template email:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        provider: 'resend',
        timestamp: new Date(),
      };
    }
  }

  /**
   * Send multiple emails (batch)
   */
  async sendBatch(emails: EmailOptions[]): Promise<EmailResult[]> {
    const results: EmailResult[] = [];
    
    for (const email of emails) {
      const result = await this.sendEmail(email);
      results.push(result);
      
      // Add small delay between emails to avoid rate limiting
      if (emails.length > 1) {
        await this.delay(100);
      }
    }
    
    return results;
  }

  /**
   * Get email delivery status
   * Note: Resend doesn't provide detailed delivery tracking in free tier
   */
  async getDeliveryStatus(messageId: string): Promise<EmailDeliveryStatus | null> {
    try {
      // This would require Resend webhook implementation for real-time status
      // For now, we'll return a basic status
      logger.info(`Checking delivery status for message: ${messageId}`);
      
      return {
        messageId,
        status: 'sent',
        timestamp: new Date(),
        details: 'Status tracking requires webhook implementation',
      };
    } catch (error) {
      logger.error('Failed to get delivery status:', error);
      return null;
    }
  }

  /**
   * Validate email address format
   */
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Get available templates
   */
  getTemplates(): EmailTemplate[] {
    return Array.from(this.templates.values());
  }

  /**
   * Add or update a template
   */
  setTemplate(template: EmailTemplate): void {
    this.templates.set(template.id, template);
    logger.info(`Email template '${template.id}' updated`);
  }

  /**
   * Get service health status
   */
  async getHealthStatus(): Promise<{ healthy: boolean; details?: any }> {
    try {
      // Test API connection by checking API key validity
      // Note: Resend doesn't have a dedicated health check endpoint
      return {
        healthy: true,
        details: {
          provider: 'resend',
          apiKeyConfigured: !!this.config.apiKey,
          templatesLoaded: this.templates.size,
        },
      };
    } catch (error) {
      return {
        healthy: false,
        details: {
          provider: 'resend',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * Load default templates
   */
  private loadTemplates(): void {
    const defaultTemplates: EmailTemplate[] = [
      {
        id: 'welcome',
        name: 'Welcome Email',
        subject: 'Welcome to {{appName}}!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1>Welcome to {{appName}}!</h1>
            <p>Hi {{firstName}},</p>
            <p>Thank you for joining {{appName}}. We're excited to have you on board!</p>
            <p>If you have any questions, feel free to reach out to our support team.</p>
            <p>Best regards,<br>The {{appName}} Team</p>
          </div>
        `,
        variables: ['appName', 'firstName'],
      },
      {
        id: 'password-reset',
        name: 'Password Reset',
        subject: 'Reset your {{appName}} password',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1>Reset Your Password</h1>
            <p>Hi {{firstName}},</p>
            <p>You requested to reset your password for {{appName}}.</p>
            <p>Click the button below to reset your password:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{resetUrl}}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">Reset Password</a>
            </div>
            <p>This link will expire in {{expirationTime}}.</p>
            <p>If you didn't request this, please ignore this email.</p>
            <p>Best regards,<br>The {{appName}} Team</p>
          </div>
        `,
        variables: ['appName', 'firstName', 'resetUrl', 'expirationTime'],
      },
      {
        id: 'email-verification',
        name: 'Email Verification',
        subject: 'Verify your {{appName}} email address',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1>Verify Your Email</h1>
            <p>Hi {{firstName}},</p>
            <p>Please verify your email address for {{appName}} by clicking the button below:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{verificationUrl}}" style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">Verify Email</a>
            </div>
            <p>This link will expire in {{expirationTime}}.</p>
            <p>If you didn't create an account, please ignore this email.</p>
            <p>Best regards,<br>The {{appName}} Team</p>
          </div>
        `,
        variables: ['appName', 'firstName', 'verificationUrl', 'expirationTime'],
      },
    ];

    // Load default templates
    defaultTemplates.forEach(template => {
      this.templates.set(template.id, template);
    });

    // Load custom templates from config
    if (this.config.templates) {
      this.config.templates.forEach(template => {
        this.templates.set(template.id, template);
      });
    }

    logger.info(`Loaded ${this.templates.size} email templates`);
  }

  /**
   * Helper method to add delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
