"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Sparkles } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

import { useState, useEffect } from "react";

export function Header() {
    const { totalItems } = useCart();
    const { user, signOut } = useAuth();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <header className="sticky top-0 z-50 w-full bg-white/60 backdrop-blur-xl border-b border-orange-100/50 shadow-sm">
            <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-10 h-10 bg-[#F36F21] rounded-xl flex items-center justify-center shadow-lg shadow-orange-200 group-hover:rotate-12 transition-transform">
                        <span className="text-white font-black text-xl">D</span>
                    </div>
                    <span className="text-2xl font-[900] tracking-tight text-[#101828]">
                        DADO<span className="text-[#F36F21]">.</span>shop
                    </span>
                </Link>

                <nav className="hidden md:flex items-center gap-8">
                    <Link href="/" className="text-sm font-bold text-[#475467] hover:text-[#F36F21] transition-colors">Home</Link>
                    <Link href="/ai" className="text-sm font-bold text-[#475467] hover:text-[#F36F21] transition-colors flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-[#F36F21]" />
                        AI Helper
                    </Link>
                    {mounted && user && (
                        <Link href="/orders" className="text-sm font-bold text-[#475467] hover:text-[#F36F21] transition-colors">My Orders</Link>
                    )}
                </nav>

                <div className="flex items-center gap-4">
                    <Link href="/cart" className="relative p-2 text-[#475467] hover:text-[#F36F21] transition-colors">
                        <ShoppingCart className="w-6 h-6" />
                        {mounted && totalItems > 0 && (
                            <span className="absolute top-0 right-0 bg-[#F36F21] text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-md animate-in zoom-in duration-300">
                                {totalItems}
                            </span>
                        )}
                    </Link>

                    <div className="h-6 w-[1px] bg-orange-100 mx-2 hidden sm:block"></div>

                    <div className="flex items-center gap-2">
                        {mounted && (
                            user ? (
                                <div className="flex items-center gap-4">
                                    <span className="hidden lg:block text-sm font-semibold text-[#101828]">
                                        Hi, {user.user_metadata?.full_name || user.email}
                                    </span>
                                    <Button
                                        variant="ghost"
                                        onClick={() => signOut()}
                                        className="text-red-500 font-semibold hover:bg-red-50"
                                    >
                                        Log out
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    <Button variant="ghost" className="hidden sm:flex text-[#475467] font-semibold hover:bg-orange-50" asChild>
                                        <Link href="/login">Log in</Link>
                                    </Button>
                                    <Button className="bg-[#F36F21] hover:bg-[#d95d16] text-white font-bold px-6 rounded-xl shadow-lg shadow-orange-100 transition-all hover:translate-y-[-2px]" asChild>
                                        <Link href="/register">Join Us</Link>
                                    </Button>
                                </>
                            )
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
