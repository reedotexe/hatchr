import React from 'react';
import { useAuth } from '../store/useAuth';

export default function ProfileHeader({ user, onEditClick }) {
    const currentUser = useAuth(state => state.user);
    const isOwnProfile = currentUser && (currentUser._id === user._id || currentUser.username === user.username);

    return (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
                {/* Avatar */}
                <div className="relative group">
                    <img
                        src={user.avatar || '/placeholder-avatar.png'}
                        alt={`${user.username}'s avatar`}
                        className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                    {isOwnProfile && (
                        <button
                            onClick={() => onEditClick('avatar')}
                            className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full shadow hover:bg-blue-600 transition-colors"
                            title="Change avatar"
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 16.5v2.25A2.25 2.25 0 005.25 21h2.25m-4.5-9L17.25 21M21 3v2.25A2.25 2.25 0 0118.75 7.5h-2.25m4.5-9L7.5 21" />
                            </svg>
                        </button>
                    )}
                </div>

                {/* User Info */}
                <div className="flex-1 text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-4 mb-2">
                        <h1 className="text-2xl font-bold">{user.name}</h1>
                        <span className="text-gray-500">@{user.username}</span>
                    </div>

                    <p className="text-gray-600 mb-4">{user.bio || 'No bio yet'}</p>

                    <div className="flex items-center justify-center md:justify-start gap-6">
                        <div className="text-center">
                            <div className="font-semibold">{user.followers?.length || 0}</div>
                            <div className="text-gray-500 text-sm">Followers</div>
                        </div>
                        <div className="text-center">
                            <div className="font-semibold">{user.following?.length || 0}</div>
                            <div className="text-gray-500 text-sm">Following</div>
                        </div>
                    </div>
                </div>

                {/* Edit Profile Button */}
                {isOwnProfile && (
                    <button
                        onClick={() => onEditClick('profile')}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        Edit Profile
                    </button>
                )}
            </div>
        </div>
    );
}