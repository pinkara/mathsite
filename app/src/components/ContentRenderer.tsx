import { useEffect, useRef, useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check, Play, ExternalLink, Gamepad2, Video, Headphones, Download, Brain } from 'lucide-react';
import { MoleculeViewer } from './MoleculeViewer';
import { MoleculeVSEPR } from './MoleculeVSEPR';
import { MoleculeVSEPR3D } from './MoleculeVSEPR3D';
import { MoleculeJSmol } from './MoleculeJSmol';
import { MoleculeVSEPRViewer } from './MoleculeVSEPRViewer';
import { Molecule3Dmol } from './Molecule3Dmol';
import { Molecule3DmolEmbed } from './Molecule3DmolEmbed';
import { Molecule3DmolNative } from './Molecule3DmolNative';
import { MoleculeJSmolVSEPR } from './MoleculeJSmolVSEPR';
import { Molecule3DmolVSEPR } from './Molecule3DmolVSEPR';
import { Molecule3DmolVSEPREmbed } from './Molecule3DmolVSEPREmbed';
import { GlossaryTerm } from './GlossaryTerm';

interface ContentRendererProps {
  content: string;
  className?: string;
}

// Composant pour un bloc de code individuel
function CodeBlock({ code, language = 'python' }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenIDE = () => {
    // Encoder le code pour l'URL
    const encodedCode = encodeURIComponent(code);
    // Mapper shell/bash vers python pour l'IDE (car l'IDE ne supporte pas directement bash)
    const langForIde = language === 'shell' || language === 'bash' ? 'python' : (language === 'text' ? 'python' : language);
    const encodedLang = encodeURIComponent(langForIde);
    // Naviguer vers l'IDE avec les paramètres
    window.location.hash = `/ide?code=${encodedCode}&lang=${encodedLang}`;
  };

  // Langages supportés par l'IDE
  const supportedLanguages = ['python', 'javascript', 'shell', 'bash'];
  const canOpenIDE = supportedLanguages.includes(language) || language === 'text';

  return (
    <div className="rounded-lg overflow-hidden border border-gray-200 my-4 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <span className="ml-2 text-xs text-gray-500 font-mono uppercase">{language}</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Bouton IDE - petit et à côté de Copier */}
          {canOpenIDE && (
            <button
              onClick={handleOpenIDE}
              className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-indigo-600 hover:text-indigo-900 hover:bg-indigo-100 rounded-md transition-colors"
              title="Tester dans l'IDE"
            >
              <Play className="w-3.5 h-3.5" />
              <span>IDE</span>
            </button>
          )}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-md transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-green-600" />
                <span className="text-green-600">Copié !</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copier</span>
              </>
            )}
          </button>
        </div>
      </div>
      
      {/* Code */}
      <SyntaxHighlighter
        language={language}
        style={oneLight}
        customStyle={{
          margin: 0,
          padding: '1rem',
          fontSize: '0.875rem',
          lineHeight: '1.6',
          backgroundColor: '#fafafa',
        }}
        showLineNumbers
        lineNumberStyle={{
          minWidth: '2.5em',
          paddingRight: '1em',
          color: '#9ca3af',
          textAlign: 'right',
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}

// === PINKARIUM LINK COMPONENT ===
interface PinkariumLinkProps {
  url: string;
  title?: string;
  description?: string;
}

function PinkariumLink({ url, title = 'Activité PINKARIUM', description }: PinkariumLinkProps) {
  const isExternal = url.startsWith('http');
  
  return (
    <a
      href={url}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      className="flex items-start gap-4 p-4 my-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg border border-pink-200 hover:border-pink-400 hover:shadow-md transition-all group cursor-pointer"
    >
      <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
        <Gamepad2 className="w-6 h-6 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-semibold text-pink-900 group-hover:text-pink-700 transition-colors">
            {title}
          </h4>
          <ExternalLink className="w-4 h-4 text-pink-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        {description && (
          <p className="text-sm text-pink-600 mt-1">{description}</p>
        )}
        <span className="text-xs text-pink-400 mt-2 inline-block">
          {isExternal ? 'Ouvrir dans PINKARIUM →' : 'Lancer l\'activité →'}
        </span>
      </div>
    </a>
  );
}

