// src/utils/ocrUtils.jsx
import Tesseract from "tesseract.js";

// Helper to clean and extract the amount from text
export const extractAmountFromText = (text) => {
  // Normalize text
  const cleanText = text.replace(/[^\w\s.,₹]/gi, " ").replace(/\s+/g, " ");
  
  // Match currency or numeric patterns (₹600, Rs 5226, 2000.00, etc.)
  const amountRegex = /(₹|rs\.?|inr)?\s?(\d{2,6}(?:[.,]\d{1,2})?)/gi;
  const matches = [...cleanText.matchAll(amountRegex)];

  if (!matches || matches.length === 0) return null;

  // Pick the most likely amount — highest number under ₹1,00,000
  const amounts = matches.map((m) => parseFloat(m[2].replace(/,/g, "")));
  const valid = amounts.filter((num) => num > 1 && num < 100000);

  if (valid.length === 0) return null;
  return Math.max(...valid); // Take highest valid amount
};

export const runOcr = async (file) => {
  if (!file) return { text: "", amount: null };

  try {
    const result = await Tesseract.recognize(file, "eng", {
      tessedit_char_whitelist: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz₹.,:/- ",
      logger: (m) => console.log(m),
    });

    const text = result.data.text;
    const amount = extractAmountFromText(text);
    return { text, amount };
  } catch (error) {
    console.error("OCR Error:", error);
    return { text: "", amount: null };
  }
};
