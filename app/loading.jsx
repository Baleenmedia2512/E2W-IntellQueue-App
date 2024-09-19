import React from 'react';
import './globals.css';

const Loading = () => {
    return (
        <section className='flex justify-center items-center h-screen'>
            <div className='ld-ripple'>
                <div></div>
                <div></div>
            </div>
        </section>
    )
}

export default Loading;
