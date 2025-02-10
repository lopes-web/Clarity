import { useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Plus, Edit2, Trash } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Calendar } from "@/components/ui/calendar";

interface Course {
  id: number;
  name: string;
  professor: string;
  grade: number;
  absences: number;
  progress: number;
  status: string;
  grades: { id: number; value: number; description: string }[];
}

interface CourseFormData {
  name: string;
  professor: string;
  grade: number;
  absences: number;
}

interface GradeFormData {
  value: number;
  description: string;
}

const Dashboard = () => {
  const [courses, setCourses] = useState<Course[]>([
    {
      id: 1,
      name: "Cálculo I",
      professor: "Prof. Dr. Silva",
      grade: 8.5,
      absences: 2,
      progress: 75,
      status: "Em dia",
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
      grades: [{ id: 1, value: 9.0, description: "Prova 1" }],
    },
  ]);

  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingGrade, setIsAddingGrade] = useState(false);

  const form = useForm<CourseFormData>({
    defaultValues: {
      name: "",
      professor: "",
      grade: 0,
      absences: 0,
    },
  });

  const gradeForm = useForm<GradeFormData>({
    defaultValues: {
      value: 0,
      description: "",
    },
  });

  const addCourse = (data: CourseFormData) => {
    const newCourse: Course = {
      id: courses.length + 1,
      ...data,
      progress: 0,
      status: "Em dia",
      grades: [],
    };
    setCourses([...courses, newCourse]);
    form.reset();
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

  const upcomingActivities = [
    {
      id: 1,
      title: "Prova de Cálculo",
      course: "Cálculo I",
      date: "14/03/2024",
      type: "Prova",
    },
    {
      id: 2,
      title: "Trabalho de Física",
      course: "Física Básica",
      date: "17/03/2024",
      type: "Trabalho",
    },
    {
      id: 3,
      title: "Projeto Final",
      course: "Programação",
      date: "19/03/2024",
      type: "Projeto",
    },
  ];

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
          value="3"
          subtitle="Esta semana"
          className="bg-primary text-white"
        />
        <MetricCard
          title="Média Geral"
          value={(courses.reduce((acc, course) => acc + course.grade, 0) / courses.length).toFixed(1)}
          subtitle="+0.3 vs último período"
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
            <Dialog>
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
                      name="grade"
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
                      control={form.control}
                      name="absences"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Faltas</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              min="0"
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
                onDelete={() => deleteCourse(course.id)}
              />
            ))}
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-semibold mb-4">Próximas Atividades</h2>
          <div className="space-y-4">
            {upcomingActivities.map((activity) => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
          </div>
          <div className="mt-6">
            <Calendar
              mode="single"
              className="rounded-md border"
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
                name="grade"
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
                control={form.control}
                name="absences"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Faltas</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min="0"
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
    <Progress value={course.progress} className="mb-2" />
    <div className="flex justify-between items-center mt-4">
      <div className="text-sm text-gray-600">
        <p>Faltas: {course.absences}</p>
        <p>{course.progress}% concluído</p>
      </div>
      <div className="space-x-2">
        <Button variant="outline" size="sm" onClick={onAddAbsence}>
          +1 Falta
        </Button>
        <Button variant="outline" size="sm" onClick={onAddGrade}>
          Nova Nota
        </Button>
        <Button variant="outline" size="sm" onClick={onEdit}>
          <Edit2 className="w-4 h-4" />
        </Button>
        <Button 
          variant="destructive" 
          size="sm" 
          onClick={onDelete}
          aria-label="Excluir disciplina"
        >
          <Trash className="w-4 h-4" />
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

const ActivityCard = ({ activity }) => (
  <div className="p-4 bg-white rounded-lg border border-gray-200 hover:border-primary transition-colors">
    <div className="flex justify-between items-start">
      <div>
        <h4 className="font-medium">{activity.title}</h4>
        <p className="text-sm text-gray-600">{activity.course}</p>
      </div>
      <div className="text-right">
        <p className="text-sm font-medium">{activity.date}</p>
        <p className="text-xs text-primary">{activity.type}</p>
      </div>
    </div>
  </div>
);

export default Dashboard;
