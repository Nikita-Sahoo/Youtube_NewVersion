import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Compass,
  PlaySquare,
  Clock,
  ThumbsUp,
  History,
  Flame,
  Music,
  Gamepad2,
  Newspaper,
  Trophy,
  Film,
  Settings,
  HelpCircle,
  Flag,
  Youtube
} from 'lucide-react';

const Sidebar = ({ isOpen }) => {
  const location = useLocation();

  const mainMenu = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Compass, label: 'Explore', path: '/explore' },
    { icon: PlaySquare, label: 'Subscriptions', path: '/subscriptions' },
  ];

  const youMenu = [
    { icon: History, label: 'History', path: '/history' },
    { icon: PlaySquare, label: 'Your Videos', path: '/channel' },
    { icon: Clock, label: 'Watch Later', path: '/playlist?list=WL' },
    { icon: ThumbsUp, label: 'Liked Videos', path: '/playlist?list=LL' },
  ];

  const exploreMenu = [
    { icon: Flame, label: 'Trending', path: '/feed/trending' },
    { icon: Music, label: 'Music', path: '/feed/music' },
    { icon: Gamepad2, label: 'Gaming', path: '/feed/gaming' },
    { icon: Newspaper, label: 'News', path: '/feed/news' },
    { icon: Trophy, label: 'Sports', path: '/feed/sports' },
    { icon: Film, label: 'Movies', path: '/feed/movies' },
  ];

  const settingsMenu = [
    { icon: Settings, label: 'Settings', path: '/settings' },
    { icon: Flag, label: 'Report History', path: '/reporthistory' },
    { icon: HelpCircle, label: 'Help', path: '/help' },
  ];

  const MenuItem = ({ icon: Icon, label, path }) => {
    const isActive = location.pathname === path;
    
    return (
      <Link
        to={path}
        className={`flex items-center px-3 py-2 hover:bg-gray-100 rounded-lg mx-2 ${
          isActive ? 'bg-gray-100' : ''
        } ${isOpen ? 'space-x-4' : 'flex-col space-y-1 py-3'}`}
      >
        <Icon size={isOpen ? 20 : 22} className={isActive ? 'text-red-600' : 'text-gray-700'} />
        {isOpen && (
          <span className={`text-sm ${isActive ? 'font-medium' : ''}`}>
            {label}
          </span>
        )}
      </Link>
    );
  };

  return (
    <aside
      className={`fixed left-0 top-14 h-full bg-white border-r border-gray-200 overflow-y-auto transition-all duration-300 ${
        isOpen ? 'w-64' : 'w-20'
      }`}
    >
      <div className="py-3">
        <div className="space-y-1">
          {mainMenu.map((item) => (
            <MenuItem key={item.label} {...item} />
          ))}
        </div>
        
        {isOpen && <hr className="border-gray-200 my-3" />}
        
        {isOpen && <div className="px-3 text-xs font-semibold text-gray-500 mb-2">You</div>}
        <div className="space-y-1">
          {youMenu.map((item) => (
            <MenuItem key={item.label} {...item} />
          ))}
        </div>
        
        {isOpen && <hr className="border-gray-200 my-3" />}
        
        {isOpen && <div className="px-3 text-xs font-semibold text-gray-500 mb-2">Explore</div>}
        <div className="space-y-1">
          {exploreMenu.map((item) => (
            <MenuItem key={item.label} {...item} />
          ))}
        </div>
        
        {isOpen && <hr className="border-gray-200 my-3" />}
        
        <div className="space-y-1">
          {settingsMenu.map((item) => (
            <MenuItem key={item.label} {...item} />
          ))}
        </div>

        {isOpen && (
          <div className="px-3 mt-6">
            <p className="text-xs text-gray-500">
              © 2024 YouTube Clone
              <br />
              Built with MERN Stack
            </p>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;