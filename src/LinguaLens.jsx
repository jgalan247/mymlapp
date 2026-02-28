import { useState, useEffect, useReducer, useRef, useCallback } from "react";
import Tesseract from "tesseract.js";

/*
  ╔══════════════════════════════════════════════════════════════╗
  ║  LINGUALENS — Multilingual Reading & Writing PWA            ║
  ║                                                              ║
  ║  Features:                                                   ║
  ║  1. Camera/image capture → OCR text extraction               ║
  ║  2. Text-to-speech in 6 languages                            ║
  ║  3. Bionic reading & text chunking                           ║
  ║  4. Writing with voice dictation                             ║
  ║  5. Notes/saved texts                                        ║
  ║  6. Full UI translations for all supported languages         ║
  ║  7. PWA with offline support                                 ║
  ║                                                              ║
  ║  Languages: EN, PT, ES, PL, BG, RO                          ║
  ╚══════════════════════════════════════════════════════════════╝
*/

// ─── LANGUAGES ────────────────────────────────────────────────────
const LANGS = [
  { id: "en", name: "English", native: "English", tess: "eng", tts: "en-GB", flag: "🇬🇧" },
  { id: "pt", name: "Portuguese", native: "Português", tess: "por", tts: "pt-PT", flag: "🇵🇹" },
  { id: "es", name: "Spanish", native: "Español", tess: "spa", tts: "es-ES", flag: "🇪🇸" },
  { id: "pl", name: "Polish", native: "Polski", tess: "pol", tts: "pl-PL", flag: "🇵🇱" },
  { id: "bg", name: "Bulgarian", native: "Български", tess: "bul", tts: "bg-BG", flag: "🇧🇬" },
  { id: "ro", name: "Romanian", native: "Română", tess: "ron", tts: "ro-RO", flag: "🇷🇴" },
];

const getLang = (id) => LANGS.find((l) => l.id === id) || LANGS[0];

// ─── UI LABELS ────────────────────────────────────────────────────
const LABELS = {
  en: {
    scan: "Scan", read: "Read", write: "Write", notes: "Notes", settings: "Settings",
    takePhoto: "Take Photo", uploadImage: "Upload Image", pasteText: "Or paste / type text here…",
    scanning: "Scanning…", readAloud: "Read Aloud", stop: "Stop",
    bionicMode: "Bionic Reading", saveNote: "Save to Notes", clear: "Clear",
    startWriting: "Start writing…", voiceInput: "Voice Input", wordCount: "words",
    saved: "Saved!", noNotes: "No saved notes yet", delete: "Delete",
    language: "Language", theme: "Theme", font: "Font", fontSize: "Text Size",
    lineHeight: "Line Spacing", letterSpacing: "Letter Spacing",
    processing: "Processing image…", ocrComplete: "Text extracted!",
    readBack: "Read Back", newScan: "New Scan", chunkMode: "Chunks",
    prev: "Previous", next: "Next", openReader: "Open in Reader",
    ocrLang: "OCR Language", untitled: "Untitled note", welcome: "Capture text from the world around you",
    welcomeSub: "Take a photo, upload an image, or paste text — in any of your languages",
    readingGuide: "Reading Guide", tapToRead: "Tap any saved note to read it",
    or: "or", speechRate: "Speech Rate", slow: "Slow", fast: "Fast",
    pause: "Pause", resume: "Resume",
    translateTo: "Translate to", translate: "Translate", translating: "Translating…",
    translation: "Translation", original: "Original", showOriginal: "Show Original",
    showTranslation: "Show Translation",
  },
  pt: {
    scan: "Digitalizar", read: "Ler", write: "Escrever", notes: "Notas", settings: "Definições",
    takePhoto: "Tirar Foto", uploadImage: "Carregar Imagem", pasteText: "Ou cole / escreva texto aqui…",
    scanning: "A digitalizar…", readAloud: "Ler em Voz Alta", stop: "Parar",
    bionicMode: "Leitura Biónica", saveNote: "Guardar", clear: "Limpar",
    startWriting: "Comece a escrever…", voiceInput: "Voz", wordCount: "palavras",
    saved: "Guardado!", noNotes: "Sem notas guardadas", delete: "Apagar",
    language: "Idioma", theme: "Tema", font: "Fonte", fontSize: "Tamanho",
    lineHeight: "Entrelinhas", letterSpacing: "Espaço entre Letras",
    processing: "A processar…", ocrComplete: "Texto extraído!",
    readBack: "Reler", newScan: "Nova Digitalização", chunkMode: "Partes",
    prev: "Anterior", next: "Seguinte", openReader: "Abrir no Leitor",
    ocrLang: "Idioma OCR", untitled: "Nota sem título", welcome: "Capture texto do mundo à sua volta",
    welcomeSub: "Tire uma foto, carregue uma imagem ou cole texto — em qualquer idioma",
    readingGuide: "Guia de Leitura", tapToRead: "Toque numa nota para ler",
    or: "ou", speechRate: "Velocidade", slow: "Lento", fast: "Rápido",
    pause: "Pausar", resume: "Continuar",
    translateTo: "Traduzir para", translate: "Traduzir", translating: "A traduzir…",
    translation: "Tradução", original: "Original", showOriginal: "Mostrar Original",
    showTranslation: "Mostrar Tradução",
  },
  es: {
    scan: "Escanear", read: "Leer", write: "Escribir", notes: "Notas", settings: "Ajustes",
    takePhoto: "Tomar Foto", uploadImage: "Subir Imagen", pasteText: "O pega / escribe texto aquí…",
    scanning: "Escaneando…", readAloud: "Leer en Voz Alta", stop: "Parar",
    bionicMode: "Lectura Biónica", saveNote: "Guardar", clear: "Limpiar",
    startWriting: "Empieza a escribir…", voiceInput: "Voz", wordCount: "palabras",
    saved: "¡Guardado!", noNotes: "Sin notas guardadas", delete: "Eliminar",
    language: "Idioma", theme: "Tema", font: "Fuente", fontSize: "Tamaño",
    lineHeight: "Interlineado", letterSpacing: "Espacio entre Letras",
    processing: "Procesando…", ocrComplete: "¡Texto extraído!",
    readBack: "Releer", newScan: "Nuevo Escaneo", chunkMode: "Partes",
    prev: "Anterior", next: "Siguiente", openReader: "Abrir en Lector",
    ocrLang: "Idioma OCR", untitled: "Nota sin título", welcome: "Captura texto del mundo que te rodea",
    welcomeSub: "Toma una foto, sube una imagen o pega texto — en cualquier idioma",
    readingGuide: "Guía de Lectura", tapToRead: "Toca una nota para leerla",
    or: "o", speechRate: "Velocidad", slow: "Lento", fast: "Rápido",
    pause: "Pausar", resume: "Reanudar",
    translateTo: "Traducir a", translate: "Traducir", translating: "Traduciendo…",
    translation: "Traducción", original: "Original", showOriginal: "Mostrar Original",
    showTranslation: "Mostrar Traducción",
  },
  pl: {
    scan: "Skanuj", read: "Czytaj", write: "Pisz", notes: "Notatki", settings: "Ustawienia",
    takePhoto: "Zrób Zdjęcie", uploadImage: "Prześlij Obraz", pasteText: "Lub wklej / wpisz tekst tutaj…",
    scanning: "Skanowanie…", readAloud: "Czytaj na Głos", stop: "Stop",
    bionicMode: "Czytanie Bioniczne", saveNote: "Zapisz", clear: "Wyczyść",
    startWriting: "Zacznij pisać…", voiceInput: "Głos", wordCount: "słów",
    saved: "Zapisano!", noNotes: "Brak notatek", delete: "Usuń",
    language: "Język", theme: "Motyw", font: "Czcionka", fontSize: "Rozmiar",
    lineHeight: "Interlinia", letterSpacing: "Odstępy Liter",
    processing: "Przetwarzanie…", ocrComplete: "Tekst wyodrębniony!",
    readBack: "Przeczytaj", newScan: "Nowy Skan", chunkMode: "Fragmenty",
    prev: "Poprzedni", next: "Następny", openReader: "Otwórz w Czytniku",
    ocrLang: "Język OCR", untitled: "Bez tytułu", welcome: "Skanuj tekst ze świata wokół Ciebie",
    welcomeSub: "Zrób zdjęcie, prześlij obraz lub wklej tekst — w dowolnym języku",
    readingGuide: "Linia Czytania", tapToRead: "Dotknij notatkę, aby ją przeczytać",
    or: "lub", speechRate: "Prędkość", slow: "Wolno", fast: "Szybko",
    pause: "Pauza", resume: "Wznów",
    translateTo: "Przetłumacz na", translate: "Przetłumacz", translating: "Tłumaczenie…",
    translation: "Tłumaczenie", original: "Oryginał", showOriginal: "Pokaż Oryginał",
    showTranslation: "Pokaż Tłumaczenie",
  },
  bg: {
    scan: "Сканирай", read: "Четене", write: "Писане", notes: "Бележки", settings: "Настройки",
    takePhoto: "Снимка", uploadImage: "Качи Снимка", pasteText: "Или поставете / напишете текст тук…",
    scanning: "Сканиране…", readAloud: "Прочети на Глас", stop: "Стоп",
    bionicMode: "Бионично Четене", saveNote: "Запази", clear: "Изчисти",
    startWriting: "Започнете да пишете…", voiceInput: "Глас", wordCount: "думи",
    saved: "Запазено!", noNotes: "Няма бележки", delete: "Изтрий",
    language: "Език", theme: "Тема", font: "Шрифт", fontSize: "Размер",
    lineHeight: "Междуредие", letterSpacing: "Разстояние",
    processing: "Обработка…", ocrComplete: "Текстът е извлечен!",
    readBack: "Прочети", newScan: "Ново Сканиране", chunkMode: "Части",
    prev: "Назад", next: "Напред", openReader: "Отвори в Четеца",
    ocrLang: "Език OCR", untitled: "Без заглавие", welcome: "Сканирайте текст от света около вас",
    welcomeSub: "Направете снимка, качете изображение или поставете текст — на всеки език",
    readingGuide: "Водач за Четене", tapToRead: "Докоснете бележка, за да я прочетете",
    or: "или", speechRate: "Скорост", slow: "Бавно", fast: "Бързо",
    pause: "Пауза", resume: "Продължи",
    translateTo: "Преведи на", translate: "Преведи", translating: "Превеждане…",
    translation: "Превод", original: "Оригинал", showOriginal: "Покажи Оригинала",
    showTranslation: "Покажи Превода",
  },
  ro: {
    scan: "Scanează", read: "Citește", write: "Scrie", notes: "Note", settings: "Setări",
    takePhoto: "Fă o Poză", uploadImage: "Încarcă Imagine", pasteText: "Sau lipește / scrie text aici…",
    scanning: "Se scanează…", readAloud: "Citește cu Voce", stop: "Stop",
    bionicMode: "Citire Bionică", saveNote: "Salvează", clear: "Șterge Tot",
    startWriting: "Începe să scrii…", voiceInput: "Voce", wordCount: "cuvinte",
    saved: "Salvat!", noNotes: "Nicio notă salvată", delete: "Șterge",
    language: "Limbă", theme: "Temă", font: "Font", fontSize: "Mărime",
    lineHeight: "Spațiere Rânduri", letterSpacing: "Spațiere Litere",
    processing: "Se procesează…", ocrComplete: "Text extras!",
    readBack: "Recitește", newScan: "Scanare Nouă", chunkMode: "Părți",
    prev: "Anterior", next: "Următor", openReader: "Deschide în Cititor",
    ocrLang: "Limbă OCR", untitled: "Fără titlu", welcome: "Capturați text din lumea din jurul vostru",
    welcomeSub: "Faceți o poză, încărcați o imagine sau lipiți text — în orice limbă",
    readingGuide: "Ghid de Citire", tapToRead: "Atinge o notă pentru a o citi",
    or: "sau", speechRate: "Viteză", slow: "Lent", fast: "Rapid",
    pause: "Pauză", resume: "Continuă",
    translateTo: "Traduce în", translate: "Traduce", translating: "Se traduce…",
    translation: "Traducere", original: "Original", showOriginal: "Arată Originalul",
    showTranslation: "Arată Traducerea",
  },
};

