'use client';
import {
  UserIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  ClipboardDocumentCheckIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import { useState } from 'react';

const BottomBarTest = () => {
  const Menus = [
    { name: 'Client Registration', icon: UserIcon },
    { name: 'Quote Sender', icon: DocumentTextIcon },
    { name: 'Order Generation', icon: ClipboardDocumentCheckIcon },
    { name: 'Finance Entry', icon: CurrencyDollarIcon },
    { name: 'Rates Entry', icon: Cog6ToothIcon },
  ];

  const [active, setActive] = useState(0);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center">
      <div className="bg-white max-w-md w-full h-[4.4rem] px-4 rounded-t-xl shadow-lg">
        <ul className="flex justify-around relative">
          <span
            className={`bg-rose-600 duration-500 border-4 border-white h-16 w-16 absolute -top-5 rounded-full transform`}
            style={{ transform: `translateX(${active * 60}%)` }}
          >
            <span className="w-3.5 h-3.5 bg-transparent absolute top-4 -left-[18px] rounded-tr-[11px] shadow-myShadow1"></span>
            <span className="w-3.5 h-3.5 bg-transparent absolute top-4 -right-[18px] rounded-tl-[11px] shadow-myShadow2"></span>
          </span>
          {Menus.map((menu, i) => (
            <li key={i} className="w-16">
              <a
                className="flex flex-col items-center pt-6 cursor-pointer"
                onClick={() => setActive(i)}
              >
                <span
                  className={`text-xl duration-500 ${
                    i === active && '-mt-6 text-rose-600'
                  }`}
                >
                  <menu.icon className="h-6 w-6" />
                </span>
                <span
                  className={`text-xs ${
                    active === i
                      ? 'translate-y-4 duration-700 opacity-100'
                      : 'opacity-0 translate-y-10'
                  }`}
                >
                  {menu.name}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

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
