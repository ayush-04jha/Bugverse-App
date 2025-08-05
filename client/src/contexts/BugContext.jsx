import React, { createContext, useContext, useState } from 'react';
import { useEffect } from 'react';
import { mockBugs, mockUsers } from '../data/mockData.js';
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
  const [bugs, setBugs] = useState(mockBugs);
  const [users, setUsers] = useState(mockUsers);

   useEffect(() => {
    const fetchBugs = async () => {
      try {
        const res = await instance.get("/bugs"); // Axios already has baseURL and token
        setBugs(res.data);
      } catch (err) {
        console.error("Failed to fetch bugs:", err);
      }
    };

    fetchBugs();
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
      id: Date.now().toString(),
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
      bug.id === bugId 
        ? { ...bug, ...updates, updatedAt: new Date().toISOString() }
        : bug
    ));
  };

  const addComment = (bugId, comment) => {
    setBugs(prev => prev.map(bug => 
      bug.id === bugId 
        ? { 
            ...bug, 
            comments: [...bug.comments, { 
              id: Date.now().toString(), 
              ...comment, 
              createdAt: new Date().toISOString() 
            }],
            updatedAt: new Date().toISOString()
          }
        : bug
    ));
  };

  const updateUserRole = (userId, newRole) => {
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, role: newRole } : user
    ));
  };

  const getBugById = (id) => bugs.find(bug => bug.id === id);
  const getUserById = (id) => users.find(user => user.id === id);

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