// app/Employee/roles-goals.jsx
'use client';
import { useSelector, useDispatch } from 'react-redux';
import { setRolesGoals, setCurrentPage } from '@/redux/features/emp-slice';
import { TabNavigation } from './components/TabNavigation';

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
          <div className="text-center">
            <button className="px-6 py-2 bg-blue-500 text-white rounded-lg" onClick={handleNextPage}>Next</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RolesGoalsPage;
