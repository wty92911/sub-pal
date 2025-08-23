import { AxiosError } from 'axios';
import { ApiError } from '@/types/api.types';

/**
 * Enhanced error handler that extracts user-friendly messages from API errors
 */
export class ErrorHandler {
  /**
   * Extract a standardized error from an Axios error
   */
  static extractError(error: AxiosError | Error | unknown): ApiError {
    // Handle AxiosError specifically
    if (this.isAxiosError(error)) {
      const axiosError = error as AxiosError;

      // Check if the response has the new error format
      if (axiosError.response?.data && typeof axiosError.response.data === 'object') {
        const responseData = axiosError.response.data as any;

        // New enhanced error format from backend
        if (responseData.error && typeof responseData.error === 'object') {
          const apiError = responseData.error;

          return {
            message: apiError.message || 'An error occurred',
            user_message: apiError.user_message || 'Something went wrong. Please try again.',
            code: apiError.code || 'UNKNOWN_ERROR',
            category: this.mapCategory(apiError.category),
            details: apiError.details,
            suggestions: apiError.suggestions || [],
          };
        }

        // Legacy error format (fallback)
        if (responseData.message || responseData.error) {
          const message = responseData.message || responseData.error;
          return this.createFallbackError(message, axiosError.response.status);
        }
      }

      // Fallback based on status code
      return this.createStatusBasedError(axiosError.response?.status || 500);
    }

    // Handle generic Error objects
    if (error instanceof Error) {
      return this.createFallbackError(error.message, undefined);
    }

    // Handle unknown errors
    return this.createFallbackError('An unexpected error occurred', undefined);
  }

  /**
   * Create a user-friendly error message for display
   */
  static getUserMessage(error: AxiosError | Error | unknown): string {
    const apiError = this.extractError(error);
    return apiError.user_message;
  }

  /**
   * Create suggestions array based on error type
   */
  static getSuggestions(error: AxiosError | Error | unknown): string[] {
    const apiError = this.extractError(error);
    return apiError.suggestions;
  }

  /**
   * Check if error is an Axios error
   */
  private static isAxiosError(error: unknown): boolean {
    return error != null &&
           typeof error === 'object' &&
           'isAxiosError' in error &&
           (error as any).isAxiosError === true;
  }

  /**
   * Map backend error categories to frontend categories
   */
  private static mapCategory(backendCategory: string): ApiError['category'] {
    const categoryMap: Record<string, ApiError['category']> = {
      auth: 'auth',
      validation: 'validation',
      not_found: 'not_found',
      conflict: 'conflict',
      server: 'server',
      network: 'network',
    };

    return categoryMap[backendCategory] || 'server';
  }

  /**
   * Create a fallback error with user-friendly messages
   */
  private static createFallbackError(message: string, statusCode?: number): ApiError {
    // Default values
    let userMessage = 'Something went wrong. Please try again.';
    let category: ApiError['category'] = 'server';
    let code = 'UNKNOWN_ERROR';
    let suggestions: string[] = [];

    // Customize based on status code if available
    if (statusCode) {
      switch (statusCode) {
        case 401:
          category = 'auth';
          code = 'AUTH_UNAUTHORIZED';
          userMessage = 'Please log in to access this resource.';
          suggestions = [
            'Check your credentials and try logging in again.',
            'If you just logged in, please wait a moment and try again.',
          ];
          break;

        case 403:
          category = 'auth';
          code = 'AUTH_FORBIDDEN';
          userMessage = 'You don\'t have permission to perform this action.';
          suggestions = [
            'Contact support if you believe you should have access.',
            'Try refreshing the page and logging in again.',
          ];
          break;

        case 404:
          category = 'not_found';
          code = 'RESOURCE_NOT_FOUND';
          userMessage = 'The requested resource could not be found.';
          suggestions = [
            'Check the URL and try again.',
            'The resource may have been moved or deleted.',
          ];
          break;

        case 409:
          category = 'conflict';
          code = 'RESOURCE_CONFLICT';
          userMessage = 'This action conflicts with existing data.';
          suggestions = [
            'Choose a different name or value.',
            'Check for existing records that might conflict.',
          ];
          break;

        case 422:
          category = 'validation';
          code = 'VALIDATION_FAILED';
          userMessage = 'Please check your input and try again.';
          suggestions = [
            'Make sure all required fields are filled out.',
            'Check that your input follows the expected format.',
          ];
          break;

        case 429:
          category = 'server';
          code = 'RATE_LIMITED';
          userMessage = 'Too many requests. Please wait and try again.';
          suggestions = [
            'Wait a few moments before trying again.',
            'Avoid rapid repeated requests.',
          ];
          break;

        case 500:
        case 502:
        case 503:
        case 504:
          category = 'server';
          code = 'SERVER_ERROR';
          userMessage = 'Server error. Please try again later.';
          suggestions = [
            'Wait a few minutes and try again.',
            'If the problem persists, contact support.',
          ];
          break;

        default:
          // Keep defaults
          break;
      }
    }

    // Override with message-based detection if no status code
    if (!statusCode) {
      const lowerMessage = message.toLowerCase();

      if (lowerMessage.includes('network') || lowerMessage.includes('connection')) {
        category = 'network';
        code = 'NETWORK_ERROR';
        userMessage = 'Unable to connect to the server. Please check your internet connection.';
        suggestions = [
          'Check your internet connection.',
          'Try refreshing the page.',
          'Contact support if the problem persists.',
        ];
      } else if (lowerMessage.includes('timeout')) {
        category = 'network';
        code = 'REQUEST_TIMEOUT';
        userMessage = 'Request timed out. Please try again.';
        suggestions = [
          'Check your internet connection speed.',
          'Try again in a few moments.',
        ];
      }
    }

    return {
      message,
      user_message: userMessage,
      code,
      category,
      details: undefined,
      suggestions,
    };
  }

  /**
   * Create error based on status code only
   */
  private static createStatusBasedError(statusCode: number): ApiError {
    return this.createFallbackError(`HTTP ${statusCode} error`, statusCode);
  }
}

/**
 * Convenience function to extract user message from error
 */
export const getUserErrorMessage = (error: unknown): string => {
  return ErrorHandler.getUserMessage(error as AxiosError | Error);
};

/**
 * Convenience function to extract full error details
 */
export const getErrorDetails = (error: unknown): ApiError => {
  return ErrorHandler.extractError(error as AxiosError | Error);
};
