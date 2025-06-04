'use client';
import { useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';

export default function EditProfileModal({ profile, onClose, onUpdate, forceOpen = false }: any) {
  const [firstName, setFirstName] = useState(profile?.firstName || '');
  const [lastName, setLastName] = useState(profile?.lastName || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [linkedin, setLinkedin] = useState(profile?.linkedin || '');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (imageFile && imageFile.size > 1 * 1024 * 1024) {
      setError('Image must be under 1MB');
      return;
    }

    const {
      data: { user }
    } = await supabase.auth.getUser();
    if (!user) return;

    let imageUrl = profile?.img_url;
    if (imageFile) {
      const { data, error: uploadError } = await supabase.storage
        .from('applicant-images')
        .upload(`profile-${user.id}`, imageFile, {
          upsert: true,
          cacheControl: '3600',
        });

      if (uploadError) {
        setError('Failed to upload image' + uploadError.message);
        return;
      }

      const { data: publicUrl } = supabase.storage
        .from('applicant-images')
        .getPublicUrl(`profile-${user.id}`);
      imageUrl = publicUrl.publicUrl;
    }

    const { error: updateError } = await supabase
      .from('applicant_profiles')
      .upsert({
        user_id: user.id,
        first_name: firstName,
        last_name: lastName,
        phone,
        linkedin,
        img_url: imageUrl,
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
          <h2 className="text-xl font-bold">Complete Your Profile</h2>

          {error && <p className="text-red-500">{error}</p>}

          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="First Name"
              className="border border-gray-300 rounded px-4 py-2 w-full"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Last Name"
              className="border border-gray-300 rounded px-4 py-2 w-full"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>

          <input
            type="text"
            placeholder="Phone Number"
            className="border border-gray-300 rounded px-4 py-2 w-full"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <input
            type="url"
            placeholder="LinkedIn URL"
            className="border border-gray-300 rounded px-4 py-2 w-full"
            value={linkedin}
            onChange={(e) => setLinkedin(e.target.value)}
          />

          <div>
            <label className="block mb-1 font-medium">Profile Image (max 1MB)</label>
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

          <div className="flex justify-end mt-4">
            {!forceOpen && (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 mr-4 bg-gray-300 rounded"
              >
                Cancel
              </button>
            )}
            <button type="submit" className="px-4 py-2 bg-firered text-white rounded">
              Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
