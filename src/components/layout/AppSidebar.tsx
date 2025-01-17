import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  Home,
  BookOpen,
  Calendar,
  Clock,
  FolderOpen,
  Tag,
  Settings,
  LogOut,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Logo } from "@/components/ui/logo";

const menuItems = [
  { title: "Dashboard", icon: Home, url: "/" },
  { title: "Matérias", icon: BookOpen, url: "/subjects" },
  { title: "Calendário", icon: Calendar, url: "/calendar" },
  { title: "Pomodoro", icon: Clock, url: "/pomodoro" },
  { title: "Arquivos", icon: FolderOpen, url: "/files" },
  { title: "Tags", icon: Tag, url: "/tags" },
];

const bottomMenuItems = [
  { title: "Configurações", icon: Settings, url: "/settings" },
];

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Logout realizado com sucesso!');
      navigate('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      toast.error('Erro ao fazer logout');
    }
  };

  return (
    <Sidebar 
      className="w-64 shrink-0 border-r border-gray-200 bg-white/95 shadow-sm"
      collapsible="offcanvas"
      variant="sidebar"
    >
      <SidebarContent className="flex flex-col h-full">
        {/* Logo/Título */}
        <div className="p-6 flex items-center justify-center border-b border-gray-200 bg-white">
          <Logo size={64} />
        </div>

        {/* Perfil do Usuário */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-[#C49ED7]/20 flex items-center justify-center">
              <User className="h-4 w-4 text-[#C49ED7]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.email}
              </p>
              <p className="text-xs text-gray-500">
                Logado
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 py-6">
          <SidebarGroup>
            <SidebarGroupLabel className="px-6 text-xs font-semibold uppercase tracking-wider text-gray-700">
              Menu
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link
                        to={item.url}
                        className={cn(
                          "flex items-center gap-3 px-6 py-2.5 text-sm font-medium transition-all duration-200",
                          "relative",
                          location.pathname === item.url
                            ? "text-[#C49ED7] bg-[#C49ED7]/10 border-r-2 border-[#C49ED7]"
                            : "text-gray-700 hover:text-[#C49ED7] hover:bg-[#C49ED7]/10",
                          "hover:translate-x-1"
                        )}
                      >
                        <item.icon 
                          className={cn(
                            "h-5 w-5 transition-colors",
                            location.pathname === item.url
                              ? "text-[#C49ED7]"
                              : "text-gray-500 group-hover:text-[#C49ED7]"
                          )}
                        />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>

        {/* Menu inferior */}
        <div className="border-t border-gray-200 py-4 bg-gray-50 space-y-4">
          <SidebarMenu>
            {bottomMenuItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <Link
                    to={item.url}
                    className={cn(
                      "flex items-center gap-3 px-6 py-2.5 text-sm font-medium transition-all duration-200",
                      "relative",
                      location.pathname === item.url
                        ? "text-purple-700 bg-purple-50 border-r-2 border-purple-600"
                        : "text-gray-700 hover:text-purple-700 hover:bg-purple-50/80",
                      "hover:translate-x-1"
                    )}
                  >
                    <item.icon 
                      className={cn(
                        "h-5 w-5 transition-colors",
                        location.pathname === item.url
                          ? "text-purple-600"
                          : "text-gray-500 group-hover:text-purple-600"
                      )}
                    />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>

          {/* Botão de Logout */}
          <div className="px-4">
            <Button
              variant="outline"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}