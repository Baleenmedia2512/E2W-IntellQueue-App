// 'use client'
// import { useState, useEffect } from 'react';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
// import axios from 'axios';
// import Cookies from 'js-cookie';
// import { useRouter } from 'next/navigation';
// import AdDetails from './page';

// const VendorPage = ({details}) => {
//   const [selectedVendor, setSelectedVendor] = useState();
//   const [datas, setDatas] = useState([]);
//   const [page, setPage] = useState(false);
//   const routers = useRouter();

//   useEffect(() => {
//     const username = Cookies.get('username');
//     //console.log(data);
//     if (!username) {
//       routers.push('/login');
//     } else {
//       fetch('https://www.orders.baleenmedia.com/API/Media/FetchRates.php')
//         .then((response) => response.json())
//         .then((data) => setDatas(data))
//         .catch((error) => console.error(error));
//     }
//   }, [routers]);

//   const filteredData = datas
//   .filter(item => item.adCategory === details.adCategory && item.adType === details.adType)
//   .filter((value, index, self) => 
//     self.findIndex(obj => obj.VendorName === value.VendorName) === index
//   )
//   .sort((a, b) => a.VendorName.localeCompare(b.VendorName))
//   ;

//   return (
//       <div>
//       <div className="flex flex-row justify-between mx-[8%] mt-8">
//         <> <h1 className='text-2xl font-bold text-center  mb-4'>Select Vendor</h1>
//           <button
//             className="text-black px-2 py-1 rounded text-center hover:scale-110"
//             onClick={() => {
//               routers.push('../addenquiry');
              
//             }}
//           >
//             <svg
//               xmlns="http://www.w3.org/2000/svg"
//               fill="none"
//               viewBox="0 0 24 24"
//               stroke="currentColor"
//               className="h-6 w-6"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth="2"
//                 d="M6 18L18 6M6 6l12 12"
//               />
//             </svg>
//           </button></>
//       </div>
//       <h1 className='mx-[8%] mb-14 font-semibold'>Select any one</h1>

//       <button className='mx-[8%] mb-6  hover:scale-110 hover:text-orange-900' onClick={() => Cookies.set('vendo', false)
//         }> <FontAwesomeIcon icon={faArrowLeft} /> </button>

//       <h1 className='mx-[8%] mb-2 font-semibold'>Ad Medium : {details.rateName}</h1>
//       <h1 className='mx-[8%] mb-2 font-semibold'>Ad Type : {details.adType}</h1>
//       <h1 className='mx-[8%] mb-8 font-semibold'>Ad Category : {details.adCategory}</h1>
//       <ul className="flex flex-wrap items-center justify-center mx-[8%]">
//         {filteredData.map((option) => (
//           <label
//             key={option.VendorName}
//             className='relative flex flex-col items-center justify-center w-full h-16 border mb-4 cursor-pointer transition duration-300 rounded-lg border-gray-300 bg-sky-400 hover:text-white hover:bg-violet-800'
//             onClick={() => {
//               setSelectedVendor(option);
//               //Cookies.set('adMediumSelected', true);
//               // Cookies.set('ratename', option.rateName);
//               // Cookies.set('adtype', option.adType);
//               // Cookies.set('adcategory', option.adCategory);
//               // Cookies.set('vendorname', option.VendorName);
//               // Cookies.set('rateperunit', option.ratePerUnit)
//               // Cookies.set('minimumunit', option.minimumUnit);
//               // Cookies.set('defunit', option.Units);
//               window.location.reload() 
//               //minimumUnit
//             //  setPage(true);
//             }}
//           >
//             <div className="text-lg font-bold flex items-center justify-center">{option.VendorName}</div>
//           </label>
//         ))}
//       </ul>
//       </div>
//   )
// };

// export default VendorPage;