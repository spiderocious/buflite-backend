/**
 * Email Service Interface
 * Provides a standardized interface for email operations across different providers
 */

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  html: string;
  variables?: string[];
}

export interface EmailAttachment {
  filename: string;
  content: Buffer | string;
  contentType?: string;
  encoding?: string;
}

export interface EmailOptions {
  to: string | string[];
  from?: string;
  subject: string;
  html?: string;
  text?: string;
  attachments?: EmailAttachment[];
  replyTo?: string;
  cc?: string | string[];
  bcc?: string | string[];
  priority?: 'high' | 'normal' | 'low';
  headers?: Record<string, string>;
}

export interface EmailTemplateOptions {
  to: string | string[];
  templateId: string;
  variables: Record<string, any>;
  from?: string;
  replyTo?: string;
  cc?: string | string[];
  bcc?: string | string[];
  priority?: 'high' | 'normal' | 'low';
  headers?: Record<string, string>;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  provider?: string;
  timestamp: Date;
}

export interface EmailDeliveryStatus {
  messageId: string;
  status: 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'failed';
  timestamp: Date;
  details?: any;
}

export interface EmailServiceConfig {
  provider: 'resend' | 'sendgrid' | 'nodemailer';
  apiKey?: string;
  defaultFrom: string;
  templates?: EmailTemplate[];
  options?: {
    retryAttempts?: number;
    retryDelay?: number;
    timeout?: number;
  };
}

export interface IEmailService {
  /**
   * Send a simple email
   */
  sendEmail(options: EmailOptions): Promise<EmailResult>;

  /**
   * Send an email using a template
   */
  sendTemplate(options: EmailTemplateOptions): Promise<EmailResult>;

  /**
   * Send multiple emails (batch)
   */
  sendBatch(emails: EmailOptions[]): Promise<EmailResult[]>;

  /**
   * Get email delivery status
   */
  getDeliveryStatus(messageId: string): Promise<EmailDeliveryStatus | null>;

  /**
   * Validate email address format
   */
  validateEmail(email: string): boolean;

  /**
   * Get available templates
   */
  getTemplates(): EmailTemplate[];

  /**
   * Add or update a template
   */
  setTemplate(template: EmailTemplate): void;

  /**
   * Get service health status
   */
  getHealthStatus(): Promise<{ healthy: boolean; details?: any }>;
}
