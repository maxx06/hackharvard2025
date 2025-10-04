'use client';

import React, { useState, useEffect, useRef } from 'react';

interface SpeechInputProps {
  onTranscript: (text: string) => void;
}

const SpeechInput = ({ onTranscript }: SpeechInputProps) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check if browser supports speech recognition
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (!SpeechRecognition) {
        setIsSupported(false);
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let interimText = '';
        let finalText = transcript;

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptPiece = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalText += transcriptPiece + ' ';
          } else {
            interimText += transcriptPiece;
          }
        }

        setTranscript(finalText);
        setInterimTranscript(interimText);

        // Update graph in real-time
        const fullTranscript = finalText + interimText;
        if (fullTranscript.trim()) {
          onTranscript(fullTranscript.trim());
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [transcript]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleClear = () => {
    setTranscript('');
    setInterimTranscript('');
    onTranscript(''); // Clear the graph
  };

  if (!isSupported) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        Speech recognition is not supported in your browser. Please use Chrome or Edge.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white rounded-lg shadow-md p-6 border-2 border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">🎤 Describe Your Sounds</h2>
          <div className="flex gap-2">
            <button
              onClick={toggleListening}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                isListening
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              {isListening ? '⏹ Stop' : '🎤 Start Recording'}
            </button>
            <button
              onClick={handleClear}
              className="px-4 py-2 rounded-md font-medium bg-gray-300 hover:bg-gray-400 text-gray-800 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>

        <div className="min-h-[120px] bg-gray-50 rounded p-4 border border-gray-300">
          <p className="text-gray-800">
            {transcript}
            <span className="text-gray-400">{interimTranscript}</span>
          </p>
          {!transcript && !interimTranscript && (
            <p className="text-gray-400 italic">
              {isListening ? 'Listening...' : 'Click "Start Recording" to begin'}
            </p>
          )}
        </div>

        <div className="mt-4 text-center text-sm text-gray-600">
          Graph updates automatically as you speak
        </div>
      </div>

      {isListening && (
        <div className="flex items-center justify-center gap-2 text-red-500">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          <span className="font-medium">Recording in progress...</span>
        </div>
      )}
    </div>
  );
};

export default SpeechInput;
