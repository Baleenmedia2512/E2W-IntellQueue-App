"use client";

export default function ReadyScreen() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-screen bg-white p-4 space-y-6">
      <div className="w-full max-w-xs sm:max-w-sm md:max-w-md bg-white rounded-2xl shadow p-6 flex flex-col items-center text-center">
        <h2 className="text-green-600 font-bold text-xl">Doctor is ready to see you.</h2>
        <p className="text-gray-600 text-sm my-2">Please proceed to the counter.</p>
        <div className="my-4">
          <img src="https://via.placeholder.com/140" alt="Doctor Ready" className="w-36 h-36 object-contain" />
        </div>
        <div className="w-full">
          <p className="text-sm text-green-600 mb-1">It’s your turn! 💚</p>
          <div className="w-full h-2 bg-gray-300 rounded-full overflow-hidden">
            <div className="h-full bg-green-500 w-full"></div>
          </div>
          <p className="text-xs text-right text-gray-400 mt-1">Your turn</p>
        </div>
        <p className="text-xs text-blue-600 mt-4 underline">Visit our site</p>
      </div>
    </div>
  );
}