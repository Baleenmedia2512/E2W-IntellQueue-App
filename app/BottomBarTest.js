'use client';
import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useAppSelector } from '@/redux/store';
import {
  UserIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  ClipboardDocumentCheckIcon,
  ChevronDownIcon,
  Cog6ToothIcon,
  WrenchIcon,
  ChartPieIcon,
} from '@heroicons/react/24/outline';
import './globals.css';

export default function BottomBarTest() {
  const [selected, setSelected] = useState('Client Manager');
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const router = useRouter();
  const currentPath = usePathname();
  const companyName = useAppSelector(state => state.authSlice.companyName);
  const [value, setValue] = useState(0); // Define the value state variable
  const [elementsToHide, setElementsToHide] = useState([])
  const [username, setUsername] = useState(""); // State variable for username
  

  const elementsToHideList = () => {
    try{
      fetch(`https://orders.baleenmedia.com/API/Media/FetchNotVisibleElementName.php/get?JsonDBName=${companyName}`)
        .then((response) => response.json())
        .then((data) => setElementsToHide(data));
    } catch(error){
      console.error("Error showing element names: " + error)
    }
  }

  useEffect(() => {
    //searching elements to Hide from database

    elementsToHide.forEach((name) => {
      const elements = document.getElementsByName(name);
      elements.forEach((element) => {
        element.style.display = 'none'; // Hide the element
      });
    });
  }, [elementsToHide])

  useEffect(() => {
    const fetchUsername = async () => {
      const fetchedUsername = "GraceScans";
      setUsername(fetchedUsername);
    };
    fetchUsername();
    elementsToHideList()
  }, []);

  useEffect(()=>{
      switch (currentPath) {
        case '/rate-validation':
          setValue(0);
          break;
        case '/':
          setValue(1);
          break;
        case '/adDetails':
          setValue(2);
          break;
        case '/RatesEntry':
          setValue(3);
          break;
        default:
          break;
      }
    // Set the value state variable based on the current path
    
  }, [currentPath]); // Update useEffect dependency

  const handleChange = (event, newValue) => {
    setValue(newValue); // Update the value state variable
    switch (newValue) {
      case 0:
        router.push('/rate-validation');
        break;
      case 1:
        router.push('/');
        break;
      case 2:
        router.push('adDetails');
        break;
      case 3:
        router.push('/Create-Order');
        break;
      case 4:
        router.push('/RatesEntry');
        break;
      case 5:
        router.push('/FinanceEntry');
        break;
        case 6:
        router.push('/Report');
        break;  
      case 7:
        router.push('/login');
        break; 
        
      default:
        break;
    }
  };

  if (currentPath === '/login') {
    return null; // Conditionally return null
  }

  const Menus = [
    { name: 'Client Manager', icon: <UserIcon className="h-6 w-6" /> },
    { name: 'Quote Manager', icon: <DocumentTextIcon className="h-6 w-6" /> },
    { name: 'Order Manager', icon: <ClipboardDocumentCheckIcon className="h-6 w-6" /> },
    { name: 'Finance Manager', icon: <CurrencyDollarIcon className="h-6 w-6" /> },
  ];

  const activeIndex = Menus.findIndex(menu => menu.name === selected);

    // Determine if the circle should be visible
  const isCircleVisible = [0, 1, 2, 3].includes(activeIndex);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Define translate values based on screen width and active index
  const getTranslateValue = () => {
    if (windowWidth <= 320) {
      return activeIndex === 0 ? '-125px' : activeIndex === 1 ? '-62px' : activeIndex === 2 ? '6px' : activeIndex === 3 ? '76px' : '300px';
    } else if (windowWidth <= 400) {
      return activeIndex === 0 ? '-148px' : activeIndex === 1 ? '-70px' : activeIndex === 2 ? '10px' : activeIndex === 3 ? '94px' : '1300px';
    } else if (windowWidth <= 500) {
      return activeIndex === 0 ? '-167px' : activeIndex === 1 ? '-77px' : activeIndex === 2 ? '13px' : activeIndex === 3 ? '109px' : '1300px';
    } else {
      return activeIndex === 0 ? '-202px' : activeIndex === 1 ? '-95px' : activeIndex === 2 ? '15px' : activeIndex === 3 ? '128px' : '1300px';
    }
  };

  return (
    <div className="relative">
      {/* Main Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white shadow-lg">
        <div className="flex justify-around py-3 max-w-lg mx-auto relative">
        {/* <span
  className="bg-blue-500 duration-500 h-16 w-16 absolute -top-2 rounded-full transform transition-all nav-item"
  style={{
    '--translate-value-mobile': `${
      activeIndex === 0 ? -148 : activeIndex === 1 ? -70 : activeIndex === 2 ? 10 : activeIndex === 3 ? 94 : 300
    }px`,
    '--translate-value-desktop': `${
      activeIndex === 0
        ? -202
        : activeIndex === 1
        ? -95
        : activeIndex === 2
        ? 15
        : activeIndex === 3
        ? 128
        : 300
    }px`,
  }}
></span> */}
{isCircleVisible && (
            <span
              className="bg-blue-500 duration-500 h-16 w-16 absolute -top-2 rounded-full transform transition-all"
              style={{
                transform: `translateX(${getTranslateValue()})`,
              }}
            ></span>
          )}

          {Menus.map((menu, i) => (
            <NavItem
              key={i}
              icon={menu.icon}
              label={menu.name}
              isSelected={selected === menu.name}
              onClick={() => setSelected(menu.name)}
              index={i} // Pass the index of the current item
              activeIndex={activeIndex} // Pass the active index
            />
          ))}

          <div
            className={`relative flex flex-col items-center justify-center transition duration-200 ${
              showMoreOptions ? 'text-blue-500' : 'text-gray-600'
            }`}
            onClick={() => setShowMoreOptions(!showMoreOptions)}
          >
            <div className={`p-3 rounded-full transition-all duration-300 ${showMoreOptions ? 'bg-blue-100' : 'bg-transparent'}`}>
              <ChevronDownIcon className="h-6 w-6" />
            </div>
            <span
              className={`mt-1 text-xs transition duration-200 ${
                showMoreOptions ? 'text-blue-500' : 'text-gray-600'
              }`}
            >
              More
            </span>
          </div>
        </div>
      </div>

      {/* Sub Navigation Sidebar */}
      <div
        className={`fixed bottom-24 w-fit right-2 lg:right-[480px] border-1 bg-white border-blue-300 shadow-lg rounded-tl-lg rounded-tr-lg transition-transform duration-300 ease-in-out ${
          showMoreOptions ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="flex flex-col items-start py-4 px-2 space-y-2">
          <SubNavItem
            icon={<Cog6ToothIcon className="h-5 w-5 text-gray-600" />}
            label="Rates Entry"
            onClick={() => { setSelected('ratesEntry'); setShowMoreOptions(false); {(e) => handleChange(e, 0)}; }}
          />
          <SubNavItem
            icon={<WrenchIcon className="h-5 w-5 text-gray-600" />}
            label="Rate Validation"
            onClick={() => { setSelected('rateValidation'); setShowMoreOptions(false); {(e) => handleChange(e, 0)}; }}
          />
          <SubNavItem
            icon={<ChartPieIcon className="h-5 w-5 text-gray-600" />}
            label="Report"
            onClick={() => { setSelected('report'); setShowMoreOptions(false); {(e) => handleChange(e, 0)}; }}
          />
          <SubNavItem
            icon={<ChartPieIcon className="h-5 w-5 text-gray-600" />}
            label="Log Out"
            onClick={() => { setSelected('logout'); setShowMoreOptions(false); {(e) => handleChange(e, 0)}; }}
          />
        </div>
      </div>
    </div>
  );
}

function getTranslateXValue(activeIndex) {
  switch (activeIndex) {
    case 0:
      return '-193px'; // Adjust as necessary
    case 1:
      return '-100px'; // Adjust as necessary
    case 2:
      return '0px'; // Adjust as necessary
    case 3:
      return '50px'; // Adjust as necessary
    default:
      return '300px'; // Adjust as necessary
  }
}

function NavItem({ icon, label, isSelected, onClick, index, activeIndex }) {
  return (
    <div
      className={`flex flex-col items-center justify-center relative transition duration-200 ${
        isSelected ? 'text-white' : 'text-gray-600'
      }`}
      onClick={onClick}
    >
      <div className={`p-3 rounded-full transition-all duration-300 bg-transparent ${index === activeIndex ? '-translate-y-3 duration-700 opacity-100' : 'opacity-100 translate-y-0'} ${
          isSelected ? 'text-white' : 'text-gray-600'
        } `}>
        {icon}
      </div>
      <span
        className={`mt-1 text-xs text-center transition duration-200 ${
          isSelected ? 'text-blue-500' : 'text-gray-600'
        }`}
      >
        {label}
      </span>
    </div>
  );
}

function SubNavItem({ icon, label, onClick }) {
  return (
    <div
      className="flex items-center py-2 px-4 hover:bg-blue-100 cursor-pointer text-gray-700 transition duration-200 w-full"
      onClick={onClick}
    >
      <div className="mr-3">{icon}</div>
      {label}
    </div>
  );
}


// 'use client';
// import React, { useState } from "react";
// import {
//   UserIcon,
//   DocumentTextIcon,
//   CurrencyDollarIcon,
//   ClipboardDocumentCheckIcon,
//   ChevronDownIcon,
//   Cog6ToothIcon,
//   WrenchIcon,
//   ChartPieIcon,
// } from '@heroicons/react/24/outline';


// export default function BottomBarTest() {
//   const [selected, setSelected] = useState('Client Manager');
//   const [showMoreOptions, setShowMoreOptions] = useState(false);

//   const Menus = [
//     { name: 'Client Manager', icon: <UserIcon className="h-6 w-6" /> },
//     { name: 'Quote Manager', icon: <DocumentTextIcon className="h-6 w-6" /> },
//     { name: 'Order Manager', icon: <ClipboardDocumentCheckIcon className="h-6 w-6" /> },
//     { name: 'Finance Manager', icon: <CurrencyDollarIcon className="h-6 w-6" /> },
//   ];

//   const activeIndex = Menus.findIndex(menu => menu.name === selected);

//   return (
//     <div className="relative">
//       {/* Main Navigation Bar */}
//       <div className="fixed bottom-0 left-0 right-0 z-50 bg-white shadow-lg">
//         <div className="flex justify-around py-3 max-w-lg mx-auto relative">
//         <span
//   className="bg-blue-500 duration-500 h-16 w-16 absolute -top-2 rounded-full transform transition-all nav-item"
//   style={{
//     '--translate-value-mobile': `${
//       activeIndex === 0 ? -148 : activeIndex === 1 ? -70 : activeIndex === 2 ? 10 : activeIndex === 3 ? 94 : 300
//     }px`,
//     '--translate-value-desktop': `${
//       activeIndex === 0
//         ? -202
//         : activeIndex === 1
//         ? -95
//         : activeIndex === 2
//         ? 15
//         : activeIndex === 3
//         ? 128
//         : 300
//     }px`,
//   }}
// ></span>

//           {Menus.map((menu, i) => (
//   <NavItem
//     key={i}
//     icon={menu.icon}
//     label={menu.name}
//     isSelected={selected === menu.name}
//     onClick={() => setSelected(menu.name)}
//     index={i}               // Pass the index of the current item
//     activeIndex={activeIndex} // Pass the active index
//   />
// ))}

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
//         className={`fixed bottom-24 w-fit right-2 lg:right-[480px] border-1 bg-white border-blue-300 shadow-lg rounded-tl-lg rounded-tr-lg transition-transform duration-300 ease-in-out ${
//           showMoreOptions ? 'translate-y-0' : 'translate-y-full'
//         }`}
//       >
//         <div className="flex flex-col items-start py-4 px-1 space-y-2">
//           <SubNavItem
//             icon={<Cog6ToothIcon className="h-5 w-5 text-gray-600 " />}
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
//             icon={<ChartPieIcon className="h-5 w-5 text-gray-600" />}
//             label="Log Out"
//             onClick={() => { console.log('logout'); setShowMoreOptions(false); }}
//           />
//         </div>
//       </div>
//     </div>
//   );
// }

// function NavItem({ icon, label, isSelected, onClick, index, activeIndex }) {
//   return (
//     <div
//       className={`flex flex-col items-center justify-center relative transition duration-200 ${
//         isSelected ? 'text-white' : 'text-gray-600'
//       }`}
//       onClick={onClick}
//     >
//       <div className={`p-3 rounded-full transition-all duration-300 bg-transparent ${index === activeIndex ? '-translate-y-3 duration-700 opacity-100' : 'opacity-100 translate-y-0'} ${
//           isSelected ? 'text-white' : 'text-gray-600'
//         } `}>
//         {icon}
//       </div>
//       <span
//         className={`mt-1 text-xs text-center transition duration-200 ${
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
//       className="flex items-center py-2 px-4 hover:bg-blue-100 cursor-pointer text-gray-700 transition duration-200 w-full"
//       onClick={onClick}
//     >
//       <div className="mr-3">{icon}</div>
//       {label}
//     </div>
//   );
// }



// // 'use client';
// // import React, { useState } from "react";
// // import { UserIcon, DocumentTextIcon, CurrencyDollarIcon, ClipboardDocumentCheckIcon, Cog6ToothIcon, ChevronDownIcon, WrenchIcon, Bars3Icon, ChartPieIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

// // export default function BottomBarTest() {
// //   const [selected, setSelected] = useState('clientRegistration');
// //   const [showMoreOptions, setShowMoreOptions] = useState(false);

// //   return (
// //     <div className="relative">
// //       {/* Main Navigation Bar */}
// //       <div className="fixed bottom-0 left-0 right-0 z-50 bg-white shadow-lg">
// //         <div className="flex justify-around py-3 max-w-lg mx-auto">
// //           <NavItem
// //             icon={<UserIcon className="h-6 w-6" />}
// //             label="Client Registration"
// //             isSelected={selected === 'clientRegistration'}
// //             onClick={() => setSelected('clientRegistration')}
// //           />
// //           <NavItem
// //             icon={<DocumentTextIcon className="h-6 w-6" />}
// //             label="Quote Sender"
// //             isSelected={selected === 'quoteSender'}
// //             onClick={() => setSelected('quoteSender')}
// //           />
// //           <NavItem
// //             icon={<ClipboardDocumentCheckIcon className="h-6 w-6" />}
// //             label="Order Generation"
// //             isSelected={selected === 'orderGeneration'}
// //             onClick={() => setSelected('orderGeneration')}
// //           />
// //           <NavItem
// //             icon={<CurrencyDollarIcon className="h-6 w-6" />}
// //             label="Finance Entry"
// //             isSelected={selected === 'financeEntry'}
// //             onClick={() => setSelected('financeEntry')}
// //           />
          
// //           <div
// //             className={`relative flex flex-col items-center justify-center transition duration-200 ${
// //               showMoreOptions ? 'text-blue-500' : 'text-gray-600'
// //             }`}
// //             onClick={() => setShowMoreOptions(!showMoreOptions)}
// //           >
// //             <div className={`p-3 rounded-full transition-all duration-300 ${showMoreOptions ? 'bg-blue-100' : 'bg-transparent'}`}>
// //               <ChevronDownIcon className="h-6 w-6" />
// //             </div>
// //             <span
// //               className={`mt-1 text-xs transition duration-200 ${
// //                 showMoreOptions ? 'text-blue-500' : 'text-gray-600'
// //               }`}
// //             >
// //               More
// //             </span>
// //           </div>
// //         </div>
// //       </div>

// //       {/* Sub Navigation Sidebar */}
// //       <div
// //         className={`fixed bottom-0 left-0 right-0 bg-white shadow-lg rounded-tl-lg rounded-tr-lg transition-transform duration-300 ease-in-out ${
// //           showMoreOptions ? 'translate-y-0' : 'translate-y-full'
// //         }`}
// //       >
// //         <div className="flex flex-col items-start py-4 px-2 space-y-2">
// //           <SubNavItem
// //             icon={<Cog6ToothIcon className="h-5 w-5 text-gray-600" />}
// //             label="Rates Entry"
// //             onClick={() => { setSelected('ratesEntry'); setShowMoreOptions(false); }}
// //           />
// //           <SubNavItem
// //             icon={<WrenchIcon className="h-5 w-5 text-gray-600" />}
// //             label="Rate Validation"
// //             onClick={() => { setSelected('rateValidation'); setShowMoreOptions(false); }}
// //           />
// //           <SubNavItem
// //             icon={<ChartPieIcon className="h-5 w-5 text-gray-600" />}
// //             label="Report"
// //             onClick={() => { setSelected('report'); setShowMoreOptions(false); }}
// //           />
// //           <SubNavItem
// //             icon={<ArrowRightOnRectangleIcon className="h-5 w-5 text-gray-600" />}
// //             label="Log Out"
// //             onClick={() => { console.log('Log Out'); setShowMoreOptions(false); }}
// //           />
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }

// // function NavItem({ icon, label, isSelected, onClick }) {
// //   return (
// //     <div
// //       className={`flex flex-col items-center justify-center relative transition duration-200 ${
// //         isSelected ? 'text-blue-500' : 'text-gray-600'
// //       }`}
// //       onClick={onClick}
// //     >
// //       <div className={`p-3 rounded-full transition-all duration-300 ${isSelected ? 'bg-blue-100' : 'bg-transparent'}`}>
// //         {icon}
// //       </div>
// //       <span
// //         className={`mt-1 text-xs transition duration-200 ${
// //           isSelected ? 'text-blue-500' : 'text-gray-600'
// //         }`}
// //       >
// //         {label}
// //       </span>
// //     </div>
// //   );
// // }

// // function SubNavItem({ icon, label, onClick }) {
// //   return (
// //     <div
// //       className="flex items-center py-2 px-4 hover:bg-gray-100 cursor-pointer text-gray-700 transition duration-200 w-full"
// //       onClick={onClick}
// //     >
// //       <div className="mr-3">{icon}</div>
// //       {label}
// //     </div>
// //   );
// // }
