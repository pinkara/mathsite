import { useState, useRef } from 'react';
import { 
  Lock, 
  LogOut, 
  BookOpen, 
  Puzzle, 
  Calculator, 
  Library,
  Plus,
  CheckCircle,
  Trash2,
  Edit2,
  Save,
  X,
  Upload,
  TrendingUp,
  Users,
  Eye,
  BarChart3,
  Loader2,
  AlertTriangle,
  Clock,
  Calendar,
  Target,
  ExternalLink,
  Lightbulb,
  Music,
  Triangle,
  Edit3,
  Grid3x3,
  Hash,
  Layers,
  Activity,
  Cpu,
  Globe,
  Infinity,
  GitBranch,
  Award,
  BrainCircuit,
  User,
  History,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { LevelBadge, DifficultyBadge } from '@/components/LevelBadge';
import { TitleWithFormula } from '@/components/InlineFormula';
import { MathInput } from '@/components/MathInput';
import { MathToolbar } from '@/components/MathToolbar';
import { ToolbarButtonSelector } from '@/components/ToolbarButtonSelector';
import type { Course, Problem, Formula, Book, Level, MonthlyStats, TimelineEvent, SubjectType, ProblemAnswerField, ArenaContent } from '@/types';
import type { MathInputRef } from '@/components/MathInput';
import { LEVELS } from '@/types';
import { WORLDS, type WorldId } from '@/lib/worldsConfig';
import { uploadImage } from '@/lib/supabase';

interface AdminPageProps {
  isAdmin: boolean;
  onLogin: (password: string) => boolean;
  onLogout: () => void;
  courses: Course[];
  problems: Problem[];
  formulas: Formula[];
  books: Book[];
  monthlyStats: MonthlyStats[];
  timelineEvents: TimelineEvent[];
  arenaContents: ArenaContent[];
  onAddCourse: (course: Omit<Course, 'id' | 'type' | 'date'>) => void;
  onUpdateCourse: (id: string, updates: Partial<Course>) => void;
  onRemoveCourse: (id: string) => void;
  onAddProblem: (problem: Omit<Problem, 'id' | 'type' | 'date'>) => void;
  onUpdateProblem: (id: string, updates: Partial<Problem>) => void;
  onRemoveProblem: (id: string) => void;
  onAddFormula: (formula: Omit<Formula, 'id'>) => void;
  onUpdateFormula: (id: string, updates: Partial<Formula>) => void;
  onRemoveFormula: (id: string) => void;
  onAddTimelineEvent: (event: Omit<TimelineEvent, 'id'>) => void;
  onUpdateTimelineEvent: (id: string, updates: Partial<TimelineEvent>) => void;
  onRemoveTimelineEvent: (id: string) => void;
  onAddArenaContent: (content: Omit<ArenaContent, 'id'>) => void;
  onUpdateArenaContent: (id: string, updates: Partial<ArenaContent>) => void;
  onRemoveArenaContent: (id: string) => void;
}

// === FORMULAIRE DE CONNEXION ===
function LoginForm({ onLogin }: { onLogin: (password: string) => boolean }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onLogin(password)) {
      setError(true);
      setTimeout(() => setError(false), 3000);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Accès Administrateur
          </h1>
          <p className="text-gray-600">
            Veuillez entrer le mot de passe pour accéder au panel d'administration
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={cn(error && 'border-red-500 ring-1 ring-red-500')}
            />
          </div>
          
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
              Mot de passe incorrect
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600"
          >
            Se connecter
          </Button>
        </form>
      </div>
    </div>
  );
}

