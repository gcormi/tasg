# Notice d'utilisation — Mentoria
## Guide pour les enseignants

---

## C'est quoi Mentoria ?

Mentoria permet à un enseignant de créer des **assistants IA personnalisés** pour ses élèves. Chaque assistant est configuré sur un thème précis (histoire, maths, musique...), avec ses propres règles pédagogiques et son propre corpus de référence.

L'élève accède à l'assistant via un simple lien — sans compte, sans application à installer.

**Tout est souverain** : hébergé sur la forge de l'Éducation Nationale, l'IA utilisée est Albert (Etalab/DINUM).

---

## Ce dont vous avez besoin

### 1. Une clé API Albert
Albert est l'IA souveraine française développée par Etalab pour les agents publics.

**Comment l'obtenir :**
1. Rendez-vous sur le Playground Albert et créez un compte
2. Dans la section "API Keys", générez une clé
3. **Copiez-la immédiatement** — elle ne s'affiche qu'une seule fois
4. Conservez-la précieusement (dans un gestionnaire de mots de passe)

> La clé ressemble à : `sk-eyJhbGci...`

---

### 2. Accéder à Mentoria Studio
L'interface de création des assistants est disponible sur la forge :
`https://gcormi.forge.apps.education.fr/frojet/mentoria`

> Il n'y a rien à installer — tout fonctionne dans le navigateur (Chrome ou Edge recommandé).

---

## Créer votre premier assistant

### Étape 1 — Ouvrir Mentoria Studio
Ouvrez `index.html` dans votre navigateur.

### Étape 2 — Configurer l'assistant
Remplissez les champs :

| Champ | Description | Exemple |
|-------|-------------|---------|
| **Nom** | Le nom affiché à l'élève | "Spécialiste de Chopin" |
| **Thème** | La matière ou le sujet | "Musique classique" |
| **Instructions** | Ce que le bot doit faire | "Tu aides les élèves à découvrir Chopin" |
| **Public cible** | L'âge ou le niveau | "Élèves de 4ème" |
| **Message d'accueil** | Premier message affiché | "Bonjour ! Prêt à explorer Chopin ?" |
| **Corpus** | Vos documents de référence | Copier-coller un texte de cours |
| **Clé API Albert** | Votre clé personnelle | `sk-eyJ...` |

### Étape 3 — Générer le lien élève
Cliquez sur **"Générer le lien"**. Vous obtenez une URL de ce type :
```
https://gcormi.forge.apps.education.fr/frojet/mentoria/compagnion.html#config=eyJ...
```

Ce lien contient toute la configuration encodée — **partagez-le avec vos élèves** via ENT, email ou QR code.

---

## Ce que voit l'élève

1. L'élève ouvre le lien
2. Il saisit son **identifiant** (prénom, pseudonyme, ou code classe)
3. Il peut discuter avec l'assistant IA
4. L'assistant répond en respectant vos règles pédagogiques et votre corpus

> **Conseil RGPD** : demandez aux élèves d'utiliser un pseudonyme ou leur prénom uniquement — évitez nom + prénom + classe.

---

## Bonnes pratiques pédagogiques

- **Corpus ciblé** : plus votre corpus est précis, plus l'assistant sera pertinent
- **Règles strictes** : activez "Thème strict" pour que le bot refuse les questions hors sujet
- **Tester avant diffusion** : testez le lien vous-même avant de le donner aux élèves
- **Un assistant par séquence** : créez un assistant différent pour chaque chapitre ou séance

---

## Partager Mentoria avec un collègue

Un autre enseignant peut utiliser Mentoria de façon totalement indépendante. Il lui suffit de :

1. Ouvrir la même URL : `https://gcormi.forge.apps.education.fr/frojet/mentoria/`
2. Obtenir **sa propre clé API Albert**
3. Utiliser **son propre Nextcloud** (`apps.education.fr`) ou son dossier local pour stocker ses bots

**Les bots de chaque enseignant sont complètement isolés :**
- Chaque config est stockée dans le Nextcloud personnel du prof — personne d'autre n'y a accès
- Le lien élève est auto-contenu (config encodée dans l'URL) — aucun serveur commun
- Vous ne voyez jamais les bots de vos collègues, et eux non plus les vôtres

---

## Questions fréquentes

**L'assistant ne répond pas ?**
Vérifiez que votre clé API Albert est valide et non expirée. Connectez-vous au Playground Albert pour vérifier.

**L'élève voit "Lien invalide" ?**
Le lien a été tronqué lors du copier-coller. Repartagez-le en entier.

**Puis-je modifier un assistant après l'avoir créé ?**
Oui — retournez dans Mentoria Studio, modifiez la configuration et générez un nouveau lien.

**Mes élèves ont-ils besoin d'un compte ?**
Non — aucun compte, aucune installation, juste le lien.

---

## Contacts et aide

- **Problème technique** : contactez Gilles Cormi (académie de Corse) via la forge
- **Accès n8n** (proxy Albert) : Thomas Sanson via Tchap incubateur EN
- **Communauté enseignants-développeurs** : salon Tchap #n8n de l'incubateur EN
