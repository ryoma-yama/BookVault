import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { users } from "~/db/schema";

/**
 * JWTまたは環境変数からemailを取得する関数。
 * ローカル開発環境では環境変数 DEV_AUTH_EMAIL を使用します。
 *
 * @param request - 現在のHTTPリクエスト
 * @param env - Cloudflare Pages Functionsの環境変数
 * @returns 認証されたユーザーのemail文字列
 * @throws {Response} 401 - JWTが存在しない場合
 * @throws {Error} JWT形式が不正、またはemailが含まれていない場合
 */
export function getAuthenticatedEmail(request: Request, env: Env): string {
  const jwt = request.headers.get("cf-access-jwt-assertion");

  if (!jwt && env.DEV_AUTH_EMAIL) return env.DEV_AUTH_EMAIL;
  if (!jwt) throw new Response("Unauthorized", { status: 401 });

  const [, payloadBase64] = jwt.split(".");
  if (!payloadBase64) throw new Error("Invalid JWT format");

  const payloadJson = atob(payloadBase64);
  const payload = JSON.parse(payloadJson);

  if (typeof payload.email !== "string") {
    throw new Error("JWT does not contain a valid email");
  }

  return payload.email;
}

/**
 * 認証済みユーザーを取得する関数。
 * ユーザーが存在しない場合は401エラーを返します。
 *
 * @param request - 現在のHTTPリクエスト
 * @param context - RemixのLoaderFunctionArgsのcontext
 * @returns データベース接続インスタンスとユーザー情報
 * @throws {Response} 401 - 認証されていない場合
 */
export async function requireAuthenticatedUser(
  request: Request,
  context: LoaderFunctionArgs["context"],
) {
  const email = getAuthenticatedEmail(request, context.cloudflare.env);
  const db = drizzle(context.cloudflare.env.DB);

  const user = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .get();

  if (!user) {
    throw new Response("Unauthorized", { status: 401 });
  }

  return { db, user };
}

/**
 * 管理者権限を持つユーザーであることを確認する関数。
 * 一般ユーザーだった場合は403エラーを返します。
 *
 * @param request - 現在のHTTPリクエスト
 * @param context - RemixのLoaderFunctionArgsのcontext
 * @returns データベース接続インスタンスとユーザー情報
 * @throws {Response} 401 - 認証されていない場合
 * @throws {Response} 403 - 管理者権限がない場合
 */
export async function requireAdminUser(
  request: Request,
  context: LoaderFunctionArgs["context"],
) {
  const { db, user } = await requireAuthenticatedUser(request, context);

  if (user.role !== "admin") {
    throw new Response("Forbidden", { status: 403 });
  }

  return { db, user };
}
