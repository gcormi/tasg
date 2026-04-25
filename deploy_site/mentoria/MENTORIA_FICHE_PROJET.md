# 📘 Mentoria — Fiche Projet Complète

> **Studio de création d'assistants pédagogiques souverains**
> Éducation Nationale — Conforme RGPD — Sans compte Google

---

## 🎯 Objectif du projet

Permettre à un enseignant de créer des **assistants IA personnalisés** pour ses élèves, en toute souveraineté numérique :
- **Sans compte Google**
- **Sans Firebase**
- **Sans serveur**
- **Sans données qui quittent le contrôle de l'enseignant**

---

## ✅ Ce qui a été réalisé

### 1. Suppression totale de Firebase
- Supprimé : `firebase-config.js`, `firebase.json`, `firestore.rules`, `firestore.indexes.json`, `.firebaserc`, dossier `.firebase`
- Supprimé : `dashboard.html` (tableau de bord dépendant de Firebase)
- **Résultat :** L'application fonctionne entièrement sans internet pour la gestion des données

### 2. Écran de démarrage souverain
À chaque ouverture de Mentoria, le professeur voit un **écran de connexion** lui proposant deux modes :

| Mode | Description |
|---|---|
| ☁️ **Nuage apps.education.fr** | Coller le lien de partage d'un dossier Nextcloud |
| 💾 **Clé USB / Dossier local** | Sélectionner un dossier sur clé USB ou disque dur |

> ⚠️ **Aucune mémorisation** : le choix n'est pas sauvegardé dans le navigateur. Chaque prof saisit son propre lien à chaque session → **aucun risque de mélange sur un PC partagé de collège**

### 3. Moteur de stockage Nuage (WebDAV Nextcloud)
- Protocole : **WebDAV** (standard ouvert, supporté par Nextcloud)
- Authentification : via le **token de partage** du lien Nuage (pas de mot de passe)
- Chaque bot est un fichier `bot_XXXXXX.json` dans le dossier Nuage du prof
- Fonctions : lire, écrire, lister, supprimer les fichiers

### 4. Moteur de stockage Dossier local (USB/disque)
- API navigateur : **File System Access API** (`showDirectoryPicker`)
- Le prof sélectionne son dossier `Mentoria/` sur sa clé USB
- Les bots sont des fichiers `bot_XXXXXX.json` directement sur la clé
- **Fonctionne 100% hors-ligne**
- Limitation : **Chrome ou Edge uniquement** (pas Firefox)

### 5. Publication souveraine (lien élève)
- La configuration complète du bot est **encodée en Base64** dans l'URL
- Format : `compagnion.html#config=BASE64...`
- **Aucun serveur nécessaire** pour que l'élève accède à l'assistant
- Le lien contient tout : instructions, règles, corpus, avatar

### 6. Interface Studio professeur
- **3 sections** configurables par l'enseignant :
  1. Identité & Présentation (avatar, nom, titre, niveau, message de bienvenue)
  2. Pédagogie & Corpus (instructions IA, règles pédagogiques, PDF/TXT)
  3. Sécurité & API (clé API Albert/Etalab)
- **Aperçu en temps réel** de l'interface élève
- **Bibliothèque** de bots (panneau latéral gauche)

---

## 📋 Ce qui reste à faire (To-Do)

### Priorité 1 — Tests et validation
- [ ] **Tester le mode Nuage** avec un vrai dossier partagé sur `nuage.apps.education.fr`
  - Vérifier que le CORS est autorisé par le serveur Nextcloud de l'EN
  - Si CORS bloqué → prévoir un plan B (voir ci-dessous)
- [ ] **Tester le mode Clé USB** avec Chrome/Edge
- [ ] **Tester `compagnion.html`** : vérifier qu'il décode correctement le `#config=` de l'URL
- [ ] **Tester l'avatar** : images PNG, JPG, AVIF, WebP

### Priorité 2 — Robustesse
- [ ] Ajouter un message d'erreur clair si le lien Nuage est invalide ou si le CORS est bloqué
- [ ] Vérifier que `compagnion.html` affiche un message d'erreur si le lien est absent ou corrompu
- [ ] Renommer le dossier `Bot comme Mizou` → `Mentoria` (à faire au prochain redémarrage du PC)

