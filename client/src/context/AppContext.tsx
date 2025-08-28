import React, { createContext, useContext, useEffect, useState } from 'react';
import axiosBase, { AxiosInstance } from 'axios';
import toast from 'react-hot-toast';

type User = { id: string; name: string; email: string; credits: number } | null;
type Chat = { id: string; title: string; messages: any[]; createdAt: string };

type Ctx = {
  user: User;
  setUser: (u: User) => void;
  token: string | null;
  setToken: (t: string | null) => void;
  axios: AxiosInstance;
  chats: Chat[];
  setChats: React.Dispatch<React.SetStateAction<Chat[]>>;
  selectedChat: Chat | null;
  setSelectedChat: (c: Chat | null) => void;
  loadingUser: boolean;
  fetchUser: () => Promise<void>;
  fetchUsersChats: () => Promise<void>;
  createNewChat: () => Promise<void>;
};

const C = createContext<Ctx>(null as any);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token') || null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const axios = axiosBase.create({ baseURL: import.meta.env.VITE_SERVER_URL });

  async function fetchUser() {
    try {
      const { data } = await axios.get('/api/user/data', { headers: { authorization: token || '' } });
      if (data.success) setUser(data.user);
      else toast.error(data.message || 'Failed to load user');
    } catch {
      /* ignore */
    } finally {
      setLoadingUser(false);
    }
  }

  async function fetchUsersChats() {
  try {
    const { data } = await axios.get('/api/chat/get', { headers: { authorization: token || '' } });
    if (data.success) {
      setChats(data.chats);

      if (data.chats.length > 0) {
        setSelectedChat(data.chats[0]);
      } else {
        // Instead of awaiting, just call
        createNewChat();
      }
    } else {
      toast.error(data.message || 'Failed to load chats');
    }
  } catch (e: any) {
    toast.error(e.message);
  }
}


  async function createNewChat() {
    try {
      const { data } = await axios.post('/api/chat/create', {}, { headers: { authorization: token || '' } });
      if (data.success) {
        setChats(prev => [data.chat, ...prev]); // add new chat on top
        setSelectedChat(data.chat);  
        return data.chat;          
      } else {
        toast.error(data.message || 'Failed to create chat');
      }
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  useEffect(() => {
    if (token) {
      fetchUser();
      fetchUsersChats();
    } else {
      setUser(null);
      setLoadingUser(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) localStorage.setItem('token', token);
    else localStorage.removeItem('token');
  }, [token]);

  return (
    <C.Provider
      value={{
        user,
        setUser,
        token,
        setToken,
        axios,
        chats,
        setChats,
        selectedChat,
        setSelectedChat,
        loadingUser,
        fetchUser,
        fetchUsersChats,
        createNewChat,
      }}
    >
      {children}
    </C.Provider>
  );
};

export const useApp = () => useContext(C);
