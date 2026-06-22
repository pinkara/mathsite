import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import 'mathlive';
import type { MathfieldElement } from 'mathlive';
import { MathInputMenu } from '@/components/MathInputMenu';
import { cn } from '@/lib/utils';

export interface MathInputRef {
  insert: (latex: string) => void;
  getLatex: () => string;
  getMathJson: () => string;
}

interface MathInputProps {
  value?: string;
  defaultValue?: string;
  onChange?: (latex: string, mathJson: string) => void;
  onBlur?: (latex: string, mathJson: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  className?: string;
  label?: string;
  allowedButtons?: string[];
}

export const MathInput = forwardRef<MathInputRef, MathInputProps>(
  ({ value, defaultValue, onChange, onBlur, placeholder, readOnly, className, label, allowedButtons }, ref) => {
    const mathfieldRef = useRef<MathfieldElement | null>(null);
    const lastPropagatedValue = useRef(value ?? defaultValue ?? '');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
      setMounted(true);
    }, []);

    // Synchroniser la valeur contrôlée sans écraser la saisie en cours
    useEffect(() => {
      const mf = mathfieldRef.current;
      if (!mf || value === undefined) return;
      if (value !== lastPropagatedValue.current) {
        lastPropagatedValue.current = value;
        (mf as any).setValue(value, { suppressChangeNotifications: true });
      }
    }, [value]);

    useEffect(() => {
      const mf = mathfieldRef.current;
      if (!mf) return;

      const handler = (e: Event) => {
        const target = e.target as MathfieldElement;
        const latex = target.value;
        const mathJson = target.getValue('math-json');
        lastPropagatedValue.current = latex;
        onChange?.(latex, mathJson);
      };

      const blurHandler = () => {
        const mf = mathfieldRef.current;
        if (!mf) return;
        onBlur?.(mf.value, mf.getValue('math-json'));
      };

      mf.addEventListener('input', handler);
      mf.addEventListener('blur', blurHandler);
      return () => {
        mf.removeEventListener('input', handler);
        mf.removeEventListener('blur', blurHandler);
      };
    }, [onChange, onBlur]);

    useImperativeHandle(ref, () => ({
      insert: (latex: string) => {
        mathfieldRef.current?.executeCommand(['insert', latex, { focus: true, mode: 'math' }]);
      },
      getLatex: () => mathfieldRef.current?.value || '',
      getMathJson: () => mathfieldRef.current?.getValue('math-json') || '',
    }));

    if (!mounted) {
      return (
        <div className={className}>
          {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
          <div className="h-14 rounded-lg border border-gray-300 bg-gray-100 animate-pulse" />
        </div>
      );
    }

    return (
      <div className={className}>
        {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
        <div className="relative">
          {React.createElement('math-field', {
            ref: mathfieldRef,
            class: cn(
              'w-full min-h-[3.5rem] px-3 py-2 pr-10 rounded-lg border border-gray-300 focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-200 outline-none text-lg',
              readOnly && 'bg-gray-100'
            ),
            placeholder,
            readOnly,
          })}
          {!readOnly && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              <MathInputMenu
                onInsert={(latex) => mathfieldRef.current?.executeCommand(['insert', latex, { focus: true, mode: 'math' }])}
                allowedButtons={allowedButtons}
              />
            </div>
          )}
        </div>
      </div>
    );
  }
);

MathInput.displayName = 'MathInput';
