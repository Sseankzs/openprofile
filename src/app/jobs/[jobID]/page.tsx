'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ApplyPage() {
  const { jobID } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [applicant, setApplicant] = useState<any>(null);
  const [job, setJob] = useState<any>(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      // Fetch job details
      const { data: jobData, error: jobError } = await supabase
        .from('jobs')
        .select(`*, company_profiles(id, company_name)`)
        .eq('id', jobID)
        .single();

      // Fetch applicant profile
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('applicant_profile')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (jobError || profileError) {
        console.error(jobError || profileError);
      } else {
        setJob(jobData);
        setApplicant(profile);
      }

      setLoading(false);
    };

    fetchData();
  }, [jobID, router]);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !job) return;

    let resume_url = applicant.resume;

    if (resumeFile) {
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(`${user.id}/${Date.now()}-${resumeFile.name}`, resumeFile, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        alert('Resume upload failed.');
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from('resumes').getPublicUrl(uploadData.path);

      resume_url = publicUrl;
    }

    const { error } = await supabase.from('applications').insert([
      {
        user_id: user.id,
        job_id: job.id,
        cover_letter: coverLetter,
        resume_url,
        created_at: new Date().toISOString(),
      },
    ]);

    if (error) {
      alert('Application failed. Please try again.');
    } else {
      alert('Application submitted!');
      router.push('/dashboard');
    }
  };

  if (loading) return <p className="p-4">Loading...</p>;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-md mt-6 rounded-md">
      <h1 className="text-2xl font-bold mb-2">Apply for {job?.title}</h1>
      <p className="mb-4 text-gray-600">
        {job?.company_profiles?.company_name || 'Unknown Company'} —{' '}
        {job?.location || 'N/A'}
      </p>

      <form onSubmit={handleApply} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600">First Name</label>
            <input
              type="text"
              value={applicant?.first_name || ''}
              disabled
              className="w-full p-2 border rounded bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600">Last Name</label>
            <input
              type="text"
              value={applicant?.last_name || ''}
              disabled
              className="w-full p-2 border rounded bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600">Email</label>
            <input
              type="email"
              value={applicant?.email || ''}
              disabled
              className="w-full p-2 border rounded bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600">Phone</label>
            <input
              type="text"
              value={applicant?.phone || ''}
              disabled
              className="w-full p-2 border rounded bg-gray-100"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-600">Cover Letter</label>
          <textarea
            required
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            className="w-full p-2 border rounded min-h-[100px]"
            placeholder="Write a short cover letter here..."
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600">Resume (optional)</label>
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
            className="w-full border rounded p-2"
          />
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Submit Application
        </button>
      </form>
    </div>
  );
}
