# Notice d'utilisation — Mentoria v2.5
## Guide pour les enseignants

---

## C'est quoi Mentoria ?

Mentoria permet à un enseignant de créer des **assistants IA personnalisés** pour ses élèves. Chaque assistant est configuré sur un thème précis (histoire, maths, musique...), avec ses propres règles pédagogiques et son propre corpus de référence.

L'élève accède à l'assistant via un simple lien — **sans compte, sans application à installer**.

**Tout est souverain** : hébergé sur la forge de l'Éducation Nationale, l'IA utilisée est Albert (Etalab/DINUM).

---

## Ce dont vous avez besoin

### 1. Une clé API Albert
Albert est l'IA souveraine française développée par Etalab pour les agents publics.

**Comment l'obtenir :**
1. Rendez-vous sur le Playground Albert et créez un compte
2. Dans la section "API Keys", générez une clé
3. **Copiez-la immédiatement** — elle ne s'affiche qu'une seule fois
4. Conservez-la (gestionnaire de mots de passe ou note sécurisée)

> La clé ressemble à : `sk-eyJhbGci...`

La clé est mémorisée automatiquement dans votre navigateur — vous n'aurez à la saisir qu'une seule fois par PC.

---

### 2. Un espace de stockage pour vos bots

Choisissez l'option qui vous convient :

#### ☁️ Nuage apps.education.fr (recommandé)
Vos bots sont stockés dans votre Nuage personnel EN. Accessible depuis n'importe quel PC.

