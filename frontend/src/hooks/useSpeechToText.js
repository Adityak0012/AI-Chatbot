import { useState, useEffect, useCallback, useRef } from 'react';

export const useSpeechToText = (onTranscript) => {
  const [isListening, setIsListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const [recognition, setRecognition] = useState(null);
  // Tracks the user's intent (did they click stop?) separately from the
  // engine's internal state, so we can auto-restart after Chrome's
  // silent auto-stop without restarting after a deliberate stop.
  const shouldListenRef = useRef(false);

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
    rec.lang = 'en-IN';

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
      if (onTranscript) {
        onTranscript({ final: finalTranscript, interim: interimTranscript });
      }
    };

    rec.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        shouldListenRef.current = false;
        alert('Mic permission blocked hai. Browser ke address bar ke paas mic icon se allow karo.');
      } else if (event.error === 'audio-capture') {
        shouldListenRef.current = false;
        alert('Koi microphone detect nahi hua. Device settings check karo.');
      }
      // other errors (e.g. 'no-speech') are non-fatal; onend below decides
      // whether to restart or stop.
    };

    rec.onend = () => {
      if (shouldListenRef.current) {
        // Chrome ends recognition after a pause even in continuous mode.
        // Restart automatically since the user hasn't clicked stop.
        try {
          rec.start();
        } catch (err) {
          setIsListening(false);
        }
      } else {
        setIsListening(false);
      }
    };

    setRecognition(rec);
  }, [onTranscript]);

  const toggleListening = useCallback(() => {
    if (!supported || !recognition) return;

    if (isListening) {
      shouldListenRef.current = false;
      recognition.stop();
      setIsListening(false);
    } else {
      shouldListenRef.current = true;
      try {
        recognition.start();
        setIsListening(true);
      } catch (err) {
        console.error('Failed to start recognition:', err);
      }
    }
  }, [isListening, recognition, supported]);

  return { isListening, supported, toggleListening };
};
