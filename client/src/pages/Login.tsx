import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useApp } from '../context/AppContext';

export default function Login() {
  const { axios, setToken } = useApp();
  const [mode, setMode] = useState<'login'|'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const nav = useNavigate();

  async function handleSubmit(e:React.FormEvent) {
    e.preventDefault();
    try {
      const url = mode === 'login' ? '/api/user/login' : '/api/user/register';
      const { data } = await axios.post(url, { name, email, password });
      if (data.success) { setToken(data.token); nav('/'); }
      else toast.error(data.message || 'Failed');
    } catch (e:any) { toast.error(e.message); }
  }

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6">
      <div className="w-full max-w-md bg-slate-900/60 backdrop-blur rounded-2xl p-6 shadow-xl">
        <div className="text-center text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-500 mb-6">Trevia AI</div>
        <form onSubmit={handleSubmit} className="space-y-3">
          {mode==='signup' && (<input value={name} onChange={e=>setName(e.target.value)} placeholder="Your name" className="w-full px-4 py-2 bg-slate-800 rounded-xl outline-none" />)}
          <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" className="w-full px-4 py-2 bg-slate-800 rounded-xl outline-none" />
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" className="w-full px-4 py-2 bg-slate-800 rounded-xl outline-none" />
          <button className="w-full py-2 rounded-2xl font-semibold bg-gradient-to-r from-indigo-500 to-purple-500 hover:opacity-90 transition">{mode==='login'?'Sign In':'Create Account'}</button>
        </form>
        <div className="text-center mt-4 text-sm">
          {mode==='login' ? (<>No account? <button onClick={()=>setMode('signup')} className="text-indigo-400 underline">Sign up</button></>) : (<>Have an account? <button onClick={()=>setMode('login')} className="text-indigo-400 underline">Log in</button></>)}
        </div>
      </div>
    </div>
  );
}
