import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { Plus, Edit2, Trash, Check, CheckCircle2, Calendar as CalendarIcon, Clock, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { useEvents } from "@/components/EventProvider";
import type { Event as CalendarEvent } from "@/components/EventProvider";
import { format, isFuture, compareAsc, startOfWeek, endOfWeek, isWithinInterval, startOfDay, isAfter, isBefore } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";
import { toast } from "sonner";
import {
  getDisciplines,
  addDiscipline,
  updateDiscipline,
  deleteDiscipline,
  addGrade,
  calculateAverageGrade,
  type Discipline,
  type Grade
} from "@/lib/disciplines";

interface Course {
  id: number;
  name: string;
  professor: string;
  grade: number;
  absences: number;
  progress: number;
  status: string;
  credits: number;
  grades: { id: number; value: number; description: string }[];
}

interface CourseFormData {
  name: string;
  professor: string;
  credits: number;
}

interface GradeFormData {
  value: number;
  description: string;
}

interface MetricCardProps {
  title: string;
  value: string;
  subtitle: string;
  className?: string;
}

interface CourseCardProps {
  course: Discipline;
  onEdit: () => void;
  onAddGrade: () => void;
  onAddAbsence: () => void;
  onDelete: () => void;
}

const getEventTypeColor = (type: string) => {
  switch (type) {
    case "Prova":
      return "bg-pink-600";
    case "Trabalho":
      return "bg-purple-500";
    case "Projeto":
      return "bg-fuchsia-500";
    case "Aula":
      return "bg-violet-400";
    default:
      return "bg-purple-300";
  }
};

const getEventPriority = (date: Date) => {
  const today = new Date();
  const diffTime = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffTime < 0) return { color: "text-white bg-pink-600", text: "Atrasada" };
  if (diffTime === 0) return { color: "text-white bg-fuchsia-500", text: "Hoje" };
  if (diffTime === 1) return { color: "text-white bg-purple-500", text: "Amanhã" };
  if (diffTime <= 3) return { color: "text-white bg-violet-400", text: "Em breve" };
  return { color: "text-white bg-purple-300", text: "Programada" };
};

