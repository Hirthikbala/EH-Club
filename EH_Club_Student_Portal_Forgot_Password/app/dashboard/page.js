"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();
  const [student, setStudent] = useState(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("eh_student");
    if (!raw) router.replace("/");
    else setStudent(JSON.parse(raw));
  }, [router]);

  if (!student) return null;

  function logout() {
    sessionStorage.removeItem("eh_student");
    router.push("/");
  }

  return (
    <main className="dashboard-page">
      <nav className="navbar">
        <div className="brand">
          <div className="small-logo">EH</div>
          <span>Electronics Hardware Club</span>
        </div>
        <button className="logout" onClick={logout}>Logout</button>
      </nav>

      <section className="dashboard">
        <div className="welcome">
          <p className="eyebrow">STUDENT DASHBOARD</p>
          <h1>Welcome, {student.username} 👋</h1>
          <p>Your profile and quiz progress.</p>
        </div>

        <div className="cards">
          <div className="info-card"><span>Department</span><strong>{student.dpt}</strong></div>
          <div className="info-card"><span>Year</span><strong>{student.year}</strong></div>
          <div className="info-card"><span>Quiz Score</span><strong>{student.quiz_score}</strong></div>
        </div>

        <div className="profile-card">
          <h2>Student Details</h2>
          <div className="details-grid">
            <div><span>Registration No.</span><b>{student.reg_no}</b></div>
            <div><span>Email</span><b>{student.email}</b></div>
            <div><span>Phone</span><b>{student.phone}</b></div>
            <div><span>Department</span><b>{student.dpt}</b></div>
            <div><span>Year</span><b>{student.year}</b></div>
            <div><span>Current Quiz Score</span><b>{student.quiz_score}</b></div>
          </div>
        </div>

        <div className="future-section">
          <h2>Club Activities</h2>
          <div className="future-grid">
            <div><b>📝 Daily Quiz</b><p>Attend today's quiz.</p></div>
            <div><b>📅 Events</b><p>Register for upcoming events.</p></div>
            <div><b>🏆 Quiz History</b><p>View previous scores.</p></div>
            <div><b>📚 Past Events</b><p>Explore completed events.</p></div>
          </div>
        </div>
      </section>
    </main>
  );
}
