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
import { SupportIcon } from '@heroicons/react/outline';
import './globals.css';


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



  // useEffect(() => {
  //   const fetchUsername = async () => {
  //     const fetchedUsername = "GraceScans";
  //     setUsername(fetchedUsername);
  //   };
  //   fetchUsername();
  //   elementsToHideList()
  // }, [currentPath]);


  useEffect(()=>{
    if(dbName){
      elementsToHideList();
    }
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
        case '/Employee':
          setSelected('Employee');
          break; 
        case '/ConsultantManager':
          setSelected('ConsultantManager');
          break;
        case '/Payment-Milestone':
          setSelected('paymentMilestone');
          break;  
        case '/LeadManager':
          setSelected("LeadManager");
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
        router.push('/adDetails');
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
      case 8:
        router.push('/Employee');
        break; 
      case 9:
        router.push('/ConsultantManager');
        break;
      case 10:
        router.push('/Payment-Milestone');
        break; 
      case 11:
        router.push('/LeadManager');
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

  const UserManagerIcon = () => (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24" 
      strokeWidth={1.5} 
      stroke="currentColor" 
      className="h-5 w-5">
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Zm6-10.125a1.875 1.875 0 1 1-3.75 0 1.875 1.875 0 0 1 3.75 0Zm1.294 6.336a6.721 6.721 0 0 1-3.17.789 6.721 6.721 0 0 1-3.168-.789 3.376 3.376 0 0 1 6.338 0Z" />
</svg>


  );

  const LeadManagerIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="h-5 w-5"
    >
      {/* Icon base */}
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.5 19.5h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15A2.25 2.25 0 0 0 2.25 6.75v10.5A2.25 2.25 0 0 0 4.5 19.5Z"
      />
      {/* Lead avatar */}
      <circle cx="8" cy="9" r="2.25" strokeLinecap="round" strokeLinejoin="round" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10.75 15.25a4.5 4.5 0 0 0-5.5 0"
      />
      {/* Checklist */}
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 8.25h4.5M15 12h4.5M15 15.75h4.5"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13.5 8.25l-1.5 1.5-0.75-0.75"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13.5 15.75l-1.5 1.5-0.75-0.75"
      />
    </svg>
  );

  
  const ConsultantManagerIcon = () => (
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
      d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" 
      />
    </svg>

  );
  const PaymentMilestoneIcon = () => (
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
      d="M3 8.25h18M3 8.25c0-1.242.92-2.25 2.05-2.25h13.9c1.13 0 2.05 1.008 2.05 2.25M3 8.25v7.5c0 1.242.92 2.25 2.05 2.25h13.9c1.13 0 2.05-1.008 2.05-2.25v-7.5M3 15.75h18M9 12h6m-3-3v6"
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
          showMoreOptions ? 'translate-y-3' : 'translate-y-[600px]'
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
          {appRights.includes('Administrator') || appRights.includes('Admin') || appRights.includes('Leadership') ?
          <SubNavItem
            icon={<UserManagerIcon className="h-5 w-5 text-gray-600" />}
            label="User Manager"
            onClick={() => { setSelected('report'); setShowMoreOptions(false); {handleChange(null, 8)}; }}
            additionalClasses="hover:bg-blue-50"
            dataTag=""
          />
          : null}
           <SubNavItem
            icon={<ConsultantManagerIcon className="h-5 w-5 text-gray-600" />}
            label="Consultant Manager"
            onClick={() => { setSelected('consultantManager'); setShowMoreOptions(false); handleChange(null, 9); }} // Ensure the value corresponds to the correct route
            additionalClasses="hover:bg-blue-50"
            dataTag=""
          />
          {/* <SubNavItem
          icon={<PaymentMilestoneIcon className="h-5 w-5 text-gray-600" />} // Replace with the actual Payment Milestone icon
          label="Payment Milestone"
          onClick={() => { setSelected('paymentMilestone'); setShowMoreOptions(false); handleChange(null, 10); }} // Ensure the value corresponds to the correct route
          additionalClasses="hover:bg-blue-50"
          dataTag=""
          /> */}
          <SubNavItem
            icon={<LeadManagerIcon className="text-gray-600" />}
            label="Lead Manager"
            onClick={() => { setSelected('LeadManager'); setShowMoreOptions(false); {handleChange(null, 11)}; }}
            additionalClasses="hover:bg-blue-50"
            dataTag="LeadManager"
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