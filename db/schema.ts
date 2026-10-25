// Intentionally empty by default.
// Add Drizzle tables here when the site actually needs a database.
// See examples/d1/db/schema.ts for an opt-in example.
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
export const sessions = sqliteTable('sessions', { token: text('token').primaryKey(), subject: text('subject').notNull(), role: text('role').notNull(), outlet: text('outlet'), expires: integer('expires').notNull() });
export const challenges = sqliteTable('challenges', { email: text('email').primaryKey(), hash: text('hash').notNull(), expires: integer('expires').notNull(), sent: integer('sent').notNull(), attempts: integer('attempts').notNull().default(0) });
export const orders = sqliteTable('orders', { id: text('id').primaryKey(), customer: text('customer').notNull(), outlet: text('outlet').notNull(), items: text('items').notNull(), total: integer('total').notNull(), status: text('status').notNull(), pickup: text('pickup').notNull(), note: text('note').notNull(), created: integer('created').notNull(), customerDetails:text('customer_details').notNull().default('{}'),decisionNote:text('decision_note').notNull().default(''),requestId:text('request_id').unique() });
export const profiles=sqliteTable('profiles',{email:text('email').primaryKey(),details:text('details').notNull()});
export const settings = sqliteTable('settings', { outlet: text('outlet').primaryKey(), data: text('data').notNull() });
