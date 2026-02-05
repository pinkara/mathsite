# 📚 Guide d'utilisation - Contenu MathUnivers

Ce guide explique comment enrichir vos cours et problèmes avec des images, du code, et du LaTeX.

---

## 🖼️ Ajouter des images

### Méthode 1 : Upload via le panneau Admin
1. Dans le formulaire d'ajout/modification, cliquez sur "Ajouter une image"
2. Sélectionnez une image depuis votre ordinateur
3. L'image est automatiquement uploadée et son URL est insérée

### Méthode 2 : URL externe
Vous pouvez utiliser une URL d'image externe (Google Images, Unsplash, etc.) :
```
https://example.com/mon-image.jpg
```

### Méthode 3 : Dans le contenu HTML
Pour insérer une image dans le corps du texte :
```html
<img src="https://example.com/image.jpg" alt="Description" style="max-width: 100%;" />
```

---

## 💻 Ajouter du code (Python, etc.)

Pour créer un bloc de code avec coloration syntaxique et bouton copier :

### Syntaxe
```html
<pre><code class="language-python">
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

# Test
print(fibonacci(10))
</code></pre>
```

### Langages supportés
- `language-python` - Python
- `language-javascript` - JavaScript
- `language-typescript` - TypeScript
- `language-html` - HTML
- `language-css` - CSS
- `language-java` - Java
- `language-cpp` - C/C++
- `language-sql` - SQL
- `language-json` - JSON
- `language-markdown` - Markdown
- `language-latex` - LaTeX

### Exemples

**Python :**
```html
<pre><code class="language-python">
import numpy as np

# Calcul de la moyenne
data = [1, 2, 3, 4, 5]
moyenne = np.mean(data)
print(f"Moyenne: {moyenne}")
</code></pre>
```

**JavaScript :**
```html
<pre><code class="language-javascript">
// Calcul de factorielle
function factorielle(n) {
  if (n <= 1) return 1;
  return n * factorielle(n - 1);
}
</code></pre>
```

---

## 🚀 Code Exécutable - Bouton IDE

Pour tous les blocs de code **Python** et **JavaScript**, un **bouton "IDE"** apparaît automatiquement à côté du bouton "Copier". Cliquez dessus pour ouvrir l'IDE avec le code pré-rempli !

### Comment ça marche

1. Ajoutez un bloc de code avec `language-python` ou `language-javascript`
2. Le bouton **▶ IDE** apparaît automatiquement dans le header
3. Cliquez dessus → l'IDE s'ouvre avec le code prêt à être exécuté

### Exemple

```html
<h3>Résolution d'équation du 2nd degré</h3>

<pre><code class="language-python">
import math

def resoudre_eq2(a, b, c):
    delta = b**2 - 4*a*c
    if delta > 0:
        x1 = (-b - math.sqrt(delta)) / (2*a)
        x2 = (-b + math.sqrt(delta)) / (2*a)
        return f"Deux solutions: x₁ = {x1}, x₂ = {x2}"
    elif delta == 0:
        return f"Solution unique: x = {-b / (2*a)}"
    else:
        return "Pas de solution réelle"

print(resoudre_eq2(1, -5, 6))
</code></pre>
```

**Résultat :** Un bloc de code avec les boutons `[▶ IDE] [📋 Copier]` en haut à droite.

### Langages supportés

| Langage | Classe HTML | Bouton IDE |
|---------|-------------|------------|
| Python | `language-python` | ✅ |
| JavaScript | `language-javascript` | ✅ |
| TypeScript | `language-typescript` | ✅ (en JavaScript) |
| Shell/Bash | `language-shell` ou `language-bash` | ✅ (converti en Python) |
| Autres | `language-xxx` | ❌ |

**Note :** Le code Shell/Bash peut être ouvert dans l'IDE mais sera traité comme du Python (pour les exercices NSI c'est utile pour expliquer les commandes).

### Alternative : Bouton personnalisé (option avancée)

Si vous voulez un bouton personnalisé ailleurs dans le contenu :

