import { useState, useMemo, useRef, useEffect } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  Search,
  Filter,
  X,
  ExternalLink,
  BookOpen,
  Puzzle,
  Calculator,
  Clock,
  Lightbulb,
  TrendingUp,
  Target,
  Calendar,
  Music,
  Triangle,
  Edit3,
  Grid3x3,
  Hash,
  Layers,
  Activity,
  Cpu,
  Globe,
  Infinity,
  Users,
  GitBranch,
  Award,
  BrainCircuit,
  User,
  History,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import type { TimelineEvent, TimelinePeriod, Course, Problem, Formula } from '@/types';

interface TimelinePageProps {
  events: TimelineEvent[];
  periods?: TimelinePeriod[];
  courses: Course[];
  problems: Problem[];
  formulas: Formula[];
  isAdmin: boolean;
  onNavigate: (route: string, params?: any) => void;
}

const iconMap: Record<string, LucideIcon> = {
  BookOpen,
  Puzzle,
  Calculator,
  Clock,
  Lightbulb,
  TrendingUp,
  Target,
  Calendar,
  Music,
  Triangle,
  Edit3,
  Grid3x3,
  Hash,
  Layers,
  Activity,
  Cpu,
  Globe,
  Infinity,
  Users,
  GitBranch,
  Award,
  BrainCircuit,
  User,
  History,
};

const colorMap: Record<string, string> = {
  blue: '#3b82f6',
  purple: '#8b5cf6',
  green: '#10b981',
  orange: '#f97316',
  pink: '#ec4899',
  cyan: '#06b6d4',
  red: '#ef4444',
  amber: '#f59e0b',
};

const getYear = (dateStr: string): number => {
  const [yearPart] = dateStr.split('-');
  return parseInt(yearPart, 10);
};

const formatYear = (year: number): string => {
  if (year < 0) return `${Math.abs(year)} av. J.-C.`;
  return `${year}`;
};

const getPeriodFromYear = (year: number, periods: TimelinePeriod[]): TimelinePeriod | undefined => {
  return periods.reduce<TimelinePeriod | undefined>((best, period) => {
    if (year >= period.startYear && year < period.endYear) {
      return !best || period.startYear > best.startYear ? period : best;
    }
    return best;
  }, undefined);
};

function EventIcon({ name, className }: { name?: string; className?: string }) {
  const Icon = name && iconMap[name] ? iconMap[name] : Lightbulb;
  return <Icon className={className} />;
}

