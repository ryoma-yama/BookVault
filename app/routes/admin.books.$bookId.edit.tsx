import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare"
import { Form, useActionData, useLoaderData } from "@remix-run/react"
import { eq } from "drizzle-orm"
import { z } from "zod"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Textarea } from "~/components/ui/textarea"
import { authors, bookAuthors, books } from "~/db/schema"
import { writeAuditLog } from "~/lib/audit"
import { requireAdminUser } from "~/lib/auth"

const updateBookSchema = z.object({
  title: z.string(),
  publisher: z.string(),
  publishedDate: z.string(),
  description: z.string().optional(),
  authors: z.string().optional()
})

export const meta: MetaFunction = () => [{ title: "書籍編集 | BookVault" }]

export async function loader({ params, context, request }: LoaderFunctionArgs) {
  const { db } = await requireAdminUser(request, context)
  const id = Number(params.bookId)
  if (!id || Number.isNaN(id)) {
    return Response.json({ error: "Invalid book ID" }, { status: 400 })
  }

  const rows = await db
    .select({
      book: books,
      authorName: authors.name
    })
    .from(books)
    .leftJoin(bookAuthors, eq(books.id, bookAuthors.bookId))
    .leftJoin(authors, eq(bookAuthors.authorId, authors.id))
    .where(eq(books.id, id))

  if (rows.length === 0) {
    return Response.json({ error: "Not found" }, { status: 404 })
  }

  const { book } = rows[0]
  const authorNames = rows.map(r => r.authorName).filter(Boolean)

  return Response.json({ ...book, authors: authorNames })
}

export async function action({ request, context, params }: ActionFunctionArgs) {
  const { db, user } = await requireAdminUser(request, context)
  const id = Number(params.bookId)
  if (!id || Number.isNaN(id)) {
    return Response.json({ error: "Invalid book ID" }, { status: 400 })
  }

  const formData = await request.formData()
  const raw = Object.fromEntries(formData)
  const parsed = updateBookSchema.safeParse(raw)

  if (!parsed.success) {
    return Response.json({ errors: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const { title, publisher, publishedDate, description, authors: authorsRaw } = parsed.data

  await db.update(books)
    .set({
      title,
      publisher,
      publishedDate,
      description: description ?? ""
    })
    .where(eq(books.id, id))

  if (authorsRaw) {
    const authorList = authorsRaw.split(",").map((name) => name.trim()).filter((name) => name)

    await db.delete(bookAuthors).where(eq(bookAuthors.bookId, id))

    for (const name of authorList) {
      const existing = await db.select().from(authors).where(eq(authors.name, name)).get()
      const authorId = existing?.id ?? (
        await db.insert(authors).values({ name }).returning({ id: authors.id })
      )[0].id

      await db.insert(bookAuthors).values({ bookId: id, authorId })
    }
  }

  await writeAuditLog({
    db,
    userId: user.id,
    actionType: "update_book",
    detail: {
      entity: "book",
      action: "update",
      id
    }
  })

  return new Response(null, {
    status: 302,
    headers: { Location: "/admin/books" }
  })
}

type BookRow = {
  id: number
  title: string
  publisher: string
  publishedDate: string
  description: string | null
  googleId: string | null
  authors: string[]
}

export default function BookEditPage() {
  const book = useLoaderData<BookRow>()
  const actionData = useActionData() as { errors?: Record<string, string[]> }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">書籍の編集</h1>
      <Form method="post" className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="googleId">Google Books ID</Label>
          <Input
            id="googleId"
            name="googleId"
            defaultValue={book.googleId ?? ""}
            readOnly
            disabled
            className="opacity-50 cursor-not-allowed"
          />
          <p className="text-sm text-muted-foreground">
            Google Books APIから自動取得されたIDです（編集不可）
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="title">タイトル</Label>
          <Input id="title" name="title" defaultValue={book.title} required />
          {actionData?.errors?.title && <p className="text-sm text-red-500">{actionData.errors.title.join(", ")}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="authors">著者（カンマ区切り）</Label>
          <Input
            id="authors"
            name="authors"
            defaultValue={book.authors.join(", ")}
            placeholder="例：山田太郎, 佐藤花子"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="publisher">出版社</Label>
          <Input id="publisher" name="publisher" defaultValue={book.publisher} required />
          {actionData?.errors?.publisher && <p className="text-sm text-red-500">{actionData.errors.publisher.join(", ")}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="publishedDate">出版日</Label>
          <Input id="publishedDate" name="publishedDate" defaultValue={book.publishedDate ?? ""} required />
          {actionData?.errors?.publishedDate && <p className="text-sm text-red-500">{actionData.errors.publishedDate.join(", ")}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">説明</Label>
          <Textarea
            id="description"
            name="description"
            defaultValue={book.description ?? ""}
            rows={10}
          />
        </div>
        <Button type="submit">保存</Button>
      </Form>
    </div>
  )
}
