'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function CompanySignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { 
        data: { 
          role: 'company' 
        } 
      },
    });

    if (error) {
      setError(error.message);
    } else {
      router.push('/dashboard/company');
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-softwhite rounded shadow font-mono">
      <h2 className="text-2xl font-bold mb-6 text-left text-gray-800 dark:text-white">
        Company Sign Up
      </h2>
      <form onSubmit={handleSignup} className="space-y-4">
        <input
          type="email"
          placeholder="Company Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white"
        />
        <div className="flex items-center justify-start space-x-6 mb-2">
          <button
            type="submit"
            className="bg-fireopal text-white px-4 py-2 rounded hover:bg-crowblack font-mono"
          >
            Sign Up
          </button>
          <p className="text-sm text-gray-500">
            <a href="/company/login" className="text-fireopal hover:text-crowblack font-mono">
              Already have an account?
            </a>
          </p>
        </div>
      </form>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

    </div>
  );
}
