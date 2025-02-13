import { useLocation, Link } from 'react-router-dom';
import { Home, Calendar, Trophy } from 'lucide-react';

export function Navigation() {
    const location = useLocation();
    const pathname = location.pathname;

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 md:relative md:border-t-0">
            <div className="container mx-auto flex justify-around items-center">
                <Link
                    to="/"
                    className={`flex flex-col items-center gap-1 ${pathname === '/' ? 'text-primary' : 'text-muted-foreground'}`}
                >
                    <Home className="w-5 h-5" />
                    <span className="text-xs">Início</span>
                </Link>

                <Link
                    to="/calendar"
                    className={`flex flex-col items-center gap-1 ${pathname === '/calendar' ? 'text-primary' : 'text-muted-foreground'}`}
                >
                    <Calendar className="w-5 h-5" />
                    <span className="text-xs">Calendário</span>
                </Link>

                <Link
                    to="/achievements"
                    className={`flex flex-col items-center gap-1 ${pathname === '/achievements' ? 'text-primary' : 'text-muted-foreground'}`}
                >
                    <Trophy className="w-5 h-5" />
                    <span className="text-xs">Conquistas</span>
                </Link>
            </div>
        </nav>
    );
} 