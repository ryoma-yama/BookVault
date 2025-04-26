import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { users } from "~/db/schema";
import { getAuthenticatedEmail } from "~/lib/auth";

const schema = z.object({
  displayName: z.string().min(1, "表示名を入力してください").max(255),
});

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
  const email = getAuthenticatedEmail(request, context.cloudflare.env);
  const db = drizzle(context.cloudflare.env.DB);

  let user = await db
    .select({ displayName: users.displayName })
    .from(users)
    .where(eq(users.email, email))
    .get();

  if (!user) {
    const displayName = email.split("@")[0];
    await db.insert(users).values({
      email,
      displayName,
      role: "user",
      createdAt: new Date().toISOString(),
    });
    user = { displayName };
  }

  return Response.json({ displayName: user.displayName });
};

export const meta: MetaFunction = () => {
  return [
    { title: "My Profile | BookVault" }
  ];
};

export const action = async ({ request, context }: ActionFunctionArgs) => {
  const email = getAuthenticatedEmail(request, context.cloudflare.env);
  const db = drizzle(context.cloudflare.env.DB);
  const formData = await request.formData();

  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return Response.json(
      { errors: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  await db
    .update(users)
    .set({ displayName: parsed.data.displayName })
    .where(eq(users.email, email));

  return Response.json({ success: true });
};

export default function MePage() {
  const loaderData = useLoaderData<{ displayName: string }>();
  const actionData = useActionData<{
    success?: boolean;
    errors?: { displayName?: string[] };
  }>();
  const navigation = useNavigation();

  const [displayName, setDisplayName] = useState(loaderData.displayName);
  const isChanged = displayName !== loaderData.displayName;
  const isSubmitting = navigation.state !== "idle";

  useEffect(() => {
    if (actionData?.success) {
      toast.success("プロフィールを更新しました");
    }
  }, [actionData]);

  return (
    <main className="max-w-md mx-auto p-4 space-y-6">
      <h1 className="text-xl font-semibold">プロフィール編集</h1>

      <Form method="post" className="space-y-4">
        <div>
          <label
            htmlFor="displayName"
            className="block text-sm font-medium mb-1"
          >
            表示名
          </label>
          <input
            id="displayName"
            type="text"
            name="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full border border-gray-300 px-3 py-2 rounded shadow-sm focus:outline-none focus:ring focus:ring-blue-200"
          />
          {actionData?.errors?.displayName && (
            <p className="text-sm text-red-500 mt-1">
              {actionData.errors.displayName[0]}
            </p>
          )}
        </div>

        <Button
          type="submit"
          className="cursor-pointer"
          disabled={!isChanged || isSubmitting}
        >
          更新する
        </Button>
      </Form>
    </main>
  );
}
