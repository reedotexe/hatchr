import React from 'react';
import PostCard from './PostCard';

export default function ProjectTimeline({ project }) {
    // Group posts by month
    const groupedPosts = project.posts?.reduce((groups, post) => {
        const date = new Date(post.createdAt);
        const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' });

        if (!groups[monthYear]) {
            groups[monthYear] = [];
        }
        groups[monthYear].push(post);
        return groups;
    }, {}) || {};

    return (
        <div className="max-w-3xl mx-auto">
            {/* Project Header */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-bold">{project.title}</h1>
                    <span className={`px-3 py-1 rounded-full text-sm ${project.status === 'completed' ? 'bg-green-100 text-green-800' :
                            project.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                                'bg-yellow-100 text-yellow-800'
                        }`}>
                        {project.status}
                    </span>
                </div>

                <p className="text-gray-600 mb-4">{project.description}</p>

                <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div>Created {new Date(project.createdAt).toLocaleDateString()}</div>
                    <div>•</div>
                    <div>{project.posts?.length || 0} updates</div>
                </div>
            </div>

            {/* Timeline */}
            <div className="space-y-8">
                {Object.entries(groupedPosts).map(([monthYear, posts]) => (
                    <div key={monthYear}>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="flex-1 h-px bg-gray-200"></div>
                            <h3 className="text-lg font-medium text-gray-600">{monthYear}</h3>
                            <div className="flex-1 h-px bg-gray-200"></div>
                        </div>

                        <div className="space-y-6">
                            {posts
                                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                                .map(post => (
                                    <PostCard key={post._id} post={post} />
                                ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}