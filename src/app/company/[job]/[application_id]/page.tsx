'use client';

import { useRouter } from 'next/navigation';

type ApplicantProfile = {
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  resume_url?: string;
  cover_letter_url?: string;
  img_url?: string;
};

type Analysis = {
  candidate_summary: string;
  relevant_experience_summary: string;
  competency_score: number;
  competency_reasoning: string;
  compatibility_score: number;
  compatibility_reasoning: string;
  created_at: string;
};

export default function ApplicantDetailPage() {
  const router = useRouter();

  // Hardcoded dummy data for prototyping
  const profile: ApplicantProfile = {
    first_name: 'Ethan',
    last_name: 'Lee',
    email: 'ethanlee.zj@gmail.com',
    phone: '0125922388',
    linkedin: 'https://linkedin.com/in/janedoe',
    resume_url: 'https://example.com/jane_doe_resume.pdf',
    cover_letter_url: 'https://example.com/jane_doe_cover_letter.pdf',
    img_url: '/profilepic.png',
  };

  const analysis: Analysis = {
    candidate_summary: 'Experienced software engineer with a strong background in full-stack development.',
    relevant_experience_summary: '5 years of experience with React, Node.js, and cloud services.',
    competency_score: 87,
    competency_reasoning: 'Demonstrated expertise in building scalable web applications.',
    compatibility_score: 92,
    compatibility_reasoning: 'Strong alignment with company values and team culture.',
    created_at: new Date().toISOString(),
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 font-mono">
      <button
        onClick={() => router.back()}
        className="mb-6 px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
      >
        ← Back
      </button>

      {/* Profile Section */}
      <div className="bg-white rounded shadow-md p-6 mb-8 border border-gray-200">
        <h2 className="text-2xl font-bold mb-4 text-firered">Applicant Profile</h2>
        <div className="flex flex-col md:flex-row md:items-start gap-6">
          {profile.img_url && (
            <img
              src={profile.img_url}
              alt="Profile"
              className="w-32 h-32 object-cover rounded-full border"
            />
          )}
          <div>
            <p>
              <strong>Name:</strong> {profile.first_name} {profile.last_name}
            </p>
            <p>
              <strong>Email:</strong> {profile.email || 'N/A'}
            </p>
            <p>
              <strong>Phone:</strong> {profile.phone || 'N/A'}
            </p>
            {profile.linkedin && (
              <p>
                <strong>LinkedIn:</strong>{' '}
                <a
                  href={profile.linkedin}
                  className="text-blue-600 underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View
                </a>
              </p>
            )}
            {profile.resume_url && (
              <p>
                <strong>Resume:</strong>{' '}
                <a
                  href={profile.resume_url}
                  className="text-blue-600 underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Download
                </a>
              </p>
            )}
            {profile.cover_letter_url && (
              <p>
                <strong>Cover Letter:</strong>{' '}
                <a
                  href={profile.cover_letter_url}
                  className="text-blue-600 underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Download
                </a>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Application Analysis Section */}
      <div className="bg-white rounded shadow-md p-6 border border-gray-200">
        <h2 className="text-2xl font-bold mb-6 text-firered">Application Analysis</h2>

        {/* Candidate Summary & Experience */}
        <div className="mb-6 space-y-4">
          <div>
            <strong>Candidate Summary:</strong>
            <p className="text-gray-700 mt-1">{analysis.candidate_summary}</p>
          </div>
          <div>
            <strong>Relevant Experience:</strong>
            <p className="text-gray-700 mt-1">{analysis.relevant_experience_summary}</p>
          </div>
        </div>

        {/* Grid for scores and reasonings */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-6 border-t border-gray-300 pt-6">
          {/* Competency */}
          <div className="space-y-1">
            <p className="font-semibold">Competency Score:</p>
            <p>{analysis.competency_score}</p>
          </div>
          <div className="space-y-1">
            <p className="font-semibold">Competency Reasoning:</p>
            <p>{analysis.competency_reasoning}</p>
          </div>

          <div className="col-span-2">
            <hr className="my-4 border-gray-200" />
          </div>

          {/* Compatibility */}
          <div className="space-y-1">
            <p className="font-semibold">Compatibility Score:</p>
            <p>{analysis.compatibility_score}</p>
          </div>
          <div className="space-y-1">
            <p className="font-semibold">Compatibility Reasoning:</p>
            <p>{analysis.compatibility_reasoning}</p>
          </div>

          <div className="col-span-2">
            <hr className="my-4 border-gray-200" />
          </div>

          {/* Analyzed At */}
          <div className="col-span-2">
            <p className="font-semibold">Analyzed At:</p>
            <p>{new Date(analysis.created_at).toLocaleString()}</p>
          </div>
        </div>
      </div>


    </div>
  );
}
