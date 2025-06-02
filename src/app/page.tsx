'use client'
import { useRouter } from "next/navigation";
import Image from "next/image";

const Home = () => {
  const router = useRouter();

  const handleSelect = (role: "applicant" | "company") => {
    router.push(`/${role}/login`);
  };
  return (
    <div className="min-h-full h-80 max-h-screen flex items-center justify-center  dark:bg-crowblack px-6">
      <div className="w-full max-w-xl p-10 bg-white dark:bg-gray-900 rounded-xl shadow-xl max-h-[90vh] overflow-auto">
        <h1 className="text-2xl md:text-3xl font-semibold text-crowblack dark:text-white mb-6">
          Welcome to openprofile
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-10">
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