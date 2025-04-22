import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const books = sqliteTable("books", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  googleId: text("google_id", { length: 100 }).notNull(),
  isbn13: text("isbn_13", { length: 13 }).notNull(),
  title: text("title", { length: 255 }).notNull(),
  publisher: text("publisher", { length: 255 }).notNull(),
  publishedDate: text("published_date").notNull(),
  description: text("description").notNull(),
});

export const authors = sqliteTable("authors", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name", { length: 255 }).notNull(),
});

export const bookAuthors = sqliteTable("book_authors", {
  bookId: integer("book_id")
    .notNull()
    .references(() => books.id),
  authorId: integer("author_id")
    .notNull()
    .references(() => authors.id),
});

export const tags = sqliteTable("tags", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name", { length: 255 }).notNull(),
});

export const bookTags = sqliteTable("book_tags", {
  bookId: integer("book_id")
    .notNull()
    .references(() => books.id),
  tagId: integer("tag_id")
    .notNull()
    .references(() => tags.id),
});

export const bookCopies = sqliteTable("book_copies", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  bookId: integer("book_id")
    .notNull()
    .references(() => books.id),
  acquiredDate: text("acquired_date").notNull(),
  discardedDate: text("discarded_date"),
});

export const reviews = sqliteTable("reviews", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  bookId: integer("book_id")
    .notNull()
    .references(() => books.id),
  userId: integer("user_id").notNull(),
  content: text("content").notNull(),
  rating: integer("rating").notNull(),
  createdAt: text("created_at").notNull(),
});

export const loans = sqliteTable("loans", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  officeBookId: integer("office_book_id")
    .notNull()
    .references(() => bookCopies.id),
  userId: integer("user_id").notNull(),
  borrowedDate: text("borrowed_date").notNull(),
  returnedDate: text("returned_date"),
});
