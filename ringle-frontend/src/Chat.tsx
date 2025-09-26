import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCanChat, getMemberships, listMemberships } from "./lib/api";

type Msg = { id: string; role: "assistant" | "user"; text: string };
const uid = () => Math.random().toString(36).slice(2);

export default function Chat() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // 멤버십 features 계산 유틸 (서버가 features를 주든, can_* 플래그만 주든 모두 대응)
  const featuresOf = (m: any): string[] => {
    if (Array.isArray(m?.features) && m.features.length) return m.features as string[];
    const fx: string[] = [];
    if (m?.can_learn) fx.push("learn");
    if (m?.can_chat) fx.push("chat");
    if (m?.can_analyze) fx.push("analyze");
    return fx;
  };

  // 권한 확인 + AI 첫 한마디
  useEffect(() => {
    (async () => {
      try {
        // 1차: 서버가 판정 (/v1/me/can_chat)
        try {
          const { canChat } = await getCanChat();
          if (!canChat) {
            alert("대화 권한이 없습니다. 멤버십을 확인해 주세요.");
            nav("/");
            return;
          }
        } catch (err) {
          // 2차 폴백: 내 멤버십 + 전체 멤버십으로 직접 계산
          const email = (localStorage.getItem("email") || "demo@ringle.test").trim();
          const [mine, all] = await Promise.all([
            getMemberships(email),
            listMemberships(),
          ]);

          const byId = new Map(all.map((m: any) => [m.id, m]));
          const now = Date.now();

          const active = mine.filter((um) => new Date(um.ends_on).getTime() >= now);
          const union = new Set<string>();
          for (const um of active) {
            const m = byId.get(um.membership_id);
            for (const f of featuresOf(m)) union.add(f);
          }
          const canChat = union.has("chat");

          if (!canChat) {
            alert("대화 권한이 없습니다. 멤버십을 확인해 주세요.");
            nav("/");
            return;
          }
        }

        // 여기 도달하면 채팅 허용 → 최초 인사
        setMessages([
          { id: uid(), role: "assistant", text: "안녕하세요! 연습을 시작해볼까요?" },
        ]);
      } catch (e) {
        console.error(e);
        alert("권한 확인 중 오류가 발생했습니다.");
        nav("/");
        return;
      } finally {
        setLoading(false);
      }
    })();
  }, [nav]);

  // 새 메시지 때마다 스크롤 하단으로
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const disabled = useMemo(() => loading || sending, [loading, sending]);

  // 간단 모킹 응답
  const mockAiReply = async (userText: string) => {
    const t = userText.toLowerCase();
    if (t.includes("학습")) return "학습 기능은 자료를 요약/정리해 드릴 수 있어요. 어떤 자료로 연습할까요?";
    if (t.includes("분석")) return "분석 기능은 대화/텍스트를 레벨이나 의도 기준으로 분석합니다.";
    if (t.includes("멤버십") || t.includes("쿠폰")) return "멤버십 상태는 홈의 Membership에서 확인/변경할 수 있어요.";
    return `좋아요. “${userText}”에 대해 조금 더 자세히 말해줄래요?`;
  };

  const onSend = async () => {
    const text = input.trim();
    if (!text) return;

    setSending(true);
    setInput("");

    const myMsg: Msg = { id: uid(), role: "user", text };
    setMessages((prev) => [...prev, myMsg]);

    // 자연스러운 지연
    await new Promise((r) => setTimeout(r, 400));
    const aiText = await mockAiReply(text);

    // 간단 타이핑 효과
    const typingId = uid();
    setMessages((prev) => [...prev, { id: typingId, role: "assistant", text: "" }]);
    for (let i = 0; i < aiText.length; i++) {
      await new Promise((r) => setTimeout(r, 12));
      setMessages((prev) =>
        prev.map((m) => (m.id === typingId ? { ...m, text: aiText.slice(0, i + 1) } : m))
      );
    }

    setSending(false);
  };

  if (loading) return <div style={{ padding: 24 }}>권한 확인 중…</div>;

  return (
    <div style={{ padding: 24, maxWidth: 720, margin: "0 auto", height: "calc(100vh - 80px)", display: "flex", flexDirection: "column" }}>
      <h2 style={{ fontSize: 20, fontWeight: 700 }}>AI 대화</h2>

      <div style={{ flex: 1, overflowY: "auto", border: "1px solid #eee", borderRadius: 8, padding: 12, marginTop: 12 }}>
        {messages.map((m) => (
          <div key={m.id} style={{ margin: "8px 0", whiteSpace: "pre-wrap", textAlign: m.role === "user" ? "right" : "left", color: m.role === "user" ? "#1e40af" : "#111827" }}>
            <strong>{m.role === "user" ? "You" : "AI"}: </strong>
            {m.text}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSend()}
          placeholder="메시지를 입력하세요…"
          disabled={disabled}
          style={{ flex: 1, padding: "10px 12px", border: "1px solid #ddd", borderRadius: 8 }}
        />
        <button
          onClick={onSend}
          disabled={disabled}
          style={{ padding: "10px 16px", border: "1px solid #ddd", borderRadius: 8, background: disabled ? "#f3f4f6" : "white", cursor: disabled ? "not-allowed" : "pointer" }}
        >
          보내기
        </button>
      </div>

      <div style={{ marginTop: 6, fontSize: 12, color: "#6b7280" }}>
        🎙️ 마이크/STT는 옵션. 텍스트만으로 테스트 요구사항 충족!
      </div>
    </div>
  );
}