// === IFRAME ACTIVITY COMPONENT ===
interface IframeActivityProps {
  src: string;
  title?: string;
  height?: string;
  width?: string;
  credits?: string;
}

function IframeActivity({ src, title = 'Activité interactive', height = '400px', width = '100%', credits }: IframeActivityProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Convertir les URLs GeoGebra en URLs d'embed
  const getEmbedUrl = (url: string): string => {
    // GeoGebra Material URL (ex: https://www.geogebra.org/m/wemqzb3y)
    const geogebraMaterialMatch = url.match(/geogebra\.org\/m\/(\w+)/);
    if (geogebraMaterialMatch) {
      const materialId = geogebraMaterialMatch[1];
      return `https://www.geogebra.org/material/iframe/id/${materialId}`;
    }
    
    // GeoGebra Calculator URL
    if (url.includes('geogebra.org/graphing') || url.includes('geogebra.org/classic')) {
      return url;
    }
    
    // Autres URLs
    return url;
  };

  const embedUrl = getEmbedUrl(src);

  return (
    <div className="my-4 rounded-lg overflow-hidden border border-gray-200 bg-white shadow-sm">
      {title && (
        <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-sm font-medium text-gray-700">{title}</span>
          </div>
          <a
            href={src}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <ExternalLink className="w-3 h-3" />
            Plein écran
          </a>
        </div>
      )}
      <div className="relative" style={{ height, width }}>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
              <span className="text-sm text-gray-500">Chargement...</span>
            </div>
          </div>
        )}
        {hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-50 z-10">
            <div className="text-center px-4">
              <p className="text-red-600 font-medium">Erreur de chargement</p>
              <a
                href={src}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline mt-2 inline-block"
              >
                Ouvrir dans un nouvel onglet →
              </a>
            </div>
          </div>
        )}
        <iframe
          src={embedUrl}
          title={title}
          className="border-0 w-full h-full"
          style={{ width: '100%', height: '100%' }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
        />
      </div>
      {/* Credits */}
      {credits && (
        <div className="px-3 py-1.5 bg-gray-50 border-t border-gray-100">
          <p className="text-xs text-gray-500 italic">{credits}</p>
        </div>
      )}
    </div>
  );
}

// === VIDEO PLAYER COMPONENT ===
interface VideoPlayerProps {
  src: string;
  title?: string;
  poster?: string;
  credits?: string;
}

function VideoPlayer({ src, title, poster, credits }: VideoPlayerProps) {
  return (
    <div className="my-4 rounded-lg overflow-hidden border border-gray-200 bg-white shadow-sm">
      {title && (
        <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border-b border-gray-200">
          <Video className="w-4 h-4 text-red-500" />
          <span className="text-sm font-medium text-gray-700">{title}</span>
        </div>
      )}
      <div className="relative bg-black">
        <video
          src={src}
          poster={poster}
          controls
          className="w-full max-h-[500px]"
          preload="metadata"
        >
          Votre navigateur ne supporte pas la lecture de vidéos.
        </video>
      </div>
      {/* Credits */}
      {credits && (
        <div className="px-3 py-1.5 bg-gray-50 border-t border-gray-100">
          <p className="text-xs text-gray-500 italic">{credits}</p>
        </div>
      )}
    </div>
  );
}

// === AUDIO PLAYER COMPONENT ===
interface AudioPlayerProps {
  src: string;
  title?: string;
  credits?: string;
}

function AudioPlayer({ src, title, credits }: AudioPlayerProps) {
  return (
    <div className="my-4 rounded-lg overflow-hidden border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
          <Headphones className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          {title && (
            <p className="text-sm font-medium text-gray-800 truncate">{title}</p>
          )}
          <audio
            src={src}
            controls
            className="w-full mt-1"
            preload="metadata"
          >
            Votre navigateur ne supporte pas la lecture audio.
          </audio>
        </div>
      </div>
      {/* Credits */}
      {credits && (
        <div className="px-3 py-1.5 bg-gray-50 border-t border-gray-100">
          <p className="text-xs text-gray-500 italic">{credits}</p>
        </div>
      )}
    </div>
  );
}

