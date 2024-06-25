'use client'
import React from 'react';

const LoginPage = () => {
    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
            <div className="max-w-screen-lg min-w-fit min-h-fit bg-white shadow-md rounded-lg overflow-hidden p-8 md:flex md:items-center md:justify-center md:space-x-8">
                {/* Sign-in form */}
                <div className="w-full md:w-1/2">
                <h2 className="text-2xl font-bold font-inter text-gray-800">WELCOME TO</h2>
                <h2 className="text-2xl font-bold font-inter text-blue-500 mb-3">EASY2WORK</h2>
                   <div className="border-2 w-10 inline-block mb-4 border-blue-500 "></div>
                    <form>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
                                Username
                            </label>
                            <input
                                className="border rounded-lg py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline w-full"
                                id="username"
                                type="text"
                                placeholder="Enter your username"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                                Password
                            </label>
                            <input
                                className="border rounded-lg py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline w-full"
                                id="password"
                                type="password"
                                placeholder="Enter your password"
                            />
                        </div>
                        <div className="mb-6">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                                Company Name
                            </label>
                            <input
                                className="border rounded-lg py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline w-full"
                                id="password"
                                type="password"
                                placeholder="Enter your Company Name"
                            />
                        </div>
                        <button
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
                            type="button"
                        >
                            Sign In
                        </button>
                    </form>
                </div>
                {/* Additional space with curved edges for pictures (visible on larger screens) */}
                <div className="hidden md:block bg-blue-500 rounded-lg w-full min-h-96 md:w-1/2 p-8">
                <div className="flex flex-col items-center justify-center">
                <h2 className="text-xl text-center font-bold text-yellow-300 mb-4">Streamline Your Customer Relationships with Ease</h2>
                <div className="border-2 w-10 inline-block mb-4 border-yellow-300"></div>
                <img src="/images/login.png" alt="Login" className="w-72  h-auto rounded-br-lg" />
                </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