```html
<div 
  class="ide-button" 
  data-code="votre code ici"
  data-language="python"
>
  🖥️ Tester dans l'IDE
</div>
```

### Bonnes pratiques

1. **Code fonctionnel** - Testez d'abord dans l'IDE avant de l'ajouter au cours
2. **Exemples concrets** - Utilisez des valeurs numériques pour illustrer
3. **Output visible** - Utilisez `print()` (Python) ou `console.log()` (JS)
4. **Commentaires** - Ajoutez des commentaires pour expliquer le code

---

## 📁 Arborescence de fichiers (pour NSI)

Pour les exercices de NSI (Numérique et Sciences Informatiques), vous pouvez créer des **arborescences de fichiers** interactives.

### Syntaxe HTML

```html
<div class="file-tree">
  <div class="folder">
    📁 projet_nsi/
    <div class="folder-content">
      <div class="folder">
        📁 src/
        <div class="folder-content">
          <div class="file">📄 main.py</div>
          <div class="file">📄 utils.py</div>
          <div class="folder">
            📁 modules/
            <div class="folder-content">
              <div class="file">📄 __init__.py</div>
              <div class="file">📄 helpers.py</div>
            </div>
          </div>
        </div>
      </div>
      <div class="folder">
        📁 tests/
        <div class="folder-content">
          <div class="file">📄 test_main.py</div>
        </div>
      </div>
      <div class="file">📄 README.md</div>
      <div class="file">📄 requirements.txt</div>
    </div>
  </div>
</div>
```

### Exemple complet avec style

```html
<h3>Structure du projet</h3>

<div style="background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 8px; padding: 16px; font-family: 'Courier New', monospace; font-size: 14px; line-height: 1.6;">
  <div style="margin-left: 0;">
    <span style="color: #f4d03f;">📁</span> <strong>mon_projet/</strong>
  </div>
  <div style="margin-left: 20px;">
    <span style="color: #f4d03f;">📁</span> <strong>data/</strong>
    <div style="margin-left: 20px;">
      <span style="color: #5dade2;">📄</span> input.csv
    </div>
    <div style="margin-left: 20px;">
      <span style="color: #5dade2;">📄</span> output.json
    </div>
  </div>
  <div style="margin-left: 20px;">
    <span style="color: #f4d03f;">📁</span> <strong>src/</strong>
    <div style="margin-left: 20px;">
      <span style="color: #5dade2;">📄</span> main.py
    </div>
    <div style="margin-left: 20px;">
      <span style="color: #5dade2;">📄</span> functions.py
    </div>
  </div>
  <div style="margin-left: 20px;">
    <span style="color: #58d68d;">📄</span> README.md
  </div>
  <div style="margin-left: 20px;">
    <span style="color: #58d68d;">📄</span> requirements.txt
  </div>
</div>
```

### Icônes par type de fichier

Pour afficher une icône spécifique selon l'extension, ajoutez l'attribut `data-ext` :

```html
<div class="file-tree">
  <div class="folder">
    📁 projet/
    <div class="folder-content">
      <div class="file" data-ext="py">main.py</div>
      <div class="file" data-ext="js">script.js</div>
      <div class="file" data-ext="html">index.html</div>
      <div class="file" data-ext="css">style.css</div>
      <div class="file" data-ext="csv">data.csv</div>
      <div class="file" data-ext="txt">README.txt</div>
      <div class="file" data-ext="json">package.json</div>
      <div class="file" data-ext="md">README.md</div>
    </div>
  </div>
</div>
```

### Tableau des icônes disponibles

