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
  ChevronUpIcon,
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
  const [activeIndex, setActiveIndex] = useState(1);

  const elementsToHideList = () => {
    try{
      fetch(`https://orders.baleenmedia.com/API/Media/FetchNotVisibleElementName.php/get?JsonDBName=${companyName}`)
        .then((response) => response.json())
        .then((data) => setElementsToHide(data));
    } catch(error){
      console.error("Error showing element names: " + error)
    }
  }

  // useEffect(() => {
  //   //searching elements to Hide from database

  //   elementsToHide.forEach((name) => {
  //     const elements = document.getElementsByName(name);
  //     console.log(elements)
  //     elements.forEach((element) => {
  //       element.style.display = 'none'; // Hide the element
  //     });
  //   });
  // }, [elementsToHide])

  useEffect(() => {
    elementsToHide.forEach((tagName) => {
      const elements = document.querySelectorAll(`[data-tag="${tagName}"]`);
      console.log(document)
      elements.forEach((element) => {
        element.style.display = 'none'; // Hide the element
      });
    });
  }, [elementsToHide]);



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
          setSelected('rateValidation');
          break;
        case '/':
          setValue(1);
          setActiveIndex(0);
          setSelected('Client');
          break;
        case '/adDetails':
          setValue(2);
          setActiveIndex(1);
          setSelected('Quote');
          break;
        case '/RatesEntry':
          setValue(4);
          setSelected('ratesEntry');
          break;
        case '/Create-Order':
          setValue(3);
          setActiveIndex(2);
          setSelected('Order');
          break;
        case '/FinanceEntry':
          setValue(5);
          setActiveIndex(3);
          setSelected('Finance');
          break;
        case '/Report':
          // setValue(5);
          // setActiveIndex(3);
          setSelected('report');
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


  const UserAddIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="h-6 w-6"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z"
      />
    </svg>
  );

  const LogoutIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="red"
      className="h-5 w-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15"
      />
    </svg>
  );

  const RateValidationIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="h-5 w-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
      />
    </svg>
  );
  
  const FinanceManagerIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="h-6 w-6"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 8.25H9m6 3H9m3 6-3-3h1.5a3 3 0 1 0 0-6M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
      />
    </svg>
  );
  
  const RatesManagerIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="h-5 w-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 6h.008v.008H6V6Z"
      />
    </svg>
  );
  
  const OrderManagerIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="h-6 w-6"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
      />
    </svg>
  );
  

  const Menus = [
    { name: 'Client', icon: <UserAddIcon/> },
    { name: 'Quote', icon: <DocumentTextIcon className="h-6 w-6" />, tag: 'QuoteSenderNavigation' },
    { name: 'Order', icon: <OrderManagerIcon/> },
    { name: 'Finance', icon: <FinanceManagerIcon/> },
  ];



  useEffect(() => {
    const activeInd = Menus.findIndex(menu => menu.name === selected);
    setActiveIndex(activeInd);
  }, [selected]);
  


  const handleMenuChange = (menu) => {
    setSelected(menu.name);
    let newValue;
    switch (menu.name) {
      case 'Client':
        newValue = 1;
        break;
      case 'Quote':
        newValue = 2;
        break;
      case 'Order':
        newValue = 3;
        break;
      case 'Finance':
        newValue = 5;
        break;
      default:
        newValue = null;
    }
  
    if (newValue !== null) {
      handleChange(null, newValue);
      setShowMoreOptions(false);
    }
  };
  

    // Determine if the circle should be visible
  // const isCircleVisible = [0, 1, 2, 3].includes(activeIndex);

  // useEffect(() => {
  //   const handleResize = () => setWindowWidth(window.innerWidth);
  //   window.addEventListener('resize', handleResize);
  //   return () => window.removeEventListener('resize', handleResize);
  // }, []);

  // // Define translate values based on screen width and active index
  // const getTranslateValue = () => {
  //   if (windowWidth <= 320) {
  //     return activeIndex === 0 ? '-125px' : activeIndex === 1 ? '-62px' : activeIndex === 2 ? '6px' : activeIndex === 3 ? '76px' : '300px';
  //   } else if (windowWidth >= 370 && windowWidth <= 450) {
  //     return activeIndex === 0 ? '-152px' : activeIndex === 1 ? '-70px' : activeIndex === 2 ? '10px' : activeIndex === 3 ? '76px' : '1300px';
  //   } else if (windowWidth >= 460  && windowWidth <= 700) {
  //     return activeIndex === 0 ? '-167px' : activeIndex === 1 ? '-77px' : activeIndex === 2 ? '13px' : activeIndex === 3 ? '100px' : '1300px';
  //   } else {
  //     return activeIndex === 0 ? '-207px' : activeIndex === 1 ? '-104px' : activeIndex === 2 ? '-3px' : activeIndex === 3 ? '102px' : '1300px';
  //   }
  // };

  
  if (currentPath === '/login') {
    return null; // Conditionally return null
  }

  return (
    <div className="relative mt-24">
      {/* Main Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 h-20 z-50 bg-white  shadow-2xl" style={{ boxShadow: '0 -4px 6px rgba(0, 0, 0, 0.1)' }}>
        <div className="flex justify-around  max-w-lg mx-auto relative ">
      
{/* {isCircleVisible && (
            <span
              className="bg-blue-500 duration-500 h-16 w-16 absolute -top-2 rounded-full transform transition-all"
              style={{
                transform: `translateX(${getTranslateValue()})`,
              }}
            ></span>
          )} */}

          {Menus.map((menu, i) => (
            <div key={i} data-tag={menu.tag}>
            <NavItem
              key={i}
              icon={menu.icon}
              label={menu.name}
              // onClick={() => setSelected(menu.name)}
              onClick={() => handleMenuChange(menu)}
              index={i} // Pass the index of the current item
              activeIndex={activeIndex} // Pass the active index
              isSelected={selected === menu.name}
            />
            </div>
          ))}

<div
  className={`relative flex flex-col items-center justify-center transition duration-200 ${
    showMoreOptions ? 'text-blue-500' : 'text-gray-600'
  }`}
  onClick={() => setShowMoreOptions(!showMoreOptions)}
>
  <div className={`p-3 mt-2 rounded-full transition-all duration-300 cursor-pointer hover:bg-blue-100 ${showMoreOptions ? 'bg-blue-100' : 'bg-transparent'}`}>
    <ChevronDownIcon
      className={`h-6 w-6 transform transition-transform duration-300 ${
        showMoreOptions ? 'rotate-180' : 'rotate-0'
      }`}
    />
  </div>
  <span
    className={`mt-[1px] text-xs font-medium transition duration-200 ${
      showMoreOptions ? 'text-blue-500' : 'text-gray-600'
    }`}
  >
    More
  </span>
  {/* Sub Navigation Sidebar */}
  <div
        className={`fixed bottom-[96px] mr-14 sm:mr-0 w-fit pt-2 border-1 bg-white border-blue-300 shadow-lg rounded-xl transition-transform duration-300 ease-in-out ${
          showMoreOptions ? 'translate-y-3' : 'translate-y-96'
        }`}
      >
        <div className="flex flex-col items-start">
          <SubNavItem
            icon={<RatesManagerIcon className="text-gray-600" />}
            label="Rates Manager"
            onClick={() => { setSelected('ratesEntry'); setShowMoreOptions(false); {handleChange(null, 4)}; }}
            additionalClasses="hover:bg-blue-50"
            dataTag=""
          />
          <SubNavItem 
            icon={<RateValidationIcon className="text-gray-600"  />}
            label="Rate Validation"
            onClick={() => { setSelected('rateValidation'); setShowMoreOptions(false); {handleChange(null, 0)}; }}
            additionalClasses="hover:bg-blue-50"
            dataTag="RatesValidationNavigation"
          />
          <SubNavItem
            icon={<ChartPieIcon className="h-5 w-5 text-gray-600" />}
            label="Reports"
            onClick={() => { setSelected('report'); setShowMoreOptions(false); {handleChange(null, 6)}; }}
            additionalClasses="hover:bg-blue-50"
            dataTag=""
          />
          <SubNavItem
            icon={<LogoutIcon className="text-gray-600" />}
            label={<span className="text-red-600">Log Out</span>}
            onClick={() => { setSelected('logout'); setShowMoreOptions(false); {handleChange(null, 7)}; }}
            additionalClasses="hover:bg-red-100"
            dataTag=""
          />
        </div>
      </div>
</div>

        </div>
      </div>

      {/* Sub Navigation Sidebar old */}
      
    </div>
  );
}


