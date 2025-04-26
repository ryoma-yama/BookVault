import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { authors, bookAuthors, books } from "~/db/schema";

type BookDetail = {
  id: number;
  title: string;
  publisher: string;
  publishedDate: string;
  description: string;
  coverUrl: string;
  authors: string[];
  reviewCount: number;
  averageRating: number | null;
  totalCopies: number;
  loanedCopies: number;
};

export const loader = async ({ params, context }: LoaderFunctionArgs) => {
  const db = drizzle(context.cloudflare.env.DB);
  const bookId = Number(params["bookId"]);
  if (Number.isNaN(bookId)) {
    return new Response("Invalid bookId", { status: 400 });
  }

  const [book] = await db
    .select()
    .from(books)
    .where(eq(books.id, bookId))
    .all();

  if (!book) {
    return new Response("Book not found", { status: 404 });
  }

  const authorRows = await db
    .select({ name: authors.name })
    .from(bookAuthors)
    .innerJoin(authors, eq(bookAuthors.authorId, authors.id))
    .where(eq(bookAuthors.bookId, book.id))
    .all();

  const reviewStatsRaw = await context.cloudflare.env.DB.prepare(`
        SELECT COUNT(*) as count, AVG(rating) as avg
        FROM reviews
        WHERE book_id = ?;
      `)
    .bind(book.id)
    .first<{ count: number; avg: number | null }>();

  const copyStatsRaw = await context.cloudflare.env.DB.prepare(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN returned_date IS NULL THEN 1 ELSE 0 END) as loaned
        FROM book_copies
        LEFT JOIN loans ON book_copies.id = loans.office_book_id
        WHERE book_copies.book_id = ?;
      `)
    .bind(book.id)
    .first<{ total: number; loaned: number }>();

  const detail: BookDetail = {
    id: book.id,
    title: book.title,
    publisher: book.publisher,
    publishedDate: book.publishedDate,
    description: book.description,
    coverUrl: book.googleId
      ? `https://books.google.com/books/content?id=${book.googleId}&printsec=frontcover&img=1&zoom=1&source=gbs_api`
      : "",
    authors: authorRows.map((a) => a.name),
    reviewCount: reviewStatsRaw?.count ?? 0,
    averageRating:
      typeof reviewStatsRaw?.avg === "number" ? reviewStatsRaw.avg : null,
    totalCopies: copyStatsRaw?.total ?? 0,
    loanedCopies: copyStatsRaw?.loaned ?? 0,
  };

  return Response.json(detail);
};

export const meta: MetaFunction = ({ data }) => {
  const book = data as BookDetail;
  if (!book) {
    return [{ title: "Book | BookVault" }];
  }
  return [{ title: `${book.title} | BookVault` }];
};

export default function BookDetailPage() {
  const book = useLoaderData<BookDetail>();

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">{book.title}</h1>
      <p className="text-gray-500">{book.authors.join(" / ")}</p>
      <div className="flex gap-4 mt-4">
        <img
          src={book.coverUrl}
          alt={book.title}
          className="w-32 h-48 object-cover border"
        />
        <div className="space-y-2">
          <p>
            <span className="font-medium">出版社：</span>
            {book.publisher}
          </p>
          <p>
            <span className="font-medium">出版日：</span>
            {book.publishedDate}
          </p>
          <p>
            <span className="font-medium">所蔵数：</span>
            {book.totalCopies}冊（{book.loanedCopies}冊貸出中）
          </p>
          <p>
            <span className="font-medium">レビュー：</span>
            {book.reviewCount}件（平均 {book.averageRating ?? "–"}）
          </p>
        </div>
      </div>
      <div className="mt-4 text-sm whitespace-pre-wrap text-gray-700">
        {book.description}
      </div>
    </div>
  );
}
