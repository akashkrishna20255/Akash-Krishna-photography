// Security & Cryptographic Utilities for Akash Krishna Portfolio

const SALT = 'akash_portfolio_secure_salt_2026_x9z';
const AI_STUDIO_REGISTERED_EMAIL = 'akashkrishna67@gmail.com';

// SHA-256 Hash using browser Web Crypto API
export async function sha256(message: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function hashAdminKey(rawKey: string): Promise<string> {
  const normalized = rawKey.trim().toLowerCase();
  return sha256(`${SALT}:${normalized}`);
}

export async function verifyAdminKey(inputKey: string, storedHash: string): Promise<boolean> {
  const normalized = inputKey.trim().toLowerCase();
  // Check exact match with normalized spacing
  const hash1 = await sha256(`${SALT}:${normalized}`);
  if (hash1 === storedHash) return true;

  // Also support with/without space for "akash 1298" vs "akash1298"
  const noSpace = normalized.replace(/\s+/g, '');
  const hash2 = await sha256(`${SALT}:${noSpace}`);
  if (hash2 === storedHash) return true;

  const withSpace = normalized.includes(' ') ? normalized : normalized.replace('akash', 'akash ');
  const hash3 = await sha256(`${SALT}:${withSpace}`);
  return hash3 === storedHash;
}

// Generate Cryptographically Secure Session Token
export function generateSecureToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

// Generate 6-digit OTP for Email Reset
export function generateSecureOTP(): string {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  // 6-digit number between 100000 and 999999
  const otp = 100000 + (array[0] % 900000);
  return otp.toString();
}

export const SECURITY_CONFIG = {
  REGISTERED_EMAIL: AI_STUDIO_REGISTERED_EMAIL,
  MAX_FAILED_ATTEMPTS: 5,
  LOCKOUT_DURATION_MS: 5 * 60 * 1000, // 5 minutes lockout
  INITIAL_ADMIN_KEY: 'akash 1298',
  SESSION_TIMEOUT_MS: 3 * 60 * 60 * 1000 // 3 hours session validity
};
