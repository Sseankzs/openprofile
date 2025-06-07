'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import CompanyProfileModal from '@/app/components/EditCompany';
import SplashScreen from '@/app/components/splashscreen';
import Link from 'next/link';
import { useToast } from '@/app/components/ToastContext';

type Job = {
  id: string;
  title: string;
  location: string;
  description: string;
};

type CompanyProfile = {
  id: string;
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
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const updateProfile = async (updatedData: Partial<CompanyProfile>) => {
  if (!profile?.id) {
    console.error('No profile id found for update');
    return false;
  }

  const { data, error } = await supabase
    .from('company_profiles')
    .update(updatedData)
    .eq('id', profile.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating profile:', error);
    return false;
  }

  // Optionally update local profile state immediately
  setProfile(data);

  return true;
};

  // fetch profile and jobs data
  const fetchData = async () => {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data: profileData, error: profileError } = await supabase
      .from('company_profiles')
      .select('id, company_name, email, phone, website, description, logo_url')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profileData) {
      setShowEditModal(true);
      setLoading(false);
      return;
    }

    setProfile(profileData);

    const { data: jobsData, error: jobsError } = await supabase
      .from('jobs')
      .select('id, title, location, description')
      .eq('company_id', profileData.id);

    if (jobsError) {
      console.error('Error fetching jobs:', jobsError);
      setLoading(false);
      return;
    }

    setPostedJobs(jobsData || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // refresh profile and jobs after update, no reload
  const refreshProfile = async () => {
    showToast('Profile updated successfully!');
    await fetchData();
    setShowEditModal(false);
  };

  if (loading) return <SplashScreen />;

  return (
    <div className="min-h-[75vh] bg-gray-100 p-6 font-mono">
      {showEditModal && (
        <CompanyProfileModal
          profile={profile}
          onClose={() => setShowEditModal(false)}
          onUpdate={refreshProfile}
          onSave={updateProfile}
          forceOpen={!profile}
        />
      )}

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* Left (Sticky Profile) */}
        <div className="md:col-span-2">
          <div className="min-h-[70vh] sticky top-6 bg-white p-6 rounded shadow-md">
            <img
              src={profile?.logo_url || '/images/profile-placeholder.png'}
              className="w-32 h-32 object-cover rounded mb-4"
              alt="Company Logo"
            />
            <h2 className="text-2xl font-bold mb-4">Company Profile</h2>
            <p><strong>Name:</strong> {profile?.company_name ?? 'No Company Name'}</p>
            <p><strong>Email:</strong> {profile?.email}</p>
            <p><strong>Phone:</strong> {profile?.phone}</p>
            <p><strong>Website:</strong>{' '}
              <a
                href={profile?.website}
                className="text-blue-500 underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {profile?.website}
              </a>
            </p>
            <p><strong>Description:</strong> {profile?.description}</p>
            <button
              className="mt-4 px-4 py-2 bg-fireopal text-white rounded hover:bg-crowblack"
              onClick={() => setShowEditModal(true)}
            >
              Edit Profile
            </button>
          </div>
        </div>

        {/* Right (Posted Jobs) */}
        <div className="md:col-span-3 space-y-6 overflow-y-auto max-h-[90vh] pr-4">
          <h2 className="text-2xl font-bold mb-4">Jobs You’ve Posted</h2>
          {postedJobs.length > 0 ? (
            postedJobs.map((job) => (
              <Link href={`/company/${job.id}`} key={job.id} >
                <div className="cursor-pointer bg-white p-4 rounded shadow-md max-h-28 overflow-hidden hover:bg-gray-50 transition m-4">
                  <h3 className="text-xl font-semibold text-firered">{job.title}</h3>
                  <p className="text-gray-600">{job.location}</p>
                  <p className="mt-2 text-sm text-gray-700">{job.description}</p>
                </div>
              </Link>
            ))
          ) : (
            <p className="text-gray-500">You haven’t posted any jobs yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
