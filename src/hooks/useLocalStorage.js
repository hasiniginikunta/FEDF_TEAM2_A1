import { useState, useEffect } from "react";

/**
 * useLocalStorage
 * Safely stores and retrieves data from localStorage.
 * Automatically falls back to default value if stored data is invalid.
 *
 * @param {string} key - The localStorage key
 * @param {any} defaultValue - The default value if no valid stored data
 * @returns {[state, setState]} - The stateful value and a setter
 */
export function useLocalStorage(key, defaultValue) {
  const [state, setState] = useState(() => {
    try {
      const stored = localStorage.getItem(key);

      // If nothing is stored or stored value is "undefined" string, use default
      if (!stored || stored === "undefined") return defaultValue;

      // Attempt to parse stored JSON
      return JSON.parse(stored);
    } catch (error) {
      console.warn(`Invalid localStorage value for key "${key}". Using default.`, error);
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      // Ensure we never save undefined
      const valueToStore = state === undefined ? defaultValue : state;
      localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.warn(`Failed to save localStorage key "${key}"`, error);
    }
  }, [key, state, defaultValue]);

  return [state, setState];
}
