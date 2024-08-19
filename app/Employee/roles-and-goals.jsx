// app/Employee/roles-goals.jsx
'use client';
import { useSelector, useDispatch } from 'react-redux';
import { setRolesGoals, setCurrentPage } from '@/redux/features/emp-slice';
import TabNavigation from './components/TabNavigation';


const RolesGoalsPage = () => {
  const dispatch = useDispatch();
  const rolesGoals = useSelector((state) => state.employeeSlice.rolesGoals);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    dispatch(setRolesGoals({ ...rolesGoals, [name]: value }));
  };

  const handleNextPage = () => {
    dispatch(setCurrentPage('loginCredential'));
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-6xl">
        <TabNavigation />
        <h2 className="text-2xl font-bold text-blue-500 mb-1">Roles and Goals</h2>
        <p className="text-gray-400 text-sm mb-3">Please define your roles and goals</p>
        <div className="border-2 w-10 inline-block mb-6 border-blue-500"></div>
        <form className="space-y-6">
          {/* Your Roles and Goals Fields */}
           {/* Department */}
      <div className="flex flex-wrap -mx-4 mb-4">
        <div className="w-full px-4">
          <label htmlFor="department" className="block text-sm font-medium text-gray-700">
            Department
          </label>
          <input
            type="text"
            id="department"
            name="department"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
            placeholder="Enter your department"
          />
        </div>
      </div>

      {/* Designation */}
      <div className="flex flex-wrap -mx-4 mb-4">
        <div className="w-full px-4">
          <label htmlFor="designation" className="block text-sm font-medium text-gray-700">
            Designation
          </label>
          <input
            type="text"
            id="designation"
            name="designation"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
            placeholder="Enter your designation"
          />
        </div>
      </div>

      {/* Monthly Target Income */}
      <div className="flex flex-wrap -mx-4 mb-4">
        <div className="w-full px-4">
          <label htmlFor="monthlyTargetIncome" className="block text-sm font-medium text-gray-700">
            Monthly Target Income
          </label>
          <input
            type="number"
            id="monthlyTargetIncome"
            name="monthlyTargetIncome"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
            placeholder="Enter your monthly target income"
          />
        </div>
      </div>

      {/* Monthly Calls Target */}
      <div className="flex flex-wrap -mx-4 mb-4">
        <div className="w-full px-4">
          <label htmlFor="monthlyCallsTarget" className="block text-sm font-medium text-gray-700">
            Monthly Calls Target
          </label>
          <input
            type="number"
            id="monthlyCallsTarget"
            name="monthlyCallsTarget"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
            placeholder="Enter your monthly calls target"
          />
        </div>
      </div>

      {/* Previous Expenses in Month */}
      <div className="flex flex-wrap -mx-4 mb-4">
        <div className="w-full px-4">
          <label htmlFor="previousExpenses" className="block text-sm font-medium text-gray-700">
            Previous Expenses in Month
          </label>
          <input
            type="number"
            id="previousExpenses"
            name="previousExpenses"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
            placeholder="Enter previous expenses in the month"
          />
        </div>
      </div>

      {/* Current Grade */}
      <div className="flex flex-wrap -mx-4 mb-4">
        <div className="w-full px-4">
          <label htmlFor="currentGrade" className="block text-sm font-medium text-gray-700">
            Current Grade
          </label>
          <input
            type="text"
            id="currentGrade"
            name="currentGrade"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
            placeholder="Enter your current grade"
          />
        </div>
      </div>

      {/* Button Container */}
      <div className="flex justify-end mt-6">
        <button
          type="button"
          className="px-6 py-2 bg-blue-500 text-white rounded-lg"
          onClick={handleNextPage}
        >
          Next
        </button>
      </div>
        </form>
      </div>
    </div>
  );
}

export default RolesGoalsPage;
