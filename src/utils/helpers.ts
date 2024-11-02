/**
 * Date and Time Helper Utilities
 * Comprehensive date/time manipulation and formatting functions
 */

/**
 * Date format constants
 */
export const DATE_FORMATS = {
  ISO_DATE: 'YYYY-MM-DD',
  ISO_DATETIME: 'YYYY-MM-DDTHH:mm:ss.SSSZ',
  US_DATE: 'MM/DD/YYYY',
  EU_DATE: 'DD/MM/YYYY',
  TIME: 'HH:mm',
  TIME_WITH_SECONDS: 'HH:mm:ss',
  DISPLAY_DATE: 'MMM DD, YYYY',
  DISPLAY_DATETIME: 'MMM DD, YYYY HH:mm',
  FULL_DATE: 'dddd, MMMM DD, YYYY',
  SHORT_DATE: 'MMM DD',
  MONTH_YEAR: 'MMM YYYY',
  YEAR: 'YYYY'
} as const;

/**
 * Time constants in milliseconds
 */
export const TIME_CONSTANTS = {
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60 * 1000,
  MONTH: 30 * 24 * 60 * 60 * 1000,
  YEAR: 365 * 24 * 60 * 60 * 1000
} as const;

/**
 * Date Helper Class
 */
export class DateHelper {
  /**
   * Get current date in ISO format (YYYY-MM-DD)
   */
  static getCurrentDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  /**
   * Get current time in HH:MM format
   */
  static getCurrentTime(): string {
    const now = new Date();
    return now.toTimeString().slice(0, 5);
  }

  /**
   * Get current timestamp
   */
  static getCurrentTimestamp(): number {
    return Date.now();
  }

  /**
   * Format date to specified format
   */
  static formatDate(date: Date | string | number, format: string = DATE_FORMATS.ISO_DATE): string {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const monthShort = monthNames[d.getMonth()].slice(0, 3);
    const monthFull = monthNames[d.getMonth()];

    const dayNames = [
      'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
    ];
    const dayName = dayNames[d.getDay()];

    const replacements: Record<string, string> = {
      'YYYY': year.toString(),
      'MM': month,
      'DD': day,
      'HH': hours,
      'mm': minutes,
      'ss': seconds,
      'MMM': monthShort,
      'MMMM': monthFull,
      'dddd': dayName
    };

    let formatted = format;
    for (const [pattern, replacement] of Object.entries(replacements)) {
      formatted = formatted.replace(new RegExp(pattern, 'g'), replacement);
    }

    return formatted;
  }

  /**
   * Parse date string to Date object
   */
  static parseDate(dateString: string): Date | null {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  }

  /**
   * Check if date is valid
   */
  static isValidDate(date: any): boolean {
    return date instanceof Date && !isNaN(date.getTime());
  }

  /**
   * Check if string is valid date
   */
  static isValidDateString(dateString: string): boolean {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  }

  /**
   * Add time to date
   */
  static addTime(date: Date, amount: number, unit: 'seconds' | 'minutes' | 'hours' | 'days' | 'weeks' | 'months' | 'years'): Date {
    const newDate = new Date(date);
    
    switch (unit) {
      case 'seconds':
        newDate.setSeconds(newDate.getSeconds() + amount);
        break;
      case 'minutes':
        newDate.setMinutes(newDate.getMinutes() + amount);
        break;
      case 'hours':
        newDate.setHours(newDate.getHours() + amount);
        break;
      case 'days':
        newDate.setDate(newDate.getDate() + amount);
        break;
      case 'weeks':
        newDate.setDate(newDate.getDate() + (amount * 7));
        break;
      case 'months':
        newDate.setMonth(newDate.getMonth() + amount);
        break;
      case 'years':
        newDate.setFullYear(newDate.getFullYear() + amount);
        break;
    }
    
    return newDate;
  }

  /**
   * Subtract time from date
   */
  static subtractTime(date: Date, amount: number, unit: 'seconds' | 'minutes' | 'hours' | 'days' | 'weeks' | 'months' | 'years'): Date {
    return DateHelper.addTime(date, -amount, unit);
  }

