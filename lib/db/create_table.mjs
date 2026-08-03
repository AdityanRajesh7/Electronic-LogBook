import pg from "pg";
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes("sslmode=") || process.env.DATABASE_URL.includes("neon.tech") ? { rejectUnauthorized: false } : undefined,
});

async function main() {
  const sql = `
  CREATE TABLE IF NOT EXISTS "registration_otps" (
      "id" serial PRIMARY KEY NOT NULL,
      "email" text NOT NULL,
      "otp_hash" text NOT NULL,
      "expires_at" timestamp NOT NULL,
      "verified" boolean DEFAULT false,
      "created_at" timestamp DEFAULT now() NOT NULL
  );
  `;
  try {
    await pool.query(sql);
    console.log("registration_otps table created successfully!");
  } catch (err) {
    console.error("Failed to create table:", err);
  } finally {
    await pool.end();
  }
}

main();
