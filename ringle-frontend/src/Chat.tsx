import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCanChat } from "./lib/api";

export default function Chat() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { canChat } = await getCanChat();
        if (!canChat) {
          alert("대화 권한이 없습니다. 멤버십을 확인해 주세요.");
          nav("/");
          return;
        }
      } catch (e) {
        alert("서버 점검 중이거나 네트워크 오류입니다.");
        nav("/");
        return;
      } finally {
        setLoading(false);
      }
    })();
  }, [nav]);

  if (loading) return <div style={{ padding: 24 }}>권한 확인 중…</div>;

  // 최소 요건: 접속 시 AI가 먼저 한 마디
  return (
    <div style={{ padding: 24 }}>
      <h2>AI 대화</h2>
      <div style={{ marginTop: 12, padding: 12, border: "1px solid #eee", borderRadius: 8 }}>
        <strong>AI:</strong> Hi! I’m Alex. Ready to practice together?
      </div>
      {/* 마이크/Waveform/STT는 다음 단계에서 붙이면 됨 */}
    </div>
  );
}
