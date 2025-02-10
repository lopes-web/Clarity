import { useState } from "react";
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
import { format, isFuture, compareAsc, startOfWeek, endOfWeek, isWithinInterval, startOfDay, isAfter } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

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

const getEventTypeColor = (type: string) => {
  switch (type) {
    case "Prova":
      return "bg-red-500";
    case "Trabalho":
      return "bg-blue-500";
    case "Projeto":
      return "bg-purple-500";
    case "Aula":
      return "bg-green-500";
    default:
      return "bg-gray-500";
  }
};

const getEventPriority = (date: Date) => {
  const today = new Date();
  const diffTime = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffTime === 0) return { color: "text-red-500", text: "Hoje" };
  if (diffTime === 1) return { color: "text-orange-500", text: "Amanhã" };
  if (diffTime <= 3) return { color: "text-yellow-500", text: "Em breve" };
  return { color: "text-gray-500", text: "Programado" };
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([
    {
      id: 1,
      name: "Cálculo I",
      professor: "Prof. Dr. Silva",
      grade: 8.5,
      absences: 2,
      progress: 75,
      status: "Em dia",
      credits: 4,
      grades: [{ id: 1, value: 8.5, description: "Prova 1" }],
    },
    {
      id: 2,
      name: "Física Básica",
      professor: "Prof. Dra. Santos",
      grade: 7.5,
      absences: 1,
      progress: 60,
      status: "Atenção",
      credits: 6,
      grades: [{ id: 1, value: 7.5, description: "Prova 1" }],
    },
    {
      id: 3,
      name: "Programação",
      professor: "Prof. Dr. Costa",
      grade: 9.0,
      absences: 0,
      progress: 85,
      status: "Em dia",
      credits: 4,
      grades: [{ id: 1, value: 9.0, description: "Prova 1" }],
    },
  ]);

  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingGrade, setIsAddingGrade] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
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

  // Filtra eventos da semana atual (não concluídos)
  const thisWeekEvents = events.filter(event => {
    const eventDate = new Date(event.date);
    const today = new Date();
    const weekStart = startOfWeek(today, { locale: ptBR });
    const weekEnd = endOfWeek(today, { locale: ptBR });
    
    return !event.completed && isWithinInterval(eventDate, { start: weekStart, end: weekEnd });
  });

  // Filtra e ordena os próximos eventos (não concluídos)
  const upcomingActivities = events
    .filter(event => {
      const eventDate = new Date(event.date);
      const today = startOfDay(new Date()); // Início do dia atual
      return !event.completed && (isAfter(eventDate, today) || format(eventDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd'));
    })
    .sort((a, b) => compareAsc(new Date(a.date), new Date(b.date)))
    .slice(0, 5);

  const addCourse = (data: CourseFormData) => {
    const newCourse: Course = {
      id: courses.length + 1,
      ...data,
      grade: 0,
      absences: 0,
      progress: 0,
      status: "Em dia",
      grades: [],
    };
    setCourses([...courses, newCourse]);
    form.reset();
    setIsAddingCourse(false);
  };

  const editCourse = (data: CourseFormData) => {
    if (!selectedCourse) return;
    const updatedCourses = courses.map((course) =>
      course.id === selectedCourse.id
        ? {
            ...course,
            ...data,
          }
        : course
    );
    setCourses(updatedCourses);
    setIsEditing(false);
    form.reset();
  };

  const addGrade = (data: GradeFormData) => {
    if (!selectedCourse) return;
    const newGrade = {
      id: selectedCourse.grades.length + 1,
      ...data,
    };
    
    const updatedCourses = courses.map((course) =>
      course.id === selectedCourse.id
        ? {
            ...course,
            grades: [...course.grades, newGrade],
            grade: calculateAverageGrade([...course.grades, newGrade]),
          }
        : course
    );
    
    setCourses(updatedCourses);
    setIsAddingGrade(false);
    gradeForm.reset();
  };

  const calculateAverageGrade = (grades: { value: number }[]) => {
    if (grades.length === 0) return 0;
    const sum = grades.reduce((acc, grade) => acc + grade.value, 0);
    return Number((sum / grades.length).toFixed(1));
  };

  const deleteCourse = (courseId: number) => {
    setCourses(courses.filter(course => course.id !== courseId));
    setCourseToDelete(null);
  };

  const incrementAbsences = (courseId: number) => {
    const updatedCourses = courses.map((course) =>
      course.id === courseId
        ? {
            ...course,
            absences: course.absences + 1,
          }
        : course
    );
    setCourses(updatedCourses);
  };

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
          title="Próximas Atividades"
          value={thisWeekEvents.length.toString()}
          subtitle={`Esta semana (${format(startOfWeek(new Date(), { locale: ptBR }), "dd/MM")} - ${format(endOfWeek(new Date(), { locale: ptBR }), "dd/MM")})`}
          className="bg-primary text-white"
        />
        <MetricCard
          title="Total de Créditos"
          value={courses.reduce((acc, course) => acc + course.credits, 0).toString()}
          subtitle="Créditos matriculados"
          className="bg-secondary-hover"
        />
        <MetricCard
          title="Status"
          value="Em dia"
          subtitle="Bom desempenho"
          className="bg-primary text-white"
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
                onAddAbsence={() => incrementAbsences(course.id)}
                onDelete={() => {
                  setCourseToDelete(course);
                }}
              />
            ))}
          </div>
        </div>
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Próximas Atividades</h2>
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
            {upcomingActivities.map((activity) => {
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
                  <div className="absolute top-0 left-0 w-1 h-full transition-colors duration-200"
                    className={cn(getEventTypeColor(activity.type))} />
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
                            <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full">
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
            {upcomingActivities.length === 0 && (
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
            <form onSubmit={gradeForm.handleSubmit(addGrade)} className="space-y-4">
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
                onClick={() => courseToDelete && deleteCourse(courseToDelete.id)}
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

const MetricCard = ({ title, value, subtitle, className = "" }) => (
  <div className={`p-6 rounded-xl ${className}`}>
    <h3 className="text-sm font-medium mb-2">{title}</h3>
    <p className="text-3xl font-bold mb-1">{value}</p>
    <p className="text-sm opacity-80">{subtitle}</p>
  </div>
);

const CourseCard = ({ course, onEdit, onAddGrade, onAddAbsence, onDelete }) => (
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
    {course.grades.length > 0 && (
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
