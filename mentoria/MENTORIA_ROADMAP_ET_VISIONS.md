# 🧠 Mentoria — Visions, Idées et Feuille de Route

Ce document consigne les réflexions stratégiques et pédagogiques pour l'évolution de Mentoria. **À conserver précieusement pour la suite du développement.**

---

## 🌟 La Vision : "Le meilleur des deux mondes"

L'objectif est de créer un hybride entre **ChatMD** (structure) et **Mizou** (IA), le tout 100% souverain.

### 1. Structure ChatMD (Contrôle)
- Intégrer des **boutons de choix rapides** pour l'élève (indices, étape suivante, aide).
- Permettre au prof de définir des **"Missions"** ou des étapes fixes.
- Utiliser le Markdown pour la clarté du contenu.

### 2. Intelligence Mizou/Albert (Fluidité)
- Utiliser Albert pour le dialogue libre entre les étapes.
- Appliquer des **règles de maïeutique** (ne pas donner la réponse).
- Réduction des hallucinations par un ancrage strict sur le **corpus**.

---

## 📖 Stratégie d'Accompagnement (Notice d'usage)

L'outil doit être utilisable par tout enseignant, même non-technique.

### 1. Aide intégrée (In-App)
- **Icônes (?)** à côté de chaque champ du studio pour expliquer l'usage.
- **Tutoriel visuel** sur l'écran bleu de démarrage (3 étapes pour Nuage).
- **Badge de statut** : Vert (connecté), Rouge (erreur de lien ou CORS).

### 2. Guide "Clé API Albert"
Créer un bouton d'assistance dédié pour obtenir la clé sur `albert.etalab.gouv.fr` :
- Procédure de connexion via ProConnect.
- Argumentaire type pour la demande d'accès (Expérimentation pédagogique).
- Rappel des garanties (Gratuité, Souveraineté, Sécurité).

---

## 🚀 Évolutions Techniques prévues

- [ ] **Interface hybride** : Ajout de boutons de réponse rapide configurables dans le Studio.
- [ ] **Gestion des avatars** : Optimisation (redimensionnement auto) avant l'encodage en Base64 pour éviter des URLs trop longues.
- [ ] **Mode "Hors-ligne" renforcé** : S'assurer que si un bot est chargé depuis l'USB, il fonctionne même si la connexion Nuage saute entre-temps.
- [ ] **Export/Import** : Pouvoir sauvegarder un bot en fichier local unitaire pour l'envoyer à un collègue (indépendamment du dossier complet).

---

## 🏛️ Philosophie Institutionnelle

Mentoria n'est pas qu'un outil technique, c'est une démarche politique et pédagogique :
- **Souveraineté** : Utilisation exclusive des outils de l'État (Nuage, Albert, La Forge).
- **RGPD by design** : Aucune donnée élève mémorisée sur serveur tiers, aucun compte requis.
- **Universalité** : Accessible à l'ensemble des personnels de l'Éducation Nationale via leurs comptes académiques.

---

*Document de travail — Avril 2026*
