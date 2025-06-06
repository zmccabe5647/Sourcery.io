import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Mail, Users, FileText, Clock, Settings, LogOut, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

function Layout() {
  const location = useLocation();
  const { signOut } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Mail },
    { name: 'Contacts', href: '/contacts', icon: Users },
    { name: 'Templates', href: '/templates', icon: FileText },
    { name: 'Sequences', href: '/sequences', icon: Clock },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg">
          <div className="flex h-16 items-center px-6 bg-gradient-to-r from-indigo-500 to-purple-500">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-6 w-6 text-white" />
              <h1 className="text-xl font-bold text-white">Sourcery.io</h1>
            </div>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`${
                    isActive
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-indigo-600'
                  } group flex items-center rounded-md px-2 py-2 text-sm font-medium transition-colors duration-150`}
                >
                  <Icon
                    className={`${
                      isActive
                        ? 'text-indigo-500'
                        : 'text-gray-400 group-hover:text-indigo-500'
                    } mr-3 h-5 w-5 flex-shrink-0 transition-colors duration-150`}
                  />
                  {item.name}
                </Link>
              );
            })}
            <button
              onClick={() => signOut()}
              className="w-full text-left text-gray-600 hover:bg-gray-50 hover:text-red-600 group flex items-center rounded-md px-2 py-2 text-sm font-medium transition-colors duration-150"
            >
              <LogOut className="text-gray-400 group-hover:text-red-500 mr-3 h-5 w-5 flex-shrink-0 transition-colors duration-150" />
              Sign Out
            </button>
          </nav>
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-8 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;