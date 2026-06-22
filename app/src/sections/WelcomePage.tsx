import { useState } from 'react';
import { GraduationCap, Eye, ArrowLeft, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LEVELS, type Level } from '@/types';

interface WelcomePageProps {
  onSignIn: () => void;
  onSignUp: () => void;
  onContinueAsGuest: (name: string, level: Level) => void;
  isSupabaseReady?: boolean;
}

export function WelcomePage({ onSignIn, onSignUp, onContinueAsGuest, isSupabaseReady = true }: WelcomePageProps) {
  const [mode, setMode] = useState<'choice' | 'guest'>('choice');
  const [name, setName] = useState('');
  const [level, setLevel] = useState<Level>('Term');

  const handleGuestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onContinueAsGuest(name.trim(), level);
  };

  if (mode === 'guest') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <button
            onClick={() => setMode('choice')}
            className="flex items-center text-sm text-gray-500 hover:text-gray-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Retour
          </button>

          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white mx-auto mb-4">
              <Eye className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Mode spectateur</h2>
            <p className="text-gray-600 mt-2">
              Ta progression restera sur cet appareil. Tu pourras te connecter plus tard pour la synchroniser.
            </p>
          </div>

          <form onSubmit={handleGuestSubmit} className="space-y-5" autoComplete="off">
            <div className="space-y-2">
              <Label htmlFor="guest-name">Ton prénom</Label>
              <Input
                id="guest-name"
                placeholder="Ex : Anaïs, Lucas..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={20}
                autoFocus
                required
                autoComplete="given-name"
              />
            </div>

            <div className="space-y-2">
              <Label>Ton niveau scolaire</Label>
              <div className="grid grid-cols-3 gap-2">
                {LEVELS.map((l) => (
                  <button
                    key={l.name}
                    type="button"
                    onClick={() => setLevel(l.name)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                      level === l.name
                        ? `bg-gradient-to-r ${l.gradient} text-white border-transparent shadow-sm`
                        : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold py-5"
              disabled={!name.trim()}
            >
              Continuer sans compte
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white mx-auto mb-6">
          <GraduationCap className="w-10 h-10" />
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Bienvenue sur MathUnivers</h1>
        <p className="text-gray-600 mb-8">
          L&apos;encyclopédie mathématique interactive. Connecte-toi pour sauvegarder ta progression sur tous tes appareils.
        </p>

        <div className="space-y-3">
          <Button
            onClick={onSignIn}
            disabled={!isSupabaseReady}
            className="w-full bg-white border border-gray-300 text-gray-800 hover:bg-gray-50 py-5 h-auto font-medium"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            {isSupabaseReady ? 'Se connecter avec Google' : 'Connexion indisponible'}
          </Button>

          <Button
            onClick={onSignUp}
            disabled={!isSupabaseReady}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-5 h-auto font-bold"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="#fff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#fff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#fff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#fff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            S&apos;inscrire avec Google
          </Button>

          <Button
            onClick={() => setMode('guest')}
            variant="outline"
            className="w-full py-5 h-auto font-medium"
          >
            <Eye className="w-4 h-4 mr-2" />
            Continuer sans compte
          </Button>
        </div>

        <div className="mt-8 flex items-start gap-2 text-xs text-gray-500 bg-gray-50 p-3 rounded-lg text-left">
          <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <p>
            En te connectant, tu pourras retrouver tes XP, ton niveau et tes badges sur n&apos;importe quel appareil.
          </p>
        </div>
      </div>
    </div>
  );
}
