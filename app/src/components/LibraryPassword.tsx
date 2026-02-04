import { useState, useEffect } from 'react';
import { Lock, Unlock, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const LIBRARY_PASSWORD = 'matharchive314';
const STORAGE_KEY = 'mathunivers_library_access';

interface LibraryPasswordProps {
  children: React.ReactNode;
}

export function LibraryPassword({ children }: LibraryPasswordProps) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Vérifier si l'accès a déjà été accordé dans cette session
    const hasAccess = sessionStorage.getItem(STORAGE_KEY) === 'granted';
    if (hasAccess) {
      setIsUnlocked(true);
    }
    setIsLoading(false);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password === LIBRARY_PASSWORD) {
      sessionStorage.setItem(STORAGE_KEY, 'granted');
      setIsUnlocked(true);
    } else {
      setError('Mot de passe incorrect');
      setPassword('');
    }
  };

  const handleLock = () => {
    sessionStorage.removeItem(STORAGE_KEY);
    setIsUnlocked(false);
    setPassword('');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!isUnlocked) {
    return (
      <div className="min-h-[500px] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-8 text-center">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
              <Lock className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Librairie MathUnivers
            </h2>
            <p className="text-purple-100">
              Cette section est protégée. Entrez le mot de passe pour accéder aux ressources.
            </p>
          </div>

          {/* Form */}
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mot de passe
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Entrez le mot de passe..."
                    className="pr-10"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 text-red-600 text-sm">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                  {error}
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                size="lg"
              >
                <Unlock className="w-4 h-4 mr-2" />
                Déverrouiller
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-xs text-gray-400">
                Cette librairie contient des ressources pédagogiques réservées.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Contenu déverrouillé avec bouton de verrouillage
  return (
    <div className="relative">
      {/* Bouton verrouiller (optionnel, en haut à droite) */}
      <div className="absolute top-0 right-0 z-10">
        <button
          onClick={handleLock}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-sm font-medium transition-colors"
          title="Verrouiller la librairie"
        >
          <Lock className="w-4 h-4" />
          <span className="hidden sm:inline">Verrouiller</span>
        </button>
      </div>
      
      {/* Contenu de la librairie */}
      <div className="pt-12">
        {children}
      </div>
    </div>
  );
}

export default LibraryPassword;
