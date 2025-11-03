import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./Pages/Dashboard";
import Categories from "./Pages/Categories";
import Transactions from "./Pages/Transactions";
import Reports from "./Pages/Reports";
import Settings from "./Pages/Settings";
import Layout from "../src/Layout";
import LoginPage from "../src/Pages/LoginPage";
import PersonalDetailsPage from "../src/Pages/PersonalDetailsPage";
import MonthlyBudgetPage from "../src/Pages/MonthlyBudgetPage";
import ConfirmationPage from "../src/Pages/ConfirmationPage";
import { useAuth } from "../src/Contexts/AuthContext";

export default function App() {
  const { user } = useAuth(); 
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/dashboard" />} />
      <Route path="/personal-details" element={<PersonalDetailsPage />} />
      <Route path="/monthly-budget" element={<MonthlyBudgetPage />} />
      <Route path="/confirmation" element={<ConfirmationPage />} />

      {/* Protected Routes */}
      <Route
        path="/"
        element={user ? <Layout /> : <Navigate to="/login" />}
      >
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="categories" element={<Categories />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* Catch-all route */}
      <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
    </Routes>
  );
}
