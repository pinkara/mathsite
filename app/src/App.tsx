import { useEffect, useState, useCallback } from 'react';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { PWAInstall } from '@/components/PWAInstall';
import { LibraryPassword } from '@/components/LibraryPassword';
import { HomePage } from '@/sections/HomePage';
import { CoursesPage } from '@/sections/CoursesPage';
import { FormulasPage } from '@/sections/FormulasPage';
import { LibraryPage } from '@/sections/LibraryPage';
import { IDEPage } from '@/sections/IDEPage';
import { SubjectsPortal } from '@/sections/SubjectsPortal';
import { ArticlePage } from '@/sections/ArticlePage';
import { AdminPage } from '@/sections/AdminPage';
import { TimelinePage } from '@/sections/TimelinePage';
import { ProfilePage } from '@/sections/ProfilePage';
import { WorldsMapPage } from '@/sections/WorldsMapPage';
import { ArenaPage } from '@/sections/ArenaPage';
import { CollectionPage } from '@/sections/CollectionPage';
import { WelcomePage } from '@/sections/WelcomePage';
import { WelcomeModal } from '@/components/WelcomeModal';
import { useRouter } from '@/hooks/useRouter';
import { useAuth } from '@/hooks/useAuth';
import { 
  useCourses, 
  useProblems, 
  useFormulas, 
  useLibrary, 
  useAdmin, 
  useStats,
  useLikes,
  useTimeline,
  useUserProfile,
  useArenaContents,
} from '@/hooks/useStorage';
import { initializeData } from '@/data/initialData';
import { cn } from '@/lib/utils';
import type { Route, Level } from '@/types';

// === GLOBAL MATHJAX LOADER ===
// Load MathJax globally so LaTeX works on all pages
function useMathJax() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Skip if already loaded or loading
    if ((window as any).MathJax?.startup?.ready) return;
    if (document.getElementById('mathjax-script')) return;

    // Configure MathJax before loading
    (window as any).MathJax = {
      loader: {
        load: ['[tex]/color']
      },
      tex: {
        inlineMath: [['$', '$'], ['\\(', '\\)']],
        displayMath: [['$$', '$$'], ['\\[', '\\]']],
        processEscapes: true,
        processEnvironments: true,
        packages: {'[+]': ['color']}
      },
      svg: {
        fontCache: 'global',
      },
      startup: {
        pageReady: () => {
          return (window as any).MathJax.startup.defaultPageReady();
        }
      }
    };

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js';
    script.async = true;
    script.id = 'mathjax-script';
    
    script.onload = () => {
      console.log('MathJax loaded successfully');
    };
    
    script.onerror = () => {
      console.error('Failed to load MathJax');
    };
    
    document.head.appendChild(script);
  }, []);
}

function useMathJaxVisibilityRefresh() {
  const refreshMathJax = useCallback(() => {
    if (typeof window !== 'undefined' && (window as any).MathJax?.typesetPromise) {
      (window as any).MathJax.typesetPromise().catch((err: Error) => {
        if (!err.message?.includes('MathJax')) {
          console.error('MathJax refresh error:', err);
        }
      });
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshMathJax();
      }
    };

    const handleFocus = () => refreshMathJax();
    const handleResize = () => refreshMathJax();

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('resize', handleResize);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('resize', handleResize);
    };
  }, [refreshMathJax]);
}

// === LOADING SCREEN ===
function LoadingScreen() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 15 + 5;
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col items-center justify-center z-50">
      <div className="relative mb-8">
        <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-2xl animate-pulse">
          <span className="text-white text-5xl font-bold">∑</span>
        </div>
        <div className="absolute inset-0 border-4 border-blue-400 rounded-2xl animate-ping opacity-20"></div>
      </div>
      
      <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden mb-6">
        <div 
          className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-300"
          style={{ width: `${Math.min(progress, 100)}%` }}
        ></div>
      </div>
      
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">
          <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            MathUnivers
          </span>
        </h3>
        <p className="text-gray-600 text-sm">
          Chargement de l'encyclopédie mathématique...
        </p>
      </div>
    </div>
  );
}

// === WARNING BANNER FOR MISSING SUPABASE ===
function SupabaseWarning() {
  const [show, setShow] = useState(true);
  
  if (!show) return null;
  
  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-3">
      <div className="max-w-screen-2xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span className="text-sm text-amber-800">
            <strong>Mode local activé</strong> — Les données ne sont pas partagées entre appareils. 
            <a href="SUPABASE_FIX.md" className="underline ml-1 hover:text-amber-900">Configurer Supabase</a>
          </span>
        </div>
        <button onClick={() => setShow(false)} className="text-amber-600 hover:text-amber-800">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// === CHECK IF SUPABASE IS CONFIGURED ===
const isSupabaseConfigured = () => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  return url && key && url.startsWith('https://') && key.length > 20;
};

