# Configuration Supabase pour MathUnivers

Ce guide explique comment configurer Supabase pour que vos données persistent entre les redémarrages du serveur.

## 1. Créer un compte Supabase

1. Allez sur https://supabase.com
2. Créez un compte gratuit
3. Créez un nouveau projet

## 2. Obtenir les clés d'API

1. Dans votre projet Supabase, allez dans **Project Settings** > **API**
2. Copiez :
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** → `VITE_SUPABASE_ANON_KEY`

## 3. Configurer le fichier .env

1. Ouvrez le fichier `app/.env`
2. Remplacez les valeurs par vos propres clés :

```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre-cle-anon
```

## 4. Créer les tables

1. Dans le dashboard Supabase, allez dans **SQL Editor** > **New query**
2. Copiez-collez le contenu du fichier `supabase-setup.sql`
3. Cliquez sur **Run**

## 5. Configurer le Storage (Stockage de fichiers)

### Créer les buckets :

1. Allez dans **Storage** > **New bucket**
2. Créez ces 3 buckets :

#### Bucket "images"
- Name: `images`
- Public bucket: ✅ Coché
- File size limit: 10 MB
- Allowed MIME types: `image/*`

#### Bucket "documents"
- Name: `documents`
- Public bucket: ✅ Coché
- File size limit: 50 MB
- Allowed MIME types: `application/pdf`

#### Bucket "covers"
- Name: `covers`
- Public bucket: ✅ Coché
- File size limit: 10 MB
- Allowed MIME types: `image/*`

### Configurer les politiques de sécurité :

Pour chaque bucket, cliquez sur **Policies** > **Add policies** :

1. **SELECT (lecture)** :
   - Policy name: "Allow public read access"
   - Allowed operation: SELECT
   - Target roles: `anon`, `authenticated`
   - Policy definition: `true`

2. **INSERT (upload)** :
   - Policy name: "Allow authenticated uploads"
   - Allowed operation: INSERT
   - Target roles: `anon`, `authenticated`
   - Policy definition: `true`

3. **DELETE (suppression)** :
   - Policy name: "Allow authenticated deletes"
   - Allowed operation: DELETE
   - Target roles: `anon`, `authenticated`
   - Policy definition: `true`

## 6. Redémarrer le serveur

```bash
cd app
npm run dev
```

## Fonctionnement

- **Données** (cours, problèmes, formules, livres) : Stockées dans Supabase Database
- **Images** : Uploadées vers Supabase Storage (bucket "images")
- **PDFs** : Uploadés vers Supabase Storage (bucket "documents")
- **Couvertures** : Uploadées vers Supabase Storage (bucket "covers")

## Fallback local

Si Supabase n'est pas configuré ou inaccessible, l'application fonctionne quand même avec le stockage local (localStorage/IndexedDB), mais les données ne persisteront pas entre les sessions.

## Vérification

Pour vérifier que tout fonctionne :

1. Ajoutez un cours avec une image
2. Redémarrez le serveur (`Ctrl+C` puis `npm run dev`)
3. Le cours et l'image devraient toujours être présents

## Dépannage

### Les données ne persistent pas
- Vérifiez que `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` sont correctement définis
- Ouvrez la console du navigateur (F12) et regardez les erreurs
- Vérifiez que les tables existent dans Supabase (SQL Editor: `SELECT * FROM courses`)

### Les images ne s'affichent pas
- Vérifiez que le bucket "images" existe et est public
- Vérifiez les politiques de sécurité du bucket
- Dans la console, vérifiez les URLs des images (doivent être des URLs Supabase)

### Les PDFs ne s'ouvrent pas
- Vérifiez que le bucket "documents" existe et est public
- Vérifiez les politiques de sécurité du bucket

## Support

En cas de problème, consultez :
- Documentation Supabase : https://supabase.com/docs
- Console du navigateur (F12) pour les erreurs
- Onglet Network dans les outils de développement pour voir les requêtes
