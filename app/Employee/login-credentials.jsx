// app/Employee/login-credential.jsx
'use client';
import { useSelector, useDispatch } from 'react-redux';
import { setLoginCredentials, setCurrentPage, resetEmployeeData } from '@/redux/features/emp-slice';
import  TabNavigation  from './components/TabNavigation';

const LoginCredentialPage = () => {
  const dispatch = useDispatch();
  const loginCredentials = useSelector((state) => state.employeeSlice.loginCredentials);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    dispatch(setLoginCredentials({ ...loginCredentials, [name]: value }));
  };

  const handleNextPage = () => {
    dispatch(setCurrentPage('generalDetails'));
  };
  const handleBackPage = () => {
    dispatch(setCurrentPage('generalDetails')); // Navigate back to General Details page
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Here, submit all the inputs from all pages to the database
    const response = await fetch('/api/submitEmployee', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...loginCredentials }),
    });

    if (response.ok) {
      alert('Employee data submitted successfully!');
      dispatch(resetEmployeeData());
    } else {
      alert('Failed to submit employee data.');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 p-4">
  {/* Container for TabNavigation */}
  <div className="flex justify-center mb-6">
    <TabNavigation />
  </div>

  {/* Main content */}
  <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-6xl mx-auto">
    <h2 className="text-2xl font-bold text-blue-500 mb-1">Login Credentials</h2>
    <p className="text-gray-400 text-sm mb-3">Please enter your login credentials</p>
    <div className="border-2 w-10 inline-block mb-6 border-blue-500"></div>
    
    <form className="space-y-6" onSubmit={handleSubmit}>
      {/* Username and Password */}
      <div className="flex flex-wrap -mx-4 mb-4">
        <div className="w-full md:w-1/2 px-4 mb-4 md:mb-0">
          <label htmlFor="username" className="block text-sm font-medium text-gray-700">
            Username
          </label>
          <input
            type="text"
            id="username"
            name="username"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
            placeholder="Enter your username"
          />
        </div>
        <div className="w-full md:w-1/2 px-4">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
            placeholder="Enter your password"
          />
        </div>
      </div>

      {/* App Rights and Employee ID */}
      <div className="flex flex-wrap -mx-4 mb-4">
        <div className="w-full md:w-1/2 px-4 mb-4 md:mb-0">
          <label htmlFor="appRights" className="block text-sm font-medium text-gray-700">
            App Rights
          </label>
          <input
            type="text"
            id="appRights"
            name="appRights"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
            placeholder="Enter app rights"
          />
        </div>
        <div className="w-full md:w-1/2 px-4">
          <label htmlFor="employeeId" className="block text-sm font-medium text-gray-700">
            Employee ID
          </label>
          <input
            type="text"
            id="employeeId"
            name="employeeId"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
            placeholder="Enter employee ID"
          />
        </div>
      </div>

      {/* Probation and Salary on Joining */}
      <div className="flex flex-wrap -mx-4 mb-4">
        <div className="w-full md:w-1/2 px-4 mb-4 md:mb-0">
          <label htmlFor="probation" className="block text-sm font-medium text-gray-700">
            Probation
          </label>
          <input
            type="text"
            id="probation"
            name="probation"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
            placeholder="Enter probation period"
          />
        </div>
        <div className="w-full md:w-1/2 px-4">
          <label htmlFor="salaryOnJoining" className="block text-sm font-medium text-gray-700">
            Salary on Joining
          </label>
          <input
            type="number"
            id="salaryOnJoining"
            name="salaryOnJoining"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
            placeholder="Enter salary on joining"
          />
        </div>
      </div>

      {/* Remarks */}
      <div className="flex flex-wrap -mx-4 mb-4">
        <div className="w-full px-4">
          <label htmlFor="remarks" className="block text-sm font-medium text-gray-700">
            Remarks
          </label>
          <textarea
            id="remarks"
            name="remarks"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
            placeholder="Enter any remarks"
            rows="3"
          />
        </div>
      </div>

      {/* Button Container */}
      <div className="flex justify-between mt-6">
        <button
          type="button"
          onClick={handleBackPage}
          className="px-6 py-2 bg-gray-500 text-white rounded-lg"
        >
          Back
        </button>

        <button
          type="submit"
          className="px-6 py-2 bg-blue-500 text-white rounded-lg"
        >
          Submit
        </button>
      </div>
    </form>
  </div>
</div>

  );
}

export default LoginCredentialPage;
