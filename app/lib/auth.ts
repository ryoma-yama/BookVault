/**
 * Cloudflare Access によって署名済み・検証済みの JWT から email を抽出する。
 * アプリ側では署名検証は行わない。
 */
export function extractEmailFromJwt(jwt: string): string {
  const [, payloadBase64] = jwt.split(".");
  if (!payloadBase64) throw new Error("Invalid JWT format");

  const payloadJson = atob(payloadBase64);
  const payload = JSON.parse(payloadJson);

  if (typeof payload.email !== "string") {
    throw new Error("JWT does not contain a valid email");
  }

  return payload.email;
}
