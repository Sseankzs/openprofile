'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import CompanyProfileModal from '@/app/components/EditCompany';

type Job = {
  id: string;
  title: string;
  location: string;
  description: string;
};

type CompanyProfile = {
  company_name: string;
  email: string;
  phone: string;
  website: string;
  description: string;
  logo_url: string;
};

export default function CompanyDashboard() {
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [postedJobs, setPostedJobs] = useState<Job[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      // Fetch company profile
      const { data: profileData, error: profileError } = await supabase
        .from('company_profiles')
        .select('company_name, email, phone, website, description, logo_url')
        .eq('user_id', user.id)
        .single();

      if (profileError) {
        console.error('Profile error:', profileError.message);
        return;
      }

      setProfile(profileData);

      // Fetch posted jobs
      const { data: jobsData, error: jobsError } = await supabase
        .from('jobs')
        .select('id, title, location, description')
        .eq('posted_by', user.id);

      if (jobsError) {
        console.error('Jobs fetch error:', jobsError.message);
        return;
      }

      setPostedJobs(jobsData);
    };

    fetchData();
  }, []);

  return (
    
    <div className="min-h-[75vh] bg-gray-100 p-6 font-mono overflow-hidden">
      <CompanyProfileModal />
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* Left (Sticky Profile) */}
        <div className="md:col-span-2 overflow-y-auto">
          <div className="min-h-[70vh] sticky top-6 bg-white p-6 rounded shadow-md">
            <img src={profile?.logo_url || '/images/profile-placeholder.png'} className='w-32 h-32 object-cover rounded mb-4' />
            <h2 className="text-2xl font-bold mb-4">Company Profile</h2>
            <p><strong>Name:</strong> {profile?.company_name ?? 'No Company Name'}</p>
            <p><strong>Email:</strong> {profile?.email}</p>
            <p><strong>Phone:</strong> {profile?.phone}</p>
            <p><strong>Website:</strong> <a href={profile?.website} className="text-blue-500 underline" target="_blank">{profile?.website}</a></p>
            <p><strong>Description:</strong> {profile?.description}</p>
            <button className="mt-4 px-4 py-2 bg-fireopal text-white rounded hover:bg-crowblack font-mono">
              Edit Profile
            </button>
          </div>
        </div>

        {/* Right (Posted Jobs) */}
        <div className="md:col-span-3 space-y-6 overflow-y-auto max-h-[90vh] pr-4">
          <h2 className="text-2xl font-bold mb-4">Jobs You’ve Posted</h2>
          {postedJobs.length > 0 ? (
            postedJobs.map((job) => (
              <div key={job.id} className="bg-white p-4 rounded shadow-md">
                <h3 className="text-xl font-semibold text-firered">{job.title}</h3>
                <p className="text-gray-600">{job.location}</p>
                <p className="mt-2 text-sm text-gray-700">{job.description}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-500">You haven’t posted any jobs yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
