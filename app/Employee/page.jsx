// app/Employee/page.jsx
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import GeneralDetailsPage from './general-details';
import ProofPage from './proof';
import RolesGoalsPage from './roles-and-goals';
import LoginCredentialPage from './login-credentials';
import { useAppSelector } from '@/redux/store';

const EmployeeRegistration = () => {
  const router = useRouter();
  const username = useAppSelector(state => state.authSlice.userName);
  const currentPage = useAppSelector(state => state.employeeSlice.currentPage);

  useEffect(() => {
    if (!username) {
      router.push('/login');
    }
  }, [username, router]);

  function showCurrentPage() {
    switch(currentPage) {
      case 'generalDetails':
        return <GeneralDetailsPage />;
      case 'proof':
        return <ProofPage />;
      case 'rolesGoals':
        return <RolesGoalsPage />;
      case 'loginCredential':
        return <LoginCredentialPage />;
      default:
        return <GeneralDetailsPage />;
    }
  }

  return (
    <div>
      {showCurrentPage()}
    </div>
  );
};

export default EmployeeRegistration;
