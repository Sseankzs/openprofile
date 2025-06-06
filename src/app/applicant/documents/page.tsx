'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Document = {
  id: string;
  user_id: string;
  file_type: 'resume' | 'cover-letter';
  file_path: string;
  uploaded_at: string;
};

export default function DocumentUploadPage() {
  const router = useRouter();

  const [documents, setDocuments] = useState<Document[]>([]);
  const [activeTab, setActiveTab] = useState<'resume' | 'cover-letter'>('resume');
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
  const [fileUpload, setFileUpload] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [userID, setUserID] = useState<string | null>(null);

  // Fetch user and documents from DB
  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }
      setUserID(user.id);

      const { data: docs, error } = await supabase
        .from('user_documents')
        .select('*')
        .eq('user_id', user.id)
        .eq('file_type', activeTab)
        .order('uploaded_at', { ascending: false });

      if (error) {
        console.error('Error fetching documents:', error);
        return;
      }
      setDocuments(docs || []);
      setSelectedDoc(
        docs && docs.length > 0
          ? supabase.storage.from(activeTab === 'resume' ? 'resumes' : 'cover-letters').getPublicUrl(docs[0].file_path).data.publicUrl
          : null
      );
    };
    fetchData();
  }, [router, activeTab]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userID || !fileUpload) return;
    setUploading(true);

    try {
      const bucket = activeTab === 'resume' ? 'resumes' : 'cover-letters';
      const timestamp = Date.now();
      const filename = `${activeTab}-${userID}-${timestamp}.pdf`;
      const filePath = `${filename}`;

      // Upload file to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, fileUpload, { cacheControl: '3600', upsert: false });

      if (uploadError) throw uploadError;

      // Insert record in DB
      const { data: insertData, error: insertError } = await supabase
        .from('user_documents')
        .insert({
          user_id: userID,
          file_type: activeTab,
          file_path: filePath,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Update UI
      setDocuments(prev => [insertData, ...prev]);

      // Update selected document preview
      const publicUrl = supabase.storage.from(bucket).getPublicUrl(filePath).data.publicUrl;
      setSelectedDoc(publicUrl);
      setFileUpload(null);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed, please try again.');
    }

    setUploading(false);
  };

  const files = documents.map(doc =>
    supabase.storage.from(activeTab === 'resume' ? 'resumes' : 'cover-letters').getPublicUrl(doc.file_path).data.publicUrl
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold text-center mb-4">Manage Your Documents</h1>

      <div className="flex justify-center mb-4">
        <button
          onClick={() => setActiveTab('resume')}
          className={`px-4 py-2 border-b-2 ${activeTab === 'resume' ? 'border-blue-600 text-blue-600' : 'border-transparent'}`}
        >
          Resumes
        </button>
        <button
          onClick={() => setActiveTab('cover-letter')}
          className={`px-4 py-2 border-b-2 ${activeTab === 'cover-letter' ? 'border-blue-600 text-blue-600' : 'border-transparent'}`}
        >
          Cover Letters
        </button>
      </div>

      <div className="flex gap-6">
        <div className="w-1/3 border rounded-lg bg-white p-4 h-[500px] overflow-y-auto">
          <h2 className="font-semibold mb-2">{activeTab === 'resume' ? 'Resumes' : 'Cover Letters'}</h2>
          <ul className="space-y-2">
            {files.map((url, i) => (
              <li key={i}>
                <button
                  onClick={() => setSelectedDoc(url)}
                  className={`text-left w-full truncate p-2 rounded hover:bg-gray-100 ${selectedDoc === url ? 'bg-blue-100' : ''}`}
                >
                  {decodeURIComponent(url.split('/').pop()!)}
                </button>
              </li>
            ))}
          </ul>
          {/* Upload section above header */}
          <form onSubmit={handleUpload} className="mt-6">
            <label className="block text-sm font-medium mb-1">Upload {activeTab === 'resume' ? 'Resume' : 'Cover Letter'}</label>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setFileUpload(e.target.files?.[0] || null)}
              className="w-full border p-2 rounded"
              required
            />
            <button
              type="submit"
              disabled={uploading}
              className="mt-3 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
            >
              {uploading ? 'Uploading...' : `Upload ${activeTab === 'resume' ? 'Resume' : 'Cover Letter'}`}
            </button>
          </form>
        </div>

        <div className="flex-1 border rounded-lg bg-white p-4">
          {selectedDoc ? (
            <iframe
              src={selectedDoc}
              className="w-full h-[500px] border"
              title="Document Preview"
            />
          ) : (
            <p className="text-center text-gray-500">Select a document to preview</p>
          )}
        </div>
      </div>
    </div>
  );
}
