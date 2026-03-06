"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, User, Send, Sparkles, RefreshCw, MessageCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

interface Message {
    role: "user" | "model";
    text: string;
}

export default function AIPage() {
    const [messages, setMessages] = useState<Message[]>([
        { role: "model", text: "Xin chào! Tôi là trợ lý AI của DADO Shop. Tôi có thể giúp bạn chọn điện thoại phù hợp hoặc trả lời các thông tin về sản phẩm. Bạn cần hỗ trợ gì không?" }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [mounted, setMounted] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const { user } = useAuth();

    useEffect(() => {
        setMounted(true);
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
            const formattedMessages = data.map((m: any) => ({
                role: m.role as "user" | "model",
                text: m.content
            }));
            // Giữ lời chào mặc định và thêm lịch sử
            setMessages([
                { role: "model", text: "Xin chào! Rất vui được gặp lại bạn. Chúng ta tiếp tục cuộc trò chuyện nhé!" },
                ...formattedMessages
            ]);
        }
    };

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    if (!mounted) return <div className="min-h-screen bg-[#FDFCFB]" />;

    const handleSendMessage = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = { role: "user" as const, text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            // Lưu tin nhắn người dùng vào DB nếu đã đăng nhập
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

                // Lưu phản hồi của AI vào DB nếu đã đăng nhập
                if (user) {
                    await supabase.from("chat_history").insert({
                        user_id: user.id,
                        role: "model",
                        content: aiText
                    });
                }
            }
        } catch (error) {
            setMessages(prev => [...prev, { role: "model", text: "Đã có lỗi xảy ra. Vui lòng thử lại sau." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FDFCFB] flex flex-col relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-orange-100 rounded-full blur-[120px] opacity-50 -z-10"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-sky-100 rounded-full blur-[100px] opacity-40 -z-10"></div>

            <Header />

            <main className="flex-grow flex flex-col items-center py-12 px-6 overflow-hidden">
                <div className="container max-w-4xl w-full flex flex-col h-[75vh] bg-white/70 backdrop-blur-xl border border-orange-100 rounded-[40px] shadow-2xl overflow-hidden shadow-orange-100">
                    {/* Chat Header */}
                    <div className="p-8 bg-gradient-to-r from-[#101828] to-[#1d2939] text-white flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-[#F36F21] to-[#ff8c42] rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                                <Bot className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-black tracking-tight">AI Assistant <span className="text-[#F36F21]">DADO</span></h1>
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                    <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Powered by Gemini 2.5 Flash</span>
                                </div>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setMessages([{ role: "model", text: "Xin chào! Tôi có thể giúp gì cho bạn?" }])}
                            className="text-white hover:bg-white/10 rounded-full"
                        >
                            <RefreshCw className="w-5 h-5 opacity-60" />
                        </Button>
                    </div>

                    {/* Messages Container */}
                    <div
                        ref={scrollRef}
                        className="flex-grow p-8 overflow-y-auto space-y-6 scroll-smooth scrollbar-thin scrollbar-thumb-orange-100"
                    >
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-5 duration-500`}
                            >
                                <div className={`flex gap-3 max-w-[85%] ${msg.role === "user" ? "flex-row-reverse text-right" : "flex-row text-left"}`}>
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${msg.role === "user" ? "bg-[#101828]" : "bg-orange-50"}`}>
                                        {msg.role === "user" ? <User className="w-5 h-5 text-white" /> : <Sparkles className="w-5 h-5 text-[#F36F21]" />}
                                    </div>
                                    <div className={`p-5 rounded-3xl ${msg.role === "user" ? "bg-[#F36F21] text-white rounded-tr-none font-medium" : "bg-[#F4F4F4] text-[#101828] rounded-tl-none font-medium border border-slate-100 shadow-sm"}`}>
                                        <div className="leading-relaxed prose prose-sm max-w-none prose-slate">
                                            <ReactMarkdown
                                                components={{
                                                    img: ({ node, ...props }) => (
                                                        <img {...props} className="rounded-xl my-4 border border-orange-100 shadow-sm max-w-full h-auto" alt={props.alt || "Product image"} />
                                                    ),
                                                    p: ({ node, ...props }) => <p {...props} className="mb-2 last:mb-0" />
                                                }}
                                            >
                                                {msg.text}
                                            </ReactMarkdown>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2">
                                <div className="flex gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center shadow-sm">
                                        <Bot className="w-5 h-5 text-[#F36F21]" />
                                    </div>
                                    <div className="px-6 py-4 bg-[#F4F4F4] rounded-3xl rounded-tl-none border border-slate-100 shadow-sm flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce"></div>
                                        <div className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                        <div className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input Area */}
                    <div className="p-8 border-t border-orange-50 bg-white/50">
                        <div className="relative flex items-center gap-4">
                            <div className="flex-grow group">
                                <Input
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                                    placeholder="Hỏi trợ lý DADO về bất cứ sản phẩm nào..."
                                    className="h-16 pl-6 pr-16 bg-white border-[#e4e7ec] rounded-2xl shadow-inner focus-visible:ring-[#F36F21] focus-visible:border-[#F36F21] transition-all text-lg font-medium"
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                    <Button
                                        onClick={handleSendMessage}
                                        disabled={!input.trim() || isLoading}
                                        className="w-10 h-10 bg-[#F36F21] hover:bg-black text-white rounded-xl flex items-center justify-center transition-all p-0"
                                    >
                                        <Send className="w-5 h-5" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                        <p className="mt-4 text-center text-xs text-[#98A2B3] font-bold uppercase tracking-widest">
                            Trợ lý AI có thể không hoàn toàn chính xác. Hãy kiểm tra lại thông tin.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
