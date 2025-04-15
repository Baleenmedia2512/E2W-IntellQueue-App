"use client";
import { encryptCompanyName } from '@/lib/encryption';

export default function ThankYouScreen() {

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-screen bg-white p-6">
      <div className="w-full max-w-sm md:max-w-md lg:bg-white lg:rounded-2xl lg:shadow lg:p-8 flex flex-col items-center text-center">
        <div className="mb-4">
          <img src="/GS/GSTitleMidLogo600x200.png" alt="Grace Scans Logo" className="w-40 h-auto object-contain" />
        </div>
        <div className="mb-4">
          <img src="/images/Thankyou.png" alt="Thank you" className="w-64 h-auto object-contain" />
        </div>
        <p className="text-gray-600 text-base mb-6">We’d love to hear your thoughts! Kindly share your feedback on our services.</p>
        <button className="px-8 py-3 rounded-full bg-blue-500 hover:bg-blue-600 text-white font-semibold shadow-md">
          Share your review!
        </button>
      </div>
    </div>
  );
}