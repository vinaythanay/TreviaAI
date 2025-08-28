import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import toast from 'react-hot-toast';

export default function Community() {
  const { axios } = useApp();
  const [images, setImages] = useState<{id:string;url:string;prompt:string;userName:string}[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchImages() {
    try {
      const { data } = await axios.get('/api/user/published-images');
      if (data.success) setImages(data.images);
      else toast.error(data.message);
    } catch (e:any) { toast.error(e.message); }
    finally { setLoading(false); }
  }
  useEffect(()=>{ fetchImages(); }, []);
  if (loading) return <div>Loading...</div>;
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Community Images</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.map(img => (
          <div key={img.id} className="bg-slate-900 rounded-xl p-2">
            <img src={img.url} alt={img.prompt} className="rounded-lg" />
            <div className="mt-2 text-sm text-slate-300 truncate" title={img.prompt}>{img.prompt}</div>
            <div className="text-xs text-slate-500">by {img.userName}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
