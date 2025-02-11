import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="border-t">
      <div className="container mx-auto py-4">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            © {new Date().getFullYear()} Clarity. Todos os direitos reservados.
          </div>
          <nav className="flex gap-4">
            <Link 
              to="/privacy-policy" 
              className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
            >
              Política de Privacidade
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
} 