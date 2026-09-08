const fs = require("fs");
const path = require("path");
const XLSX = require("xlsx");
const bcrypt = require("bcryptjs");
const mysql = require("mysql2/promise");
require("dotenv").config({ path: ".env.local" });

async function main() {
  const filePath = path.join(process.cwd(), "public", "data", "students.xlsx");

  if (!fs.existsSync(filePath)) {
    throw new Error("students.xlsx not found at public/data/students.xlsx");
  }

  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

  const required = ["username", "password", "reg_no", "dpt", "year", "email", "phone", "quiz_score"];
  for (const [index, row] of rows.entries()) {
    for (const column of required) {
      if (String(row[column]).trim() === "") {
        throw new Error(`Row ${index + 2}: missing ${column}`);
      }
    }
  }

  const db = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  for (const row of rows) {
    const passwordHash = await bcrypt.hash(String(row.password), 12);

    await db.execute(
      `INSERT INTO students
       (username, password_hash, reg_no, dpt, year, email, phone, quiz_score)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
       password_hash = VALUES(password_hash),
       dpt = VALUES(dpt),
       year = VALUES(year),
       email = VALUES(email),
       phone = VALUES(phone),
       quiz_score = VALUES(quiz_score)`,
      [
        String(row.username).trim(),
        passwordHash,
        String(row.reg_no).trim(),
        String(row.dpt).trim(),
        String(row.year).trim(),
        String(row.email).trim().toLowerCase(),
        String(row.phone).trim(),
        Number(row.quiz_score) || 0
      ]
    );
  }

  await db.end();
  console.log(`Imported ${rows.length} students.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
