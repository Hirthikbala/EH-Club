"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Invalid username or password.");
        return;
      }

      sessionStorage.setItem("eh_student", JSON.stringify(data.student));
      router.push("/dashboard");
    } catch {
      setError("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="logo">EH</div>
        <p className="eyebrow">ELECTRONICS HARDWARE CLUB</p>
        <h1>Student Portal</h1>
        <p className="subtitle">Login to attend quizzes and register for club events.</p>

        <form onSubmit={handleLogin}>
          <label>Username</label>
          <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Enter username" required />

          <label>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password" required />

          {error && <div className="error">{error}</div>}

          <button disabled={loading}>{loading ? "Logging in..." : "Login"}</button>
        </form>

        <button className="link-button" onClick={() => router.push("/forgot-password")}>
          Forgot Password?
        </button>
      </section>
    </main>
  );
}
