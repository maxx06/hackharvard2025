import RecorderButton from "../components/RecorderButton";

export default function Page() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Voice‑to‑Text Demo 🎤
      </h1>
      <RecorderButton />
    </main>
  );
}