// === ANKI DOWNLOAD BUTTON COMPONENT ===
interface AnkiDownloadProps {
  src: string;
  filename?: string;
  title?: string;
  description?: string;
}

function AnkiDownloadButton({ src, filename = 'flashcards.apkg', title = 'Flashcards Anki', description }: AnkiDownloadProps) {
  return (
    <a
      href={src}
      download={filename}
      className="flex items-start gap-4 p-4 my-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200 hover:border-blue-400 hover:shadow-md transition-all group cursor-pointer"
    >
      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
        <Brain className="w-6 h-6 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-semibold text-blue-900 group-hover:text-blue-700 transition-colors">
            {title}
          </h4>
          <Download className="w-4 h-4 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        {description && (
          <p className="text-sm text-blue-600 mt-1">{description}</p>
        )}
        <span className="text-xs text-blue-400 mt-2 inline-block">
          Télécharger le fichier .apkg →
        </span>
      </div>
    </a>
  );
}

// === IMAGE WITH CREDITS COMPONENT ===
interface ImageWithCreditsProps {
  src: string;
  alt?: string;
  credits?: string;
  style?: React.CSSProperties;
}

function ImageWithCredits({ src, alt = '', credits, style }: ImageWithCreditsProps) {
  return (
    <figure className="my-4">
      <img 
        src={src} 
        alt={alt} 
        style={{ maxWidth: '100%', ...style }}
        className="rounded-lg"
      />
      {credits && (
        <figcaption className="mt-1 text-xs text-gray-500 italic text-center">
          {credits}
        </figcaption>
      )}
    </figure>
  );
}

// Fonction pour parser le contenu et séparer texte/code/éléments spéciaux
type ContentPart = 
  | { type: 'html'; content: string }
  | { type: 'code'; content: string; language?: string }
  | { type: 'pinkarium'; url: string; title?: string; description?: string }
  | { type: 'iframe'; src: string; title?: string; height?: string; width?: string; credits?: string }
  | { type: 'video'; src: string; title?: string; poster?: string; credits?: string }
  | { type: 'audio'; src: string; title?: string; credits?: string }
  | { type: 'anki'; src: string; filename?: string; title?: string; description?: string }
  | { type: 'image'; src: string; alt?: string; credits?: string; style?: React.CSSProperties }
  | { type: 'molecule'; formula: string; title?: string; height?: string; credits?: string }
  | { type: 'moleculeVSEPR'; formula: string; title?: string; height?: string; credits?: string }
  | { type: 'moleculeVSEPR3D'; formula: string; title?: string; height?: string; credits?: string }
  | { type: 'moleculeJSmol'; formula: string; title?: string; height?: string; credits?: string }
  | { type: 'moleculeIframe'; formula: string; title?: string; height?: string; credits?: string }
  | { type: 'moleculeVSEPRViewer'; formula: string; title?: string; height?: string; credits?: string }
  | { type: 'molecule3Dmol'; formula: string; title?: string; height?: string; credits?: string }
  | { type: 'molecule3DmolEmbed'; formula: string; height?: string; credits?: string }
  | { type: 'molecule3DmolNative'; formula: string; height?: string; credits?: string }
  | { type: 'moleculeJSmolVSEPR'; formula: string; title?: string; height?: string; credits?: string }
  | { type: 'molecule3DmolVSEPR'; formula: string; title?: string; height?: string; credits?: string }
  | { type: 'molecule3DmolVSEPREmbed'; formula: string; height?: string; credits?: string; controls?: boolean }
  | { type: 'molecule3DmolVSEPRSimple'; formula: string; height?: string; credits?: string }
  | { type: 'glossary'; term: string; definition: string; content?: string };

