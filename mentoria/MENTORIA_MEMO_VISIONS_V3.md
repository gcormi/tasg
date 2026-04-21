# 📝 Mentoria — Mémo Visions & Spécifications (Phase 3)

Ce document récapitule les fonctionnalités définies lors de la phase de réflexion du 20 avril 2026. À intégrer dans la Roadmap officielle.

---

## 1. Souveraineté & Architecture de Suivi (via n8n)
L'utilisation du relais n8n (incubateur) permet de restaurer le suivi pédagogique sans sacrifier la souveraineté.

- **n8n comme "Journal de bord"** : Le relais enregistre chaque échange (élève, message, réponse, date) vers un stockage souverain (ex: Fichier JSON sur Nextcloud/Nuage).
- **Interface de supervision (Studio)** : Un nouvel onglet "Suivi de classe" dans le Studio permet au prof de piloter la séance.
- **Actions Professeur** :
    - **Visualisation** : Lecture des flux de discussion en temps réel ou en différé.
    - **Export Prof** : Bouton pour télécharger un récapitulatif complet de la classe (format CSV ou JSON).
    - **Nettoyage** : Bouton pour supprimer les logs (RGPD) après la séance.
    - **Reset Session** : Possibilité de clôturer une session pour redémarrer à zéro avec une nouvelle classe.

## 2. Gestion des Identifiants & Modération
Pour garantir un cadre institutionnel strict :

- **Identifiant ENT Obligatoire** : Remplacement de la notion de "Pseudo" par "Identifiant ENT" dans `compagnion.html`. L'élève doit décliner son identité académique (ex: `prenom.nom`) pour entrer.
- **Modération en Direct** : 
    - Le prof peut "Bannir/Exclure" un identifiant depuis son tableau de bord.
    - **Mécanisme** : n8n rejette les requêtes de l'identifiant banni. L'élève reçoit un message d'exclusion ou est redirigé vers l'écran de connexion.

## 3. Fonctionnalités Élèves (Autonomie & Trace)
- **Export de Discussion** : Ajout d'un bouton "Sauvegarder" dans l'interface chat.
    - **Action** : Téléchargement d'un fichier `.txt` simple.
    - **Confirmation** : Message sobre : *"Voulez-vous sauvegarder votre discussion ?"*.
    - **Format** : En-tête (Bot, Date, Identifiant) + corps du dialogue mis en forme.
    - **Nommage** : `Mentoria_[NomDuBot]_[Identifiant].txt`.

## 4. Vision "Le meilleur des deux mondes" (Hybridation)
- **Structure (ChatMD)** : Boutons de réponse rapide (ex: indices, aide au démarrage) définis par le prof dans le Studio.
- **Fluidité (Albert)** : Maïeutique IA basée sur le corpus, guidée par les boutons rapides.
- **Prompting** : Les boutons rapides envoient des instructions "cachées" à l'IA tout en affichant un label simple pour l'élève.

---
*Document de travail — Avril 2026 — Mentoria V3*
