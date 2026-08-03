import { pgTable, serial, text, timestamp, boolean } from "drizzle-orm/pg-core";

export const registrationOtpsTable = pgTable("registration_otps", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  otpHash: text("otp_hash").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  verified: boolean("verified").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
