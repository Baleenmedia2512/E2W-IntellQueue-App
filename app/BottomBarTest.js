'use client';
import { UserIcon, DocumentTextIcon, CurrencyDollarIcon, ClipboardDocumentCheckIcon, Cog6ToothIcon, ChevronDownIcon, WrenchIcon, Bars3Icon, ChartPieIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';


const BottomBarTest = () => {
  const Menus = []
}

export default BottomBarTest;
// export default function BottomBarTest() {
//   const [selected, setSelected] = useState('clientRegistration');
//   const [showMoreOptions, setShowMoreOptions] = useState(false);

//   return (
//     <div className="relative">
//       {/* Main Navigation Bar */}
//       <div className="fixed bottom-0 left-0 right-0 z-50 bg-white shadow-lg">
//         <div className="flex justify-around py-3 max-w-lg mx-auto">
//           <NavItem
//             icon={<UserIcon className="h-6 w-6" />}
//             label="Client Registration"
//             isSelected={selected === 'clientRegistration'}
//             onClick={() => setSelected('clientRegistration')}
//           />
//           <NavItem
//             icon={<DocumentTextIcon className="h-6 w-6" />}
//             label="Quote Sender"
//             isSelected={selected === 'quoteSender'}
//             onClick={() => setSelected('quoteSender')}
//           />
//           <NavItem
//             icon={<ClipboardDocumentCheckIcon className="h-6 w-6" />}
//             label="Order Generation"
//             isSelected={selected === 'orderGeneration'}
//             onClick={() => setSelected('orderGeneration')}
//           />
//           <NavItem
//             icon={<CurrencyDollarIcon className="h-6 w-6" />}
//             label="Finance Entry"
//             isSelected={selected === 'financeEntry'}
//             onClick={() => setSelected('financeEntry')}
//           />
          
//           <div
//             className={`relative flex flex-col items-center justify-center transition duration-200 ${
//               showMoreOptions ? 'text-blue-500' : 'text-gray-600'
//             }`}
//             onClick={() => setShowMoreOptions(!showMoreOptions)}
//           >
//             <div className={`p-3 rounded-full transition-all duration-300 ${showMoreOptions ? 'bg-blue-100' : 'bg-transparent'}`}>
//               <ChevronDownIcon className="h-6 w-6" />
//             </div>
//             <span
//               className={`mt-1 text-xs transition duration-200 ${
//                 showMoreOptions ? 'text-blue-500' : 'text-gray-600'
//               }`}
//             >
//               More
//             </span>
//           </div>
//         </div>
//       </div>

//       {/* Sub Navigation Sidebar */}
//       <div
//         className={`fixed bottom-0 left-0 right-0 bg-white shadow-lg rounded-tl-lg rounded-tr-lg transition-transform duration-300 ease-in-out ${
//           showMoreOptions ? 'translate-y-0' : 'translate-y-full'
//         }`}
//       >
//         <div className="flex flex-col items-start py-4 px-2 space-y-2">
//           <SubNavItem
//             icon={<Cog6ToothIcon className="h-5 w-5 text-gray-600" />}
//             label="Rates Entry"
//             onClick={() => { setSelected('ratesEntry'); setShowMoreOptions(false); }}
//           />
//           <SubNavItem
//             icon={<WrenchIcon className="h-5 w-5 text-gray-600" />}
//             label="Rate Validation"
//             onClick={() => { setSelected('rateValidation'); setShowMoreOptions(false); }}
//           />
//           <SubNavItem
//             icon={<ChartPieIcon className="h-5 w-5 text-gray-600" />}
//             label="Report"
//             onClick={() => { setSelected('report'); setShowMoreOptions(false); }}
//           />
//           <SubNavItem
//             icon={<ArrowRightOnRectangleIcon className="h-5 w-5 text-gray-600" />}
//             label="Log Out"
//             onClick={() => { console.log('Log Out'); setShowMoreOptions(false); }}
//           />
//         </div>
//       </div>
//     </div>
//   );
// }

// function NavItem({ icon, label, isSelected, onClick }) {
//   return (
//     <div
//       className={`flex flex-col items-center justify-center relative transition duration-200 ${
//         isSelected ? 'text-blue-500' : 'text-gray-600'
//       }`}
//       onClick={onClick}
//     >
//       <div className={`p-3 rounded-full transition-all duration-300 ${isSelected ? 'bg-blue-100' : 'bg-transparent'}`}>
//         {icon}
//       </div>
//       <span
//         className={`mt-1 text-xs transition duration-200 ${
//           isSelected ? 'text-blue-500' : 'text-gray-600'
//         }`}
//       >
//         {label}
//       </span>
//     </div>
//   );
// }

// function SubNavItem({ icon, label, onClick }) {
//   return (
//     <div
//       className="flex items-center py-2 px-4 hover:bg-gray-100 cursor-pointer text-gray-700 transition duration-200 w-full"
//       onClick={onClick}
//     >
//       <div className="mr-3">{icon}</div>
//       {label}
//     </div>
//   );
// }
