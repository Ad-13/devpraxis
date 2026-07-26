import { createHash, randomBytes } from 'node:crypto';

import bcrypt from 'bcrypt';
import { SignJWT } from 'jose';

import { env } from '#config/env';
import { ApiError } from '#utils/ApiError';
import { RefreshTokenModel } from '#modules/auth/refreshToken.model';
import { UserModel } from '#modules/users/user.model';

import { isDuplicateKey } from '#utils/mongo';
import type { RegisterDto, LoginDto } from '@devpraxis/shared';

const BCRYPT_COST = 12;
const MAX_SESSIONS_PER_USER = 5;
const accessSecret = new TextEncoder().encode(env.JWT_ACCESS_SECRET);

/* helpers */
async function signAccessToken(userId: string): Promise<string> {
  return new SignJWT({})
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(`${env.ACCESS_TOKEN_TTL_MIN}m`)
    .sign(accessSecret);
}

function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

async function issueRefreshToken(userId: string): Promise<string> {
  const raw = randomBytes(48).toString('base64url');

  await RefreshTokenModel.create({
    userId,
    tokenHash: sha256(raw),
    expiresAt: new Date(Date.now() + env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000),
  });

  const excess = await RefreshTokenModel.find({ userId })
    .sort({ createdAt: -1 })
    .skip(MAX_SESSIONS_PER_USER)
    .select('_id')
    .lean();

  if (excess.length > 0) {
    await RefreshTokenModel.deleteMany({ _id: { $in: excess.map((t) => t._id) } });
  }

  return raw;
}

async function issueTokenPair(userId: string) {
  const [accessToken, refreshToken] = await Promise.all([
    signAccessToken(userId),
    issueRefreshToken(userId),
  ]);
  return { accessToken, refreshToken };
}

/* public API */
export async function register(dto: RegisterDto) {
  const passwordHash = await bcrypt.hash(dto.password, BCRYPT_COST);

  try {
    const user = await UserModel.create({
      name: dto.name,
      email: dto.email,
      passwordHash,
    });
    const tokens = await issueTokenPair(user.id);
    return { user, ...tokens };
  } catch (err) {
    if (isDuplicateKey(err)) {
      throw ApiError.conflict('Email is already registered');
    }
    throw err;
  }
}

export async function login(dto: LoginDto) {
  const user = await UserModel.findOne({ email: dto.email }).select('+passwordHash');
  const isPasswordValid = user && await bcrypt.compare(dto.password, user.passwordHash);

  if (!user || !isPasswordValid) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const tokens = await issueTokenPair(user.id);
  return { user, ...tokens };
}

export async function refresh(rawToken: string) {
  const stored = await RefreshTokenModel.findOneAndDelete({ tokenHash: sha256(rawToken) });

  if (!stored || stored.expiresAt.getTime() < Date.now()) {
    throw ApiError.unauthorized('Invalid or expired refresh token');
  }

  return issueTokenPair(String(stored.userId));
}

export async function logout(rawToken: string | undefined): Promise<void> {
  if (rawToken) {
    await RefreshTokenModel.deleteOne({ tokenHash: sha256(rawToken) });
  }
}
