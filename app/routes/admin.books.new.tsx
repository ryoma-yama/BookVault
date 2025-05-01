import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare";
import { Form, useActionData, useFetcher } from "@remix-run/react";
import createDOMPurify from "dompurify";
import { eq } from "drizzle-orm";
import { JSDOM } from "jsdom";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { books } from "~/db/schema";
import { writeAuditLog } from "~/lib/audit";
import { requireAdminUser } from "~/lib/auth";
import { fetchBookInfoByISBN, getGoogleBooksCoverUrl } from "~/lib/google-books";

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

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
  const url = new URL(request.url);
  const isbn = url.searchParams.get("isbn");
  if (!isbn) {
      return Response.json({ error: "ISBNが指定されていません" }, { status: 400 });
  }

  const { db } = await requireAdminUser(request, context);

  const existing = await db.select().from(books).where(eq(books.isbn13, isbn)).get();
  if (existing) {
    return Response.json(
      { error: "このISBNはすでに登録されています", isDuplicate: true },
      { status: 409 }
    );
  }

  const apiKey = context.cloudflare.env.GOOGLE_BOOKS_API_KEY;
  const data = await fetchBookInfoByISBN(isbn, apiKey);

  if (!data) {
      return Response.json(null);
  }

  if (data.description) {
    data.description = DOMPurify.sanitize(data.description, { USE_PROFILES: { html: true } });
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
    description: description ?? "",
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
    headers: { Location: "/books" }
  });
}

export default function BookNewPage() {
  const actionData = useActionData() as { errors?: Record<string, string[]> };
  const fetcher = useFetcher();
  const [isbn, setIsbn] = useState("");

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

  const handleIsbnSearch = () => {
    if (isbn.trim()) {
      fetcher.load(`/admin/books/new?isbn=${encodeURIComponent(isbn)}`);
    }
  };

  useEffect(() => {
    if (fetcher.state === "idle") {
      if (fetcher.data === null) {
        toast.error("書籍情報が見つかりませんでした");
      } else if (typeof fetcher.data === "object" && "error" in fetcher.data) {
        toast.error(fetcher.data.error as string);
      }
    }
  }, [fetcher.state, fetcher.data]);

  const coverUrl = book?.googleId ? getGoogleBooksCoverUrl(book.googleId) : "";

  return (
    <div className="max-w-xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">書籍の新規登録</h1>

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
            {actionData?.errors?.isbn13 && <p className="text-sm text-red-500">{actionData.errors.isbn13.join(", ")}</p>}
          </div>
          <Button type="button" onClick={handleIsbnSearch}
            disabled={isbn.length !== 13} className="cursor-pointer">
            検索
          </Button>
        </div>

        {book && (
          <>
            <input type="hidden" name="googleId" value={book.googleId} />
            <input type="hidden" name="title" value={book.title} />
            <input type="hidden" name="publisher" value={book.publisher ?? ""} />
            <input type="hidden" name="publishedDate" value={book.publishedDate ?? ""} />
            <input type="hidden" name="description" value={book.description ?? ""} />

            <div className="border rounded p-4 space-y-2 bg-gray-50">
              <p><strong>タイトル:</strong> {book.title}</p>
              {book.publisher && <p><strong>出版社:</strong> {book.publisher}</p>}
              {book.publishedDate && <p><strong>出版日:</strong> {book.publishedDate}</p>}
              {coverUrl && <img src={coverUrl} alt="書籍表紙" className="w-32 h-auto border rounded" />}
              {book.description && (
                <div>
                  <p className="font-semibold">説明:</p>
                  <div className="prose text-sm" dangerouslySetInnerHTML={{ __html: book.description }} />
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
