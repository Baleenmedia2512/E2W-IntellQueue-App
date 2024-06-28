'use client';
import TabNavigation from './components/TabNavigation';
import { useRouter } from 'next/navigation';

export default function GeneralDetails() {
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here
    // Navigate to the next page
    router.push('/Employee/proof');
  };

  return (
    <div>
      <TabNavigation />
      <div className="flex items-center justify-center min-h-screen bg-gray-100 mb-14 p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-6xl">
          <h2 className="text-2xl font-bold text-blue-500 mb-1">General Details</h2>
          <p className="text-gray-400 text-sm mb-3">Please fill in the following details</p>
          <div className="border-2 w-10 inline-block mb-6 border-blue-500"></div>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
                placeholder="Enter your name"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
                placeholder="Enter your email"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
                placeholder="Enter your phone number"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                Address
              </label>
              <textarea
                id="address"
                name="address"
                rows="3"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
                placeholder="Enter your address"
              ></textarea>
            </div>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
            >
              Next
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
