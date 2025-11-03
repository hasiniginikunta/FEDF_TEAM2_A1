import React, { useState } from "react";
import { format } from "date-fns";
import Tesseract from "tesseract.js";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export default function OCRScanner({ onSubmit }) {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    date: format(new Date(), "yyyy-MM-dd"),
    category: "",
  });

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(URL.createObjectURL(file));
  };

  const handleScan = () => {
    if (!image) return;
    setLoading(true);
    setProgress(0);
    setProgressText("Initializing...");

    Tesseract.recognize(image, "eng", {
      logger: (m) => {
        console.log(m);
        if (m.status === 'recognizing text') {
          const percent = Math.round(m.progress * 100);
          setProgress(percent);
          setProgressText(`Scanning text... ${percent}%`);
        } else if (m.status === 'loading tesseract core') {
          setProgressText("Loading OCR engine...");
        } else if (m.status === 'initializing tesseract') {
          setProgressText("Initializing scanner...");
        }
      }
    })
      .then(({ data: { text } }) => {
        setProgressText("Processing results...");
        setProgress(100);
        const extracted = parseReceipt(text);
        setFormData((prev) => ({
          ...prev,
          ...extracted,
        }));
        setTimeout(() => {
          setLoading(false);
          setProgress(0);
          setProgressText("");
        }, 500);
      })
      .catch((err) => {
        console.error("OCR failed:", err);
        setLoading(false);
        setProgress(0);
        setProgressText("");
      });
  };

  const parseReceipt = (text) => {
    let title = "";
    let amount = "";
    let date = "";
    let category = "";

    const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);

    // --- Title Detection ---
    const skipWords = ["invoice", "receipt", "bill", "total", "amount"];
    const titleLine = lines.find(
      (l) => !skipWords.some((w) => l.toLowerCase().includes(w))
    );
    if (titleLine) title = titleLine;

    // --- Smarter amount detection ---
    const amountLine = lines.find((l) =>
      /(total|amount|fare|paid|price|grand)/i.test(l)
    );

    if (amountLine) {
      const amtMatch = amountLine.match(/₹?\s?\d{1,4}(\.\d{1,2})?/);
      if (amtMatch) {
        const amtValue = parseFloat(amtMatch[0].replace(/[^\d.]/g, ""));
        if (amtValue > 0 && amtValue < 10000) {
          amount = amtValue.toString();
        }
      }
    }

    if (!amount) {
      const allNumbers = text.match(/\d+(\.\d{1,2})?/g);
      if (allNumbers) {
        const validAmounts = allNumbers
          .map((n) => parseFloat(n))
          .filter((n) => !isNaN(n) && n > 0 && n < 10000 && n !== 2016 && n !== 2023); // exclude years
        if (validAmounts.length > 0) {
          amount = Math.max(...validAmounts).toString();
        }
      }
    }

    // --- Enhanced Date Detection ---
    const datePatterns = [
      /\b\d{4}[-/]\d{1,2}[-/]\d{1,2}\b/g,
      /\b\d{1,2}[-/]\d{1,2}[-/]\d{4}\b/g,
      /\b\d{1,2}[-/]\d{1,2}[-/]\d{2}\b/g,
      /\b\d{1,2}\s(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s\d{4}\b/gi,
      /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s\d{1,2},?\s\d{4}\b/gi
    ];

    let foundDates = [];
    datePatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) foundDates.push(...matches);
    });

    if (foundDates.length > 0) {
      console.log("Found dates:", foundDates);
      
      const parsedDates = foundDates
        .map((dateStr) => {
          try {
            let normalizedDate = dateStr.replace(/-/g, "/");
            
            if (/\d{1,2}\/\d{1,2}\/\d{2}$/.test(normalizedDate)) {
              const parts = normalizedDate.split('/');
              normalizedDate = `${parts[0]}/${parts[1]}/20${parts[2]}`;
            }
            
            const parsedDate = new Date(normalizedDate);
            const now = new Date();
            const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
            
            if (parsedDate <= now && parsedDate >= oneYearAgo) {
              return parsedDate;
            }
            return null;
          } catch {
            return null;
          }
        })
        .filter(Boolean);

      if (parsedDates.length > 0) {
        const latestDate = new Date(Math.max(...parsedDates.map(d => d.getTime())));
        date = format(latestDate, "yyyy-MM-dd");
        console.log("Selected date:", date);
      }
    }
    
    if (!date) {
      date = format(new Date(), "yyyy-MM-dd");
    }

    // --- Category Detection ---
    const textLower = text.toLowerCase();
    if (/uber|ola|bus|train|flight|ticket|travel/i.test(textLower)) {
      category = "Travel";
    } else if (/restaurant|food|meal|dine|pizza|burger/i.test(textLower)) {
      category = "Food";
    } else if (/medical|pharmacy|hospital|doctor/i.test(textLower)) {
      category = "Health";
    } else if (/shopping|mall|store|clothes|apparel/i.test(textLower)) {
      category = "Shopping";
    } else if (/electricity|water|gas|bill|recharge/i.test(textLower)) {
      category = "Utilities";
    }

    return { title, amount, date, category };
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    if (onSubmit) onSubmit(formData);
    setFormData({
      title: "",
      amount: "",
      date: format(new Date(), "yyyy-MM-dd"),
      category: "",
    });
    setImage(null);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
      {/* Upload Section */}
      <Card className="p-6 bg-card text-card-foreground shadow-lg rounded-xl border border-border">
        <h2 className="text-xl font-semibold mb-4 text-foreground">Upload Receipt</h2>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="mb-4 text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/80"
        />
        {image && (
          <img
            src={image}
            alt="Uploaded"
            className="max-h-48 rounded-lg border mb-4"
          />
        )}
        <Button
          onClick={handleScan}
          disabled={loading || !image}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          {loading ? "Scanning..." : "Scan Receipt"}
        </Button>
        
        {loading && (
          <div className="mt-4">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>{progressText}</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}
      </Card>

      {/* Expense Form */}
      <Card className="p-6 bg-card text-card-foreground shadow-lg rounded-xl border border-border space-y-4">
        <h2 className="text-xl font-semibold mb-4 text-foreground">Expense Details</h2>

        <div>
          <Label className="text-foreground">Expense Title *</Label>
          <Input 
            name="title" 
            value={formData.title} 
            onChange={handleChange}
            className="bg-background text-foreground border-border"
          />
        </div>

        <div>
          <Label className="text-foreground">Amount (₹) *</Label>
          <Input
            name="amount"
            type="number"
            value={formData.amount}
            onChange={handleChange}
            className="bg-background text-foreground border-border"
          />
        </div>

        <div>
          <Label className="text-foreground">Date *</Label>
          <Input
            name="date"
            type="date"
            value={formData.date}
            onChange={handleChange}
            className="bg-background text-foreground border-border"
          />
        </div>

        <div>
          <Label className="text-foreground">Category *</Label>
          <Input
            name="category"
            value={formData.category}
            onChange={handleChange}
            placeholder="e.g. Travel, Food, Shopping"
            className="bg-background text-foreground border-border"
          />
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() =>
              setFormData({
                title: "",
                amount: "",
                date: format(new Date(), "yyyy-MM-dd"),
                category: "",
              })
            }
            className="border-border text-foreground hover:bg-accent hover:text-accent-foreground"
          >
            Clear
          </Button>
          <Button
            onClick={handleSave}
            className="bg-green-600 hover:bg-green-700 text-white dark:bg-green-700 dark:hover:bg-green-800"
          >
            Save Expense
          </Button>
        </div>
      </Card>
    </div>
  );
}