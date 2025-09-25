// src/App.tsx
import { useEffect, useState } from "react";
import "./App.css";
import { api } from "./lib/api";

type Ping = { ok: boolean; time: string };
type Note = {
  id: number;
  title: string;
  body: string;
  created_at: string;
  updated_at: string;
};

export default function App() {
  const [ping, setPing] = useState<Ping | null>(null);

  const [notes, setNotes] = useState<Note[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 생성 폼
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // 편집 폼
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  // 진입 시 핑
  useEffect(() => {
    api<Ping>("/api/v1/ping")
      .then(setPing)
      .catch((e) => setError(e.message ?? String(e)));
  }, []);

  // 목록
  const loadNotes = async () => {
    try {
      setLoadingNotes(true);
      const data = await api<Note[]>("/api/v1/notes");
      setNotes(data);
      setError(null);
    } catch (e: any) {
      setError(e.message ?? String(e));
    } finally {
      setLoadingNotes(false);
    }
  };

  // 생성
  async function createNote(e?: React.FormEvent) {
    e?.preventDefault();
    setCreating(true);
    setCreateError(null);
    try {
      const created = await api<Note>("/api/v1/notes", {
        method: "POST",
        body: JSON.stringify({ note: { title, body } }),
      });
      setTitle("");
      setBody("");
      // 낙관적 갱신
      setNotes((prev) => [created, ...prev]);
    } catch (e: any) {
      setCreateError(e.message ?? String(e));
    } finally {
      setCreating(false);
    }
  }

  // 삭제
  async function deleteNote(id: number) {
    if (!confirm("정말 삭제할까요?")) return;
    try {
      await api(`/api/v1/notes/${id}`, { method: "DELETE" });
      setNotes((prev) => prev.filter((n) => n.id !== id));
    } catch (e: any) {
      setError(e.message ?? String(e));
    }
  }

  // 편집 시작/취소/저장
  function startEdit(n: Note) {
    setEditingId(n.id);
    setEditTitle(n.title);
    setEditBody(n.body);
    setUpdateError(null);
  }
  function cancelEdit() {
    setEditingId(null);
    setEditTitle("");
    setEditBody("");
    setUpdateError(null);
  }
  async function saveEdit() {
    if (editingId == null) return;
    try {
      setUpdating(true);
      setUpdateError(null);
      const updated = await api<Note>(`/api/v1/notes/${editingId}`, {
        method: "PATCH",
        body: JSON.stringify({ note: { title: editTitle, body: editBody } }),
      });
      setNotes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
      cancelEdit();
    } catch (e: any) {
      setUpdateError(e.message ?? String(e));
    } finally {
      setUpdating(false);
    }
  }

  return (
    <div style={{ padding: 24, fontFamily: "system-ui, sans-serif" }}>
      <h1>Ringle Frontend</h1>
      <p style={{ opacity: 0.7 }}>API_BASE: {import.meta.env.VITE_API_BASE_URL}</p>

      <section>
        <h2>Ping</h2>
        {ping ? <pre>{JSON.stringify(ping, null, 2)}</pre> : <p>Loading…</p>}
      </section>

      <section>
        <h2>Notes</h2>

        <button onClick={loadNotes} disabled={loadingNotes}>
          {loadingNotes ? "Loading..." : "Load notes"}
        </button>

        {/* 생성 폼 */}
        <form
          onSubmit={createNote}
          style={{ marginTop: 12, display: "grid", gap: 8, maxWidth: 420 }}
        >
          <input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            placeholder="Body"
            rows={4}
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
          <div>
            <button type="submit" disabled={creating || !title.trim()}>
              {creating ? "Saving..." : "Create note"}
            </button>
          </div>
          {createError && <p style={{ color: "crimson" }}>Create error: {createError}</p>}
        </form>

        {/* 목록 + 편집/삭제 */}
        {notes.length ? (
          <ul style={{ marginTop: 12, paddingLeft: 0, listStyle: "none" }}>
            {notes.map((n) => (
              <li
                key={n.id}
                style={{
                  margin: "10px 0",
                  display: "flex",
                  gap: 10,
                  alignItems: "start",
                }}
              >
                {editingId === n.id ? (
                  <div style={{ flex: 1, display: "grid", gap: 6 }}>
                    <input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder="Title"
                    />
                    <textarea
                      rows={3}
                      value={editBody}
                      onChange={(e) => setEditBody(e.target.value)}
                      placeholder="Body"
                    />
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={saveEdit} disabled={updating || !editTitle.trim()}>
                        {updating ? "Saving..." : "Save"}
                      </button>
                      <button onClick={cancelEdit} disabled={updating}>
                        Cancel
                      </button>
                    </div>
                    {updateError && (
                      <p style={{ color: "crimson" }}>Update error: {updateError}</p>
                    )}
                  </div>
                ) : (
                  <>
                    <div style={{ flex: 1 }}>
                      <strong>{n.title}</strong> — {n.body}
                    </div>
                    <button onClick={() => startEdit(n)}>Edit</button>
                    <button onClick={() => deleteNote(n.id)}>Delete</button>
                  </>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <pre style={{ marginTop: 12 }}>[]</pre>
        )}
      </section>

      {error && (
        <p style={{ color: "crimson" }}>
          <strong>Error:</strong> {error}
        </p>
      )}
    </div>
  );
}
