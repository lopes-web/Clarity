import { useState } from "react";
import { Calendar as CalendarIcon, Plus, Check } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { cn } from "@/lib/utils";

import Sidebar from "@/components/Sidebar";
import { SidebarProvider } from "@/components/SidebarProvider";
import { useEvents } from "@/components/EventProvider";
import GoogleCalendarButton from "@/components/GoogleCalendarButton";

interface Event {
  id: string;
  title: string;
  date: Date;
  type: "Prova" | "Trabalho" | "Projeto" | "Aula" | "Outro";
  description?: string;
  disciplina?: string;
  completed: boolean;
}

interface EventFormData {
  title: string;
  date: Date;
  type: "Prova" | "Trabalho" | "Projeto" | "Aula" | "Outro";
  description: string;
  disciplina: string;
}

const CalendarPage = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const { events, addEvent, toggleEventComplete } = useEvents();

  const form = useForm<EventFormData>({
    defaultValues: {
      title: "",
      date: new Date(),
      type: "Outro",
      description: "",
      disciplina: "",
    },
  });

  const handleAddEvent = (data: EventFormData) => {
    const eventData = {
      ...data,
      date: date,
      completed: false,
    };
    addEvent(eventData);
    setIsAddingEvent(false);
    form.reset();
  };

  const getDayEvents = (day: Date) => {
    return events.filter(
      (event) => format(event.date, "yyyy-MM-dd") === format(day, "yyyy-MM-dd")
    );
  };

  // Mock de disciplinas (você pode substituir por dados reais depois)
  const disciplinas = [
    "Cálculo I",
    "Física Básica",
    "Programação",
    "Outra Disciplina",
  ];

  return (
    <SidebarProvider>
      <div className="flex min-h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Calendário Acadêmico</h1>
              <div className="flex items-center gap-4">
                <GoogleCalendarButton />
                <Dialog open={isAddingEvent} onOpenChange={setIsAddingEvent}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Novo Evento
                    </Button>
                  </DialogTrigger>
                  <DialogContent aria-describedby="event-form-description">
                    <DialogHeader>
                      <DialogTitle>Adicionar Novo Evento</DialogTitle>
                    </DialogHeader>
                    <div id="event-form-description" className="text-sm text-gray-500 mb-4">
                      Adicione um novo evento para o dia {format(date, "dd/MM/yyyy")}
                    </div>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(handleAddEvent)} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Título</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Ex: Prova de Cálculo" />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="type"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tipo</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione o tipo" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Prova">Prova</SelectItem>
                                  <SelectItem value="Trabalho">Trabalho</SelectItem>
                                  <SelectItem value="Projeto">Projeto</SelectItem>
                                  <SelectItem value="Aula">Aula</SelectItem>
                                  <SelectItem value="Outro">Outro</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="disciplina"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Disciplina</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione a disciplina" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {disciplinas.map((disciplina) => (
                                    <SelectItem key={disciplina} value={disciplina}>
                                      {disciplina}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Descrição</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="Ex: Capítulos 1 a 3"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <Button type="submit" className="w-full">
                          Adicionar Evento
                        </Button>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6">
              <div className="space-y-4">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(newDate) => newDate && setDate(newDate)}
                  className="rounded-md border w-full"
                  locale={ptBR}
                  modifiers={{
                    event: (date) => getDayEvents(date).length > 0,
                  }}
                  modifiersClassNames={{
                    event: "border-primary text-primary font-bold",
                  }}
                />

                <div className="bg-white rounded-lg p-4 border">
                  <h2 className="font-semibold mb-2">
                    {format(date, "d 'de' MMMM", { locale: ptBR })}
                  </h2>
                  <div className="space-y-2">
                    {getDayEvents(date).map((event) => (
                      <div
                        key={event.id}
                        className={cn(
                          "p-3 rounded-lg border transition-colors",
                          event.completed 
                            ? "bg-gray-100 border-gray-200" 
                            : "bg-secondary/20 hover:border-primary"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h3 className={cn(
                                "font-medium",
                                event.completed && "line-through text-gray-500"
                              )}>
                                {event.title}
                              </h3>
                              <span className="text-xs bg-primary text-white px-2 py-1 rounded">
                                {event.type}
                              </span>
                            </div>
                            {event.disciplina && (
                              <p className={cn(
                                "text-sm mt-1",
                                event.completed ? "text-gray-400" : "text-gray-600"
                              )}>
                                {event.disciplina}
                              </p>
                            )}
                            {event.description && (
                              <p className={cn(
                                "text-sm mt-1",
                                event.completed ? "text-gray-400" : "text-gray-500"
                              )}>
                                {event.description}
                              </p>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className={cn(
                              "ml-2 h-8 w-8",
                              event.completed && "bg-primary/10"
                            )}
                            onClick={() => toggleEventComplete(event.id)}
                          >
                            <Check className={cn(
                              "h-4 w-4",
                              event.completed ? "text-primary" : "text-gray-400"
                            )} />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {getDayEvents(date).length === 0 && (
                      <p className="text-sm text-gray-500">
                        Nenhum evento para este dia
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border">
                <h2 className="font-semibold mb-4">Próximos Eventos</h2>
                <div className="space-y-3">
                  {events
                    .filter((event) => !event.completed && event.date >= new Date())
                    .sort((a, b) => a.date.getTime() - b.date.getTime())
                    .map((event) => (
                      <div
                        key={event.id}
                        className="flex items-center p-3 rounded-lg border hover:border-primary transition-colors"
                      >
                        <div className="w-14 h-14 flex flex-col items-center justify-center bg-secondary/20 rounded-lg mr-4">
                          <span className="text-sm font-medium">
                            {format(event.date, "MMM", { locale: ptBR })}
                          </span>
                          <span className="text-xl font-bold">
                            {format(event.date, "d")}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium">{event.title}</h3>
                            <span className="text-xs bg-primary text-white px-2 py-1 rounded">
                              {event.type}
                            </span>
                          </div>
                          {event.disciplina && (
                            <p className="text-sm text-gray-600 mt-1">
                              {event.disciplina}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="ml-2 h-8 w-8"
                          onClick={() => toggleEventComplete(event.id)}
                        >
                          <Check className="h-4 w-4 text-gray-400" />
                        </Button>
                      </div>
                    ))}
                  {events.filter((event) => !event.completed && event.date >= new Date()).length === 0 && (
                    <p className="text-sm text-gray-500">
                      Nenhum evento programado
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default CalendarPage; 