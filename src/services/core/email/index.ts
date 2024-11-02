/**
 * Email Service Module
 * Exports all email service components
 */

export * from './interface';
export * from './resend.service';
export * from './factory';
export * from './validation';

// Re-export common types and utilities
export type {
  IEmailService,
  EmailOptions,
  EmailTemplateOptions,
  EmailResult,
  EmailDeliveryStatus,
  EmailTemplate,
  EmailServiceConfig,
  EmailAttachment
} from './interface';

export { EmailServiceFactory, getEmailService } from './factory';
export { ResendEmailService } from './resend.service';
export { EmailValidator, isValidEmail, validateEmail, normalizeEmail } from './validation';
