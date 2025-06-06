'use client';

import { useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useRoleContext } from '@/app/components/role-context';


export default function EditCompanyModal({ profile, onClose, onUpdate, forceOpen = false }: any) {
  const [companyName, setCompanyName] = useState(profile?.company_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [website, setWebsite] = useState(profile?.website || '');
  const [description, setDescription] = useState(profile?.description || '');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { setRole } = useRoleContext();

const handleSwitchRole = () => {
  const newRole = "applicant";
  localStorage.setItem("selectedRole", newRole);
  setRole(newRole);  // update global state
  router.refresh();
};


  const handleClick = () => {
    handleSwitchRole(); 
    router.push('/applicant/dashboard');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (imageFile && imageFile.size > 1 * 1024 * 1024) {
      setError('Image must be under 1MB');
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    let logoUrl = profile?.logo_url || '';

    if (imageFile) {
      const { error: uploadError } = await supabase.storage
        .from('company-logos')
        .upload(`logo-${user.id}`, imageFile, {
          upsert: true,
          cacheControl: '3600',
        });

      if (uploadError) {
        setError('Failed to upload logo: ' + uploadError.message);
        return;
      }

      const { data: publicUrl } = supabase.storage
        .from('company-logos')
        .getPublicUrl(`logo-${user.id}`);
      logoUrl = publicUrl.publicUrl;
    }

    const { error: updateError } = await supabase.from('company_profiles').upsert({
      user_id: user.id,
      company_name: companyName,
      phone,
      website,
      description,
      logo_url: logoUrl,
      email: user.email, // Save current email
    });

    if (updateError) {
      setError('Failed to update profile');
      return;
    }

    onUpdate();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <h2 className="text-xl font-bold">Complete Your Company Profile</h2>

          {error && <p className="text-red-500">{error}</p>}

          <input
            type="text"
            placeholder="Company Name"
            className="border border-gray-300 rounded px-4 py-2 w-full"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            required
          />

          <input
            type="text"
            placeholder="Phone Number"
            className="border border-gray-300 rounded px-4 py-2 w-full"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <input
            type="url"
            placeholder="Website"
            className="border border-gray-300 rounded px-4 py-2 w-full"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />

          <textarea
            placeholder="Company Description"
            className="border border-gray-300 rounded px-4 py-2 w-full min-h-[100px]"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div>
            <label className="block mb-1 font-medium">Company Logo (max 1MB)</label>
            <input
              type="file"
              accept="image/*"
              ref={fileRef}
              className="border border-gray-300 rounded px-4 py-2 w-full"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setImageFile(file);
              }}
            />
          </div>

          <div className="flex justify-between mt-4">
            
            {!forceOpen && (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 mr-4 bg-gray-300 rounded"
              >
                Cancel
              </button>
            )}

            {!profile?.company_name && (
              <button
                type="button"
                className="px-4 py-2 bg-gray-300 rounded transition"
                onClick={handleClick}>
                Back to Applicant Profile
              </button>
            )}

            <button type="submit" className="px-4 py-2 bg-firered hover:bg-crowblack text-white rounded transition">
              Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
