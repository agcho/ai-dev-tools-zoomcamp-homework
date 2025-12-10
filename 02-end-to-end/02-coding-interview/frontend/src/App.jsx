import React, { useState, useEffect } from 'react'
import Editor from './Editor'


export default function App()
{
    const [room, setRoom] = useState('')
    const [joined, setJoined] = useState(false)


    function apiBase()
    {
        // Use backend on 8000 when running Vite dev on 5173; otherwise same-origin
        if (location.port === '5173') return 'http://localhost:8000'
        return ''
    }

    async function createRoom()
    {
        const res = await fetch(apiBase() + '/create_room', { method: 'POST' })
        const j = await res.json()
        setRoom(j.room_id)
        setJoined(true)
    }


    function joinExisting()
    {
        const r = prompt('Enter room id:')
        if (r) { setRoom(r); setJoined(true) }
    }


    return (
        <div style={{ padding: 20 }}>
            <h2>Online Coding Interview</h2>
            {!joined ? (
                <div>
                    <button onClick={createRoom}>Create Link & Room</button>
                    <button onClick={joinExisting}>Join Room</button>
                </div>
            ) : (
                <div>
                    <p>Room: <b>{room}</b></p>
                    <Editor room={room} />
                </div>
            )}
        </div>
    )
}