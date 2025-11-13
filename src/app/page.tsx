import Link from "next/link";

// src/app/page.tsx
export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Story Watcher
        </h1>
        <p className="text-gray-600 mb-8">
          Search through who has viewedyour Instagram stories
        </p>
        <Link href="/login">  
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
            Get Started
          </button>
        </Link>
      </div>
    </main>
  );
}