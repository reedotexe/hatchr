import React, { useEffect, useState, useRef } from 'react'
import { io } from 'socket.io-client'
import API from '../lib/api'

let socket

export default function ChatBox({ chatId, meId }){
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const ref = useRef()

  useEffect(()=>{
    async function load(){
      const res = await API.get(`/messages/${chatId}`)
      setMessages(res.data.messages || [])
    }
    if (chatId) load()
  }, [chatId])

  useEffect(()=>{
    if (!socket){
      socket = io('http://localhost:5000')
      socket.emit('register', meId)
      socket.on('message', payload => {
        if (payload.chatId === chatId) setMessages(m => [...m, payload.message])
      })
    }
    return () => {}
  }, [meId, chatId])

  async function send(e){
    e.preventDefault()
    if (!text) return
    try{
      await API.post('/messages', { chatId, text })
      setText('')
    }catch(err){ console.error(err) }
  }

  return (
    <div className="bg-white rounded shadow p-3">
      <div className="h-64 overflow-y-auto mb-2">
        {messages.map(m => (
          <div key={m._id} className={`mb-2 ${m.sender._id === meId ? 'text-right' : 'text-left'}`}><span className="inline-block bg-gray-100 p-2 rounded">{m.text}</span></div>
        ))}
      </div>
      <form onSubmit={send} className="flex gap-2">
        <input value={text} onChange={e=>setText(e.target.value)} className="flex-1 border p-2 rounded" placeholder="Message" />
        <button className="px-3 py-1 bg-blue-500 text-white rounded">Send</button>
      </form>
    </div>
  )
}
