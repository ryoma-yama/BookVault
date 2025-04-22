import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { drizzle } from "drizzle-orm/d1";
import { Card, CardContent } from "~/components/ui/card";
import { books } from "~/db/schema";

type BookWithCover = {
  id: number;
  title: string;
  coverUrl: string;
};

export const loader = async ({ context }: LoaderFunctionArgs) => {
  const db = drizzle(context.cloudflare.env.DB);
  const result = await db.select().from(books).all();

  const booksWithCovers = result.map((book) => ({
    id: book.id,
    title: book.title,
    coverUrl: `https://books.google.com/books/content?id=${book.googleId}&printsec=frontcover&img=1&zoom=1&source=gbs_api`,
  }));

  return Response.json(booksWithCovers);
};

export default function BooksRoute() {
  const books = useLoaderData<BookWithCover[]>();

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">書籍一覧</h1>
      <p className="text-sm text-gray-600">{books.length} 件</p>

      {books.length === 0 ? (
        <p className="text-gray-500">登録されている書籍はありません。</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {books.map((book) => (
            <Card key={book.id} className="flex flex-col items-center">
              <img
                src={book.coverUrl}
                alt={book.title}
                className="w-full h-48 object-cover"
              />
              <CardContent className="mt-2 text-center text-sm font-medium">
                {book.title}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
