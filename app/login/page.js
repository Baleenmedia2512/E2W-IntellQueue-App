'use client'
import { useState } from 'react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {

    console.log(`Username: ${username}, Password: ${password}`);
  };

  return (
    <div className="bg-gray-200 h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-3xl shadow-md mt-[-100px]">
        <form className='flex flex-col items-center '>
          <><br /><br /></>
          <h1 className="text-3xl font-bold mb-8 text-black font-poppins">BME LOGIN</h1>
          <input
            className='border border-gray-300 px-4 py-2 rounded-lg mb-4 focus:outline-none focus:border-blue-500 focus:ring focus:ring-blue-200'
            type="text"
            placeholder="User Name"
            value={username}
            onChange={(e) => setUsername(e.target.value)} />
          <input
            className='border border-gray-300 px-4 py-2 rounded-lg mb-4 focus:outline-none focus:border-blue-500 focus:ring focus:ring-blue-200'
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            className="bg-green-500 text-white px-4 py-2 rounded-lg mb-4 transition-all duration-300 ease-in-out hover:bg-green-600"
            onClick={handleLogin}
          >
            Login
          </button>
          <><br /></>
        </form>
      </div>
    </div>

  );
};

export default Login;