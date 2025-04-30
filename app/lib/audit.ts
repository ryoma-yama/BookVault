import type { DrizzleD1Database } from "drizzle-orm/d1";
import { z } from "zod";
import { auditLogs } from "~/db/schema";

const auditLogDetailSchema = z.object({
  entity: z.string(),
  action: z.enum(["create", "update", "delete"]),
  targetId: z.number().optional(),
  data: z.record(z.unknown()).optional(),
  changes: z
    .object({
      before: z.record(z.unknown()),
      after: z.record(z.unknown()),
    })
    .optional(),
});

/**
 * 構造化された監査ログを D1 に書き込む共通関数。
 * `audit_logs.detail` の構造バリデーションと JSON.stringify を内包。
 *
 * @param db - drizzle 経由で取得した D1 インスタンス
 * @param userId - 操作を行ったユーザーの ID
 * @param actionType - 操作の分類（DBの action_type カラムに記録）
 * @param detail - 監査対象の詳細（構造化オブジェクト）
 *
 * @throws Error - detail がスキーマに合致しない場合
 */
export async function writeAuditLog(params: {
  db: DrizzleD1Database;
  userId: number;
  actionType: string;
  detail: unknown;
}) {
  const result = auditLogDetailSchema.safeParse(params.detail);

  if (!result.success) {
    console.error("Invalid audit log detail", result.error.flatten());
    throw new Error("Invalid audit log detail structure");
  }

  await params.db.insert(auditLogs).values({
    userId: params.userId,
    actionType: params.actionType,
    detail: JSON.stringify(result.data),
    createdAt: new Date().toISOString(),
  });
}
