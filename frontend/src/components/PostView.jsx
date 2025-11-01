import React, { useState } from 'react'
import { useImage } from '../hooks/useImage'
import resolveMediaUrl from '../lib/media'
import API from '../lib/api'

export default function PostView({ post, onClose, onUpdate }) {
  const [comment, setComment] = useState('')
  const [loadingLike, setLoadingLike] = useState(false)
  const { loaded: mediaLoaded, error: mediaError, imgSrc } = useImage(resolveMediaUrl(post.mediaUrl))
  const { loaded: avatarLoaded, imgSrc: avatarSrc } = useImage(post.user?.avatar || '/placeholder-avatar.png')

  async function handleLike() {
    setLoadingLike(true)
    try {
      await API.post(`/posts/${post._id}/like`)
      onUpdate && onUpdate()
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingLike(false)
    }
  }

  async function handleComment(e) {
    e.preventDefault()
    if (!comment.trim()) return

    try {
      await API.post(`/posts/${post._id}/comment`, { text: comment })
      setComment('')
      onUpdate && onUpdate()
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-black/75 transition-opacity" onClick={onClose}></div>
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white w-full max-w-5xl rounded-lg shadow-xl grid grid-cols-1 md:grid-cols-2">
          {/* Left side - Image */}
          <div className="relative bg-black aspect-square">
            {!mediaLoaded && !mediaError && (
              <div className="absolute inset-0 bg-gray-100 animate-pulse" />
            )}
            {mediaError && (
              <div className="absolute inset-0 bg-gray-100 flex items-center justify-center text-gray-400">
                Unable to load image
              </div>
            )}
            <img 
              src={imgSrc} 
              alt={post.caption || 'post'} 
              className={`w-full h-full object-contain ${!mediaLoaded ? 'opacity-0' : ''}`}
            />
          </div>

          {/* Right side - Info */}
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b flex items-center space-x-3">
              <img 
                src={avatarSrc}
                alt={post.user?.username}
                className={`w-8 h-8 rounded-full ${!avatarLoaded ? 'animate-pulse bg-gray-200' : ''}`}
              />
              <div className="font-semibold">{post.user?.username}</div>
            </div>

            {/* Comments */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="mb-4">
                <span className="font-semibold">{post.user?.username}</span> {post.caption}
              </div>
              {post.comments?.map((comment, idx) => (
                <div key={idx} className="mb-2">
                  <span className="font-semibold">{comment.user?.username}</span> {comment.text}
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="p-4 border-t">
              <div className="flex items-center gap-4 mb-4">
                <button onClick={handleLike} disabled={loadingLike} className="text-2xl">
                  ❤️
                </button>
                <span className="text-sm text-gray-600">{post.likes?.length || 0} likes</span>
                <span className="text-sm text-gray-600">
                  {new Date(post.createdAt).toLocaleDateString()}
                </span>
              </div>

              <form onSubmit={handleComment} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add a comment..."
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={!comment.trim()}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                >
                  Post
                </button>
              </form>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white md:text-gray-600 z-10"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}