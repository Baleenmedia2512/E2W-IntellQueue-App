// app/Employee/proof.jsx
'use client';
import { useSelector, useDispatch } from 'react-redux';
import { setProofDetails, setCurrentPage } from '@/redux/features/emp-slice';
// import { TabNavigation } from './components/TabNavigation';
import TabNavigation from './components/TabNavigation';


const ProofPage = () => {
  const dispatch = useDispatch();
  const proofDetails = useSelector((state) => state.employeeSlice.proofDetails);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    dispatch(setProofDetails({ ...proofDetails, [name]: value }));
  };

  const handleNextPage = () => {
    dispatch(setCurrentPage('rolesGoals'));
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-6xl">
        <TabNavigation />
        <h2 className="text-2xl font-bold text-blue-500 mb-1">Proof</h2>
        <p className="text-gray-400 text-sm mb-3">Please upload your proof documents</p>
        <div className="border-2 w-10 inline-block mb-6 border-blue-500"></div>
        <form className="space-y-6">
          {/* Your Proof Fields */}
             {/* ID Proof */}
      <div className="flex flex-wrap -mx-4 mb-4">
        <div className="w-full px-4">
          <label htmlFor="idProof" className="block text-sm font-medium text-gray-700">
            ID Proof
          </label>
          <input
            type="file"
            id="idProof"
            name="idProof"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
          />
        </div>
      </div>

      {/* Address Proof */}
      <div className="flex flex-wrap -mx-4 mb-4">
        <div className="w-full px-4">
          <label htmlFor="addressProof" className="block text-sm font-medium text-gray-700">
            Address Proof
          </label>
          <input
            type="file"
            id="addressProof"
            name="addressProof"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
          />
        </div>
      </div>

      {/* PAN */}
      <div className="flex flex-wrap -mx-4 mb-4">
        <div className="w-full px-4">
          <label htmlFor="pan" className="block text-sm font-medium text-gray-700">
            PAN
          </label>
          <input
            type="file"
            id="pan"
            name="pan"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
          />
        </div>
      </div>

      {/* Bank ID */}
      <div className="flex flex-wrap -mx-4 mb-4">
        <div className="w-full px-4">
          <label htmlFor="bankId" className="block text-sm font-medium text-gray-700">
            Bank ID
          </label>
          <input
            type="file"
            id="bankId"
            name="bankId"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
          />
        </div>
      </div>

      {/* Bank Account */}
      <div className="flex flex-wrap -mx-4 mb-4">
        <div className="w-full px-4">
          <label htmlFor="bankAccount" className="block text-sm font-medium text-gray-700">
            Bank Account
          </label>
          <input
            type="file"
            id="bankAccount"
            name="bankAccount"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
          />
        </div>
      </div>
          <div className="flex justify-end mt-6">
            <button className="px-6 py-2 bg-blue-500 text-white rounded-lg" onClick={handleNextPage}>Next</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProofPage;