**Première connexion (5 minutes, une seule fois) :**
1. Connectez-vous sur [nuage.apps.education.fr](https://nuage.apps.education.fr)
2. Cliquez sur votre nom en haut à droite → **Paramètres**
3. Menu gauche → **Sécurité**
4. Tout en bas : **"Créer un nouveau mot de passe d'application"**
5. Nom : tapez `Mentoria` → **Créer**
6. **Copiez le mot de passe affiché** (une seule fois !)

> ⚠️ Ce n'est pas votre vrai mot de passe — c'est un mot de passe spécifique à Mentoria, plus sûr.

#### 🦊 La Forge (GitLab EN)
Pour les enseignants à l'aise avec les outils numériques. Bots stockés dans votre dépôt GitLab.
Nécessite un compte sur `forge.apps.education.fr` et un jeton d'accès.

#### 💾 Clé USB / Dossier local
Bots stockés sur votre PC ou clé USB. Fonctionne sans internet.
Nécessite Chrome ou Edge. Non accessible depuis un autre PC (sauf si vous branchez la clé).

---

### 3. Accéder à Mentoria Studio
`https://gcormi.forge.apps.education.fr/frojet/mentoria/`

Rien à installer — tout fonctionne dans le navigateur.

---

## Créer votre premier assistant

### Étape 1 — Se connecter
Au démarrage, choisissez votre mode de stockage et connectez-vous.

### Étape 2 — Section 1 : Identité
| Champ | Description | Exemple |
|-------|-------------|---------|
| **Avatar** | Photo ou dessin de l'assistant | Photo d'un robot |
| **Titre du projet** | Nom interne (pour vous) | "Techno Cycle 4 — ch.3" |
| **Nom de l'assistant** | Affiché à l'élève | "TechBot" |
| **Thème** | La matière ou le sujet | "Technologie au collège" |
| **Âge / Niveau** | Public cible | "4e, 13-14 ans" |
| **Message de bienvenue** | Premier message affiché | "Bonjour ! Prêt à explorer ?" |

### Étape 3 — Section 2 : Pédagogie & Corpus

**Instructions** : décrivez le rôle de l'IA en quelques phrases.

**Source des réponses** (3 choix) :
- 📄 **Corpus seul** — l'IA répond uniquement à partir de vos documents
- ⚖️ **Les deux** — corpus + connaissances générales d'Albert (recommandé)
- 🤖 **Albert seul** — ignore le corpus, connaissances générales uniquement

**Règles pédagogiques** : cochez ce que vous voulez activer.
Certaines sont cochées par défaut (ton encourageant, rediriger hors sujet, refuser contenu inapproprié).

**Interdictions** : cochez pour restreindre les comportements de l'IA.
Le champ **Thème strict** limite l'IA à un sujet précis.

**Votre propre règle** : inventez librement une règle en texte libre.
> Ex: "Commence toujours par une question de relance."

**Corpus** : ajoutez jusqu'à 5 fichiers PDF ou TXT (le cours du jour, une fiche...).
> Conseil : un corpus ciblé (la fiche de la séance) est plus efficace qu'un gros manuel.
> Limite recommandée : ~50 pages max.

### Étape 4 — Section 3 : Boutons de réponse rapide

Des boutons s'affichent à l'élève pour l'aider à interagir.

**Bibliothèque pré-configurée** par catégorie :
- 💡 **Aide** : "Donne-moi un indice", "Je ne comprends pas"...
- 🔭 **Approfondir** : "En savoir plus", "Un exemple concret"...
- ✅ **Évaluation** : "Quiz rapide", "Pose-moi une question"...
- 🗺️ **Navigation** : "Retour au sujet", "Récapitulatif"...

Cliquez sur un bouton pour l'ajouter. Vous pouvez aussi créer des boutons personnalisés.

> Ces boutons sont des **actions ponctuelles** — après y avoir répondu, l'IA reprend son comportement normal.

### Étape 5 — Section 4 : Clé API
Saisissez votre clé Albert. Elle est mémorisée automatiquement pour les prochains bots.

### Étape 6 — Publier
Cliquez sur **Publier** → vous obtenez un lien de ce type :
```
https://gcormi.forge.apps.education.fr/frojet/mentoria/compagnion.html#config=...
```
**Partagez ce lien** à vos élèves via ENT, email ou QR code.

---

## Ce que voit l'élève

1. L'élève ouvre le lien
2. Il saisit son **prénom ou pseudonyme**
3. Il discute avec l'assistant IA
4. Les boutons rapides (si configurés) l'aident à formuler ses demandes

> **Conseil RGPD** : demandez aux élèves d'utiliser un pseudonyme — évitez nom + prénom + classe.

---

## Partager Mentoria avec un collègue

Un collègue peut utiliser Mentoria de façon totalement indépendante :

1. Il ouvre la même URL
2. Il crée son mot de passe d'application Nuage (5 min, une fois)
3. Il obtient sa propre clé API Albert
4. Ses bots sont dans **son** Nuage — personne d'autre n'y a accès

---

## Bonnes pratiques pédagogiques

- **Corpus ciblé** : le cours du jour, pas le manuel entier
- **Tester avant diffusion** : ouvrez le lien vous-même avant de le donner aux élèves
- **Un assistant par séquence** : créez un assistant différent pour chaque chapitre
- **Règles strictes** : activez "Hors sujet → rediriger" pour cadrer les échanges
- **Maïeutique** : activez "Ne jamais donner la réponse directement" pour faire réfléchir

---

## Questions fréquentes

**L'assistant ne répond pas ?**
Vérifiez que votre clé API Albert est valide. Connectez-vous au Playground Albert pour vérifier.

**L'élève voit "Lien invalide" ?**
Le lien a été tronqué lors du copier-coller. Repartagez-le en entier.

**Puis-je modifier un assistant après l'avoir créé ?**
Oui — retournez dans le Studio, chargez le bot depuis votre bibliothèque, modifiez et regénérez le lien.

**Mes élèves ont-ils besoin d'un compte ?**
Non — aucun compte, aucune installation.

**L'IA reste bloquée en mode quiz après qu'un élève a cliqué un bouton ?**
Cela ne devrait plus arriver — les boutons sont configurés en "action ponctuelle". Si le problème persiste, rechargez la page.

---

## Contacts et aide

- **Problème technique** : Gilles Cormi (académie de Corse) via la forge
- **Accès n8n** (proxy Albert/Nuage) : Thomas Sanson via Tchap incubateur EN
- **Communauté** : salon Tchap #n8n de l'incubateur EN
