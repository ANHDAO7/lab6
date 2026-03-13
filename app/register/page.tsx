"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

const registerSchema = z.object({
  fullname: z.string().min(1, "Full name is required"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type RegisterValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [status, setStatus] = useState<"idle" | "success" | "error" | "loading">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterValues) => {
    setStatus("loading");
    setErrorMessage("");

    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.fullname,
        },
      },
    });

    if (error) {
      let friendlyMessage = error.message;
      if (error.message === "email rate limit exceeded") {
        friendlyMessage = "Bạn đã yêu cầu đăng ký quá nhanh. Vui lòng đợi vài phút và thử lại.";
      } else if (error.message === "User already registered") {
        friendlyMessage = "Email này đã được đăng ký rồi. Bạn hãy dùng email khác hoặc Đăng nhập nhé.";
      }
      setErrorMessage(friendlyMessage);
      setStatus("error");
    } else {
      setStatus("success");
    }
  };

  const onError = () => {
    setStatus("error");
    setErrorMessage("Please fix the errors in the form.");
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-sky-400 via-white to-orange-400 relative overflow-hidden px-4 py-8">
      {/* Các khối màu trang trí nền */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-sky-300 rounded-full blur-[100px] opacity-70"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-orange-300 rounded-full blur-[100px] opacity-70"></div>

      {/* Container chính */}
      <div className="relative z-10 w-full max-w-[480px] bg-white/80 backdrop-blur-xl p-8 md:p-10 rounded-[32px] shadow-[0_25px_60px_rgba(0,0,0,0.1)] border border-white/50 flex flex-col items-center">
        <h1 className="text-4xl md:text-[42px] font-[900] text-transparent bg-clip-text bg-gradient-to-r from-[#F36F21] via-[#ff8c42] to-[#F36F21] mb-3 mt-4 text-center tracking-tighter leading-none">
          Create Account
        </h1>
        <p className="text-[#475467] mb-6 text-center text-sm font-medium">Join the FPT University community today</p>

        {/* ShadCN Alert for Status */}
        {status === "error" && (
          <Alert variant="destructive" className="mb-6 animate-in fade-in slide-in-from-top-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{errorMessage || "Please fix the errors in the form."}</AlertDescription>
          </Alert>
        )}

        {status === "loading" && (
          <div className="mb-6 flex items-center justify-center space-x-2 text-[#F36F21]">
            <div className="w-4 h-4 border-2 border-[#F36F21] border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm font-medium">Creating your account...</span>
          </div>
        )}

        {status === "success" && (
          <Alert className="mb-6 border-green-500 bg-green-50 text-green-700 animate-in fade-in slide-in-from-top-4">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>
              Account created successfully! 
              <br />
              <strong className="text-orange-600">Please check your email to confirm your account before logging in.</strong>
            </AlertDescription>
          </Alert>
        )}

        {/* Form Đăng ký */}
        <form onSubmit={handleSubmit(onSubmit, onError)} className="w-full space-y-5">
          <div className="space-y-2">
            <Label htmlFor="fullname" className="text-sm font-semibold text-[#344054]">Full name</Label>
            <Input
              id="fullname"
              placeholder="Enter your full name"
              {...register("fullname")}
              className={`h-12 border-[#d0d5dd] rounded-xl focus-visible:ring-[#F36F21] focus-visible:border-[#F36F21] transition-all bg-white/70 ${errors.fullname ? "border-red-500" : ""}`}
            />
            {errors.fullname && <p className="text-red-500 text-xs mt-1">{errors.fullname.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-semibold text-[#344054]">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter email address"
              {...register("email")}
              className={`h-12 border-[#d0d5dd] rounded-xl focus-visible:ring-[#F36F21] focus-visible:border-[#F36F21] transition-all bg-white/70 ${errors.email ? "border-red-500" : ""}`}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-semibold text-[#344054]">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter password"
              {...register("password")}
              className={`h-12 border-[#d0d5dd] rounded-xl focus-visible:ring-[#F36F21] focus-visible:border-[#F36F21] transition-all bg-white/70 ${errors.password ? "border-red-500" : ""}`}
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>

          <Button
            type="submit"
            disabled={status === "loading"}
            className="w-full h-12 bg-[#F36F21] hover:bg-[#d95d16] text-white font-bold rounded-xl mt-4 shadow-xl shadow-orange-200 transition-all duration-300 transform hover:translate-y-[-2px] active:translate-y-[0px] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === "loading" ? "Registering..." : "Register"}
          </Button>
        </form>

        <div className="mt-8 text-center text-sm text-[#475467]">
          Already have an account?{" "}
          <Link href="/login" className="text-[#F36F21] font-bold hover:underline transition-all">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}