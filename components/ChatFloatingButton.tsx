"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, X, Send, Bot, Sparkles, User, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

interface Message {
    role: "user" | "model";
    text: string;
}

export function ChatFloatingButton() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: "model", text: "Xin chào! Tôi là trợ lý DADO. Tôi có thể giúp gì cho bạn?" }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const { user } = useAuth();

    useEffect(() => {
        if (user) {
            fetchChatHistory();
        }
    }, [user]);

    const fetchChatHistory = async () => {
        const { data, error } = await supabase
            .from("chat_history")
            .select("role, content")
            .eq("user_id", user?.id)
            .order("created_at", { ascending: true });

        if (!error && data && data.length > 0) {
            setMessages([
                { role: "model", text: "Chào mừng bạn quay lại! Tôi đây để hỗ trợ bạn." },
                ...data.map((m: any) => ({ role: m.role as "user" | "model", text: m.content }))
            ]);
        }
    };

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    const handleSendMessage = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = { role: "user" as const, text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            // Lưu tin nhắn người dùng
            if (user) {
                await supabase.from("chat_history").insert({
                    user_id: user.id,
                    role: "user",
                    content: input
                });
            }

            const history = messages.map(m => ({
                role: m.role,
                parts: [{ text: m.text }]
            }));

            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: input, history })
            });

            const data = await response.json();

            if (data.error) {
                setMessages(prev => [...prev, { role: "model", text: "Lỗi: " + data.error }]);
            } else {
                const aiText = data.text;
                setMessages(prev => [...prev, { role: "model", text: aiText }]);

                // Lưu phản hồi của AI
                if (user) {
                    await supabase.from("chat_history").insert({
                        user_id: user.id,
                        role: "model",
                        content: aiText
                    });
                }
            }
        } catch (error) {
            setMessages(prev => [...prev, { role: "model", text: "Đã có lỗi xảy ra." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
            {/* Chat Window */}
            {isOpen && (
                <div className="mb-4 w-[350px] sm:w-[400px] h-[500px] bg-white rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-orange-100 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-300">
                    {/* Header */}
                    <div className="p-5 bg-[#101828] text-white flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#F36F21] rounded-xl flex items-center justify-center">
                                <Bot className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-black text-sm tracking-tight text-white leading-tight">DADO AI Assistant</h3>
                                <p className="text-[10px] text-orange-400 font-bold uppercase tracking-wider">Online</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5 opacity-60" />
                        </button>
                    </div>

                    {/* Messages */}
                    <div
                        ref={scrollRef}
                        className="flex-grow p-4 overflow-y-auto space-y-4 bg-[#FDFCFB]"
                    >
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                            >
                                <div className={`max-w-[85%] p-4 rounded-2xl text-sm font-medium ${msg.role === "user"
                                    ? "bg-[#101828] text-white rounded-tr-none"
                                    : "bg-white border border-orange-50 text-[#101828] rounded-tl-none shadow-sm"
                                    }`}>
                                    <ReactMarkdown
                                        components={{
                                            img: ({ node, ...props }) => <img {...props} className="rounded-xl my-2 max-w-full h-auto border border-orange-50" />,
                                            p: ({ node, ...props }) => <p {...props} className="mb-1 last:mb-0" />
                                        }}
                                    >
                                        {msg.text}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white border border-orange-50 p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1.5">
                                    <Loader2 className="w-4 h-4 text-[#F36F21] animate-spin" />
                                    <span className="text-xs text-[#475467] font-bold">AI đang trả lời...</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input */}
                    <div className="p-4 border-t border-orange-50 bg-white">
                        <div className="flex gap-2">
                            <Input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                                placeholder="Bạn cần hỏi gì..."
                                className="border-orange-100 rounded-xl focus-visible:ring-[#F36F21]"
                            />
                            <Button
                                onClick={handleSendMessage}
                                disabled={!input.trim() || isLoading}
                                size="icon"
                                className="bg-[#101828] hover:bg-[#F36F21] rounded-xl flex-shrink-0"
                            >
                                <Send className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Floating Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-16 h-16 rounded-2xl shadow-2xl flex items-center justify-center transition-all duration-300 transform hover:scale-110 active:scale-95 ${isOpen
                    ? "bg-[#101828] rotate-90"
                    : "bg-[#F36F21] hover:shadow-orange-200"
                    }`}
            >
                {isOpen ? (
                    <X className="w-8 h-8 text-white" />
                ) : (
                    <div className="relative">
                        <MessageCircle className="w-8 h-8 text-white" />
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse"></span>
                    </div>
                )}
            </button>
        </div>
    );
}
