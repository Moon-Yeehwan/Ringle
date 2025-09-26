import { useEffect, useState } from "react";
import { listMemberships, purchaseMembership, grantMembership, revokeMembership, getCanChat } from "../lib/api";
import type { CanChatResponse } from "../lib/api";

export default function MembershipsPanel() {
  const [email, setEmail] = useState("demo@ringle.test");
  const [membershipId, setMembershipId] = useState<number>(2);
  const [all, setAll] = useState<any[]>([]);
  const [me, setMe] = useState<CanChatResponse | null>(null);
  const [loading, setLoading] = useState(false);

  async function refreshAll() {
    const ms = await listMemberships();
    // 백엔드 최신 스키마(title, duration_days, features)를 보여주도록 변환
    const normalized = (ms as any[]).map((m) => ({
      id: m.id,
      title: m.title ?? m.name ?? `#${m.id}`,
      durationDays: m.duration_days ?? m.days ?? null,
      features: m.features ?? [],
      raw: m,
    }));
    setAll(normalized);
  }

  async function refreshMe() {
    const r = await getCanChat();
    setMe(r);
  }

  useEffect(() => {
    (async () => {
      await refreshAll();
      await refreshMe();
    })();
  }, []);

  async function onPurchase() {
    setLoading(true);
    try {
      await purchaseMembership(email, membershipId);
      await refreshMe();
    } finally {
      setLoading(false);
    }
  }

  async function onGrant() {
    setLoading(true);
    try {
      await grantMembership(email, membershipId);
      await refreshMe();
    } finally {
      setLoading(false);
    }
  }

  async function onRevoke(user_membership_id: number) {
    setLoading(true);
    try {
      await revokeMembership(email, user_membership_id);
      await refreshMe();
    } finally {
      setLoading(false);
    }
  }

  return (
    <section style={{ maxWidth: 720, margin: "0 auto" }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ flex: 1 }}
          placeholder="email"
        />
        <input
          value={membershipId}
          onChange={(e) => setMembershipId(Number(e.target.value || 0))}
          style={{ width: 80 }}
          placeholder="membership id"
        />
        <button onClick={onPurchase} disabled={loading}>
          Purchase
        </button>
        <button onClick={onGrant} disabled={loading}>
          Grant
        </button>
        <button onClick={() => { refreshAll(); refreshMe(); }} disabled={loading}>
          Refresh
        </button>
      </div>

      <p style={{ color: "#888", marginTop: 4 }}>
        구매/지급 후 자동으로 “내 멤버십”과 “Can Chat”을 재조회합니다.
      </p>

      {/* All Memberships */}
      <h3 style={{ marginTop: 24, textAlign: "center" }}>All Memberships</h3>
      <pre style={{ background: "#fafafa", padding: 12, borderRadius: 8 }}>
        {JSON.stringify(all, null, 2)}
      </pre>

      {/* My Memberships + Can Chat */}
      <h3 style={{ marginTop: 24, textAlign: "center" }}>My Memberships</h3>
      <div style={{ background: "#fafafa", padding: 12, borderRadius: 8 }}>
        {me?.memberships?.length ? (
          me.memberships.map((m, idx) => (
            <div
              key={m.id + "-" + idx}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8px 0",
                borderBottom: "1px solid #eee",
              }}
            >
              <div>
                <div>
                  <strong>{m.title}</strong> — until{" "}
                  <code>{m.expiresAt}</code>
                </div>
                <div style={{ fontSize: 12, color: "#666" }}>
                  features: {m.features.join(", ") || "—"}
                </div>
              </div>
              {/* 회수 버튼: /users/revoke 는 user_membership_id 가 필요.
                  미션 데모에서는 id 확인 편의상 숨김 유지. 백엔드가 id를 내려주면 여기서 onRevoke(id) 호출 */}
            </div>
          ))
        ) : (
          <div style={{ color: "#666" }}>No active memberships.</div>
        )}
      </div>

      <h3 style={{ marginTop: 24, textAlign: "center" }}>Can Chat?</h3>
      <pre style={{ background: "#fafafa", padding: 12, borderRadius: 8 }}>
        {me ? JSON.stringify(me, null, 2) : "—"}
      </pre>
    </section>
  );
}
