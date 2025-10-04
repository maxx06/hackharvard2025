"use client";

import { useState, useRef } from "react";

export default function RecorderButton() {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<BlobPart[]>([]);

  async function startRecording() {
    audioChunks.current = [];
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    mediaRecorderRef.current = recorder;

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) audioChunks.current.push(e.data);
    };

    recorder.onstop = async () => {
      const blob = new Blob(audioChunks.current, { type: "audio/webm" });
      const formData = new FormData();
      formData.append("file", blob, "recording.webm");

      try {
        console.log("Uploading audio blob...");
        const resp = await fetch("http://localhost:8000/transcribe", {
          method: "POST",
          body: formData,
        });
        const data = await resp.json();
        console.log("🎧 Whisper Transcription:", data.text);
      } catch (err) {
        console.error("Transcription Error:", err);
      }
    };

    recorder.start();
    setIsRecording(true);
    console.log("🎙️ Recording started…");
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
    console.log("🛑 Recording stopped.");
  }

  return (
    <div className="flex flex-col items-center gap-3 mt-8">
      <button
        onClick={isRecording ? stopRecording : startRecording}
        className="px-4 py-2 bg-indigo-600 text-white rounded"
      >
        {isRecording ? "Stop 🎙️" : "Start Recording"}
      </button>
    </div>
  );
}