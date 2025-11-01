import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../lib/api'
import resolveMediaUrl from '../lib/media'
import { useImage } from '../hooks/useImage'
import { useAuth } from '../store/useAuth'

export default function PostCard({ post, onRefresh }) {
  const navigate = useNavigate()
  const currentUser = useAuth(state => state.user)
  const [comment, setComment] = useState('')
  const [showComments, setShowComments] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [loadingVote, setLoadingVote] = useState(false)
  const [loadingDelete, setLoadingDelete] = useState(false)
  const menuRef = useRef(null)
  const [voteStats, setVoteStats] = useState({
    upvotes: post.upvotes?.length || 0,
    downvotes: post.downvotes?.length || 0,
    hasUpvoted: currentUser ? post.upvotes?.includes(currentUser._id) || post.upvotes?.some(id => id.toString() === currentUser._id) : false,
    hasDownvoted: currentUser ? post.downvotes?.includes(currentUser._id) || post.downvotes?.some(id => id.toString() === currentUser._id) : false
  })

  // Update vote stats when post changes
  useEffect(() => {
    setVoteStats({
      upvotes: post.upvotes?.length || 0,
      downvotes: post.downvotes?.length || 0,
      hasUpvoted: currentUser ? post.upvotes?.includes(currentUser._id) || post.upvotes?.some(id => id.toString() === currentUser._id) : false,
      hasDownvoted: currentUser ? post.downvotes?.includes(currentUser._id) || post.downvotes?.some(id => id.toString() === currentUser._id) : false
    });
  }, [post.upvotes, post.downvotes, currentUser])

  const { loaded: mediaLoaded, error: mediaError, imgSrc } = useImage(resolveMediaUrl(post.mediaUrl))
  const { loaded: avatarLoaded, imgSrc: avatarSrc } = useImage(post.user?.avatar || '/placeholder-avatar.png')

  // Handle click outside for menu
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [menuRef])

  const goToProfile = (e) => {
    e.preventDefault()
    if (post.user?.username) {
      navigate(`/profile/${post.user.username}`)
    }
  }

  const handleVote = async (type) => {
    if (!currentUser) {
      alert('Please login to vote')
      return
    }
    if (loadingVote) return
    setLoadingVote(true)
    try {
      const res = await API.post(`/posts/${post._id}/${type}`)
      if (res.data.success) {
        setVoteStats({
          upvotes: res.data.upvotes,
          downvotes: res.data.downvotes,
          hasUpvoted: res.data.hasUpvoted,
          hasDownvoted: res.data.hasDownvoted
        })
      }
    } catch (err) {
      console.error(err)
      if (err.response?.status === 404) {
        alert('This post no longer exists')
      } else {
        alert('Failed to vote. Please try again.')
      }
    } finally {
      setLoadingVote(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return
    setLoadingDelete(true)
    try {
      await API.delete(`/posts/${post._id}`)
      onRefresh && onRefresh()
    } catch (err) {
      console.error(err)
      alert('Failed to delete post')
    } finally {
      setLoadingDelete(false)
      setShowMenu(false)
    }
  }

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/post/${post._id}`
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.caption || 'Shared post from Hatchr',
          text: post.caption || 'Check out this post on Hatchr',
          url: shareUrl
        })
      } catch (err) {
        console.log('Error sharing', err)
      }
    } else {
      // Fallback to copying to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl)
        alert('Link copied to clipboard!')
      } catch (err) {
        console.error('Failed to copy', err)
      }
    }
  }

  return (
    <div className="bg-white rounded-lg shadow mb-6">
      <div className="p-4 flex items-center">
        <img
          onClick={goToProfile}
          src={avatarSrc}
          className={`w-10 h-10 rounded-full mr-3 cursor-pointer ${!avatarLoaded ? 'animate-pulse bg-gray-200' : ''}`}
          alt={post.user?.username || 'avatar'}
        />
        <div className="flex-1">
          <div onClick={goToProfile} className="font-semibold cursor-pointer hover:underline">
            {post.user?.username}
          </div>
          <div className="text-sm text-gray-600">
            {post.createdAt ? new Date(post.createdAt).toLocaleString() : ''}
          </div>
          {post.project && (
            <button
              onClick={(e) => {
                e.preventDefault();
                navigate(`/project/${post.project._id}`);
              }}
              className="mt-1 text-xs inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100"
            >
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              {post.type.charAt(0).toUpperCase() + post.type.slice(1)} in {post.project.title}
            </button>
          )}
        </div>
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>

          {showMenu && (
            <div
              ref={menuRef}
              className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-10"
            >
              {currentUser && post.user && currentUser._id?.toString() === post.user._id?.toString() && (
                <button
                  onClick={handleDelete}
                  disabled={loadingDelete}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100"
                >
                  {loadingDelete ? 'Deleting...' : 'Delete Post'}
                </button>
              )}
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href)
                    .then(() => {
                      alert('Link copied to clipboard!')
                      setShowMenu(false)
                    })
                    .catch(err => console.error('Failed to copy', err))
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
              >
                Copy Link
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="relative bg-black aspect-[4/3]">
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

      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Vote buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleVote('upvote')}
                disabled={loadingVote}
                className={`p-2 rounded-md flex items-center gap-1 transition-colors ${voteStats.hasUpvoted ? 'bg-green-500 text-white' : 'hover:bg-gray-100'
                  }`}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 20V4m0 0l-7 7m7-7l7 7" />
                </svg>
                <span>{voteStats.upvotes}</span>
              </button>

              <button
                onClick={() => handleVote('downvote')}
                disabled={loadingVote}
                className={`p-2 rounded-md flex items-center gap-1 transition-colors ${voteStats.hasDownvoted ? 'bg-red-500 text-white' : 'hover:bg-gray-100'
                  }`}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 4v16m0 0l7-7m-7 7l-7-7" />
                </svg>
                <span>{voteStats.downvotes}</span>
              </button>
            </div>

            <button
              onClick={() => setShowComments(!showComments)}
              className={`p-2 rounded-md transition-colors ${showComments ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}`}
              aria-label="Toggle comments"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </button>

            <button
              onClick={handleShare}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors"
              aria-label="Share post"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
            </button>
          </div>
        </div>

        <div className="mt-2">
          <span onClick={goToProfile} className="font-semibold cursor-pointer hover:underline">
            {post.user?.username}
          </span>{' '}
          {post.caption}
        </div>

        {/* Comments section */}
        {showComments && (
          <div className="mt-4">
            <div className="max-h-60 overflow-y-auto">
              {post.comments && post.comments.map((c, idx) => (
                <div key={idx} className="py-2 text-sm text-gray-700">
                  <span
                    onClick={() => navigate(`/profile/${c.user?.username}`)}
                    className="font-semibold cursor-pointer hover:underline"
                  >
                    {c.user?.username}
                  </span>{' '}
                  {c.text}
                </div>
              ))}
            </div>

            <form
              onSubmit={async e => {
                e.preventDefault()
                if (!comment.trim()) return
                try {
                  await API.post(`/posts/${post._id}/comment`, { text: comment })
                  setComment('')
                  onRefresh && onRefresh()
                } catch (e) {
                  console.error(e)
                }
              }}
              className="mt-4 flex gap-2"
            >
              <input
                value={comment}
                onChange={e => setComment(e.target.value)}
                className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add a comment..."
              />
              <button
                type="submit"
                disabled={!comment.trim()}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Post
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}