function NavItem({ icon, label, onClick, index, activeIndex, isSelected }) {
  return (
    <div
      className={`flex flex-col items-center justify-center relative transition duration-200 ${
        isSelected ? 'text-white' : 'text-gray-600'
      }`}
      onClick={onClick}
    >
      <div
        className={`p-3 rounded-full transition-all duration-100 cursor-pointer ${
          index === activeIndex ? '-translate-y-0 duration-700 opacity-100' : 'opacity-100 translate-y-2'
        } ${
          isSelected ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 hover:bg-blue-200'
        }`}
      >
        {icon}
      </div>
      <span
        className={`text-xs text-center font-medium transition duration-200 mx-1
          ${
          index === activeIndex ? 'translate-y-1 duration-700 opacity-100' : 'opacity-100 translate-y-2'
        }
          ${
          isSelected ? 'text-blue-500' : 'text-gray-600'
        }`}
      >
        {label}
      </span>
    </div>
  );
}


function SubNavItem({ icon, label, onClick, additionalClasses, dataTag }) {
  return (
    <div
      className={`flex items-center py-3 px-4 cursor-pointer text-gray-700 transition duration-200 w-full ${additionalClasses}`}
      onClick={onClick}
      data-tag={dataTag}
    >
      <div className="mr-3">{icon}</div>
      {label}
    </div>
  );
}

