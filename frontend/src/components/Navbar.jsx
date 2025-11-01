import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../store/useAuth'
import { useTheme } from '../store/useTheme'

export default function Navbar() {
  const user = useAuth(state => state.user)
  const logout = useAuth(state => state.logout)
  const toggle = useTheme(state => state.toggle)
  const nav = useNavigate()

  function doLogout() { logout(); nav('/login') }

  return (
    <div className="bg-white shadow">
      <div className="max-w-3xl mx-auto flex items-center justify-between p-3">
        <Link to="/feed" className="text-2xl font-bold">Hatchr</Link>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link to="/feed" className="text-gray-700">Feed</Link>
              <Link to={`/profile/${user.username}`} className="text-gray-700">Profile</Link>
              <button onClick={doLogout} className="text-sm text-red-600">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-gray-700">Login</Link>
              <Link to="/signup" className="text-gray-700">Signup</Link>
            </>
          )}
          <button onClick={toggle} className="ml-2 px-2 py-1 border rounded">Toggle Theme</button>
        </div>
      </div>
    </div>
  )
}
