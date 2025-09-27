// ringle-frontend/src/components/MembershipsPanel.tsx
import { useEffect, useState, useCallback } from "react";
import {
  purchaseMembership,
  grantMembership,
  revokeMembership,
  fetchAllMembershipData,
} from "../lib/api";
import type { CanChatResponse } from "../lib/api";

export default function MembershipsPanel() {
  const [email, setEmail] = useState("demo@ringle.test");
  const [membershipId, setMembershipId] = useState<number>(2);
  const [all, setAll] = useState<any[]>([]);
  const [me, setMe] = useState<CanChatResponse | null>(null);
  const [loading, setLoading] = useState(false);

  /** 전체/내 멤버십 + canChat을 한 번에 갱신 */
  const refreshAll = useCallback(async () => {
    setLoading(true);
    try {
    
      // 별칭으로 받아 혼동 방지
      const { all: allResp, me: meResp } = await fetchAllMembershipData(email);
      // 최신 스키마(title/duration_days/features) 기준으로 정리 + 이름 없는 더미 제거
      const normalizedAll = (allResp as any[])
        .map((m) => ({
          id: m.id,
          title: m.title ?? m.name ?? null,
          durationDays: m.duration_days ?? m.days ?? null,
          features: Array.isArray(m.features) ? m.features : [],
        }))
        .filter((m) => !!m.title);

      setAll(normalizedAll);
      setMe(meResp as CanChatResponse);
    } catch (e) {
      console.error("[MembershipsPanel.refreshAll] failed:", e);
    } finally {
      setLoading(false);
    }
  }, [email]);

  useEffect(() => {
    // 첫 렌더 시 자동 로드
    refreshAll();
  }, [refreshAll]);

  async function onPurchase() {
    setLoading(true);
    try {
      await purchaseMembership(email, membershipId);
      await refreshAll();
    } finally {
      setLoading(false);
    }
  }

  async function onGrant() {
    setLoading(true);
    try {
      await grantMembership(email, membershipId);
      await refreshAll();
    } finally {
      setLoading(false);
    }
  }

  async function onRevoke(user_membership_id: number) {
    setLoading(true);
    try {
      await revokeMembership(email, user_membership_id);
      await refreshAll();
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
          style={{ width: 120 }}
          placeholder="membership id"
          type="number"
        />
        <button onClick={onPurchase} disabled={loading}>Purchase</button>
        <button onClick={onGrant} disabled={loading}>Grant</button>
        <button onClick={refreshAll} disabled={loading}>Refresh</button>
      </div>

      <p style={{ color: "#888", marginTop: 4 }}>
        구매/지급/회수 후 자동으로 “All/Mine/CanChat”을 한 번에 재조회합니다.
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
          me.memberships.map((m: any, idx: number) => {
            const title = m.title ?? m.name ?? `#${m.id}`;
            const expires = m.expiresAt ?? m.endsOn ?? m.ends_on ?? "-";
            const feats = Array.isArray(m.features) ? m.features : [];
            return (
              <div
                key={(m.id ?? idx) + "-" + idx}
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
                    <strong>{title}</strong> — until <code>{String(expires)}</code>
                  </div>
                  <div style={{ fontSize: 12, color: "#666" }}>
                    features: {feats.join(", ") || "—"}
                  </div>
                </div>
                {/* 필요 시 회수 버튼 예시:
                <button onClick={() => onRevoke(m.id)} disabled={loading}>Revoke</button> */}
              </div>
            );
          })
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
