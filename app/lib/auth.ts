/**
 * JWTまたは環境変数からemailを取得する共通関数。
 * ローカル開発では DEV_AUTH_EMAIL を使う。
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
