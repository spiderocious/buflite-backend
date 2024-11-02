/**
 * Authentication Related Types
 */

import { UserRole, UserStatus } from '../utils/constants';

/**
 * User Authentication Data Transfer Objects
 */
export interface RegisterRequestDTO {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: UserRole;
}

export interface LoginRequestDTO {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface ChangePasswordRequestDTO {
  currentPassword: string;
  newPassword: string;
  confirmPassword?: string;
}

export interface ForgotPasswordRequestDTO {
  email: string;
}

export interface ResetPasswordRequestDTO {
  token: string;
  password: string;
  confirmPassword?: string;
}

export interface VerifyEmailRequestDTO {
  token: string;
}

export interface RefreshTokenRequestDTO {
  refreshToken: string;
}

export interface UpdateProfileRequestDTO {
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
  preferences?: UserPreferences;
}

/**
 * User Authentication Response DTOs
 */
export interface AuthResponseDTO {
  user: UserResponseDTO;
  tokens: TokenPairDTO;
}

export interface UserResponseDTO {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  isEmailVerified: boolean;
  avatar?: string;
  preferences?: UserPreferences;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface TokenPairDTO {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
}

export interface RefreshTokenResponseDTO {
  tokens: TokenPairDTO;
}

/**
 * User Preferences
 */
export interface UserPreferences {
  theme?: 'light' | 'dark' | 'auto';
  language?: string;
  timezone?: string;
  emailNotifications?: EmailNotificationSettings;
  pushNotifications?: PushNotificationSettings;
  privacy?: PrivacySettings;
}

export interface EmailNotificationSettings {
  marketing?: boolean;
  security?: boolean;
  updates?: boolean;
  newsletters?: boolean;
}

export interface PushNotificationSettings {
  enabled?: boolean;
  marketing?: boolean;
  security?: boolean;
  updates?: boolean;
}

export interface PrivacySettings {
  profileVisibility?: 'public' | 'private' | 'friends';
  showEmail?: boolean;
  showPhone?: boolean;
  allowSearchByEmail?: boolean;
}

/**
 * JWT Token Payload Types
 */
export interface AccessTokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  type: 'access';
  iat: number;
  exp: number;
  iss: string;
  aud: string;
}

export interface RefreshTokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  type: 'refresh';
  iat: number;
  exp: number;
  iss: string;
  aud: string;
}

export interface VerificationTokenPayload {
  userId: string;
  email: string;
  type: 'email_verification' | 'password_reset';
  iat: number;
  exp: number;
}

/**
 * Session Types
 */
export interface UserSession {
  id: string;
  userId: string;
  device?: DeviceInfo;
  location?: LocationInfo;
  ipAddress: string;
  userAgent: string;
  isActive: boolean;
  lastActivity: Date;
  createdAt: Date;
  expiresAt: Date;
}

export interface DeviceInfo {
  type: 'desktop' | 'mobile' | 'tablet';
  os: string;
  browser: string;
  version: string;
}

export interface LocationInfo {
  country?: string;
  region?: string;
  city?: string;
  timezone?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

/**
 * Authentication Events
 */
export interface AuthEvent {
  id: string;
  userId: string;
  type: AuthEventType;
  details: AuthEventDetails;
  ipAddress: string;
  userAgent: string;
  location?: LocationInfo;
  timestamp: Date;
}

export type AuthEventType = 
  | 'login_success'
  | 'login_failed'
  | 'logout'
  | 'password_changed'
  | 'password_reset_requested'
  | 'password_reset_completed'
  | 'email_verified'
  | 'account_locked'
  | 'account_unlocked'
  | 'suspicious_activity'
  | 'token_refreshed'
  | 'session_expired';

export interface AuthEventDetails {
  reason?: string;
  failureCount?: number;
  sessionId?: string;
  deviceInfo?: DeviceInfo;
  metadata?: Record<string, any>;
}

/**
 * Account Security Types
 */
export interface SecuritySettings {
  twoFactorEnabled: boolean;
  twoFactorMethod?: 'sms' | 'email' | 'app';
  backupCodes?: string[];
  trustedDevices?: TrustedDevice[];
  loginNotifications: boolean;
  passwordLastChanged: Date;
  accountLockout?: AccountLockout;
}

export interface TrustedDevice {
  id: string;
  name: string;
  deviceInfo: DeviceInfo;
  addedAt: Date;
  lastUsed: Date;
  isActive: boolean;
}

export interface AccountLockout {
  isLocked: boolean;
  reason?: string;
  lockedAt?: Date;
  unlockAt?: Date;
  failedAttempts: number;
  maxAttempts: number;
}

/**
 * Two-Factor Authentication Types
 */
export interface TwoFactorSetupDTO {
  method: 'sms' | 'email' | 'app';
  phoneNumber?: string;
}

export interface TwoFactorVerifyDTO {
  code: string;
  method: 'sms' | 'email' | 'app';
  backupCode?: boolean;
}

export interface TwoFactorSetupResponseDTO {
  secret?: string;
  qrCode?: string;
  backupCodes?: string[];
}

/**
 * OAuth Types
 */
export interface OAuthProvider {
  id: string;
  name: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scope: string[];
  authUrl: string;
  tokenUrl: string;
  userInfoUrl: string;
}

export interface OAuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
  tokenType: string;
  scope?: string;
}

export interface OAuthUserInfo {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  provider: string;
  providerUserId: string;
}

export interface SocialLoginRequestDTO {
  provider: 'google' | 'facebook' | 'github' | 'twitter';
  code?: string;
  accessToken?: string;
}

/**
 * Password Policy Types
 */
export interface PasswordPolicy {
  minLength: number;
  maxLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  preventReuse: number;
  maxAge: number; // days
  warningDays: number;
}

export interface PasswordStrength {
  score: number; // 0-4
  feedback: string[];
  suggestions: string[];
  estimatedCrackTime: string;
}

/**
 * Rate Limiting Types
 */
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: Date;
  retryAfter?: number;
}

export interface RateLimitConfig {
  windowMs: number;
  max: number;
  message: string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (req: any) => string;
}

/**
 * Audit Log Types
 */
export interface AuditLog {
  id: string;
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  success: boolean;
  error?: string;
}

/**
 * Permission Types
 */
export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
}

export interface Role {
  id: string;
  name: UserRole;
  description: string;
  permissions: Permission[];
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPermissions {
  role: UserRole;
  permissions: string[];
  grants: ResourceGrant[];
}

export interface ResourceGrant {
  resource: string;
  actions: string[];
  conditions?: Record<string, any>;
}
