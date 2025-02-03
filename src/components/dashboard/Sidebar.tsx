import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MessageSquare, Files, Home, LogOut, Settings, Microscope } from 'lucide-react';

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
  const location = useLocation();
  return (
    <nav className="flex flex-col p-4 space-y-2">
      {menuItems.map(item => (
        <Link
          key={item.href}
          to={item.href}
          state={{ clearActiveTab: true }}
          className="flex items-center p-2 text-sm font-medium rounded-md hover:bg-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
          aria-label={item.title}
        >
          <item.icon className="w-5 h-5 mr-2" />
          {item.title}
        </Link>
      ))}
    </nav>
  );
} 