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
  const ReportIcon = () => (
    <svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
    <path fill-rule="evenodd" d="M2 6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6Zm2 8v-2h7v2H4Zm0 2v2h7v-2H4Zm9 2h7v-2h-7v2Zm7-4v-2h-7v2h7Z" clip-rule="evenodd"/>
  </svg>
  
  
  );
  
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
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-patch-check-fill" viewBox="0 0 16 16">
  <path d="M10.067.87a2.89 2.89 0 0 0-4.134 0l-.622.638-.89-.011a2.89 2.89 0 0 0-2.924 2.924l.01.89-.636.622a2.89 2.89 0 0 0 0 4.134l.637.622-.011.89a2.89 2.89 0 0 0 2.924 2.924l.89-.01.622.636a2.89 2.89 0 0 0 4.134 0l.622-.637.89.011a2.89 2.89 0 0 0 2.924-2.924l-.01-.89.636-.622a2.89 2.89 0 0 0 0-4.134l-.637-.622.011-.89a2.89 2.89 0 0 0-2.924-2.924l-.89.01zm.287 5.984-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7 8.793l2.646-2.647a.5.5 0 0 1 .708.708"/>
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
      <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
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
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-send-fill" viewBox="0 0 16 16">
  <path d="M15.964.686a.5.5 0 0 0-.65-.65L.767 5.855H.766l-.452.18a.5.5 0 0 0-.082.887l.41.26.001.002 4.995 3.178 3.178 4.995.002.002.26.41a.5.5 0 0 0 .886-.083zm-1.833 1.89L6.637 10.07l-.215-.338a.5.5 0 0 0-.154-.154l-.338-.215 7.494-7.494 1.178-.471z"/>
</svg>

      <span className="sr-only">Quote Sender</span>
    </button>
    <div id="tooltip-settings" name = "QuoteSenderNavigation" role="tooltip" className="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-sm opacity-0 tooltip dark:bg-gray-700">
    Quote Sender
      <div className="tooltip-arrow" data-popper-arrow></div>
    </div>
    {/* Quote Sender button */}
    
    {/* MP-97 */}
    {/* Order button */}
    <button data-tooltip-target="tooltip-profile" name = "RatesEntryNavigation" type="button" onClick={(e) => handleChange(e, 3)} className="inline-flex flex-col items-center justify-center px-5 rounded-e-full hover:bg-gray-50 dark:hover:bg-gray-800 group">
    <svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
  <path d="M12.268 6A2 2 0 0 0 14 9h1v1a2 2 0 0 0 3.04 1.708l-.311 1.496a1 1 0 0 1-.979.796H8.605l.208 1H16a3 3 0 1 1-2.83 2h-2.34a3 3 0 1 1-4.009-1.76L4.686 5H4a1 1 0 0 1 0-2h1.5a1 1 0 0 1 .979.796L6.939 6h5.329Z"/>
  <path d="M18 4a1 1 0 1 0-2 0v2h-2a1 1 0 1 0 0 2h2v2a1 1 0 1 0 2 0V8h2a1 1 0 1 0 0-2h-2V4Z"/>
</svg>


      <span className="sr-only">Work Order</span>
    </button>
    <div id="tooltip-profile" name = "RatesEntryNavigation" role="tooltip" className="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-sm opacity-0 tooltip dark:bg-gray-700">
    Work Order
      <div className="tooltip-arrow" data-popper-arrow></div>
      </div>
      {/* Order button */}
      {/* MP-97 */}

    {/* Rates Entry button */}
    <button data-tooltip-target="tooltip-profile" name = "RatesEntryNavigation" type="button" onClick={(e) => handleChange(e, 4)} className="inline-flex flex-col items-center justify-center px-5 rounded-e-full hover:bg-gray-50 dark:hover:bg-gray-800 group">
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" class="bi bi-currency-rupee" viewBox="0 0 16 16">
  <path d="M4 3.06h2.726c1.22 0 2.12.575 2.325 1.724H4v1.051h5.051C8.855 7.001 8 7.558 6.788 7.558H4v1.317L8.437 14h2.11L6.095 8.884h.855c2.316-.018 3.465-1.476 3.688-3.049H12V4.784h-1.345c-.08-.778-.357-1.335-.793-1.732H12V2H4z"/>
</svg>

      <span className="sr-only">Rates Entry</span>
    </button>
    <div id="tooltip-profile" name = "RatesEntryNavigation" role="tooltip" className="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-sm opacity-0 tooltip dark:bg-gray-700">
    Rates Entry
      <div className="tooltip-arrow" data-popper-arrow></div>
      </div>
      {/* Rates Entry button */}

{/* Finance Entry button */}
<button data-tooltip-target="tooltip-finance" type="button" onClick={(e) => handleChange(e, 5)} name = "FinanceEntryNavigation" className="inline-flex flex-col items-center justify-center px-5 rounded-e-full hover:bg-gray-50 dark:hover:bg-gray-800 group">
<svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
  <path fill-rule="evenodd" d="M12 14a3 3 0 0 1 3-3h4a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-4a3 3 0 0 1-3-3Zm3-1a1 1 0 1 0 0 2h4v-2h-4Z" clip-rule="evenodd"/>
  <path fill-rule="evenodd" d="M12.293 3.293a1 1 0 0 1 1.414 0L16.414 6h-2.828l-1.293-1.293a1 1 0 0 1 0-1.414ZM12.414 6 9.707 3.293a1 1 0 0 0-1.414 0L5.586 6h6.828ZM4.586 7l-.056.055A2 2 0 0 0 3 9v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2h-4a5 5 0 0 1 0-10h4a2 2 0 0 0-1.53-1.945L17.414 7H4.586Z" clip-rule="evenodd"/>
</svg>

  <span className="sr-only">Finance Entry</span>
</button>
<div id="tooltip-finance" role="tooltip" name = "FinanceEntryNavigation" className="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-sm opacity-0 tooltip dark:bg-gray-700">
  Finance Entry
  <div className="tooltip-arrow" data-popper-arrow></div>
</div>


{/* Finance Entry button */}
{/*Report button */}
<button
  data-tooltip-target="tooltip-report"
  type="button"
  onClick={(e) => handleChange(e, 6)}
  className="inline-flex flex-col items-center justify-center px-5 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 group"
>
  <ReportIcon />
  <span className="sr-only">Report</span>
</button>
<div
  id="tooltip-report"
  role="tooltip"
  className="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-sm opacity-0 tooltip dark:bg-gray-700"
>
  Report
  <div className="tooltip-arrow" data-popper-arrow></div>
</div>

    {/*Report button */}


      {/*Logout button */}
      <button data-tooltip-target="tooltip-logout" type="button" onClick={(e) => handleChange(e, 7)} className="inline-flex flex-col items-center justify-center px-5 rounded-e-full hover:bg-gray-50 dark:hover:bg-gray-800 group">
      <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24">
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