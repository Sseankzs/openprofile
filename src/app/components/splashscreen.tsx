"use client";

export default function SplashScreen() {
  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
      <div className="text-2xl font-bold text-firered animate-pulse">
        Loading OpenProfile...
      </div>
    </div>
  );
}