// src/Entities/User.js

const API_BASE_URL = "https://your-api-domain.com/api"; // <-- Replace with your backend URL

export class User {
  // Fetch current authenticated user
  static async me() {
    try {
      const response = await fetch(`${API_BASE_URL}/user/me`, {
        method: "GET",
        credentials: "include", // send cookies if using session auth
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Not authenticated");
      }

      const data = await response.json();
      return data; // expects { full_name, email, ... }
    } catch (err) {
      console.error("Error fetching user:", err);
      throw err;
    }
  }

  // Logout user
  static async logout() {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      return true;
    } catch (err) {
      console.error("Error logging out:", err);
      throw err;
    }
  }
}
export default User;

