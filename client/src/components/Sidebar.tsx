import { useNavigate, NavLink } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import toast from 'react-hot-toast';

export default function Sidebar() {
  const { user, token, setToken, chats, setChats, selectedChat, setSelectedChat, fetchUsersChats, axios } = useApp();
  const nav = useNavigate();

  function logout() {
    localStorage.removeItem('token');
    setToken(null);
    toast.success('Logged out successfully');
    nav('/login');
  }
   async function createNewChat() {
    try {
      const { data } = await axios.post('/api/chat/create', {}, { headers: { authorization: token || '' } });
      if (data.success) {
        const newChat = data.chat;
        setChats((prev) => [newChat, ...prev]);
        setSelectedChat(newChat);
        nav(`/chat/${newChat.id}`);
      } else {
        toast.error(data.message);
      }
    } catch (e: any) {
      toast.error(e.message);
    }
  }



    async function deleteChat(e:React.MouseEvent, chatId:string) {
    e.stopPropagation();
    // Using a custom modal is better than confirm() for an iframe environment.
    if (!confirm('Delete this chat?')) return;
    try {
      const { data } = await axios.post('/api/chat/delete', { chatId }, { headers: { authorization: token || '' } });
      if (data.success) { 
        setChats(prev => prev.filter(c => c.id !== chatId)); 
        if (selectedChat?.id === chatId) setSelectedChat(null); 
        await fetchUsersChats(); 
        toast.success(data.message); 
      } else {
        toast.error(data.message);
      }
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  return (
    <aside className="h-screen w-[280px] bg-slate-900/60 backdrop-blur p-4 border-r border-slate-800">
      <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-500 mb-4">Trevia AI</div>
      <button onClick={createNewChat} className="w-full py-2 px-4 rounded-2xl font-semibold bg-gradient-to-r from-indigo-500 to-purple-500 hover:opacity-90 transition">Start Conversation</button>
      <div className="mt-6 text-slate-400 text-xs uppercase tracking-widest">Chat History</div>
     <div className="mt-2 space-y-2 max-h-[55vh] overflow-y-auto pr-1">
  {(chats ?? []).filter(c => c && c.id).map((c) => (
  <div
    key={c.id}
    onClick={() => {
      setSelectedChat(c);
      nav(`/chat/${c.id}`);
    }}
    className={
      "group flex items-center justify-between gap-2 px-3 py-2 rounded-xl cursor-pointer " +
      (selectedChat?.id === c.id
        ? "bg-slate-800 ring-2 ring-indigo-500/40"
        : "hover:bg-slate-800/60")
    }
  >
    <div className="truncate">{c.title || "Untitled Chat"}</div>
    <button
      onClick={(e) => deleteChat(e, c.id)}
      className="opacity-0 group-hover:opacity-100 text-xs text-slate-400 hover:text-pink-400"
    >
      Delete
    </button>
  </div>
))}

</div>

      <nav className="mt-6 space-y-2">
        <NavLink to="/community" className="block px-3 py-2 rounded-xl hover:bg-slate-800/60">Community</NavLink>
        <NavLink to="/credits" className="block px-3 py-2 rounded-xl hover:bg-slate-800/60">Credits</NavLink>
      </nav>
      <div className="absolute bottom-4 left-4 right-4">
        <div className="text-sm mb-2">Signed in as <span className="font-semibold">{user?.name}</span></div>
        <div className="flex items-center justify-between">
          <div className="text-slate-400 text-sm">Credits: <span className="text-slate-100 font-semibold">{user?.credits ?? 0}</span></div>
          <button onClick={logout} className="text-sm text-slate-300 hover:text-pink-400">Log out</button>
        </div>
      </div>
    </aside>
  );
}