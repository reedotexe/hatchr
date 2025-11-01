import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import API from '../lib/api';
import ProfileHeader from '../components/ProfileHeader';
import EditProfileModal from '../components/EditProfileModal';
import ProjectGrid from '../components/ProjectGrid';
import { useAuth } from '../store/useAuth';

export default function Profile() {
  const { username } = useParams();
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const currentUser = useAuth(state => state.user);

  useEffect(() => {
    loadProfile();
  }, [username]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const [userRes, projectsRes] = await Promise.all([
        API.get(`/users/${username}`),
        API.get(`/projects/user/${username}`)
      ]);

      setUser(userRes.data.user);
      setProjects(projectsRes.data);
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = (updatedUser) => {
    setUser(updatedUser);
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-48 bg-gray-200 rounded-lg mb-6"></div>
          <div className="grid grid-cols-3 gap-6">
            <div className="h-64 bg-gray-200 rounded-lg"></div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center text-gray-500">User not found</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <ProfileHeader
        user={user}
        onEditClick={() => setShowEditModal(true)}
      />

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Projects</h2>
        {projects.length === 0 ? (
          <div className="text-center text-gray-500 py-12 bg-white rounded-lg shadow">
            No projects yet
          </div>
        ) : (
          <ProjectGrid projects={projects} onRefresh={loadProfile} />
        )}
      </div>

      {showEditModal && (
        <EditProfileModal
          user={user}
          onClose={() => setShowEditModal(false)}
          onUpdate={handleProfileUpdate}
        />
      )}
    </div>
  );
}
