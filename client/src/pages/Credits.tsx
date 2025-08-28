import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import toast from 'react-hot-toast';

type Plan = { id:string; name:string; price:number; credits:number };

export default function Credits() {
  const { axios, token } = useApp();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchPlans() {
    try {
      const { data } = await axios.get('/api/credit/plan', { headers:{ authorization: token || '' } });
      if (data.success) setPlans(data.plans);
      else toast.error(data.message || 'Failed to fetch plans');
    } catch (e:any) { toast.error(e.message); }
    finally { setLoading(false); }
  }

  async function purchase(planId:string) {
    try {
      const { data } = await axios.post('/api/credit/purchase', { plan: planId }, { headers:{ authorization: token || '' } });
      if (data.success) window.location.href = data.url;
      else toast.error(data.message);
    } catch (e:any) { toast.error(e.message); }
  }

  useEffect(()=>{ fetchPlans(); }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Credits</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {plans.map(p => (
          <div key={p.id} className="bg-slate-900 rounded-2xl p-5 ring-1 ring-slate-800">
            <div className="text-xl font-semibold">{p.name}</div>
            <div className="text-3xl font-bold my-2">${p.price}</div>
            <div className="text-slate-400 mb-4">{p.credits} credits</div>
            <button onClick={()=>purchase(p.id)} className="w-full py-2 rounded-2xl font-semibold bg-gradient-to-r from-indigo-500 to-purple-500">Buy Now</button>
          </div>
        ))}
      </div>
    </div>
  );
}
