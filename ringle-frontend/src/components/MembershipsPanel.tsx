// ringle-frontend/src/components/MembershipsPanel.tsx
import { useEffect, useState } from "react";
import type { Membership } from "../lib/api";
import {
  listMemberships,
  getMemberships,
  canUserChat,
  purchaseMembership,
  grantMembership,
  revokeMembership,
} from "../lib/api";

type MyMembership = {
  id: number;
  name: string;
  ends_on: string;
  active: boolean;
  features: { learn: boolean; chat: boolean; analyze: boolean };
  // 회수 버튼 표시에 사용 (없으면 버튼 숨김)
  user_membership_id?: number;
};

export default function MembershipsPanel() {
  const [allMemberships, setAllMemberships] = useState<Membership[]>([]);
  const [myMemberships, setMyMemberships] = useState<MyMembership[]>([]);
  const [canChat, setCanChat] = useState<boolean | null>(null);

  // 빠른 액션 입력
  const [email, setEmail] = useState("demo@ringle.test");
  const [membershipId, setMembershipId] = useState<number>(2);

  // 상태
  const [loading, setLoading] = useState(false);
  const [doing, setDoing] = useState<null | "purchase" | "grant" | "revoke">(null);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const [all, mine, chat] = await Promise.all([
        listMemberships(),
        getMemberships(email),
        canUserChat(email),
      ]);
      setAllMemberships(all);
      setMyMemberships(mine as MyMembership[]);
      setCanChat(chat.can_chat);
    } catch (err: any) {
      setError(err?.message ?? String(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function doPurchase() {
    try {
      setDoing("purchase");
      setError(null);
      await purchaseMembership(email, membershipId);
      await refresh();
    } catch (err: any) {
      setError(err?.message ?? String(err));
    } finally {
      setDoing(null);
    }
  }

  async function doGrant() {
    try {
      setDoing("grant");
      setError(null);
      await grantMembership(email, membershipId);
      await refresh();
    } catch (err: any) {
      setError(err?.message ?? String(err));
    } finally {
      setDoing(null);
    }
  }

  async function doRevoke(userMembershipId: number) {
    try {
      setDoing("revoke");
      setError(null);
      await revokeMembership(email, userMembershipId);
      await refresh();
    } catch (err: any) {
      setError(err?.message ?? String(err));
    } finally {
      setDoing(null);
    }
  }

  return (
    <div>
      <h2>Memberships Panel</h2>

      {/* 빠른 액션 영역 */}
      <div
        style={{
          margin: "12px 0 20px",
          padding: 12,
          border: "1px solid #e1e1e1",
          borderRadius: 8,
          display: "grid",
          gap: 8,
          alignItems: "center",
          maxWidth: 560,
        }}
      >
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email"
            style={{ minWidth: 260 }}
          />
          <input
            type="number"
            value={membershipId}
            onChange={(e) => setMembershipId(Number(e.target.value))}
            placeholder="membership_id"
            style={{ width: 160 }}
          />
          <button onClick={doPurchase} disabled={!!doing}>
            {doing === "purchase" ? "Purchasing..." : "Purchase"}
          </button>
          <button onClick={doGrant} disabled={!!doing}>
            {doing === "grant" ? "Granting..." : "Grant"}
          </button>
          <button onClick={refresh} disabled={loading || !!doing}>
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
        <small style={{ opacity: 0.7 }}>
          구매/지급 후 자동으로 “내 멤버십”과 “Can Chat”을 재조회합니다.
        </small>
      </div>

      {error && (
        <p style={{ color: "crimson" }}>
          <strong>Error:</strong> {error}
        </p>
      )}

      <h3>All Memberships</h3>
      <pre>{JSON.stringify(allMemberships, null, 2)}</pre>

      <h3>My Memberships</h3>
      {!myMemberships.length ? (
        <pre>[]</pre>
      ) : (
        <ul style={{ paddingLeft: 0, listStyle: "none", display: "grid", gap: 8 }}>
          {myMemberships.map((m) => (
            <li
              key={`${m.id}-${m.ends_on}`}
              style={{
                border: "1px solid #eee",
                borderRadius: 8,
                padding: 10,
                display: "grid",
                gap: 6,
              }}
            >
              <div>
                <strong>{m.name}</strong> — until {m.ends_on}{" "}
                {m.active ? "(active)" : "(inactive)"}
              </div>
              <pre style={{ margin: 0 }}>{JSON.stringify(m.features, null, 2)}</pre>

              {typeof m.user_membership_id === "number" ? (
                <div>
                  <button
                    onClick={() => doRevoke(m.user_membership_id!)}
                    disabled={!!doing}
                  >
                    {doing === "revoke" ? "Revoking..." : "Revoke"}
                  </button>
                </div>
              ) : (
                <small style={{ opacity: 0.6 }}>
                  (Note) 이 항목에는 <code>user_membership_id</code> 가 없어 회수 버튼을
                  숨겼습니다.
                </small>
              )}
            </li>
          ))}
        </ul>
      )}

      <h3>Can Chat?</h3>
      <pre>{JSON.stringify(canChat)}</pre>
    </div>
  );
}
