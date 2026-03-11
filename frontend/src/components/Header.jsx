import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Search, User, LogOut, Video, ChevronDown } from 'lucide-react';

const Header = ({ toggleSidebar, user, setUser }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${searchQuery}`);
    }
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setShowMenu(false);
    navigate('/');
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
      <div className="flex items-center justify-between px-4 h-14">
        {/* Left section */}
        <div className="flex items-center">
          <button
            onClick={toggleSidebar}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <Menu size={20} />
          </button>
          <Link to="/" className="ml-4 flex items-center">
            <div className="text-2xl font-bold text-red-600">YouTube</div>
            <span className="text-[10px] text-gray-500 ml-1 mt-3">IN</span>
          </Link>
        </div>

        {/* Search section */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-2xl mx-4">
          <div className="flex w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search"
              className="w-full px-4 py-2 border border-gray-300 rounded-l-full focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-full hover:bg-gray-200"
            >
              <Search size={20} />
            </button>
          </div>
        </form>

        {/* Mobile search */}
        <button className="md:hidden p-2 hover:bg-gray-100 rounded-full">
          <Search size={20} />
        </button>

        {/* Right section */}
        <div className="flex items-center space-x-2">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center space-x-1 hover:bg-gray-100 px-2 py-1 rounded-full"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                  {user.username?.charAt(0).toUpperCase()}
                </div>
                <ChevronDown size={16} className="text-gray-600" />
              </button>

              {/* Dropdown menu */}
              {showMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border py-1">
                  <div className="px-4 py-3 border-b">
                    <p className="font-semibold">{user.username}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                  <Link
                    to="/channel"
                    className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100"
                    onClick={() => setShowMenu(false)}
                  >
                    <User size={18} />
                    <span>Your Channel</span>
                  </Link>
                  <Link
                    to="/channel?tab=videos"
                    className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100"
                    onClick={() => setShowMenu(false)}
                  >
                    <Video size={18} />
                    <span>Your Videos</span>
                  </Link>
                  <hr className="my-1" />
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 w-full text-left text-red-600"
                  >
                    <LogOut size={18} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/auth"
              className="flex items-center space-x-2 border border-blue-500 text-blue-500 px-4 py-1.5 rounded-full hover:bg-blue-50"
            >
              <User size={18} />
              <span className="font-medium">Sign In</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;