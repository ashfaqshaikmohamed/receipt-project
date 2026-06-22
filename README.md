# 🧾 Receiptify

A 100% client-side receipt scanner that extracts itemized data — quantities, prices, tips, and tax — directly in your browser. No server, no third-party uploads, no privacy risk.

## Why Receiptify?

Most receipt-scanning apps send your photo to a server for processing, meaning your purchase history, spending habits, and personal data pass through someone else's infrastructure. Receiptify does all of its OCR and parsing **entirely on-device**, so your data never leaves your browser.

## ✨ Features

- **Fully client-side OCR** — powered by Tesseract.js, with zero backend dependency
- **Smart quantity detection** — correctly parses prefixes like `2x Steak` instead of misreading them as separate items
- **Automatic tip & tax extraction** — pulls line-item totals without manual entry
- **Sub-2-second parsing** — optimized OCR pipeline and post-processing for near-instant results
- **Adaptive UI** — a bottom sheet on mobile, a modal dialog on desktop, for a native feel on any device
- **Zero data exposure** — no server, no third-party APIs, no stored uploads

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, TypeScript |
| OCR Engine | Tesseract.js |
| Animations / UI | Framer Motion |
| Storage | Firebase |

## ⚙️ How It Works

1. **Capture or upload** a photo of a receipt
2. **OCR pipeline** runs entirely in-browser via Tesseract.js to extract raw text
3. **Post-processing logic** parses the raw text into structured line items — detecting quantities, prices, tips, and tax
4. **Adaptive UI** displays the parsed results in a layout suited to your device

```
Receipt Image → In-Browser OCR (Tesseract.js) → Text Parsing & Cleanup → Structured Output
```

## 🚀 Getting Started

```bash
git clone https://github.com/your-username/receiptify.git
cd receiptify
npm install
npm run dev
```

Then open `http://localhost:3000` in your browser.

## 📱 Responsive by Design

| Device | Experience |
|---|---|
| Mobile | Slide-up bottom sheet |
| Desktop | Centered modal dialog |

## 🔒 Privacy First

No images or extracted data are ever sent to a server. All processing happens locally on your device, every time.

## 📄 License

MIT