| Extension | Attribut | Icône | Description |
|-----------|----------|-------|-------------|
| `.py` | `data-ext="py"` | 🐍 | Python |
| `.js` | `data-ext="js"` | 📜 | JavaScript |
| `.ts` | `data-ext="ts"` | 🔷 | TypeScript |
| `.html` | `data-ext="html"` | 🌐 | HTML |
| `.css` | `data-ext="css"` | 🎨 | CSS |
| `.json` | `data-ext="json"` | 📋 | JSON |
| `.csv` | `data-ext="csv"` | 📊 | Données (CSV/Excel) |
| `.txt` | `data-ext="txt"` | 📝 | Texte/Markdown |
| `.md` | `data-ext="md"` | 📝 | Markdown |
| `.jpg/.png` | `data-ext="png"` | 🖼️ | Images |
| `.zip` | `data-ext="zip"` | 📦 | Archives |
| `.pdf` | `data-ext="pdf"` | 📕 | PDF |
| `.sh` | `data-ext="sh"` | 🐚 | Shell/Bash |
| `.sql` | `data-ext="sql"` | 🗄️ | SQL |
| `.java` | `data-ext="java"` | ☕ | Java |
| `.cpp/.c` | `data-ext="cpp"` | ⚙️ | C/C++ |
| Autres | (sans attribut) | 📄 | Fichier générique |

### Exemple complet NSI

```html
<h3>Structure d'un projet Python</h3>

<div class="file-tree">
  <div class="folder">
    📁 mon_projet/
    <div class="folder-content">
      <div class="folder">
        📁 data/
        <div class="folder-content">
          <div class="file" data-ext="csv">eleves.csv</div>
          <div class="file" data-ext="json">config.json</div>
        </div>
      </div>
      <div class="folder">
        📁 src/
        <div class="folder-content">
          <div class="file" data-ext="py">__init__.py</div>
          <div class="file" data-ext="py">main.py</div>
          <div class="file" data-ext="py">utils.py</div>
        </div>
      </div>
      <div class="folder">
        📁 tests/
        <div class="folder-content">
          <div class="file" data-ext="py">test_main.py</div>
        </div>
      </div>
      <div class="file" data-ext="md">README.md</div>
      <div class="file" data-ext="txt">requirements.txt</div>
    </div>
  </div>
</div>
```

### Pour les exercices NSI

Cette arborescence est utile pour :
- Montrer la structure d'un projet Python
- Expliquer l'organisation des fichiers
- Présenter des exercices sur la manipulation de fichiers
- Illustrer les imports entre modules

---

## 📝 Écrire du LaTeX/MathJax

### Formules en ligne
Utilisez le symbole `$` avant et après :
```
Soit $f(x) = x^2 + 3x + 2$ une fonction polynôme.
```

### Formules centrées (display mode)
Utilisez `$$` ou `\[` et `\]` :
```
$$\int_{a}^{b} f(x) dx = F(b) - F(a)$$
```

### Exemples courants

**Équation du second degré :**
```
$$ax^2 + bx + c = 0$$
$$x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$$
```

**Somme et série :**
```
$$\sum_{i=1}^{n} i = \frac{n(n+1)}{2}$$
```

**Intégrale :**
```
$$\int_{0}^{\infty} e^{-x} dx = 1$$
```

**Limite :**
```
$$\lim_{x \to 0} \frac{\sin x}{x} = 1$$
```

**Matrice :**
```
$$
\begin{pmatrix}
a & b \\
c & d
\end{pmatrix}
$$
```

**Fractions :**
```
$$\frac{a}{b} + \frac{c}{d} = \frac{ad + bc}{bd}$$
```

**Indice et exposant :**
```
$$a_n = a_1 \cdot r^{n-1}$$
```

---

## 📐 Schémas et diagrammes (alternatives à TikZ)

**MathJax ne supporte pas TikZ.** Voici les alternatives :

### Option 1 : Images (recommandé)
Créez vos schémas avec :
- **GeoGebra** (géométrie) → Export PNG/SVG
- **Desmos** (graphes de fonctions)
- **Draw.io / diagrams.net** (diagrammes)
- **LaTeX + TikZ** localement → Compiler en PDF → Screenshot → PNG

Exemple d'intégration :
```html
<figure style="text-align: center;">
  <img src="https://example.com/mon-schema.png" alt="Schéma" style="max-width: 100%;" />
  <figcaption style="font-style: italic; color: #666;">Figure 1: Description du schéma</figcaption>
</figure>
```

### Option 2 : ASCII Art (simple)
Pour des diagrammes simples :
```
<pre style="font-family: monospace; background: #f5f5f5; padding: 10px;">
    A
   / \
  B   C
 / \   \
D   E   F
</pre>
```

