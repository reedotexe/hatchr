import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../lib/api';
import PostCard from '../components/PostCard';
import { useImage } from '../hooks/useImage';
import { useAuth } from '../store/useAuth';

export default function ProjectPage() {
    const { projectId } = useParams();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const currentUser = useAuth(state => state.user);
    const [imageError, setImageError] = useState(false);

    useEffect(() => {
        if (projectId) {
            fetchProject();
        }
    }, [projectId]);

    async function fetchProject() {
        try {
            setLoading(true);
            setImageError(false);
            const res = await API.get(`/projects/${projectId}`);

            if (res.data && typeof res.data === 'object') {
                console.log('Project data:', res.data); // Debug log
                setProject(res.data);

                // Preload the cover image if it exists
                if (res.data.coverImage) {
                    const img = new Image();
                    img.onerror = () => setImageError(true);
                    img.src = res.data.coverImage;
                }
            } else {
                throw new Error('Invalid project data received');
            }
        } catch (err) {
            console.error('Error fetching project:', err);
            setError(err.response?.data?.message || 'Failed to load project');
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <div className="text-red-500 mb-4">{error}</div>
                <button
                    onClick={() => navigate(-1)}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Go Back
                </button>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <div className="text-gray-500 mb-4">Project not found</div>
                <button
                    onClick={() => navigate(-1)}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            {/* Project Header */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
                {/* Cover Image */}
                <div className="relative h-48 sm:h-64 md:h-80">
                    {project.coverImage && !imageError ? (
                        <div className="w-full h-full">
                            <img
                                src={project.coverImage}
                                alt={project.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    console.error('Error loading cover image');
                                    setImageError(true);
                                }}
                                loading="eager"
                            />
                        </div>
                    ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                            <span className="text-gray-400">
                                {imageError ? 'Failed to load cover image' : 'No cover image'}
                            </span>
                        </div>
                    )}
                </div>

                {/* Project Info */}
                <div className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                        {/* Author Info */}
                        <img
                            src={project.user?.avatar || '/placeholder-avatar.png'}
                            alt={project.user?.username}
                            className="w-10 h-10 rounded-full"
                        />
                        <div>
                            <div
                                className="font-semibold hover:underline cursor-pointer"
                                onClick={() => navigate(`/profile/${project.user?.username}`)}
                            >
                                {project.user?.username}
                            </div>
                            <div className="text-sm text-gray-500">
                                Created {new Date(project.createdAt).toLocaleDateString()}
                            </div>
                        </div>
                    </div>

                    <h1 className="text-2xl font-bold mb-2">{project.title}</h1>
                    <p className="text-gray-600 mb-4">{project.description}</p>
                </div>
            </div>

            {/* Project Posts Timeline */}
            <div className="space-y-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Project Updates</h2>
                    {project.user?._id === currentUser?._id && (
                        <button
                            onClick={() => navigate(`/post/new?project=${project._id}`)}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add Update
                        </button>
                    )}
                </div>

                {project.posts && project.posts.length > 0 ? (
                    <div className="relative">
                        {/* Timeline Line */}
                        <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200"></div>

                        {/* Posts */}
                        <div className="space-y-8">
                            {project.posts.map(post => (
                                <div key={post._id} className="relative pl-12">
                                    {/* Timeline Dot */}
                                    <div className="absolute left-4 top-5 w-3 h-3 bg-blue-500 rounded-full transform -translate-x-1/2"></div>

                                    {/* Post Card */}
                                    <PostCard post={post} onUpdate={fetchProject} />
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow p-8 text-center">
                        <div className="mb-4">
                            <svg className="w-16 h-16 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">No updates yet</h3>
                        <p className="text-gray-500 mb-4">This project doesn't have any updates posted yet.</p>
                        {project.user?._id === currentUser?._id && (
                            <button
                                onClick={() => navigate(`/post/new?project=${project._id}`)}
                                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors inline-flex items-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Add First Update
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}