### Priorité 3 — Améliorations futures
- [ ] Bouton "Changer de stockage" dans le header (revenir à l'écran de démarrage)
- [ ] Indicateur de synchronisation (spinner pendant la sauvegarde/chargement Nuage)
- [ ] Taille maximale d'un bot avec avatar (Base64 d'une image peut être lourd dans l'URL)
- [ ] Option : compresser/redimensionner l'avatar avant encodage

---

## 🔐 Contraintes et fonctionnement

### Contrainte 1 : CORS sur Nuage apps.education.fr
Le navigateur doit pouvoir faire des appels WebDAV **depuis une autre origine** (ex: depuis `localhost:8080` ou depuis La Forge). Nextcloud supporte normalement CORS, mais la configuration de `apps.education.fr` peut le restreindre.

**Plan B si CORS bloqué :**
- Utiliser un petit script PHP/Python sur un serveur La Forge comme proxy
- Ou utiliser une extension navigateur (moins propre)
- Ou revenir au mode "Export JSON manuel" → prof dépose manuellement sur Nuage

### Contrainte 2 : File System Access API (mode USB)
- Supporte : **Chrome 86+, Edge 86+**
- Ne supporte pas : Firefox, Safari (support partiel)
- **Obligation de re-sélectionner le dossier** à chaque ouverture du navigateur (sécurité navigateur)
- C'est intentionnel : chaque session est indépendante, pas de confusion entre profs

### Contrainte 3 : Taille de l'URL élève
- L'URL élève contient toute la config en Base64, incluant potentiellement l'avatar (image)
- Une image de 500 Ko donne ~700 Ko en Base64 → URL très longue
- **Recommandation :** utiliser des images légères pour l'avatar (< 100 Ko)
- Solution future : stocker l'avatar séparément dans Nuage/USB et le référencer par nom de fichier

### Contrainte 4 : Clé API Albert
- La clé API Albert (Etalab) est stockée dans le fichier bot JSON
- Elle voyage dans l'URL élève
- **Risque : la clé est visible si quelqu'un inspecte l'URL**
- Solution future : stocker la clé séparément et la charger côté `compagnion.html` depuis Nuage

---

## 🗂 Structure des fichiers

```
📁 Mentoria/  (anciennement "Bot comme Mizou")
├── index.html          ← Studio professeur (toute la logique ici)
├── compagnion.html     ← Interface élève (lit le #config= de l'URL)
└── 404.html            ← Page d'erreur
```

### Format d'un bot (fichier JSON)
```json
{
  "id": "bot_1713281234567",
  "updatedAt": "2026-04-16T15:00:00.000Z",
  "config": {
    "title": "Assistant Mathématiques 3e",
    "name": "MathBot",
    "instructions": "En tant que professeur de mathématiques...",
    "targetAge": "12-14 ans",
    "theme": "Mathématiques",
    "welcomeMessage": "Bonjour ! Je suis là pour vous aider.",
    "pedagogicRules": ["Fournis des réponses concises..."],
    "customRules": ""
  },
  "corpus": "--- SOURCE: cours.pdf ---\n...",
  "apiKey": "sk-xxx",
  "vignette": "data:image/png;base64,..."
}
```

---

## 🔄 Flux de travail de l'enseignant

```
MAISON (PC perso)
    1. Ouvre Mentoria → écran de démarrage
    2. Choisit "Nuage" → colle son lien de dossier partagé
       OU choisit "Clé USB" → sélectionne son dossier
    3. Crée / modifie ses assistants
    4. Sauvegarde → fichier JSON dans Nuage ou sur la clé
    5. "Publier" → copie le lien pour les élèves

COLLÈGE (PC partagé)
    1. Ouvre Mentoria (même URL)
    2. Écran de démarrage → saisit son lien Nuage
       OU branche sa clé USB → sélectionne son dossier
    3. Retrouve tous ses bots automatiquement
    4. Peut modifier, ajouter, publier

ÉLÈVE (n'importe quel appareil)
    1. Clique sur le lien partagé par le prof
    2. compagnion.html charge → décode la config depuis l'URL
    3. L'assistant est prêt, sans compte, sans installation
```

---

## 🌐 Technologies utilisées

| Technologie | Usage |
|---|---|
| HTML/CSS/JS pur | Toute l'application (pas de framework) |
| Tailwind CSS (CDN) | Mise en forme |
| Lucide Icons (CDN) | Icônes |
| PDF.js (CDN) | Extraction du texte des PDF |
| WebDAV API | Communication avec Nextcloud (Nuage) |
| File System Access API | Lecture/écriture sur clé USB/dossier local |
| Base64 (URL) | Encodage de la config dans le lien élève |
| API Albert (Etalab) | Moteur IA souverain français |

---

*Document généré le 16 avril 2026 — Mentoria Studio v2.0 Souverain*
