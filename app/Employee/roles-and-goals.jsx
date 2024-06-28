import Link from 'next/link';
import TabNavigation from './components/TabNavigation';

export default function RolesAndGoals() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-6xl">
        <TabNavigation />
        <h2 className="text-2xl font-bold text-blue-500 mb-1">Roles and Goals</h2>
        <p className="text-gray-400 text-sm mb-3">Please define your roles and goals</p>
        <div className="border-2 w-10 inline-block mb-6 border-blue-500"></div>
        <form className="space-y-6">
          {/* Your Roles and Goals Fields */}
          <div className="text-center">
            <Link href="/login-credentials">
              <button className="px-6 py-2 bg-blue-500 text-white rounded-lg">Next</button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
