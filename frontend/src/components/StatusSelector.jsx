import React from 'react';
import API from '../lib/api';

export default function StatusSelector({ project, onUpdate, isOwner }) {
    const getStatusColor = (status) => {
        switch (status) {
            case 'completed':
                return 'bg-green-50 text-green-700 border-green-200';
            case 'in-progress':
                return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'on-hold':
                return 'bg-yellow-50 text-yellow-700 border-yellow-200';
            default:
                return 'bg-gray-50 text-gray-700 border-gray-200';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'completed':
                return 'Completed';
            case 'in-progress':
                return 'In Progress';
            case 'on-hold':
                return 'On Hold';
            default:
                return 'In Progress';
        }
    };

    const handleStatusChange = async (newStatus) => {
        try {
            const res = await API.patch(`/projects/${project._id}/status`, {
                status: newStatus
            });
            if (onUpdate) {
                onUpdate(res.data);
            }
        } catch (err) {
            console.error('Failed to update status:', err);
            alert('Failed to update project status');
        }
    };

    if (isOwner) {
        return (
            <div className="relative">
                <select
                    value={project.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className={`px-3 py-1 rounded-lg text-sm cursor-pointer border appearance-none pr-8 ${getStatusColor(project.status)}`}
                >
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="on-hold">On Hold</option>
                </select>
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>
        );
    }

    return (
        <span className={`px-3 py-1 rounded-lg text-sm border ${getStatusColor(project.status)}`}>
            {getStatusLabel(project.status)}
        </span>
    );
}