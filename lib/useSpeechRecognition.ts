"use client";
import { useState, useRef, useCallback, useEffect } from "react";

// ── Minimal browser Speech Recognition types ──────────────────────────────
interface SpeechRecognitionResultItem {
  readonly transcript: string;
  readonly confidence: number;
}
interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionResultItem;
  [index: number]: SpeechRecognitionResultItem;
}
interface SpeechRecognitionResultList {
  readonly length: number;
  readonly resultIndex: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}
interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}
interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message: string;
}
interface ISpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onstart:   ((e: Event) => void) | null;
  onend:     ((e: Event) => void) | null;
  onerror:   ((e: SpeechRecognitionErrorEvent) => void) | null;
  onresult:  ((e: SpeechRecognitionEvent) => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}
interface ISpeechRecognitionCtor {
  new(): ISpeechRecognition;
}
// ─────────────────────────────────────────────────────────────────────────

export type SpeechState = "idle" | "listening" | "processing" | "unsupported";

interface Options {
  onTranscript: (text: string, isFinal: boolean) => void;
  onEnd?: () => void;
  lang?: string;
  continuous?: boolean;
  interimResults?: boolean;
}

export function useSpeechRecognition({
  onTranscript, onEnd,
  lang = "en-US",
  continuous = false,
  interimResults = true,
}: Options) {
  const [state, setState] = useState<SpeechState>("idle");
  const [error, setError] = useState<string | null>(null);
  const recRef = useRef<ISpeechRecognition | null>(null);

  // Keep callbacks in refs so event handlers always see the latest version
  const onTranscriptRef = useRef(onTranscript);
  const onEndRef        = useRef(onEnd);
  useEffect(() => { onTranscriptRef.current = onTranscript; }, [onTranscript]);
  useEffect(() => { onEndRef.current = onEnd; }, [onEnd]);

  const getSR = (): ISpeechRecognitionCtor | null => {
    if (typeof window === "undefined") return null;
    return (
      (window as unknown as { SpeechRecognition?: ISpeechRecognitionCtor }).SpeechRecognition ??
      (window as unknown as { webkitSpeechRecognition?: ISpeechRecognitionCtor }).webkitSpeechRecognition ??
      null
    );
  };

  const isSupported = typeof window !== "undefined" && getSR() !== null;

  const stop = useCallback(() => {
    recRef.current?.stop();
    recRef.current = null;
    setState("idle");
  }, []);

  const start = useCallback(() => {
    const SR = getSR();
    if (!SR) { setState("unsupported"); return; }
    recRef.current?.stop();

    const rec = new SR();
    rec.lang = lang;
    rec.continuous = continuous;
    rec.interimResults = interimResults;
    rec.maxAlternatives = 1;

    rec.onstart = () => { setState("listening"); setError(null); };
    rec.onend   = () => {
      recRef.current = null;
      setState("idle");
      onEndRef.current?.();
    };
    rec.onerror = (e: SpeechRecognitionErrorEvent) => {
      const msg =
        e.error === "not-allowed" ? "Microphone access was denied. Allow it in browser settings." :
        e.error === "no-speech"   ? "No speech detected — try again." :
        e.error === "network"     ? "Network error during recognition." :
        `Speech error: ${e.error}`;
      setError(msg);
      setState("idle");
    };
    rec.onresult = (e: SpeechRecognitionEvent) => {
      let interim = "", final = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) final += t;
        else interim += t;
      }
      if (final)   onTranscriptRef.current(final.trim(), true);
      if (interim) onTranscriptRef.current(interim.trim(), false);
    };

    try {
      rec.start();
      recRef.current = rec;
    } catch {
      setError("Could not start microphone.");
      setState("idle");
    }
  }, [lang, continuous, interimResults]);

  const toggle = useCallback(() => {
    if (state === "listening") stop();
    else start();
  }, [state, start, stop]);

  useEffect(() => () => { recRef.current?.abort(); }, []);

  return { state, error, isSupported, start, stop, toggle };
}