function parseContent(content: string): ContentPart[] {
  const parts: ContentPart[] = [];
  
  // Regex pour détecter les différents types de contenu
  const codeBlockRegex = /<pre><code(?:\s+class=["']language-(\w+)["'])?\s*>([\s\S]*?)<\/code><\/pre>/gi;
  const pinkariumRegex = /<pinkarium-link\s+url=["']([^"']+)["'](?:\s+title=["']([^"]*)["'])?(?:\s+description=["']([^"]*)["'])?\s*\/>/gi;
  const iframeRegex = /<activity-iframe\s+src=["']([^"']+)["'](?:\s+title=["']([^"]*)["'])?(?:\s+height=["']([^"]*)["'])?(?:\s+width=["']([^"]*)["'])?(?:\s+credits=["']([^"]*)["'])?\s*\/>/gi;
  const videoRegex = /<video-player\s+src=["']([^"']+)["'](?:\s+title=["']([^"]*)["'])?(?:\s+poster=["']([^"]*)["'])?(?:\s+credits=["']([^"]*)["'])?\s*\/>/gi;
  const audioRegex = /<audio-player\s+src=["']([^"']+)["'](?:\s+title=["']([^"]*)["'])?(?:\s+credits=["']([^"]*)["'])?\s*\/>/gi;
  const ankiRegex = /<anki-download\s+src=["']([^"']+)["'](?:\s+filename=["']([^"]*)["'])?(?:\s+title=["']([^"]*)["'])?(?:\s+description=["']([^"]*)["'])?\s*\/>/gi;
  const imageRegex = /<img-with-credits\s+src=["']([^"']+)["'](?:\s+alt=["']([^"]*)["'])?(?:\s+credits=["']([^"]*)["'])?(?:\s+style=["']([^"]*)["'])?\s*\/>/gi;
  const moleculeRegex = /<molecule-viewer\s+formula=["']([^"']+)["'](?:\s+title=["']([^"]*)["'])?(?:\s+height=["']([^"]*)["'])?(?:\s+credits=["']([^"]*)["'])?\s*\/>/gi;
  const moleculeVSEPRRegex = /<molecule-vsepr\s+formula=["']([^"']+)["'](?:\s+title=["']([^"]*)["'])?(?:\s+height=["']([^"]*)["'])?(?:\s+credits=["']([^"]*)["'])?\s*\/>/gi;
  const moleculeVSEPR3DRegex = /<molecule-vsepr-3d\s+formula=["']([^"']+)["'](?:\s+title=["']([^"]*)["'])?(?:\s+height=["']([^"]*)["'])?(?:\s+credits=["']([^"]*)["'])?\s*\/>/gi;
  const moleculeJSmolRegex = /<molecule-jsmol\s+formula=["']([^"']+)["'](?:\s+title=["']([^"]*)["'])?(?:\s+height=["']([^"]*)["'])?(?:\s+credits=["']([^"]*)["'])?\s*\/>/gi;
  const moleculeIframeRegex = /<molecule-iframe\s+formula=["']([^"']+)["'](?:\s+title=["']([^"]*)["'])?(?:\s+height=["']([^"]*)["'])?(?:\s+credits=["']([^"]*)["'])?\s*\/>/gi;
  const moleculeVSEPRViewerRegex = /<molecule-vsepr-viewer\s+formula=["']([^"']+)["'](?:\s+title=["']([^"]*)["'])?(?:\s+height=["']([^"]*)["'])?(?:\s+credits=["']([^"]*)["'])?\s*\/>/gi;
  const molecule3DmolRegex = /<molecule-3dmol\s+formula=["']([^"']+)["'](?:\s+title=["']([^"]*)["'])?(?:\s+height=["']([^"]*)["'])?(?:\s+credits=["']([^"]*)["'])?\s*\/>/gi;
  const molecule3DmolEmbedRegex = /<molecule-3d-embed\s+formula=["']([^"']+)["'](?:\s+height=["']([^"]*)["'])?(?:\s+credits=["']([^"]*)["'])?\s*\/>/gi;
  const molecule3DmolNativeRegex = /<molecule-3d-native\s+formula=["']([^"']+)["'](?:\s+height=["']([^"]*)["'])?(?:\s+credits=["']([^"]*)["'])?\s*\/>/gi;
  const moleculeJSmolVSEPRRegex = /<molecule-jsmol-vsepr\s+formula=["']([^"']+)["'](?:\s+title=["']([^"]*)["'])?(?:\s+height=["']([^"]*)["'])?(?:\s+credits=["']([^"]*)["'])?\s*\/>/gi;
  const molecule3DmolVSEPRRegex = /<molecule-3dmol-vsepr\s+formula=["']([^"']+)["'](?:\s+title=["']([^"]*)["'])?(?:\s+height=["']([^"]*)["'])?(?:\s+credits=["']([^"]*)["'])?\s*\/>/gi;
  const molecule3DmolVSEPREmbedRegex = /<molecule-3d-vsepr\s+formula=["']([^"']+)["'](?:\s+height=["']([^"]*)["'])?(?:\s+credits=["']([^"]*)["'])?(?:\s+controls=["']([^"]*)["'])?\s*\/>/gi;
  const molecule3DmolVSEPRSimpleRegex = /<molecule-3d-simple\s+formula=["']([^"']+)["'](?:\s+height=["']([^"]*)["'])?(?:\s+credits=["']([^"]*)["'])?\s*\/>/gi;
  const glossaryRegex = /<glossary-term\s+term=["']([^"']+)["']\s+definition=["']([^"]*)["']\s*>(.*?)<\/glossary-term>/gi;
  
  // Combiner tous les regex avec leur type
  const allRegexes: Array<{ regex: RegExp; type: string }> = [
    { regex: codeBlockRegex, type: 'code' },
    { regex: pinkariumRegex, type: 'pinkarium' },
    { regex: iframeRegex, type: 'iframe' },
    { regex: videoRegex, type: 'video' },
    { regex: audioRegex, type: 'audio' },
    { regex: ankiRegex, type: 'anki' },
    { regex: imageRegex, type: 'image' },
    { regex: moleculeRegex, type: 'molecule' },
    { regex: moleculeVSEPRRegex, type: 'moleculeVSEPR' },
    { regex: moleculeVSEPR3DRegex, type: 'moleculeVSEPR3D' },
    { regex: moleculeJSmolRegex, type: 'moleculeJSmol' },
    { regex: moleculeIframeRegex, type: 'moleculeIframe' },
    { regex: moleculeVSEPRViewerRegex, type: 'moleculeVSEPRViewer' },
    { regex: molecule3DmolRegex, type: 'molecule3Dmol' },
    { regex: molecule3DmolEmbedRegex, type: 'molecule3DmolEmbed' },
    { regex: molecule3DmolNativeRegex, type: 'molecule3DmolNative' },
    { regex: moleculeJSmolVSEPRRegex, type: 'moleculeJSmolVSEPR' },
    { regex: molecule3DmolVSEPRRegex, type: 'molecule3DmolVSEPR' },
    { regex: molecule3DmolVSEPREmbedRegex, type: 'molecule3DmolVSEPREmbed' },
    { regex: molecule3DmolVSEPRSimpleRegex, type: 'molecule3DmolVSEPRSimple' },
    { regex: glossaryRegex, type: 'glossary' },
  ];
  
  let lastIndex = 0;
  
  // Fonction pour trouver le prochain match parmi tous les regex
  const findNextMatch = (startIndex: number): { match: RegExpExecArray; type: string } | null => {
    let nextMatch: { match: RegExpExecArray; type: string } | null = null;
    let earliestIndex = Infinity;
    
    for (const { regex, type } of allRegexes) {
      regex.lastIndex = startIndex;
      const match = regex.exec(content);
      if (match && match.index < earliestIndex) {
        earliestIndex = match.index;
        nextMatch = { match, type };
      }
    }
    
    return nextMatch;
  };
  
  let nextMatch = findNextMatch(0);
  
  while (nextMatch) {
    const { match, type } = nextMatch;
    
    // Ajouter le texte HTML avant le match
    if (match.index > lastIndex) {
      const textBefore = content.slice(lastIndex, match.index);
      if (textBefore.trim()) {
        parts.push({ type: 'html', content: textBefore });
      }
    }
    
    // Traiter selon le type
    switch (type) {
      case 'code': {
        const language = match[1] || 'text';
        const code = match[2]
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&amp;/g, '&')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'");
        parts.push({ type: 'code', content: code, language });
        break;
      }
      case 'pinkarium': {
        parts.push({
          type: 'pinkarium',
          url: match[1],
          title: match[2],
          description: match[3],
        });
        break;
      }
      case 'iframe': {
        parts.push({
          type: 'iframe',
          src: match[1],
          title: match[2],
          height: match[3],
          width: match[4],
          credits: match[5],
        });
        break;
      }
      case 'video': {
        parts.push({
          type: 'video',
          src: match[1],
          title: match[2],
          poster: match[3],
          credits: match[4],
        });
        break;
      }
      case 'audio': {
        parts.push({
          type: 'audio',
          src: match[1],
          title: match[2],
          credits: match[3],
        });
        break;
      }
      case 'anki': {
        parts.push({
          type: 'anki',
          src: match[1],
          filename: match[2],
          title: match[3],
          description: match[4],
        });
        break;
      }
      case 'image': {
        // Parser le style inline
        let parsedStyle: React.CSSProperties | undefined;
        if (match[4]) {
          try {
            parsedStyle = match[4].split(';').reduce((acc, style) => {
              const [key, value] = style.split(':').map(s => s.trim());
              if (key && value) {
                // Convertir camelCase pour les propriétés CSS
                const camelKey = key.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
                (acc as any)[camelKey] = value;
              }
              return acc;
            }, {} as React.CSSProperties);
          } catch (e) {
            parsedStyle = undefined;
          }
        }
        parts.push({
          type: 'image',
          src: match[1],
          alt: match[2],
          credits: match[3],
          style: parsedStyle,
        });
        break;
      }
      case 'molecule': {
        parts.push({
          type: 'molecule',
          formula: match[1],
          title: match[2],
          height: match[3],
          credits: match[4],
        });
        break;
      }
      case 'moleculeVSEPR': {
        parts.push({
          type: 'moleculeVSEPR',
          formula: match[1],
          title: match[2],
          height: match[3],
          credits: match[4],
        });
        break;
      }
      case 'moleculeVSEPR3D': {
        parts.push({
          type: 'moleculeVSEPR3D',
          formula: match[1],
          title: match[2],
          height: match[3],
          credits: match[4],
        });
        break;
      }
      case 'moleculeJSmol': {
        parts.push({
          type: 'moleculeJSmol',
          formula: match[1],
          title: match[2],
          height: match[3],
          credits: match[4],
        });
        break;
      }
      case 'moleculeIframe': {
        parts.push({
          type: 'moleculeIframe',
          formula: match[1],
          title: match[2],
          height: match[3],
          credits: match[4],
        });
        break;
      }
      case 'moleculeVSEPRViewer': {
        parts.push({
          type: 'moleculeVSEPRViewer',
          formula: match[1],
          title: match[2],
          height: match[3],
          credits: match[4],
        });
        break;
      }
      case 'molecule3Dmol': {
        parts.push({
          type: 'molecule3Dmol',
          formula: match[1],
          title: match[2],
          height: match[3],
          credits: match[4],
        });
        break;
      }
      case 'molecule3DmolEmbed': {
        parts.push({
          type: 'molecule3DmolEmbed',
          formula: match[1],
          height: match[2],
          credits: match[3],
        });
        break;
      }
      case 'molecule3DmolNative': {
        parts.push({
          type: 'molecule3DmolNative',
          formula: match[1],
          height: match[2],
          credits: match[3],
        });
        break;
      }
      case 'moleculeJSmolVSEPR': {
        parts.push({
          type: 'moleculeJSmolVSEPR',
          formula: match[1],
          title: match[2],
          height: match[3],
          credits: match[4],
        });
        break;
      }
      case 'molecule3DmolVSEPR': {
        parts.push({
          type: 'molecule3DmolVSEPR',
          formula: match[1],
          title: match[2],
          height: match[3],
          credits: match[4],
        });
        break;
      }
      case 'molecule3DmolVSEPREmbed': {
        parts.push({
          type: 'molecule3DmolVSEPREmbed',
          formula: match[1],
          height: match[2],
          credits: match[3],
          controls: match[4] !== 'false',
        });
        break;
      }
      case 'molecule3DmolVSEPRSimple': {
        parts.push({
          type: 'molecule3DmolVSEPRSimple',
          formula: match[1],
          height: match[2],
          credits: match[3],
        });
        break;
      }
      case 'glossary': {
        parts.push({
          type: 'glossary',
          term: match[1],
          definition: match[2] || '',
          content: match[3],
        });
        break;
      }
    }
    
    lastIndex = match.index + match[0].length;
    nextMatch = findNextMatch(lastIndex);
  }
  
  // Ajouter le texte restant après le dernier match
  if (lastIndex < content.length) {
    const textAfter = content.slice(lastIndex);
    if (textAfter.trim()) {
      parts.push({ type: 'html', content: textAfter });
    }
  }
  
  // Si aucun élément spécial trouvé, retourner le contenu complet
  if (parts.length === 0) {
    parts.push({ type: 'html', content });
  }
  
  return parts;
}

