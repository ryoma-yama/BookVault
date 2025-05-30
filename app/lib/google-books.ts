// ~/lib/google-books.ts
import { z } from "zod";

const GOOGLE_BOOKS_API_BASE = "https://www.googleapis.com/books/v1/volumes";

const searchResponseSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.string(),
      }),
    )
    .nonempty(),
});

const volumeResponseSchema = z.object({
  id: z.string(),
  volumeInfo: z.object({
    title: z.string(),
    authors: z.array(z.string()).optional(),
    publisher: z.string().optional(),
    publishedDate: z.string().optional(),
    description: z.string().optional(),
    industryIdentifiers: z
      .array(
        z.object({
          type: z.string(),
          identifier: z.string(),
        }),
      )
      .optional(),
  }),
});

/**
 * ISBNからGoogle Books APIを2段階で呼び出し、書籍情報を取得する。
 */
export async function fetchBookInfoByISBN(
  isbn: string,
  apiKey: string,
): Promise<{
  googleId: string;
  isbn13?: string;
  title: string;
  authors?: string[];
  publisher?: string;
  publishedDate?: string;
  description?: string;
} | null> {
  const useApiKey = apiKey && apiKey !== "your-google-books-api-key";
  const searchUrl = new URL(GOOGLE_BOOKS_API_BASE);
  searchUrl.searchParams.set("q", `isbn:${isbn}`);
  if (useApiKey) searchUrl.searchParams.set("key", apiKey);

  const searchRes = await fetch(searchUrl.toString());
  if (!searchRes.ok)
    throw new Error(`Google Books ISBN検索に失敗: ${searchRes.status}`);

  const searchJson = await searchRes.json();
  const searchParsed = searchResponseSchema.safeParse(searchJson);
  if (!searchParsed.success) return null;

  const googleId = searchParsed.data.items[0].id;

  const volumeUrl = `${GOOGLE_BOOKS_API_BASE}/${googleId}`;
  const volumeRes = await fetch(volumeUrl);
  if (!volumeRes.ok)
    throw new Error(`Google Books 詳細取得に失敗: ${volumeRes.status}`);

  const volumeJson = await volumeRes.json();
  const volumeParsed = volumeResponseSchema.safeParse(volumeJson);
  if (!volumeParsed.success) return null;

  const info = volumeParsed.data.volumeInfo;
  const isbn13 = info.industryIdentifiers?.find(
    (id) => id.type === "ISBN_13",
  )?.identifier;

  return {
    googleId,
    isbn13,
    title: info.title,
    authors: info.authors ?? [],
    publisher: info.publisher,
    publishedDate: info.publishedDate,
    description: info.description,
  };
}

/**
 * Google Books のボリュームIDから表紙画像のURLを生成する。
 *
 * @param googleId - Google Books API のボリュームID（volume ID）
 * @returns 表紙画像（front cover）の URL。zoom=1 の中サイズ画像を返す。
 */
export function getGoogleBooksCoverUrl(googleId: string | null): string {
  return `https://books.google.com/books/content?id=${googleId}&printsec=frontcover&img=1&zoom=1&source=gbs_api`;
}
