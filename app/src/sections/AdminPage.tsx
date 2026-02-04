import { useState, useRef } from 'react';
import { 
  Lock, 
  LogOut, 
  BookOpen, 
  Puzzle, 
  Calculator, 
  Library,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Upload,
  TrendingUp,
  Users,
  Eye,
  BarChart3,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { LevelBadge, DifficultyBadge } from '@/components/LevelBadge';
import type { Course, Problem, Formula, Book, Level, MonthlyStats } from '@/types';
import { LEVELS } from '@/types';
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
  onAddCourse: (course: Omit<Course, 'id' | 'type' | 'date'>) => void;
  onUpdateCourse: (id: string, updates: Partial<Course>) => void;
  onRemoveCourse: (id: string) => void;
  onAddProblem: (problem: Omit<Problem, 'id' | 'type' | 'date'>) => void;
  onUpdateProblem: (id: string, updates: Partial<Problem>) => void;
  onRemoveProblem: (id: string) => void;
  onAddFormula: (formula: Omit<Formula, 'id'>) => void;
  onUpdateFormula: (id: string, updates: Partial<Formula>) => void;
  onRemoveFormula: (id: string) => void;
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    level: 'Term' as Level,
    description: '',
    content: '',
    image: '',
    categoryColor: '#f0f9ff',
    categoryTextColor: '#0284c7',
  });

  const resetForm = () => {
    setFormData({
      title: '',
      category: '',
      level: 'Term',
      description: '',
      content: '',
      image: '',
      categoryColor: '#f0f9ff',
      categoryTextColor: '#0284c7',
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
      categoryColor: course.categoryColor || '#f0f9ff',
      categoryTextColor: course.categoryTextColor || '#0284c7',
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
                <img src={formData.image} alt="Preview" className="mt-2 h-20 rounded-lg object-cover" />
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
                <h4 className="font-medium text-gray-800">{course.title}</h4>
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
                  onClick={() => onRemove(course.id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    level: 'Term' as Level,
    difficulty: 'Moyen' as 'Facile' | 'Moyen' | 'Difficile',
    description: '',
    content: '',
    image: '',
    hints: [] as { id: string; content: string; formulaRefs: string[] }[],
  });

  const [newHint, setNewHint] = useState({ content: '', formulaRefs: '' });

  const resetForm = () => {
    setFormData({
      title: '',
      category: '',
      level: 'Term',
      difficulty: 'Moyen',
      description: '',
      content: '',
      image: '',
      hints: [],
    });
    setNewHint({ content: '', formulaRefs: '' });
  };

  const handleSubmit = () => {
    if (formData.title && formData.category && formData.content) {
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

  const startEdit = (problem: Problem) => {
    setFormData({
      title: problem.title,
      category: problem.category,
      level: problem.level,
      difficulty: problem.difficulty,
      description: problem.description,
      content: problem.content,
      image: problem.image || '',
      hints: problem.hints.map(h => ({ ...h, formulaRefs: h.formulaRefs || [] })),
    });
    setEditingId(problem.id);
    setIsAdding(true);
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
                <img src={formData.image} alt="Preview" className="mt-2 h-20 rounded-lg object-cover" />
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
          </div>
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
                <h4 className="font-medium text-gray-800">{problem.title}</h4>
                <p className="text-sm text-gray-600 line-clamp-1">{problem.description}</p>
                {problem.hints.length > 0 && (
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
                  onClick={() => onRemove(problem.id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
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
                  onClick={() => onRemove(formula.id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
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
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="stats" className="flex items-center gap-1">
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Statistiques</span>
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
      </Tabs>
    </div>
  );
}
