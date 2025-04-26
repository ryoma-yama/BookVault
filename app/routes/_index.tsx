import type { MetaFunction } from "@remix-run/cloudflare";
import { Button } from "~/components/ui/button";

export const meta: MetaFunction = () => {
  return [
    { title: "BookVault" },
    {
      name: "description",
      content: "Cloudflare Pages + Remix による蔵書管理アプリです。",
    },
  ];
};

export default function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex max-w-xl flex-col items-center gap-10 px-4 py-24 text-center">
        <h1 className="text-3xl font-bold">蔵書管理アプリへようこそ</h1>
        <p className="text-muted-foreground">
          本アプリは、小規模向けの蔵書管理を目的としており、Cloudflare Access
          による認証と Google Books API を用いた書籍情報の取得に対応しています。
        </p>
        <div className="flex flex-col items-center gap-4">
          <Button asChild>
            <a href="/books">書籍一覧を見る</a>
          </Button>
          <p className="text-sm text-muted-foreground">
            書籍の詳細確認や貸出にはログインが必要です。
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          ※ Cloudflare Access を利用しており、Google や GitHub
          アカウントでログイン可能です。
        </p>
      </div>
    </div>
  );
}
