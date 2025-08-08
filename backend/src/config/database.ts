import { Pool } from "pg";

// const pool = new Pool({
//   user: process.env.DB_USER || "postgres",
//   host: process.env.DB_HOST || "localhost",
//   database: process.env.DB_NAME || "product_management",
//   password: process.env.DB_PASSWORD || "password",
//   port: parseInt(process.env.DB_PORT || "5432"),
// });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // your full supabase URI
  ssl: {
    rejectUnauthorized: false, // needed for Supabase
  },
});

// Test connection
pool.on("connect", () => {
  console.log("Connected to PostgreSQL database");
});

pool.on("error", (err) => {
  console.error("Database connection error:", err);
});

export default pool;
