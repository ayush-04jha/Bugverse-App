import React, { createContext, useContext, useState, useEffect } from "react";
import { io } from "socket.io-client";
import instance from "../axios.js";

let socket;
const BugContext = createContext(undefined);

export const useBugs = () => {
  const context = useContext(BugContext);
  if (context === undefined) {
    throw new Error("useBugs must be used within a BugProvider");
  }
  return context;
};

export const BugProvider = ({ children }) => {
  const [bugs, setBugs] = useState([]);
  const [users, setUsers] = useState([]);
  const loggedInUser = JSON.parse(localStorage.getItem("user") || "{}");

   
  // Fetch bugs & users on mount
 useEffect(() => {
    if (!loggedInUser?._id) return;
     const SOCKET_URL =
  import.meta.env.MODE === "production"
    ? "https://bugverse-app-1.onrender.com" // backend Render URL
    : "http://localhost:5000";

    socket = io(SOCKET_URL, {
      query: { userId: loggedInUser._id },
      withCredentials: true, // cookies etc ke liye
    });

    // Listen for new bugs
    socket.on("bug:created", (newBug) => {

      
      const assignedToId = newBug.assignedTo && newBug.assignedTo._id ? newBug.assignedTo._id.toString() : undefined;

      const loggedInId = loggedInUser._id?.toString();
      

      if (!assignedToId) {
    // Tester ya developer dono ko bug dikhana hai
    if (loggedInUser.role === "tester" || loggedInUser.role === "developer") {
      setBugs((prev) => [newBug, ...prev]);
    }
  } else {
    // Agar assignedTo hai
    if (
      loggedInUser.role === "tester" || // Tester ko hamesha dikhana hai
      (loggedInUser.role === "developer" && assignedToId === loggedInId) // Developer ko sirf assigned bug dikhana hai
    ) {
      setBugs((prev) => [newBug, ...prev]);
    }
  }
    });

    // Listen for new comments
    socket.on("newComment", ({ bugId, comment }) => {
      setBugs((prev) =>
        prev.map((bug) =>
          bug._id === bugId
            ? {
                ...bug,
                comments: bug.comments.some((c) => c._id === comment._id)
                  ? bug.comments
                  : [...bug.comments, comment],
              }
            : bug
        )
      );
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Socket connection & listeners
 
    useEffect(() => {
    const fetchData = async () => {
      try {
        const [bugsRes, usersRes] = await Promise.all([
          instance.get("/bugs"),
          instance.get("/users"),
          
        ]);

       
        
        
        
        setBugs(bugsRes.data);
        setUsers(usersRes.data);
      } catch (err) {
        console.error("Failed to fetch bugs:", err);
      }
    };
    fetchData();
  }, []);

  // Local bug creation
  const createBug = (bugData) => {
    const newBug = {
      _id: Date.now().toString(),
      ...bugData,
      status: "open",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      comments: [],
    };
    setBugs((prev) => [newBug, ...prev]);
    return newBug;
  };

  // Local bug update
  const updateBug = async (bugId, updates) => {
   
    try {
       await instance.put(`/bugs/${bugId}`,updates);

        setBugs((prev) =>
      prev.map((bug) =>
        bug._id === bugId
          ? { ...bug, ...updates, updatedAt: new Date().toISOString() }
          : bug
      )
    );

    } catch (err) {
      console.error("Failed to update status:", err);
    }
    
   
  };

  // Add comment locally
  const addComment = (bugId, comment) => {
    setBugs((prev) =>
      prev.map((bug) => {
        if (bug._id !== bugId) return bug;
        if (bug.comments.some((c) => c._id === comment._id)) return bug;
        return {
          ...bug,
          comments: [...bug.comments, comment],
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  // Update user role locally
  const updateUserRole = (userId, newRole) => {
    setUsers((prev) =>
      prev.map((user) =>
        user._id === userId ? { ...user, role: newRole } : user
      )
    );
  };

  const getBugById = (id) => bugs.find((bug) => bug._id === id);
  const getUserById = (id) => users.find((user) => user._id === id);

  return (
    <BugContext.Provider
      value={{
        bugs,
        users,
        createBug,
        updateBug,
        addComment,
        updateUserRole,
        getBugById,
        getUserById,
      }}
    >
      {children}
    </BugContext.Provider>
  );
};
