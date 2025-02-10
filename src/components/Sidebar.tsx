
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { BookOpen, Calendar, List, Settings } from "lucide-react";

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  const menuItems = [
    { icon: BookOpen, label: "Dashboard", path: "/" },
    { icon: List, label: "Anotações", path: "/notes" },
    { icon: Calendar, label: "Calendário", path: "/calendar" },
    { icon: Settings, label: "Configurações", path: "/settings" },
  ];

  return (
    <aside className={`h-screen bg-white border-r border-gray-200 transition-all duration-300 ${isCollapsed ? "w-20" : "w-64"}`}>
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-gray-200">
          <h1 className={`text-2xl font-bold text-primary ${isCollapsed ? "hidden" : "block"}`}>StudyFlow</h1>
        </div>
        <nav className="flex-1 overflow-y-auto">
          <ul className="p-2 space-y-2">
            {menuItems.map((item) => (
              <li key={item.label}>
                <Link
                  to={item.path}
                  className={`flex items-center p-3 space-x-3 rounded-lg transition-colors ${
                    location.pathname === item.path
                      ? "bg-secondary text-primary-foreground"
                      : "text-gray-700 hover:bg-secondary hover:text-primary-foreground"
                  }`}
                >
                  <item.icon className="w-6 h-6" />
                  {!isCollapsed && <span>{item.label}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
