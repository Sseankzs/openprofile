"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import router from "next/router";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ApplicantLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert("Login failed: " + error.message);
    } else {
      alert("Login successful!");
      router.push("/applicant/dashboard"); // Redirect to applicant dashboard after successful login
      // You can redirect here if needed
      // router.push("/dashboard");
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-softwhite rounded shadow">
      <h2 className="text-xl font-bold mb-4 font-mono">Applicant Login</h2>
      <form onSubmit={handleLogin} className="space-y-4">
        <input
          type="email"
          name="email"
          placeholder="Email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded-md font-mono"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded-md font-mono"
        />

        <div className="flex items-center justify-start space-x-6 mb-2">
          <button
            type="submit"
            className="bg-fireopal text-white px-4 py-2 rounded hover:bg-crowblack font-mono"
          >
            Log In
          </button>
          <p className="text-sm text-gray-500">
            <a href="/applicant/signup" className="text-fireopal hover:underline hover:text-crowblack font-mono">
              Don’t have an account?
            </a>
          </p>
        </div>
      </form>
    </div>
  );
}
