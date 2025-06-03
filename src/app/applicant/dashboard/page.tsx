'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function ApplicantDashboard() {
  const [loading, setLoading] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/applicant/login');
        return;
      }

      const { data: profile } = await supabase
        .from('applicant_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // If no profile or missing required fields
      if (!profile || !profile.first_name || !profile.resume_url) {
        setShowProfileModal(true);
      }

      setLoading(false);
    };

    checkProfile();
  }, [router]);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="font-mono">

      {showProfileModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Complete Your Profile!</h2>
            <form onSubmit={async (e) => {
                e.preventDefault();

                const form = e.target as HTMLFormElement;
                const formData = new FormData(form);

                const firstName = formData.get('firstName') as string;
                const lastName = formData.get('lastName') as string;
                const phone = formData.get('phone') as string;
                const linkedin = formData.get('linkedin') as string;
                const resume = formData.get('resume') as File;

                if (!resume || resume.type !== 'application/pdf') {
                  alert('Please upload a valid PDF resume.');
                  return;
                }

                const {
                  data: { user },
                } = await supabase.auth.getUser();

                const fileName = `resumes/${user?.id}_${Date.now()}_${resume.name}`;
                const { data: uploadData, error: uploadError } = await supabase.storage
                  .from('resumes')
                  .upload(fileName, resume);

                if (uploadError) {
                  console.error('Resume upload error:', uploadError);
                  alert('Resume upload failed.' + uploadError.message);
                  return;
                }

                const resumeUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/resumes/Applicants/${uploadData.path}`;

                const { error: insertError } = await supabase.from('applicant_profiles').upsert({
                  user_id: user?.id,
                  first_name: firstName,
                  last_name: lastName,
                  phone,
                  linkedin,
                  resume_url: resumeUrl,
                });

                if (insertError) {
                  alert('Failed to save profile.' + insertError.message);
                } else {
                  alert('Profile updated!');
                  window.location.reload(); // refresh dashboard after submission
                }
              }}
              className="space-y-4"
            >
              <input name="firstName" placeholder="First Name" required className="w-full p-2 border rounded font-mono" />
              <input name="lastName" placeholder="Last Name" required className="w-full p-2 border rounded font-mono" />
              <input name="phone" placeholder="Phone Number" required className="w-full p-2 border rounded font-mono" />
              <input name="linkedin" placeholder="LinkedIn URL" required type="url" className="w-full p-2 border rounded font-mono" />
              <input name="resume" placeholder='accepted file type: .pdf' type="file" accept="application/pdf" required className="w-full p-2 border rounded font-mono" />
              <button type="submit" className="bg-fireopal text-whitechocolate px-4 py-2 rounded hover:bg-crowblack">
                Complete Profile
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Dashboard content goes here */}
    </div>
  );
}