// ─── THEMES ──────────────────────────────────────────────────────
const THEMES = {
  ocean: {
    name: "Ocean", emoji: "🌊",
    bg: "#EEF4F8", surface: "#F5F9FC", surfaceAlt: "#DCE8F0", surfaceGlow: "#E4F1FA",
    text: "#1E3448", textMuted: "#5A7A94", accent: "#2E86AB", accentSoft: "#A8D4E6",
    accentDark: "#1B6B8A", success: "#4A9E6B", successSoft: "#DFF0E6",
    danger: "#C45A5A", dangerSoft: "#F8E4E4", warning: "#C4944A", warningSoft: "#FFF3D6",
    border: "#C8DBE8", shadow: "rgba(30,52,72,0.08)", focusRing: "rgba(46,134,171,0.35)",
    gradient: "linear-gradient(135deg, #EEF4F8 0%, #E4F1FA 100%)",
  },
  cream: {
    name: "Cream", emoji: "☀️",
    bg: "#FDF6EC", surface: "#FFF8EF", surfaceAlt: "#F5EBD8", surfaceGlow: "#FFF3E0",
    text: "#3D3229", textMuted: "#8C7A65", accent: "#E8913A", accentSoft: "#F5D4A9",
    accentDark: "#C47520", success: "#6B9E5B", successSoft: "#E3F0DE",
    danger: "#D4644E", dangerSoft: "#FDEAE6", warning: "#D4A44E", warningSoft: "#FFF3D6",
    border: "#E8DCC8", shadow: "rgba(61,50,41,0.08)", focusRing: "rgba(232,145,58,0.35)",
    gradient: "linear-gradient(135deg, #FDF6EC 0%, #FFF3E0 100%)",
  },
  moss: {
    name: "Forest", emoji: "🌿",
    bg: "#F0F4EC", surface: "#F7FAF4", surfaceAlt: "#DDE6D5", surfaceGlow: "#E8F2E0",
    text: "#2A3524", textMuted: "#6B7F62", accent: "#5A8F4A", accentSoft: "#B5D4A8",
    accentDark: "#3D7030", success: "#5A8F4A", successSoft: "#E0F0D8",
    danger: "#C45A5A", dangerSoft: "#F8E4E4", warning: "#B8944A", warningSoft: "#F8F0D6",
    border: "#C8D8BE", shadow: "rgba(42,53,36,0.08)", focusRing: "rgba(90,143,74,0.35)",
    gradient: "linear-gradient(135deg, #F0F4EC 0%, #E8F2E0 100%)",
  },
  dusk: {
    name: "Night", emoji: "🌙",
    bg: "#1A1B2E", surface: "#222338", surfaceAlt: "#2C2D45", surfaceGlow: "#2E2F4A",
    text: "#E4E0F0", textMuted: "#9A94B8", accent: "#B07ACC", accentSoft: "#4A3D5E",
    accentDark: "#9B5FBB", success: "#6BBF8A", successSoft: "#253530",
    danger: "#E07070", dangerSoft: "#3A2525", warning: "#D4A44E", warningSoft: "#352E1E",
    border: "#3A3B55", shadow: "rgba(0,0,0,0.3)", focusRing: "rgba(176,122,204,0.35)",
    gradient: "linear-gradient(135deg, #1A1B2E 0%, #252640 100%)",
  },
};

