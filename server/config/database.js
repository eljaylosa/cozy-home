import mysql from "mysql2/promise";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

dotenv.config({
  path: fileURLToPath(new URL("../.env", import.meta.url)),
});

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "cozy_home",

  // Interpret MySQL date values as UTC.
  timezone: "Z",

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default pool;
