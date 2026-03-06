"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface CartItem {
    id: number;
    name: string;
    price: number;
    image: string;
    quantity: number;
}

interface CartContextType {
    cart: CartItem[];
    addToCart: (product: { id: number; name: string; price: string | number; image: string }, quantity: number) => void;
    removeFromCart: (productId: number) => void;
    updateQuantity: (productId: number, quantity: number) => void;
    clearCart: () => void;
    totalItems: number;
    totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [cart, setCart] = useState<CartItem[]>(() => {
        if (typeof window !== "undefined") {
            const savedCart = localStorage.getItem("dado_cart");
            if (savedCart) {
                try {
                    return JSON.parse(savedCart);
                } catch (e) {
                    console.error("Failed to parse cart from localStorage", e);
                }
            }
        }
        return [];
    });
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        setIsInitialized(true);
    }, []);

    // Save cart to Local Storage whenever it changes, but only after initialization
    useEffect(() => {
        if (isInitialized) {
            localStorage.setItem("dado_cart", JSON.stringify(cart));
        }
    }, [cart, isInitialized]);

    const addToCart = (product: { id: number; name: string; price: string | number; image: string }, quantity: number) => {
        setCart((prevCart: CartItem[]) => {
            const existingItem = prevCart.find((item: CartItem) => item.id === product.id);
            if (existingItem) {
                return prevCart.map((item: CartItem) =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }
            // Convert price string like "$1,199" to number 1199
            const numericPrice = typeof product.price === 'string'
                ? parseFloat(product.price.replace(/[$,]/g, ""))
                : product.price;

            return [...prevCart, { ...product, price: numericPrice, quantity }];
        });
    };

    const removeFromCart = (productId: number) => {
        setCart((prevCart: CartItem[]) => prevCart.filter((item: CartItem) => item.id !== productId));
    };

    const updateQuantity = (productId: number, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(productId);
            return;
        }
        setCart((prevCart: CartItem[]) =>
            prevCart.map((item: CartItem) =>
                item.id === productId ? { ...item, quantity } : item
            )
        );
    };

    const clearCart = () => setCart([]);

    const totalItems = cart.reduce((sum: number, item: CartItem) => sum + item.quantity, 0);
    const totalPrice = cart.reduce((sum: number, item: CartItem) => sum + item.price * item.quantity, 0);

    return (
        <CartContext.Provider
            value={{
                cart,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                totalItems,
                totalPrice,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
}
