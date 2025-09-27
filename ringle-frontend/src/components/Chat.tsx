// src/components/Chat.tsx
import { Link } from "react-router-dom";

export default function Chat() {
  return (
    <div style={{ maxWidth: 800, margin: "40px auto", padding: 16, fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Noto Sans KR, sans-serif" }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Chat</h1>
      <p style={{ color: "#64748b" }}>데모 채팅 페이지</p>
      <div style={{ marginTop: 16 }}>
        <Link to="/" style={{ padding: "8px 12px", border: "1px solid #e2e8f0", borderRadius: 10, textDecoration: "none" }}>
          ← 홈으로
        </Link>
      </div>
    </div>
  );
}
