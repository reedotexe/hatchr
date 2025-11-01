import React, { useState, useRef } from 'react';
import API from '../lib/api';

export default function EditProfileModal({ user, onClose, onUpdate }) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: user.name || '',
        bio: user.bio || '',
    });
    const fileInputRef = useRef(null);

    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('Image size must be less than 5MB');
            return;
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        try {
            setLoading(true);
            const formData = new FormData();
            formData.append('avatar', file);

            const response = await API.post('/users/avatar', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data.success) {
                onUpdate(response.data.user);
            } else {
                throw new Error(response.data.message || 'Failed to update avatar');
            }
        } catch (error) {
            console.error('Failed to update avatar:', error);
            alert(error.response?.data?.message || 'Failed to update avatar. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const response = await API.put(`/users/${user._id}`, {
                name: formData.name,
                bio: formData.bio
            });
            if (response.data.success) {
                onUpdate(response.data.user);
                onClose();
            }
        } catch (error) {
            console.error('Failed to update profile:', error);
            // Show error to user
            alert('Failed to update profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Edit Profile</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Avatar */}
                    <div className="flex flex-col items-center gap-2">
                        <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
                            <img
                                src={user.avatar || '/placeholder-avatar.png'}
                                alt="Avatar"
                                className="w-24 h-24 rounded-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <span className="text-white text-sm">Change Avatar</span>
                            </div>
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleAvatarChange}
                            accept="image/*"
                            className="hidden"
                        />
                    </div>

                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Name
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    {/* Bio */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Bio
                        </label>
                        <textarea
                            name="bio"
                            value={formData.bio}
                            onChange={handleChange}
                            rows={3}
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Tell us about yourself..."
                        />
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}