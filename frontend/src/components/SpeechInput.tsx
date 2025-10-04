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
      <div className="bg-red-950/50 border border-red-800 text-red-400 px-3 py-2 rounded text-xs">
        Speech recognition is not supported in your browser. Please use Chrome or Edge.
      </div>
    );
  }

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setTranscript(text);
    onTranscript(text);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="bg-slate-900/50 rounded-lg border border-slate-800 p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-white">Describe Your Sounds</h2>
          <div className="flex gap-2">
            <button
              onClick={toggleListening}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                isListening
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-slate-700 hover:bg-slate-600 text-white'
              }`}
            >
              {isListening ? 'Stop' : 'Start Recording'}
            </button>
            <button
              onClick={handleClear}
              className="px-3 py-1.5 rounded-md text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>

        <textarea
          value={transcript}
          onChange={handleTextChange}
          disabled={isListening}
          placeholder={isListening ? 'Listening...' : 'Type or click "Start Recording" to speak...'}
          className="w-full min-h-[100px] bg-slate-950/50 rounded p-3 border border-slate-800 text-sm text-slate-200 placeholder:text-slate-500 placeholder:italic focus:outline-none focus:ring-2 focus:ring-slate-600 disabled:opacity-50 disabled:cursor-not-allowed resize-y"
        />
        {interimTranscript && (
          <p className="text-sm text-slate-500 mt-2">{interimTranscript}</p>
        )}

        <div className="mt-3 text-center text-xs text-slate-500">
          Graph updates automatically as you type or speak
        </div>
      </div>

      {isListening && (
        <div className="flex items-center justify-center gap-2 text-red-400">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-xs font-medium">Recording in progress...</span>
        </div>
      )}
    </div>
  );
};

export default SpeechInput;
