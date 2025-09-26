// ringle-frontend/src/lib/api.ts

const API_BASE =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ?? "http://127.0.0.1:3000";

/** 공통 JSON fetch */
export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    ...init,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${res.status} ${res.statusText} ${text}`);
  }
  return (await res.json()) as T;
}

/* ===== 여기서부터 반드시 export 해줘야 콘솔/다른 파일에서 보임 ===== */

export type Membership = {
  id: number;
  name: string;
  days: number;
  can_learn: boolean;
  can_chat: boolean;
  can_analyze: boolean;
  created_at?: string;
  updated_at?: string;
};

export type UserMembership = {
  id: number;
  user_id: number;
  membership_id: number;
  starts_on: string;
  ends_on: string;
  created_at?: string;
  updated_at?: string;
};

/** 모든 멤버십 목록 */
export async function listMemberships(): Promise<Membership[]> {
  return api<Membership[]>("/api/v1/memberships");
}

/** 특정 유저의 멤버십들 */
export async function getMemberships(email: string): Promise<UserMembership[]> {
  const q = encodeURIComponent(email);
  return api<UserMembership[]>(`/api/v1/users/memberships?email=${q}`);
}

/** 특정 유저가 채팅 가능한지 여부 */
export async function canUserChat(email: string) {
  const q = encodeURIComponent(email);
  return api<{ can_chat: boolean }>(`/api/v1/users/can_chat?email=${q}`);
}

/** (결제 가정) 유저가 멤버십 구매 */
export async function purchaseMembership(email: string, membership_id: number) {
  const body = JSON.stringify({ membership_id });
  return api<{ ok: boolean; user_membership_id: number }>(
    `/api/v1/users/purchase?email=${encodeURIComponent(email)}`,
    { method: "POST", body }
  );
}

/** (어드민) 유저에게 멤버십 부여 */
export async function grantMembership(email: string, membership_id: number) {
  const body = JSON.stringify({ membership_id });
  return api<{ ok: boolean; user_membership_id: number }>(
    `/api/v1/users/grant?email=${encodeURIComponent(email)}`,
    { method: "POST", body }
  );
}

/** (어드민) 유저 멤버십 회수 */
export async function revokeMembership(email: string, user_membership_id: number) {
  const body = JSON.stringify({ user_membership_id });
  return api<{ ok: boolean }>(
    `/api/v1/users/revoke?email=${encodeURIComponent(email)}`,
    { method: "DELETE", body }
  );
}

/* (선택) 필요하면 default export는 아예 두지 않거나, 아래처럼 보조로만 사용
export default {
  api,
  listMemberships,
  getMemberships,
  canUserChat,
  purchaseMembership,
  grantMembership,
  revokeMembership,
};
*/