const getStatusInfo = (events: CalendarEvent[]) => {
  const today = new Date();
  const overdueEvents = events.filter(event => {
    const eventDate = new Date(event.date);
    return !event.completed && isBefore(eventDate, today);
  });

  const overdueCount = overdueEvents.length;

  if (overdueCount === 0) {
    return {
      status: "Em dia",
      description: "Excelente desempenho",
      className: "bg-purple-400 text-white"
    };
  } else if (overdueCount <= 2) {
    return {
      status: "Atenção",
      description: `${overdueCount} atividade${overdueCount > 1 ? 's' : ''} atrasada${overdueCount > 1 ? 's' : ''}`,
      className: "bg-purple-500 text-white"
    };
  } else if (overdueCount <= 4) {
    return {
      status: "Preocupante",
      description: `${overdueCount} atividades atrasadas`,
      className: "bg-purple-600 text-white"
    };
  } else {
    return {
      status: "Crítico",
      description: `${overdueCount} atividades atrasadas`,
      className: "bg-purple-700 text-white"
    };
  }
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [courses, setCourses] = useState<Discipline[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<Discipline | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingGrade, setIsAddingGrade] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<Discipline | null>(null);
  const [isAddingCourse, setIsAddingCourse] = useState(false);

  const form = useForm<CourseFormData>({
    defaultValues: {
      name: "",
      professor: "",
      credits: 4,
    },
  });

  const gradeForm = useForm<GradeFormData>({
    defaultValues: {
      value: 0,
      description: "",
    },
  });

  const { events, toggleEventComplete } = useEvents();
  const statusInfo = getStatusInfo(events);

  // Carregar disciplinas
  useEffect(() => {
    const loadDisciplines = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        const data = await getDisciplines(user.id);
        setCourses(data);
      } catch (error) {
        console.error('Erro ao carregar disciplinas:', error);
        toast.error('Erro ao carregar disciplinas');
      } finally {
        setIsLoading(false);
      }
    };

    loadDisciplines();
  }, [user]);

  const addCourse = async (data: CourseFormData) => {
    if (!user) return;

    try {
      const newCourse = {
        ...data,
        grade: 0,
        absences: 0,
        progress: 0,
        status: "Em dia",
      };

      const addedCourse = await addDiscipline(user.id, newCourse);
      setCourses(prev => [...prev, addedCourse]);
      form.reset();
      setIsAddingCourse(false);
      toast.success('Disciplina adicionada com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar disciplina:', error);
      toast.error('Erro ao adicionar disciplina');
    }
  };

  const editCourse = async (data: CourseFormData) => {
    if (!selectedCourse) return;

    try {
      const updatedCourse = await updateDiscipline(selectedCourse.id, data);
      setCourses(prev => prev.map(course =>
        course.id === selectedCourse.id ? updatedCourse : course
      ));
      setIsEditing(false);
      form.reset();
      toast.success('Disciplina atualizada com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar disciplina:', error);
      toast.error('Erro ao atualizar disciplina');
    }
  };

  const handleAddGrade = async (data: GradeFormData) => {
    if (!selectedCourse) return;

    try {
      const newGrade = await addGrade({
        discipline_id: selectedCourse.id,
        ...data
      });

      // Atualizar a média da disciplina
      const updatedGrades = [...(selectedCourse.grades || []), newGrade];
      const newAverage = calculateAverageGrade(updatedGrades);

      const updatedCourse = await updateDiscipline(selectedCourse.id, {
        grade: newAverage
      });

      setCourses(prev => prev.map(course =>
        course.id === selectedCourse.id ? updatedCourse : course
      ));

      setIsAddingGrade(false);
      gradeForm.reset();
      toast.success('Nota adicionada com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar nota:', error);
      toast.error('Erro ao adicionar nota');
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    try {
      await deleteDiscipline(courseId);
      setCourses(prev => prev.filter(course => course.id !== courseId));
      setCourseToDelete(null);
      toast.success('Disciplina removida com sucesso!');
    } catch (error) {
      console.error('Erro ao remover disciplina:', error);
      toast.error('Erro ao remover disciplina');
    }
  };

  const handleIncrementAbsences = async (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    if (!course) return;

    try {
      const updatedCourse = await updateDiscipline(courseId, {
        absences: (course.absences || 0) + 1
      });

      // Preservar as grades ao atualizar o estado
      setCourses(prev => prev.map(c =>
        c.id === courseId ? { ...updatedCourse, grades: c.grades } : c
      ));
      toast.success('Falta registrada, meu amor! 🌸');
    } catch (error) {
      console.error('Erro ao registrar falta:', error);
      toast.error('Erro ao registrar falta');
    }
  };

  // Filtra e ordena todos os eventos não concluídos por data
  const sortedActivities = events
    .filter(event => !event.completed)
    .sort((a, b) => compareAsc(new Date(a.date), new Date(b.date)));

  return (
    <div className="container p-6 mx-auto animate-fadeIn">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4 mb-8">
        <MetricCard
          title="Disciplinas"
          value={courses.length.toString()}
          subtitle="1.2 esse semestre"
          className="bg-secondary"
        />
        <MetricCard
          title="Atividades"
          value={sortedActivities.length.toString()}
          subtitle={`Total de atividades pendentes`}
          className="bg-primary text-white"
        />
        <MetricCard
          title="Total de Créditos"
          value={courses.reduce((acc, course) => acc + course.credits, 0).toString()}
          subtitle="Créditos matriculados"
          className="bg-[rgb(230,202,255)]"
        />
        <MetricCard
          title="Status"
          value={statusInfo.status}
          subtitle={statusInfo.description}
          className={statusInfo.className}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Disciplinas do Semestre</h2>
            <Dialog open={isAddingCourse} onOpenChange={setIsAddingCourse}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Disciplina
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adicionar Nova Disciplina</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(addCourse)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome da Disciplina</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Ex: Cálculo I" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="professor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Professor</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Ex: Prof. Dr. Silva" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="credits"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Créditos</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              min="1"
                              max="12"
                              placeholder="Ex: 4"
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full">Adicionar</Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
          <div className="space-y-4">
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onEdit={() => {
                  setSelectedCourse(course);
                  setIsEditing(true);
                  form.reset(course);
                }}
                onAddGrade={() => {
                  setSelectedCourse(course);
                  setIsAddingGrade(true);
                }}
                onAddAbsence={() => handleIncrementAbsences(course.id)}
                onDelete={() => {
                  setCourseToDelete(course);
                }}
              />
            ))}
          </div>
        </div>
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Atividades</h2>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => navigate('/calendar')}
              >
                <CalendarIcon className="w-4 h-4 mr-1" />
                Ver Calendário
              </Button>
            </div>
          </div>
          <div className="space-y-4">
            {sortedActivities.map((activity) => {
              const eventDate = new Date(activity.date);
              const priority = getEventPriority(eventDate);

              return (
                <div
                  key={activity.id}
                  className={cn(
                    "group relative overflow-hidden bg-white rounded-lg border transition-all duration-200",
                    activity.completed
                      ? "border-gray-200 bg-gray-50/50"
                      : "border-gray-200 hover:border-primary hover:shadow-md"
                  )}
                >
                  <div
                    className={cn(
                      "absolute top-0 left-0 w-1 h-full transition-colors duration-200",
                      getEventTypeColor(activity.type)
                    )}
                  />
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className={cn(
                            "font-medium transition-colors duration-200",
                            activity.completed ? "line-through text-gray-500" : "text-gray-900"
                          )}>{activity.title}</h4>
                          <span className={cn(
                            "px-2 py-0.5 rounded-full text-xs font-medium",
                            priority.color
                          )}>{priority.text}</span>
                        </div>
                        <div className="mt-1 space-y-1">
                          {activity.disciplina && (
                            <p className="text-sm text-gray-600 flex items-center">
                              <span className={cn(
                                "w-2 h-2 rounded-full mr-2",
                                getEventTypeColor(activity.type)
                              )} />
                              {activity.disciplina}
                            </p>
                          )}
                          {activity.description && (
                            <p className="text-sm text-gray-500">{activity.description}</p>
                          )}
                          <div className="flex items-center text-sm text-gray-500">
                            <Clock className="w-4 h-4 mr-1" />
                            <span>{format(eventDate, "dd/MM/yyyy")}</span>
                            <span className="mx-2">•</span>
                            <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                              {activity.type}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "h-8 w-8 rounded-full transition-colors duration-200",
                          activity.completed
                            ? "bg-primary/10 hover:bg-primary/20"
                            : "hover:bg-gray-100"
                        )}
                        onClick={() => toggleEventComplete(activity.id)}
                      >
                        <CheckCircle2 className={cn(
                          "h-4 w-4 transition-colors duration-200",
                          activity.completed ? "text-primary" : "text-gray-400 group-hover:text-gray-600"
                        )} />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
            {sortedActivities.length === 0 && (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-4">
                  <CalendarIcon className="w-6 h-6 text-gray-500" />
                </div>
                <p className="text-sm text-gray-500">
                  Nenhuma atividade pendente
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Adicione novas atividades no calendário
                </p>
              </div>
            )}
          </div>
          <div className="mt-6">
            <Calendar
              mode="single"
              className="rounded-md border shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Dialog de Edição */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Disciplina</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(editCourse)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Disciplina</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="professor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Professor</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="credits"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Créditos</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min="1"
                        max="12"
                        placeholder="Ex: 4"
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">Salvar Alterações</Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Dialog de Adicionar Nota */}
      <Dialog open={isAddingGrade} onOpenChange={setIsAddingGrade}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Nova Nota</DialogTitle>
          </DialogHeader>
          <Form {...gradeForm}>
            <form onSubmit={gradeForm.handleSubmit(handleAddGrade)} className="space-y-4">
              <FormField
                control={gradeForm.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nota</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min="0"
                        max="10"
                        step="0.1"
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={gradeForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ex: Prova 1" />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">Adicionar Nota</Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação de Exclusão */}
      <Dialog open={!!courseToDelete} onOpenChange={() => setCourseToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Tem certeza que deseja excluir a disciplina "{courseToDelete?.name}"?</p>
            <p className="text-sm text-gray-500">Esta ação não pode ser desfeita.</p>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setCourseToDelete(null)}>
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={() => courseToDelete && handleDeleteCourse(courseToDelete.id)}
              >
                Excluir
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const MetricCard = ({ title, value, subtitle, className = "" }: MetricCardProps) => (
  <div className={`p-6 rounded-xl ${className}`}>
    <h3 className="text-sm font-medium mb-2">{title}</h3>
    <p className="text-3xl font-bold mb-1">{value}</p>
    <p className="text-sm opacity-80">{subtitle}</p>
  </div>
);

const CourseCard = ({ course, onEdit, onAddGrade, onAddAbsence, onDelete }: CourseCardProps) => (
  <div className="p-6 bg-white rounded-xl border border-gray-200 hover:border-primary transition-colors">
    <div className="flex justify-between items-start mb-4">
      <div>
        <h3 className="text-lg font-semibold">{course.name}</h3>
        <p className="text-sm text-gray-600">{course.professor}</p>
      </div>
      <div className="text-right">
        <p className="text-lg font-bold">Nota: {course.grade}</p>
        <p className="text-sm text-gray-600">{course.status}</p>
      </div>
    </div>
    <Progress
      value={(course.grade / 10) * 100}
      className={cn(
        "mb-2",
        course.grade < 5 ? "[&>div]:bg-red-500" : "[&>div]:bg-primary"
      )}
    />
    <div className="flex justify-between items-center mt-4">
      <div className="text-sm text-gray-600">
        <p>Faltas: {course.absences}</p>
        <p>{course.progress}% concluído</p>
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onAddAbsence}
          className="flex items-center"
        >
          +1 Falta
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onAddGrade}
          className="flex items-center"
        >
          Nova Nota
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onEdit}
          className="flex items-center justify-center w-9 h-9 p-0"
        >
          <Edit2 className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onDelete}
          className="flex items-center justify-center w-9 h-9 p-0 border-red-200 hover:border-red-400 hover:bg-red-50"
          aria-label="Excluir disciplina"
        >
          <Trash className="w-4 h-4 text-red-500" />
        </Button>
      </div>
    </div>
    {course.grades && course.grades.length > 0 && (
      <div className="mt-4 border-t pt-4">
        <h4 className="text-sm font-semibold mb-2">Histórico de Notas</h4>
        <div className="space-y-2">
          {course.grades.map((grade) => (
            <div key={grade.id} className="flex justify-between text-sm">
              <span>{grade.description}</span>
              <span className="font-medium">{grade.value}</span>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
);

export default Dashboard;
