"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Unable to process request.");
        return;
      }

      sessionStorage.setItem("reset_email", email);
      setMessage(data.message);
      setTimeout(() => router.push("/verify-otp"), 1200);
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
        <p className="eyebrow">PASSWORD RECOVERY</p>
        <h1>Forgot Password?</h1>
        <p className="subtitle">Enter your registered email address. We will send you a 6-digit reset code.</p>

        <form onSubmit={submit}>
          <label>Email Address</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />

          {error && <div className="error">{error}</div>}
          {message && <div className="success">{message}</div>}

          <button disabled={loading}>{loading ? "Sending..." : "Send Reset Code"}</button>
        </form>

        <button className="link-button" onClick={() => router.push("/")}>Back to Login</button>
      </section>
    </main>
  );
}
