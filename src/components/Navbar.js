import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  const [active, setActive] = useState('Dashboard');

  const navItems = [
    { name: 'Dashboard', path: '/' },
    { name: 'Credentials', path: '/credentials' },
    { name: 'Discovery', path: '/discovery' },
  ];

  return (
    <nav className="bg-gray-800/80 backdrop-blur-md p-4 fixed w-full z-10">
      <div className="container mx-auto flex items-center">
        {/* Logo on the left */}
        <div className="text-white text-lg font-bold mr-8"> {/* Added margin-right for gap */}
          NMSLite
        </div>

        {/* Navigation Links with gap after logo */}
        <div className="flex space-x-4">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              onClick={() => setActive(item.name)}
              className={`text-white px-3 py-2 rounded-md text-sm font-medium ${
                active === item.name ? 'border-b-2 border-indigo-500' : ''
              }`}
            >
              {item.name}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}