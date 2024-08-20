// pages/Employee/general-details.jsx
'use client';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { setGeneralDetails, setCurrentPage } from '@/redux/features/emp-slice'; // Import your actions
import TabNavigation from './components/TabNavigation';

const GeneralDetailsPage = () => {
  const dispatch = useDispatch();
  const generalDetails = useSelector((state) => state.employeeSlice.generalDetails); // Make sure to access the correct state slice

  useEffect(() => {
    // Fetch initial data or perform any setup here
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    dispatch(setGeneralDetails({ [name]: value }));
  };

  const handleNextPage = (e) => {
    e.preventDefault();
    dispatch(setCurrentPage('proof'));
  };

  return (
<div className="flex flex-col items-center min-h-screen bg-gray-100 p-4">
  {/* Centered TabNavigation at the top */}
  <div className="w-full max-w-6xl mb-4">
    <TabNavigation />
  </div>

  {/* Main Content */}
  <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-6xl">
    <h2 className="text-2xl font-bold text-blue-500 mb-1">General Details</h2>
    <p className="text-gray-400 text-sm mb-3">Please fill in the following details</p>
    <div className="border-2 w-10 inline-block mb-6 border-blue-500"></div>

    <form className="space-y-6" onSubmit={handleNextPage}>
      <div className="flex flex-wrap -mx-4 mb-4">
        {/* Name */}
        <div className="w-full md:w-1/3 px-4 mb-4 md:mb-0">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
            placeholder="Enter your name"
            value={generalDetails.name}
            onChange={handleInputChange}
          />
        </div>

        {/* Date of Birth */}
        <div className="w-full md:w-1/3 px-4 mb-4 md:mb-0">
          <label htmlFor="dob" className="block text-sm font-medium text-gray-700">Date of Birth</label>
          <input
            type="date"
            id="dob"
            name="dob"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
            value={generalDetails.dob}
            onChange={handleInputChange}
          />
        </div>

        {/* Father's Name */}
        <div className="w-full md:w-1/3 px-4 mb-4 md:mb-0">
          <label htmlFor="fatherName" className="block text-sm font-medium text-gray-700">Father's Name</label>
          <input
            type="text"
            id="fatherName"
            name="fatherName"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
            placeholder="Enter your father's name"
            value={generalDetails.fatherName}
            onChange={handleInputChange}
          />
        </div>
      </div>

      <div className="flex flex-wrap -mx-4 mb-4">
        {/* Father's Occupation */}
        <div className="w-full md:w-1/3 px-4 mb-4 md:mb-0">
          <label htmlFor="fatherOccupation" className="block text-sm font-medium text-gray-700">Father's Occupation</label>
          <input
            type="text"
            id="fatherOccupation"
            name="fatherOccupation"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
            placeholder="Enter your father's occupation"
            value={generalDetails.fatherOccupation}
            onChange={handleInputChange}
          />
        </div>

        {/* Religion */}
        <div className="w-full md:w-1/3 px-4 mb-4 md:mb-0">
          <label htmlFor="religion" className="block text-sm font-medium text-gray-700">Religion</label>
          <input
            type="text"
            id="religion"
            name="religion"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
            placeholder="Enter your religion"
            value={generalDetails.religion}
            onChange={handleInputChange}
          />
        </div>

        {/* Caste */}
        <div className="w-full md:w-1/3 px-4 mb-4 md:mb-0">
          <label htmlFor="caste" className="block text-sm font-medium text-gray-700">Caste</label>
          <input
            type="text"
            id="caste"
            name="caste"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
            placeholder="Enter your caste"
            value={generalDetails.caste}
            onChange={handleInputChange}
          />
        </div>
      </div>

      <div className="flex flex-wrap -mx-4 mb-4">
        {/* Nationality */}
        <div className="w-full md:w-1/3 px-4 mb-4 md:mb-0">
          <label htmlFor="nationality" className="block text-sm font-medium text-gray-700">Nationality</label>
          <input
            type="text"
            id="nationality"
            name="nationality"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
            placeholder="Enter your nationality"
            value={generalDetails.nationality}
            onChange={handleInputChange}
          />
        </div>

        {/* Education */}
        <div className="w-full md:w-1/3 px-4 mb-4 md:mb-0">
          <label htmlFor="education" className="block text-sm font-medium text-gray-700">Education</label>
          <input
            type="text"
            id="education"
            name="education"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
            placeholder="Enter your education details"
            value={generalDetails.education}
            onChange={handleInputChange}
          />
        </div>

        {/* Phone */}
        <div className="w-full md:w-1/3 px-4 mb-4 md:mb-0">
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
            placeholder="Enter your phone number"
            value={generalDetails.phone}
            onChange={handleInputChange}
          />
        </div>
      </div>

      <div className="flex flex-wrap -mx-4 mb-4">
        {/* Email */}
        <div className="w-full md:w-1/3 px-4 mb-4 md:mb-0">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
            placeholder="Enter your email"
            value={generalDetails.email}
            onChange={handleInputChange}
          />
        </div>

        {/* Address */}
        <div className="w-full md:w-2/3 px-4">
          <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
          <textarea
            id="address"
            name="address"
            rows="3"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
            placeholder="Enter your address"
            value={generalDetails.address}
            onChange={handleInputChange}
          ></textarea>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end px-4">
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
        >
          Next
        </button>
      </div>
    </form>
  </div>
</div>


  );
}

export default GeneralDetailsPage;