// === STATISTIQUES ===
function StatsPanel({ 
  courses, 
  problems, 
  formulas, 
  books, 
  monthlyStats 
}: { 
  courses: Course[]; 
  problems: Problem[]; 
  formulas: Formula[]; 
  books: Book[];
  monthlyStats: MonthlyStats[];
}) {
  const totalVisits = monthlyStats.reduce((sum, s) => sum + s.visits, 0);
  const currentMonth = monthlyStats[monthlyStats.length - 1];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-blue-700">{courses.length}</div>
          <div className="text-sm text-blue-600">Cours</div>
        </div>

        <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Puzzle className="w-5 h-5 text-orange-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-orange-700">{problems.length}</div>
          <div className="text-sm text-orange-600">Problèmes</div>
        </div>

        <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Calculator className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-purple-700">{formulas.length}</div>
          <div className="text-sm text-purple-600">Formules</div>
        </div>

        <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Library className="w-5 h-5 text-indigo-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-indigo-700">{books.length}</div>
          <div className="text-sm text-indigo-600">Livres</div>
        </div>
      </div>

      {/* Visits Stats */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Statistiques de visite
        </h3>
        
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <Eye className="w-4 h-4" />
              <span className="text-sm">Total des visites</span>
            </div>
            <div className="text-3xl font-bold text-gray-800">{totalVisits}</div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm">Ce mois</span>
            </div>
            <div className="text-3xl font-bold text-gray-800">
              {currentMonth?.visits || 0}
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <Users className="w-4 h-4" />
              <span className="text-sm">Visiteurs uniques (mois)</span>
            </div>
            <div className="text-3xl font-bold text-gray-800">
              {currentMonth?.uniqueVisitors || 0}
            </div>
          </div>
        </div>

        {/* Monthly History */}
        {monthlyStats.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-600 mb-3">Historique mensuel</h4>
            <div className="space-y-2">
              {[...monthlyStats].reverse().slice(0, 6).map(stat => (
                <div key={stat.month} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-700">
                    {new Date(stat.month + '-01').toLocaleDateString('fr-FR', { 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </span>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-500">{stat.visits} visites</span>
                    <span className="text-gray-400">{stat.pageViews} pages vues</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// === GESTION DES COURS ===
function CoursesManager({ 
  courses, 
  onAdd, 
  onUpdate, 
  onRemove 
}: { 
  courses: Course[]; 
  onAdd: (course: Omit<Course, 'id' | 'type' | 'date'>) => void;
  onUpdate: (id: string, updates: Partial<Course>) => void;
  onRemove: (id: string) => void;
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; title: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<{
    title: string;
    category: string;
    level: Level;
    description: string;
    content: string;
    image: string;
    imageCredits: string;
    categoryColor: string;
    categoryTextColor: string;
    subjectType: SubjectType;
  }>({
    title: '',
    category: '',
    level: 'Term',
    description: '',
    content: '',
    image: '',
    imageCredits: '',
    categoryColor: '#f0f9ff',
    categoryTextColor: '#0284c7',
    subjectType: 'academic',
  });

  const resetForm = () => {
    setFormData({
      title: '',
      category: '',
      level: 'Term',
      description: '',
      content: '',
      image: '',
      imageCredits: '',
      categoryColor: '#f0f9ff',
      categoryTextColor: '#0284c7',
      subjectType: 'academic',
    });
  };

  const handleSubmit = () => {
    if (formData.title && formData.category && formData.description && formData.content) {
      if (editingId) {
        onUpdate(editingId, formData);
        setEditingId(null);
      } else {
        onAdd(formData);
      }
      resetForm();
      setIsAdding(false);
    }
  };

  const startEdit = (course: Course) => {
    setFormData({
      title: course.title,
      category: course.category,
      level: course.level,
      description: course.description,
      content: course.content,
      image: course.image || '',
      imageCredits: course.imageCredits || '',
      categoryColor: course.categoryColor || '#f0f9ff',
      categoryTextColor: course.categoryTextColor || '#0284c7',
      subjectType: course.subjectType || 'academic',
    });
    setEditingId(course.id);
    setIsAdding(true);
  };

  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        // Essayer d'uploader vers Supabase d'abord
        const uploadedUrl = await uploadImage(file, 'courses');
        if (uploadedUrl) {
          setFormData(prev => ({ ...prev, image: uploadedUrl }));
        } else {
          // Fallback: utiliser une URL locale temporaire
          const url = URL.createObjectURL(file);
          setFormData(prev => ({ ...prev, image: url }));
        }
      } catch (error) {
        console.error('Error uploading image:', error);
        const url = URL.createObjectURL(file);
        setFormData(prev => ({ ...prev, image: url }));
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Add/Edit Form */}
      {(isAdding || editingId) && (
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
          <h3 className="font-bold text-gray-800 mb-4">
            {editingId ? 'Modifier le cours' : 'Ajouter un nouveau cours'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Titre du cours"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie *</label>
              <Input
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                placeholder="ex: Analyse"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Niveau *</label>
              <select
                value={formData.level}
                onChange={(e) => setFormData(prev => ({ ...prev, level: e.target.value as Level }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                {LEVELS.map(level => (
                  <option key={level.name} value={level.name}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type de contenu</label>
              <select
                value={formData.subjectType}
                onChange={(e) => setFormData(prev => ({ ...prev, subjectType: e.target.value as SubjectType }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="academic">Programme scolaire</option>
                <option value="exotic">Olympiades & hors programme</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1"
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4 mr-2" />
                  )}
                  {isUploading ? 'Upload...' : formData.image ? 'Changer l\'image' : 'Ajouter une image'}
                </Button>
              </div>
              {formData.image && (
                <>
                  <img src={formData.image} alt="Preview" className="mt-2 h-20 rounded-lg object-cover" />
                  <Input
                    value={formData.imageCredits}
                    onChange={(e) => setFormData(prev => ({ ...prev, imageCredits: e.target.value }))}
                    placeholder="Crédits de l'image (ex: © Auteur - Source)"
                    className="mt-2 text-sm"
                  />
                </>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Description du cours"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                rows={2}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Contenu (HTML/MathJax) *</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="<p>Contenu du cours...</p>"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                rows={6}
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700">
              <Save className="w-4 h-4 mr-2" />
              {editingId ? 'Enregistrer' : 'Ajouter'}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsAdding(false);
                setEditingId(null);
                resetForm();
              }}
            >
              <X className="w-4 h-4 mr-2" />
              Annuler
            </Button>
          </div>
        </div>
      )}

      {/* Add Button */}
      {!isAdding && !editingId && (
        <Button onClick={() => setIsAdding(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Ajouter un cours
        </Button>
      )}

      {/* Courses List */}
      <div className="space-y-3">
        {courses.map(course => (
          <div key={course.id} className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <LevelBadge level={course.level} size="sm" />
                  <span 
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{ 
                      backgroundColor: course.categoryColor || '#f0f9ff',
                      color: course.categoryTextColor || '#0284c7'
                    }}
                  >
                    {course.category}
                  </span>
                  <span className="text-xs text-gray-400">{course.date}</span>
                </div>
                <h4 className="font-medium text-gray-800"><TitleWithFormula text={course.title} /></h4>
                <p className="text-sm text-gray-600 line-clamp-1">{course.description}</p>
              </div>
              <div className="flex items-center gap-1 ml-4">
                <button
                  onClick={() => startEdit(course)}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteConfirm({ id: course.id, title: course.title })}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Dialog de confirmation de suppression */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Confirmer la suppression
            </DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer le cours <strong>"{deleteConfirm?.title}"</strong> ?
              <br />
              Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-row gap-2 justify-end mt-4">
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Annuler
            </Button>
            <Button 
              variant="destructive"
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => {
                if (deleteConfirm) {
                  onRemove(deleteConfirm.id);
                  setDeleteConfirm(null);
                }
              }}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// === GESTION DES PROBLÈMES ===
function ProblemsManager({ 
  problems, 
  onAdd, 
  onUpdate, 
  onRemove 
}: { 
  problems: Problem[]; 
  onAdd: (problem: Omit<Problem, 'id' | 'type' | 'date'>) => void;
  onUpdate: (id: string, updates: Partial<Problem>) => void;
  onRemove: (id: string) => void;
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; title: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState<{
    title: string;
    category: string;
    level: Level;
    difficulty: 'Facile' | 'Moyen' | 'Difficile';
    description: string;
    content: string;
    solution: string;
    answer: string;
    answerFields: ProblemAnswerField[];
    image: string;
    imageCredits: string;
    hints: { id: string; content: string; formulaRefs: string[] }[];
    subjectType: SubjectType;
  }>({
    title: '',
    category: '',
    level: 'Term',
    difficulty: 'Moyen',
    description: '',
    content: '',
    solution: '',
    answer: '',
    answerFields: [],
    image: '',
    imageCredits: '',
    hints: [],
    subjectType: 'academic',
  });

  const [newHint, setNewHint] = useState({ content: '', formulaRefs: '' });
  const [formError, setFormError] = useState<string | null>(null);

  const resetForm = () => {
    setFormError(null);
    setFormData({
      title: '',
      category: '',
      level: 'Term',
      difficulty: 'Moyen',
      description: '',
      content: '',
      solution: '',
      answer: '',
      answerFields: [],
      image: '',
      imageCredits: '',
      hints: [],
      subjectType: 'academic',
    });
    setNewHint({ content: '', formulaRefs: '' });
  };

  const handleSubmit = () => {
    setFormError(null);
    if (!formData.title || !formData.category || !formData.content) {
      setFormError('Veuillez remplir les champs obligatoires : titre, catégorie et énoncé.');
      return;
    }
    console.log('[Admin] Submitting problem:', {
      id: editingId,
      answerFieldsCount: formData.answerFields.length,
      answerFields: formData.answerFields,
    });
    if (editingId) {
      onUpdate(editingId, formData);
      setEditingId(null);
    } else {
      onAdd(formData);
    }
    resetForm();
    setIsAdding(false);
  };

  const startEdit = (problem: Problem) => {
    setFormData({
      title: problem.title,
      category: problem.category,
      level: problem.level,
      difficulty: problem.difficulty,
      description: problem.description,
      content: problem.content,
      solution: problem.solution || '',
      answer: problem.answer || '',
      answerFields: problem.answerFields?.length
        ? problem.answerFields
        : (problem.answerLatex || problem.answer)
          ? [{
              id: 'legacy-1',
              label: 'Réponse',
              latex: problem.answerLatex || problem.answer || '',
              mathJson: problem.answerMathJson || '',
              type: problem.answerType || 'exact',
              allowedButtons: problem.allowedToolbarButtons || [],
            }]
          : [],
      image: problem.image || '',
      imageCredits: problem.imageCredits || '',
      hints: (problem.hints || []).map(h => ({ ...h, formulaRefs: h.formulaRefs || [] })),
      subjectType: problem.subjectType || 'academic',
    });
    setEditingId(problem.id);
    setIsAdding(true);
  };

  const answerFieldRefs = useRef<Record<string, MathInputRef>>({});

  const addAnswerField = () => {
    setFormData(prev => ({
      ...prev,
      answerFields: [
        ...prev.answerFields,
        {
          id: `af-${Date.now()}`,
          label: `Champ ${prev.answerFields.length + 1}`,
          latex: '',
          mathJson: '',
          type: 'exact',
          allowedButtons: [],
        },
      ],
    }));
  };

  const updateAnswerField = (id: string, updates: Partial<ProblemAnswerField>) => {
    setFormData(prev => ({
      ...prev,
      answerFields: prev.answerFields.map(f => (f.id === id ? { ...f, ...updates } : f)),
    }));
  };

  const removeAnswerField = (id: string) => {
    setFormData(prev => ({
      ...prev,
      answerFields: prev.answerFields.filter(f => f.id !== id),
    }));
  };

  const addHint = () => {
    if (newHint.content) {
      setFormData(prev => ({
        ...prev,
        hints: [
          ...prev.hints,
          {
            id: `h${Date.now()}`,
            content: newHint.content,
            formulaRefs: newHint.formulaRefs.split(',').map(s => s.trim()).filter(Boolean),
          }
        ]
      }));
      setNewHint({ content: '', formulaRefs: '' });
    }
  };

  const removeHint = (hintId: string) => {
    setFormData(prev => ({
      ...prev,
      hints: prev.hints.filter(h => h.id !== hintId)
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        // Essayer d'uploader vers Supabase d'abord
        const uploadedUrl = await uploadImage(file, 'problems');
        if (uploadedUrl) {
          setFormData(prev => ({ ...prev, image: uploadedUrl }));
        } else {
          // Fallback: utiliser une URL locale temporaire
          const url = URL.createObjectURL(file);
          setFormData(prev => ({ ...prev, image: url }));
        }
      } catch (error) {
        console.error('Error uploading image:', error);
        const url = URL.createObjectURL(file);
        setFormData(prev => ({ ...prev, image: url }));
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Add/Edit Form */}
      {(isAdding || editingId) && (
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
          <h3 className="font-bold text-gray-800 mb-4">
            {editingId ? 'Modifier le problème' : 'Ajouter un nouveau problème'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Titre du problème"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie *</label>
              <Input
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                placeholder="ex: Analyse"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Niveau *</label>
              <select
                value={formData.level}
                onChange={(e) => setFormData(prev => ({ ...prev, level: e.target.value as Level }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
              >
                {LEVELS.map(level => (
                  <option key={level.name} value={level.name}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Difficulté *</label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value as 'Facile' | 'Moyen' | 'Difficile' }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
              >
                <option value="Facile">Facile</option>
                <option value="Moyen">Moyen</option>
                <option value="Difficile">Difficile</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type de contenu</label>
              <select
                value={formData.subjectType}
                onChange={(e) => setFormData(prev => ({ ...prev, subjectType: e.target.value as SubjectType }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
              >
                <option value="academic">Programme scolaire</option>
                <option value="exotic">Olympiades & hors programme</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1"
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4 mr-2" />
                  )}
                  {isUploading ? 'Upload...' : formData.image ? 'Changer l\'image' : 'Ajouter une image'}
                </Button>
              </div>
              {formData.image && (
                <>
                  <img src={formData.image} alt="Preview" className="mt-2 h-20 rounded-lg object-cover" />
                  <Input
                    value={formData.imageCredits}
                    onChange={(e) => setFormData(prev => ({ ...prev, imageCredits: e.target.value }))}
                    placeholder="Crédits de l'image (ex: © Auteur - Source)"
                    className="mt-2 text-sm"
                  />
                </>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Description du problème"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                rows={2}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Énoncé (MathJax) *</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="$$\\lim_{x \\to 0} \\frac{\\sin(x)}{x} = 1$$"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm font-mono"
                rows={4}
              />
            </div>

            {/* Hints Section */}
            <div className="md:col-span-2 border-t border-gray-200 pt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Indices</label>
              
              {/* Existing Hints */}
              {formData.hints.length > 0 && (
                <div className="space-y-2 mb-4">
                  {formData.hints.map((hint, index) => (
                    <div key={hint.id} className="bg-white p-3 rounded-lg border border-gray-200">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-xs font-medium text-gray-500">Indice {index + 1}</span>
                          <p className="text-sm text-gray-700 mt-1">{hint.content}</p>
                          {hint.formulaRefs.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {hint.formulaRefs.map(ref => (
                                <span key={ref} className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                                  {ref}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => removeHint(hint.id)}
                          className="p-1 text-gray-400 hover:text-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add New Hint */}
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <p className="text-sm font-medium text-gray-700 mb-2">Nouvel indice</p>
                <textarea
                  value={newHint.content}
                  onChange={(e) => setNewHint(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Contenu de l'indice..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm mb-2"
                  rows={2}
                />
                <Input
                  value={newHint.formulaRefs}
                  onChange={(e) => setNewHint(prev => ({ ...prev, formulaRefs: e.target.value }))}
                  placeholder="Codes des formules (séparés par des virgules): DL-SIN-001, INT-001"
                  className="mb-2"
                />
                <Button type="button" variant="outline" size="sm" onClick={addHint}>
                  <Plus className="w-4 h-4 mr-1" />
                  Ajouter l'indice
                </Button>
              </div>
            </div>

            {/* Solution Section */}
            <div className="md:col-span-2 border-t border-gray-200 pt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Solution détaillée
                <span className="text-gray-400 font-normal ml-1">(optionnel)</span>
              </label>
              <textarea
                value={formData.solution}
                onChange={(e) => setFormData(prev => ({ ...prev, solution: e.target.value }))}
                placeholder="Solution complète du problème avec explications..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm font-mono"
                rows={6}
              />
              <p className="text-xs text-gray-500 mt-1">
                Cette solution sera affichée avec une confirmation avant révélation.
              </p>
            </div>

            {/* Answer Fields Section */}
            <div className="md:col-span-2 border-t border-gray-200 pt-4 space-y-4">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">
                  Champs de réponse
                  <span className="text-gray-400 font-normal ml-1">(optionnel)</span>
                </label>
                <Button type="button" variant="outline" size="sm" onClick={addAnswerField}>
                  <Plus className="w-4 h-4 mr-1" />
                  Ajouter un champ
                </Button>
              </div>

              {formData.answerFields.length === 0 && (
                <p className="text-sm text-gray-500">
                  Aucun champ de réponse. Ajoute-en un ou laisse vide pour permettre une validation manuelle.
                </p>
              )}

              {formData.answerFields.map((field, index) => (
                <div key={field.id} className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Input
                      value={field.label}
                      onChange={(e) => updateAnswerField(field.id, { label: e.target.value })}
                      placeholder={`Label du champ ${index + 1}`}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeAnswerField(field.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <MathInput
                    ref={(el) => { if (el) answerFieldRefs.current[field.id] = el; }}
                    value={field.latex}
                    onChange={(latex, mathJson) => updateAnswerField(field.id, { latex, mathJson })}
                    placeholder="Réponse attendue en LaTeX..."
                  />

                  <MathToolbar
                    onInsert={(latex) => answerFieldRefs.current[field.id]?.insert(latex)}
                    allowedButtons={field.allowedButtons}
                    className="bg-gray-50 rounded-lg p-3 border border-gray-100"
                  />

                  <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-600">Vérification :</label>
                    <select
                      value={field.type}
                      onChange={(e) => updateAnswerField(field.id, { type: e.target.value as 'exact' | 'numeric' | 'symbolic' })}
                      className="text-xs border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="exact">Exacte (LaTeX)</option>
                      <option value="numeric">Numérique (centième)</option>
                      <option value="symbolic">Symbolique</option>
                    </select>
                  </div>

                  <ToolbarButtonSelector
                    selected={field.allowedButtons || []}
                    onChange={(selected) => updateAnswerField(field.id, { allowedButtons: selected })}
                  />
                </div>
              ))}
            </div>
          </div>
          {formError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              {formError}
            </div>
          )}

          {formData.answerFields.length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              {formData.answerFields.length} champ(s) de réponse prêt(s) à être enregistré(s)
            </div>
          )}

          <div className="flex gap-2 mt-4">
            <Button onClick={handleSubmit} className="bg-orange-600 hover:bg-orange-700">
              <Save className="w-4 h-4 mr-2" />
              {editingId ? 'Enregistrer' : 'Ajouter'}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsAdding(false);
                setEditingId(null);
                resetForm();
              }}
            >
              <X className="w-4 h-4 mr-2" />
              Annuler
            </Button>
          </div>
        </div>
      )}

      {/* Add Button */}
      {!isAdding && !editingId && (
        <Button onClick={() => setIsAdding(true)} className="bg-orange-600 hover:bg-orange-700">
          <Plus className="w-4 h-4 mr-2" />
          Ajouter un problème
        </Button>
      )}

      {/* Problems List */}
      <div className="space-y-3">
        {problems.map(problem => (
          <div key={problem.id} className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <LevelBadge level={problem.level} size="sm" />
                  <DifficultyBadge difficulty={problem.difficulty} size="sm" />
                  <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded">
                    {problem.category}
                  </span>
                </div>
                <h4 className="font-medium text-gray-800"><TitleWithFormula text={problem.title} /></h4>
                <p className="text-sm text-gray-600 line-clamp-1">{problem.description}</p>
                {problem.hints && problem.hints.length > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    {problem.hints.length} indice{problem.hints.length > 1 ? 's' : ''}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1 ml-4">
                <button
                  onClick={() => startEdit(problem)}
                  className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteConfirm({ id: problem.id, title: problem.title })}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Dialog de confirmation de suppression */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Confirmer la suppression
            </DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer le problème <strong>"{deleteConfirm?.title}"</strong> ?
              <br />
              Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-row gap-2 justify-end mt-4">
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Annuler
            </Button>
            <Button 
              variant="destructive"
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => {
                if (deleteConfirm) {
                  onRemove(deleteConfirm.id);
                  setDeleteConfirm(null);
                }
              }}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// === GESTION DES FORMULES ===
function FormulasManager({ 
  formulas, 
  onAdd, 
  onUpdate, 
  onRemove 
}: { 
  formulas: Formula[]; 
  onAdd: (formula: Omit<Formula, 'id'>) => void;
  onUpdate: (id: string, updates: Partial<Formula>) => void;
  onRemove: (id: string) => void;
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    tex: '',
    category: '',
    level: 'Term' as Level,
    description: '',
    code: '',
  });

  const resetForm = () => {
    setFormData({
      name: '',
      tex: '',
      category: '',
      level: 'Term',
      description: '',
      code: '',
    });
  };

  const handleSubmit = () => {
    if (formData.name && formData.tex && formData.category && formData.code) {
      if (editingId) {
        onUpdate(editingId, formData);
        setEditingId(null);
      } else {
        onAdd(formData);
      }
      resetForm();
      setIsAdding(false);
    }
  };

  const startEdit = (formula: Formula) => {
    setFormData({
      name: formula.name,
      tex: formula.tex,
      category: formula.category,
      level: formula.level,
      description: formula.description || '',
      code: formula.code,
    });
    setEditingId(formula.id);
    setIsAdding(true);
  };

  return (
    <div className="space-y-6">
      {/* Add/Edit Form */}
      {(isAdding || editingId) && (
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
          <h3 className="font-bold text-gray-800 mb-4">
            {editingId ? 'Modifier la formule' : 'Ajouter une nouvelle formule'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nom de la formule"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Code unique *</label>
              <Input
                value={formData.code}
                onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                placeholder="ex: DL-SIN-001"
                className="font-mono"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie *</label>
              <Input
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                placeholder="ex: Développements Limités"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Niveau *</label>
              <select
                value={formData.level}
                onChange={(e) => setFormData(prev => ({ ...prev, level: e.target.value as Level }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
              >
                {LEVELS.map(level => (
                  <option key={level.name} value={level.name}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Formule LaTeX *</label>
              <Input
                value={formData.tex}
                onChange={(e) => setFormData(prev => ({ ...prev, tex: e.target.value }))}
                placeholder="e^{i\\pi} + 1 = 0"
                className="font-mono"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Description de la formule..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                rows={2}
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button onClick={handleSubmit} className="bg-purple-600 hover:bg-purple-700">
              <Save className="w-4 h-4 mr-2" />
              {editingId ? 'Enregistrer' : 'Ajouter'}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsAdding(false);
                setEditingId(null);
                resetForm();
              }}
            >
              <X className="w-4 h-4 mr-2" />
              Annuler
            </Button>
          </div>
        </div>
      )}

      {/* Add Button */}
      {!isAdding && !editingId && (
        <Button onClick={() => setIsAdding(true)} className="bg-purple-600 hover:bg-purple-700">
          <Plus className="w-4 h-4 mr-2" />
          Ajouter une formule
        </Button>
      )}

      {/* Formulas List */}
      <div className="space-y-3">
        {formulas.map(formula => (
          <div key={formula.id} className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <LevelBadge level={formula.level} size="sm" />
                  <span className="text-xs font-mono bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                    {formula.code}
                  </span>
                  <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                    {formula.category}
                  </span>
                </div>
                <h4 className="font-medium text-gray-800">{formula.name}</h4>
                <div className="text-gray-600 font-mono mt-1">${formula.tex}$</div>
              </div>
              <div className="flex items-center gap-1 ml-4">
                <button
                  onClick={() => startEdit(formula)}
                  className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteConfirm({ id: formula.id, name: formula.name })}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Dialog de confirmation de suppression */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Confirmer la suppression
            </DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer la formule <strong>"{deleteConfirm?.name}"</strong> ?
              <br />
              Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-row gap-2 justify-end mt-4">
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Annuler
            </Button>
            <Button 
              variant="destructive"
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => {
                if (deleteConfirm) {
                  onRemove(deleteConfirm.id);
                  setDeleteConfirm(null);
                }
              }}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// === GESTION DE LA TIMELINE ===
function TimelineManager({
  events,
  courses,
  problems,
  onAdd,
  onUpdate,
  onRemove,
}: {
  events: TimelineEvent[];
  courses: Course[];
  problems: Problem[];
  onAdd: (event: Omit<TimelineEvent, 'id'>) => void;
  onUpdate: (id: string, updates: Partial<TimelineEvent>) => void;
  onRemove: (id: string) => void;
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; title: string } | null>(null);

  const colorOptions = [
    { value: 'blue', label: 'Bleu' },
    { value: 'purple', label: 'Violet' },
    { value: 'green', label: 'Vert' },
    { value: 'orange', label: 'Orange' },
    { value: 'pink', label: 'Rose' },
    { value: 'cyan', label: 'Cyan' },
    { value: 'red', label: 'Rouge' },
    { value: 'amber', label: 'Ambre' },
  ];

  const iconOptions = [
    { value: 'BookOpen', label: 'Cours', icon: BookOpen },
    { value: 'Puzzle', label: 'Problème', icon: Puzzle },
    { value: 'Calculator', label: 'Calcul', icon: Calculator },
    { value: 'TrendingUp', label: 'Progression', icon: TrendingUp },
    { value: 'Target', label: 'Objectif', icon: Target },
    { value: 'Clock', label: 'Temps', icon: Clock },
    { value: 'Calendar', label: 'Calendrier', icon: Calendar },
    { value: 'Lightbulb', label: 'Idée', icon: Lightbulb },
    { value: 'Music', label: 'Musique', icon: Music },
    { value: 'Triangle', label: 'Triangle', icon: Triangle },
    { value: 'Edit3', label: 'Écriture', icon: Edit3 },
    { value: 'Grid3x3', label: 'Grille', icon: Grid3x3 },
    { value: 'Hash', label: 'Nombre', icon: Hash },
    { value: 'Layers', label: 'Couches', icon: Layers },
    { value: 'Activity', label: 'Activité', icon: Activity },
    { value: 'Cpu', label: 'Informatique', icon: Cpu },
    { value: 'Globe', label: 'Globe', icon: Globe },
    { value: 'Infinity', label: 'Infini', icon: Infinity },
    { value: 'Users', label: 'Groupe', icon: Users },
    { value: 'GitBranch', label: 'Branche', icon: GitBranch },
    { value: 'Award', label: 'Prix', icon: Award },
    { value: 'BrainCircuit', label: 'IA', icon: BrainCircuit },
    { value: 'User', label: 'Personne', icon: User },
    { value: 'History', label: 'Histoire', icon: History },
  ];

  const [formData, setFormData] = useState<{
    date: string;
    displayDate: string;
    title: string;
    description: string;
    category: string;
    color: TimelineEvent['color'];
    linkType: TimelineEvent['linkType'];
    linkId: string;
    linkUrl: string;
    icon: string;
    image: string;
    mathematician: string;
    period: string;
    bubbleSize: TimelineEvent['bubbleSize'];
  }>({
    date: new Date().toISOString().split('T')[0],
    displayDate: '',
    title: '',
    description: '',
    category: 'Analyse',
    color: 'blue',
    linkType: 'course',
    linkId: '',
    linkUrl: '',
    icon: 'BookOpen',
    image: '',
    mathematician: '',
    period: 'XXe siècle',
    bubbleSize: 'medium',
  });

  const periodOptions = [
    'Antiquité',
    'Âge du cuivre',
    'Âge du bronze',
    'Âge du fer',
    'Moyen Âge',
    'Renaissance',
    'XVIIe siècle',
    'XVIIIe siècle',
    'XIXe siècle',
    'XXe siècle',
    'XXIe siècle',
  ];

  const resetForm = () => {
    setFormData({
      date: '1500-01-01',
      displayDate: '',
      title: '',
      description: '',
      category: 'Analyse',
      color: 'blue',
      linkType: 'course',
      linkId: '',
      linkUrl: '',
      icon: 'BookOpen',
      image: '',
      mathematician: '',
      period: 'XXe siècle',
      bubbleSize: 'medium',
    });
  };

  const handleSubmit = () => {
    if (formData.title && formData.description && formData.date) {
      const eventData: Omit<TimelineEvent, 'id'> = {
        date: formData.date,
        displayDate: formData.displayDate || undefined,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        color: formData.color,
        linkType: formData.linkType,
        icon: formData.icon,
        image: formData.image || undefined,
        mathematician: formData.mathematician || undefined,
        period: formData.period || undefined,
        bubbleSize: formData.bubbleSize || 'medium',
        ...(formData.linkType === 'external' 
          ? { linkUrl: formData.linkUrl }
          : { linkId: formData.linkId }
        ),
      };

      if (editingId) {
        onUpdate(editingId, eventData);
        setEditingId(null);
      } else {
        onAdd(eventData);
      }
      resetForm();
      setIsAdding(false);
    }
  };

  const startEdit = (event: TimelineEvent) => {
    setFormData({
      date: event.date,
      displayDate: event.displayDate || '',
      title: event.title,
      description: event.description,
      category: event.category,
      color: event.color,
      linkType: event.linkType,
      linkId: event.linkId || '',
      linkUrl: event.linkUrl || '',
      icon: event.icon || 'BookOpen',
      image: event.image || '',
      mathematician: event.mathematician || '',
      period: event.period || 'XXe siècle',
      bubbleSize: event.bubbleSize || 'medium',
    });
    setEditingId(event.id);
    setIsAdding(true);
  };

  const getEventYear = (date: string) => {
    const rawYear = date.replace(/^-/, '').split('-')[0] || '0';
    const year = parseInt(rawYear, 10) || 0;
    return date.startsWith('-') ? -year : year;
  };

  // Trier les événements par date (plus récent d'abord)
  const sortedEvents = [...events].sort((a, b) => getEventYear(b.date) - getEventYear(a.date));

  return (
    <div className="space-y-6">
      {/* Add/Edit Form */}
      {(isAdding || editingId) && (
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
          <h3 className="font-bold text-gray-800 mb-4">
            {editingId ? 'Modifier l\'événement' : 'Ajouter un nouvel événement'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  min="0"
                  max="100000"
                  value={formData.date.replace(/^-/, '').split('-')[0]}
                  onChange={(e) => {
                    const year = Math.min(Math.max(parseInt(e.target.value, 10) || 0, 0), 100000);
                    const isBC = formData.date.startsWith('-');
                    const month = formData.date.split('-')[1] || '01';
                    const day = formData.date.split('-')[2] || '01';
                    const yearString = String(year).padStart(4, '0');
                    const newDate = isBC 
                      ? `-${yearString}-${month}-${day}`
                      : `${yearString}-${month}-${day}`;
                    setFormData(prev => ({ ...prev, date: newDate }));
                  }}
                  placeholder="Année"
                  className="flex-1"
                />
                <select
                  value={formData.date.startsWith('-') ? 'bc' : 'ad'}
                  onChange={(e) => {
                    const isBC = e.target.value === 'bc';
                    const year = parseInt(formData.date.replace(/^-/, '').split('-')[0]) || 1;
                    const month = formData.date.split('-')[1] || '01';
                    const day = formData.date.split('-')[2] || '01';
                    const yearString = String(Math.min(Math.max(year, 0), 100000)).padStart(4, '0');
                    const newDate = isBC 
                      ? `-${yearString}-${month}-${day}`
                      : `${yearString}-${month}-${day}`;
                    setFormData(prev => ({ ...prev, date: newDate }));
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
                >
                  <option value="ad">ap. J.-C.</option>
                  <option value="bc">av. J.-C.</option>
                </select>
              </div>
              <div className="flex gap-2 mt-2">
                <select
                  value={formData.date.split('-')[1] || '01'}
                  onChange={(e) => {
                    const month = e.target.value;
                    const isBC = formData.date.startsWith('-');
                    const year = formData.date.replace(/^-/, '').split('-')[0] || '0';
                    const day = formData.date.split('-')[2] || '01';
                    const newDate = isBC 
                      ? `-${year}-${month}-${day}`
                      : `${year}-${month}-${day}`;
                    setFormData(prev => ({ ...prev, date: newDate }));
                  }}
                  className="flex-1 px-2 py-1 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="01">Janvier</option>
                  <option value="02">Février</option>
                  <option value="03">Mars</option>
                  <option value="04">Avril</option>
                  <option value="05">Mai</option>
                  <option value="06">Juin</option>
                  <option value="07">Juillet</option>
                  <option value="08">Août</option>
                  <option value="09">Septembre</option>
                  <option value="10">Octobre</option>
                  <option value="11">Novembre</option>
                  <option value="12">Décembre</option>
                </select>
                <Input
                  type="number"
                  min="1"
                  max="31"
                  value={parseInt(formData.date.split('-')[2] || '1')}
                  onChange={(e) => {
                    const day = String(parseInt(e.target.value, 10) || 1).padStart(2, '0');
                    const isBC = formData.date.startsWith('-');
                    const year = formData.date.replace(/^-/, '').split('-')[0] || '0';
                    const month = formData.date.split('-')[1] || '01';
                    const newDate = isBC 
                      ? `-${year}-${month}-${day}`
                      : `${year}-${month}-${day}`;
                    setFormData(prev => ({ ...prev, date: newDate }));
                  }}
                  placeholder="Jour"
                  className="w-20"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Titre de l'événement"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie *</label>
              <Input
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                placeholder="ex: Analyse"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Couleur</label>
              <select
                value={formData.color}
                onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value as TimelineEvent['color'] }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
              >
                {colorOptions.map(color => (
                  <option key={color.value} value={color.value}>
                    {color.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Icône</label>
              <select
                value={formData.icon}
                onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
              >
                {iconOptions.map(icon => (
                  <option key={icon.value} value={icon.value}>
                    {icon.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type de lien</label>
              <select
                value={formData.linkType}
                onChange={(e) => setFormData(prev => ({ ...prev, linkType: e.target.value as TimelineEvent['linkType'] }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
              >
                <option value="course">Cours</option>
                <option value="problem">Problème</option>
                <option value="formula">Formule</option>
                <option value="external">Lien externe</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date affichée (optionnel)</label>
              <Input
                value={formData.displayDate}
                onChange={(e) => setFormData(prev => ({ ...prev, displayDate: e.target.value }))}
                placeholder="ex: 300 av. J.-C."
              />
              <p className="text-xs text-gray-500 mt-1">Format libre pour les dates historiques</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mathématicien</label>
              <Input
                value={formData.mathematician}
                onChange={(e) => setFormData(prev => ({ ...prev, mathematician: e.target.value }))}
                placeholder="ex: Euclide"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Période historique</label>
              <select
                value={formData.period}
                onChange={(e) => setFormData(prev => ({ ...prev, period: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
              >
                {periodOptions.map(period => (
                  <option key={period} value={period}>{period}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Taille de la bulle</label>
              <select
                value={formData.bubbleSize}
                onChange={(e) => setFormData(prev => ({ ...prev, bubbleSize: e.target.value as 'small' | 'medium' | 'large' }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
              >
                <option value="small">Petite</option>
                <option value="medium">Moyenne</option>
                <option value="large">Grande</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">URL de l&apos;image</label>
              <Input
                value={formData.image}
                onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                placeholder="https://example.com/image.jpg"
              />
              {formData.image && (
                <img src={formData.image} alt="Preview" className="mt-2 h-20 rounded-lg object-cover" />
              )}
            </div>
            
            {formData.linkType === 'course' && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Cours lié</label>
                <select
                  value={formData.linkId}
                  onChange={(e) => setFormData(prev => ({ ...prev, linkId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
                >
                  <option value="">Sélectionner un cours...</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>
                      {course.title} ({course.level})
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            {formData.linkType === 'problem' && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Problème lié</label>
                <select
                  value={formData.linkId}
                  onChange={(e) => setFormData(prev => ({ ...prev, linkId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
                >
                  <option value="">Sélectionner un problème...</option>
                  {problems.map(problem => (
                    <option key={problem.id} value={problem.id}>
                      {problem.title} ({problem.level})
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            {formData.linkType === 'external' && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">URL externe</label>
                <Input
                  type="url"
                  value={formData.linkUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, linkUrl: e.target.value }))}
                  placeholder="https://example.com"
                />
              </div>
            )}
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Description de l'événement..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
                rows={3}
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button onClick={handleSubmit} className="bg-pink-600 hover:bg-pink-700">
              <Save className="w-4 h-4 mr-2" />
              {editingId ? 'Enregistrer' : 'Ajouter'}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsAdding(false);
                setEditingId(null);
                resetForm();
              }}
            >
              <X className="w-4 h-4 mr-2" />
              Annuler
            </Button>
          </div>
        </div>
      )}

      {/* Add Button */}
      {!isAdding && !editingId && (
        <Button onClick={() => setIsAdding(true)} className="bg-pink-600 hover:bg-pink-700">
          <Plus className="w-4 h-4 mr-2" />
          Ajouter un événement
        </Button>
      )}

      {/* Events List */}
      <div className="space-y-3">
        {sortedEvents.map(event => {
          const IconComponent = iconOptions.find(i => i.value === event.icon)?.icon || Clock;
          const linkedItem = event.linkType === 'course' 
            ? courses.find(c => c.id === event.linkId)
            : problems.find(p => p.id === event.linkId);
          
          return (
            <div key={event.id} className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-start gap-4">
                {/* Image thumbnail */}
                {event.image && (
                  <img src={event.image} alt={event.title} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: 
                        event.color === 'blue' ? '#3b82f6' :
                        event.color === 'purple' ? '#a855f7' :
                        event.color === 'green' ? '#22c55e' :
                        event.color === 'orange' ? '#f97316' :
                        event.color === 'pink' ? '#ec4899' :
                        event.color === 'cyan' ? '#06b6d4' :
                        event.color === 'red' ? '#ef4444' :
                        '#f59e0b'
                      }}
                    />
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                      {event.category}
                    </span>
                    {event.period && (
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                        {event.period}
                      </span>
                    )}
                    <span className="text-xs text-gray-400">
                      {event.displayDate || new Date(event.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <IconComponent className="w-4 h-4 text-gray-400" />
                    <h4 className="font-medium text-gray-800">{event.title}</h4>
                  </div>
                  {event.mathematician && (
                    <p className="text-xs text-purple-600 mt-0.5">{event.mathematician}</p>
                  )}
                  <p className="text-sm text-gray-600 mt-1 line-clamp-1">{event.description}</p>
                  
                  {/* Link info */}
                  <div className="flex items-center gap-2 mt-2">
                    {event.linkType === 'course' && linkedItem && (
                      <span className="text-xs flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                        <BookOpen className="w-3 h-3" />
                        Cours: {linkedItem.title}
                      </span>
                    )}
                    {event.linkType === 'problem' && linkedItem && (
                      <span className="text-xs flex items-center gap-1 text-orange-600 bg-orange-50 px-2 py-0.5 rounded">
                        <Puzzle className="w-3 h-3" />
                        Problème: {linkedItem.title}
                      </span>
                    )}
                    {event.linkType === 'external' && event.linkUrl && (
                      <span className="text-xs flex items-center gap-1 text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                        <ExternalLink className="w-3 h-3" />
                        Lien externe
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => startEdit(event)}
                    className="p-2 text-gray-400 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm({ id: event.id, title: event.title })}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dialog de confirmation de suppression */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Confirmer la suppression
            </DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer l'événement <strong>"{deleteConfirm?.title}"</strong> ?
              <br />
              Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-row gap-2 justify-end mt-4">
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Annuler
            </Button>
            <Button 
              variant="destructive"
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => {
                if (deleteConfirm) {
                  onRemove(deleteConfirm.id);
                  setDeleteConfirm(null);
                }
              }}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// === GESTIONNAIRE DES CONTENUS D'ARÈNE ===
function ArenaContentsManager({
  arenaContents,
  courses,
  problems,
  formulas,
  onAdd,
  onRemove,
}: {
  arenaContents: ArenaContent[];
  courses: Course[];
  problems: Problem[];
  formulas: Formula[];
  onAdd: (content: Omit<ArenaContent, 'id'>) => void;
  onUpdate: (id: string, updates: Partial<ArenaContent>) => void;
  onRemove: (id: string) => void;
}) {
  const [selectedWorld, setSelectedWorld] = useState<WorldId>('algebra');
  const [selectedArena, setSelectedArena] = useState(1);
  const [contentType, setContentType] = useState<ArenaContent['contentType']>('course');
  const [selectedContentId, setSelectedContentId] = useState('');
  const [isBonus, setIsBonus] = useState(false);
  const [isOlympiad, setIsOlympiad] = useState(false);

  const items = contentType === 'course' ? courses : contentType === 'problem' ? problems : formulas;
  const filtered = arenaContents.filter((ac) => ac.worldId === selectedWorld && ac.arenaNumber === selectedArena);

  const getItemLabel = (item: Course | Problem | Formula) => {
    if ('title' in item) return item.title;
    return item.name;
  };

  const handleAdd = () => {
    if (!selectedContentId) return;
    onAdd({
      worldId: selectedWorld,
      arenaNumber: selectedArena,
      contentType,
      contentId: selectedContentId,
      isBonus,
      isOlympiad,
    });
    setSelectedContentId('');
    setIsBonus(false);
    setIsOlympiad(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Ajouter un contenu à une arène</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Monde</label>
            <select
              value={selectedWorld}
              onChange={(e) => setSelectedWorld(e.target.value as WorldId)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              {WORLDS.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Arène</label>
            <select
              value={selectedArena}
              onChange={(e) => setSelectedArena(Number(e.target.value))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              {Array.from({ length: 15 }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  Arène {n}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={contentType}
              onChange={(e) => {
                setContentType(e.target.value as ArenaContent['contentType']);
                setSelectedContentId('');
              }}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="course">Cours</option>
              <option value="problem">Problème</option>
              <option value="formula">Formule</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contenu</label>
            <select
              value={selectedContentId}
              onChange={(e) => setSelectedContentId(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">Sélectionner...</option>
              {items.map((item) => (
                <option key={item.id} value={item.id}>
                  {getItemLabel(item)}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-4 mt-4">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={isBonus}
              onChange={(e) => setIsBonus(e.target.checked)}
              className="rounded border-gray-300"
            />
            Hors programme (bonus)
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={isOlympiad}
              onChange={(e) => setIsOlympiad(e.target.checked)}
              className="rounded border-gray-300"
            />
            Olympiade
          </label>
          <Button onClick={handleAdd} disabled={!selectedContentId} className="ml-auto">
            Ajouter
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Contenus configurés</h3>
        {filtered.length === 0 ? (
          <p className="text-gray-500">
            Aucun contenu pour {WORLDS.find((w) => w.id === selectedWorld)?.name} – Arène {selectedArena}.
          </p>
        ) : (
          <div className="space-y-2">
            {filtered.map((ac) => {
              const item =
                ac.contentType === 'course'
                  ? courses.find((c) => c.id === ac.contentId)
                  : ac.contentType === 'problem'
                  ? problems.find((p) => p.id === ac.contentId)
                  : formulas.find((f) => f.id === ac.contentId);
              return (
                <div key={ac.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-gray-800">{item ? getItemLabel(item) : ac.contentId}</span>
                    <span className="text-xs uppercase font-bold text-gray-500">{ac.contentType}</span>
                    {ac.isBonus && (
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">Hors programme</span>
                    )}
                    {ac.isOlympiad && (
                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Olympiade</span>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onRemove(ac.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// === PAGE PRINCIPALE ADMIN ===
export function AdminPage(props: AdminPageProps) {
  const { isAdmin, onLogin, onLogout } = props;

  if (!isAdmin) {
    return <LoginForm onLogin={onLogin} />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-1">Panel Administrateur</h1>
            <p className="text-purple-100">Gérez le contenu de MathUnivers</p>
          </div>
          <Button 
            onClick={onLogout}
            variant="outline"
            className="border-white/30 text-white hover:bg-white/10"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Déconnexion
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="stats" className="w-full">
        <TabsList className="grid grid-cols-6 w-full">
          <TabsTrigger value="stats" className="flex items-center gap-1">
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Stats</span>
          </TabsTrigger>
          <TabsTrigger value="courses" className="flex items-center gap-1">
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Cours</span>
          </TabsTrigger>
          <TabsTrigger value="problems" className="flex items-center gap-1">
            <Puzzle className="w-4 h-4" />
            <span className="hidden sm:inline">Problèmes</span>
          </TabsTrigger>
          <TabsTrigger value="formulas" className="flex items-center gap-1">
            <Calculator className="w-4 h-4" />
            <span className="hidden sm:inline">Formules</span>
          </TabsTrigger>
          <TabsTrigger value="timeline" className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span className="hidden sm:inline">Timeline</span>
          </TabsTrigger>
          <TabsTrigger value="arenas" className="flex items-center gap-1">
            <Grid3x3 className="w-4 h-4" />
            <span className="hidden sm:inline">Arènes</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="stats" className="mt-6">
          <StatsPanel 
            courses={props.courses}
            problems={props.problems}
            formulas={props.formulas}
            books={props.books}
            monthlyStats={props.monthlyStats}
          />
        </TabsContent>

        <TabsContent value="courses" className="mt-6">
          <CoursesManager 
            courses={props.courses}
            onAdd={props.onAddCourse}
            onUpdate={props.onUpdateCourse}
            onRemove={props.onRemoveCourse}
          />
        </TabsContent>

        <TabsContent value="problems" className="mt-6">
          <ProblemsManager 
            problems={props.problems}
            onAdd={props.onAddProblem}
            onUpdate={props.onUpdateProblem}
            onRemove={props.onRemoveProblem}
          />
        </TabsContent>

        <TabsContent value="formulas" className="mt-6">
          <FormulasManager 
            formulas={props.formulas}
            onAdd={props.onAddFormula}
            onUpdate={props.onUpdateFormula}
            onRemove={props.onRemoveFormula}
          />
        </TabsContent>

        <TabsContent value="timeline" className="mt-6">
          <TimelineManager 
            events={props.timelineEvents}
            courses={props.courses}
            problems={props.problems}
            onAdd={props.onAddTimelineEvent}
            onUpdate={props.onUpdateTimelineEvent}
            onRemove={props.onRemoveTimelineEvent}
          />
        </TabsContent>

        <TabsContent value="arenas" className="mt-6">
          <ArenaContentsManager
            arenaContents={props.arenaContents}
            courses={props.courses}
            problems={props.problems}
            formulas={props.formulas}
            onAdd={props.onAddArenaContent}
            onUpdate={props.onUpdateArenaContent}
            onRemove={props.onRemoveArenaContent}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
