import crypto from 'crypto';

export interface TokenPayload {
  email: string;
  role: 'ADMIN' | 'EMPLOYEE' | 'CITIZEN';
  name: string;
  employeeId?: string;
  iat: number;
  exp: number;
}

let runtimeEphemeralSecret: string | null = null;

export function getAuthSecret(): string {
  const secret = process.env.AUTOOPS_AUTH_SECRET;
  if (secret && secret.trim().length > 0) {
    if (process.env.NODE_ENV === 'production' && secret.trim().length < 16) {
      console.warn('⚠️ AUTOOPS_AUTH_SECRET is shorter than recommended 16 characters.');
    }
    return secret.trim();
  }

  // Generate a 256-bit cryptographically secure random secret
  // in memory for the current process run. No static hardcoded secret strings in source code.
  if (!runtimeEphemeralSecret) {
    runtimeEphemeralSecret = crypto.randomBytes(32).toString('hex');
  }
  return runtimeEphemeralSecret;
}

export function generateToken(
  payload: { email: string; role: 'ADMIN' | 'EMPLOYEE' | 'CITIZEN'; name: string; employeeId?: string },
  expiresInSeconds = 86400
): string {
  const secret = getAuthSecret();
  const now = Math.floor(Date.now() / 1000);
  const fullPayload: TokenPayload = {
    ...payload,
    iat: now,
    exp: now + expiresInSeconds
  };

  const header = { alg: 'HS256', typ: 'JWT' };
  const base64Header = Buffer.from(JSON.stringify(header)).toString('base64url');
  const base64Payload = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');

  const signatureInput = `${base64Header}.${base64Payload}`;
  const signature = crypto
    .createHmac('sha256', secret)
    .update(signatureInput)
    .digest('base64url');

  return `${base64Header}.${base64Payload}.${signature}`;
}

export function verifyToken(tokenString: string): TokenPayload | null {
  if (!tokenString || typeof tokenString !== 'string') return null;

  const rawToken = tokenString.replace(/^Bearer\s+/i, '').trim();
  const parts = rawToken.split('.');

  if (parts.length !== 3) {
    return null;
  }

  const [headerOrPrefix, base64Payload, signature] = parts;

  try {
    const secret = getAuthSecret();
    let expectedSignature: string;

    if (headerOrPrefix === 'autoops_v1') {
      expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(base64Payload)
        .digest('base64url');
    } else {
      expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(`${headerOrPrefix}.${base64Payload}`)
        .digest('base64url');
    }

    const sigBuf = Buffer.from(signature);
    const expectedBuf = Buffer.from(expectedSignature);

    if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
      return null;
    }

    const payload: TokenPayload = JSON.parse(Buffer.from(base64Payload, 'base64url').toString('utf8'));

    const now = Math.floor(Date.now() / 1000);

    // Enforce iat and exp checks
    if (typeof payload.iat !== 'number' || payload.iat > now + 10) {
      return null; // Issued in the future
    }
    if (typeof payload.exp !== 'number' || now > payload.exp) {
      return null; // Expired
    }
    if (!payload.email || !payload.role) {
      return null; // Invalid payload format
    }

    return payload;
  } catch (err) {
    return null;
  }
}

