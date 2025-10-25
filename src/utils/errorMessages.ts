// src/utils/errorMessages.ts

/**
 * Convert technical errors into user-friendly messages
 */
export function getUserFriendlyErrorMessage(error: any): string {
  const errorMessage = error?.message || String(error);
  const errorString = errorMessage.toLowerCase();

  // Network errors
  if (errorString.includes('network') || errorString.includes('fetch failed')) {
    return 'Check your internet connection and try again';
  }

  if (errorString.includes('offline') || errorString.includes('not connected')) {
    return 'You appear to be offline. Please connect to the internet';
  }

  // Auth errors
  if (errorString.includes('not signed in') || errorString.includes('no signed-in account')) {
    return 'Please sign in to OneDrive to sync your data';
  }

  if (errorString.includes('auth') || errorString.includes('unauthorized') || errorString.includes('401')) {
    return 'Your OneDrive session expired. Please sign in again';
  }

  if (errorString.includes('forbidden') || errorString.includes('403')) {
    return 'Permission denied. Check your OneDrive app permissions';
  }

  // Conflict errors
  if (errorString.includes('conflict')) {
    return 'Data changed on another device. Please resolve the conflict';
  }

  // Storage errors
  if (errorString.includes('quota') || errorString.includes('storage') || errorString.includes('space')) {
    return 'OneDrive is out of storage space. Free up space and try again';
  }

  if (errorString.includes('404') || errorString.includes('not found')) {
    return 'Data not found on OneDrive. It may have been deleted';
  }

  // Encryption errors
  if (errorString.includes('decrypt') || errorString.includes('incorrect password')) {
    return 'Unable to decrypt data. Check your password';
  }

  if (errorString.includes('encrypt')) {
    return 'Failed to encrypt data. Please try again';
  }

  if (errorString.includes('salt not found')) {
    return 'Encryption key missing. Try recovering your account';
  }

  // Database errors
  if (errorString.includes('indexeddb') || errorString.includes('database')) {
    return 'Local storage error. Try clearing your browser cache';
  }

  // Timeout errors
  if (errorString.includes('timeout') || errorString.includes('timed out')) {
    return 'Request timed out. Check your connection and try again';
  }

  // Server errors
  if (errorString.includes('500') || errorString.includes('502') || errorString.includes('503')) {
    return 'OneDrive service temporarily unavailable. Try again later';
  }

  // Rate limiting
  if (errorString.includes('429') || errorString.includes('rate limit')) {
    return 'Too many requests. Please wait a moment and try again';
  }

  // Generic sync errors
  if (errorString.includes('sync')) {
    return 'Sync failed. Check your connection and try again';
  }

  if (errorString.includes('upload')) {
    return 'Upload failed. Check your connection and try again';
  }

  if (errorString.includes('download')) {
    return 'Download failed. Check your connection and try again';
  }

  // Default: return original message but cleaned up
  return errorMessage.replace(/^Error:\s*/i, '');
}

/**
 * Get actionable suggestion based on error type
 */
export function getErrorAction(error: any): { label: string; action: string } | null {
  const errorMessage = error?.message || String(error);
  const errorString = errorMessage.toLowerCase();

  if (errorString.includes('network') || errorString.includes('offline')) {
    return {
      label: 'Check Connection',
      action: 'check-connection',
    };
  }

  if (errorString.includes('not signed in') || errorString.includes('auth')) {
    return {
      label: 'Sign In',
      action: 'sign-in',
    };
  }

  if (errorString.includes('conflict')) {
    return {
      label: 'Resolve Conflict',
      action: 'resolve-conflict',
    };
  }

  if (errorString.includes('quota') || errorString.includes('storage')) {
    return {
      label: 'Manage Storage',
      action: 'manage-storage',
    };
  }

  if (errorString.includes('salt not found')) {
    return {
      label: 'Recover Account',
      action: 'recover-account',
    };
  }

  // Default retry action
  return {
    label: 'Retry',
    action: 'retry',
  };
}