// === RÉCUPÉRER LES PARAMÈTRES DE L'URL (pour l'IDE) ===
function getUrlParams() {
  const hash = window.location.hash;
  const queryIndex = hash.indexOf('?');
  if (queryIndex === -1) return { code: undefined, lang: undefined };
  
  const params = new URLSearchParams(hash.slice(queryIndex + 1));
  const code = params.get('code');
  const lang = params.get('lang');
  return {
    code: code || undefined,
    lang: lang || undefined
  };
}

// === MAIN APP ===
function App() {
  const [isLoading, setIsLoading] = useState(true);
  const { state, router, navigationKey } = useRouter();
  const showSupabaseWarning = !isSupabaseConfigured();
  
  // Load MathJax globally for all pages
  useMathJax();
  useMathJaxVisibilityRefresh();
  
  // Écouter les changements de hash (pour les boutons IDE dans ContentRenderer)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#/ide')) {
        // Extraire les paramètres
        const params = getUrlParams();
        router('ide', { code: params.code, language: params.lang });
      }
    };
    
    window.addEventListener('hashchange', handleHashChange);
    // Vérifier au cas où le hash est déjà défini au mount
    handleHashChange();
    
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [router]);
  
  // Data hooks
  const { courses, addCourse, updateCourse, removeCourse } = useCourses();
  const { problems, addProblem, updateProblem, removeProblem } = useProblems();
  const { formulas, addFormula, updateFormula, removeFormula } = useFormulas();
  const { books, addBook, removeBook } = useLibrary();
  const { isAdmin, login, logout } = useAdmin();
  const { monthlyStats, recordVisit } = useStats();
  const { toggleLike, isLiked } = useLikes();
  const { events, addEvent, updateEvent, removeEvent } = useTimeline();
  const { user, isLoading: isAuthLoading, isSupabaseReady, signInWithGoogle, signOut } = useAuth();
  const { arenaContents, addArenaContent, updateArenaContent, removeArenaContent } = useArenaContents();
  const { profile, isLoaded: isProfileLoaded, updateProfile, resetProfile, openChest, checkIn, completeProblem, spendCurrency, setLevel } = useUserProfile(user, isSupabaseReady, { courses, problems, formulas, arenaContents });

  // Page de bienvenue : affichée la première fois
  const [hasSeenWelcome, setHasSeenWelcome] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('mathunivers_welcome_seen') === 'true';
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (user && profile?.name) {
      localStorage.setItem('mathunivers_welcome_seen', 'true');
      setHasSeenWelcome(true);
    }
  }, [user, profile?.name]);

  const [authIntent, setAuthIntent] = useState<'signin' | 'signup' | null>(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('mathunivers_auth_intent') as 'signin' | 'signup' | null;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (user && authIntent) {
      localStorage.removeItem('mathunivers_auth_intent');
      setAuthIntent(null);
    }
  }, [user, authIntent]);

  const handleWelcomeSignIn = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('mathunivers_welcome_seen', 'true');
      localStorage.setItem('mathunivers_auth_intent', 'signin');
    }
    setAuthIntent('signin');
    signInWithGoogle();
  };

  const handleWelcomeSignUp = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('mathunivers_welcome_seen', 'true');
      localStorage.setItem('mathunivers_auth_intent', 'signup');
    }
    setAuthIntent('signup');
    signInWithGoogle();
  };

  const handleWelcomeGuest = (name: string, level: Level) => {
    updateProfile({ name, level });
    if (typeof window !== 'undefined') {
      localStorage.setItem('mathunivers_welcome_seen', 'true');
    }
    setHasSeenWelcome(true);
  };

  // Initialize data on mount
  useEffect(() => {
    initializeData();
    
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
      recordVisit();
    }, 1500);

    return () => clearTimeout(timer);
  }, [recordVisit]);

  // Check-in user for streak tracking once profile is loaded
  useEffect(() => {
    if (isProfileLoaded && profile) {
      checkIn();
    }
  }, [isProfileLoaded, profile, checkIn]);

  // Handle navigation
  const handleNavigate = useCallback((route: string, params?: any) => {
    router(route as Route, params);
  }, [router]);

  // Render current page
  const renderContent = () => {
    switch (state.route) {
      case 'home':
        return (
          <HomePage
            courses={courses}
            problems={problems}
            formulas={formulas}
            isAdmin={isAdmin}
            onNavigate={handleNavigate}
          />
        );
      
      case 'courses':
        return (
          <CoursesPage
            courses={courses}
            onNavigate={handleNavigate}
            profile={profile}
            arenaContents={arenaContents}
            problems={problems}
            formulas={formulas}
          />
        );
      
      case 'problems':
        return <WorldsMapPage profile={profile} onSelectArena={(w, a) => handleNavigate('worlds', { worldId: w, arenaNumber: a })} />;
      
      case 'formulas':
        return (
          <FormulasPage
            formulas={formulas}
            highlightFormula={state.params?.highlightFormula as string | undefined}
          />
        );
      
      case 'library':
        return (
          <LibraryPassword>
            <LibraryPage
              books={books}
              isAdmin={isAdmin}
              onAddBook={addBook}
              onRemoveBook={removeBook}
            />
          </LibraryPassword>
        );

      case 'ide':
        const urlParams = getUrlParams();
        const ideLang = state.params?.language || urlParams.lang;
        return <IDEPage 
          initialCode={state.params?.code || urlParams.code}
          initialLanguage={ideLang === 'javascript' ? 'javascript' : 'python'}
        />;
      
      case 'subjects':
        return <SubjectsPortal />;
      
      case 'timeline':
        // Périodes historiques prédéfinies
        const historicalPeriods = [
          { id: 'stone-age', name: 'Âge de pierre', startYear: -10000, endYear: -5500, color: '#78716c', description: 'L\'âge de pierre, les premières technologies préhistoriques' },
          { id: 'copper-age', name: 'Âge du cuivre', startYear: -5500, endYear: -3300, color: '#f59e0b', description: 'Première métallurgie du cuivre et premières civilisations' },
          { id: 'bronze-age', name: 'Âge du bronze', startYear: -3300, endYear: -1200, color: '#d97706', description: 'Développement des premiers États et de la métallurgie du bronze' },
          { id: 'iron-age', name: 'Âge du fer', startYear: -1200, endYear: 476, color: '#475569', description: 'Expansion des sociétés antiques et transition vers le Moyen Âge' },
          { id: 'antiquity', name: 'Antiquité', startYear: 476, endYear: 1492, color: '#f59e0b', description: 'Des premières civilisations à la chute de l\'Empire romain' },
          { id: 'middle-ages', name: 'Moyen Âge', startYear: 1492, endYear: 1600, color: '#8b5cf6', description: 'De la chute de Rome à la découverte de l\'Amérique' },
          { id: 'renaissance', name: 'Renaissance', startYear: 1600, endYear: 1700, color: '#ec4899', description: 'Renouveau des arts et des sciences' },
          { id: '17th', name: 'XVIIe siècle', startYear: 1700, endYear: 1800, color: '#3b82f6', description: 'L\'âge classique des mathématiques' },
          { id: '18th', name: 'XVIIIe siècle', startYear: 1800, endYear: 1900, color: '#10b981', description: 'Le siècle des Lumières' },
          { id: '19th', name: 'XIXe siècle', startYear: 1900, endYear: 2000, color: '#8b5cf6', description: 'L\'âge d\'or des mathématiques modernes' },
          { id: '20th', name: 'XXe siècle', startYear: 2000, endYear: 2100, color: '#ef4444', description: 'Les fondements et la crise des mathématiques' },
          { id: '21st', name: 'XXIe siècle', startYear: 2100, endYear: 2200, color: '#06b6d4', description: 'L\'ère numérique et l\'informatique' },
        ];
        
        return (
          <TimelinePage
            events={events}
            periods={historicalPeriods}
            courses={courses}
            problems={problems}
            formulas={formulas}
            isAdmin={isAdmin}
            onNavigate={handleNavigate}
          />
        );
      
      case 'article':
        if (state.params?.type && state.params?.id) {
          return (
            <ArticlePage
              type={state.params.type}
              id={state.params.id}
              courses={courses}
              problems={problems}
              formulas={formulas}
              isLiked={isLiked(state.params.type === 'course' ? 'course' : 'course', state.params.id)}
              onToggleLike={() => toggleLike(state.params!.type === 'course' ? 'course' : 'course', state.params!.id!)}
              onNavigate={handleNavigate}
              onCompleteProblem={(problem, xp) => completeProblem(problem, xp)}
              completedProblemIds={profile?.completedProblemIds || []}
              currency={profile?.currency || 0}
              onSpendCurrency={spendCurrency}
            />
          );
        }
        return null;
      
      case 'admin':
        return (
          <AdminPage
            isAdmin={isAdmin}
            onLogin={login}
            onLogout={logout}
            courses={courses}
            problems={problems}
            formulas={formulas}
            books={books}
            monthlyStats={monthlyStats}
            timelineEvents={events}
            arenaContents={arenaContents}
            onAddCourse={addCourse}
            onUpdateCourse={updateCourse}
            onRemoveCourse={removeCourse}
            onAddProblem={addProblem}
            onUpdateProblem={updateProblem}
            onRemoveProblem={removeProblem}
            onAddFormula={addFormula}
            onUpdateFormula={updateFormula}
            onRemoveFormula={removeFormula}
            onAddTimelineEvent={addEvent}
            onUpdateTimelineEvent={updateEvent}
            onRemoveTimelineEvent={removeEvent}
            onAddArenaContent={addArenaContent}
            onUpdateArenaContent={updateArenaContent}
            onRemoveArenaContent={removeArenaContent}
          />
        );
      
      case 'profile':
        return (
          <ProfilePage
            profile={profile}
            onReset={resetProfile}
            onOpenChest={openChest}
            onNavigate={handleNavigate}
            onSetLevel={setLevel}
          />
        );
      
      case 'worlds': {
        const { worldId, arenaNumber } = state.params || {};
        if (worldId && typeof arenaNumber === 'number') {
          return (
            <ArenaPage
              worldId={worldId}
              arenaNumber={arenaNumber}
              profile={profile}
              courses={courses}
              problems={problems}
              formulas={formulas}
              arenaContents={arenaContents}
              onNavigate={handleNavigate}
            />
          );
        }
        return <WorldsMapPage profile={profile} onSelectArena={(w, a) => handleNavigate('worlds', { worldId: w, arenaNumber: a })} />;
      }
      
      case 'collection':
        return <CollectionPage profile={profile} />;
      
      default:
        return null;
    }
  };

  if (isLoading || isAuthLoading) {
    return <LoadingScreen />;
  }

  if (!hasSeenWelcome) {
    return (
      <WelcomePage
        onSignIn={handleWelcomeSignIn}
        onSignUp={handleWelcomeSignUp}
        onContinueAsGuest={handleWelcomeGuest}
        isSupabaseReady={isSupabaseReady}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {showSupabaseWarning && <SupabaseWarning />}
      
      <Header 
        currentRoute={state.route}
        onNavigate={handleNavigate}
        isAdmin={isAdmin}
        profile={profile}
        isSupabaseReady={isSupabaseReady}
        isAuthenticated={!!user}
        onSignInGoogle={signInWithGoogle}
        onSignOut={signOut}
        searchResults={{
          courses: courses.map(c => ({ id: c.id, title: c.title, category: c.category, type: 'course' })),
          problems: problems.map(p => ({ id: p.id, title: p.title, category: p.category, type: 'problem' })),
          formulas: formulas.map(f => ({ id: f.id, name: f.name, category: f.category, type: 'formula' })),
        }}
      />
      
      <main className="flex-1">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-8">
          <div className="flex flex-col lg:flex-row gap-8" key={navigationKey}>
            {/* Main Content */}
            <div className={cn(
              'flex-1',
              state.route === 'admin' && 'lg:w-full'
            )}>
              {renderContent()}
            </div>

            {/* Sidebar (hidden on admin and timeline pages) */}
            {state.route !== 'admin' && state.route !== 'timeline' && (
              <div className="hidden lg:block lg:w-80 xl:w-96 flex-shrink-0">
                <div className="sticky top-24">
                  <Sidebar
                    courses={courses}
                    problems={problems}
                    formulas={formulas}
                    onNavigate={handleNavigate}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8 mt-auto">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              MathUnivers
            </span>
          </div>
          <p className="text-gray-500 text-sm">
            Encyclopédie mathématique participative
          </p>
          <div className="flex items-center justify-center gap-4 mt-4">
            <a 
              href="https://github.com/pinkara/mathsite" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-gray-900 transition-colors"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </a>
          </div>
        </div>
      </footer>

      {/* Welcome / Create profile modal when profile has no name yet or after signup */}
      {((!profile?.name) || authIntent === 'signup') && (
        <WelcomeModal profile={profile} onCreate={updateProfile} mode={authIntent || 'guest'} />
      )}

      {/* PWA Install Banner */}
      <PWAInstall />
    </div>
  );
}

export default App;
