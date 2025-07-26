import { useEffect } from 'react';
import socket from './socket';

function App() {
  useEffect(()=>{
    socket.on("connect",()=>{
      console.log("Connected to backend with socket ID:", socket.id);
    })
return () => socket.disconnect();

  },[])

  return (
     <div className="text-center p-10">
      <h1 className="text-3xl font-bold text-blue-600">🐞 BugVerse Dashboard</h1>
    </div>
  )
}

export default App
