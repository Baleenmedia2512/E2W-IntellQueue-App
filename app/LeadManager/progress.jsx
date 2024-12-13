import { useState, useEffect } from 'react';

export default function LoadingComponent() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (progress < 100) {
      const interval = setInterval(() => {
        setProgress(prev => Math.min(prev + 20, 100)); // Increase progress by 2 every 100ms
      }, 100);
      return () => clearInterval(interval); // Cleanup on unmount
    }
  }, [progress]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="font-poppins text-center max-w-[50%]">
        <h2 className="mb-4">Preparing Leads...</h2>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className="bg-blue-600 h-4 rounded-full"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}