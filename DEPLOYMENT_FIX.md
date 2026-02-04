# 🔧 Fix Déploiement GitHub Pages - Erreur 404

## 🔍 Diagnostic rapide

### 1. Vérifier si le workflow s'est exécuté

Va sur : `https://github.com/pinkara/mathsite/actions`

**Si tu vois des workflows en rouge (❌) :**
- Clique sur le dernier workflow échoué
- Vérifie l'erreur dans les logs

**Si tu ne vois aucun workflow :**
- Le fichier `.github/workflows/deploy.yml` n'est pas poussé
- Fais un commit/push pour déclencher le workflow

---

## ✅ Étapes de correction

### Étape 1 : Vérifier les paramètres GitHub Pages

1. Va sur : `https://github.com/pinkara/mathsite/settings/pages`
2. Dans **"Build and deployment"** :
   - **Source** : Sélectionne **"GitHub Actions"** (⚠️ PAS "Deploy from a branch")
   - Clique sur **Save**

![Settings Pages](https://docs.github.com/assets/images/help/pages/GitHub-Pages-Actions-Source.png)

---

### Étape 2 : Vérifier les Secrets (obligatoire)

Va sur : `https://github.com/pinkara/mathsite/settings/secrets/actions`

**Tu dois avoir ces 2 secrets configurés :**

| Nom | Valeur |
|-----|--------|
| `VITE_SUPABASE_URL` | `https://mspelktopapwsdyyvrlw.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIs...` (ta clé complète) |

**Pour ajouter un secret :**
1. Clique sur **"New repository secret"**
2. Nom : `VITE_SUPABASE_URL`
3. Valeur : l'URL de ton projet Supabase
4. Clique **Add secret**
5. Répète pour `VITE_SUPABASE_ANON_KEY`

---

### Étape 3 : Forcer un nouveau déploiement

Dans ton terminal :

```bash
cd c:\Users\tomam\OneDrive\Documents\projet_sur_VSC\mathsite

# Vérifier que tout est commit
git status

# Si des fichiers sont non commités :
git add .
git commit -m "Fix: Force redeployment"

# Push sur main
git push origin main
```

**Alternative sans terminal :**
1. Va sur : `https://github.com/pinkara/mathsite/actions/workflows/deploy.yml`
2. Clique sur **"Run workflow"** (bouton vert)
3. Sélectionne la branche `main`
4. Clique **"Run workflow"**

---

### Étape 4 : Vérifier les permissions Actions

Va sur : `https://github.com/pinkara/mathsite/settings/actions`

Dans **"Workflow permissions"** :
- ✅ Coche **"Read and write permissions"**
- ✅ Coche **"Allow GitHub Actions to create and approve pull requests"** (optionnel)
- Clique **Save**

---

### Étape 5 : Vérifier le fichier vite.config.ts

Le fichier `app/vite.config.ts` doit contenir :

```typescript
export default defineConfig({
  plugins: [react()],
  base: process.env.NODE_ENV === 'production' ? '/mathsite/' : '/',
  // ...
})
```

⚠️ **Important** : `base: '/mathsite/'` est nécessaire car ton repo s'appelle "mathsite"

---

## 🧪 Vérifier le build localement

Dans ton terminal :

```bash
cd app
npm run build
```

**Si le build échoue**, corrige les erreurs avant de push.

**Si le build réussit**, vérifie que le dossier `dist/` contient :
- `index.html`
- Dossier `assets/`
- `favicon.svg`
- `manifest.json`

---

## 🌐 URL correcte

Une fois déployé, l'URL est :
```
https://pinkara.github.io/mathsite/
```

⚠️ **Attends 2-5 minutes** après le déploiement avant de tester.

---

## 🚨 Erreurs courantes

### "Error: Resource not accessible by integration"
→ Solution : Activer "Read and write permissions" (Étape 4)

### "Process completed with exit code 1"
→ Solution : Vérifier les secrets Supabase (Étape 2)

### "Module not found" ou erreur de build
→ Solution : Supprimer `node_modules` et réinstaller :
```bash
cd app
rm -rf node_modules package-lock.json
npm install
```

### "404 There isn't a GitHub Pages site here"
→ Solution : Changer Source en "GitHub Actions" (Étape 1)

---

## 📊 Vérifier l'état du déploiement

1. Va sur : `https://github.com/pinkara/mathsite/actions`
2. Clique sur le dernier workflow
3. Tu dois voir :
   - ✅ **build** - Success
   - ✅ **deploy** - Success

Si les deux sont verts mais que le site ne marche pas :
- Attends encore 5 minutes
- Vide le cache de ton navigateur
- Essaie en navigation privée

---

## 🆘 Si rien ne marche

1. **Vérifie que le repo est public** :
   - `https://github.com/pinkara/mathsite/settings` → Danger Zone → Visibility = Public

2. **Redémarre le workflow** :
   - Actions → Deploy to GitHub Pages → Re-run all jobs

3. **Contacte-moi avec les logs** :
   - Copie les logs du workflow qui échoue
   - Envoie-les dans le chat

---

## ✅ Checklist finale

- [ ] Settings → Pages → Source = "GitHub Actions"
- [ ] Secrets configurés (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
- [ ] Workflow permissions = "Read and write"
- [ ] Dernier workflow = Vert (Success)
- [ ] Attendu 5 minutes après le déploiement
- [ ] URL testée : https://pinkara.github.io/mathsite/

Bonne chance ! 🚀