const FONTS = {
  dyslexic: "'OpenDyslexic', 'Comic Sans MS', cursive",
  atkinson: "'Atkinson Hyperlegible', 'Verdana', sans-serif",
  mono: "'JetBrains Mono', monospace",
};
const LINE_HEIGHTS = { compact: 1.5, normal: 1.8, relaxed: 2.2 };
const FONT_SIZES = { small: 15, medium: 17, large: 20, xl: 24 };
const LETTER_SPACINGS = { normal: "0em", wide: "0.04em", wider: "0.07em" };

// ─── HELPERS ─────────────────────────────────────────────────────
const genId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

// TTS engine — handles Chrome's bug where long utterances silently die.
// We split text into short sentences and queue them one at a time.
const ttsEngine = {
  _queue: [],
  _speaking: false,
  _paused: false,
  _onStateChange: null,
  _langId: "en",
  _rate: 0.9,

  speak(text, langId = "en", rate = 0.9) {
    if (!("speechSynthesis" in window)) return;
    this.stop();
    this._langId = langId;
    this._rate = rate;
    // Split into sentences (max ~200 chars each) to avoid Chrome timeout
    const sentences = text.match(/[^.!?\n]+[.!?\n]+|[^.!?\n]+$/g) || [text];
    this._queue = sentences.map((s) => s.trim()).filter(Boolean);
    this._speaking = true;
    this._paused = false;
    this._notify();
    this._next();
  },

  _next() {
    if (!this._speaking || this._paused || this._queue.length === 0) {
      if (this._queue.length === 0) {
        this._speaking = false;
        this._notify();
      }
      return;
    }
    const lang = getLang(this._langId);
    const chunk = this._queue.shift();
    const u = new SpeechSynthesisUtterance(chunk);
    u.lang = lang.tts;
    u.rate = this._rate;
    u.pitch = 1;
    const voices = window.speechSynthesis.getVoices();
    const match = voices.find((v) => v.lang.startsWith(lang.tts.split("-")[0]));
    if (match) u.voice = match;
    u.onend = () => this._next();
    u.onerror = () => this._next();
    window.speechSynthesis.speak(u);
  },

  pause() {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.pause();
      this._paused = true;
      this._notify();
    }
  },

  resume() {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.resume();
      this._paused = false;
      this._notify();
      // If the browser cleared the utterance on pause, re-queue
      if (!window.speechSynthesis.speaking && this._queue.length > 0) this._next();
    }
  },

  stop() {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    this._queue = [];
    this._speaking = false;
    this._paused = false;
    this._notify();
  },

  get isSpeaking() { return this._speaking; },
  get isPaused() { return this._paused; },

  _notify() { if (this._onStateChange) this._onStateChange({ speaking: this._speaking, paused: this._paused }); },
};

function bionicText(text) {
  return text.split(" ").map((word) => {
    if (word.length <= 1) return word;
    const boldLen = Math.ceil(word.length * 0.45);
    return `<b>${word.slice(0, boldLen)}</b>${word.slice(boldLen)}`;
  }).join(" ");
}

function chunkText(text, sentencesPerChunk = 3) {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const chunks = [];
  for (let i = 0; i < sentences.length; i += sentencesPerChunk) {
    chunks.push(sentences.slice(i, i + sentencesPerChunk).join(" ").trim());
  }
  return chunks;
}

// ─── TRANSLATION (MyMemory API — free, no key) ──────────────────
async function translateText(text, fromLang, toLang, onProgress) {
  // Split into sentence-sized chunks (MyMemory limit ~500 chars per request)
  const sentences = text.match(/[^.!?\n]+[.!?\n]+|[^.!?\n]+$/g) || [text];
  const chunks = [];
  let current = "";
  for (const s of sentences) {
    if ((current + s).length > 450 && current) {
      chunks.push(current.trim());
      current = s;
    } else {
      current += s;
    }
  }
  if (current.trim()) chunks.push(current.trim());

  const results = [];
  for (let i = 0; i < chunks.length; i++) {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(chunks[i])}&langpair=${fromLang}|${toLang}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Translation failed");
    const data = await res.json();
    results.push(data.responseData.translatedText);
    if (onProgress) onProgress(Math.round(((i + 1) / chunks.length) * 100));
  }
  return results.join(" ");
}

// ─── STATE ───────────────────────────────────────────────────────
const initialState = {
  lang: "en",
  ocrLang: "en",
  view: "scan",
  currentText: "",
  ocrStatus: null, // null | "loading" | "done" | "error"
  ocrProgress: 0,
  imagePreview: null,
  notes: [],
  settings: {
    theme: "ocean", font: "atkinson", fontSize: "medium",
    lineHeight: "relaxed", letterSpacing: "wide",
    bionicReading: false, readingGuide: false, speechRate: 0.9,
  },
};

function reducer(state, action) {
  switch (action.type) {
    case "LOAD_STATE": return { ...state, ...action.payload };
    case "SET_VIEW": return { ...state, view: action.payload };
    case "SET_LANG": return { ...state, lang: action.payload };
    case "SET_OCR_LANG": return { ...state, ocrLang: action.payload, lang: action.payload };
    case "SET_TEXT": return { ...state, currentText: action.payload };
    case "SET_IMAGE": return { ...state, imagePreview: action.payload };
    case "OCR_START": return { ...state, ocrStatus: "loading", ocrProgress: 0 };
    case "OCR_PROGRESS": return { ...state, ocrProgress: action.payload };
    case "OCR_DONE": return { ...state, ocrStatus: "done", ocrProgress: 100, currentText: action.payload };
    case "OCR_ERROR": return { ...state, ocrStatus: "error" };
    case "OCR_RESET": return { ...state, ocrStatus: null, ocrProgress: 0, imagePreview: null };
    case "ADD_NOTE": return { ...state, notes: [action.payload, ...state.notes] };
    case "DELETE_NOTE": return { ...state, notes: state.notes.filter((n) => n.id !== action.payload) };
    case "SET_SETTING": return { ...state, settings: { ...state.settings, [action.payload.key]: action.payload.value } };
    default: return state;
  }
}

// ─── SHARED UI ───────────────────────────────────────────────────

function Card({ theme, children, style = {}, glow = false }) {
  return (
    <div style={{
      background: glow ? theme.surfaceGlow : theme.surface, borderRadius: "16px",
      padding: "16px 18px", border: `1.5px solid ${theme.border}`,
      boxShadow: `0 2px 8px ${theme.shadow}`, transition: "all 0.2s", ...style,
    }}>
      {children}
    </div>
  );
}

