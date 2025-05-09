// ~/lib/markdown-to-html.server.ts
import { marked } from "marked";

/**
 * Markdown文字列をHTML文字列に変換する。
 *
 * この関数は、入力が信頼できるものであること（または保存前にサニタイズ済みであること）を前提とする。
 * XSS対策は行わないため、ユーザー入力などに対しては事前処理が必須。
 *
 * @param markdown - Markdown形式の文字列
 * @returns HTML形式の文字列（非同期）
 */
export async function renderMarkdownToHtml(markdown: string): Promise<string> {
  return marked.parse(markdown);
}
