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
  
  // Determine if current route is a tab route
  const isTabRoute = location.pathname.startsWith('/tab/');
  
  // Use local state for active tab, updated on location change
  const [activeTab, setActiveTab] = useState(localStorage.getItem('dashboard-active-tab') || '');
  useEffect(() => {
    setActiveTab(localStorage.getItem('dashboard-active-tab') || '');
  }, [location]);
  
  const hasActiveTab = Boolean(activeTab);

  return (
    <nav className="flex flex-col p-4 space-y-2">
      {menuItems.map(item => (
        <NavLink
          key={item.href}
          to={item.href}
          end={item.href === '/'}
          state={{ clearActiveTab: true }}
          onClick={() => {
            if (item.href === '/' && location.pathname === '/') {
              // Force navigation to clear active tab
              navigate('/', { state: { clearActiveTab: true }, replace: true });
            }
          }}
          className={({ isActive }) =>
            cn(
              "flex items-center p-2 text-sm font-medium rounded-md hover:bg-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent",
              (hasActiveTab || isTabRoute) ? "" : (isActive ? "bg-accent" : "")
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