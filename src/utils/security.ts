/**
 * Security & Anti-Cyber Threat Utility Module
 * National Center for Forensic Medicine - Ministry of Justice
 * 
 * Provides:
 * - Anti-XSS Sanitization & Input Scrubbing
 * - Safe JSON Parsing (Anti-Prototype Pollution)
 * - Rate Limiting & Brute-Force Attack Mitigation
 * - Input Format Validators
 * - Secure Session State Management
 */

/**
 * Sanitizes user input string against Cross-Site Scripting (XSS) and injection attacks.
 * Strips dangerous HTML tags, javascript pseudo-protocols, event handlers, and malicious character sequences.
 */
export function sanitizeInput(input: unknown): string {
  if (typeof input !== 'string') {
    return '';
  }

  return input
    // Remove script tags and contents
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove inline style tags and contents
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    // Remove dangerous HTML tags
    .replace(/<\/?(?:iframe|object|embed|applet|meta|link|base|form|input|button|svg|math)[^>]*>/gi, '')
    // Remove JavaScript event handlers like onclick, onerror, onload, etc.
    .replace(/\bon\w+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi, '')
    // Remove javascript: and data: pseudo protocols
    .replace(/javascript\s*:/gi, '')
    .replace(/data\s*:\s*text\/html/gi, '')
    .replace(/vbscript\s*:/gi, '')
    // Trim leading and trailing whitespace
    .trim();
}

/**
 * Encodes special characters to prevent HTML injection in raw rendered text.
 */
export function escapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Safely parses JSON strings avoiding prototype pollution (__proto__, constructor).
 */
export function safeParseJSON<T>(jsonString: string | null | undefined, fallback: T): T {
  if (!jsonString || typeof jsonString !== 'string') {
    return fallback;
  }
  try {
    const parsed = JSON.parse(jsonString, (key, value) => {
      // Guard against Prototype Pollution
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        return undefined;
      }
      return value;
    });
    return parsed !== null && parsed !== undefined ? (parsed as T) : fallback;
  } catch {
    return fallback;
  }
}

/**
 * Validates Yemeni and international phone numbers (digits, +, -, spaces only; 7 to 20 chars).
 */
export function validatePhoneNumber(phone: string): boolean {
  if (!phone) return false;
  const sanitized = phone.trim();
  const phoneRegex = /^(\+?[0-9\s-]{7,20})$/;
  return phoneRegex.test(sanitized);
}

/**
 * Validates National ID numbers (numbers only, between 6 and 20 digits).
 */
export function validateNationalId(idNumber: string): boolean {
  if (!idNumber) return false;
  const sanitized = idNumber.trim();
  const idRegex = /^[0-9]{6,20}$/;
  return idRegex.test(sanitized);
}

/**
 * Validates complaint / transaction tracking codes (alphanumeric, hyphens, min 4, max 30 chars).
 */
export function validateTrackingCode(code: string): boolean {
  if (!code) return false;
  const sanitized = code.trim();
  const codeRegex = /^[A-Za-z0-9\-_]{4,30}$/;
  return codeRegex.test(sanitized);
}

// ----------------------------------------------------
// BRUTE-FORCE RATE LIMITING DEFENSE
// ----------------------------------------------------
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 60 * 1000; // 60 seconds lockout
const RATE_LIMIT_KEY = 'ncfm_sec_auth_attempts';

interface RateLimitState {
  attempts: number;
  lockoutUntil: number;
}

export function checkLoginRateLimit(): { allowed: boolean; remainingSeconds: number; attemptsLeft: number } {
  const raw = sessionStorage.getItem(RATE_LIMIT_KEY);
  const state: RateLimitState = safeParseJSON(raw, { attempts: 0, lockoutUntil: 0 });
  const now = Date.now();

  if (state.lockoutUntil > now) {
    const remainingSeconds = Math.ceil((state.lockoutUntil - now) / 1000);
    return { allowed: false, remainingSeconds, attemptsLeft: 0 };
  }

  // Lockout expired, reset if lockout was active
  if (state.lockoutUntil > 0 && state.lockoutUntil <= now) {
    resetLoginAttempts();
    return { allowed: true, remainingSeconds: 0, attemptsLeft: MAX_ATTEMPTS };
  }

  const attemptsLeft = Math.max(0, MAX_ATTEMPTS - state.attempts);
  return { allowed: true, remainingSeconds: 0, attemptsLeft };
}

export function recordFailedLogin(): { locked: boolean; remainingSeconds: number; attemptsLeft: number } {
  const raw = sessionStorage.getItem(RATE_LIMIT_KEY);
  const state: RateLimitState = safeParseJSON(raw, { attempts: 0, lockoutUntil: 0 });
  const now = Date.now();

  state.attempts += 1;

  if (state.attempts >= MAX_ATTEMPTS) {
    state.lockoutUntil = now + LOCKOUT_DURATION_MS;
    sessionStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(state));
    return {
      locked: true,
      remainingSeconds: Math.ceil(LOCKOUT_DURATION_MS / 1000),
      attemptsLeft: 0
    };
  }

  sessionStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(state));
  return {
    locked: false,
    remainingSeconds: 0,
    attemptsLeft: MAX_ATTEMPTS - state.attempts
  };
}

export function resetLoginAttempts(): void {
  sessionStorage.removeItem(RATE_LIMIT_KEY);
}

// ----------------------------------------------------
// SECURE SESSION STATE MANAGEMENT
// ----------------------------------------------------
const SESSION_AUTH_KEY = 'ncfm_admin_session_token';
const SESSION_TIMEOUT_MS = 120 * 60 * 1000; // 2 hours auto timeout

interface SessionData {
  authenticated: boolean;
  timestamp: number;
  expiresAt: number;
  token: string;
}

export function createSecureSession(): void {
  const now = Date.now();
  const session: SessionData = {
    authenticated: true,
    timestamp: now,
    expiresAt: now + SESSION_TIMEOUT_MS,
    token: `sec_${Math.random().toString(36).substring(2)}_${now}`
  };
  sessionStorage.setItem(SESSION_AUTH_KEY, JSON.stringify(session));
  resetLoginAttempts();
}

export function isSecureSessionActive(): boolean {
  const raw = sessionStorage.getItem(SESSION_AUTH_KEY);
  if (!raw) return false;
  const session = safeParseJSON<SessionData | null>(raw, null);
  if (!session || !session.authenticated) return false;
  const now = Date.now();
  if (now > session.expiresAt) {
    terminateSecureSession();
    return false;
  }
  return true;
}

export function terminateSecureSession(): void {
  sessionStorage.removeItem(SESSION_AUTH_KEY);
  sessionStorage.removeItem('admin_authenticated');
}
