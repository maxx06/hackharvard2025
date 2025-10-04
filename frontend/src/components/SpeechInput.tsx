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
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);

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

        // Clear any existing silence timer
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
        }

        // Only trigger graph update after 2 seconds of silence
        const fullTranscript = finalText + interimText;
        if (fullTranscript.trim()) {
          silenceTimerRef.current = setTimeout(() => {
            console.log('[SpeechInput] Silence detected, triggering graph update');
            onTranscript(fullTranscript.trim());
          }, 2000);
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

      // Clear silence timer when stopping
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleClear = () => {
    setTranscript('');
    setInterimTranscript('');

    // Clear silence timer
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }

    onTranscript(''); // Clear the graph
  };

  if (!isSupported) {
    return (
      <div className="bg-red-950/50 border border-red-800 text-red-400 px-3 py-2 rounded text-xs">
        Speech recognition is not supported in your browser. Please use Chrome or Edge.
      </div>
    );
  }

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAudioURL, setGeneratedAudioURL] = useState<string | null>(null);
  const [duration, setDuration] = useState(10000); // in milliseconds

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setTranscript(text);

    // Clear any existing silence timer
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }

    // Trigger graph update after 1 second of no typing
    if (text.trim()) {
      silenceTimerRef.current = setTimeout(() => {
        console.log('[SpeechInput] Typing stopped, triggering graph update');
        onTranscript(text.trim());
      }, 1000);
    } else {
      onTranscript(''); // Clear immediately if empty
    }
  };

  const handleGenerateMusic = async () => {
    if (!transcript.trim()) return;

    setIsGenerating(true);
    setGeneratedAudioURL(null);

    try {
      const response = await fetch('http://localhost:8000/api/v1/music/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: transcript,
          duration_ms: duration,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to generate music');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setGeneratedAudioURL(url);
    } catch (error) {
      console.error('Error generating music:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Failed to generate music'}`);
    } finally {
      setIsGenerating(false);
    }
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

        <div className="mt-3 space-y-2">
          <div className="space-y-2">
            <label htmlFor="duration" className="block text-xs text-slate-400">
              Duration: {duration / 1000}s
            </label>
            <input
              id="duration"
              type="range"
              min="1000"
              max="120000"
              step="1000"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              disabled={isGenerating}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-violet-600 disabled:opacity-50"
            />
          </div>

          <button
            onClick={handleGenerateMusic}
            disabled={isGenerating || !transcript.trim()}
            className="w-full px-4 py-2 rounded-md text-sm font-medium bg-violet-600 hover:bg-violet-700 disabled:bg-slate-700 disabled:text-slate-500 text-white transition-colors"
          >
            {isGenerating ? 'Generating Music...' : '🎵 Generate Music'}
          </button>

          {generatedAudioURL && (
            <div className="bg-slate-950/50 rounded p-3 border border-slate-800">
              <p className="text-xs text-green-400 mb-2">Music generated!</p>
              <audio src={generatedAudioURL} controls className="w-full" />
            </div>
          )}

          <div className="text-center text-xs text-slate-500">
            {isListening ? 'Graph will update when you pause speaking...' : 'Graph updates after you stop typing or speaking'}
          </div>
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
