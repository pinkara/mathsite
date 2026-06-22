declare module '@knight-lab/timelinejs' {
  export interface TimelineOptions {
    debug?: boolean;
    height?: number;
    width?: string;
    hash_bookmark?: boolean;
    default_bg_color?: { r: number; g: number; b: number } | string;
    scale_factor?: number;
    initial_zoom?: number;
    timenav_position?: 'bottom' | 'top';
    optimal_tick_width?: number;
    base_class?: string;
    trackResize?: boolean;
    marker_padding?: number;
    start_at_slide?: number;
    menubar_height?: number;
    use_bc?: boolean;
    language?: string;
  }

  export interface TimelineDate {
    year: number;
    month?: number;
    day?: number;
    display_date?: string;
  }

  export interface TimelineText {
    headline: string;
    text?: string;
  }

  export interface TimelineMedia {
    url: string;
    caption?: string;
    credit?: string;
    link?: string;
    thumbnail?: string;
  }

  export interface TimelineEvent {
    start_date: TimelineDate;
    end_date?: TimelineDate;
    text: TimelineText;
    media?: TimelineMedia;
    group?: string;
    background?: {
      color?: string;
      url?: string;
    };
    unique_id?: string;
  }

  export interface TimelineData {
    events: TimelineEvent[];
    title?: TimelineEvent;
  }

  export type TimelineEventType = 'change' | 'zoom' | 'loaded';

  export class Timeline {
    constructor(
      container: HTMLElement | string,
      data: TimelineData | string,
      options?: TimelineOptions
    );

    on(event: TimelineEventType, callback: (data: any) => void): void;
    off(event: TimelineEventType, callback?: (data: any) => void): void;
    
    goTo(n: number): void;
    goToPrev(): void;
    goToNext(): void;
    goToId(id: string): void;
    
    zoomIn(): void;
    zoomOut(): void;
    setZoom(level: number): void;
    
    getCurrentSlide(): number;
    getSlideCount(): number;
    
    current_id: string;
    current_slide: number;
  }

  export default Timeline;
}

declare module '@knight-lab/timelinejs/dist/css/timeline.css' {
  const content: string;
  export default content;
}
