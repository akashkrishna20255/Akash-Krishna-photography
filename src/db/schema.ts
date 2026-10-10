import { pgTable, text, jsonb, boolean, integer, uuid } from 'drizzle-orm/pg-core';

export const photos = pgTable('photos', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  category: text('category').notNull(),
  imageUrl: text('image_url').notNull(),
  images: jsonb('images'), // Array of strings
  year: text('year').notNull(),
  description: text('description'),
  aspectRatio: text('aspect_ratio'),
});

export const siteSettings = pgTable('site_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  content: jsonb('content').notNull(), // Stores the entire SiteContent object
});
