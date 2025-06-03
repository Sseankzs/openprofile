'use client'
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const Home = () => {


  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();


      const role = session?.user?.user_metadata?.role;
      if (!session || !role) {
        // If no session or role, redirect to the home page
        router.push('/');
        return;
      }
      /*

      if (role === 'company') {
        router.push('/company/dashboard');
      } else if (role === 'applicant') {
        router.push('/applicant/dashboard');
      }
      */
    };

    checkSession();
  }, [router]);

  const handleSelect = (role: "applicant" | "company") => {
    router.push(`/${role}/login`);
  };

  return (
    <div className="min-h-full h-80 max-h-lvh flex items-center justify-center dark:bg-crowblack px-6 font-mono" >
      <div className="w-full max-w-xl p-10 bg-whitechocolate dark:bg-crowblack rounded-xl shadow-xl h-[45vh] overflow-auto">
        <h1 className="text-2xl md:text-3xl font-semibold text-fireopal dark:text-whitechocolate mb-6">
          Welcome to openprofile
        </h1>
        <p className="text-gray-600 dark:whitechocolate mb-10">
          Are you looking for a job or posting a job?
        </p>

        <div className="flex flex-col md:flex-row gap-6 justify-center">
          <button
            onClick={() => handleSelect("applicant")}
            className="w-full md:w-1/2 bg-fireopal hover:bg-crowblack text-white font-semibold py-3 px-6 rounded-lg transition"
          >
            I'm looking for a job
          </button>

          <button
            onClick={() => handleSelect("company")}
            className="w-full md:w-1/2 bg-gray-800 hover:bg-gray-900 text-white font-semibold py-3 px-6 rounded-lg transition"
          >
            I'm hiring
          </button>
        </div>
      </div>
    </div>
  )
}

export default Home