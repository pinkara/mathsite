# 🔧 Fix GitHub Pages 404 Error

## Problème
Erreur 404 : "There isn't a GitHub Pages site here"

## Solutions

### 1. Vérifier les paramètres GitHub Pages

Va dans ton repository GitHub :

1. **Settings** (en haut à droite)
2. **Pages** (dans le menu de gauche)
3. Dans **"Build and deployment"** :
   - **Source** : Sélectionne **"GitHub Actions"**
   - Clique sur **Save**

![Configuration](https://i.imgur.com/example.png)

### 2. Vérifier que le workflow s'est exécuté

1. Va dans l'onglet **Actions** de ton repo
2. Tu dois voir "Deploy to GitHub Pages"
3. S'il est rouge/échoué, clique dessus pour voir l'erreur

### 3. Forcer un nouveau déploiement

```bash
# Dans ton terminal
git commit --allow-empty -m "Trigger deployment"
git push
```

Ou va dans **Actions** → **Deploy to GitHub Pages** → **Run workflow**

### 4. Vérifier les Secrets (si le build échoue)

Va dans **Settings** → **Secrets and variables** → **Actions** :

| Secret | Valeur |
|--------|--------|
| `VITE_SUPABASE_URL` | https://mspelktopapwsdyyvrlw.supabase.co |
| `VITE_SUPABASE_ANON_KEY` | eyJhbG... (ta clé) |

### 5. URL correcte

L'URL doit être :
```
https://pinkara.github.io/mathsite/
```

⚠️ **Important** : Attends 2-5 minutes après le push pour que le site soit disponible.

### 6. Si ça ne marche toujours pas

Vérifie dans **Settings** → **Pages** :
- Que le repository est **public** (GitHub Pages gratuit = public uniquement)
- Que tu as poussé sur la branche `main` ou `master`

---

## ✅ Checklist

- [ ] Settings → Pages → Source = "GitHub Actions"
- [ ] Secrets configurés (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
- [ ] Workflow exécuté sans erreur (onglet Actions)
- [ ] Attendu 5 minutes après le déploiement
- [ ] URL correcte : https://pinkara.github.io/mathsite/

---

## 🆘 Erreurs courantes

**"Error: getaddrinfo ENOTFOUND api.github.com"**
→ Problème réseau temporaire, réessaie.

**"Error: Resource not accessible by integration"**
→ Va dans Settings → Actions → General → "Workflow permissions" → Coche "Read and write permissions"

**Build échoue avec "supabase.ts"**
→ Les secrets ne sont pas configurés correctement.
