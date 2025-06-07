'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import SplashScreen from '@/app/components/splashscreen';

type JobWithCompany = {
  id: string;
  title: string;
  location: string;
  description: string;
  job_type?: string; 
  company_profiles: {
    company_name?: string;
    logo_url?: string;
  } | null;
};

type JobDetails = {
  id: string;
  title: string;
  location: string;
  description: string;
  job_type?: string; 
  companyName: string;
  companyLogoUrl?: string;
};

export default function AppliedJobDetailsPage() {
  const { jobID } = useParams();
  const router = useRouter();

  const [job, setJob] = useState<JobDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const jobIDStr = typeof jobID === 'string' ? jobID : '';
    if (!jobIDStr) return;

    const fetchJob = async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          id,
          title,
          location,
          description,
          job_type,
          company_profiles (
            company_name,
            logo_url
          )
        `)
        .eq('id', jobIDStr)
        .single<JobWithCompany>();

      if (error || !data) {
        setJob(null);
        setLoading(false);
        return;
      }

      const companyProfile = data.company_profiles;

      setJob({
        id: data.id,
        title: data.title,
        location: data.location,
        description: data.description,
        job_type: data.job_type,
        companyName: companyProfile?.company_name || 'Unknown Company',
        companyLogoUrl: companyProfile?.logo_url || undefined,
      });

      setLoading(false);
    };

    fetchJob();
  }, [jobID]);

  if (loading) return <SplashScreen />;
  if (!job) return <p className="p-6 text-red-500">Job not found.</p>;

  return (
    <div className="max-w-4xl mx-auto p-6 font-mono bg-gray-100 min-h-[75vh]">
      <button
        className="mb-6 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
        onClick={() => router.back()}
      >
        ← Back to Dashboard
      </button>

      <div className="bg-white rounded shadow p-6">
        {job.companyLogoUrl && (
          <img
            src={job.companyLogoUrl}
            alt={`${job.companyName} logo`}
            className="h-20 mb-4 object-contain"
          />
        )}

<h1 className="text-2xl font-semibold mb-2">
  <span className="font-bold text-gray-700 mr-2">Job Title:</span>
  <span className="font-normal text-gray-900">{job.title}</span>
</h1>

<h2 className="text-xl font-semibold mb-4">
  <span className="font-bold text-gray-700 mr-2">Company Name:</span>
  <span className="font-normal text-gray-900">{job.companyName}</span>
</h2>

<p className="mb-2 text-base">
  <span className="font-bold text-gray-700 mr-2">Location:</span>
  <span className="font-normal text-gray-900">{job.location}</span>
</p>

{job.job_type && (
  <p className="mb-6 text-base text-gray-700">
    <span className="font-bold mr-2">Job Type:</span>
    <span className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-600 font-semibold">
      {job.job_type}
    </span>
  </p>
)}

<p className="font-bold text-gray-700 mb-2 border-b border-black inline-block">
  Job Description
</p>
<div className="whitespace-pre-wrap text-gray-900 text-base leading-relaxed">
  {job.description}
</div>


      </div>
    </div>
  );
}
