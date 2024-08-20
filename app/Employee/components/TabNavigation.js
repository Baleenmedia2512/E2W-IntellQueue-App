// app/Employee/components/TabNavigation.jsx
'use client';
import { Menubar } from 'primereact/menubar';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { setCurrentPage } from '../../../redux/features/emp-slice'; // Adjust the relative path
import { FaHome, FaFileAlt, FaList, FaKey } from 'react-icons/fa'; // Import your icons here
import { useState } from 'react'; // Import useState for dropdown handling

export default function TabNavigation() {
  const dispatch = useDispatch();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false); // State for handling dropdown menu visibility

  const tabs = [
    { name: 'General Details', href: '/Employee/page', page: 'generalDetails', icon: <FaHome /> },
    { name: 'Proof', href: '/Employee/proof', page: 'proof', icon: <FaFileAlt /> },
    { name: 'Roles and Goals', href: '/Employee/roles-and-goals', page: 'rolesGoals', icon: <FaList /> },
    { name: 'Login Credentials', href: '/Employee/login-credentials', page: 'loginCredential', icon: <FaKey /> }
  ];

  const handleTabChange = (page, href) => {
    dispatch(setCurrentPage(page));
    router.push(href);
    setIsMenuOpen(false); // Close menu on tab click
  };

  const items = tabs.map((tab) => ({
    label: (
      <span className="flex items-center space-x-2 p-2 rounded-lg transition-colors duration-300 ease-in-out hover:bg-blue-200">
        {tab.icon}
        <span>{tab.name}</span>
      </span>
    ),
    command: () => handleTabChange(tab.page, tab.href),
    className: router.pathname === tab.href 
      ? 'bg-blue-600 text-white rounded-lg shadow-md' 
      : 'text-gray-800 hover:bg-gray-200',
  }));

  return (
    <div className="pt-14">
      <div className="fixed top-0 left-0 right-0 z-10 bg-white shadow-lg py-2 md:py-3 border-b border-gray-200">
        <div className="w-full max-w-6xl mx-auto px-2 md:px-4">
          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center justify-between">
            <div className="text-blue-600 font-bold text-lg">Employee Portal</div>
            <button 
              className="p-2 rounded-lg hover:bg-gray-200"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              Menu
            </button>
          </div>
          {/* Desktop Menubar */}
          <div className="hidden md:block">
            <Menubar 
              model={items} 
              className="overflow-x-auto whitespace-nowrap scrollbar-hide"
              start={<div className="text-blue-600 font-bold text-lg">Employee Portal</div>}
            />
          </div>
          {/* Mobile Dropdown Menu */}
          {isMenuOpen && (
            <div className="md:hidden bg-white shadow-lg mt-2 rounded-lg border border-gray-200">
              {items.map((item, index) => (
                <div 
                  key={index} 
                  className={`flex items-center space-x-2 p-2 cursor-pointer transition-colors duration-300 ease-in-out ${item.className}`}
                  onClick={item.command}
                >
                  {item.label}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
