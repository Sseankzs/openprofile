"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";


const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ApplicantSignup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { data: signUpData, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role: "applicant" },
      },
    });

    if (error) {
      alert("Error signing up: " + error.message);
      return;
    }

    const userId = signUpData.user?.id;

    if (!userId) {
      alert("User not created properly.");
      return;
    }


    router.push("/applicant/dashboard");
  };


  return (
    <div className="max-w-md mx-auto p-6 bg-softwhite rounded shadow">
      <h2 className="text-xl font-bold mb-4 font-mono">Applicant Signup</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
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
            Sign Up
          </button>
          <p className="text-sm text-gray-500">
            <a href="/applicant/login" className="text-fireopal hover:text-crowblack font-mono">
              Already have an account?
            </a>
          </p>
        </div>
      </form>
    </div>
  );
}