  /**
   * Get difference between two dates
   */
  static getDifference(date1: Date, date2: Date, unit: 'seconds' | 'minutes' | 'hours' | 'days' = 'days'): number {
    const diffMs = Math.abs(date1.getTime() - date2.getTime());
    
    switch (unit) {
      case 'seconds':
        return Math.floor(diffMs / TIME_CONSTANTS.SECOND);
      case 'minutes':
        return Math.floor(diffMs / TIME_CONSTANTS.MINUTE);
      case 'hours':
        return Math.floor(diffMs / TIME_CONSTANTS.HOUR);
      case 'days':
        return Math.floor(diffMs / TIME_CONSTANTS.DAY);
      default:
        return diffMs;
    }
  }

  /**
   * Check if date is today
   */
  static isToday(date: Date): boolean {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  /**
   * Check if date is yesterday
   */
  static isYesterday(date: Date): boolean {
    const yesterday = DateHelper.subtractTime(new Date(), 1, 'days');
    return date.toDateString() === yesterday.toDateString();
  }

  /**
   * Check if date is in the past
   */
  static isPast(date: Date): boolean {
    return date.getTime() < Date.now();
  }

  /**
   * Check if date is in the future
   */
  static isFuture(date: Date): boolean {
    return date.getTime() > Date.now();
  }

  /**
   * Get start of day
   */
  static startOfDay(date: Date): Date {
    const newDate = new Date(date);
    newDate.setHours(0, 0, 0, 0);
    return newDate;
  }

  /**
   * Get end of day
   */
  static endOfDay(date: Date): Date {
    const newDate = new Date(date);
    newDate.setHours(23, 59, 59, 999);
    return newDate;
  }

  /**
   * Get start of week (Monday)
   */
  static startOfWeek(date: Date): Date {
    const newDate = new Date(date);
    const day = newDate.getDay();
    const diff = newDate.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    newDate.setDate(diff);
    return DateHelper.startOfDay(newDate);
  }

  /**
   * Get end of week (Sunday)
   */
  static endOfWeek(date: Date): Date {
    const startWeek = DateHelper.startOfWeek(date);
    return DateHelper.endOfDay(DateHelper.addTime(startWeek, 6, 'days'));
  }

  /**
   * Get start of month
   */
  static startOfMonth(date: Date): Date {
    const newDate = new Date(date);
    newDate.setDate(1);
    return DateHelper.startOfDay(newDate);
  }

  /**
   * Get end of month
   */
  static endOfMonth(date: Date): Date {
    const newDate = new Date(date);
    newDate.setMonth(newDate.getMonth() + 1, 0);
    return DateHelper.endOfDay(newDate);
  }

  /**
   * Get relative time string (e.g., "2 hours ago", "in 3 days")
   */
  static getRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const isPast = diffMs < 0;
    const absDiffMs = Math.abs(diffMs);

    const seconds = Math.floor(absDiffMs / TIME_CONSTANTS.SECOND);
    const minutes = Math.floor(absDiffMs / TIME_CONSTANTS.MINUTE);
    const hours = Math.floor(absDiffMs / TIME_CONSTANTS.HOUR);
    const days = Math.floor(absDiffMs / TIME_CONSTANTS.DAY);
    const weeks = Math.floor(absDiffMs / TIME_CONSTANTS.WEEK);
    const months = Math.floor(absDiffMs / TIME_CONSTANTS.MONTH);
    const years = Math.floor(absDiffMs / TIME_CONSTANTS.YEAR);

    if (years > 0) {
      return isPast ? `${years} year${years > 1 ? 's' : ''} ago` : `in ${years} year${years > 1 ? 's' : ''}`;
    } else if (months > 0) {
      return isPast ? `${months} month${months > 1 ? 's' : ''} ago` : `in ${months} month${months > 1 ? 's' : ''}`;
    } else if (weeks > 0) {
      return isPast ? `${weeks} week${weeks > 1 ? 's' : ''} ago` : `in ${weeks} week${weeks > 1 ? 's' : ''}`;
    } else if (days > 0) {
      return isPast ? `${days} day${days > 1 ? 's' : ''} ago` : `in ${days} day${days > 1 ? 's' : ''}`;
    } else if (hours > 0) {
      return isPast ? `${hours} hour${hours > 1 ? 's' : ''} ago` : `in ${hours} hour${hours > 1 ? 's' : ''}`;
    } else if (minutes > 0) {
      return isPast ? `${minutes} minute${minutes > 1 ? 's' : ''} ago` : `in ${minutes} minute${minutes > 1 ? 's' : ''}`;
    } else {
      return isPast ? `${seconds} second${seconds > 1 ? 's' : ''} ago` : `in ${seconds} second${seconds > 1 ? 's' : ''}`;
    }
  }

