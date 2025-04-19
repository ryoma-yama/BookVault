import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";

export const books = sqliteTable("books", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  googleId: text("google_id", { length: 100 }).notNull(),
  isbn13: text("isbn_13", { length: 13 }).notNull(),
  title: text("title", { length: 255 }).notNull(),
  publisher: text("publisher", { length: 255 }).notNull(),
  publishedDate: text("published_date").notNull(),
  description: text("description").notNull(),
});
