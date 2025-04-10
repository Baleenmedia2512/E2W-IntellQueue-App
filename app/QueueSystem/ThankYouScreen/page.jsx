"use client";

export default function ThankYouScreen() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-screen bg-white p-4 space-y-6">
      <div className="w-full max-w-xs sm:max-w-sm md:max-w-md bg-white rounded-2xl shadow p-6 flex flex-col items-center text-center">
        <div className="mb-2">
          <img src="https://via.placeholder.com/120x30" alt="Grace Scans Logo" className="w-30 h-auto object-contain" />
        </div>
        <h2 className="text-blue-500 text-2xl font-bold">Thank you!</h2>
        <p className="text-sm text-gray-600 mt-2">We’d love to hear your thoughts! Kindly share your feedback on our services.</p>
        <button className="mt-6 px-6 py-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-700 text-white font-semibold shadow-md">
          Share your review!
        </button>
      </div>
    </div>
  );
}