  /**
   * Get age from birth date
   */
  static getAge(birthDate: Date): number {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  /**
   * Check if year is leap year
   */
  static isLeapYear(year: number): boolean {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  }

  /**
   * Get days in month
   */
  static getDaysInMonth(year: number, month: number): number {
    return new Date(year, month, 0).getDate();
  }

  /**
   * Get timezone offset in minutes
   */
  static getTimezoneOffset(): number {
    return new Date().getTimezoneOffset();
  }

  /**
   * Convert to UTC
   */
  static toUTC(date: Date): Date {
    return new Date(date.getTime() + (date.getTimezoneOffset() * TIME_CONSTANTS.MINUTE));
  }

  /**
   * Convert from UTC
   */
  static fromUTC(date: Date): Date {
    return new Date(date.getTime() - (date.getTimezoneOffset() * TIME_CONSTANTS.MINUTE));
  }
}

/**
 * Time Helper Class
 */
export class TimeHelper {
  /**
   * Format duration in milliseconds to human readable format
   */
  static formatDuration(milliseconds: number): string {
    const seconds = Math.floor(milliseconds / 1000) % 60;
    const minutes = Math.floor(milliseconds / (1000 * 60)) % 60;
    const hours = Math.floor(milliseconds / (1000 * 60 * 60)) % 24;
    const days = Math.floor(milliseconds / (1000 * 60 * 60 * 24));

    const parts: string[] = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (seconds > 0) parts.push(`${seconds}s`);

    return parts.length > 0 ? parts.join(' ') : '0s';
  }

  /**
   * Parse time string (HH:MM or HH:MM:SS) to total minutes
   */
  static parseTimeToMinutes(timeString: string): number {
    const parts = timeString.split(':').map(Number);
    if (parts.length < 2 || parts.length > 3) return 0;
    
    const [hours, minutes, seconds = 0] = parts;
    return (hours * 60) + minutes + (seconds / 60);
  }

  /**
   * Convert minutes to time string (HH:MM)
   */
  static minutesToTimeString(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  /**
   * Get time until specific time today
   */
  static getTimeUntil(targetTime: string): number {
    const now = new Date();
    const target = new Date();
    const [hours, minutes] = targetTime.split(':').map(Number);
    
    target.setHours(hours, minutes, 0, 0);
    
    // If target time has passed today, set for tomorrow
    if (target.getTime() <= now.getTime()) {
      target.setDate(target.getDate() + 1);
    }
    
    return target.getTime() - now.getTime();
  }
}

/**
 * Utility functions for common date operations
 */
export const dateUtils = {
  now: () => new Date(),
  today: () => DateHelper.getCurrentDate(),
  tomorrow: () => DateHelper.formatDate(DateHelper.addTime(new Date(), 1, 'days')),
  yesterday: () => DateHelper.formatDate(DateHelper.subtractTime(new Date(), 1, 'days')),
  isWeekend: (date: Date) => {
    const day = date.getDay();
    return day === 0 || day === 6;
  },
  isWeekday: (date: Date) => !dateUtils.isWeekend(date),
  daysUntilWeekend: (date: Date = new Date()) => {
    const day = date.getDay();
    return day === 0 ? 6 : (6 - day);
  },
  daysUntilMonday: (date: Date = new Date()) => {
    const day = date.getDay();
    return day === 0 ? 1 : (8 - day);
  }
};

/**
 * Date range helper
 */
export interface DateRange {
  start: Date;
  end: Date;
}

export const createDateRange = (start: Date, end: Date): DateRange => ({
  start,
  end
});

export const isDateInRange = (date: Date, range: DateRange): boolean => {
  return date >= range.start && date <= range.end;
};

export const getDateRangeDuration = (range: DateRange): number => {
  return range.end.getTime() - range.start.getTime();
};
