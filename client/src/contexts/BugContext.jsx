import React, { createContext, useContext, useState } from 'react';
import { useEffect } from 'react';

import { io } from "socket.io-client";
import instance from '../axios.js';
const socket = io("http://localhost:5000");
const BugContext = createContext(undefined);

export const useBugs = () => {
  const context = useContext(BugContext);
  if (context === undefined) {
    throw new Error('useBugs must be used within a BugProvider');
  }
  return context;
};

export const BugProvider = ({ children }) => {
  const [bugs, setBugs] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
  socket.on("newComment", ({bugId,comment}) => {
    console.log("socket wala comment:",comment);
    
  setBugs(prev => prev.map(bug => 
    bug._id === bugId
      ? {
          ...bug,
          comments: bug.comments.some(c => c._id === comment._id)
            ? bug.comments  // already added, skip
            : [...bug.comments, comment]
        }
      : bug
  ));
});

  return () => {
    socket.off("newComment");
  };
}, []);


   useEffect(() => {
    const fetchData = async () => {
      try {
        const [bugsRes,usersRes] = await Promise.all([instance.get("/bugs"),instance.get("/users")]) ; // Axios already has baseURL and token
        setBugs(bugsRes.data);
        setUsers(usersRes.data);
        console.log("log kiye hai bugs",bugsRes.data);
        
        console.log("log kiye hai users",usersRes.data);
      } catch (err) {
        console.error("Failed to fetch bugs:", err);
      }
    };

    fetchData();

  }, []);

useEffect(() => {
    socket.on("bug:created", (newBug) => {
      setBugs((prev) => [newBug, ...prev]);
    });

    return () => {
      socket.off("bug:created");
    };
  }, []);
  
  const createBug = (bugData) => {
    const newBug = {
      _id: Date.now().toString(),
      ...bugData,
      status: 'open',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      comments: []
    };
    setBugs(prev => [newBug, ...prev]);
    return newBug;
  };

  const updateBug = (bugId, updates) => {
    setBugs(prev => prev.map(bug => 
      bug._id === bugId 
        ? { ...bug, ...updates, updatedAt: new Date().toISOString() }
        : bug
    ));
  };

  const addComment = (bugId, comment) => {
    setBugs(prev => prev.map(bug => {
       if(bug._id!==bugId) return bug;

       // check if commen already exist

       const alreadyExists =  bug.comments.some(c => c._id === comment._id);
        if (alreadyExists) return bug;
        return {
        ...bug,
        comments: [...bug.comments, comment],
        updatedAt: new Date().toISOString(),
      };

    }
      
        
    ));
  };

  const updateUserRole = (userId, newRole) => {
    setUsers(prev => prev.map(user => 
      user._id === userId ? { ...user, role: newRole } : user
    ));
  };
     
   
  const getBugById = (id) => bugs.find(bug => bug._id === id);
  const getUserById = (id) => users.find(user => user._id === id);

  return (
    <BugContext.Provider value={{
      bugs,
      users,
      createBug,
      updateBug,
      addComment,
      updateUserRole,
      getBugById,
      getUserById
    }}>
      {children}
    </BugContext.Provider>
  );
};