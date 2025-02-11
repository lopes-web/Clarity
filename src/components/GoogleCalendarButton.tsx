import { Button } from "@/components/ui/button";
import { useGoogleAuth, isAuthenticated } from "@/lib/googleCalendar";
import { toast } from "sonner";

const GoogleCalendarButton = () => {
  const login = useGoogleAuth();

  const handleClick = async () => {
    try {
      if (!isAuthenticated()) {
        login();
      }
    } catch (error) {
      console.error('Erro ao autenticar com Google Calendar:', error);
      toast.error('Erro ao conectar com Google Calendar');
    }
  };

  return (
    <Button
      onClick={handleClick}
      variant="outline"
      className="w-full"
    >
      {isAuthenticated() ? "Conectado ao Google Calendar" : "Sincronizar com Google"}
    </Button>
  );
};

export default GoogleCalendarButton; 