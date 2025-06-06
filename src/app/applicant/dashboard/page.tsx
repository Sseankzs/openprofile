'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import EditProfileModal from '@/app/components/EditApplicant';

type ApplicantProfile = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  linkedin: string;
  resume?: string;
  img_url?: string;
};

export default function ApplicantDashboard() {
  const [profile, setProfile] = useState<ApplicantProfile | null>(null);
  const [appliedJobs, setAppliedJobs] = useState<any[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data: profileData } = await supabase
        .from('applicant_profiles')
        .select('first_name, last_name, phone, linkedin, img_url')
        .eq('user_id', user.id)
        .single();

      if (!profileData) {
        setShowEditModal(true);
        return;
      }

      setProfile({
        firstName: profileData.first_name,
        lastName: profileData.last_name,
        email: user.email ?? '',
        phone: profileData.phone ?? '',
        linkedin: profileData.linkedin ?? '',
        img_url: profileData.img_url ?? '',
      });

      const { data: jobsData, error } = await supabase
        .from('applications')
        .select(`
          job_id,
          jobs (
            id,
            title,
            location,
            description,
            company_profiles (
              company_name,
              logo_url
            )
          )
        `)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching applied jobs:', error);
        return;
      }

      const jobs = jobsData?.map((app: any) => ({
        id: app.jobs.id,
        title: app.jobs.title,
        company: app.jobs.company_profiles?.company_name || 'Unknown Company',
        location: app.jobs.location,
        description: app.jobs.description,
        img_url: app.jobs.company_profiles?.logo_url || '/images/job-placeholder.png',
      })) ?? [];

      setAppliedJobs(jobs);
    };

    fetchData();
  }, []);


  const refreshProfile = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-[75vh] bg-gray-100 p-6 font-mono">
      {showEditModal && (
        <EditProfileModal
          profile={profile}
          onClose={() => setShowEditModal(false)}
          onUpdate={refreshProfile}
          forceOpen={!profile}
        />
      )}

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* Left (Sticky Profile) */}
        <div className="md:col-span-2">
          <div className="min-h-[70vh] sticky top-6 bg-white p-6 rounded shadow-md">
            <img src={profile?.img_url} className="min-h-[20vh] rounded" />
            <h2 className="text-2xl font-bold mb-4">Your Profile</h2>
            <p><strong>Name:</strong> {profile?.lastName} {profile?.firstName}</p>
            <p><strong>Email:</strong> {profile?.email}</p>
            <p><strong>Phone:</strong> {profile?.phone}</p>
            <p><strong>LinkedIn:</strong> <a href={profile?.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">{profile?.linkedin}</a></p>
            <button
              onClick={() => setShowEditModal(true)}
              className="mt-4 px-4 py-2 bg-fireopal text-white rounded hover:bg-crowblack"
            >
              Edit Profile
            </button>
          </div>
        </div>

        {/* Right (Jobs Applied) */}
        <div className="md:col-span-3 space-y-6">
          <h2 className="text-2xl font-bold mb-4">Jobs You've Applied To</h2>
          {appliedJobs.length > 0 ? (
            appliedJobs.map((job) => (
              <div key={job.id} className="bg-white p-4 rounded shadow-md max-h-28 overflow-hidden">
                <h3 className="text-xl font-semibold text-firered">{job.title}</h3>
                <p className="text-gray-600">{job.company} - {job.location}</p>
                <p className="mt-2 text-sm text-gray-700">{job.description}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-500">You haven’t applied to any jobs yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
