import React, { useState } from 'react';
import API from '../lib/api';
import { useImage } from '../hooks/useImage';
import { useAuth } from '../store/useAuth';

const categories = [
    'AI/ML',
    'Web Development',
    'Mobile Apps',
    'IoT',
    'Robotics',
    'Game Development',
    'Data Science',
    'Blockchain',
    'Cybersecurity',
    'Other'
];

export default function ProjectModal({ isOpen, onClose, onSuccess }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState(categories[0]);
    const [status, setStatus] = useState('in-progress');
    const [coverImage, setCoverImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', description);
            formData.append('category', category);

            if (coverImage) {
                formData.append('coverImage', coverImage);
            }

            const response = await API.post('/projects', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            onSuccess(response.data);
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create project');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                <h2 className="text-2xl font-bold mb-4">Create New Project</h2>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Project Title
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                            placeholder="Enter project title"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Description
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows="3"
                            placeholder="Describe your project"
                        ></textarea>
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Category
                        </label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>
                                    {cat}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Cover Image
                        </label>
                        <input
                            type="file"
                            onChange={(e) => {
                                const file = e.target.files[0];
                                if (file && file.type.startsWith('image/')) {
                                    setCoverImage(file);
                                    setError('');
                                } else if (file) {
                                    setError('Please select an image file');
                                    e.target.value = '';
                                }
                            }}
                            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            accept="image/*"
                        />
                    </div>

                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                        >
                            {loading ? 'Creating...' : 'Create Project'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}