function Btn({ theme, children, variant = "primary", style = {}, ...props }) {
  const styles = {
    primary: { background: theme.accent, color: "#fff", border: "none", boxShadow: `0 3px 12px ${theme.focusRing}` },
    secondary: { background: theme.surfaceAlt, color: theme.text, border: "none" },
    outline: { background: "transparent", color: theme.textMuted, border: `2px solid ${theme.border}` },
    danger: { background: "transparent", color: theme.danger, border: "none" },
    success: { background: theme.success, color: "#fff", border: "none" },
  };
  return (
    <button {...props} style={{
      padding: "12px 22px", borderRadius: "13px", fontWeight: 700,
      fontSize: "0.95em", cursor: "pointer", fontFamily: "inherit",
      transition: "all 0.2s", ...styles[variant], ...style,
    }}>
      {children}
    </button>
  );
}

function Chip({ active, onClick, children, theme, color }) {
  return (
    <button onClick={onClick} style={{
      padding: "9px 16px", borderRadius: "11px", border: "none",
      background: active ? (color || theme.accent) : theme.surfaceAlt,
      color: active ? "#fff" : theme.text, fontWeight: 600, fontSize: "0.88em",
      cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s", whiteSpace: "nowrap",
    }}>
      {children}
    </button>
  );
}

function SectionHeader({ theme, title, subtitle, icon }) {
  return (
    <div style={{ marginBottom: "20px" }}>
      <h2 style={{ fontSize: "1.5em", fontWeight: 700, margin: 0, color: theme.text, display: "flex", alignItems: "center", gap: "10px" }}>
        {icon && <span style={{ fontSize: "0.85em" }}>{icon}</span>} {title}
      </h2>
      {subtitle && <p style={{ color: theme.textMuted, margin: "4px 0 0", fontSize: "0.92em" }}>{subtitle}</p>}
    </div>
  );
}

function ReadingGuide({ active }) {
  const [y, setY] = useState(0);
  useEffect(() => {
    if (!active) return;
    const handler = (e) => setY(e.touches ? e.touches[0].clientY : e.clientY);
    window.addEventListener("mousemove", handler);
    window.addEventListener("touchmove", handler);
    return () => { window.removeEventListener("mousemove", handler); window.removeEventListener("touchmove", handler); };
  }, [active]);
  if (!active) return null;
  return (
    <>
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: Math.max(0, y - 28), background: "rgba(0,0,0,0.13)", pointerEvents: "none", zIndex: 9999, transition: "height 0.04s linear" }} />
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, height: Math.max(0, window.innerHeight - y - 28), background: "rgba(0,0,0,0.13)", pointerEvents: "none", zIndex: 9999, transition: "height 0.04s linear" }} />
    </>
  );
}

function ProgressBar({ progress, theme, label }) {
  return (
    <div style={{ width: "100%" }}>
      {label && <p style={{ color: theme.textMuted, fontSize: "0.9em", margin: "0 0 8px", textAlign: "center" }}>{label}</p>}
      <div style={{ width: "100%", height: "12px", borderRadius: "6px", background: theme.surfaceAlt, overflow: "hidden" }}>
        <div style={{
          width: `${progress}%`, height: "100%", borderRadius: "6px",
          background: `linear-gradient(90deg, ${theme.accent}, ${theme.accentDark})`,
          transition: "width 0.3s ease",
        }} />
      </div>
      <p style={{ color: theme.textMuted, fontSize: "0.85em", margin: "6px 0 0", textAlign: "center" }}>{Math.round(progress)}%</p>
    </div>
  );
}

// ─── SCAN VIEW ───────────────────────────────────────────────────