function DetailModal({
  event,
  events,
  onClose,
  onNavigate,
  onPrevious,
  onNext,
}: {
  event: TimelineEvent;
  events: TimelineEvent[];
  onClose: () => void;
  onNavigate: (route: string, params?: any) => void;
  onPrevious: () => void;
  onNext: () => void;
}) {
  const year = getYear(event.date);
  const color = colorMap[event.color] || '#3b82f6';

  const navigateToContent = () => {
    onClose();
    if (event.linkType === 'course' && event.linkId) {
      onNavigate('article', { type: 'course', id: event.linkId });
    } else if (event.linkType === 'problem' && event.linkId) {
      onNavigate('article', { type: 'problem', id: event.linkId });
    } else if (event.linkType === 'formula') {
      onNavigate('formulas');
    } else if (event.linkUrl) {
      window.open(event.linkUrl, '_blank');
    }
  };

  const currentIndex = events.findIndex(e => e.id === event.id);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-56">
          {event.image ? (
            <img
              src={event.image}
              alt={event.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <div
              className="w-full h-full"
              style={{ background: `linear-gradient(135deg, ${color}80, ${color})` }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center text-gray-800 transition-colors shadow-lg"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <span
                className="px-3 py-1 rounded-full text-sm font-bold text-white"
                style={{ backgroundColor: color }}
              >
                {event.displayDate || formatYear(year)}
              </span>
              <span className="px-3 py-1 rounded-full text-sm bg-white/90 text-gray-800 backdrop-blur">
                {event.category}
              </span>
              {event.period && (
                <span className="px-3 py-1 rounded-full text-sm bg-black/30 text-white backdrop-blur">
                  {event.period}
                </span>
              )}
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg">
              {event.title}
            </h2>
          </div>
        </div>

        <div className="p-6">
          {event.mathematician && (
            <div className="flex items-center gap-3 mb-5">
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center text-white"
                style={{ backgroundColor: color }}
              >
                <History className="w-5 h-5" />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Mathématicien·ne</p>
                <p className="text-gray-900 font-semibold">{event.mathematician}</p>
              </div>
            </div>
          )}

          <p className="text-gray-700 text-lg leading-relaxed mb-6">
            {event.description}
          </p>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <button
              onClick={navigateToContent}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-white transition-transform hover:scale-105"
              style={{ backgroundColor: color }}
            >
              {event.linkType === 'course' && <BookOpen className="w-4 h-4" />}
              {event.linkType === 'problem' && <Puzzle className="w-4 h-4" />}
              {event.linkType === 'formula' && <Calculator className="w-4 h-4" />}
              {event.linkType === 'external' && <ExternalLink className="w-4 h-4" />}
              {event.linkType === 'course' && 'Voir le cours'}
              {event.linkType === 'problem' && 'Résoudre le problème'}
              {event.linkType === 'formula' && 'Voir les formules'}
              {event.linkType === 'external' && 'En savoir plus'}
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={onPrevious}
                disabled={currentIndex <= 0}
                className="w-10 h-10 bg-gray-100 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed rounded-full flex items-center justify-center text-gray-700 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-gray-500 text-sm min-w-[3rem] text-center">
                {currentIndex + 1} / {events.length}
              </span>
              <button
                onClick={onNext}
                disabled={currentIndex >= events.length - 1}
                className="w-10 h-10 bg-gray-100 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed rounded-full flex items-center justify-center text-gray-700 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TimelinePage({ events, periods = [], courses: _courses, problems: _problems, formulas: _formulas, onNavigate }: TimelinePageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activePeriod, setActivePeriod] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const timelineRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);

  const categories = useMemo(() => {
    const cats = new Set(events.map(e => e.category));
    return Array.from(cats).sort();
  }, [events]);

  const filteredEvents = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return events.filter(event => {
      const matchesSearch =
        !query ||
        event.title.toLowerCase().includes(query) ||
        event.description.toLowerCase().includes(query) ||
        event.mathematician?.toLowerCase().includes(query) ||
        event.category.toLowerCase().includes(query);
      const eventPeriod = event.period || getPeriodFromYear(getYear(event.date), periods)?.name || null;
      const matchesPeriod = !activePeriod || eventPeriod === activePeriod;
      const matchesCategory = !activeCategory || event.category === activeCategory;
      return matchesSearch && matchesPeriod && matchesCategory;
    });
  }, [events, searchQuery, activePeriod, activeCategory, periods]);

  const groupedEvents = useMemo(() => {
    const groups: { period: TimelinePeriod | null; events: TimelineEvent[] }[] = [];
    filteredEvents.forEach(event => {
      const year = getYear(event.date);
      const period = getPeriodFromYear(year, periods) || null;
      const lastGroup = groups[groups.length - 1];
      if (lastGroup && lastGroup.period?.id === period?.id) {
        lastGroup.events.push(event);
      } else {
        groups.push({ period, events: [event] });
      }
    });
    return groups;
  }, [filteredEvents, periods]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedEvent(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const scrollToTop = () => {
    topRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const navigateEvent = (direction: number) => {
    if (!selectedEvent) return;
    const index = filteredEvents.findIndex(e => e.id === selectedEvent.id);
    const newIndex = index + direction;
    if (newIndex >= 0 && newIndex < filteredEvents.length) {
      setSelectedEvent(filteredEvents[newIndex]);
    }
  };

  const navigateToPeriod = (periodName: string) => {
    setActivePeriod(periodName === activePeriod ? null : periodName);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setActivePeriod(null);
    setActiveCategory(null);
  };

  const hasFilters = searchQuery || activePeriod || activeCategory;

  return (
    <div ref={topRef} className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 pb-20">
      {/* En-tête */}
      <div className="relative overflow-hidden bg-white border-b border-gray-200">
        <div className="absolute inset-0 opacity-30">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.1), transparent 50%),
                               radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.1), transparent 50%)`,
            }}
          />
        </div>
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg mb-6">
            <History className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight mb-4">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Histoire des mathématiques
            </span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Parcourez les grandes découvertes, les mathématicien·ne·s et les théories qui ont façonné notre compréhension du monde, de l'Antiquité à aujourd'hui.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
            <Clock className="w-4 h-4" />
            {filteredEvents.length} événement{filteredEvents.length > 1 ? 's' : ''} sur {events.length}
          </div>
        </div>
      </div>

      {/* Barre d'outils sticky */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Recherche */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un événement, un mathématicien, une catégorie..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-10 pr-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
              />
            </div>

            {/* Filtres */}
            <div className="flex gap-2 flex-wrap">
              <div className="relative group">
                <button
                  className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl text-sm font-medium transition-colors ${
                    activePeriod
                      ? 'bg-blue-50 border-blue-200 text-blue-700'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Filter className="w-4 h-4" />
                  {activePeriod || 'Période'}
                </button>
                <div className="absolute left-0 top-full mt-2 w-56 bg-white shadow-xl border border-gray-200 rounded-xl p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  <button
                    onClick={() => setActivePeriod(null)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      activePeriod === null ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Toutes les périodes
                  </button>
                  {periods.map(period => (
                    <button
                      key={period.id}
                      onClick={() => setActivePeriod(period.name)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        activePeriod === period.name ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span className="inline-block w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: period.color }} />
                      {period.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative group">
                <button
                  className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl text-sm font-medium transition-colors ${
                    activeCategory
                      ? 'bg-purple-50 border-purple-200 text-purple-700'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <TagIcon className="w-4 h-4" />
                  {activeCategory || 'Catégorie'}
                </button>
                <div className="absolute right-0 top-full mt-2 w-48 bg-white shadow-xl border border-gray-200 rounded-xl p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  <button
                    onClick={() => setActiveCategory(null)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      activeCategory === null ? 'bg-purple-50 text-purple-700' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Toutes les catégories
                  </button>
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        activeCategory === cat ? 'bg-purple-50 text-purple-700' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2.5 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Réinitialiser
                </button>
              )}
            </div>
          </div>

          {/* Navigation rapide par période */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-1 scrollbar-hide">
            {periods.map(period => (
              <button
                key={period.id}
                onClick={() => navigateToPeriod(period.name)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  activePeriod === period.name
                    ? 'text-white border-transparent'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
                style={activePeriod === period.name ? { backgroundColor: period.color } : undefined}
              >
                {period.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12" ref={timelineRef}>
        {filteredEvents.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Aucun événement trouvé</h3>
            <p className="text-gray-500">Essayez de modifier vos filtres ou votre recherche.</p>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-sm font-medium transition-colors"
              >
                Réinitialiser les filtres
              </button>
            )}
          </div>
        ) : (
          <div className="relative">
            {/* Ligne centrale */}
            <div
              className="absolute left-8 md:left-1/2 top-0 bottom-0 w-1 -translate-x-1/2 rounded-full"
              style={{
                background: 'linear-gradient(to bottom, #f59e0b, #8b5cf6, #ec4899, #3b82f6, #10b981, #8b5cf6, #ef4444, #06b6d4)',
              }}
            />

            <div className="space-y-12">
              {groupedEvents.map((group, groupIndex) => (
                <div key={group.period?.id || groupIndex} className="relative">
                  {/* Header de période */}
                  {group.period && (
                    <div className="flex justify-center mb-10">
                      <div
                        className="relative z-10 px-5 py-2 rounded-full text-sm font-bold text-white shadow-md"
                        style={{ backgroundColor: group.period.color }}
                      >
                        {group.period.name}
                        <span className="ml-2 opacity-80 font-normal">
                          {formatYear(group.period.startYear)} — {formatYear(group.period.endYear)}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Événements du groupe */}
                  <div className="space-y-10">
                    {group.events.map((event, eventIndex) => {
                      const year = getYear(event.date);
                      const color = colorMap[event.color] || '#3b82f6';
                      const isLeft = eventIndex % 2 === 0;

                      return (
                        <div
                          key={event.id}
                          className={`relative flex items-start md:items-center ${
                            isLeft ? 'md:flex-row' : 'md:flex-row-reverse'
                          }`}
                        >
                          {/* Point sur la ligne */}
                          <div className="absolute left-8 md:left-1/2 top-6 -translate-x-1/2 z-10">
                            <div
                              className="w-5 h-5 rounded-full border-4 border-white shadow-md"
                              style={{ backgroundColor: color }}
                            />
                          </div>

                          {/* Date mobile */}
                          <div className="md:hidden pl-20 pb-2">
                            <span
                              className="inline-block px-3 py-1 rounded-full text-xs font-bold text-white"
                              style={{ backgroundColor: color }}
                            >
                              {event.displayDate || formatYear(year)}
                            </span>
                          </div>

                          {/* Contenu */}
                          <div className={`w-full md:w-[calc(50%-3rem)] pl-20 md:pl-0 ${
                            isLeft ? 'md:pr-12 md:text-right' : 'md:pl-12 md:text-left'
                          }`}>
                            <button
                              onClick={() => setSelectedEvent(event)}
                              className="w-full text-left group"
                            >
                              <div
                                className={`bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 p-5 ${
                                  isLeft ? 'md:ml-auto' : ''
                                }`}
                                style={{ borderLeft: `4px solid ${color}` }}
                              >
                                <div className={`flex items-start gap-4 ${isLeft ? 'md:flex-row-reverse' : ''}`}>
                                  {event.image && (
                                    <div className="flex-shrink-0">
                                      <img
                                        src={event.image}
                                        alt={event.title}
                                        className="w-16 h-16 rounded-xl object-cover shadow-sm"
                                        onError={(e) => {
                                          (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                      />
                                    </div>
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <div className={`flex items-center gap-2 mb-1 ${isLeft ? 'md:justify-end' : ''}`}>
                                      <span
                                        className="hidden md:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold text-white"
                                        style={{ backgroundColor: color }}
                                      >
                                        {event.displayDate || formatYear(year)}
                                      </span>
                                      <span className="text-xs font-medium text-gray-500">
                                        {event.category}
                                      </span>
                                    </div>
                                    <div className={`flex items-center gap-2 ${isLeft ? 'md:justify-end' : ''}`}>
                                      <EventIcon name={event.icon} className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors leading-snug">
                                        {event.title}
                                      </h3>
                                    </div>
                                    {event.mathematician && (
                                      <p className="text-sm text-gray-500 mt-0.5">
                                        {event.mathematician}
                                      </p>
                                    )}
                                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                                      {event.description}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bouton retour en haut */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-40 w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110"
          aria-label="Retour en haut"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}

      {/* Modal */}
      {selectedEvent && (
        <DetailModal
          event={selectedEvent}
          events={filteredEvents}
          onClose={() => setSelectedEvent(null)}
          onNavigate={onNavigate}
          onPrevious={() => navigateEvent(-1)}
          onNext={() => navigateEvent(1)}
        />
      )}
    </div>
  );
}

function TagIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  );
}
