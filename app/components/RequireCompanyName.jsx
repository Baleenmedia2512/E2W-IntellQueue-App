'use client'
// A wrapper to ensure authentication is properly handled for both web and mobile
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAppSelector } from '@/redux/store';
import { useDispatch } from 'react-redux';
import { login, setCompanyName, setAppRights, setDBName } from '@/redux/features/auth-slice';
import { resetClientData } from '@/redux/features/client-slice';
import { resetOrderData } from '@/redux/features/order-slice';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { Capacitor } from '@capacitor/core';

// Emergency Login Component
const EmergencyLogin = () => {
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyNameState] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    // Basic validation
    if (!userName.trim()) {
      setErrors(prev => ({ ...prev, userName: 'Username is required' }));
      setIsLoading(false);
      return;
    }
    if (!password.trim()) {
      setErrors(prev => ({ ...prev, password: 'Password is required' }));
      setIsLoading(false);
      return;
    }
    if (!companyName.trim()) {
      setErrors(prev => ({ ...prev, companyName: 'Company name is required' }));
      setIsLoading(false);
      return;
    }

    try {
      console.log('🔍 EMERGENCY LOGIN - Attempting login with:', { userName, companyName });
      
      // Set company name first
      dispatch(setCompanyName(companyName));
      
      // Attempt login
      const response = await fetch('https://orders.baleenmedia.com/API/Media/LoginApi.php/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: userName,
          password: password,
          companyname: companyName
        })
      });

      const data = await response.json();
      console.log('🔍 EMERGENCY LOGIN - Response:', data);

      if (data.success) {
        dispatch(login(userName));
        dispatch(setAppRights(data.appRights || ''));
        dispatch(setDBName(data.dbName || ''));
        dispatch(resetClientData());
        dispatch(resetOrderData());
        
        console.log('🔍 EMERGENCY LOGIN - Success! Redirecting...');
        router.push('/');
      } else {
        setErrors({ general: data.message || 'Login failed' });
      }
    } catch (error) {
      console.error('🔍 EMERGENCY LOGIN - Error:', error);
      setErrors({ general: 'Network error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      <div className="max-w-md w-full bg-white shadow-md rounded-lg p-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-red-600 mb-2">EMERGENCY LOGIN</h2>
          <p className="text-sm text-gray-600">Routing issue detected - using fallback login</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter username"
            />
            {errors.userName && <p className="text-red-500 text-xs mt-1">{errors.userName}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                placeholder="Enter password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                ) : (
                  <EyeIcon className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company Name
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyNameState(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter company name"
            />
            {errors.companyName && <p className="text-red-500 text-xs mt-1">{errors.companyName}</p>}
          </div>

          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-red-600 text-sm">{errors.general}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="w-full bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            Refresh Page
          </button>
        </form>
      </div>
    </div>
  );
};

export default function RequireCompanyName({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [showEmergencyLogin, setShowEmergencyLogin] = useState(false);
  
  console.log('🔍 RequireCompanyName component mounted!');
  
  // Get auth state from Redux
  const companyName = useAppSelector(state => state.authSlice.companyName);
  const userName = useAppSelector(state => state.authSlice.userName);
  
  console.log('🔍 RequireCompanyName - Initial state:');
  console.log('  - pathname:', pathname);
  console.log('  - userName:', userName);
  console.log('  - companyName:', companyName);
  
  // Early return for pages that don't need auth check
  const isQueueSystem = pathname?.startsWith('/QueueSystem');
  const isLoginPage = pathname === '/login';
  
  console.log('🔍 RequireCompanyName - Page checks:');
  console.log('  - isQueueSystem:', isQueueSystem);
  console.log('  - isLoginPage:', isLoginPage);
  console.log('  - pathname === "/login":', pathname === '/login');
  console.log('  - pathname value:', JSON.stringify(pathname));

  // ALWAYS run authentication check, even on login page
  // This will help us understand what's happening
  console.log('🔍 RequireCompanyName - Running auth check for all pages');
  
  // For both mobile and web, check authentication
  useEffect(() => {
    console.log('=== RequireCompanyName Debug ===');
    console.log('Platform:', Capacitor.isNativePlatform() ? 'Mobile' : 'Web');
    console.log('Current pathname:', pathname);
    console.log('isLoginPage:', isLoginPage);
    console.log('isQueueSystem:', isQueueSystem);
    console.log('User:', userName);
    console.log('Company:', companyName);
    console.log('Should redirect?', !userName || !companyName);
    console.log('================================');
    
    // Small delay to ensure Redux persistence has loaded
    const checkAuth = setTimeout(() => {
      // For queue system, never redirect
      if (isQueueSystem) {
        console.log('RequireCompanyName - Queue system page, skipping auth');
        setIsChecking(false);
        return;
      }
      
      // For login page, allow if no auth OR if already has auth
      if (isLoginPage) {
        console.log('RequireCompanyName - Login page detected');
        if (!userName || !companyName) {
          console.log('RequireCompanyName - Login page + no auth = OK');
          
          // Check if proper login form is loaded after a delay
          setTimeout(() => {
            const hasLoginForm = document.querySelector('input[placeholder*="username"], input[placeholder*="password"], form');
            console.log('RequireCompanyName - Login form found:', !!hasLoginForm);
            
            if (!hasLoginForm) {
              console.log('RequireCompanyName - No login form found! Showing emergency login');
              setShowEmergencyLogin(true);
            }
          }, 500);
        } else {
          console.log('RequireCompanyName - Login page + has auth = redirect to home');
          window.location.href = '/';
        }
        setIsChecking(false);
        return;
      }
      
      // For all other pages, check authentication
      if (!userName || !companyName) {
        console.log('RequireCompanyName - Not authenticated, forcing redirect to login');
        window.location.href = '/login';
      } else {
        console.log('RequireCompanyName - User authenticated, allowing access');
        setIsChecking(false);
      }
    }, 100);
    
    return () => clearTimeout(checkAuth);
  }, [companyName, userName, router, pathname, isLoginPage, isQueueSystem]);
  
  // Show emergency login if routing is broken
  if (showEmergencyLogin) {
    return <EmergencyLogin />;
  }

  // Show loading while checking authentication
  if (isChecking) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-600">
            Checking authentication...
          </div>
        </div>
      </div>
    );
  }
  
  // Always render children after auth check is complete
  return children;
}
