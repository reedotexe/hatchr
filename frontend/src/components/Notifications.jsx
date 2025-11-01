import React, { useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from '../store/useAuth'

let socket

export default function Notifications(){
  const user = useAuth(state => state.user)
  const [items, setItems] = useState([])

  useEffect(()=>{
    if (!user) return
    if (!socket){
      socket = io('http://localhost:5000')
      socket.emit('register', user.id || user._id)
      socket.on('notification', payload => setItems(prev => [payload, ...prev]))
    }
  }, [user])

  if (!user) return null
  return (
    <div className="relative">
      <button className="px-2 py-1">🔔</button>
      {items.length > 0 && (
        <div className="absolute right-0 mt-2 w-72 bg-white shadow rounded p-2">
          {items.map((it, i) => (
            <div key={i} className="text-sm border-b py-1">{it.type} from {it.from}</div>
          ))}
        </div>
      )}
    </div>
  )
}
