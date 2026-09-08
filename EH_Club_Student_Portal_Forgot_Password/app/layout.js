import "./globals.css";

export const metadata = {
  title: "Electronics Hardware Club",
  description: "Student Portal"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
