# LinguaLens

Multilingual reading & writing PWA for EAL/multilingual students.

## Features

- **Camera/Image OCR** — photograph textbook pages, worksheets, or any printed text and extract it instantly
- **6 Languages** — English, Portuguese, Spanish, Polish, Bulgarian, Romanian
- **Text-to-Speech** — hear any text read aloud in the correct language
- **Bionic Reading** — bold first syllables to aid reading speed
- **Text Chunking** — break long texts into manageable pieces
- **Writing + Voice Dictation** — compose text with keyboard or voice in any supported language
- **Saved Notes** — keep extracted and written texts for later
- **Accessibility** — OpenDyslexic font, adjustable spacing/sizing, reading guide, 4 themes
- **Full PWA** — install on phone, works offline

## Quick Start

```bash
npm install
npm run dev
```

Then open http://localhost:5173/mymlapp/

## Deploy to GitHub Pages

```bash
npm run deploy
```

## Tech Stack

- React 18 + Vite 5
- Tesseract.js (client-side OCR)
- Web Speech API (TTS + voice input)
- No backend — localStorage only
- PWA with service worker
