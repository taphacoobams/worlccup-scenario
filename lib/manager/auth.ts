import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

export const MANAGER_COOKIE = "manager_session";
export const MANAGER_SESSION_MAX_AGE = 60 * 60 * 24; // 24h

function getSecret(): string | null {
  const secret = process.env.MANAGER_SECRET?.trim();
  return secret || null;
}

async function hmacHex(payload: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function isManagerConfigured(): boolean {
  return Boolean(getSecret());
}

export async function createManagerSessionToken(): Promise<string | null> {
  const secret = getSecret();
  if (!secret) return null;
  const expires = String(Date.now() + MANAGER_SESSION_MAX_AGE * 1000);
  const sig = await hmacHex(expires, secret);
  return `${expires}.${sig}`;
}

export async function verifyManagerSessionToken(
  token: string | undefined | null
): Promise<boolean> {
  if (!token) return false;
  const secret = getSecret();
  if (!secret) return false;
  const dot = token.lastIndexOf(".");
  if (dot === -1) return false;
  const expires = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const exp = Number(expires);
  if (!Number.isFinite(exp) || Date.now() > exp) return false;
  const expected = await hmacHex(expires, secret);
  return sig === expected;
}

export async function verifyManagerPassword(password: string): Promise<boolean> {
  const secret = getSecret();
  if (!secret) return false;
  return password === secret;
}

export async function getManagerSessionFromCookies(): Promise<boolean> {
  const jar = await cookies();
  return verifyManagerSessionToken(jar.get(MANAGER_COOKIE)?.value);
}

export async function isManagerRequestAuthorized(
  req: NextRequest
): Promise<boolean> {
  const cookie = req.cookies.get(MANAGER_COOKIE)?.value;
  if (await verifyManagerSessionToken(cookie)) return true;
  const header = req.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return false;
  const secret = getSecret();
  return Boolean(secret && header.slice(7) === secret);
}

export function managerCookieOptions(token: string) {
  return {
    name: MANAGER_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: MANAGER_SESSION_MAX_AGE,
    path: "/",
  };
}
