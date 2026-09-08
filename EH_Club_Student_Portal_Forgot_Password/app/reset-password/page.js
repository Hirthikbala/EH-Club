"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ResetPassword() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedToken = sessionStorage.getItem("reset_token");
    if (!savedToken) router.replace("/forgot-password");
    else setToken(savedToken);
  }, [router]);

  async function submit(e) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Unable to reset password.");
        return;
      }

      sessionStorage.removeItem("reset_email");
      sessionStorage.removeItem("reset_token");
      setMessage("Password changed successfully. Redirecting to login...");
      setTimeout(() => router.push("/"), 1500);
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
        <p className="eyebrow">NEW PASSWORD</p>
        <h1>Reset Password</h1>
        <p className="subtitle">Create a new password for your club account.</p>

        <form onSubmit={submit}>
          <label>New Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimum 8 characters" required />

          <label>Confirm Password</label>
          <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Re-enter password" required />

          {error && <div className="error">{error}</div>}
          {message && <div className="success">{message}</div>}

          <button disabled={loading}>{loading ? "Updating..." : "Change Password"}</button>
        </form>
      </section>
    </main>
  );
}
