'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function CompanyProfileModal() {
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [profileExists, setProfileExists] = useState(false);
    const [error, setError] = useState('');
    const [form, setForm] = useState({
        company_name: '',
        email: '',
        phone: '',
        website: '',
        location: '',
        description: '',
        logo_url: '',
    });
    const [logoFile, setLogoFile] = useState<File | null>(null);

    useEffect(() => {
        const checkProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('company_profiles')
                .select('id')
                .eq('user_id', user.id)
                .single();
                setProfileExists(!!data)

            if (!data) {
                setShowModal(true);
            }
        };

        checkProfile();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.size > 2 * 1024 * 1024) {
            setError('Logo must be under 2MB');
            return;
        }
        setLogoFile(file || null);
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError('');

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            setError('Not logged in');
            setLoading(false);
            return;
        }

        let logo_url = '';
        if (logoFile) {
            const { data, error: uploadError } = await supabase.storage
                .from('company-logos')
                .upload(`logo-${user.id}`, logoFile, {
                    cacheControl: '3600',
                    upsert: true,
                });

            if (uploadError) {
                setError('Failed to upload logo');
                setLoading(false);
                return;
            }

            const { data: publicUrlData } = supabase
                .storage
                .from('company-logos')
                .getPublicUrl(`logo-${user.id}`);

            logo_url = publicUrlData.publicUrl;
        }

        const { error: insertError } = await supabase.from('company_profiles').insert({
            user_id: user.id,
            ...form,
            logo_url,
        });

        if (insertError) {
            setError('Failed to create profile');
        } else {
            setShowModal(false);
        }

        setLoading(false);
    };

    if (!showModal) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 rounded shadow-lg space-y-4 font-mono">
                {profileExists && (
                    <button
                        onClick={() => setShowModal(false)}
                        className="absolute top-4 right-4 text-gray-500 hover:text-black text-2xl font-bold"
                        aria-label="Close"
                    >
                        ×
                    </button>
                )}
                
                <h2 className="text-2xl font-bold mb-4">Set Up Company Profile</h2>

                {error && <p className="text-red-600">{error}</p>}

                {['company_name', 'email', 'phone', 'website', 'location'].map((field) => (
                    <div key={field}>
                        <label className="block font-semibold capitalize">{field.replace('_', ' ')}</label>
                        <input
                            name={field}
                            value={form[field as keyof typeof form]}
                            onChange={handleChange}
                            className="w-full border px-4 py-2 rounded"
                            required
                        />
                    </div>
                ))}

                <div>
                    <label className="block font-semibold">Description</label>
                    <textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        rows={3}
                        className="w-full border px-4 py-2 rounded"
                    />
                </div>

                <div>
                    <label className="block font-semibold">Company Logo (Max 2MB)</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="block w-full text-sm"
                    />
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="bg-firered hover:bg-red-600 text-white px-6 py-2 rounded"
                    >
                        {loading ? 'Saving...' : 'Submit'}
                    </button>
                </div>
            </div>
        </div>
    );
}
