// ringle-frontend/src/lib/api.ts

/** API base: Vite env -> 기본 '/api' (Vite proxy 경유) */
const RAW_BASE =
  (import.meta.env.VITE_API_BASE as string | undefined) ??
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? // 과거 키 호환
  "/api";

/** 슬래시 정리 유틸 */
const trimSlash = (s: string) => s.replace(/\/+$/, "");
const ensureLeading = (s: string) => (s.startsWith("/") ? s : `/${s}`);

/** 프록시 베이스 */
const API_BASE = trimSlash(RAW_BASE);

/** 공통 JSON fetch (경로 보정 포함) */
export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  // 만약 실수로 '/api/...'가 들어오면 한 번 제거해서 '/v1/...'만 남기기
  const cleanedPath = path.replace(/^\/api(\/|$)/, "/");
  const url = `${API_BASE}${ensureLeading(cleanedPath)}`;

  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    ...init,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${res.status} ${res.statusText} ${text}`);
  }
  return (await res.json()) as T;
}

/* ===== 여기서부터 반드시 export ===== */

export type Membership = {
  id: number;
  name: string; // (구 UI 호환용 필드)
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
  return api<Membership[]>("/v1/memberships");
}

/** 특정 유저의 멤버십들 */
export async function getMemberships(email: string): Promise<UserMembership[]> {
  const q = encodeURIComponent(email);
  return api<UserMembership[]>(`/v1/users/memberships?email=${q}`);
}

/** 서버가 만료/권한을 판정 — /v1/me/can_chat */
export type CanChatMembershipItem = {
  id: number;
  title: string;
  expiresAt: string;
  features: string[];
};

export type CanChatResponse = {
  canChat: boolean;
  features: string[];
  memberships: CanChatMembershipItem[];
};

export function getCanChat() {
  return api<CanChatResponse>("/v1/me/can_chat");
}

/** (레거시 호환) canUserChat -> /me/can_chat 호출로 변경 */
export function canUserChat() {
  return getCanChat();
}

/** (결제 가정) 유저가 멤버십 구매 */
export async function purchaseMembership(email: string, membership_id: number) {
  const body = JSON.stringify({ membership_id });
  return api<{ ok: boolean; user_membership_id: number }>(
    `/v1/users/purchase?email=${encodeURIComponent(email)}`,
    { method: "POST", body }
  );
}

/** (어드민) 유저에게 멤버십 부여 */
export async function grantMembership(email: string, membership_id: number) {
  const body = JSON.stringify({ membership_id });
  return api<{ ok: boolean; user_membership_id: number }>(
    `/v1/users/grant?email=${encodeURIComponent(email)}`,
    { method: "POST", body }
  );
}

/** (어드민) 유저 멤버십 회수 */
export async function revokeMembership(email: string, user_membership_id: number) {
  const body = JSON.stringify({ user_membership_id });
  return api<{ ok: boolean }>(
    `/v1/users/revoke?email=${encodeURIComponent(email)}`,
    { method: "DELETE", body }
  );
}
