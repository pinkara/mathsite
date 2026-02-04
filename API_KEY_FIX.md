# 🔑 Résoudre "Invalid API key" sur Supabase

## ❌ Le problème

L'erreur `Invalid API key` signifie que la clé stockée dans les secrets GitHub est :
- ❌ Incorrecte (copiée partiellement)
- ❌ Expirée
- ❌ Révoquée
- ❌ Appartient à un autre projet

---

## ✅ Solution étape par étape

### Étape 1 : Vérifier la clé dans Supabase

1. Va sur : https://supabase.com/dashboard/projects
2. Clique sur ton projet **"mathunivers"** (ou le nom que tu as donné)
3. Clique sur **⚙️ Settings** (icône en bas à gauche)
4. Clique sur **API** dans le menu
5. Regarde la section **Project API keys**

**Vérifie que tu utilises la bonne clé :**
- ✅ Utilise : `anon public` (c'est celle qu'il faut)
- ❌ N'utilise PAS : `service_role` (c'est pour l'admin uniquement)

### Étape 2 : Copier la clé correctement

1. Clique sur l'icône 📋 à côté de `anon public`
2. **Important** : La clé fait environ 200 caractères et ressemble à :
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmeW5t...
   ```
3. Colle-la dans un fichier texte temporairement

### Étape 3 : Mettre à jour sur GitHub

1. Va sur : https://github.com/pinkara/mathsite/settings/secrets/actions
2. Trouve `VITE_SUPABASE_ANON_KEY` dans la liste
3. Clique sur **Update** (bouton à droite)
4. Colle la NOUVELLE clé complète
5. Clique sur **Update secret**

### Étape 4 : Relancer le build

Après avoir mis à jour la clé :

```bash
cd "c:\Users\tomam\OneDrive\Documents\projet_sur_VSC\mathsite"
git commit --allow-empty -m "Update Supabase API key"
git push origin master
```

Attends 2-3 minutes que le site se redéploie.

---

## 🔍 Vérifications supplémentaires

### Vérifier que l'URL est correcte

Dans les secrets GitHub, vérifie que `VITE_SUPABASE_URL` correspond bien à ton projet :

```
https://gfynmzwbqyhzaydfaojy.supabase.co
```

**Attention** : L'URL doit correspondre exactement à celle affichée dans Supabase > Settings > API > Project URL.

### Si la clé a expiré

Si tu vois `Invalid API key` même avec la bonne clé, elle a peut-être expiré :

1. Dans Supabase > Settings > API
2. Clique sur **"Generate a new secret"** (à droite de "anon public")
3. Copie la nouvelle clé
4. Mets-la à jour sur GitHub
5. Relance le build

---

## 🆘 Si ça ne marche toujours pas

### Test local

Pour vérifier que ta clé fonctionne, teste en local :

1. Ouvre `app/.env`
2. Vérifie que les valeurs sont identiques à celles sur GitHub
3. Lance :
   ```bash
   cd app
   npm run dev
   ```
4. Ouvre la console (F12)
5. Regarde si tu as aussi l'erreur 401

**Si tu as l'erreur en local aussi** → La clé est vraiment invalide, regénère-la
**Si ça marche en local mais pas sur GitHub** → Les secrets ne sont pas les mêmes

### Créer un nouveau projet Supabase

Si rien ne marche, crée un nouveau projet :

1. https://supabase.com/dashboard/projects
2. **New Project**
3. Remplis les infos
4. Attends que ça soit créé
5. Récupère les nouvelles clés (Settings > API)
6. Mets à jour sur GitHub
7. Relance le build

---

## 📋 Checklist finale

- [ ] Je suis sur le bon projet Supabase
- [ ] J'utilise la clé `anon public` (pas `service_role`)
- [ ] J'ai copié TOUTE la clé (pas juste une partie)
- [ ] L'URL correspond exactement à mon projet
- [ ] J'ai mis à jour le secret sur GitHub
- [ ] J'ai relancé le build avec `git push`
- [ ] J'ai attendu 2-3 minutes avant de tester

---

## 💡 Astuce

Pour t'assurer que les secrets sont bien utilisés, tu peux ajouter temporairement ce code dans `app/src/lib/supabase.ts` :

```typescript
console.log('Supabase URL:', SUPABASE_URL);
console.log('Key starts with:', SUPABASE_ANON_KEY.substring(0, 20) + '...');
```

Puis regarde dans la console du navigateur si les valeurs correspondent à ce que tu as mis sur GitHub.
