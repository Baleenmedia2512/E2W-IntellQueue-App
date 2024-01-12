'use client'
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleSubmit = (event) => {
        event.preventDefault();
        if(userName === '' || password === ''){
          console.log("Please Enter User Name and Password");
          setTimeout(() => {
            message.info("Please Enter User Name and Password")
          })
        }else{
        fetch(`https://orders.baleenmedia.com/API/Login.php`, {
          method: 'POST',
         // mode: 'no-cors',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            JsonUserName: userName,
            JsonPassword: password
          })
        })
        .then(response => {
          if (!response.ok) {
            throw new Error("response.statusText");
          }
          return response.json();
        })
          .then(data => {
            console.log(data); 
            //setResp(data);
            if(data === 'Login Succesfully'){
              navigate('/main', { state: userName });
              setTimeout(() => {
                message.success("Login Successful")
              })
              //navigation.navigate('Main', { userName });
             
            }else{
              console.log("Invalid Credentials")
              setTimeout(() => {
                message.error("Invalid Credentials")
              })
            }
        })
          .catch(error => {
            console.error(error);
          });
      };}

  return (
    <div className="bg-gray-200 h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-3xl shadow-md mt-[-100px]">
        <form className='flex flex-col items-center '>
        <div className='pt-0 justify-center flex'>
                <div className='bg-gray-300 rounded-full items-center flex justify-center h-12 w-12'>
                    <img src = "/images/WHITE PNG.png" className = 'h-10 w-10 rounded-full ' alt = 'profile' />
                </div>
            </div>
          <><br /><br /></>
          <h1 className="text-3xl font-bold mb-8 text-black font-poppins">Login</h1>
          <input
            className='border border-gray-300 px-4 py-2 rounded-lg mb-4 font-poppins focus:outline-none focus:border-blue-500 focus:ring focus:ring-blue-200'
            type="text"
            placeholder="User Name"
            value={username}
            onChange={(e) => setUsername(e.target.value)} />
          <input
            className='border border-gray-300 px-4 py-2 rounded-lg mb-4 font-poppins focus:outline-none focus:border-blue-500 focus:ring focus:ring-blue-200'
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            className="bg-green-500 text-white px-4 py-2 rounded-lg mb-4 font-poppins transition-all duration-300 ease-in-out hover:bg-green-600"
            onClick={handleSubmit}
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