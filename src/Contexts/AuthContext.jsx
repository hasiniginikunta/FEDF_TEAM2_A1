import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    return JSON.parse(localStorage.getItem("user")) || null;
  });

  // Keep user in localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  const login = (email, password) => {
    const storedUsers = JSON.parse(localStorage.getItem("userData")) || [];
    const foundUser = storedUsers.find(
      (u) => u.email === email && u.password === password
    );
    if (!foundUser) throw new Error("Invalid credentials");

    setUser(foundUser);
    navigate("/dashboard"); // redirect after login
  };

  const signup = (name, email, password) => {
    const storedUsers = JSON.parse(localStorage.getItem("userData")) || [];
    if (storedUsers.some((u) => u.email === email)) {
      throw new Error("Email already exists");
    }

    const newUser = { name, email, password };
    storedUsers.push(newUser);
    localStorage.setItem("userData", JSON.stringify(storedUsers));

    setUser(newUser);
    navigate("/personal-details"); // redirect after signup
  };

  const logout = () => {
    setUser(null);        // clears context state
    navigate("/login");   // redirect to login page
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
