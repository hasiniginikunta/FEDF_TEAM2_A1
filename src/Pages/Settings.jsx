import React, { useState, useEffect } from "react";
import { useAppData } from "../Contexts/AppDataContext";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "../Components/ui/card";
import { Input } from "../Components/ui/input";
import { Button } from "../Components/ui/button";
import { Label } from "../Components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../Components/ui/select";
import { User as UserIcon, Save, Lock, Sun, Moon } from "lucide-react";

export default function Settings() {
  const { reloadData } = useAppData();
  const storedUser = JSON.parse(localStorage.getItem("user")) || {};
  const storedAppData = JSON.parse(localStorage.getItem("appData")) || {};

  const [formData, setFormData] = useState({
    full_name: storedUser.full_name || storedUser.name || "",
    email: storedUser.email || "",
    phone: storedUser.phone || "",
    parentEmail: storedUser.parent_email || storedUser.parentEmail || "",
    parentPhone: storedUser.parent_mobile || storedUser.parentPhone || "",
    currency: storedUser.currency || "INR",
    theme: storedUser.theme || "light",
    budget:
      storedUser.budget_limit ||
      storedUser.budget?.total ||
      storedAppData.monthlyBudget ||
      "",
    notifications: storedUser.notifications ?? true,
  });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(formData.theme);
    localStorage.setItem(
      "user",
      JSON.stringify({ ...storedUser, theme: formData.theme })
    );
  }, [formData.theme]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    setIsSaving(true);

    const updatedUser = {
      ...storedUser,
      full_name: formData.full_name,
      phone: formData.phone,
      parentEmail: formData.parentEmail,
      parentPhone: formData.parentPhone,
      currency: formData.currency,
      theme: formData.theme,
      budget_limit: parseFloat(formData.budget) || 0,
      notifications: formData.notifications,
    };

    localStorage.setItem("user", JSON.stringify(updatedUser));

    const existingAppData = JSON.parse(localStorage.getItem("appData")) || {};
    localStorage.setItem(
      "appData",
      JSON.stringify({
        ...existingAppData,
        monthlyBudget: parseFloat(formData.budget) || 0,
        categories: existingAppData.categories || [],
        transactions: existingAppData.transactions || [],
      })
    );

    // Reload data in AppDataContext to reflect budget changes
    reloadData();
    
    setIsSaving(false);
    alert("Settings saved!");
  };

  const handleChangePassword = () => {
    const newPassword = prompt("Enter new password:");
    if (!newPassword) return;
    localStorage.setItem(
      "user",
      JSON.stringify({ ...storedUser, password: newPassword })
    );
    alert("Password updated!");
  };

  return (
    <div className="settings-page">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="settings-container"
      >
        <div className="settings-header">
          <h1 className="settings-title">Settings</h1>
          <p className="settings-subtitle">
            Manage your account, budget, theme, and preferences
          </p>
        </div>

        <Card className="settings-card">
          <CardHeader>
            <CardTitle className="settings-card-title">
              <UserIcon className="settings-card-icon" />
              Profile & Budget
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="settings-form">
              {/* Name & Email */}
              <div className="settings-grid-two">
                <div>
                  <Label>Full Name</Label>
                  <Input
                    value={formData.full_name}
                    onChange={(e) => handleChange("full_name", e.target.value)}
                    required
                    className="settings-input"
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    value={formData.email}
                    disabled
                    className="settings-input-disabled"
                  />
                </div>
              </div>

              {/* Phone & Parent Info */}
              <div className="settings-grid-two">
                <div>
                  <Label>Phone</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    className="settings-input"
                  />
                </div>
                <div>
                  <Label>Parent Email</Label>
                  <Input
                    value={formData.parentEmail}
                    onChange={(e) => handleChange("parentEmail", e.target.value)}
                    className="settings-input"
                  />
                </div>
                <div>
                  <Label>Parent Phone</Label>
                  <Input
                    value={formData.parentPhone}
                    onChange={(e) => handleChange("parentPhone", e.target.value)}
                    className="settings-input"
                  />
                </div>
              </div>

              {/* Currency & Theme */}
              <div className="settings-grid-two">
                <div>
                  <Label>Currency</Label>
                  <Select
                    value={formData.currency}
                    onValueChange={(value) => handleChange("currency", value)}
                  >
                    <SelectTrigger className="settings-input">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INR">INR (₹)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Theme</Label>
                  <Select
                    value={formData.theme}
                    onValueChange={(value) => handleChange("theme", value)}
                  >
                    <SelectTrigger className="settings-input">
                      <SelectValue placeholder="Select theme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">
                        <Sun className="settings-theme-icon" /> Light
                      </SelectItem>
                      <SelectItem value="dark">
                        <Moon className="settings-theme-icon" /> Dark
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Monthly Budget */}
              <div>
                <Label>Monthly Budget (INR)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.budget}
                  onChange={(e) => handleChange("budget", e.target.value)}
                  className="settings-input"
                />
                <p className="settings-budget-note">
                  Budget will be auto-allocated to categories
                </p>
              </div>

              {/* Notifications */}
              <div className="settings-notifications">
                <input
                  type="checkbox"
                  checked={formData.notifications}
                  onChange={(e) => handleChange("notifications", e.target.checked)}
                  className="settings-checkbox"
                  id="notifyToggle"
                />
                <Label htmlFor="notifyToggle">Enable Notifications</Label>
              </div>

              {/* Change Password */}
              <Button
                type="button"
                onClick={handleChangePassword}
                className="settings-change-password-btn"
              >
                <Lock className="settings-lock-icon" /> Change Password
              </Button>

              {/* Save Button */}
              <Button
                type="submit"
                className="settings-save-btn"
                disabled={isSaving}
              >
                <Save className="settings-save-icon" />
                {isSaving ? "Saving..." : "Save Settings"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
