'use client';
import React, { useState, useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useAppSelector } from '@/redux/store';
import {
  UserIcon,
  Squares2X2Icon,
  ClipboardDocumentCheckIcon,
  ChevronDownIcon,
  Cog6ToothIcon,
  ChevronUpIcon,
} from '@heroicons/react/24/outline';
import './globals.css';
import { CapacitorNavigation } from './utils/capacitorNavigation';


export default function BottomBarTest() {
    const appRights = useAppSelector(state => state.authSlice.appRights);
  const [selected, setSelected] = useState('Client Manager');
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const router = useRouter();
  const currentPath = usePathname();
  const dbName = useAppSelector(state => state.authSlice.dbName);
  const [value, setValue] = useState(0); // Define the value state variable
  const [elementsToHide, setElementsToHide] = useState([])
  const [username, setUsername] = useState(""); // State variable for username
  const [activeIndex, setActiveIndex] = useState(1);

  const elementsToHideList = () => {
    try{
      fetch(`https://orders.baleenmedia.com/API/Media/FetchNotVisibleElementName.php/get?JsonDBName=${dbName}`)
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
    if(dbName){
    elementsToHide.forEach((tagName) => {
      const elements = document.querySelectorAll(`[data-tag="${tagName}"]`);
      elements.forEach((element) => {
        element.style.display = 'none'; // Hide the element
      });
    });
  }
  }, [elementsToHide]);


  useEffect(()=>{
    if(dbName){
      elementsToHideList();
    }
      switch (currentPath) {
        case '/':
          setValue(0);
          setActiveIndex(0);
          setSelected('Client');
          break;
        case '/Create-Order':
          setValue(1);
          setActiveIndex(1);
          setSelected('Order');
          break;
        case '/QueueDashboard':
          setValue(2);
          setActiveIndex(2);
          setSelected('Queue');
          break;
        case '/QueueSystem':
        case '/QueueSystem/LanguageSelection':
        case '/QueueSystem/EnterDetails':
        case '/QueueSystem/WaitingScreen':
        case '/QueueSystem/ReadyScreen':
        case '/QueueSystem/ThankYouScreen':
          setValue(2);
          setActiveIndex(2);
          setSelected('Queue');
          break;
        default:
          break;
      }
  }, [currentPath, dbName, elementsToHideList]); 

  const handleChange = (event, newValue) => {
    setValue(newValue); // Update the value state variable
    switch (newValue) {
      case 0:
        CapacitorNavigation.navigate(router, '/');
        break;
      case 1:
        CapacitorNavigation.navigate(router, '/Create-Order');
        break;
      case 2:
        CapacitorNavigation.navigate(router, '/QueueDashboard');
        break;
      case 3:
        CapacitorNavigation.navigate(router, '/login');
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
  
  const QueueDashboardIcon = () => (
    <Squares2X2Icon className="h-5 w-5" />
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
  

  const Menus = useMemo(() => [
    { name: 'Client', icon: <UserAddIcon/> },
    { name: 'Order', icon: <OrderManagerIcon/> },
    { name: 'Queue', icon: <QueueDashboardIcon/> },
  ], []);



  useEffect(() => {
    const activeInd = Menus.findIndex(menu => menu.name === selected);
    setActiveIndex(activeInd);
  }, [selected, Menus]);
  

  const handleMenuChange = (menu) => {
    setSelected(menu.name);
    let newValue;
    switch (menu.name) {
      case 'Client':
        newValue = 0;
        break;
      case 'Order':
        newValue = 1;
        break;
      case 'Queue':
        newValue = 2;
        break;
      default:
        newValue = null;
    }
  
    if (newValue !== null) {
      handleChange(null, newValue);
      setShowMoreOptions(false);
    }
  };
  

  // Scroll direction logic for show/hide
  const [showBar, setShowBar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          if (currentScrollY > lastScrollY && currentScrollY > 100) {
            setShowBar(false); // Hide on scroll down
          } else {
            setShowBar(true); // Show on scroll up
          }
          setLastScrollY(currentScrollY);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  if (currentPath === '/login') {
    return null; // Conditionally return null
  }

  return (
    <div className="relative">
      {/* Main Navigation Bar */}
      <div className={`fixed bottom-0 left-0 right-0 h-20 z-50 bg-white shadow-2xl transition-transform duration-300 ease-in-out ${showBar ? 'translate-y-0' : 'translate-y-full'}`} style={{ boxShadow: '0 -4px 6px rgba(0, 0, 0, 0.1)', pointerEvents: showBar ? 'auto' : 'none' }}>
        <div className="flex justify-around  max-w-lg mx-auto relative ">

          {Menus.map((menu, i) => (
            <div key={i} data-tag={menu.tag}>
            <NavItem
              key={i}
              icon={menu.icon}
              label={menu.name}
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
  <div className={`p-3 mt-[10px] rounded-full transition-all duration-300 cursor-pointer hover:bg-blue-100 ${showMoreOptions ? 'bg-blue-100' : 'bg-transparent'}`}>
    <ChevronDownIcon
      className={`h-5 w-5 transform transition-transform duration-300 ${
        showMoreOptions ? 'rotate-180' : 'rotate-0'
      }`}
    />
  </div>
  <span
    className={`mt-[3px] text-xs font-medium transition duration-200 ease-in-out ${
      showMoreOptions ? 'text-blue-500' : 'text-gray-600'
    }`}
  >
    {showMoreOptions ? 'Less' : 'More'}
  </span>
  {/* Sub Navigation Sidebar */}
  <div
        className={`fixed bottom-[96px] mr-14 sm:mr-0 w-fit pt-2 border-1 bg-white border-blue-300 shadow-lg rounded-xl transition-transform duration-300 ease-in-out ${
          showMoreOptions ? 'translate-y-3' : 'translate-y-[750px]'
        }`}
      >
        <div className="flex flex-col items-start">
          <SubNavItem
            icon={<Cog6ToothIcon className="h-5 w-5 text-gray-600" />}
            label="Settings"
            onClick={() => { 
              setShowMoreOptions(false); 
              // Add settings functionality here if needed
            }}
            additionalClasses="hover:bg-blue-50"
            dataTag=""
          />
          <SubNavItem
            icon={<LogoutIcon className="text-gray-600" />}
            label={<span className="text-red-600">Log Out</span>}
            onClick={() => { setSelected('logout'); setShowMoreOptions(false); {handleChange(null, 3)}; }}
            additionalClasses="hover:bg-red-100"
            dataTag=""
          />
        </div>
      </div>
</div>

        </div>
      </div>
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
          index === activeIndex ? 'translate-y-2 duration-700 opacity-100' : 'opacity-100 translate-y-2'
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