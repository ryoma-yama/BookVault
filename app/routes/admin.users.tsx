// app/routes/admin.users.tsx
import type {
    LoaderFunctionArgs,
    MetaFunction
} from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { users } from "~/db/schema";
import { requireAdminUser } from "~/lib/auth";

type User = {
  id: number;
  email: string;
  displayName: string;
  role: string;
  createdAt: string;
};

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
  const { db } = await requireAdminUser(request, context);

  const allUsers = await db.select().from(users).all();

  return Response.json(allUsers);
};

export const meta: MetaFunction = () => {
    return [
      { title: "User Management | BookVault" }
    ];
  };

export default function AdminUsersPage() {
  const users = useLoaderData<User[]>();

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">ユーザー一覧</h1>
      <table className="w-full table-auto border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2 py-1">ID</th>
            <th className="border px-2 py-1">Email</th>
            <th className="border px-2 py-1">表示名</th>
            <th className="border px-2 py-1">ロール</th>
            <th className="border px-2 py-1">登録日</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td className="border px-2 py-1">{u.id}</td>
              <td className="border px-2 py-1">{u.email}</td>
              <td className="border px-2 py-1">{u.displayName}</td>
              <td className="border px-2 py-1">{u.role}</td>
              <td className="border px-2 py-1">{new Date(u.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
