import React, { useState } from 'react'
import API from '../lib/api'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../store/useAuth'

export default function Login(){
  const [emailOrUsername, setEmailOrUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const nav = useNavigate()

  async function submit(e){
    e.preventDefault()
    try{
      const res = await API.post('/auth/login', { emailOrUsername, password })
      if (res.data && res.data.token){
        useAuth.getState().setToken(res.data.token)
        useAuth.getState().setUser(res.data.user)
        nav('/feed')
      }
    }catch(err){
      setError(err.response?.data?.message || 'Login failed')
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-semibold mb-4">Log in</h2>
      {error && <div className="text-sm text-red-600 mb-2">{error}</div>}
      <form onSubmit={submit}>
        <input className="w-full p-2 border rounded mb-2" placeholder="Email or username" value={emailOrUsername} onChange={e=>setEmailOrUsername(e.target.value)} />
        <input className="w-full p-2 border rounded mb-2" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button className="w-full bg-blue-500 text-white p-2 rounded">Log in</button>
      </form>
      <div className="mt-4 text-sm text-center">
        Don't have an account? <a className="text-blue-600" href="/signup">Sign up</a>
      </div>
    </div>
  )
}
