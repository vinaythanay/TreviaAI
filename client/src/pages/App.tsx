import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Sidebar from '../components/Sidebar';
import ChatBox from './ChatBox';
import Login from './Login';
import Community from './Community';
import Credits from './Credits';
import Loading from './Loading';


import { useApp } from '../context/AppContext';

export default function App() {
  const { user, loadingUser } = useApp();
  if (!user || loadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
        <div className="text-center">
          <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-500">Trevia AI</div>
          <div className="mt-4">{loadingUser ? 'Loading...' : <Link to="/login" className="underline">Go to Login</Link>}</div>
        </div>
        <Toaster />
      </div>
    );
  }
  return (
    // Updated container: using h-screen and flex to fix height and prevent page-level scrolling.
    <div className="h-screen flex bg-slate-950 overflow-hidden">
      {/* Sidebar with a fixed width. Add overflow-y-auto if sidebar content can be long. */}
      <Sidebar />
      <main className="flex-1 p-4 flex flex-col overflow-y-auto">
        <Routes>
          <Route path="/" element={<ChatBox />} />
          <Route path="/chat/:id" element={<ChatBox />} />
          <Route path="/community" element={<Community />} />
          <Route path="/credits" element={<Credits />} />
          <Route path="/loading" element={<Loading />} />    
          
          <Route path="*" element={<Navigate to="/chat/new" />} />
        </Routes>
      </main>
      <Toaster />
    </div>
  );
}

export function PublicRoutes() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <Toaster />
    </div>
  );
}