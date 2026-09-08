# Electronics Hardware Club Student Portal

Features in this version:
- Student login
- Forgot password
- Email 6-digit OTP
- OTP expiry
- Password reset
- Student dashboard
- Excel student-data template
- MySQL database schema
- Initial Excel-to-MySQL import script

## Important

Do NOT upload `.env` or real passwords to GitHub.

For production, use MySQL as the live database. The Excel file is only a template/import source.

## 1. Install

```bash
npm install
```

## 2. Create MySQL database

Run `database/schema.sql` in MySQL.

## 3. Configure environment

Copy `.env.example` to `.env.local` and enter your MySQL and SMTP credentials.

For Gmail, use a Gmail App Password rather than your normal Gmail password.

## 4. Import students from Excel

Edit `public/data/students.xlsx`, then run:

```bash
node scripts/import-students.js
```

The script hashes passwords before storing them in MySQL.

## 5. Run

```bash
npm run dev
```

Open:

http://localhost:3000

## Forgot password

1. Click Forgot Password.
2. Enter the student's registered email.
3. A 6-digit OTP is sent by email.
4. Enter the OTP.
5. Enter and confirm the new password.
6. Return to login.

OTP expires after the configured number of minutes and is deleted after successful use.

## Vercel

Push the project to GitHub and import the repository into Vercel.

Add the same environment variables in:
Vercel Project -> Settings -> Environment Variables

Do not put database credentials in source code.
