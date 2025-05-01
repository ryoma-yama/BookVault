import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare"
import { Form, useActionData, useLoaderData } from "@remix-run/react"
import { eq } from "drizzle-orm"
import { z } from "zod"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { bookCopies, books } from "~/db/schema"
import { requireAdminUser } from "~/lib/auth"

const newCopySchema = z.object({
  acquiredDate: z.string().min(1, "取得日は必須です")
})

const updateCopySchema = z.object({
  id: z.coerce.number(),
  acquiredDate: z.string().min(1),
  discardedDate: z.string().optional()
})

export const meta: MetaFunction = () => [{ title: "蔵書管理 | BookVault" }]

export async function loader({ context, request, params }: LoaderFunctionArgs) {
  const { db } = await requireAdminUser(request, context)
  const bookId = Number(params.bookId)
  if (!bookId || Number.isNaN(bookId)) {
    return Response.json({ error: "Invalid bookId" }, { status: 400 })
  }

  const book = await db.select().from(books).where(eq(books.id, bookId)).get()
  if (!book) {
    return Response.json({ error: "Not found" }, { status: 404 })
  }

  const copies = await db.select().from(bookCopies).where(eq(bookCopies.bookId, bookId)).all()

  return Response.json({ book, copies })
}

export async function action({ context, request, params }: ActionFunctionArgs) {
  const { db } = await requireAdminUser(request, context)
  const bookId = Number(params.bookId)
  if (!bookId || Number.isNaN(bookId)) {
    return Response.json({ error: "Invalid bookId" }, { status: 400 })
  }

  const formData = await request.formData()
  const intent = formData.get("intent")

  if (intent === "create") {
    const raw = Object.fromEntries(formData)
    const parsed = newCopySchema.safeParse(raw)
    if (!parsed.success) {
      return Response.json({ errors: parsed.error.flatten().fieldErrors }, { status: 400 })
    }
    const { acquiredDate } = parsed.data
    await db.insert(bookCopies).values({
      bookId,
      acquiredDate,
      discardedDate: null,
    })
  }

  if (intent === "update") {
    const raw = Object.fromEntries(formData)
    const parsed = updateCopySchema.safeParse(raw)
    if (parsed.success) {
      const { id, acquiredDate, discardedDate } = parsed.data
      await db.update(bookCopies)
        .set({ acquiredDate, discardedDate: discardedDate || null })
        .where(eq(bookCopies.id, id))
    }
  }

  if (intent === "delete") {
    const id = Number(formData.get("id"))
    if (!Number.isNaN(id)) {
      await db.delete(bookCopies).where(eq(bookCopies.id, id))
    }
  }

  return new Response(null, {
    status: 302,
    headers: { Location: `/admin/copies/${bookId}` },
  })
}

type LoaderData = {
  book: {
    title: string
  }
  copies: {
    id: number
    acquiredDate: string
    discardedDate: string | null
  }[]
}

export default function AdminCopiesPage() {
  const { book, copies } = useLoaderData<LoaderData>()
  const actionData = useActionData() as { errors?: Record<string, string[]> }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">{book.title} の蔵書管理</h1>

      <Form method="post" className="space-y-4">
        <input type="hidden" name="intent" value="create" />
        <div>
          <Label htmlFor="acquiredDate">新しい蔵書の取得日</Label>
          <Input id="acquiredDate" name="acquiredDate" type="date" required />
          {actionData?.errors?.acquiredDate && <p className="text-sm text-red-500">{actionData.errors.acquiredDate.join(", ")}</p>}
        </div>
        <Button type="submit">蔵書を追加</Button>
      </Form>

      <div className="space-y-2">
        <h2 className="text-lg font-semibold">現在の蔵書</h2>
        {copies.map((copy: LoaderData["copies"][number]) => (
          <Form method="post" key={copy.id} className="border px-3 py-2 rounded space-y-2">
            <input type="hidden" name="id" value={copy.id} />

            <div>
              <Label>取得日</Label>
              <Input type="date" name="acquiredDate" defaultValue={copy.acquiredDate} required />
            </div>

            <div>
              <Label>廃棄日</Label>
              <Input type="date" name="discardedDate" defaultValue={copy.discardedDate ?? ""} />
            </div>

            <div className="flex gap-2">
              <Button type="submit" name="intent" value="update" variant="secondary">
                更新
              </Button>
              
            </div>
          </Form>
        ))}
      </div>
    </div>
  )
}
