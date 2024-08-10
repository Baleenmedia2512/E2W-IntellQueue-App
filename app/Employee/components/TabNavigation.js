// // employee/components/TabNavigation.jsx

// import Link from 'next/link';
// import { useRouter } from 'next/navigation';

// export default function TabNavigation() {
//   const router = useRouter();

//   const tabs = [
//     { name: 'General Details', href: '/Employee/page' },
//     { name: 'Proof', href: '/Employee/proof' },
//     { name: 'Roles and Goals', href: '/Employee/roles-and-goals' },
//     { name: 'Login Credentials', href: '/Employee/login-credentials' }
//   ];

//   return (
//     <div className="flex justify-center space-x-4 mb-6">
//       {tabs.map((tab) => (
//         <Link key={tab.name} href={tab.href}>
//           <p
//             className={`px-4 py-2 rounded-lg ${
//               router.pathname === tab.href ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
//             }`}
//           >
//             {tab.name}
//           </p>
//         </Link>
//       ))}
//     </div>
//   );
// }
