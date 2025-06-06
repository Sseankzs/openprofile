'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import Tooltip from 'rc-tooltip'; // Using rc-tooltip for hover tooltip, you can replace or style differently
import 'rc-tooltip/assets/bootstrap.css';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ApplyPage() {
  const { jobID } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);

  // Applicant info fields
  const [applicant, setApplicant] = useState<any>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [linkedin, setLinkedin] = useState('');

  // Job info
  const [job, setJob] = useState<any>(null);

  // Documents: existing files fetched from user_documents table
  const [existingResumes, setExistingResumes] = useState<{ id: string; file_path: string; url: string }[]>([]);
  const [existingCoverLetters, setExistingCoverLetters] = useState<{ id: string; file_path: string; url: string }[]>([]);

  // Form states
  const [useExistingResume, setUseExistingResume] = useState(false);
  const [selectedExistingResume, setSelectedExistingResume] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const [useExistingCoverLetter, setUseExistingCoverLetter] = useState(false);
  const [selectedExistingCoverLetter, setSelectedExistingCoverLetter] = useState('');
  const [coverLetterFile, setCoverLetterFile] = useState<File | null>(null);

  const [coverLetterText, setCoverLetterText] = useState(''); // optional textarea for cover letter content if you want, or remove if only files

  // Helper: get public URL from storage bucket + path
  const getPublicUrl = (bucket: string, path: string) => {
    return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
  };

  // Fetch user, applicant profile, job, and existing documents
  useEffect(() => {
  async function fetchData() {
    setLoading(true);

    // Get user
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push('/login');
      return;
    }

    setEmail(user.email || '');

    // Fetch applicant profile
    const { data: profile, error: profileError } = await supabase
      .from('applicant_profiles')
      .select('first_name,last_name,phone,linkedin,user_id')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
    } else if (profile) {
      setApplicant(profile);
      setFirstName(profile.first_name || '');
      setLastName(profile.last_name || '');
      setPhone(profile.phone || '');
      setLinkedin(profile.linkedin || '');
    }

    // Fetch existing documents
    const { data: docs, error: docsError } = await supabase
      .from('user_documents')
      .select('id,file_type,file_path')
      .eq('user_id', user.id);

    if (docsError) {
      console.error('Documents fetch error:', docsError);
    } else if (docs) {
      const resumes = docs
        .filter((d) => d.file_type === 'resume')
        .map((d) => ({
          id: d.id,
          file_path: d.file_path,
          url: getPublicUrl('resumes', d.file_path),
        }));

      const coverLetters = docs
        .filter((d) => d.file_type === 'cover-letter')
        .map((d) => ({
          id: d.id,
          file_path: d.file_path,
          url: getPublicUrl('cover-letters', d.file_path),
        }));

      setExistingResumes(resumes);
      setExistingCoverLetters(coverLetters);

      if (resumes.length > 0) setSelectedExistingResume(resumes[0].url);
      if (coverLetters.length > 0) setSelectedExistingCoverLetter(coverLetters[0].url);
    }

    // *** Add this block to fetch job details ***
    const { data: jobData, error: jobError } = await supabase
      .from('jobs')
      .select(`
        *,
        company_profiles (
          company_name
        )
      `)
      .eq('id', jobID)
      .single();

    if (jobError) {
      console.error('Job fetch error:', jobError);
    } else {
      setJob(jobData);
    }

    setLoading(false);
  }

  fetchData();
}, [jobID, router]);


  // Handle submit
  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!job) {
      alert('Job data not loaded.');
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push('/login');
      return;
    }

    // Validate: must have either a file uploaded or existing selected for both resume and cover letter
    if (!useExistingResume && !resumeFile) {
      alert('Please upload a resume or select an existing one.');
      return;
    }

    if (!useExistingCoverLetter && !coverLetterFile) {
      alert('Please upload a cover letter or select an existing one.');
      return;
    }

    let finalResumeUrl = '';
    let finalCoverLetterUrl = '';

    // Upload resume if uploading new
    if (useExistingResume) {
      finalResumeUrl = selectedExistingResume;
    } else if (resumeFile) {
      const filePath = `${user.id}/resumes/${Date.now()}-${resumeFile.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(filePath, resumeFile, { cacheControl: '3600', upsert: false });

      if (uploadError) {
        alert('Failed to upload resume: ' + uploadError.message);
        return;
      }

      finalResumeUrl = getPublicUrl('resumes', filePath);

      // Insert into user_documents for resume
      await supabase.from('user_documents').insert({
        user_id: user.id,
        file_type: 'resume',
        file_path: filePath,
      });
    }

    // Upload cover letter if uploading new
    if (useExistingCoverLetter) {
      finalCoverLetterUrl = selectedExistingCoverLetter;
    } else if (coverLetterFile) {
      const filePath = `${user.id}/cover-letters/${Date.now()}-${coverLetterFile.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('cover-letters')
        .upload(filePath, coverLetterFile, { cacheControl: '3600', upsert: false });

      if (uploadError) {
        alert('Failed to upload cover letter: ' + uploadError.message);
        return;
      }

      finalCoverLetterUrl = getPublicUrl('cover-letters', filePath);

      // Insert into user_documents for cover letter
      await supabase.from('user_documents').insert({
        user_id: user.id,
        file_type: 'cover-letter',
        file_path: filePath,
      });
    }

    // Insert application data
    const { error } = await supabase.from('applications').insert([
      {
        user_id: user.id,
        job_id: job.id,
        cover_letter_url: finalCoverLetterUrl,
        resume_url: finalResumeUrl,
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        linkedin_link: linkedin,
        created_at: new Date().toISOString(),
      },
    ]);

    if (error) {
      alert('Failed to submit application: ' + error.message);
    } else {
      alert('Application submitted successfully!');
      router.push('/applicant/dashboard');
    }
  };

  if (loading) return <p className="p-4">Loading...</p>;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-md mt-6 rounded-md font-mono">
      <h1 className="text-3xl font-bold mb-4">Apply for {job?.title || 'the job'}</h1>
      <p className="mb-6 text-gray-700">
        {job?.company_profiles?.company_name || 'Unknown Company'} — {job?.location || 'N/A'}
      </p>

      <form onSubmit={handleApply} className="space-y-6">
        {/* Applicant info */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label htmlFor="firstName" className="block mb-1 font-medium text-gray-700">
              First Name
            </label>
            <input
              id="firstName"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2"
            />
          </div>

          <div>
            <label htmlFor="lastName" className="block mb-1 font-medium text-gray-700">
              Last Name
            </label>
            <input
              id="lastName"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2"
            />
          </div>

          <div className="col-span-2">
            <label htmlFor="email" className="block mb-1 font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block mb-1 font-medium text-gray-700">
              Phone
            </label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2"
            />
          </div>

          <div>
            <label htmlFor="linkedin" className="block mb-1 font-medium text-gray-700">
              LinkedIn Link
            </label>
            <input
              id="linkedin"
              type="url"
              placeholder="https://linkedin.com/in/yourprofile"
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2"
            />
          </div>
        </div>

        {/* Resume Upload */}
        <div>
          <label className="block mb-1 font-medium text-gray-700">Resume</label>

          <div className="flex items-center mb-2 space-x-2">
            <input
              type="checkbox"
              id="useExistingResume"
              checked={useExistingResume}
              onChange={() => setUseExistingResume((v) => !v)}
              disabled={existingResumes.length === 0}
            />
            {existingResumes.length === 0 ? (
              <Tooltip
                placement="right"
                overlay={<span className="text-xs italic text-red-600">No uploaded resume found</span>}
              >
                <label htmlFor="useExistingResume" className="cursor-pointer select-none">
                  Use Existing Resume
                </label>
              </Tooltip>
            ) : (
              <label htmlFor="useExistingResume" className="cursor-pointer select-none">
                Use Existing Resume
              </label>
            )}
          </div>

          {useExistingResume && existingResumes.length > 0 && (
            <select
              className="w-full rounded border border-gray-300 px-3 py-2 mb-3"
              value={selectedExistingResume}
              onChange={(e) => setSelectedExistingResume(e.target.value)}
            >
              {existingResumes.map((doc) => (
                <option key={doc.id} value={doc.url}>
                  {doc.file_path.split('/').pop()}
                </option>
              ))}
            </select>
          )}

          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(e) => setResumeFile(e.target.files?.[0] ?? null)}
            disabled={useExistingResume}
            className="w-full rounded border border-gray-300 px-3 py-2"
          />
        </div>

        {/* Cover Letter Upload */}
        <div>
          <label className="block mb-1 font-medium text-gray-700">Cover Letter</label>

          <div className="flex items-center mb-2 space-x-2">
            <input
              type="checkbox"
              id="useExistingCoverLetter"
              checked={useExistingCoverLetter}
              onChange={() => setUseExistingCoverLetter((v) => !v)}
              disabled={existingCoverLetters.length === 0}
            />
            {existingCoverLetters.length === 0 ? (
              <Tooltip
                placement="right"
                overlay={<span className="text-xs italic text-red-600">No uploaded cover letter found</span>}
              >
                <label htmlFor="useExistingCoverLetter" className="cursor-pointer select-none">
                  Use Existing Cover Letter
                </label>
              </Tooltip>
            ) : (
              <label htmlFor="useExistingCoverLetter" className="cursor-pointer select-none">
                Use Existing Cover Letter
              </label>
            )}

          </div>

          {useExistingCoverLetter && existingCoverLetters.length > 0 && (
            <select
              className="w-full rounded border border-gray-300 px-3 py-2 mb-3"
              value={selectedExistingCoverLetter}
              onChange={(e) => setSelectedExistingCoverLetter(e.target.value)}
            >
              {existingCoverLetters.map((doc) => (
                <option key={doc.id} value={doc.url}>
                  {doc.file_path.split('/').pop()}
                </option>
              ))}
            </select>
          )}

          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(e) => setCoverLetterFile(e.target.files?.[0] ?? null)}
            disabled={useExistingCoverLetter}
            className="w-full rounded border border-gray-300 px-3 py-2"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded font-semibold hover:bg-blue-700 transition"
        >
          Submit Application
        </button>
      </form>
    </div>
  );
}
