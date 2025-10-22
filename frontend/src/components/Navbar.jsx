import React from "react";

const Navbar = () => {
  return (
    <div className='absolute top-0 left-0 w-full z-10'>
      <nav className='bg-gray-800 p-4'>
        <ul className='flex space-x-4'>
          <li>
            <a href='/' className='text-white hover:text-gray-300'>
              Home
            </a>
          </li>
          <li>
            <a href='/about' className='text-white hover:text-gray-300'>
              About
            </a>
          </li>
          <li>
            <a href='/contact' className='text-white hover:text-gray-300'>
              Contact
            </a>
          </li>
        </ul>
      </nav>
    </div>
    
  )
};

export default Navbar;
