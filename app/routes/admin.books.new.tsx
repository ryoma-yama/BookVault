import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare";
import { Form, useActionData, useFetcher } from "@remix-run/react";
import { eq } from "drizzle-orm";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { books } from "~/db/schema";
import { writeAuditLog } from "~/lib/audit";
import { requireAdminUser } from "~/lib/auth";
import { fetchBookInfoByISBN, getGoogleBooksCoverUrl } from "~/lib/google-books";
import { convertHtmlToMarkdown } from "~/lib/html-to-markdown.server";
import { renderMarkdownToHtml } from "~/lib/markdown-to-html.server";

const insertBookSchema = z.object({
  googleId: z.string(),
  isbn13: z.string().length(13),
  title: z.string(),
  publisher: z.string().optional(),
  publishedDate: z.string().optional(),
  description: z.string().optional(),
});

export const meta: MetaFunction = () => {
  return [{ title: "書籍登録 | BookVault" }];
};

export async function loader({ request, context }: LoaderFunctionArgs) {
  const { db } = await requireAdminUser(request, context);

  const url = new URL(request.url);
  const isbn = url.searchParams.get("isbn");
  if (!isbn) return Response.json(null);

  const existing = await db.select().from(books).where(eq(books.isbn13, isbn)).get();
  if (existing) {
    return Response.json(
      { error: "このISBNはすでに登録されています", isDuplicate: true },
      { status: 409 }
    );
  }

  const apiKey = context.cloudflare.env.GOOGLE_BOOKS_API_KEY;
  const data = await fetchBookInfoByISBN(isbn, apiKey);

  if (!data) return Response.json(null)

  if (data.description) {
    data.description = await renderMarkdownToHtml(data.description);
  }

  return Response.json(data);
}

export async function action({ request, context }: ActionFunctionArgs) {
  const { db, user } = await requireAdminUser(request, context);

  const formData = await request.formData();
  const raw = Object.fromEntries(formData);
  const parsed = insertBookSchema.safeParse(raw);

  if (!parsed.success) {
    return Response.json({ errors: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const { googleId, isbn13, title, publisher, publishedDate, description } = parsed.data;

  await db.insert(books).values({
    googleId,
    isbn13,
    title,
    publisher: publisher ?? "",
    publishedDate: publishedDate ?? "",
    description: convertHtmlToMarkdown(description ?? ""),
  });

  await writeAuditLog({
    db,
    userId: user.id,
    actionType: "create_book",
    detail: {
      entity: "book",
      action: "create",
      data: {
        googleId,
        isbn13,
        title,
      },
    },
  });

  return new Response(null, {
    status: 302,
    headers: { Location: "/books" },
  });
}

export default function BookNewPage() {
  const actionData = useActionData() as { errors?: Record<string, string[]> };
  const fetcher = useFetcher();
  const [isbn, setIsbn] = useState("");
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef<HTMLDivElement>(null);

  type BookData = {
    googleId: string;
    isbn13?: string;
    title: string;
    publisher?: string;
    publishedDate?: string;
    description?: string;
  };

  const raw = fetcher.data;
  const book: BookData | null =
    raw && typeof raw === "object" && "googleId" in raw ? (raw as BookData) : null;

  const handleIsbnSearch = useCallback(() => {
    if (isbn.trim()) {
      fetcher.load(`/admin/books/new?isbn=${encodeURIComponent(isbn)}`);
    }
  }, [isbn, fetcher]);

  useEffect(() => {
    if (fetcher.state === "idle") {
      if (fetcher.data === null) {
        toast.error("書籍情報が見つかりませんでした");
      } else if (typeof fetcher.data === "object" && "error" in fetcher.data) {
        toast.error(fetcher.data.error as string);
      }
    }
  }, [fetcher.state, fetcher.data]);

  useEffect(() => {
    if (!scanning || !scannerRef.current) return;

    let scanner: import("html5-qrcode").Html5Qrcode | null = null;

    const startScanner = async () => {
      const { Html5Qrcode } = await import("html5-qrcode");
      scanner = new Html5Qrcode(scannerRef.current!.id);

      try {
        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText: string) => {
            if (/^\d{13}$/.test(decodedText) && scanner) {
              void scanner.stop().then(() => {
                setIsbn(decodedText);
                setScanning(false);
                handleIsbnSearch();
              });
            }
          },
          () => { }
        );
      } catch (err) {
        console.error("Scanner error:", err);
        setScanning(false);
      }
    };

    startScanner();

    return () => {
      if (scanner !== null) scanner.stop().catch(() => { });
    };
  }, [scanning, handleIsbnSearch]);

  const coverUrl = book?.googleId ? getGoogleBooksCoverUrl(book.googleId) : "";

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">書籍の新規登録</h1>
      <p className="text-sm text-gray-500">
        書籍のISBNを入力してください。Google Books APIから書籍情報を取得します。
        <br />
        書籍情報を確認後、登録ボタンを押してください。
      </p>
      <Form method="post" className="space-y-4">
        <div className="flex gap-2 items-end">
          <div>
            <Label htmlFor="isbn13">ISBN (13桁)</Label>
            <Input
              id="isbn13"
              name="isbn13"
              value={isbn}
              onChange={(e) => {
                const raw = e.target.value;
                if (/^\d{0,13}$/.test(raw)) {
                  setIsbn(raw);
                }
              }}
              required
              maxLength={13}
              inputMode="numeric"
              className="w-[17ch]"
            />
            {actionData?.errors?.isbn13 && (
              <p className="text-sm text-red-500">
                {actionData.errors.isbn13.join(", ")}
              </p>
            )}
          </div>
          <Button type="button" onClick={handleIsbnSearch} disabled={isbn.length !== 13} className="cursor-pointer">
            検索
          </Button>
          <Button type="button" variant="outline" onClick={() => setScanning(true)} className="cursor-pointer">
            カメラで読み取る
          </Button>
        </div>

        {scanning && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-80 flex flex-col items-center justify-center">
            <div className="text-white mb-2">カメラをISBNバーコードに向けてください</div>
            <div id="isbn-scanner" ref={scannerRef} className="w-[300px] h-[300px] bg-white" />
            <button onClick={() => setScanning(false)} className="mt-4 text-white underline">
              閉じる
            </button>
          </div>
        )}

        {book && (
          <>
            <input type="hidden" name="googleId" value={book.googleId} />
            <input type="hidden" name="title" value={book.title} />
            <input type="hidden" name="publisher" value={book.publisher ?? ""} />
            <input type="hidden" name="publishedDate" value={book.publishedDate ?? ""} />
            <input type="hidden" name="description" value={book.description ?? ""} />

            <div className="border rounded p-4 space-y-2 bg-gray-50">
              <p>
                <strong>タイトル:</strong> {book.title}
              </p>
              {book.publisher && (
                <p>
                  <strong>出版社:</strong> {book.publisher}
                </p>
              )}
              {book.publishedDate && (
                <p>
                  <strong>出版日:</strong> {book.publishedDate}
                </p>
              )}
              {coverUrl && (
                <img
                  src={coverUrl}
                  alt="書籍表紙"
                  className="w-32 h-auto border rounded"
                />
              )}
              {book.description && (
                <div>
                  <p className="font-semibold">説明:</p>
                  <div
                    className="prose text-sm"
                    dangerouslySetInnerHTML={{ __html: book.description }}
                  />
                </div>
              )}
            </div>
          </>
        )}

        <Button type="submit" disabled={!book} className="cursor-pointer">
          登録
        </Button>
      </Form>
    </div>
  );
}
