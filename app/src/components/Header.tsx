import { useState } from 'react';
import { 
  GraduationCap, 
  Search, 
  X, 
  Menu, 
  Home, 
  BookOpen, 
  Puzzle, 
  Calculator, 
  Library, 
  Lock,
  ChevronRight,
  Terminal,
  Layers,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { Route } from '@/types';

interface HeaderProps {
  currentRoute: Route;
  onNavigate: (route: Route, params?: any) => void;
  isAdmin: boolean;
  searchResults?: {
    courses: { id: string; title: string; category: string; type: string }[];
    problems: { id: string; title: string; category: string; type: string }[];
    formulas: { id: string; name: string; category: string; type: string }[];
  };
}

export function Header({ currentRoute, onNavigate, isAdmin, searchResults }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);

  const navItems = [
    { route: 'home' as Route, label: 'Accueil', icon: Home },
    { route: 'courses' as Route, label: 'Cours', icon: BookOpen },
    { route: 'problems' as Route, label: 'Problèmes', icon: Puzzle },
    { route: 'formulas' as Route, label: 'Formules', icon: Calculator },
    { route: 'library' as Route, label: 'Librairie', icon: Library },
    { route: 'subjects' as Route, label: 'Matières', icon: Layers },
    { route: 'ide' as Route, label: 'IDE', icon: Terminal },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowResults(true);
    }
  };

  const handleResultClick = (type: string, id: string) => {
    setSearchQuery('');
    setShowResults(false);
    if (type === 'course' || type === 'problem') {
      onNavigate('article', { type, id });
    } else if (type === 'formula') {
      onNavigate('formulas');
    }
  };

  type SearchItem = { id: string; title?: string; name?: string; category: string; type: string };
  
  const allResults: SearchItem[] = [
    ...(searchResults?.courses || []),
    ...(searchResults?.problems || []),
    ...(searchResults?.formulas || []),
  ].filter((item: SearchItem) => {
    const searchLower = searchQuery.toLowerCase();
    const titleMatch = item.title?.toLowerCase().includes(searchLower);
    const nameMatch = item.name?.toLowerCase().includes(searchLower);
    const categoryMatch = item.category?.toLowerCase().includes(searchLower);
    return titleMatch || nameMatch || categoryMatch;
  }).slice(0, 8);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button 
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 group"
          >
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 text-white p-2 rounded-lg group-hover:scale-105 transition-transform">
              <GraduationCap className="w-5 h-5" />
            </div>
            <span className="font-bold text-xl text-gray-900 tracking-tight">
              MathUnivers
            </span>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentRoute === item.route;
              return (
                <button
                  key={item.route}
                  onClick={() => onNavigate(item.route)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                    isActive 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-2">
            {/* Search Button (Desktop) */}
            <div className="hidden md:block relative">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowResults(e.target.value.length > 0);
                  }}
                  onBlur={() => setTimeout(() => setShowResults(false), 200)}
                  onFocus={() => searchQuery && setShowResults(true)}
                  className="w-64 pl-9 pr-8 h-9 text-sm"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setShowResults(false);
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </form>

              {/* Search Results Dropdown */}
              {showResults && searchQuery && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg border border-gray-200 shadow-lg z-50 max-h-80 overflow-auto">
                  {allResults.length > 0 ? (
                    <div className="py-2">
                      {allResults.map((result) => (
                        <button
                          key={`${result.type}-${result.id}`}
                          onClick={() => handleResultClick(result.type, result.id)}
                          className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors flex items-center gap-3"
                        >
                          <span className={cn(
                            'text-xs px-2 py-0.5 rounded-full font-medium',
                            result.type === 'course' && 'bg-blue-100 text-blue-700',
                            result.type === 'problem' && 'bg-orange-100 text-orange-700',
                            result.type === 'formula' && 'bg-purple-100 text-purple-700',
                          )}>
                            {result.type === 'course' ? 'Cours' : result.type === 'problem' ? 'Problème' : 'Formule'}
                          </span>
                          <span className="text-sm text-gray-700 truncate">
                            {result.title ?? result.name}
                          </span>
                          <span className="text-xs text-gray-400 ml-auto">
                            {result.category}
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="px-4 py-3 text-sm text-gray-500 text-center">
                      Aucun résultat trouvé
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Admin Button */}
            <Button
              onClick={() => onNavigate('admin')}
              variant={isAdmin ? 'default' : 'outline'}
              size="sm"
              className={cn(
                'hidden md:flex items-center gap-1.5',
                isAdmin && 'bg-gradient-to-r from-purple-600 to-blue-600'
              )}
            >
              <Lock className="w-4 h-4" />
              {isAdmin ? 'Admin' : 'Connexion'}
            </Button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          {/* Mobile Search */}
          <div className="p-4 border-b border-gray-100">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8"
              />
            </form>
          </div>

          {/* Mobile Navigation */}
          <nav className="p-2 space-y-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentRoute === item.route;
              return (
                <button
                  key={item.route}
                  onClick={() => {
                    onNavigate(item.route);
                    setIsMobileMenuOpen(false);
                  }}
                  className={cn(
                    'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                    isActive 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                  <ChevronRight className="w-4 h-4 ml-auto opacity-50" />
                </button>
              );
            })}
            {/* PINKARIUM Link */}
            <a
              href="https://pinkara.github.io/PINKARIUM/index.html"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all text-gray-600 hover:text-pink-600 hover:bg-pink-50"
            >
              <ExternalLink className="w-4 h-4" />
              PINKARIUM
              <ChevronRight className="w-4 h-4 ml-auto opacity-50" />
            </a>
            <button
              onClick={() => {
                onNavigate('admin');
                setIsMobileMenuOpen(false);
              }}
              className={cn(
                'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                currentRoute === 'admin'
                  ? 'bg-purple-50 text-purple-700' 
                  : 'text-gray-600 hover:text-purple-600 hover:bg-gray-50'
              )}
            >
              <Lock className="w-4 h-4" />
              {isAdmin ? 'Admin' : 'Connexion'}
              <ChevronRight className="w-4 h-4 ml-auto opacity-50" />
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
