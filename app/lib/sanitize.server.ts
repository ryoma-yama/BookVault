// ~/lib/sanitize.server.ts
import createDOMPurify from "dompurify";
import { JSDOM } from "jsdom";

/**
 * 任意のHTML文字列をサニタイズし、安全なHTMLとして返す。
 * scriptタグや危険な属性（onloadなど）を除去する。
 *
 * Node.js環境で実行することを前提とし、DOMPurify + jsdom を使用。
 *
 * @param rawHtml - サニタイズ対象のHTML文字列
 * @returns サニタイズ済みのHTML文字列（XSSリスクのない内容）
 *
 * @example
 * const safe = sanitizeHtml('<script>alert(\"x\")</script><p>Hello</p>');
 */
export function sanitizeHtml(rawHtml: string): string {
  const window = new JSDOM("").window;
  const DOMPurify = createDOMPurify(window);
  return DOMPurify.sanitize(rawHtml, { USE_PROFILES: { html: true } });
}
