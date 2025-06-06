'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';
import rehypeSanitize from "rehype-sanitize";
import './md-editor-custom.css';


const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });

export default function PostJobPage() {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [salaryMin, setSalaryMin] = useState<number | ''>('');
  const [salaryMax, setSalaryMax] = useState<number | ''>('');
  const [jobType, setJobType] = useState('Full-time');
  const [description, setDescription] = useState<string | undefined>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const user = (await supabase.auth.getUser()).data.user;
    if (!user) {
      setError('Not authenticated');
      setLoading(false);
      return;
    }

    const { data: companyProfile } = await supabase
      .from('company_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!companyProfile) {
      setError('Company profile not found');
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase.from('jobs').insert([
      {
        company_id: companyProfile.id,
        title,
        location,
        salary_min: salaryMin === '' ? null : salaryMin,
        salary_max: salaryMax === '' ? null : salaryMax,
        job_type: jobType,
        description,
      },
    ]);

    if (insertError) {
      setError('Error posting job' + insertError.message);
    } else {
      router.push('/company/dashboard');
    }

    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 font-mono">
      <h1 className="text-2xl font-bold mb-6">Post a Job</h1>
      <p className="text-gray-600 mb-4">
        Fill out the form below to post a new job listing. All fields are required except for salary. You need to create a company profile before posting a job.
      </p>

      {error && <div className="text-red-600 mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block font-medium">Job Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-gray-300 rounded px-4 py-2 mt-1"
            required
          />
        </div>

        <div>
          <label className="block font-medium">Location</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full border border-gray-300 rounded px-4 py-2 mt-1"
            required
          />
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block font-medium">Salary Min</label>
            <input
              type="number"
              value={salaryMin}
              onChange={(e) => setSalaryMin(e.target.value ? parseFloat(e.target.value) : '')}
              className="w-full border border-gray-300 rounded px-4 py-2 mt-1"
              min="0"
            />
          </div>
          <div className="flex-1">
            <label className="block font-medium">Salary Max</label>
            <input
              type="number"
              value={salaryMax}
              onChange={(e) => setSalaryMax(e.target.value ? parseFloat(e.target.value) : '')}
              className="w-full border border-gray-300 rounded px-4 py-2 mt-1"
              min="0"
            />
          </div>
        </div>

        <div>
          <label className="block font-medium">Job Type</label>
          <select
            value={jobType}
            onChange={(e) => setJobType(e.target.value)}
            className="w-full border border-gray-300 rounded px-4 py-2 mt-1"
          >
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Contract">Contract</option>
            <option value="Internship">Internship</option>
            <option value="Temporary">Temporary</option>
          </select>
        </div>

        <div data-color-mode="light" font-mono>
          <label className="block font-medium mb-1">Job Description (Markdown Supported)</label>
          <MDEditor
            value={description}
            onChange={setDescription}
            preview="live"
            height={400}
            className="bg-white dark:bg-gray-800 rounded-md"
            previewOptions={{
              rehypePlugins: [[rehypeSanitize]],
            }}
                        
          />

        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-firered text-white font-medium px-6 py-2 rounded hover:bg-red-600 transition"
        >
          {loading ? 'Posting...' : 'Post Job'}
        </button>
      </form>
    </div>
  );
}
