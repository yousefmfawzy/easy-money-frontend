import { describe, it, expect } from 'vitest';
import { friendlyMessage } from '../api/errorMessages';
import { ApiError } from '../api/client';

describe('errorMessages', () => {
  it('maps documented codes to friendly sentences without exposing the code', () => {
    const err = new ApiError(400, 'VALIDATION_ERROR', 'Some message', 'details here');
    const msg = friendlyMessage(err);
    expect(msg).toBe("Please check the units and your name, then try again.");
    expect(msg).not.toContain('VALIDATION_ERROR');
    expect(msg).not.toContain('details here');
  });

  it('handles unknown codes with generic fallback without leaking details', () => {
    const err = new ApiError(500, 'INTERNAL_SERVER_ERROR', 'Server crash', 'stacktrace');
    const msg = friendlyMessage(err);
    expect(msg).toBe("An unexpected error occurred.");
    expect(msg).not.toContain('INTERNAL_SERVER_ERROR');
    expect(msg).not.toContain('stacktrace');
  });
  
  it('handles UNAUTHORIZED and AUTH_FAILED differently', () => {
    const unauth = new ApiError(401, 'UNAUTHORIZED', '', null);
    const authFailed = new ApiError(401, 'AUTH_FAILED', '', null);
    expect(friendlyMessage(unauth)).not.toBe(friendlyMessage(authFailed));
    expect(friendlyMessage(unauth)).toBe("Your session has expired. Please sign in again.");
    expect(friendlyMessage(authFailed)).toBe("Incorrect username or password.");
  });
  
  it('handles non-ApiError gracefully', () => {
    const msg = friendlyMessage(new Error("Network failed"));
    expect(msg).toBe("An unexpected error occurred.");
  });
});
