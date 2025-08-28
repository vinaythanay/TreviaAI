import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";  // ✅ add this
import toast from "react-hot-toast";
import { useApp } from "../context/AppContext";
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import { coldarkDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function ChatBox() {
  const {
    user,
    selectedChat,
    setSelectedChat,
    chats,
    setChats,
    axios,
    token,
    setUser,
  } = useApp();

  const { id } = useParams(); // ✅ get chatId from URL

  const [mode, setMode] = useState<"text" | "image">("text");
  const [prompt, setPrompt] = useState("");
  const [publish, setPublish] = useState(false);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  

  // ✅ Select chat whenever URL changes
  useEffect(() => {
  if (!selectedChat && id) {
    const chat = chats.find((c) => c.id === id) || null;
    if (chat) setSelectedChat(chat);
  }
}, [id, chats, selectedChat, setSelectedChat]);


  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedChat]);

  useEffect(() => {
    const el = document.getElementById("chat-scroll");
    if (el) el.scrollTop = el.scrollHeight;
  });

  async function handleStartConversation() {
    if (!user) {
      toast.error("Login to start a conversation");
      return;
    }
    try {
      const { data } = await axios.post(
        "/api/chat/create",
        {},
        { headers: { authorization: token || "" } }
      );
      if (data.success) {
        setChats((prevChats) => [...prevChats, data.chat]);
        setSelectedChat(data.chat);
      } else {
        toast.error(data.message);
      }
    } catch (e: any) {
      toast.error(e.message);
    }
  }


 async function onSubmit(e: React.FormEvent) {
  e.preventDefault();
  if (!user) {
    toast.error("Login to send message");
    return;
  }
  if (!selectedChat) {
    toast.error("Select or create a chat");
    return;
  }

  setLoading(true);
  const promptCopy = prompt;
  setPrompt("");

  const updated = chats.map((c) =>
    c.id === selectedChat.id
      ? {
          ...c,
          messages: [
            ...c.messages,
            {
              role: "user",
              content: promptCopy,
              isImage: false,
              timestamp: Date.now(),
            },
          ],
        }
      : c
  );

  setChats(updated);

  try {
    const { data } = await axios.post(
      `/api/message/${mode}`,
      { chatId: selectedChat.id, prompt: promptCopy, isPublished: publish },
      { headers: { authorization: token || "" } }
    );

    // 👇 Debug log
    console.log("Chat response:", data);

    if (data.success) {
      const newChats = updated.map((c) =>
        c.id === selectedChat.id
          ? {
              ...c,
              messages: [...c.messages, data.reply],
              title:
                c.title === "New Chat"
                  ? promptCopy.slice(0, 40) || "New Chat"
                  : c.title,
            }
          : c
      );
      setChats(newChats);
      setSelectedChat(newChats.find((c) => c.id === selectedChat.id) || null);
      if (user) {
        const updatedUser = {
          ...user,
          credits: user.credits - (mode === "image" ? 2 : 1),
        };
        setUser(updatedUser);
      }
    } else {
      toast.error(data.message);
      setPrompt(promptCopy);
    }
  } catch (e: any) {
    toast.error(e.message);
    setPrompt(promptCopy);
  } finally {
    setLoading(false);
  }
}


  const customComponents: Components = {
    h1: ({ node, ...props }) => (
      <h1 className="text-2xl font-bold text-indigo-400 mb-2" {...props} />
    ),
    h2: ({ node, ...props }) => (
      <h2 className="text-xl font-semibold text-indigo-300 mt-3 mb-1" {...props} />
    ),
    h3: ({ node, ...props }) => (
      <h3 className="text-lg font-medium text-indigo-200 mt-2" {...props} />
    ),
    ul: ({ node, ...props }) => (
      <ul className="list-disc list-inside space-y-1 text-slate-200" {...props} />
    ),
    ol: ({ node, ...props }) => (
      <ol className="list-decimal list-inside space-y-1 text-slate-200" {...props} />
    ),
    li: ({ node, ...props }) => <li className="ml-2" {...props} />,
    table: ({ node, ...props }) => (
      <div className="overflow-x-auto my-3">
        <table
          className="min-w-full border border-slate-700 text-slate-200 text-sm"
          {...props}
        />
      </div>
    ),
    th: ({ node, ...props }) => (
      <th
        className="border border-slate-600 bg-slate-700 px-3 py-2 text-left font-semibold"
        {...props}
      />
    ),
    td: ({ node, ...props }) => (
      <td className="border border-slate-600 px-3 py-2" {...props} />
    ),
    code: ({ className, children, ...props }) => {
      const match = /language-(\w+)/.exec(className || "");
      return match ? (
        <SyntaxHighlighter
          language={match[1]}
          style={coldarkDark}
          PreTag="div"
          showLineNumbers
        >
          {String(children).replace(/\n$/, "")}
        </SyntaxHighlighter>
      ) : (
        <code className="bg-slate-900 px-1 rounded text-pink-400" {...props}>
          {children}
        </code>
      );
    },
  };

  return (
    <div className="relative w-full h-full flex flex-col flex-1">
      {/* Watermark */}
      <img
        src="/image.png"
        alt="Trevia AI"
        className={`absolute inset-0 m-auto w-1/3 pointer-events-none select-none z-0 ${
          selectedChat ? "opacity-45" : "opacity-0"
        }`}
      />

      {/* Welcome screen */}
      {!selectedChat ? (
        <div className="relative flex-1 flex flex-col items-center justify-center z-10 text-center space-y-6">
          {/* Logo */}
          <img
            src="/image.png"
            alt="Trevia AI Logo"
            className="w-24 h-24 object-contain opacity-90"
          />

          <h1 className="text-3xl font-bold text-indigo-400">
            Welcome to Trevia AI 👋
          </h1>
          <p className="text-slate-400 max-w-md">
            Start a conversation by clicking{" "}
            <span
              className="font-bold cursor-pointer text-indigo-300 hover:underline"
              onClick={handleStartConversation}
            >
              Start Conversation
            </span>{" "}
            or type a prompt below.
          </p>
        </div>
      ) : (
        <>
          {/* Messages */}
          <div
            id="chat-scroll"
            className="relative flex-1 overflow-y-auto space-y-4 p-2 z-10"
          >
            {selectedChat.messages.map((m, idx) => (
              <div
                key={idx}
                className={
                  "max-w-4xl w-fit " + (m.role === "user" ? "ml-auto" : "")
                }
              >
                <div
                  className={
                    "px-4 py-3 rounded-2xl " +
                    (m.role === "user" ? "bg-indigo-600" : "bg-slate-800")
                  }
                >
                  {m.isImage ? (
                    <img
                      src={m.imageUrl}
                      alt="generated"
                      className="rounded-xl max-w-full"
                    />
                  ) : m.role === "assistant" ? (
                    <div className="prose prose-invert max-w-none">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={customComponents}
                      >
                        {m.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <pre className="whitespace-pre-wrap text-slate-100">
                      {m.content}
                    </pre>
                  )}
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {loading && (
              <div className="flex items-center gap-2 text-slate-400 animate-pulse">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150" />
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-300" />
              </div>
            )}

            <div ref={scrollRef} />
          </div>
        </>
      )}

      {/* Input form */}
      <form
        onSubmit={onSubmit}
        className="relative z-10 mt-2 flex items-center gap-2"
      >
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value as "text" | "image")}
          className="bg-slate-800 rounded-xl px-3 py-2"
        >
          <option value="text">Text</option>
          <option value="image">Image</option>
        </select>
        {mode === "image" && (
          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={publish}
              onChange={(e) => setPublish(e.target.checked)}
            />
            Publish to community
          </label>
        )}
        <input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Type your question here..."
          className="flex-1 px-4 py-2 bg-slate-800 rounded-2xl outline-none"
        />
        <button
          disabled={loading}
          className="px-4 py-2 rounded-2xl font-semibold bg-gradient-to-r from-indigo-500 to-purple-500 disabled:opacity-50"
        >
          {loading ? "..." : "Send"}
        </button>
      </form>
    </div>
  );
}
