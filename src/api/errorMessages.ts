import { ApiError } from './client';

export function friendlyMessage(err: unknown): string {
  if (!(err instanceof ApiError)) {
    return 'An unexpected error occurred.';
  }
  
  switch (err.code) {
    case 'VALIDATION_ERROR':
      return "Please check the units and your name, then try again.";
    case 'ZERO_VALUE_PERCENTAGE':
      return "This ETF's value is 0, so a percentage change would still be 0. Set an absolute value first, then percentage changes will work.";
    case 'UNSUPPORTED_IMAGE_TYPE':
      return "That file type isn't supported. Please use a JPEG, PNG, or WEBP photo.";
    case 'FILE_TOO_LARGE':
      return "That photo is too large. Please use one under 5 MB.";
    case 'ETF_NOT_FOUND':
      return "That ETF is no longer available. Please pick another.";
    case 'UNAUTHORIZED':
      return "Your session has expired. Please sign in again.";
    case 'AUTH_FAILED':
      return "Incorrect username or password.";
    case 'REQUEST_NOT_FOUND':
      return "That request is no longer available.";
    case 'NETWORK_ERROR':
      return "We couldn't reach the market. Check your connection and try again.";
    default:
      return "An unexpected error occurred.";
  }
}
