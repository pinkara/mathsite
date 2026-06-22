import { useState } from 'react';
import { 
  GraduationCap, 
  Search, 
  X, 
  Menu, 
  Home, 
  BookOpen, 
  Calculator, 
  Library, 
  Lock,
  ChevronRight,
  Terminal,
  Layers,
  ExternalLink,
  Clock,
  User,
  Flame,
  Star,
  LogOut,
  Map,
  LayoutGrid,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type { Route, UserProfile } from '@/types';

interface HeaderProps {
  currentRoute: Route;
  onNavigate: (route: Route, params?: any) => void;
  isAdmin: boolean;
  searchResults?: {
    courses: { id: string; title: string; category: string; type: string }[];
    problems: { id: string; title: string; category: string; type: string }[];
    formulas: { id: string; name: string; category: string; type: string }[];
  };
  profile?: UserProfile | null;
  isSupabaseReady?: boolean;
  isAuthenticated?: boolean;
  onSignInGoogle?: () => void;
  onSignOut?: () => void;
}

export function Header({
  currentRoute,
  onNavigate,
  isAdmin,
  searchResults,
  profile,
  isSupabaseReady,
  isAuthenticated,
  onSignInGoogle,
  onSignOut,
}: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);

  const navItems = [
    { route: 'home' as Route, label: 'Accueil', icon: Home },
    { route: 'courses' as Route, label: 'Cours', icon: BookOpen },
    { route: 'formulas' as Route, label: 'Formules', icon: Calculator },
    { route: 'timeline' as Route, label: 'Timeline', icon: Clock },
    { route: 'library' as Route, label: 'Librairie', icon: Library },
    { route: 'subjects' as Route, label: 'Matières', icon: Layers },
    { route: 'ide' as Route, label: 'IDE', icon: Terminal },
    { route: 'profile' as Route, label: 'Profil', icon: User },
    { route: 'worlds' as Route, label: 'Mondes', icon: Map },
    { route: 'collection' as Route, label: 'Collection', icon: LayoutGrid },
  ];

  const userLevel = profile ? Math.floor(profile.xp / 100) + 1 : 1;
  const xpIntoLevel = profile ? profile.xp % 100 : 0;

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
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
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
              Admin
            </Button>

            {/* User Profile Widget */}
            {isAuthenticated ? (
              <div className="hidden md:flex items-center gap-2">
                <button
                  onClick={() => onNavigate('profile')}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full border border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm transition-all"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center text-sm font-bold">
                    {profile?.name ? profile.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                  </div>
                  <div className="text-left leading-tight">
                    <div className="text-xs font-semibold text-gray-900">{profile?.name || 'Compte'}</div>
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                      <span className="flex items-center gap-0.5"><Star className="w-3 h-3 text-amber-500" /> Niv. {userLevel}</span>
                      {profile && profile.streak > 0 && (
                        <span className="flex items-center gap-0.5 text-orange-600"><Flame className="w-3 h-3" /> {profile.streak}</span>
                      )}
                    </div>
                  </div>
                  <div className="w-12">
                    <Progress value={xpIntoLevel} className="h-1.5" />
                  </div>
                </button>
                <Button
                  onClick={onSignOut}
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-gray-500 hover:text-red-600"
                  title="Se déconnecter"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : isSupabaseReady ? (
              <Button
                onClick={onSignInGoogle}
                variant="outline"
                size="sm"
                className="hidden md:flex items-center gap-1.5 border-blue-200 text-blue-700 hover:bg-blue-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </Button>
            ) : (
              <Button
                onClick={() => onNavigate('profile')}
                variant="outline"
                size="sm"
                className="hidden md:flex items-center gap-1.5"
              >
                <User className="w-4 h-4" />
                Mon compte
              </Button>
            )}

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
              Admin
              <ChevronRight className="w-4 h-4 ml-auto opacity-50" />
            </button>

            {/* Mobile Auth */}
            {isSupabaseReady && (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  if (isAuthenticated) {
                    onSignOut?.();
                  } else {
                    onSignInGoogle?.();
                  }
                }}
                className={cn(
                  'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                  isAuthenticated
                    ? 'text-red-600 hover:bg-red-50'
                    : 'text-blue-700 hover:bg-blue-50'
                )}
              >
                {isAuthenticated ? <LogOut className="w-4 h-4" /> : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                )}
                {isAuthenticated ? 'Se déconnecter' : 'Se connecter avec Google'}
                <ChevronRight className="w-4 h-4 ml-auto opacity-50" />
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
