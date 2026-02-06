import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Brain, Download, ExternalLink, HelpCircle, Smartphone, Upload } from "lucide-react";

export function AnkiHelpDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="fixed bottom-20 right-4 z-40 w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center group">
          <Brain className="w-6 h-6 text-white" />
          <span className="absolute right-full mr-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Aide Anki
          </span>
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Brain className="w-6 h-6 text-blue-500" />
            Guide Anki - Flashcards
          </DialogTitle>
          <DialogDescription>
            Apprenez à utiliser Anki pour réviser efficacement avec nos flashcards
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Qu'est-ce qu'Anki ? */}
          <section className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 flex items-center gap-2 mb-2">
              <HelpCircle className="w-5 h-5" />
              Qu'est-ce qu'Anki ?
            </h3>
            <p className="text-sm text-blue-800">
              Anki est une application de flashcards intelligente qui utilise la répétition espacée 
              pour vous aider à mémoriser efficacement. C'est l'outil parfait pour réviser vos cours de mathématiques !
            </p>
          </section>

          {/* Installation */}
          <section>
            <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
              <Download className="w-5 h-5 text-green-500" />
              1. Installation
            </h3>
            <div className="space-y-2 text-sm text-gray-700">
              <p>Anki est disponible gratuitement sur toutes les plateformes :</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>
                  <strong>Ordinateur :</strong>{" "}
                  <a 
                    href="https://apps.ankiweb.net/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline inline-flex items-center gap-1"
                  >
                    Télécharger Anki <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
                <li>
                  <strong>Android :</strong> AnkiDroid (gratuit sur Google Play)
                </li>
                <li>
                  <strong>iPhone/iPad :</strong> AnkiMobile (payant sur App Store)
                </li>
              </ul>
            </div>
          </section>

          {/* Téléchargement des flashcards */}
          <section>
            <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
              <Brain className="w-5 h-5 text-purple-500" />
              2. Télécharger les flashcards
            </h3>
            <div className="space-y-2 text-sm text-gray-700">
              <p>Dans nos cours, recherchez le bouton :</p>
              <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200 my-2">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-blue-900">Flashcards Anki</p>
                  <p className="text-xs text-blue-600">Télécharger le fichier .apkg →</p>
                </div>
              </div>
              <p>
                Cliquez sur ce bouton pour télécharger le fichier <code className="bg-gray-100 px-1 rounded">.apkg</code> 
                contenant les flashcards du cours.
              </p>
            </div>
          </section>

          {/* Importation */}
          <section>
            <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
              <Upload className="w-5 h-5 text-orange-500" />
              3. Importer dans Anki
            </h3>
            <div className="space-y-3 text-sm text-gray-700">
              <div className="bg-gray-50 rounded-lg p-3">
                <h4 className="font-medium text-gray-800 mb-2">Sur ordinateur :</h4>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Ouvrez Anki</li>
                  <li>Cliquez sur <strong>Fichier → Importer</strong></li>
                  <li>Sélectionnez le fichier <code className="bg-gray-100 px-1 rounded">.apkg</code> téléchargé</li>
                  <li>Les flashcards sont maintenant dans votre collection !</li>
                </ol>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-3">
                <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                  <Smartphone className="w-4 h-4" />
                  Sur mobile (AnkiDroid) :
                </h4>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Téléchargez le fichier <code className="bg-gray-100 px-1 rounded">.apkg</code></li>
                  <li>Ouvrez le fichier depuis votre gestionnaire de fichiers</li>
                  <li>Sélectionnez <strong>Ouvrir avec AnkiDroid</strong></li>
                  <li>Les flashcards sont automatiquement importées !</li>
                </ol>
              </div>
            </div>
          </section>

          {/* Conseils d'utilisation */}
          <section>
            <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
              <span className="text-yellow-500">💡</span>
              Conseils d'utilisation
            </h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 ml-2">
              <li><strong>Révision quotidienne :</strong> Faites vos révisions tous les jours pour un apprentissage optimal</li>
              <li><strong>Ne trichez pas :</strong> Essayez vraiment de vous souvenir avant de voir la réponse</li>
              <li><strong>Soyez honnête :</strong> Cliquez sur "Difficile" ou "À revoir" si vous hésitez</li>
              <li><strong>Petites sessions :</strong> 10-15 minutes par jour suffisent</li>
              <li><strong>Ne surchargez pas :</strong> Commencez avec 10-20 nouvelles cartes par jour maximum</li>
            </ul>
          </section>

          {/* Liens utiles */}
          <section className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4">
            <h3 className="font-semibold text-purple-900 mb-3">Liens utiles</h3>
            <div className="flex flex-wrap gap-2">
              <a
                href="https://apps.ankiweb.net/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" size="sm" className="gap-1">
                  <Download className="w-4 h-4" />
                  Télécharger Anki
                </Button>
              </a>
              <a
                href="https://docs.ankiweb.net/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" size="sm" className="gap-1">
                  <ExternalLink className="w-4 h-4" />
                  Documentation officielle
                </Button>
              </a>
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
