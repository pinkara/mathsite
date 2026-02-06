import { 
  Calculator, 
  Globe, 
  FlaskConical, 
  Atom,
  BookOpen, 
  Music, 
  Languages,
  Monitor,
  GraduationCap,
  ExternalLink,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SubjectSite {
  id: string;
  name: string;
  fullName: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgGradient: string;
  url: string;
  status: 'available' | 'coming-soon' | 'beta';
}

const subjects: SubjectSite[] = [
  {
    id: 'maths',
    name: 'MathUnivers',
    fullName: 'Mathématiques',
    description: 'Cours, exercices et formules de mathématiques de la 6e à la Terminale.',
    icon: <Calculator className="w-8 h-8" />,
    color: 'from-blue-500 to-indigo-600',
    bgGradient: 'from-blue-50 to-indigo-100',
    url: window.location.origin,
    status: 'available'
  },
  {
    id: 'physto',
    name: 'PhysiChem',
    fullName: 'Physique-Chimie',
    description: 'Expériences, simulations et cours de physique-chimie.',
    icon: <FlaskConical className="w-8 h-8" />,
    color: 'from-purple-500 to-pink-600',
    bgGradient: 'from-purple-50 to-pink-100',
    url: '#',
    status: 'coming-soon'
  },
  {
    id: 'es',
    name: 'ScientiFic',
    fullName: 'Enseignement Scientifique',
    description: 'Sciences et démarche scientifique pour le tronc commun.',
    icon: <Atom className="w-8 h-8" />,
    color: 'from-emerald-500 to-teal-600',
    bgGradient: 'from-emerald-50 to-teal-100',
    url: '#',
    status: 'coming-soon'
  },
  {
    id: 'nsi',
    name: 'CodeUnivers',
    fullName: 'NSI - Informatique',
    description: 'Programmation Python, JavaScript et concepts informatiques.',
    icon: <Monitor className="w-8 h-8" />,
    color: 'from-slate-600 to-slate-800',
    bgGradient: 'from-slate-50 to-gray-100',
    url: '#',
    status: 'coming-soon'
  },
  {
    id: 'histgeo',
    name: 'HistoGeo',
    fullName: 'Histoire-Géographie + EMC',
    description: 'Cours d\'histoire, géographie et enseignement moral et civique.',
    icon: <Globe className="w-8 h-8" />,
    color: 'from-amber-500 to-orange-600',
    bgGradient: 'from-amber-50 to-orange-100',
    url: '#',
    status: 'coming-soon'
  },
  {
    id: 'francais',
    name: 'Littéraire',
    fullName: 'Français',
    description: 'Littérature, grammaire, méthodologie et analyse de textes.',
    icon: <BookOpen className="w-8 h-8" />,
    color: 'from-red-500 to-rose-600',
    bgGradient: 'from-red-50 to-rose-100',
    url: '#',
    status: 'coming-soon'
  },
  {
    id: 'anglais',
    name: 'EnglishPlus',
    fullName: 'Anglais',
    description: 'Cours d\'anglais, vocabulaire et culture anglo-saxonne.',
    icon: <Languages className="w-8 h-8" />,
    color: 'from-cyan-500 to-blue-600',
    bgGradient: 'from-cyan-50 to-blue-100',
    url: '#',
    status: 'coming-soon'
  },
  {
    id: 'allemand',
    name: 'DeutschUnivers',
    fullName: 'Allemand',
    description: 'Cours d\'allemand, grammaire et culture germanique.',
    icon: <GraduationCap className="w-8 h-8" />,
    color: 'from-yellow-500 to-amber-600',
    bgGradient: 'from-yellow-50 to-amber-100',
    url: '#',
    status: 'coming-soon'
  },
  {
    id: 'musique',
    name: 'Harmonie',
    fullName: 'Musique',
    description: 'Théorie musicale, histoire de la musique et pratique.',
    icon: <Music className="w-8 h-8" />,
    color: 'from-violet-500 to-purple-600',
    bgGradient: 'from-violet-50 to-purple-100',
    url: '#',
    status: 'coming-soon'
  }
];

export function SubjectsPortal() {
  const availableSubjects = subjects.filter(s => s.status === 'available');
  const comingSoonSubjects = subjects.filter(s => s.status === 'coming-soon');

  const handleClick = (subject: SubjectSite) => {
    if (subject.status === 'available') {
      window.location.href = subject.url;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center p-2 sm:p-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-xl sm:rounded-2xl mb-2 sm:mb-4">
              <GraduationCap className="w-7 h-7 sm:w-10 sm:h-10 text-white" />
            </div>
            <h1 className="text-xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-1.5 sm:mb-3">
              Portail des Matières
            </h1>
            <p className="text-xs sm:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto px-1 sm:px-0 leading-relaxed">
              Accédez à tous les sites éducatifs de l'écosystème Univers. 
              Une plateforme complète pour réussir dans toutes les matières.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8 lg:py-12">
        {/* Section Disponible */}
        {availableSubjects.length > 0 && (
          <div className="mb-6 sm:mb-12">
            <h2 className="text-base sm:text-xl lg:text-2xl font-bold text-gray-900 mb-3 sm:mb-6 flex items-center gap-2">
              <span className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full"></span>
              Disponible maintenant
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5 lg:gap-6">
              {availableSubjects.map(subject => (
                <SubjectCard 
                  key={subject.id} 
                  subject={subject} 
                  onClick={() => handleClick(subject)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Section Prochainement */}
        <div>
          <h2 className="text-base sm:text-xl lg:text-2xl font-bold text-gray-900 mb-3 sm:mb-6 flex items-center gap-2">
            <span className="w-2 h-2 sm:w-3 sm:h-3 bg-amber-500 rounded-full"></span>
            Prochainement
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5 lg:gap-6">
            {comingSoonSubjects.map(subject => (
              <SubjectCard 
                key={subject.id} 
                subject={subject} 
                onClick={() => handleClick(subject)}
              />
            ))}
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-6 sm:mt-12 lg:mt-16 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-xl sm:rounded-3xl p-3.5 sm:p-6 lg:p-8 text-white">
          <div className="text-center">
            <h3 className="text-base sm:text-xl lg:text-2xl font-bold mb-1.5 sm:mb-4">
              Une plateforme unifiée pour tous les élèves
            </h3>
            <p className="text-xs sm:text-base lg:text-lg text-white/90 max-w-3xl mx-auto mb-3 sm:mb-6 leading-relaxed">
              Chaque site est conçu avec la même philosophie : des contenus de qualité, 
              une interface moderne et des outils interactifs pour faciliter l'apprentissage.
              Rejoignez-nous dans cette aventure éducative !
            </p>
            <div className="flex flex-wrap justify-center gap-1.5 sm:gap-4 text-[10px] sm:text-sm">
              <span className="px-2.5 py-1 sm:px-4 sm:py-2 bg-white/20 rounded-full">
                {subjects.length} matières
              </span>
              <span className="px-2.5 py-1 sm:px-4 sm:py-2 bg-white/20 rounded-full">
                100% gratuit
              </span>
              <span className="px-2.5 py-1 sm:px-4 sm:py-2 bg-white/20 rounded-full">
                Sans publicité
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface SubjectCardProps {
  subject: SubjectSite;
  onClick: () => void;
}

function SubjectCard({ subject, onClick }: SubjectCardProps) {
  const isAvailable = subject.status === 'available';
  const isBeta = subject.status === 'beta';

  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative bg-white rounded-2xl border-2 overflow-hidden transition-all duration-300",
        isAvailable 
          ? "border-gray-200 hover:border-transparent hover:shadow-xl cursor-pointer hover:-translate-y-1" 
          : "border-gray-100 opacity-75 cursor-not-allowed"
      )}
    >
      {/* Background Gradient on Hover */}
      <div 
        className={cn(
          "absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300",
          subject.bgGradient,
          isAvailable && "group-hover:opacity-100"
        )}
      />

      <div className="relative p-3.5 sm:p-5 lg:p-6">
        {/* Status Badge */}
        <div className="absolute top-2.5 right-2.5 sm:top-4 sm:right-4">
          {isAvailable ? (
            <span className="px-1.5 py-0.5 sm:px-3 sm:py-1 text-[9px] sm:text-xs font-semibold text-green-700 bg-green-100 rounded-full">
              En ligne
            </span>
          ) : isBeta ? (
            <span className="px-1.5 py-0.5 sm:px-3 sm:py-1 text-[9px] sm:text-xs font-semibold text-purple-700 bg-purple-100 rounded-full">
              Bêta
            </span>
          ) : (
            <span className="px-1.5 py-0.5 sm:px-3 sm:py-1 text-[9px] sm:text-xs font-semibold text-amber-700 bg-amber-100 rounded-full">
              Bientôt
            </span>
          )}
        </div>

        {/* Icon */}
        <div 
          className={cn(
            "w-10 h-10 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-lg sm:rounded-2xl flex items-center justify-center mb-2.5 sm:mb-4 transition-transform duration-300",
            "bg-gradient-to-r",
            subject.color,
            isAvailable && "group-hover:scale-110"
          )}
        >
          <div className="text-white scale-[0.65] sm:scale-90 lg:scale-100">
            {subject.icon}
          </div>
        </div>

        {/* Content */}
        <h3 className="text-base sm:text-xl font-bold text-gray-900 mb-0.5 sm:mb-1">
          {subject.name}
        </h3>
        <p className="text-[11px] sm:text-sm text-gray-500 mb-1.5 sm:mb-3">
          {subject.fullName}
        </p>
        <p className="text-gray-600 text-[11px] sm:text-sm leading-relaxed mb-2.5 sm:mb-4 line-clamp-2 sm:line-clamp-none">
          {subject.description}
        </p>

        {/* Action */}
        <div className="flex items-center gap-2 text-xs sm:text-sm font-medium">
          {isAvailable ? (
            <>
              <span className={cn(
                "bg-gradient-to-r bg-clip-text text-transparent",
                subject.color
              )}>
                Accéder au site
              </span>
              <ArrowRight className={cn(
                "w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform",
                "bg-gradient-to-r bg-clip-text",
                subject.color,
                "group-hover:translate-x-1"
              )} style={{ color: 'inherit' }} />
            </>
          ) : (
            <span className="text-gray-400">
              En développement
            </span>
          )}
        </div>
      </div>

      {/* External Link Indicator */}
      {isAvailable && (
        <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
        </div>
      )}
    </div>
  );
}
