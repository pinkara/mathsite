import { useState } from 'react';
import { GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { LEVELS, type Level, type UserProfile } from '@/types';

interface WelcomeModalProps {
  profile: UserProfile | null;
  onCreate: (profile: Partial<UserProfile>) => void;
  mode?: 'signin' | 'signup' | 'guest';
}

export function WelcomeModal({ profile, onCreate, mode = 'guest' }: WelcomeModalProps) {
  const [name, setName] = useState(profile?.name || '');
  const [level, setLevel] = useState<Level>(profile?.level || 'Term');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onCreate({ name: name.trim(), level });
  };

  return (
    <Dialog open={!profile?.name} modal>
      <DialogContent showCloseButton={false} className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white mb-3">
            <GraduationCap className="w-8 h-8" />
          </div>
          <DialogTitle className="text-2xl">
            {mode === 'signup' ? 'Crée ton compte' : mode === 'signin' ? 'Bienvenue !' : 'Bienvenue sur MathUnivers'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'signup'
              ? 'Choisis ton pseudo et ton niveau pour commencer l\'aventure.'
              : mode === 'signin'
              ? 'Confirme ton pseudo et ton niveau pour continuer.'
              : 'Crée ton compte élève pour suivre ta progression, gagner des XP et débloquer des badges.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-4" autoComplete="off">
          <div className="space-y-2">
            <Label htmlFor="welcome-name">Ton prénom</Label>
            <Input
              id="welcome-name"
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
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-5"
            disabled={!name.trim()}
          >
            {mode === 'signup' ? 'Créer mon compte' : mode === 'signin' ? 'Continuer' : 'Commencer l\'aventure'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
