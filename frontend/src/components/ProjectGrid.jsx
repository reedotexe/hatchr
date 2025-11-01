import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/useAuth';
import API from '../lib/api';

export default function ProjectGrid({ projects, onRefresh }) {
    const navigate = useNavigate();
    const currentUser = useAuth(state => state.user);
    const [menuOpen, setMenuOpen] = useState(null);
    const menuRef = useRef(null);
    const [loadingDelete, setLoadingDelete] = useState(false);

    // Handle click outside for menu
    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setMenuOpen(null);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [menuRef]);

    const handleProjectClick = (e, projectId) => {
        if (e.target.closest('.project-menu')) {
            e.stopPropagation();
            return;
        }
        navigate(`/project/${projectId}`);
    };

    const handleDeleteProject = async (projectId) => {
        if (!window.confirm('Are you sure you want to delete this project?')) return;

        try {
            setLoadingDelete(true);
            await API.delete(`/projects/${projectId}`);
            setMenuOpen(null);
            if (onRefresh) onRefresh();
        } catch (err) {
            console.error('Error deleting project:', err);
            alert('Failed to delete project');
        } finally {
            setLoadingDelete(false);
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map(project => (
                <div
                    key={project._id}
                    onClick={(e) => handleProjectClick(e, project._id)}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer relative"
                >
                    {/* Three Dot Menu */}
                    {currentUser && project.user._id === currentUser._id && (
                        <div className="absolute top-2 right-2 z-10 project-menu">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setMenuOpen(menuOpen === project._id ? null : project._id);
                                }}
                                className="p-1 hover:bg-black/10 rounded-full transition-colors"
                            >
                                <svg className="w-6 h-6 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                                </svg>
                            </button>

                            {/* Dropdown Menu */}
                            {menuOpen === project._id && (
                                <div
                                    ref={menuRef}
                                    className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-50 py-1"
                                >
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteProject(project._id);
                                        }}
                                        disabled={loadingDelete}
                                        className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        {loadingDelete ? 'Deleting...' : 'Delete Project'}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Project Cover Image */}
                    <div className="aspect-video bg-gray-100 relative">
                        {project.coverImage ? (
                            <img
                                src={project.coverImage}
                                alt={project.title}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                                <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M13.5 21v-7.5a.75.75 0 01.75-.75h6.75a.75.75 0 01.75.75v7.5a.75.75 0 01-.75.75h-6.75a.75.75 0 01-.75-.75zM4.5 3h15a1.5 1.5 0 011.5 1.5v3.75a.75.75 0 01-.75.75H3.75a.75.75 0 01-.75-.75V4.5A1.5 1.5 0 014.5 3z" />
                                </svg>
                            </div>
                        )}
                    </div>

                    {/* Project Info */}
                    <div className="p-4">
                        <div className="mb-2">
                            <h3 className="font-semibold text-lg truncate">{project.title}</h3>
                        </div>

                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                            {project.description || 'No description provided'}
                        </p>

                        <div className="flex items-center justify-between text-sm text-gray-500">
                            <div className="flex items-center gap-2">
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                </svg>
                                {project.postCount || 0} posts
                            </div>
                            <div>{new Date(project.updatedAt).toLocaleDateString()}</div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}