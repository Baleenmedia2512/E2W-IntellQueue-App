// app/Employee/login-credential.jsx
'use client';
import { useSelector, useDispatch } from 'react-redux';
import { setLoginCredentials, setCurrentPage, resetEmployeeData } from '@/redux/features/emp-slice';
// import { TabNavigation } from './components/TabNavigation';

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
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-6xl">
        {/* <TabNavigation /> */}
        <h2 className="text-2xl font-bold text-blue-500 mb-1">Login Credentials</h2>
        <p className="text-gray-400 text-sm mb-3">Please enter your login credentials</p>
        <div className="border-2 w-10 inline-block mb-6 border-blue-500"></div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Your Login Credential Fields */}
          <div className="text-center">
            <button className="px-6 py-2 bg-blue-500 text-white rounded-lg" type="submit">Submit</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginCredentialPage;
