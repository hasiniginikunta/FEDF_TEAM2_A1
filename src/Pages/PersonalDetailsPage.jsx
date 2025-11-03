import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../Components/ui/card";
import { Input } from "../Components/ui/input";
import { Button } from "../Components/ui/button";
import { Label } from "../Components/ui/label";

export default function PersonalDetailsPage() {
  const navigate = useNavigate();
  const storedUser = JSON.parse(localStorage.getItem("user")) || {};

  const [formData, setFormData] = useState({
    full_name: storedUser.full_name || "",
    age: storedUser.age || "",
    gender: storedUser.gender || "",
    parent_email: storedUser.parent_email || "",
    parent_mobile: storedUser.parent_mobile || "",
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    localStorage.setItem("user", JSON.stringify({ ...storedUser, ...formData }));
    navigate("/monthly-budget");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 relative">
      {/* Decorative blobs */}
      <div className="absolute top-10 left-10 w-60 h-60 bg-purple-400 rounded-full blur-3xl opacity-20"></div>
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-pink-400 rounded-full blur-3xl opacity-15"></div>

      <Card className="w-full max-w-lg shadow-xl bg-white/70 backdrop-blur-lg rounded-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500">
            Personal Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <Label>Full Name</Label>
              <Input
                value={formData.full_name}
                onChange={(e) => handleChange("full_name", e.target.value)}
                required
              />
            </div>

            {/* Age */}
            <div>
              <Label>Age</Label>
              <Input
                type="number"
                value={formData.age}
                onChange={(e) => handleChange("age", e.target.value)}
                required
              />
            </div>

            {/* Gender as radio buttons */}
            <div>
              <Label>Gender</Label>
              <div className="flex gap-4 mt-1">
                {["Male", "Female"].map((option) => (
                  <label key={option} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="gender"
                      value={option}
                      checked={formData.gender === option}
                      onChange={(e) => handleChange("gender", e.target.value)}
                      className="w-4 h-4"
                      required
                    />
                    {option}
                  </label>
                ))}
              </div>
            </div>

            {/* Parent Email */}
            <div>
              <Label>Parent's Email</Label>
              <Input
                type="email"
                value={formData.parent_email}
                onChange={(e) => handleChange("parent_email", e.target.value)}
                required
              />
            </div>

            {/* Parent Mobile */}
            <div>
              <Label>Parent's Mobile</Label>
              <Input
                type="tel"
                value={formData.parent_mobile}
                onChange={(e) => handleChange("parent_mobile", e.target.value)}
                required
              />
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 hover:shadow-lg transition-all duration-300"
            >
              Continue
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
