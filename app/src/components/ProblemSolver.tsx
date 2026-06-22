import { useRef, useState } from 'react';
import { CheckCircle, XCircle, Lightbulb, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { MathInput, type MathInputRef } from '@/components/MathInput';
import { MathToolbar } from '@/components/MathToolbar';
import { verifyAnswer } from '@/lib/mathVerifier';
import { getProblemXp } from '@/lib/xpCalculator';
import type { Problem, ProblemAnswerField } from '@/types';

interface ProblemSolverProps {
  problem: Problem;
  completed?: boolean;
  solutionRevealed?: boolean;
  onComplete: (xpAmount: number) => void;
}

export default function ProblemSolver({ problem, completed, solutionRevealed, onComplete }: ProblemSolverProps) {
  const fieldRefs = useRef<Record<string, MathInputRef | null>>({});
  const [feedback, setFeedback] = useState<Record<string, 'idle' | 'success' | 'error'>>({});
  const [showHint, setShowHint] = useState(false);

  const xpPerField = getProblemXp(problem.level, problem.difficulty);

  // Legacy single answer fallback
  const legacyField: ProblemAnswerField | undefined =
    !problem.answerFields?.length && (problem.answerLatex || problem.answer)
      ? {
          id: 'legacy',
          label: 'Réponse',
          latex: problem.answerLatex || problem.answer || '',
          mathJson: problem.answerMathJson || '',
          type: problem.answerType || 'exact',
          allowedButtons: problem.allowedToolbarButtons,
        }
      : undefined;

  const answerFields = problem.answerFields?.length ? problem.answerFields : legacyField ? [legacyField] : [];

  const verifyField = (field: ProblemAnswerField): boolean => {
    const latex = fieldRefs.current[field.id]?.getLatex() || '';
    if (!latex.trim()) return false;
    return verifyAnswer(latex, field.latex, field.mathJson, field.type);
  };

  const handleCheck = () => {
    const newFeedback: Record<string, 'idle' | 'success' | 'error'> = {};
    let allCorrect = true;

    for (const field of answerFields) {
      const correct = verifyField(field);
      newFeedback[field.id] = correct ? 'success' : 'error';
      if (!correct) allCorrect = false;
    }

    setFeedback(newFeedback);

    if (allCorrect) {
      const totalXp = solutionRevealed ? 0 : xpPerField * answerFields.length;
      onComplete(totalXp);
    }
  };

  const handleSelfComplete = () => {
    const totalXp = solutionRevealed ? 0 : xpPerField * Math.max(answerFields.length, 1);
    onComplete(totalXp);
  };

  if (completed) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-5 flex items-center gap-3">
        <CheckCircle className="w-6 h-6 text-green-600 shrink-0" />
        <div>
          <p className="font-semibold text-green-800">Problème résolu</p>
          <p className="text-sm text-green-700">Tu as déjà gagné les points pour ce problème.</p>
        </div>
      </div>
    );
  }

  if (answerFields.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-orange-200 p-5 shadow-sm">
        <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          Valider ta résolution
        </h3>
        <p className="text-sm text-gray-600 mb-3">
          Ce problème n&apos;a pas de réponse automatique. Tu peux le marquer comme résolu toi-même.
        </p>
        <Button onClick={handleSelfComplete} className="bg-orange-600 hover:bg-orange-700">
          <CheckCircle className="w-4 h-4 mr-2" />
          J&apos;ai résolu ce problème
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-orange-200 p-5 shadow-sm space-y-5">
      <h3 className="font-bold text-gray-900 flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-amber-500" />
        Ta réponse
        <span className="text-xs font-normal text-gray-500 ml-auto">
          {solutionRevealed ? '0 XP (solution visible)' : `+${xpPerField} XP par champ`}
        </span>
      </h3>

      {solutionRevealed && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-sm text-amber-800 flex items-center gap-2">
          <Lightbulb className="w-4 h-4" />
          La solution est visible : aucun XP ne sera attribué pour ce problème.
        </div>
      )}

      {answerFields.map((field) => (
        <div key={field.id} className="space-y-2">
          <MathInput
            ref={(el) => { fieldRefs.current[field.id] = el; }}
            label={field.label}
            placeholder={`Saisis ${field.label.toLowerCase()}...`}
            allowedButtons={field.allowedButtons}
            className={cn(
              feedback[field.id] === 'success' && '[&_math-field]:border-green-500 [&_math-field]:ring-1 [&_math-field]:ring-green-500',
              feedback[field.id] === 'error' && '[&_math-field]:border-red-500 [&_math-field]:ring-1 [&_math-field]:ring-red-500'
            )}
          />

          <MathToolbar
            onInsert={(latex) => fieldRefs.current[field.id]?.insert(latex)}
            allowedButtons={field.allowedButtons}
            className="bg-gray-50 rounded-lg p-3 border border-gray-100"
          />

          {feedback[field.id] === 'success' && (
            <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-sm">
              <CheckCircle className="w-4 h-4" />
              <span>Bonne réponse !</span>
            </div>
          )}

          {feedback[field.id] === 'error' && (
            <div className="flex items-center gap-2 text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm">
              <XCircle className="w-4 h-4" />
              <span>Mauvaise réponse pour « {field.label} », réessaie.</span>
            </div>
          )}
        </div>
      ))}

      <Button onClick={handleCheck} className="w-full bg-orange-600 hover:bg-orange-700">
        Valider toutes les réponses
      </Button>

      {problem.hints && problem.hints.length > 0 && (
        <div className="pt-4 border-t border-gray-100">
          {!showHint ? (
            <button
              onClick={() => setShowHint(true)}
              className="flex items-center gap-2 text-sm text-orange-700 hover:text-orange-800 font-medium"
            >
              <Lightbulb className="w-4 h-4" />
              Afficher un indice
            </button>
          ) : (
            <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 text-sm text-amber-800">
              <div className="font-medium flex items-center gap-1 mb-1">
                <Lightbulb className="w-4 h-4" /> Indice
              </div>
              {problem.hints[0].content}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
