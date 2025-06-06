'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

type Job = {
  id: string;
  title: string;
  location: string;
  salary_min?: number;
  salary_max?: number;
  job_type?: string;
  description: string;
};

type Applicant = {
  id: string;
  name: string;
  compatibility_score: number;
  competency_score: number;
  description: string;
};

export default function JobDetailsPage() {
  const { job } = useParams(); // job ID
  const router = useRouter();
  
  const [jobDetails, setJobDetails] = useState<Job | null>(null);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [sortBy, setSortBy] = useState<'compatibility_score' | 'competency_score' | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    if (!job) return;

    const fetchData = async () => {
      const { data: jobData } = await supabase
        .from('jobs')
        .select('id, title, location, salary_min, salary_max, job_type, description')
        .eq('id', job)
        .single();

      setJobDetails(jobData);

      const { data: applicationData, error } = await supabase
        .from('applications')
        .select(`
          id,
          first_name,
          last_name,
          job_id,
          application_analysis (
            compatibility_score,
            competency_score
          )
        `)
        .eq('job_id', job); // Use job ID from the page params

      if (error) {
        console.error('Error fetching applicants:', error.message);
      } else {
        const formattedApplicants = (applicationData || []).map((app: any) => ({
          id: app.id,
          name: `${app.first_name} ${app.last_name}`,
          compatibility_score: app.application_analysis?.compatibility_score ?? 0,
          competency_score: app.application_analysis?.competency_score ?? 0,
          description: jobDetails?.description || '', // Reuse job description already fetched
        }));
        setApplicants(formattedApplicants);
      }



    };

    fetchData();
  }, [job]);

  const handleSort = (field: 'compatibility_score' | 'competency_score') => {
    if (sortBy === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const sortedApplicants = [...applicants].sort((a, b) => {
    if (!sortBy) return 0;
    const dir = sortOrder === 'asc' ? 1 : -1;
    return (a[sortBy] - b[sortBy]) * dir;
  });

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 font-mono">
      {/* Job Summary */}
      {jobDetails && (
        <div className="bg-white rounded shadow-md p-6 mb-10 border border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
            <h1 className="text-3xl font-bold text-firered">{jobDetails.title}</h1>
            {jobDetails.job_type && (
              <span className="text-sm px-3 py-1 rounded-full bg-blue-100 text-blue-600 mt-2 md:mt-0">
                {jobDetails.job_type}
              </span>
            )}
          </div>

          <p className="text-gray-600 mb-1">
            <strong>Location:</strong> {jobDetails.location}
          </p>

          {(jobDetails.salary_min || jobDetails.salary_max) && (
            <div className="flex justify-between items-center text-gray-600 mb-2">
              <p>
                <strong>Salary:</strong> RM{jobDetails.salary_min?.toLocaleString()} – RM{jobDetails.salary_max?.toLocaleString()}
              </p>
              <button
                onClick={() => router.push(`/company/${jobDetails.id}/edit`)}
                className="ml-4 px-4 py-1 text-sm bg-fireopal text-white rounded hover:bg-crowblack transition"
              >
                Edit Job
              </button>
            </div>
          )}
        </div>
      )}


      {/* Applicant Table */}
      <div className="bg-white rounded shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">Applicants</h2>
        {sortedApplicants.length > 0 ? (
          <table className="w-full text-left border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2">Name</th>
                <th
                  className="px-4 py-2 cursor-pointer"
                  onClick={() => handleSort('competency_score')}
                >
                  Competency Score {sortBy === 'competency_score' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                </th>
                <th
                  className="px-4 py-2 cursor-pointer"
                  onClick={() => handleSort('compatibility_score')}
                >
                  Compatibility Score {sortBy === 'compatibility_score' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                </th>
                <th className="px-4 py-2">Summary</th>
              </tr>
            </thead>
            <tbody>
              {sortedApplicants.map(applicant => (
                <tr
                  key={applicant.id}
                  onClick={() => router.push(`/company/${job}/${applicant.id}`)}
                  className="hover:bg-gray-50 cursor-pointer"
                >
                  <td className="px-4 py-2 font-medium text-firered">{applicant.name}</td>
                  <td className="px-4 py-2">{applicant.competency_score}</td>
                  <td className="px-4 py-2">{applicant.compatibility_score}</td>
                  <td className="px-4 py-2 text-sm text-gray-600">{applicant.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-500">No applicants yet.</p>
        )}
      </div>
    </div>
  );
}
