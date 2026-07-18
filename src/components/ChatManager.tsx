import React, { useState, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { X, Minus, MessageSquare, Send } from "lucide-react";
import { Avatar } from "./post-card";

type ChatWindow = {
  id: string; // other user id
  username: string;
  display_name: string;
  avatar_url: string | null;
  minimized: boolean;
  x: number;
  y: number;
};

export function ChatManager({
  userId,
  currentUsername,
}: {
  userId: string;
  currentUsername?: string;
}) {
  const qc = useQueryClient();
  const [windows, setWindows] = useState<ChatWindow[]>([]);
  const [chatBoxOpen, setChatBoxOpen] = useState(false);

  const { data: onlineFriends = [] } = useQuery({
    queryKey: ["online-friends-chat", userId],
    queryFn: async () => {
      const { data } = await supabase
        .from("friendships")
        .select(
          "requester_id, addressee_id, requester:profiles!friendships_requester_id_fkey(id, username, display_name, avatar_url), addressee:profiles!friendships_addressee_id_fkey(id, username, display_name, avatar_url)",
        )
        .eq("status", "accepted")
        .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`);
      return (data ?? []).map((r) =>
        r.requester_id === userId ? r.addressee : r.requester,
      ) as unknown as Array<{
        id: string;
        username: string;
        display_name: string;
        avatar_url: string | null;
      }>;
    },
    enabled: !!userId,
  });

  const openChat = (friend: {
    id: string;
    username: string;
    display_name: string;
    avatar_url: string | null;
  }) => {
    if (!windows.find((w) => w.id === friend.id)) {
      const offset = windows.length * 40;
      setWindows([
        ...windows,
        {
          ...friend,
          minimized: false,
          x: window.innerWidth - 300 - offset,
          y: window.innerHeight - 400 - offset,
        },
      ]);
    } else {
      setWindows(windows.map((w) => (w.id === friend.id ? { ...w, minimized: false } : w)));
    }
  };

  const closeChat = (id: string) => {
    setWindows(windows.filter((w) => w.id !== id));
  };

  const toggleMinimize = (id: string) => {
    setWindows(windows.map((w) => (w.id === id ? { ...w, minimized: !w.minimized } : w)));
  };

  const updatePosition = (id: string, x: number, y: number) => {
    setWindows(windows.map((w) => (w.id === id ? { ...w, x, y } : w)));
  };

  return (
    <>
      {/* Floating Chat Box (Tuenti classic style in bottom right) */}
      <div className="fixed bottom-0 right-10 z-50 flex flex-col items-end">
        {chatBoxOpen && (
          <div className="bg-card w-64 rounded-t-xl ring-1 ring-border shadow-[0_-4px_6px_rgba(0,0,0,0.1)] flex flex-col overflow-hidden animate-in slide-in-from-bottom-5">
            <div
              className="bg-[#2F5FA7] text-white p-2 font-bold text-sm cursor-pointer flex justify-between items-center"
              onClick={() => setChatBoxOpen(false)}
            >
              <span>Chat ({onlineFriends.length})</span>
              <Minus className="size-4" />
            </div>
            <div className="p-2 border-b border-border">
              <input
                type="text"
                placeholder="Buscar..."
                className="w-full bg-secondary rounded px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-[#2F5FA7]"
              />
            </div>
            <div className="flex-1 max-h-64 overflow-y-auto no-scrollbar p-1">
              {onlineFriends.map((f) => (
                <div
                  key={f.id}
                  onClick={() => openChat(f)}
                  className="flex items-center gap-2 p-1.5 hover:bg-secondary rounded cursor-pointer transition-colors"
                >
                  <div className="relative">
                    <Avatar profile={f} size={24} />
                    <span className="absolute bottom-0 right-0 size-2 bg-online rounded-full ring-1 ring-card" />
                  </div>
                  <span className="text-xs truncate flex-1">{f.display_name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {!chatBoxOpen && (
          <div
            onClick={() => setChatBoxOpen(true)}
            className="bg-[#2F5FA7] text-white px-4 py-2 rounded-t-xl font-bold text-sm cursor-pointer flex items-center gap-2 shadow-[0_-2px_4px_rgba(0,0,0,0.1)] hover:bg-[#264d87] transition-colors"
          >
            <MessageSquare className="size-4" /> Chat ({onlineFriends.length})
          </div>
        )}
      </div>

      {/* Floating Individual Chat Windows */}
      {windows.map((w) => (
        <ChatWindow
          key={w.id}
          windowData={w}
          currentUserId={userId}
          onClose={() => closeChat(w.id)}
          onToggleMinimize={() => toggleMinimize(w.id)}
          onUpdatePosition={updatePosition}
        />
      ))}
    </>
  );
}

function ChatWindow({
  windowData,
  currentUserId,
  onClose,
  onToggleMinimize,
  onUpdatePosition,
}: {
  windowData: ChatWindow;
  currentUserId: string;
  onClose: () => void;
  onToggleMinimize: () => void;
  onUpdatePosition: (id: string, x: number, y: number) => void;
}) {
  const qc = useQueryClient();
  const [text, setText] = useState("");
  const dragRef = useRef<{
    isDragging: boolean;
    startX: number;
    startY: number;
    initialX: number;
    initialY: number;
  }>({ isDragging: false, startX: 0, startY: 0, initialX: 0, initialY: 0 });

  const { data: messages = [] } = useQuery({
    queryKey: ["chat-messages", currentUserId, windowData.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .or(
          `and(sender_id.eq.${currentUserId},recipient_id.eq.${windowData.id}),and(sender_id.eq.${windowData.id},recipient_id.eq.${currentUserId})`,
        )
        .order("created_at", { ascending: true })
        .limit(50);
      return data ?? [];
    },
    refetchInterval: 3000, // Poll for simplicity in this mockup, though realtime is better
  });

  const send = async () => {
    if (!text.trim()) return;
    const t = text;
    setText("");
    await supabase
      .from("messages")
      .insert({ sender_id: currentUserId, recipient_id: windowData.id, content: t });
    qc.invalidateQueries({ queryKey: ["chat-messages", currentUserId, windowData.id] });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    dragRef.current = {
      isDragging: true,
      startX: e.clientX,
      startY: e.clientY,
      initialX: windowData.x,
      initialY: windowData.y,
    };
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!dragRef.current.isDragging) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    onUpdatePosition(windowData.id, dragRef.current.initialX + dx, dragRef.current.initialY + dy);
  };

  const handleMouseUp = () => {
    dragRef.current.isDragging = false;
  };

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [windowData.id, windowData.x, windowData.y]); // Depend on current state so handlers closure is fresh

  return (
    <div
      className={`fixed z-[60] bg-card ring-1 ring-border shadow-xl flex flex-col overflow-hidden ${windowData.minimized ? "rounded-t-lg h-8" : "rounded-lg h-80"}`}
      style={{ width: 280, left: windowData.x, top: windowData.y }}
    >
      {/* Header (Draggable) */}
      <div
        className="bg-[#2F5FA7] text-white p-2 flex justify-between items-center cursor-move"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-2 font-bold text-[13px]">
          <div className="size-2 rounded-full bg-online" />
          {windowData.display_name}
        </div>
        <div className="flex gap-1.5 items-center">
          <button onClick={onToggleMinimize} className="hover:bg-white/20 p-0.5 rounded">
            <Minus className="size-3" />
          </button>
          <button onClick={onClose} className="hover:bg-white/20 p-0.5 rounded">
            <X className="size-3" />
          </button>
        </div>
      </div>

      {/* Body */}
      {!windowData.minimized && (
        <>
          <div className="flex-1 overflow-y-auto p-2 space-y-2 bg-secondary/20 flex flex-col">
            {messages.length === 0 && (
              <p className="text-xs text-muted-foreground text-center italic mt-auto pb-2">
                Escribe un mensaje...
              </p>
            )}
            {messages.map((m) => {
              const isMe = m.sender_id === currentUserId;
              return (
                <div key={m.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-lg px-2.5 py-1.5 text-[13px] ${isMe ? "bg-[#e5edf7] text-foreground" : "bg-white ring-1 ring-border text-foreground"}`}
                  >
                    {m.content}
                  </div>
                </div>
              );
            })}
          </div>
          {/* Input */}
          <div className="p-2 border-t border-border bg-card">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send();
              }}
              className="flex gap-2"
            >
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Escribe algo..."
                className="flex-1 bg-secondary rounded-full px-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-[#2F5FA7]"
              />
              <button
                type="submit"
                disabled={!text.trim()}
                className="text-[#2F5FA7] disabled:opacity-50"
              >
                <Send className="size-4" />
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
