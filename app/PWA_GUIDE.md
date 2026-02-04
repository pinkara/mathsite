# 📱 Guide PWA - MathUnivers

MathUnivers est maintenant une **Progressive Web App (PWA)** ! Elle peut être installée sur téléphone et ordinateur comme une application native.

---

## ✨ Fonctionnalités PWA

- 📲 **Installation sur l'écran d'accueil** - Comme une vraie app
- 🔄 **Fonctionnement hors ligne** - Accès aux cours sans connexion
- 🚀 **Performance optimisée** - Chargement rapide avec cache
- 📱 **Interface adaptative** - Expérience fluide sur mobile

---

## 📲 Installation

### Sur Android (Chrome)

1. Ouvrez **Chrome** et allez sur `https://pinkara.github.io/mathsite/`
2. Attendez quelques secondes
3. Une bannière "Installer MathUnivers" apparaît en bas
4. Cliquez sur **"Installer"**
5. L'app s'ouvre en plein écran !

**Alternative :**
- Menu Chrome (3 points) → "Ajouter à l'écran d'accueil"

### Sur iPhone/iPad (Safari)

1. Ouvrez **Safari** et allez sur le site
2. Appuyez sur le bouton **Partager** (carré avec flèche)
3. Faites défiler et sélectionnez **"Sur l'écran d'accueil"**
4. Cliquez sur **"Ajouter"**
5. L'icône apparaît sur votre home screen !

### Sur Ordinateur (Chrome/Edge)

1. Ouvrez Chrome/Edge et allez sur le site
2. Une icône **+** apparaît dans la barre d'adresse
3. Cliquez dessus et confirmez l'installation
4. L'app s'ouvre dans une fenêtre sans barre d'adresse !

---

## 🧪 Tester la PWA

### Vérifier l'installation

**Sur téléphone :**
- L'app doit s'ouvrir en plein écran (sans barre d'adresse)
- L'icône ∑ (sigma) doit apparaître sur l'écran d'accueil

**Sur Chrome Desktop :**
- Ouvrez DevTools (F12)
- Onglet **"Lighthouse"**
- Cochez "Progressive Web App"
- Cliquez "Generate report"

### Tester le mode hors ligne

1. Installez l'app
2. Ouvrez quelques cours
3. Activez le **Mode Avion** sur votre téléphone
4. Rouvrez l'app → Les pages consultées fonctionnent !

---

## 🔧 Dépannage

### La bannière d'installation n'apparaît pas

- **Cause** : Vous avez déjà refusé récemment
- **Solution** : Attendez 24h ou effacez les données du site

### L'icône n'apparaît pas sur iOS

- **Cause** : iOS ne supporte pas le SVG pour les icônes
- **Solution** : Utilisez Chrome ou attendez la mise à jour

### Le mode hors ligne ne marche pas

- **Cause** : Le Service Worker n'est pas activé
- **Solution** : Rafraîchissez la page (Ctrl+F5)

---

## 📁 Fichiers PWA

| Fichier | Description |
|---------|-------------|
| `manifest.json` | Configuration de l'app (nom, icônes, couleurs) |
| `sw.js` | Service Worker pour le cache et offline |
| `icon-*.png` | Icônes dans différentes tailles |
| `favicon.ico` | Icône pour navigateur desktop |

---

## 🎨 Personnaliser les icônes

Pour changer l'icône de l'app :

1. Remplacez `app/public/icon-base.svg` par votre design
2. Regénérez les icônes :
   ```bash
   cd app
   node scripts/generate-icons.cjs
   ```
3. Rebuild et redeploy

---

## 🔒 Permissions

La PWA demande uniquement :
- **Stockage** : Pour le cache hors ligne
- **Notifications** : (optionnel, pour les rappels)

Aucune donnée personnelle n'est collectée.

---

## 📊 Statistiques PWA

Pour voir les stats d'installation :
- Chrome DevTools → Application → Manifest
- Vérifiez "Installability" et icons

---

## 💡 Astuces

- **Raccourci clavier** : `Alt+Shift+I` (Chrome) force l'invite d'installation
- **Debug** : Chrome DevTools → Application → Service Workers
- **Mise à jour** : L'app se met à jour automatiquement quand vous republiez

---

Profitez de MathUnivers comme une vraie application ! 🎉
