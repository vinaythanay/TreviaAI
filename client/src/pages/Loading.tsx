import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
export default function Loading() {
  const { fetchUser } = useApp();
  const nav = useNavigate();
  useEffect(() => { const t = setTimeout(async () => { await fetchUser(); nav('/'); }, 2000); return () => clearTimeout(t); }, []);
  return <div className="text-slate-300">Verifying payment...</div>;
}
