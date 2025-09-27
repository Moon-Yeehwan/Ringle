// ringle-frontend/src/components/MembershipsPanel.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  api, // generic fetch helper: api<T>(path, init?)
  fetchAllMembershipData, // { all, me } 한 번에
  purchaseMembership,
  grantMembership,
  revokeMembership,
} from "../lib/api";

/** ----- Types ----- */
type AllMembership = {
  id: number;
  title: string;
  durationDays: number | null;
  features: string[];
};

type MyMembership = {
  id: number; // user_membership_id로 사용
  title: string | null;
  duration_days: number | null;
  created_at: string;
  updated_at: string;
  features: string[];
};

export default function MembershipsPanel() {
  /** ----- State ----- */
  const [email, setEmail] = useState("demo@ringle.test");
  const [membershipId, setMembershipId] = useState<number>(2);

  const [ping, setPing] = useState<{ ok: boolean; time: string } | null>(null);
  const [all, setAll] = useState<AllMembership[]>([]);
  const [mine, setMine] = useState<MyMembership[]>([]);
  const [canChat, setCanChat] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  // Notes
  const [notes, setNotes] = useState<any[]>([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteBody, setNoteBody] = useState("");

  const apiBase = import.meta.env.VITE_API_BASE || "/api";

  /** ----- Styles ----- */
  const styles = useMemo(
    () => ({
      wrap: {
        width: "100%", // 루트(#root)가 폭 제한하므로 가득 사용
        margin: "40px auto 80px",
        padding: 0,
        fontFamily:
          "system-ui, -apple-system, Segoe UI, Roboto, Noto Sans KR, sans-serif",
      } as React.CSSProperties,

      h1: {
        fontSize: 48,
        fontWeight: 800,
        textAlign: "center",
        marginBottom: 8,
      } as React.CSSProperties,
      sub: {
        textAlign: "center",
        color: "#64748b",
        marginBottom: 24,
      } as React.CSSProperties,

      section: { marginTop: 28 } as React.CSSProperties,
      sectionTitle: {
        fontSize: 20,
        fontWeight: 800,
        marginBottom: 10,
        textAlign: "center",
      } as React.CSSProperties,

      card: {
        border: "1px solid #e2e8f0",
        borderRadius: 16,
        padding: 16,
        background: "white",
      } as React.CSSProperties,

      row: {
        display: "flex",
        gap: 12,
        flexWrap: "wrap",
        alignItems: "center",
      } as React.CSSProperties,

      input: {
        height: 36,
        padding: "0 10px",
        border: "1px solid #e2e8f0",
        borderRadius: 10,
      } as React.CSSProperties,

      textArea: {
        padding: "10px",
        border: "1px solid #e2e8f0",
        borderRadius: 10,
        resize: "none",
      } as React.CSSProperties,

      btn: {
        height: 36,
        padding: "0 14px",
        borderRadius: 10,
        border: "1px solid #e2e8f0",
        background: "white",
        cursor: "pointer",
      } as React.CSSProperties,

      btnPrimary: {
        height: 36,
        padding: "0 14px",
        borderRadius: 10,
        background: "#111827",
        color: "white",
        border: "1px solid #111827",
        cursor: "pointer",
        textDecoration: "none",
        lineHeight: "36px",
      } as React.CSSProperties,

      table: {
        width: "100%",
        borderCollapse: "separate",
        borderSpacing: 0,
      } as React.CSSProperties,
      th: {
        textAlign: "left",
        padding: "10px 12px",
        background: "#f8fafc",
        fontWeight: 700,
      } as React.CSSProperties,
      td: { padding: "10px 12px", borderTop: "1px solid #f1f5f9" } as React.CSSProperties,

      badge: {
        display: "inline-block",
        padding: "2px 8px",
        borderRadius: 999,
        border: "1px solid #e2e8f0",
        marginRight: 6,
        fontSize: 12,
      } as React.CSSProperties,

      pillTrue: {
        padding: "4px 10px",
        borderRadius: 999,
        background: "#16a34a",
        color: "white",
        fontWeight: 700,
      } as React.CSSProperties,
      pillFalse: {
        padding: "4px 10px",
        borderRadius: 999,
        background: "#ef4444",
        color: "white",
        fontWeight: 700,
      } as React.CSSProperties,

      tiny: { fontSize: 12, color: "#64748b" } as React.CSSProperties,
    }),
    []
  );

  /** ----- Loaders ----- */
  async function loadPing() {
    try {
      const p = await api<{ ok: boolean; time: string }>("/api/v1/ping");
      setPing(p);
    } catch {
      setPing({ ok: false, time: new Date().toISOString() });
    }
  }

  async function refreshAllMineCan() {
    setLoading(true);
    try {
      // 백엔드에 맞춘 기존 통합 API 사용
      const { all: allResp, me: meResp } = await fetchAllMembershipData(email);

      // All memberships 정규화
      const normalizedAll: AllMembership[] = (allResp as any[]).map((m: any) => ({
        id: m.id,
        title: m.title ?? m.name ?? `#${m.id}`,
        durationDays: m.durationDays ?? m.duration_days ?? m.days ?? null,
        features: Array.isArray(m.features) ? m.features : [],
      })).filter((m) => !!m.title);

      setAll(normalizedAll);

      // My memberships
      const mineList = Array.isArray((meResp as any)?.memberships)
        ? ((meResp as any).memberships as MyMembership[])
        : [];
      setMine(mineList);

      // Can Chat
      const can =
        (meResp as any)?.canChat ??
        (meResp as any)?.can_chat ??
        null;
      setCanChat(can);
    } catch (e) {
      console.error("[MembershipsPanel.refreshAllMineCan] failed:", e);
    } finally {
      setLoading(false);
    }
  }

  /** ----- Actions ----- */
  async function onPurchase() {
    setLoading(true);
    try {
      await purchaseMembership(email, membershipId);
      await refreshAllMineCan();
    } finally {
      setLoading(false);
    }
  }

  async function onGrant() {
    setLoading(true);
    try {
      await grantMembership(email, membershipId);
      await refreshAllMineCan();
    } finally {
      setLoading(false);
    }
  }

  async function onRevoke(user_membership_id: number) {
    setLoading(true);
    try {
      await revokeMembership(email, user_membership_id);
      await refreshAllMineCan();
    } finally {
      setLoading(false);
    }
  }

  /** ----- Notes ----- */
  async function loadNotes() {
    setNotesLoading(true);
    try {
      const list = await api<any[]>("/api/v1/notes");
      setNotes(Array.isArray(list) ? list : []);
    } finally {
      setNotesLoading(false);
    }
  }

  async function createNote() {
    if (!noteTitle.trim() || !noteBody.trim()) return;
    setNotesLoading(true);
    try {
      await api("/api/v1/notes", {
        method: "POST",
        body: JSON.stringify({ note: { title: noteTitle, body: noteBody } }),
      });
      setNoteTitle("");
      setNoteBody("");
      await loadNotes();
    } finally {
      setNotesLoading(false);
    }
  }

  /** ----- Effects ----- */
  useEffect(() => {
    loadPing();
    refreshAllMineCan();
  }, [email]);

  /** ----- UI ----- */
  return (
    <div style={styles.wrap}>
      <h1 style={styles.h1}>Ringle Frontend</h1>
      <div style={styles.sub}>
        API_BASE: <code>{apiBase}</code>
      </div>

      {/* Ping */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>Ping</div>
        <div style={styles.card}>
          {ping ? (
            <div style={styles.row}>
              <span style={ping.ok ? styles.pillTrue : styles.pillFalse}>
                {ping.ok ? "OK" : "NG"}
              </span>
              <span style={styles.tiny}>
                {new Date(ping.time).toLocaleString()}
              </span>
            </div>
          ) : (
            <span style={styles.tiny}>Loading...</span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div style={styles.section}>
        <div style={styles.card}>
          <div style={{ ...styles.row, marginBottom: 8 }}>
            <input
              style={{ ...styles.input, flex: 1 }}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email"
            />
            <input
              style={{ ...styles.input, width: 120 }}
              value={membershipId}
              onChange={(e) => setMembershipId(Number(e.target.value || 0))}
              placeholder="membership id"
              type="number"
              min={1}
            />
            <button style={styles.btn} onClick={onPurchase} disabled={loading}>
              Purchase
            </button>
            <button style={styles.btn} onClick={onGrant} disabled={loading}>
              Grant
            </button>
            <button
              style={styles.btn}
              onClick={refreshAllMineCan}
              disabled={loading}
            >
              Refresh
            </button>
            <a href="/chat" style={styles.btnPrimary}>
              대화 페이지로 이동
            </a>
          </div>
          <div style={styles.row}>
            <span style={styles.tiny}>
              구매/지급/회수 후 자동으로 “All/Mine/CanChat”을 갱신합니다.
            </span>
          </div>
        </div>
      </div>

      {/* All Memberships */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>All Memberships</div>
        <div style={styles.card}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>ID</th>
                <th style={styles.th}>Title</th>
                <th style={styles.th}>Duration (days)</th>
                <th style={styles.th}>Features</th>
              </tr>
            </thead>
            <tbody>
              {all.map((m) => (
                <tr key={m.id}>
                  <td style={styles.td}>{m.id}</td>
                  <td style={styles.td}>{m.title}</td>
                  <td style={styles.td}>{m.durationDays ?? "—"}</td>
                  <td style={styles.td}>
                    {m.features.map((f) => (
                      <span key={f} style={styles.badge}>
                        {f}
                      </span>
                    ))}
                  </td>
                </tr>
              ))}
              {all.length === 0 && (
                <tr>
                  <td style={styles.td} colSpan={4}>
                    No data
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* My Memberships */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>My Memberships</div>
        <div style={{ display: "grid", gap: 12 }}>
          {mine.map((m) => (
            <div key={m.id} style={styles.card}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ fontWeight: 800 }}>{m.title ?? "—"}</div>
                  <div style={styles.tiny}>
                    created: {new Date(m.created_at).toLocaleString()} · duration:{" "}
                    {m.duration_days ?? "—"}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {m.features?.map((f) => (
                    <span key={f} style={styles.badge}>
                      {f}
                    </span>
                  ))}
                  <button
                    style={styles.btn}
                    onClick={() => onRevoke(m.id)}
                    disabled={loading}
                  >
                    Revoke
                  </button>
                </div>
              </div>
            </div>
          ))}
          {mine.length === 0 && (
            <div style={styles.tiny}>No memberships</div>
          )}
        </div>
      </div>

      {/* Can Chat */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>Can Chat?</div>
        <div style={styles.card}>
          {canChat === null ? (
            <span style={styles.tiny}>Loading...</span>
          ) : canChat ? (
            <span style={styles.pillTrue}>Can Chat: TRUE</span>
          ) : (
            <span style={styles.pillFalse}>Can Chat: FALSE</span>
          )}
        </div>
      </div>

      {/* Notes */}
      <div style={{ ...styles.section, textAlign: "center" }}>
        <div style={styles.sectionTitle}>Notes</div>
        <div style={styles.card}>
          <button style={styles.btn} onClick={loadNotes} disabled={notesLoading}>
            {notesLoading ? "Loading..." : "Load notes"}
          </button>

          <div
            style={{
              marginTop: 16,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
            }}
          >
            <input
              type="text"
              placeholder="Title"
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              style={{ ...styles.input, width: "60%" }}
            />
            <textarea
              placeholder="Body"
              rows={3}
              value={noteBody}
              onChange={(e) => setNoteBody(e.target.value)}
              style={{ ...styles.textArea, width: "60%", height: 100 }}
            />
            <button
              style={styles.btnPrimary}
              onClick={createNote}
              disabled={notesLoading || !noteTitle.trim() || !noteBody.trim()}
            >
              Create note
            </button>
          </div>

          <div style={{ marginTop: 16, textAlign: "left" }}>
            {notes?.length ? (
              notes.map((n: any) => (
                <div
                  key={n.id ?? n.title}
                  style={{ borderTop: "1px solid #f1f5f9", padding: "10px 0" }}
                >
                  <div style={{ fontWeight: 700 }}>
                    {n.title ?? "(no title)"}
                  </div>
                  <div style={styles.tiny}>
                    {n.created_at
                      ? new Date(n.created_at).toLocaleString()
                      : ""}
                  </div>
                  <div style={{ whiteSpace: "pre-wrap", marginTop: 4 }}>
                    {n.body ?? ""}
                  </div>
                </div>
              ))
            ) : (
              <div style={styles.tiny}>[]</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