function ScanView({ state, dispatch, theme, t }) {
  const fileRef = useRef(null);
  const cameraRef = useRef(null);
  const [pasteText, setPasteText] = useState("");

  const handleImage = useCallback((file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => dispatch({ type: "SET_IMAGE", payload: e.target.result });
    reader.readAsDataURL(file);
  }, [dispatch]);

  const runOCR = useCallback(async () => {
    if (!state.imagePreview) return;
    const lang = getLang(state.ocrLang);
    dispatch({ type: "OCR_START" });
    try {
      const result = await Tesseract.recognize(state.imagePreview, lang.tess, {
        logger: (m) => {
          if (m.status === "recognizing text") {
            dispatch({ type: "OCR_PROGRESS", payload: Math.round(m.progress * 100) });
          }
        },
      });
      const text = result.data.text.trim();
      if (text) {
        dispatch({ type: "OCR_DONE", payload: text });
      } else {
        dispatch({ type: "OCR_ERROR" });
      }
    } catch {
      dispatch({ type: "OCR_ERROR" });
    }
  }, [state.imagePreview, state.ocrLang, dispatch]);

  const handlePasteSubmit = () => {
    if (pasteText.trim()) {
      dispatch({ type: "SET_LANG", payload: state.ocrLang });
      dispatch({ type: "SET_TEXT", payload: pasteText.trim() });
      dispatch({ type: "SET_VIEW", payload: "read" });
      setPasteText("");
    }
  };

  // After OCR is done, show result
  if (state.ocrStatus === "done") {
    return (
      <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
        <SectionHeader theme={theme} title={t.ocrComplete} icon="✅" />
        <Card theme={theme}>
          <p style={{ color: theme.text, lineHeight: 1.7, whiteSpace: "pre-wrap", maxHeight: "300px", overflow: "auto", margin: 0 }}>
            {state.currentText}
          </p>
        </Card>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <Btn theme={theme} onClick={() => { dispatch({ type: "SET_LANG", payload: state.ocrLang }); dispatch({ type: "SET_VIEW", payload: "read" }); }}>
            📖 {t.openReader}
          </Btn>
          <Btn theme={theme} variant="secondary" onClick={() => {
            dispatch({ type: "ADD_NOTE", payload: { id: genId(), text: state.currentText, lang: state.ocrLang, createdAt: Date.now(), source: "scan" } });
          }}>
            💾 {t.saveNote}
          </Btn>
          <Btn theme={theme} variant="outline" onClick={() => { dispatch({ type: "OCR_RESET" }); dispatch({ type: "SET_TEXT", payload: "" }); }}>
            🔄 {t.newScan}
          </Btn>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "20px" }}>
      <SectionHeader theme={theme} title={t.welcome} subtitle={t.welcomeSub} icon="📷" />

      {/* Language selector for OCR */}
      <Card theme={theme}>
        <p style={{ color: theme.textMuted, fontSize: "0.9em", margin: "0 0 10px", fontWeight: 600 }}>{t.ocrLang}</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {LANGS.map((l) => (
            <Chip key={l.id} active={state.ocrLang === l.id} onClick={() => dispatch({ type: "SET_OCR_LANG", payload: l.id })} theme={theme}>
              {l.flag} {l.native}
            </Chip>
          ))}
        </div>
      </Card>

      {/* Image preview + OCR */}
      {state.imagePreview ? (
        <Card theme={theme} glow>
          <img src={state.imagePreview} alt="Preview" style={{ width: "100%", borderRadius: "12px", maxHeight: "300px", objectFit: "contain" }} />
          {state.ocrStatus === "loading" ? (
            <div style={{ marginTop: "16px" }}>
              <ProgressBar progress={state.ocrProgress} theme={theme} label={t.processing} />
            </div>
          ) : state.ocrStatus === "error" ? (
            <div style={{ marginTop: "12px" }}>
              <p style={{ color: theme.danger, textAlign: "center", margin: "0 0 10px" }}>Could not extract text. Try a clearer image.</p>
              <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                <Btn theme={theme} variant="outline" onClick={() => dispatch({ type: "OCR_RESET" })}>🔄 {t.newScan}</Btn>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", gap: "10px", marginTop: "14px", justifyContent: "center" }}>
              <Btn theme={theme} onClick={runOCR}>🔍 {t.scan}</Btn>
              <Btn theme={theme} variant="outline" onClick={() => dispatch({ type: "OCR_RESET" })}>✕ {t.clear}</Btn>
            </div>
          )}
        </Card>
      ) : (
        <>
          {/* Camera + Upload buttons */}
          <div style={{ display: "flex", gap: "12px" }}>
            <Card theme={theme} glow style={{ flex: 1, textAlign: "center", cursor: "pointer" }}>
              <div onClick={() => cameraRef.current?.click()} style={{ padding: "20px 0" }}>
                <div style={{ fontSize: "2.5em", marginBottom: "8px" }}>📸</div>
                <p style={{ color: theme.text, fontWeight: 700, margin: 0 }}>{t.takePhoto}</p>
              </div>
              <input ref={cameraRef} type="file" accept="image/*" capture="environment"
                style={{ display: "none" }} onChange={(e) => handleImage(e.target.files?.[0])} />
            </Card>
            <Card theme={theme} glow style={{ flex: 1, textAlign: "center", cursor: "pointer" }}>
              <div onClick={() => fileRef.current?.click()} style={{ padding: "20px 0" }}>
                <div style={{ fontSize: "2.5em", marginBottom: "8px" }}>🖼️</div>
                <p style={{ color: theme.text, fontWeight: 700, margin: 0 }}>{t.uploadImage}</p>
              </div>
              <input ref={fileRef} type="file" accept="image/*"
                style={{ display: "none" }} onChange={(e) => handleImage(e.target.files?.[0])} />
            </Card>
          </div>

          {/* Paste text area */}
          <Card theme={theme}>
            <textarea
              value={pasteText} onChange={(e) => setPasteText(e.target.value)}
              placeholder={t.pasteText}
              style={{
                width: "100%", minHeight: "120px", padding: "14px", borderRadius: "12px",
                border: `2px solid ${theme.border}`, background: theme.surface, color: theme.text,
                fontSize: "1em", fontFamily: "inherit", outline: "none", resize: "vertical",
                boxSizing: "border-box", lineHeight: 1.7,
              }}
            />
            {pasteText.trim() && (
              <div style={{ marginTop: "10px", display: "flex", justifyContent: "flex-end" }}>
                <Btn theme={theme} onClick={handlePasteSubmit}>📖 {t.openReader}</Btn>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}

// ─── READER VIEW ─────────────────────────────────────────────────

function ReaderView({ state, dispatch, theme, t }) {
  const [bionic, setBionic] = useState(state.settings.bionicReading);
  const [chunked, setChunked] = useState(false);
  const [chunkIdx, setChunkIdx] = useState(0);
  const [ttsState, setTtsState] = useState({ speaking: false, paused: false });
  // Translation state
  const [targetLang, setTargetLang] = useState(() => state.lang === "en" ? "es" : "en");
  const [translated, setTranslated] = useState("");
  const [translating, setTranslating] = useState(false);
  const [transProgress, setTransProgress] = useState(0);
  const [showTranslation, setShowTranslation] = useState(false);
  const sourceLangRef = useRef(state.lang);

  const text = state.currentText;
  const chunks = chunked ? chunkText(text) : [text];
  const displayText = chunks[chunkIdx] || "";

  // The text we actually show — original or translated
  const visibleText = showTranslation && translated ? translated : displayText;
  // The language TTS should use — target if showing translation, source otherwise
  const ttsLangId = showTranslation && translated ? targetLang : state.lang;

  // Wire up TTS state listener
  useEffect(() => {
    ttsEngine._onStateChange = setTtsState;
    if ("speechSynthesis" in window) window.speechSynthesis.getVoices();
    return () => { ttsEngine._onStateChange = null; };
  }, []);

  // Stop speech when leaving the reader
  useEffect(() => {
    return () => ttsEngine.stop();
  }, []);

  // Clear translation when source text or source language changes
  useEffect(() => {
    if (sourceLangRef.current !== state.lang) {
      setTranslated("");
      setShowTranslation(false);
      sourceLangRef.current = state.lang;
    }
  }, [state.lang]);

  const handlePlay = () => {
    ttsEngine.speak(visibleText, ttsLangId, state.settings.speechRate);
  };
  const handlePause = () => ttsEngine.pause();
  const handleResume = () => ttsEngine.resume();
  const handleStop = () => ttsEngine.stop();

  const handleTranslate = async () => {
    ttsEngine.stop();
    setTranslating(true);
    setTransProgress(0);
    try {
      const result = await translateText(displayText, state.lang, targetLang, setTransProgress);
      setTranslated(result);
      setShowTranslation(true);
    } catch {
      setTranslated("");
    }
    setTranslating(false);
  };

  if (!text) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <SectionHeader theme={theme} title={t.read} icon="📖" />
        <Card theme={theme}>
          <p style={{ color: theme.textMuted, margin: "30px 0" }}>{t.welcomeSub}</p>
          <Btn theme={theme} onClick={() => dispatch({ type: "SET_VIEW", payload: "scan" })}>📷 {t.scan}</Btn>
        </Card>
      </div>
    );
  }

  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const activeLang = getLang(state.lang);
  const targetLangObj = getLang(targetLang);

  return (
    <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
      <SectionHeader theme={theme} title={t.read} subtitle={`${activeLang.flag} ${activeLang.native} · ${wordCount} ${t.wordCount}`} icon="📖" />

      {/* Source language selector */}
      <Card theme={theme}>
        <p style={{ color: theme.textMuted, fontSize: "0.85em", margin: "0 0 8px", fontWeight: 600 }}>{t.language}</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {LANGS.map((l) => (
            <Chip key={l.id} active={state.lang === l.id} onClick={() => { ttsEngine.stop(); dispatch({ type: "SET_LANG", payload: l.id }); }} theme={theme}>
              {l.flag} {l.native}
            </Chip>
          ))}
        </div>
      </Card>

      {/* Translate to */}
      <Card theme={theme} glow>
        <p style={{ color: theme.textMuted, fontSize: "0.85em", margin: "0 0 8px", fontWeight: 600 }}>{t.translateTo}</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "12px" }}>
          {LANGS.filter((l) => l.id !== state.lang).map((l) => (
            <Chip key={l.id} active={targetLang === l.id} onClick={() => { setTargetLang(l.id); setTranslated(""); setShowTranslation(false); }} theme={theme}>
              {l.flag} {l.native}
            </Chip>
          ))}
        </div>
        {translating ? (
          <ProgressBar progress={transProgress} theme={theme} label={t.translating} />
        ) : (
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <Btn theme={theme} onClick={handleTranslate} style={{ flex: 1 }}>
              🌐 {t.translate} → {targetLangObj.flag} {targetLangObj.native}
            </Btn>
            {translated && (
              <Btn theme={theme} variant={showTranslation ? "outline" : "secondary"} onClick={() => setShowTranslation(!showTranslation)} style={{ whiteSpace: "nowrap" }}>
                {showTranslation ? `📄 ${t.showOriginal}` : `🌐 ${t.showTranslation}`}
              </Btn>
            )}
          </div>
        )}
      </Card>

      {/* Play / Pause / Stop controls */}
      <Card theme={theme} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", padding: "14px" }}>
        {showTranslation && translated && (
          <p style={{ color: theme.accent, fontSize: "0.85em", margin: 0, fontWeight: 600 }}>
            🔊 {targetLangObj.flag} {targetLangObj.native}
          </p>
        )}
        <div style={{ display: "flex", justifyContent: "center", gap: "12px" }}>
          {!ttsState.speaking ? (
            <Btn theme={theme} onClick={handlePlay} style={{ minWidth: "140px", fontSize: "1.05em" }}>
              ▶️ {t.readAloud}
            </Btn>
          ) : (
            <>
              {ttsState.paused ? (
                <Btn theme={theme} onClick={handleResume} style={{ minWidth: "110px", fontSize: "1.05em" }}>
                  ▶️ {t.resume}
                </Btn>
              ) : (
                <Btn theme={theme} variant="secondary" onClick={handlePause} style={{ minWidth: "110px", fontSize: "1.05em" }}>
                  ⏸️ {t.pause}
                </Btn>
              )}
              <Btn theme={theme} variant="danger" onClick={handleStop} style={{ fontSize: "1.05em", border: `2px solid ${theme.danger}` }}>
                ⏹️ {t.stop}
              </Btn>
            </>
          )}
        </div>
      </Card>

      {/* Reading tools */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
        <Chip active={bionic} onClick={() => setBionic(!bionic)} theme={theme}>𝗔𝗮 {t.bionicMode}</Chip>
        <Chip active={chunked} onClick={() => { setChunked(!chunked); setChunkIdx(0); ttsEngine.stop(); setTranslated(""); setShowTranslation(false); }} theme={theme}>📄 {t.chunkMode}</Chip>
      </div>

      {/* Speech rate */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <span style={{ color: theme.textMuted, fontSize: "0.85em" }}>{t.slow}</span>
        <input type="range" min="0.5" max="1.5" step="0.1" value={state.settings.speechRate}
          onChange={(e) => dispatch({ type: "SET_SETTING", payload: { key: "speechRate", value: parseFloat(e.target.value) } })}
          style={{ flex: 1, accentColor: theme.accent }} />
        <span style={{ color: theme.textMuted, fontSize: "0.85em" }}>{t.fast}</span>
      </div>

      {/* Chunk navigation */}
      {chunked && chunks.length > 1 && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Btn theme={theme} variant="outline" style={{ padding: "8px 16px" }} disabled={chunkIdx === 0}
            onClick={() => { ttsEngine.stop(); setChunkIdx((i) => Math.max(0, i - 1)); setTranslated(""); setShowTranslation(false); }}>← {t.prev}</Btn>
          <span style={{ color: theme.textMuted, fontSize: "0.9em" }}>{chunkIdx + 1} / {chunks.length}</span>
          <Btn theme={theme} variant="outline" style={{ padding: "8px 16px" }} disabled={chunkIdx >= chunks.length - 1}
            onClick={() => { ttsEngine.stop(); setChunkIdx((i) => Math.min(chunks.length - 1, i + 1)); setTranslated(""); setShowTranslation(false); }}>{t.next} →</Btn>
        </div>
      )}

      {/* Text display */}
      <Card theme={theme} glow style={{ minHeight: "200px" }}>
        {showTranslation && translated && (
          <p style={{ color: theme.accent, fontSize: "0.8em", fontWeight: 700, margin: "0 0 8px" }}>
            {targetLangObj.flag} {t.translation}
          </p>
        )}
        {bionic ? (
          <div style={{ color: theme.text, lineHeight: 2, fontSize: "1.05em" }}
            dangerouslySetInnerHTML={{ __html: bionicText(visibleText) }} />
        ) : (
          <p style={{ color: theme.text, lineHeight: 2, fontSize: "1.05em", margin: 0, whiteSpace: "pre-wrap" }}>
            {visibleText}
          </p>
        )}
      </Card>

      {/* Actions */}
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <Btn theme={theme} variant="secondary" onClick={() => {
          dispatch({ type: "ADD_NOTE", payload: { id: genId(), text: showTranslation && translated ? translated : text, lang: showTranslation ? targetLang : state.lang, createdAt: Date.now(), source: "reader" } });
        }}>
          💾 {t.saveNote}
        </Btn>
        <Btn theme={theme} variant="outline" onClick={() => { dispatch({ type: "SET_TEXT", payload: "" }); dispatch({ type: "OCR_RESET" }); dispatch({ type: "SET_VIEW", payload: "scan" }); }}>
          🔄 {t.newScan}
        </Btn>
      </div>
    </div>
  );
}

// ─── WRITER VIEW ─────────────────────────────────────────────────

function WriterView({ state, dispatch, theme, t }) {
  const [text, setText] = useState("");
  const [listening, setListening] = useState(false);
  const [saved, setSaved] = useState(false);
  const recognitionRef = useRef(null);
  // Translation state
  const [targetLang, setTargetLang] = useState(() => state.lang === "en" ? "es" : "en");
  const [translated, setTranslated] = useState("");
  const [translating, setTranslating] = useState(false);
  const [transProgress, setTransProgress] = useState(0);

  const startVoice = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const recognition = new SR();
    const lang = getLang(state.lang);
    recognition.lang = lang.tts;
    recognition.interimResults = false;
    recognition.continuous = true;
    recognition.onresult = (e) => {
      let transcript = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) transcript += e.results[i][0].transcript + " ";
      }
      if (transcript) setText((prev) => prev + transcript);
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognition.start();
    recognitionRef.current = recognition;
    setListening(true);
  }, [state.lang]);

  const stopVoice = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
  }, []);

  const saveNote = () => {
    if (!text.trim()) return;
    dispatch({ type: "ADD_NOTE", payload: { id: genId(), text: text.trim(), lang: state.lang, createdAt: Date.now(), source: "writer" } });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleTranslate = async () => {
    if (!text.trim()) return;
    setTranslating(true);
    setTransProgress(0);
    try {
      const result = await translateText(text.trim(), state.lang, targetLang, setTransProgress);
      setTranslated(result);
    } catch {
      setTranslated("");
    }
    setTranslating(false);
  };

  // Clear translation when source text changes
  useEffect(() => { setTranslated(""); }, [text]);

  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const targetLangObj = getLang(targetLang);

  return (
    <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
      <SectionHeader theme={theme} title={t.write} subtitle={`${getLang(state.lang).flag} ${getLang(state.lang).native}`} icon="✍️" />

      {/* Writing language selector */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
        {LANGS.map((l) => (
          <Chip key={l.id} active={state.lang === l.id} onClick={() => dispatch({ type: "SET_LANG", payload: l.id })} theme={theme}>
            {l.flag} {l.native}
          </Chip>
        ))}
      </div>

      <Card theme={theme} glow>
        <textarea
          value={text} onChange={(e) => setText(e.target.value)}
          placeholder={t.startWriting}
          style={{
            width: "100%", minHeight: "200px", padding: "14px", borderRadius: "12px",
            border: `2px solid ${theme.border}`, background: theme.bg, color: theme.text,
            fontSize: "1.05em", fontFamily: "inherit", outline: "none", resize: "vertical",
            boxSizing: "border-box", lineHeight: 1.8,
          }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px" }}>
          <span style={{ color: theme.textMuted, fontSize: "0.85em" }}>
            {wordCount} {t.wordCount}
          </span>
        </div>
      </Card>

      {/* Voice + tools */}
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <Btn theme={theme} variant={listening ? "danger" : "primary"}
          onClick={listening ? stopVoice : startVoice}
          style={listening ? { animation: "pulse 1.5s infinite" } : {}}>
          {listening ? "⏹ " + t.stop : "🎤 " + t.voiceInput}
        </Btn>
        <Btn theme={theme} variant="secondary" onClick={() => ttsEngine.speak(text, state.lang, state.settings.speechRate)} disabled={!text.trim()}>
          🔊 {t.readBack}
        </Btn>
        <Btn theme={theme} variant="secondary" onClick={() => {
          if (text.trim()) {
            dispatch({ type: "SET_TEXT", payload: text.trim() });
            dispatch({ type: "SET_VIEW", payload: "read" });
          }
        }} disabled={!text.trim()}>
          📖 {t.openReader}
        </Btn>
      </div>

      {/* Translate to */}
      <Card theme={theme}>
        <p style={{ color: theme.textMuted, fontSize: "0.85em", margin: "0 0 8px", fontWeight: 600 }}>{t.translateTo}</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "12px" }}>
          {LANGS.filter((l) => l.id !== state.lang).map((l) => (
            <Chip key={l.id} active={targetLang === l.id} onClick={() => { setTargetLang(l.id); setTranslated(""); }} theme={theme}>
              {l.flag} {l.native}
            </Chip>
          ))}
        </div>
        {translating ? (
          <ProgressBar progress={transProgress} theme={theme} label={t.translating} />
        ) : (
          <Btn theme={theme} onClick={handleTranslate} disabled={!text.trim()} style={{ width: "100%" }}>
            🌐 {t.translate} → {targetLangObj.flag} {targetLangObj.native}
          </Btn>
        )}
      </Card>

      {/* Translation result */}
      {translated && (
        <Card theme={theme} glow>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <p style={{ color: theme.accent, fontSize: "0.85em", fontWeight: 700, margin: 0 }}>
              {targetLangObj.flag} {t.translation}
            </p>
            <Btn theme={theme} variant="outline" style={{ padding: "6px 14px", fontSize: "0.8em" }}
              onClick={() => ttsEngine.speak(translated, targetLang, state.settings.speechRate)}>
              🔊 {t.readAloud}
            </Btn>
          </div>
          <p style={{ color: theme.text, lineHeight: 1.8, margin: 0, whiteSpace: "pre-wrap" }}>{translated}</p>
          <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
            <Btn theme={theme} variant="secondary" style={{ fontSize: "0.85em", padding: "8px 16px" }} onClick={() => {
              dispatch({ type: "ADD_NOTE", payload: { id: genId(), text: translated, lang: targetLang, createdAt: Date.now(), source: "writer" } });
            }}>
              💾 {t.saveNote}
            </Btn>
          </div>
        </Card>
      )}

      <div style={{ display: "flex", gap: "10px" }}>
        <Btn theme={theme} variant="success" onClick={saveNote} disabled={!text.trim()}>
          {saved ? `✅ ${t.saved}` : `💾 ${t.saveNote}`}
        </Btn>
        <Btn theme={theme} variant="outline" onClick={() => { setText(""); setTranslated(""); }} disabled={!text}>
          🗑 {t.clear}
        </Btn>
      </div>
    </div>
  );
}

