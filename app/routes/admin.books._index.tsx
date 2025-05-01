import { LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare"
import { Link, useLoaderData } from "@remix-run/react"
import type { ColumnDef, SortingState } from "@tanstack/react-table"
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { isNull } from "drizzle-orm"
import { ArrowUpDown } from "lucide-react"
import * as React from "react"
import { Button } from "~/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table"
import { bookCopies, books } from "~/db/schema"
import { requireAdminUser } from "~/lib/auth"

export type BookRow = {
  id: number
  title: string
  publisher: string
  publishedDate: string | null
  copiesCount: number
}

export const meta: MetaFunction = () => [{ title: "Book Management | BookVault" }]

export async function loader({ request, context }: LoaderFunctionArgs) {
  const { db } = await requireAdminUser(request, context)

  const booksResult = await db.select().from(books)

  const copiesResult = await db
    .select({ bookId: bookCopies.bookId })
    .from(bookCopies)
    .where(isNull(bookCopies.discardedDate))

  const copyCountMap = new Map<number, number>()
  for (const { bookId } of copiesResult) {
    copyCountMap.set(bookId, (copyCountMap.get(bookId) ?? 0) + 1)
  }

  const result: BookRow[] = booksResult.map((book) => ({
    id: book.id,
    title: book.title,
    publisher: book.publisher,
    publishedDate: book.publishedDate ?? null,
    copiesCount: copyCountMap.get(book.id) ?? 0,
  }))

  return Response.json(result)
}

const columns: ColumnDef<BookRow>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        ID
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "title",
    header: "タイトル",
  },
  {
    accessorKey: "publisher",
    header: "出版社",
  },
  {
    accessorKey: "publishedDate",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        出版日
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "copiesCount",
    header: "蔵書数",
  },
  {
    id: "actions",
    header: "操作",
    cell: ({ row }) => {
      const id = (row.original as BookRow).id;
      return (
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link to={`/admin/books/${id}/edit`}>編集</Link>
          </Button>
          <Button asChild variant="secondary" size="sm">
            <Link to={`/admin/copies/${id}`}>蔵書</Link>
          </Button>
        </div>
      );
    }
  },
]

function DataTable<TData, TValue>({
  columns,
  data,
}: {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}) {
  const [sorting, setSorting] = React.useState<SortingState>([])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: { sorting },
  })

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={(row.original as BookRow).id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext()
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}

export default function AdminBooksIndex() {
  const data = useLoaderData<BookRow[]>()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">書籍一覧</h1>
        <Button asChild variant="outline">
          <Link to="/admin/books/new">新規登録</Link>
        </Button>
      </div>
      <div className="container mx-auto">
        <DataTable columns={columns} data={data} />
      </div>
    </div>
  )
}
