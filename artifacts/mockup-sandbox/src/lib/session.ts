export interface UserSession {
  id: number;
  name: string;
  role: string;
  departmentId: number | null;
  studentProfileId: number | null;
}

export function getCurrentUser(): UserSession | null {
  const data = window.sessionStorage.getItem('elogbook-user');
  if (!data) return null;
  try {
    return JSON.parse(data) as UserSession;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  window.sessionStorage.removeItem('elogbook-user');
  window.sessionStorage.removeItem('elogbook-authenticated');
}