// ─── NOTES VIEW ──────────────────────────────────────────────────

function NotesView({ state, dispatch, theme, t }) {
  const openNote = (note) => {
    dispatch({ type: "SET_TEXT", payload: note.text });
    if (note.lang) dispatch({ type: "SET_LANG", payload: note.lang });
    dispatch({ type: "SET_VIEW", payload: "read" });
  };

  return (
    <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
      <SectionHeader theme={theme} title={t.notes} subtitle={state.notes.length > 0 ? t.tapToRead : undefined} icon="📝" />

      {state.notes.length === 0 ? (
        <Card theme={theme} style={{ textAlign: "center", padding: "40px 20px" }}>
          <p style={{ color: theme.textMuted, fontSize: "1.1em", margin: 0 }}>{t.noNotes}</p>
        </Card>
      ) : (
        state.notes.map((note) => {
          const lang = getLang(note.lang || "en");
          const preview = note.text.length > 120 ? note.text.slice(0, 120) + "…" : note.text;
          const date = new Date(note.createdAt).toLocaleDateString();
          const wordCount = note.text.split(/\s+/).filter(Boolean).length;
          return (
            <Card key={note.id} theme={theme} style={{ cursor: "pointer" }}>
              <div onClick={() => openNote(note)}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <span style={{ fontSize: "0.85em", color: theme.textMuted }}>
                    {lang.flag} {lang.native} · {wordCount} {t.wordCount} · {note.source === "scan" ? "📷" : "✍️"}
                  </span>
                  <span style={{ fontSize: "0.8em", color: theme.textMuted }}>{date}</span>
                </div>
                <p style={{ color: theme.text, margin: 0, lineHeight: 1.6 }}>{preview}</p>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "10px" }}>
                <Btn theme={theme} variant="danger" style={{ padding: "6px 14px", fontSize: "0.8em" }}
                  onClick={(e) => { e.stopPropagation(); dispatch({ type: "DELETE_NOTE", payload: note.id }); }}>
                  🗑 {t.delete}
                </Btn>
              </div>
            </Card>
          );
        })
      )}
    </div>
  );
}

