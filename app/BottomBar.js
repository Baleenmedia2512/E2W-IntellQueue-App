'use client';
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { BottomNavigation, BottomNavigationAction } from "@mui/material";
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import PaymentsIcon from '@mui/icons-material/Payments';
import { ExitToApp } from "@mui/icons-material";

const BottomBar = () => {
  const router = useRouter();
  const currentPath = usePathname();
  const [value, setValue] = useState(0); // Define the value state variable

  useEffect(()=>{
    // Set the value state variable based on the current path
    switch (currentPath) {
      case '/rate-validation':
        setValue(0);
        break;
      case '/':
        setValue(1);
        break;
      case '/RatesEntry':
        setValue(2);
        break;
      default:
        break;
    }
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
        router.push('/RatesEntry');
        break;
      case 3:
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
    <BottomNavigation
      showLabels
      value={value}
      onChange={handleChange}
      style={{ position: 'fixed', bottom: 0, left: 0, right: 0 }}
    >
      <BottomNavigationAction label="Rates Validation" icon={<VerifiedUserIcon />} />
      <BottomNavigationAction label="Quote Sender" icon={<RequestQuoteIcon />} />
      <BottomNavigationAction label="Rates Entry" icon={<PaymentsIcon />} />
      <BottomNavigationAction label="Logout" icon={<ExitToApp />} />
    </BottomNavigation>
  );
};

export default BottomBar;