// Composant principal
export function ContentRenderer({ content, className = '' }: ContentRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const parsedParts = parseContent(content);

  useEffect(() => {
    // Charger MathJax si nécessaire
    if (typeof window !== 'undefined' && !(window as any).MathJax) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js';
      script.async = true;
      script.id = 'mathjax-script';
      
      (window as any).MathJax = {
        tex: {
          inlineMath: [['$', '$'], ['\\(', '\\)']],
          displayMath: [['$$', '$$'], ['\\[', '\\]']],
        },
        svg: {
          fontCache: 'global',
        },
      };
      
      script.onload = () => {
        if (containerRef.current && (window as any).MathJax?.typesetPromise) {
          (window as any).MathJax.typesetPromise([containerRef.current]).catch(console.error);
        }
      };
      document.head.appendChild(script);
    }
  }, []);

  useEffect(() => {
    // Typeset MathJax après chaque rendu
    let tries = 0;
    const tryTypeset = () => {
      if (containerRef.current && (window as any).MathJax?.typesetPromise) {
        (window as any).MathJax.typesetPromise([containerRef.current]).catch(console.error);
      } else if (tries < 5) {
        tries += 1;
        setTimeout(tryTypeset, 300);
      }
    };
    tryTypeset();
    
    // Transformer les boutons IDE en vrais boutons cliquables
    const setupIdeButtons = () => {
      if (!containerRef.current) return;
      
      const ideButtons = containerRef.current.querySelectorAll('.ide-button');
      ideButtons.forEach((button) => {
        const code = button.getAttribute('data-code');
        const language = button.getAttribute('data-language') || 'python';
        
        if (code) {
          // Styliser le bouton
          button.className = 'ide-button flex items-center justify-center gap-2 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200 hover:border-indigo-400 hover:shadow-sm transition-all cursor-pointer my-4';
          
          // Ajouter l'icône si pas déjà présente
          if (!button.querySelector('svg')) {
            button.innerHTML = `
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-indigo-600">
                <polyline points="4 17 10 11 4 5"></polyline>
                <line x1="12" y1="19" x2="20" y2="19"></line>
              </svg>
              <span class="text-indigo-900 font-medium">${button.textContent?.trim() || 'Tester dans l\'IDE'}</span>
            `;
          }
          
          // Ajouter le gestionnaire de clic
          button.addEventListener('click', () => {
            // Encoder le code pour l'URL
            const encodedCode = encodeURIComponent(code);
            const encodedLang = encodeURIComponent(language);
            // Naviguer vers l'IDE avec les paramètres
            window.location.hash = `/ide?code=${encodedCode}&lang=${encodedLang}`;
          });
        }
      });
    };
    
    // Attendre un peu que le DOM soit prêt
    setTimeout(setupIdeButtons, 100);
  }, [content]);

  return (
    <div ref={containerRef} className={`prose prose-gray max-w-none w-full ${className}`}>
      {parsedParts.map((part, index) => {
        switch (part.type) {
          case 'code':
            return <CodeBlock key={index} code={part.content} language={part.language} />;
          case 'pinkarium':
            return (
              <PinkariumLink
                key={index}
                url={part.url}
                title={part.title}
                description={part.description}
              />
            );
          case 'iframe':
            return (
              <IframeActivity
                key={index}
                src={part.src}
                title={part.title}
                height={part.height}
                width={part.width}
                credits={part.credits}
              />
            );
          case 'video':
            return (
              <VideoPlayer
                key={index}
                src={part.src}
                title={part.title}
                poster={part.poster}
                credits={part.credits}
              />
            );
          case 'audio':
            return (
              <AudioPlayer
                key={index}
                src={part.src}
                title={part.title}
                credits={part.credits}
              />
            );
          case 'anki':
            return (
              <AnkiDownloadButton
                key={index}
                src={part.src}
                filename={part.filename}
                title={part.title}
                description={part.description}
              />
            );
          case 'image':
            return (
              <ImageWithCredits
                key={index}
                src={part.src}
                alt={part.alt}
                credits={part.credits}
                style={part.style}
              />
            );
          case 'molecule':
            return (
              <MoleculeViewer
                key={index}
                formula={part.formula}
                title={part.title}
                height={part.height}
                credits={part.credits}
              />
            );
          case 'moleculeVSEPR':
            return (
              <MoleculeVSEPR
                key={index}
                formula={part.formula}
                title={part.title}
                height={part.height}
                credits={part.credits}
              />
            );
          case 'moleculeVSEPR3D':
            return (
              <MoleculeVSEPR3D
                key={index}
                formula={part.formula}
                title={part.title}
                height={part.height}
                credits={part.credits}
              />
            );
          case 'moleculeJSmol':
            return (
              <MoleculeJSmol
                key={index}
                formula={part.formula}
                title={part.title}
                height={part.height}
                credits={part.credits}
              />
            );
          case 'moleculeIframe':
            return (
              <MoleculeJSmol
                key={index}
                formula={part.formula}
                title={part.title}
                height={part.height}
                credits={part.credits}
                iframe={true}
              />
            );
          case 'moleculeVSEPRViewer':
            return (
              <MoleculeVSEPRViewer
                key={index}
                formula={part.formula}
                title={part.title}
                height={part.height}
                credits={part.credits}
              />
            );
          case 'molecule3Dmol':
            return (
              <Molecule3Dmol
                key={index}
                formula={part.formula}
                title={part.title}
                height={part.height}
                credits={part.credits}
              />
            );
          case 'molecule3DmolEmbed':
            return (
              <Molecule3DmolEmbed
                key={index}
                formula={part.formula}
                height={part.height}
                credits={part.credits}
              />
            );
          case 'molecule3DmolNative':
            return (
              <Molecule3DmolNative
                key={index}
                formula={part.formula}
                height={part.height}
                credits={part.credits}
              />
            );
          case 'moleculeJSmolVSEPR':
            return (
              <MoleculeJSmolVSEPR
                key={index}
                formula={part.formula}
                title={part.title}
                height={part.height}
                credits={part.credits}
              />
            );
          case 'molecule3DmolVSEPR':
            return (
              <Molecule3DmolVSEPR
                key={index}
                formula={part.formula}
                title={part.title}
                height={part.height}
                credits={part.credits}
              />
            );
          case 'molecule3DmolVSEPREmbed':
            return (
              <Molecule3DmolVSEPREmbed
                key={index}
                formula={part.formula}
                height={part.height}
                credits={part.credits}
                controls={part.controls ?? true}
              />
            );
          case 'molecule3DmolVSEPRSimple':
            return (
              <Molecule3DmolVSEPREmbed
                key={index}
                formula={part.formula}
                height={part.height}
                credits={part.credits}
                controls={false}
              />
            );
          case 'glossary':
            return (
              <GlossaryTerm
                key={index}
                term={part.term}
                definition={part.definition}
              >
                {part.content}
              </GlossaryTerm>
            );
          case 'html':
          default:
            return <div key={index} dangerouslySetInnerHTML={{ __html: part.content }} />;
        }
      })}
    </div>
  );
}

export default ContentRenderer;