// ─── SETTINGS VIEW ───────────────────────────────────────────────

function SettingsView({ state, dispatch, theme, t }) {
  const s = state.settings;
  const set = (key, value) => dispatch({ type: "SET_SETTING", payload: { key, value } });

  return (
    <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
      <SectionHeader theme={theme} title={t.settings} icon="⚙️" />

      {/* App Language */}
      <Card theme={theme}>
        <p style={{ color: theme.text, fontWeight: 700, margin: "0 0 10px" }}>{t.language}</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {LANGS.map((l) => (
            <Chip key={l.id} active={state.lang === l.id} onClick={() => dispatch({ type: "SET_LANG", payload: l.id })} theme={theme}>
              {l.flag} {l.native}
            </Chip>
          ))}
        </div>
      </Card>

      {/* Theme */}
      <Card theme={theme}>
        <p style={{ color: theme.text, fontWeight: 700, margin: "0 0 10px" }}>{t.theme}</p>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {Object.entries(THEMES).map(([key, th]) => (
            <Chip key={key} active={s.theme === key} onClick={() => set("theme", key)} theme={theme}>
              {th.emoji} {th.name}
            </Chip>
          ))}
        </div>
      </Card>

      {/* Font */}
      <Card theme={theme}>
        <p style={{ color: theme.text, fontWeight: 700, margin: "0 0 10px" }}>{t.font}</p>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {Object.entries(FONTS).map(([key, _]) => (
            <Chip key={key} active={s.font === key} onClick={() => set("font", key)} theme={theme}>
              {key === "dyslexic" ? "OpenDyslexic" : key === "atkinson" ? "Atkinson" : "Mono"}
            </Chip>
          ))}
        </div>
      </Card>

      {/* Font Size */}
      <Card theme={theme}>
        <p style={{ color: theme.text, fontWeight: 700, margin: "0 0 10px" }}>{t.fontSize}</p>
        <div style={{ display: "flex", gap: "8px" }}>
          {Object.entries(FONT_SIZES).map(([key, _]) => (
            <Chip key={key} active={s.fontSize === key} onClick={() => set("fontSize", key)} theme={theme}>
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </Chip>
          ))}
        </div>
      </Card>

      {/* Line Height */}
      <Card theme={theme}>
        <p style={{ color: theme.text, fontWeight: 700, margin: "0 0 10px" }}>{t.lineHeight}</p>
        <div style={{ display: "flex", gap: "8px" }}>
          {Object.entries(LINE_HEIGHTS).map(([key, _]) => (
            <Chip key={key} active={s.lineHeight === key} onClick={() => set("lineHeight", key)} theme={theme}>
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </Chip>
          ))}
        </div>
      </Card>

      {/* Letter Spacing */}
      <Card theme={theme}>
        <p style={{ color: theme.text, fontWeight: 700, margin: "0 0 10px" }}>{t.letterSpacing}</p>
        <div style={{ display: "flex", gap: "8px" }}>
          {Object.entries(LETTER_SPACINGS).map(([key, _]) => (
            <Chip key={key} active={s.letterSpacing === key} onClick={() => set("letterSpacing", key)} theme={theme}>
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </Chip>
          ))}
        </div>
      </Card>

      {/* Toggles */}
      <Card theme={theme}>
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}>
            <span style={{ color: theme.text, fontWeight: 600 }}>𝗔𝗮 {t.bionicMode}</span>
            <input type="checkbox" checked={s.bionicReading} onChange={() => set("bionicReading", !s.bionicReading)}
              style={{ width: "20px", height: "20px", accentColor: theme.accent }} />
          </label>
          <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}>
            <span style={{ color: theme.text, fontWeight: 600 }}>📏 {t.readingGuide}</span>
            <input type="checkbox" checked={s.readingGuide} onChange={() => set("readingGuide", !s.readingGuide)}
              style={{ width: "20px", height: "20px", accentColor: theme.accent }} />
          </label>
        </div>
      </Card>

      {/* Speech Rate */}
      <Card theme={theme}>
        <p style={{ color: theme.text, fontWeight: 700, margin: "0 0 10px" }}>{t.speechRate}</p>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ color: theme.textMuted, fontSize: "0.85em" }}>{t.slow}</span>
          <input type="range" min="0.5" max="1.5" step="0.1" value={s.speechRate}
            onChange={(e) => set("speechRate", parseFloat(e.target.value))}
            style={{ flex: 1, accentColor: theme.accent }} />
          <span style={{ color: theme.textMuted, fontSize: "0.85em" }}>{t.fast}</span>
        </div>
      </Card>
    </div>
  );
}

