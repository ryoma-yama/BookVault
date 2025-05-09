// ~/lib/html-to-markdown.server.ts
import TurndownService from "turndown";

/**
 * 任意のHTML文字列をMarkdownに変換し、
 * scriptやiframeなどの危険なタグは除去したうえで返す。
 *
 * @param rawHtml - HTMLとして取得された文字列
 * @returns Markdown形式の文字列（危険な要素は除去済み）
 */
export function convertHtmlToMarkdown(rawHtml: string): string {
  const turndownService = new TurndownService({
    headingStyle: "atx",
    bulletListMarker: "-",
    codeBlockStyle: "fenced",
  });

  // 危険なタグは内容ごと完全除去
  turndownService.remove(["script", "iframe", "object", "embed", "style"]);

  return turndownService.turndown(rawHtml);
}
