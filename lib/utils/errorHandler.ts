/**
 * Centralized error handling utilities for consistent error management
 */

export interface ErrorResult {
  success: boolean;
  error?: string;
  data?: any;
  partialSuccess?: boolean;
  details?: Record<string, any>;
}

/**
 * Creates a success result
 */
export function successResult(data?: any): ErrorResult {
  return {
    success: true,
    data
  };
}

/**
 * Creates an error result
 */
export function errorResult(error: string, details?: Record<string, any>): ErrorResult {
  return {
    success: false,
    error,
    details
  };
}

/**
 * Creates a partial success result
 */
export function partialSuccessResult(data: any, error: string, details?: Record<string, any>): ErrorResult {
  return {
    success: false,
    partialSuccess: true,
    error,
    data,
    details
  };
}

/**
 * Wraps an async function with error handling
 */
export async function withErrorHandling<T>(
  fn: () => Promise<T>,
  context: string
): Promise<ErrorResult> {
  try {
    const result = await fn();
    return successResult(result);
  } catch (error) {
    console.error(`Error in ${context}:`, error);
    return errorResult(
      error instanceof Error ? error.message : 'An unknown error occurred',
      { context, originalError: error }
    );
  }
}

/**
 * Wraps an async function with partial success handling
 */
export async function withPartialSuccessHandling<T>(
  fn: () => Promise<T>,
  context: string,
  cleanupFn?: () => Promise<void>
): Promise<ErrorResult> {
  try {
    const result = await fn();
    return successResult(result);
  } catch (error) {
    console.error(`Error in ${context}:`, error);
    
    // Attempt cleanup if provided
    if (cleanupFn) {
      try {
        await cleanupFn();
      } catch (cleanupError) {
        console.error(`Cleanup failed in ${context}:`, cleanupError);
        return partialSuccessResult(
          null,
          error instanceof Error ? error.message : 'An unknown error occurred',
          { 
            context, 
            originalError: error,
            cleanupError: cleanupError instanceof Error ? cleanupError.message : 'Cleanup failed'
          }
        );
      }
    }
    
    return errorResult(
      error instanceof Error ? error.message : 'An unknown error occurred',
      { context, originalError: error }
    );
  }
}

/**
 * Parses different error types and returns user-friendly messages
 */
export function getUserFriendlyErrorMessage(error: unknown): string {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error instanceof Error) {
    // Common error patterns
    if (error.message.includes('Insufficient stock')) {
      return 'Not enough items in stock to complete this operation';
    }
    if (error.message.includes('concurrent')) {
      return 'This item was just updated by another user. Please try again';
    }
    if (error.message.includes('network') || error.message.includes('fetch')) {
      return 'Network error. Please check your connection and try again';
    }
    if (error.message.includes('timeout')) {
      return 'Operation timed out. Please try again';
    }
    if (error.message.includes('permission') || error.message.includes('unauthorized')) {
      return 'You do not have permission to perform this action';
    }
    
    return error.message;
  }
  
  return 'An unexpected error occurred. Please try again';
}

/**
 * Validates if an error is retryable
 */
export function isRetryableError(error: unknown): boolean {
  if (typeof error === 'string') {
    return error.includes('concurrent') || 
           error.includes('timeout') || 
           error.includes('network');
  }
  
  if (error instanceof Error) {
    return error.message.includes('concurrent') || 
           error.message.includes('timeout') || 
           error.message.includes('network') ||
           error.message.includes('fetch');
  }
  
  return false;
}

/**
 * Retry function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: unknown;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries - 1) {
        throw error;
      }
      
      if (!isRetryableError(error)) {
        throw error;
      }
      
      const delay = delayMs * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}