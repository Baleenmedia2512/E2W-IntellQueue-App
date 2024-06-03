'use client';
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useAppSelector } from '@/redux/store';

const BottomBar = () => {
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
        router.push('/RatesEntry');
        break;
        case 4:
          router.push('/FinanceEntry');
          break; 

        case 5:
          router.push('/login');
          break; 
        
      default:
        break;
    }
  };

  if (currentPath === '/login') {
    return null; // Conditionally return null
  }
 
  return (
    <div className="fixed z-50 w-full h-16 max-w-lg -translate-x-1/2 bg-white border border-gray-200 rounded-full bottom-4 left-1/2 dark:bg-gray-700 dark:border-gray-600">
  <div className="flex justify-evenly h-full max-w-lg mx-auto">
    {/* rate validation button */}
    <button data-tooltip-target="tooltip-home"
    type="button"
    name = "RatesValidationNavigation"
    className="inline-flex flex-col items-center justify-center px-5 rounded-s-full hover:bg-gray-50 dark:hover:bg-gray-800 group"
    onClick={(e) => handleChange(e, 0)}
    >
      <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2c-.791 0-1.55.314-2.11.874l-.893.893a.985.985 0 0 1-.696.288H7.04A2.984 2.984 0 0 0 4.055 7.04v1.262a.986.986 0 0 1-.288.696l-.893.893a2.984 2.984 0 0 0 0 4.22l.893.893a.985.985 0 0 1 .288.696v1.262a2.984 2.984 0 0 0 2.984 2.984h1.262c.261 0 .512.104.696.288l.893.893a2.984 2.984 0 0 0 4.22 0l.893-.893a.985.985 0 0 1 .696-.288h1.262a2.984 2.984 0 0 0 2.984-2.984V15.7c0-.261.104-.512.288-.696l.893-.893a2.984 2.984 0 0 0 0-4.22l-.893-.893a.985.985 0 0 1-.288-.696V7.04a2.984 2.984 0 0 0-2.984-2.984h-1.262a.985.985 0 0 1-.696-.288l-.893-.893A2.984 2.984 0 0 0 12 2Zm3.683 7.73a1 1 0 1 0-1.414-1.413l-4.253 4.253-1.277-1.277a1 1 0 0 0-1.415 1.414l1.985 1.984a1 1 0 0 0 1.414 0l4.96-4.96Z"/>
      </svg>

      <span className="sr-only">Rates Validation</span>
    </button>
    <div id="tooltip-home" name = "RatesValidationNavigation" role="tooltip" className="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-sm opacity-0 tooltip dark:bg-gray-700">
      Rates Validation
      <div className="tooltip-arrow" data-popper-arrow></div>
    </div>
    {/* rate validation button */}
    
{/* Enquiry button */}
    <button data-tooltip-target="tooltip-wallet" name = "EnquiryNavigation" onClick={(e) => handleChange(e, 1)} type="button" className="inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 dark:hover:bg-gray-800 group">
      <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
        <path d="M9 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm-2 9a4 4 0 0 0-4 4v1a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-1a4 4 0 0 0-4-4H7Zm8-1a1 1 0 0 1 1-1h1v-1a1 1 0 1 1 2 0v1h1a1 1 0 1 1 0 2h-1v1a1 1 0 1 1-2 0v-1h-1a1 1 0 0 1-1-1Z" />
      </svg>

      <span className="sr-only">Enquiry</span>
    </button>
    <div id="tooltip-wallet" name = "EnquiryNavigation" role="tooltip" className="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-sm opacity-0 tooltip dark:bg-gray-700">
      Enquiry
      <div className="tooltip-arrow" data-popper-arrow></div>
    </div>
  {/* Enquiry button */}

  {/* Quote Sender button */}
    <button data-tooltip-target="tooltip-settings" name = "QuoteSenderNavigation" onClick={(e) => handleChange(e, 2)}type="button" className="inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 dark:hover:bg-gray-800 group">
    <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
      <path d="M3.559 4.544c.355-.35.834-.544 1.33-.544H19.11c.496 0 .975.194 1.33.544.356.35.559.829.559 1.331v9.25c0 .502-.203.981-.559 1.331-.355.35-.834.544-1.33.544H15.5l-2.7 3.6a1 1 0 0 1-1.6 0L8.5 17H4.889c-.496 0-.975-.194-1.33-.544A1.868 1.868 0 0 1 3 15.125v-9.25c0-.502.203-.981.559-1.331ZM7.556 7.5a1 1 0 1 0 0 2h8a1 1 0 0 0 0-2h-8Zm0 3.5a1 1 0 1 0 0 2H12a1 1 0 1 0 0-2H7.556Z"/>
    </svg>

      <span className="sr-only">Quote Sender</span>
    </button>
    <div id="tooltip-settings" name = "QuoteSenderNavigation" role="tooltip" className="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-sm opacity-0 tooltip dark:bg-gray-700">
    Quote Sender
      <div className="tooltip-arrow" data-popper-arrow></div>
    </div>
    {/* Quote Sender button */}

    {/* Rates Entry button */}
    <button data-tooltip-target="tooltip-profile" name = "RatesEntryNavigation" type="button" onClick={(e) => handleChange(e, 3)} className="inline-flex flex-col items-center justify-center px-5 rounded-e-full hover:bg-gray-50 dark:hover:bg-gray-800 group">
    <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
  <path d="M7 6a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-2v-4a3 3 0 0 0-3-3H7V6Z"/>
  <path d="M2 11a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-7Zm7.5 1a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Z"/>
  <path d="M10.5 14.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"/>
</svg>

      <span className="sr-only">Rates Entry</span>
    </button>
    <div id="tooltip-profile" name = "RatesEntryNavigation" role="tooltip" className="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-sm opacity-0 tooltip dark:bg-gray-700">
    Rates Entry
      <div className="tooltip-arrow" data-popper-arrow></div>
      </div>
      {/* Rates Entry button */}

{/* Finance Entry button */}
<button data-tooltip-target="tooltip-finance" type="button" onClick={(e) => handleChange(e, 4)} name = "FinanceEntryNavigation" className="inline-flex flex-col items-center justify-center px-5 rounded-e-full hover:bg-gray-50 dark:hover:bg-gray-800 group">
  <svg className="w-6 h-6 text-gray-800 dark:text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
    <path d="M2 10a8 8 0 1 1 16 0 8 8 0 0 1-16 0zm8-5a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm-.5 1a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5z"/>
  </svg>
  <span className="sr-only">Finance Entry</span>
</button>
<div id="tooltip-finance" role="tooltip" name = "FinanceEntryNavigation" className="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-sm opacity-0 tooltip dark:bg-gray-700">
  Finance Entry
  <div className="tooltip-arrow" data-popper-arrow></div>
</div>


{/* Finance Entry button */}



      {/*Logout button */}
      <button data-tooltip-target="tooltip-logout" type="button" onClick={(e) => handleChange(e, 5)} className="inline-flex flex-col items-center justify-center px-5 rounded-e-full hover:bg-gray-50 dark:hover:bg-gray-800 group">
      <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
  <path stroke="currentColor" d="M20 12H8m12 0-4 4m4-4-4-4M9 4H7a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h2"/>
</svg>
      <span className="sr-only">Logout</span>
    </button>
    <div id="tooltip-logout" role="tooltip" className="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-sm opacity-0 tooltip dark:bg-gray-700">
    Logout
      <div className="tooltip-arrow" data-popper-arrow></div>
      
    </div>
    {/*Logout button */}
  </div>
</div>

  );
}


export default BottomBar;