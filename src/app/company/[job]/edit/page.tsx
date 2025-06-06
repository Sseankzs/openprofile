'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import MarkdownEditor from '@/app/components/MarkdownEditor';

export default function EditJobPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.job;

  const [job, setJob] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    salary_min: '',
    salary_max: '',
    job_type: '',
    description: ''
  });

  useEffect(() => {
    const fetchJob = async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .single();

      if (error) {
        console.error('Error fetching job:', error);
        return;
      }

      setJob(data);
      setFormData({
        title: data.title,
        location: data.location,
        salary_min: data.salary_min,
        salary_max: data.salary_max,
        job_type: data.job_type,
        description: data.description
      });
    };

    if (jobId) {
      fetchJob();
    }
  }, [jobId]);

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEditorChange = (value: string) => {
    setFormData({ ...formData, description: value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const { error } = await supabase
      .from('jobs')
      .update({
        title: formData.title,
        location: formData.location,
        salary_min: formData.salary_min ? Number(formData.salary_min) : null,
        salary_max: formData.salary_max ? Number(formData.salary_max) : null,
        job_type: formData.job_type,
        description: formData.description
      })
      .eq('id', jobId);

    if (error) {
      alert('Failed to update job.');
      console.error(error);
    } else {
      alert('Job updated successfully!');
      router.push(`/company/${jobId}`);
    }
  };



  return (
    <div className="max-w-4xl mx-auto py-10 px-6 font-mono">
      <h1 className="text-3xl font-bold text-firered mb-6">Edit Job Posting</h1>
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded shadow-md border border-gray-200">
        <div>
          <label className="block font-medium">Job Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="mt-1 w-full border rounded px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block font-medium">Location</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="mt-1 w-full border rounded px-3 py-2"
          />
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block font-medium">Minimum Salary (RM)</label>
            <input
              type="number"
              name="salary_min"
              value={formData.salary_min}
              onChange={handleChange}
              className="mt-1 w-full border rounded px-3 py-2"
            />
          </div>
          <div className="flex-1">
            <label className="block font-medium">Maximum Salary (RM)</label>
            <input
              type="number"
              name="salary_max"
              value={formData.salary_max}
              onChange={handleChange}
              className="mt-1 w-full border rounded px-3 py-2"
            />
          </div>
        </div>

        <div>
          <label className="block font-medium">Job Type</label>
          <select
            name="job_type"
            value={formData.job_type}
            onChange={handleChange}
            className="mt-1 w-full border rounded px-3 py-2"
          >
            <option value="">Select a type</option>
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Internship">Internship</option>
            <option value="Contract">Contract</option>
          </select>
        </div>

        <div>
          <label className="block font-medium">Job Description</label>
          <MarkdownEditor value={formData.description} onChange={handleEditorChange} />
        </div>

        <button
          type="submit"
          className="bg-fireopal hover:bg-crowblack text-white px-6 py-2 rounded"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
}
