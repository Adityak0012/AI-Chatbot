import { useState, useEffect, useCallback, useRef } from 'react';

export const useSpeechToText = (onTranscript) => {
  const [isListening, setIsListening] = useState(false);
  const [supported, setSupported] = useState(true);
  // Use refs so toggleListening always reads the latest values without
  // needing to recreate the recognition object when they change.
  const recognitionRef = useRef(null);
  const shouldListenRef = useRef(false);
  const onTranscriptRef = useRef(onTranscript);

  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }

    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-US';

    rec.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const chunk = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += chunk;
        } else {
          interimTranscript += chunk;
        }
      }
      if (onTranscriptRef.current) {
        onTranscriptRef.current({ final: finalTranscript, interim: interimTranscript });
      }
    };

    rec.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        shouldListenRef.current = false;
        alert('Mic permission blocked. Please allow mic access from the browser address bar.');
      } else if (event.error === 'audio-capture') {
        shouldListenRef.current = false;
        alert('No microphone detected. Please check your device settings.');
      }
      // non-fatal errors (e.g. 'no-speech') fall through; onend handles restart
    };

    rec.onend = () => {
      if (shouldListenRef.current) {
        // Chrome silently stops recognition after a pause in continuous mode.
        // Restart automatically since the user hasn't clicked stop.
        try {
          rec.start();
        } catch {
          setIsListening(false);
        }
      } else {
        setIsListening(false);
      }
    };

    recognitionRef.current = rec;

    return () => {
      shouldListenRef.current = false;
      try { rec.stop(); } catch {}
      recognitionRef.current = null;
    };
  }, []); // created once — onTranscript is read via ref

  const toggleListening = useCallback(() => {
    const rec = recognitionRef.current;
    if (!supported || !rec) return;

    if (isListening) {
      shouldListenRef.current = false;
      rec.stop();
      setIsListening(false);
    } else {
      shouldListenRef.current = true;
      try {
        rec.start();
        setIsListening(true);
      } catch (err) {
        console.error('Failed to start recognition:', err);
      }
    }
  }, [isListening, supported]);

  return { isListening, supported, toggleListening };
};
