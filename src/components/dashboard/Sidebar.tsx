import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { MessageSquare, Files, Home, LogOut, Settings, Microscope } from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
  {
    title: 'Início',
    icon: Home,
    href: '/'
  },
  {
    title: 'Chat Rápido',
    icon: MessageSquare,
    href: '/chat'
  },
  {
    title: 'Assistente',
    icon: Microscope,
    href: '/assistant'
  },
  {
    title: 'Arquivos',
    icon: Files,
    href: '/files'
  }
];

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if current route is a tab route
  const isTabRoute = location.pathname.startsWith('/tab/');
  
  // Track active tab state
  const [hasActiveTab, setHasActiveTab] = useState(false);

  // Update active tab state whenever location or localStorage changes
  useEffect(() => {
    const checkActiveTab = () => {
      const activeTab = localStorage.getItem('app-tabs');
      const isActive = activeTab ? JSON.parse(activeTab).length > 0 : false;
      setHasActiveTab(isActive);
    };

    // Initial check
    checkActiveTab();

    // Setup storage event listener
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'app-tabs') {
        checkActiveTab();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [location]);

  const handleNavigation = (href: string) => {
    if (href === '/' && location.pathname === '/') {
      // Clear active tab state and force navigation to dashboard
      localStorage.removeItem('app-tabs');
      localStorage.removeItem('active-tab');
      navigate('/', { state: { clearActiveTab: true }, replace: true });
    }
  };

  return (
    <nav className="flex flex-col p-4 space-y-2">
      {menuItems.map(item => (
        <NavLink
          key={item.href}
          to={item.href}
          end={item.href === '/'}
          onClick={() => handleNavigation(item.href)}
          className={({ isActive }) =>
            cn(
              "flex items-center p-2 text-sm font-medium rounded-md hover:bg-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent",
              // Only show active state if there's no active tab and we're not in a tab route
              (!hasActiveTab && !isTabRoute && isActive) ? "bg-accent" : ""
            )
          }
          aria-label={item.title}
        >
          <item.icon className="w-5 h-5 mr-2" />
          {item.title}
        </NavLink>
      ))}
    </nav>
  );
} 