import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext(undefined);
import instance from "../axios";
import { useEffect } from "react";

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};


export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
  const storedUser = localStorage.getItem("user");
  return storedUser ? JSON.parse(storedUser) : null;
});

useEffect(()=>{
const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
},[])

  const login = async (email, password) => {
    // Mock authentication - in real app, this would call an API
    try {
      const res = await instance.post("/auth/login", { email, password });
      console.log("login data jo ayya:",res.data);
      
      const { token, user } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      setUser(user);
      return true;
    } catch (error) {
      console.error("Login failed:", error.response?.data || error.message);
      return false;
    }
  };

  const signup = async (name, email, password, role) => {
    // Mock signup - in real app, this would call an API
    try {
      const res = await instance.post("/auth/signup", {
        name,
        email,
        password,
        role,
      });
      console.log(res.data);
      
      const { token, user } = res.data;
      localStorage.setItem("token", token);
      setUser(user);
      return true;
    } catch (error) {
      console.error("Signup failed:", error.response?.data || error.message);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
     localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