### Option 3 : SVG inline
Pour des figures vectorielles simples :
```html
<svg width="200" height="100" style="max-width: 100%;">
  <circle cx="50" cy="50" r="40" stroke="black" stroke-width="2" fill="red" />
  <line x1="50" y1="50" x2="150" y2="50" stroke="blue" stroke-width="2" />
</svg>
```

---

## 🎨 Mise en forme HTML

### Titres
```html
<h2>Titre de section</h2>
<h3>Sous-titre</h3>
```

### Listes
```html
<ul>
  <li>Premier élément</li>
  <li>Deuxième élément</li>
</ul>

<ol>
  <li>Étape 1</li>
  <li>Étape 2</li>
</ol>
```

### Tableaux
```html
<table style="width: 100%; border-collapse: collapse;">
  <tr style="background: #f0f0f0;">
    <th style="border: 1px solid #ccc; padding: 8px;">x</th>
    <th style="border: 1px solid #ccc; padding: 8px;">f(x)</th>
  </tr>
  <tr>
    <td style="border: 1px solid #ccc; padding: 8px;">0</td>
    <td style="border: 1px solid #ccc; padding: 8px;">0</td>
  </tr>
  <tr>
    <td style="border: 1px solid #ccc; padding: 8px;">1</td>
    <td style="border: 1px solid #ccc; padding: 8px;">1</td>
  </tr>
</table>
```

### Mise en évidence
```html
<strong>Texte en gras</strong>
<em>Texte en italique</em>
<span style="color: red;">Texte rouge</span>
<span style="background: yellow;">Texte surligné</span>
```

### Bloc d'information
```html
<div style="background: #e3f2fd; border-left: 4px solid #2196f3; padding: 12px; margin: 10px 0;">
  <strong>💡 Astuce :</strong> Voici une information importante.
</div>
```

---

## ✅ Exemple complet

```html
<h2>Équation du second degré</h2>

<p>Une équation du second degré s'écrit sous la forme :</p>

$$ax^2 + bx + c = 0$$

<div style="background: #fff3e0; border-left: 4px solid #ff9800; padding: 12px; margin: 10px 0;">
  <strong>📌 Formule importante :</strong> Le discriminant est $\Delta = b^2 - 4ac$
</div>

<h3>Exemple en Python</h3>

<pre><code class="language-python">
import math

def resoudre_eq2(a, b, c):
    delta = b**2 - 4*a*c
    
    if delta > 0:
        x1 = (-b - math.sqrt(delta)) / (2*a)
        x2 = (-b + math.sqrt(delta)) / (2*a)
        return f"Deux solutions: x₁ = {x1}, x₂ = {x2}"
    elif delta == 0:
        x = -b / (2*a)
        return f"Solution unique: x = {x}"
    else:
        return "Pas de solution réelle"

# Test
print(resoudre_eq2(1, -5, 6))  # x² - 5x + 6 = 0
</code></pre>

<h3>Schéma explicatif</h3>

<img src="https://example.com/parabole.png" alt="Parabole" style="max-width: 100%;" />

<p>La courbe représentative est une <strong>parabole</strong>.</p>
```

### 🚀 Code exécutable automatique

Pour les blocs de code Python et JavaScript, le bouton **▶ IDE** apparaît automatiquement à côté du bouton "Copier". Les élèves peuvent cliquer pour ouvrir l'IDE avec le code pré-rempli !

---

## 🔧 Conseils

1. **Testez votre contenu** - Utilisez l'aperçu avant de sauvegarder
2. **Images optimisées** - Préférez des images < 500KB pour de bonnes performances
3. **Code indenté** - Utilisez une indentation cohérente (4 espaces recommandé)
4. **Backup** - Gardez une copie de vos contenus au cas où

---

## ❓ Support

En cas de problème avec :
- **Le LaTeX** → Vérifiez la syntaxe, utilisez des backslash doubles `\\`
- **Les images** → Vérifiez que l'URL est accessible publiquement
- **Le code** → Assurez-vous d'utiliser la bonne classe `language-xxx`