// ─── NAVIGATION ──────────────────────────────────────────────────

function Nav({ view, dispatch, theme, t }) {
  const items = [
    { id: "scan", icon: "📷", label: t.scan },
    { id: "read", icon: "📖", label: t.read },
    { id: "write", icon: "✍️", label: t.write },
    { id: "notes", icon: "📝", label: t.notes },
    { id: "settings", icon: "⚙️", label: t.settings },
  ];
  return (
    <nav style={{
      position: "fixed", bottom: 0, left: 0, right: 0,
      background: theme.surface, borderTop: `1.5px solid ${theme.border}`,
      display: "flex", justifyContent: "space-around", padding: "6px 0 env(safe-area-inset-bottom, 8px)",
      zIndex: 1000,
    }}>
      {items.map((item) => (
        <button key={item.id} onClick={() => dispatch({ type: "SET_VIEW", payload: item.id })}
          style={{
            background: "none", border: "none", cursor: "pointer", padding: "8px 4px",
            display: "flex", flexDirection: "column", alignItems: "center", gap: "2px",
            color: view === item.id ? theme.accent : theme.textMuted, fontFamily: "inherit",
            fontWeight: view === item.id ? 700 : 500, fontSize: "0.7em",
            transition: "color 0.15s", minWidth: "55px",
          }}>
          <span style={{ fontSize: "1.5em" }}>{item.icon}</span>
          {item.label}
        </button>
      ))}
    </nav>
  );
}

// ─── MAIN APP ────────────────────────────────────────────────────

export default function LinguaLens() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const theme = THEMES[state.settings.theme] || THEMES.ocean;
  const t = LABELS[state.lang] || LABELS.en;

  // Load saved state
  useEffect(() => {
    try {
      const raw = localStorage.getItem("lingualens-state");
      if (raw) {
        const saved = JSON.parse(raw);
        dispatch({ type: "LOAD_STATE", payload: { ...saved, ocrStatus: null, ocrProgress: 0, imagePreview: null } });
      }
    } catch {}
  }, []);

  // Save state (debounced)
  useEffect(() => {
    const timeout = setTimeout(() => {
      const { ocrStatus, ocrProgress, imagePreview, ...saveable } = state;
      localStorage.setItem("lingualens-state", JSON.stringify(saveable));
    }, 300);
    return () => clearTimeout(timeout);
  }, [state]);

  // Apply global styles
  useEffect(() => {
    const html = document.documentElement;
    html.style.fontFamily = FONTS[state.settings.font] || FONTS.atkinson;
    html.style.fontSize = `${FONT_SIZES[state.settings.fontSize] || 17}px`;
    html.style.lineHeight = LINE_HEIGHTS[state.settings.lineHeight] || 1.8;
    html.style.letterSpacing = LETTER_SPACINGS[state.settings.letterSpacing] || "0em";
    document.body.style.margin = "0";
    document.body.style.background = theme.bg;
    document.body.style.color = theme.text;
    document.body.style.minHeight = "100vh";
    document.body.style.overflowX = "hidden";

    // Load fonts
    const fonts = [
      "https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&display=swap",
      "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap",
      "https://cdn.jsdelivr.net/npm/open-dyslexic@1.0.3/open-dyslexic-regular.css",
    ];
    fonts.forEach((href) => {
      if (!document.querySelector(`link[href="${href}"]`)) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = href;
        document.head.appendChild(link);
      }
    });

    // Load speech synthesis voices
    if ("speechSynthesis" in window) window.speechSynthesis.getVoices();
  }, [state.settings, theme]);

  // Inject pulse animation
  useEffect(() => {
    if (!document.getElementById("ll-keyframes")) {
      const style = document.createElement("style");
      style.id = "ll-keyframes";
      style.textContent = `
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.6} }
        * { -webkit-tap-highlight-color: transparent; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-thumb { background: rgba(128,128,128,0.3); border-radius: 3px; }
      `;
      document.head.appendChild(style);
    }
  }, []);

  const viewMap = {
    scan: ScanView,
    read: ReaderView,
    write: WriterView,
    notes: NotesView,
    settings: SettingsView,
  };
  const View = viewMap[state.view] || ScanView;

  return (
    <div style={{ paddingBottom: "80px", maxWidth: "600px", margin: "0 auto", minHeight: "100vh" }}>
      <ReadingGuide active={state.settings.readingGuide} />
      <View state={state} dispatch={dispatch} theme={theme} t={t} />
      <Nav view={state.view} dispatch={dispatch} theme={theme} t={t} />
    </div>
  );
}
