// ~/lib/markdown-to-html.server.ts
import { marked } from "marked";

/**
 * Markdown文字列をHTML文字列に変換する。
 *
 * この関数は、入力が信頼できるものであることを前提とする。
 *
 * @param markdown - Markdown形式の文字列
 * @returns HTML形式の文字列（非同期）
 */
export async function renderMarkdownToHtml(markdown: string): Promise<string> {
  return marked.parse(markdown);
}
