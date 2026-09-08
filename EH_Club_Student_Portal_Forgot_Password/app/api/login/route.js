import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getDb } from "../../../lib/db";

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password are required." }, { status: 400 });
    }

    const db = getDb();
    const [rows] = await db.execute(
      `SELECT id, username, password_hash, reg_no, dpt, year, email, phone, quiz_score
       FROM students WHERE username = ? LIMIT 1`,
      [String(username).trim()]
    );

    if (!rows.length || !(await bcrypt.compare(String(password), rows[0].password_hash))) {
      return NextResponse.json({ error: "Invalid username or password." }, { status: 401 });
    }

    const student = rows[0];

    return NextResponse.json({
      student: {
        username: student.username,
        reg_no: student.reg_no,
        dpt: student.dpt,
        year: student.year,
        email: student.email,
        phone: student.phone,
        quiz_score: student.quiz_score
      }
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
