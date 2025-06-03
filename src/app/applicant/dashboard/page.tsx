'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
};

type ApplicantProfile = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  linkedin: string;
  resume?: string;
  coverLetter?: string;
};

export default function ApplicantDashboard() {
  const [profile, setProfile] = useState<ApplicantProfile | null>(null);
  const [appliedJobs, setAppliedJobs] = useState<Job[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data: profileData } = await supabase
        .from('applicant_profiles')
        .select('first_name, last_name , phone, linkedin')
        .eq('user_id', user.id)
        .single();

      setProfile({
        firstName: profileData?.first_name ?? 'No Name ',
        lastName: profileData?.last_name ?? 'No Name',
        email: user.email ?? '',
        phone: profileData?.phone ?? '',
        linkedin: profileData?.linkedin ?? '',
        resume: '',
      });

      const { data: jobsData } = await supabase
        .from('applications')
        .select('job_id, jobs(title, company, location, description)')
        .eq('applicant_id', user.id);

      const jobs = jobsData?.map((app: any) => ({
        id: app.job_id,
        title: app.jobs.title,
        company: app.jobs.company,
        location: app.jobs.location,
        description: app.jobs.description,
      })) ?? [];

      setAppliedJobs(jobs);
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-[75vh] bg-gray-100 p-6 font-mono" >
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* Left (Sticky Profile) */}
        <div className="md:col-span-2  overflow-y-auto">
          <div className="min-h-[70vh] sticky top-6 bg-white p-6 rounded shadow-md">
            <img src="/images/profile-placeholder.png" className='min-h-[20vh]'/>
            <h2 className="text-2xl font-bold mb-4 font-mono">Your Profile</h2>
            <p><strong>Name:</strong> {profile?.lastName as string + " " + profile?.firstName as string}</p>
            <p><strong>Email:</strong> {profile?.email}</p>
            <p><strong>Phone:</strong> {profile?.phone}</p>
            <p><strong>LinkedIn:</strong> <a href={profile?.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">{profile?.linkedin}</a></p>
            <button className="mt-4 px-4 py-2 bg-fireopal text-white rounded hover:bg-crowblack font-mono">
              Edit Profile
            </button>
          </div>
        </div>

        {/* Right (Job Applications) */}
        <div className="md:col-span-3 space-y-6">
          <h2 className="text-2xl font-bold font-mono mb-4">Jobs You've Applied To</h2>
          {appliedJobs.length > 0 ? (
            appliedJobs.map((job) => (
              <div key={job.id} className="bg-white p-4 rounded shadow-md">
                <h3 className="text-xl font-semibold font-mono text-firered">{job.title}</h3>
                <p className="text-gray-600 font-mono">{job.company} - {job.location}</p>
                <p className="mt-2 text-sm font-mono text-gray-700">{job.description}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-500 font-mono">You haven’t applied to any jobs yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