//   return (
//     <div className="relative">
//       {/* Main Navigation Bar */}
//       <div className="fixed bottom-0 left-0 right-0 z-50 bg-white shadow-lg">
//         <div className="flex justify-around py-3 max-w-lg mx-auto relative">
      
// {isCircleVisible && (
//             <span
//               className="bg-blue-500 duration-500 h-16 w-16 absolute -top-2 rounded-full transform transition-all"
//               style={{
//                 transform: `translateX(${getTranslateValue()})`,
//               }}
//             ></span>
//           )}

//           {Menus.map((menu, i) => (
//             <div key={i} data-tag={menu.tag}>
//             <NavItem
//               key={i}
//               icon={menu.icon}
//               label={menu.name}
//               // onClick={() => setSelected(menu.name)}
//               onClick={() => handleMenuChange(menu)}
//               index={i} // Pass the index of the current item
//               activeIndex={activeIndex} // Pass the active index
//               isSelected={selected === menu.name}
//             />
//             </div>
//           ))}

// <div
//   className={`relative flex flex-col items-center justify-center transition duration-200 ${
//     showMoreOptions ? 'text-blue-500' : 'text-gray-600'
//   }`}
//   onClick={() => setShowMoreOptions(!showMoreOptions)}
// >
//   <div className={`p-3 rounded-full transition-all duration-300 ${showMoreOptions ? 'bg-blue-100' : 'bg-transparent'}`}>
//     <ChevronDownIcon
//       className={`h-6 w-6 transform transition-transform duration-300 ${
//         showMoreOptions ? 'rotate-180' : 'rotate-0'
//       }`}
//     />
//   </div>
//   <span
//     className={`mt-1 text-xs transition duration-200 ${
//       showMoreOptions ? 'text-blue-500' : 'text-gray-600'
//     }`}
//   >
//     More
//   </span>
// </div>

//         </div>
//       </div>

//       {/* Sub Navigation Sidebar */}
//       <div
//         className={`fixed bottom-[92px] w-fit right-2 lg:right-[480px] border-1 bg-white border-blue-300 shadow-lg rounded-xl transition-transform duration-300 ease-in-out ${
//           showMoreOptions ? 'translate-y-0' : 'translate-y-full'
//         }`}
//       >
//         <div className="flex flex-col items-start space-y-2">
//           <SubNavItem
//             icon={<RatesManagerIcon className="text-gray-600" />}
//             label="Rates Manager"
//             onClick={() => { setSelected('ratesEntry'); setShowMoreOptions(false); {handleChange(null, 4)}; }}
//           />
//           <SubNavItem
//             icon={<RateValidationIcon className="text-gray-600" />}
//             label="Rate Validation"
//             onClick={() => { setSelected('rateValidation'); setShowMoreOptions(false); {handleChange(null, 0)}; }}
//           />
//           <SubNavItem
//             icon={<ChartPieIcon className="h-5 w-5 text-gray-600" />}
//             label="Reports"
//             onClick={() => { setSelected('report'); setShowMoreOptions(false); {handleChange(null, 6)}; }}
//           />
//           <SubNavItem
//             icon={<LogoutIcon className="text-gray-600" />}
//             label="Log Out"
//             onClick={() => { setSelected('logout'); setShowMoreOptions(false); {handleChange(null, 7)}; }}
//           />
//         </div>
//       </div>
//     </div>
//   );
// }

// function getTranslateXValue(activeIndex) {
//   switch (activeIndex) {
//     case 0:
//       return '-193px'; // Adjust as necessary
//     case 1:
//       return '-100px'; // Adjust as necessary
//     case 2:
//       return '0px'; // Adjust as necessary
//     case 3:
//       return '50px'; // Adjust as necessary
//     default:
//       return '300px'; // Adjust as necessary
//   }
// }

// function NavItem({ icon, label, onClick, index, activeIndex, isSelected }) {
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
//         className={`mt-1 text-xs text-center transition duration-200 mx-1  ${
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

