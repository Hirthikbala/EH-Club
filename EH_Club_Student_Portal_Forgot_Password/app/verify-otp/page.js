"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function VerifyOtp() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedEmail = sessionStorage.getItem("reset_email");
    if (!savedEmail) router.replace("/forgot-password");
    else setEmail(savedEmail);
  }, [router]);

  async function submit(e) {
    e.preventDefault();
    setError("");

    if (!/^\d{6}$/.test(otp)) {
      setError("Enter the 6-digit OTP.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Invalid OTP.");
        return;
      }

      sessionStorage.setItem("reset_token", data.resetToken);
      router.push("/reset-password");
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
        <p className="eyebrow">VERIFY CODE</p>
        <h1>Enter OTP</h1>
        <p className="subtitle">Enter the 6-digit code sent to your registered email.</p>

        <form onSubmit={submit}>
          <label>6-Digit Code</label>
          <input
            inputMode="numeric"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            placeholder="123456"
            required
          />

          {error && <div className="error">{error}</div>}

          <button disabled={loading}>{loading ? "Verifying..." : "Verify OTP"}</button>
        </form>

        <button className="link-button" onClick={() => router.push("/forgot-password")}>Request a new code</button>
      </section>
    </main>
  );
}
