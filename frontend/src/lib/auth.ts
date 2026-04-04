export interface User {
  id: string; name: string; email: string;
  twinProfile?: { communicationStyle:string; tone:string; preferences:string[]; habits:string[]; completionScore:number; };
  modelPreferences?: { preferredLLMModel:string; preferredRAGFramework:string; preferredEmbeddingModel:string; };
  simulationsCount?: number; chatSessionsCount?: number;
}
export const getToken = (): string | null => { if (typeof window==='undefined') return null; return localStorage.getItem('lifetwin_token'); };
export const getUser = (): User | null => { if (typeof window==='undefined') return null; try { const d=localStorage.getItem('lifetwin_user'); return d?JSON.parse(d):null; } catch { return null; } };
export const setAuth = (token: string, user: User): void => { localStorage.setItem('lifetwin_token',token); localStorage.setItem('lifetwin_user',JSON.stringify(user)); };
export const clearAuth = (): void => { localStorage.removeItem('lifetwin_token'); localStorage.removeItem('lifetwin_user'); };
export const isAuthenticated = (): boolean => !!getToken();
