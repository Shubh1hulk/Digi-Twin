const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const h = (token?: string|null) => { const headers: Record<string,string> = {'Content-Type':'application/json'}; if(token) headers['Authorization']=`Bearer ${token}`; return headers; };
const handle = async (res: Response) => { const d=await res.json(); if(!res.ok) throw new Error(d.message||'API Error'); return d; };
export const authAPI = {
  register: (name:string,email:string,password:string) => fetch(`${API_URL}/api/auth/register`,{method:'POST',headers:h(),body:JSON.stringify({name,email,password})}).then(handle),
  login: (email:string,password:string) => fetch(`${API_URL}/api/auth/login`,{method:'POST',headers:h(),body:JSON.stringify({email,password})}).then(handle),
  me: (token:string) => fetch(`${API_URL}/api/auth/me`,{headers:h(token)}).then(handle),
};
export const twinAPI = {
  getProfile: (token:string) => fetch(`${API_URL}/api/twin/profile`,{headers:h(token)}).then(handle),
  train: (token:string,messages:unknown[]) => fetch(`${API_URL}/api/twin/train`,{method:'POST',headers:h(token),body:JSON.stringify({messages})}).then(handle),
  quiz: (token:string,answers:Record<string,unknown>) => fetch(`${API_URL}/api/twin/quiz`,{method:'POST',headers:h(token),body:JSON.stringify({answers})}).then(handle),
};
export const simulatorAPI = {
  simulate: (token:string,decision:string) => fetch(`${API_URL}/api/simulator/simulate`,{method:'POST',headers:h(token),body:JSON.stringify({decision})}).then(handle),
  getHistory: (token:string) => fetch(`${API_URL}/api/simulator/history`,{headers:h(token)}).then(handle),
};
export const chatAPI = {
  sendMessage: (token:string,message:string,mode:string) => fetch(`${API_URL}/api/chat/message`,{method:'POST',headers:h(token),body:JSON.stringify({message,mode})}).then(handle),
  getHistory: (token:string) => fetch(`${API_URL}/api/chat/history`,{headers:h(token)}).then(handle),
};
