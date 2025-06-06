'use client';

import { useEffect, useState, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import Fuse from 'fuse.js';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';


const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Company = {
  id: string;
  company_name: string;
  location: string | null;
};

type Job = {
  id: string;
  company_id: string;
  title: string;
  description: string | null;
  location: string | null;
  salary_range: string | null;
  job_type: string | null;
  salary_min: number | null;
  salary_max: number | null;
  created_at: string;
  company?: Company;
};

export default function JobSearchPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [filterJobType, setFilterJobType] = useState('');
  const [filterSalaryMin, setFilterSalaryMin] = useState<number | ''>('');
  const [filterSalaryMax, setFilterSalaryMax] = useState<number | ''>('');

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  useEffect(() => {
    async function fetchJobs() {
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          id,
          company_id,
          title,
          description,
          location,
          salary_range,
          job_type,
          salary_min,
          salary_max,
          created_at,
          company_profiles!jobs_company_id_fkey (
            id,
            company_name,
            location
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching jobs:', error);
        return;
      }

      const jobsWithCompany = data?.map((job) => ({
        ...job,
        company: job.company_profiles?.[0] || null,
      })) as Job[];

      setJobs(jobsWithCompany);
      setFilteredJobs(jobsWithCompany);
      if (jobsWithCompany.length > 0) setSelectedJob(jobsWithCompany[0]);
    }

    fetchJobs();
  }, []);

  const fuse = useMemo(() => {
    return new Fuse(jobs, {
      keys: ['title', 'company.company_name', 'location', 'job_type'],
      threshold: 0.3,
    });
  }, [jobs]);

  useEffect(() => {
    let filtered = [...jobs];

    if (filterLocation.trim() !== '') {
      filtered = filtered.filter((job) =>
        job.location?.toLowerCase().includes(filterLocation.toLowerCase())
      );
    }
    if (filterJobType.trim() !== '') {
      filtered = filtered.filter(
        (job) => job.job_type?.toLowerCase() === filterJobType.toLowerCase()
      );
    }
    if (filterSalaryMin !== '') {
      filtered = filtered.filter(
        (job) => job.salary_min !== null && job.salary_min >= filterSalaryMin
      );
    }
    if (filterSalaryMax !== '') {
      filtered = filtered.filter(
        (job) => job.salary_max !== null && job.salary_max <= filterSalaryMax
      );
    }
    if (searchTerm.trim() !== '') {
      const results = fuse.search(searchTerm);
      filtered = results.map((r) => r.item);
    }

    setFilteredJobs(filtered);
    setCurrentPage(1); // Reset to first page on new filters/search

    if (!filtered.find((job) => job.id === selectedJob?.id)) {
      setSelectedJob(filtered[0] || null);
    }
  }, [
    searchTerm,
    filterLocation,
    filterJobType,
    filterSalaryMin,
    filterSalaryMax,
    jobs,
    fuse,
  ]);

  const totalPages = Math.ceil(filteredJobs.length / pageSize);
  const paginatedJobs = filteredJobs.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="flex flex-col h-screen p-4 gap-4 bg-gray-50 font-mono">
      {/* Filters */}
      <div className="bg-white rounded shadow p-4 flex flex-wrap gap-3 items-center">
        <input
          type="text"
          placeholder="Search jobs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow min-w-[300px] px-3 py-2 border rounded"
        />
        <input
          type="text"
          placeholder="Location"
          value={filterLocation}
          onChange={(e) => setFilterLocation(e.target.value)}
          className="w-28 px-3 py-2 border rounded"
        />
        <select
          value={filterJobType}
          onChange={(e) => setFilterJobType(e.target.value)}
          className="w-36 px-3 py-2 border rounded"
        >
          <option value="">All Job Types</option>
          <option value="Full-time">Full-time</option>
          <option value="Part-time">Part-time</option>
          <option value="Contract">Contract</option>
          <option value="Internship">Internship</option>
          <option value="Remote">Remote</option>
        </select>
      </div>

      {/* Main Panel */}
      <div className="flex flex-1 gap-4 overflow-hidden">
        {/* Job List */}
        <div className="md:w-1/3 bg-white rounded shadow overflow-y-auto max-h-full">
          <ul className="divide-y">
            {paginatedJobs.length === 0 && (
              <li className="p-4 text-center text-gray-500">No jobs found.</li>
            )}
            {paginatedJobs.map((job) => (
              <li
                key={job.id}
                onClick={() => setSelectedJob(job)}
                className={`cursor-pointer p-4 hover:bg-gray-100 ${
                  selectedJob?.id === job.id ? 'bg-blue-100' : ''
                }`}
              >
                <h3 className="font-semibold">{job.title}</h3>
                <p className="text-sm text-gray-600">
                  {job.company?.company_name || 'Unknown Company'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {job.location || 'Location not specified'}
                </p>
                <p className="text-xs text-gray-500">
                  {job.salary_range ||
                    (job.salary_min && job.salary_max
                      ? `RM${job.salary_min.toLocaleString()} - RM${job.salary_max.toLocaleString()}`
                      : 'Salary not specified')}
                </p>
                <p className="text-xs text-gray-500">{job.job_type || ''}</p>
              </li>
            ))}
          </ul>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center px-4 py-2 border-t">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="text-blue-600 disabled:text-gray-400"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="text-blue-600 disabled:text-gray-400"
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* Job Details */}
        <div className="flex-1 bg-white rounded shadow p-6 overflow-y-auto max-h-full">
          {!selectedJob ? (
            <p className="text-center text-gray-500 mt-20">Select a job to see details</p>
          ) : (
            <>
              <h1 className="text-2xl font-bold mb-2">{selectedJob.title}</h1>
              <h2 className="text-lg font-semibold text-gray-700 mb-1">
                {selectedJob.company?.company_name || 'Unknown Company'}
              </h2>
              <p className="text-sm text-gray-500 mb-2">
                {selectedJob.location || 'Location N/A'}
              </p>
              <div className="mb-4 whitespace-pre-line">
                <ReactMarkdown>
                  {selectedJob.description || 'No description provided.'}
                </ReactMarkdown>
              </div>

              <div className="border-t pt-4 text-sm text-gray-600 space-y-1">
                <p>
                  <span className="font-semibold">Job Type:</span>{' '}
                  {selectedJob.job_type || 'Not specified'}
                </p>
                <p>
                  <span className="font-semibold">Salary Range:</span>{' '}
                  {selectedJob.salary_range ||
                    (selectedJob.salary_min && selectedJob.salary_max
                      ? `RM${selectedJob.salary_min.toLocaleString()} - RM${selectedJob.salary_max.toLocaleString()}`
                      : 'Not specified')}
                </p>
                <p>
                  <span className="font-semibold">Posted On:</span>{' '}
                  {new Date(selectedJob.created_at).toLocaleDateString()}
                </p>
              </div>

              {/* Apply Button */}
              <div className="mt-6">
                <Link
                  href={`/apply/${selectedJob.id}`}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Apply Now
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
