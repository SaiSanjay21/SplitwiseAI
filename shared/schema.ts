import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const groups = pgTable("groups", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  createdBy: integer("created_by").notNull(),
});

export const groupMembers = pgTable("group_members", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id").notNull(),
  userId: integer("user_id").notNull(),
  symbol: text("symbol").notNull(),
});

export const bills = pgTable("bills", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id").notNull(),
  total: integer("total").notNull(),
  splits: jsonb("splits").notNull().$type<{userId: number, amount: number}[]>(),
  receiptUrl: text("receipt_url"),
  createdAt: text("created_at").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertGroupSchema = createInsertSchema(groups).pick({
  name: true,
});

export const insertBillSchema = createInsertSchema(bills).pick({
  groupId: true,
  total: true,
  splits: true,
  receiptUrl: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Group = typeof groups.$inferSelect;
export type GroupMember = typeof groupMembers.$inferSelect;
export type Bill = typeof bills.$inferSelect;
