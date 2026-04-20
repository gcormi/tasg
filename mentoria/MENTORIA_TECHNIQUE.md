# Documentation technique — Mentoria

## Problème résolu : blocage CORS

### Contexte
Mentoria est hébergé sur la forge des communs numériques de l'Éducation Nationale (`gcormi.forge.apps.education.fr`). L'application appelle l'API Albert (IA souveraine française d'Etalab) pour alimenter les assistants pédagogiques.

### Le problème
L'API Albert (`https://albert.api.etalab.gouv.fr`) ne retournait pas les headers CORS nécessaires, ce qui bloquait toutes les requêtes depuis le navigateur avec l'erreur :
```
Access to fetch has been blocked by CORS policy: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

### Solution retenue : proxy n8n souverain

Après investigation, l'équipe **Live Quiz** (V. Schoeffter & G. Remande, académie de Nantes) utilisait déjà un webhook **n8n** hébergé sur `n8n.incubateur.education.gouv.fr` comme proxy souverain entre le navigateur et l'API Albert.

Cette solution a été reproduite pour Mentoria grâce à l'accès obtenu auprès de **Thomas Sanson** (incubateur de l'Éducation Nationale).

---

## Architecture de la solution

```
Navigateur (élève)
       │
       ▼
https://n8n.incubateur.education.gouv.fr/webhook/mentoria_chat
       │  (proxy souverain — Éducation Nationale)
       ▼
https://albert.api.etalab.gouv.fr/v1/chat/completions
       │  (IA souveraine française — Etalab/DINUM)
       ▼
Réponse renvoyée au navigateur
```

**Souveraineté** : 100% infrastructure française (EN + Etalab), aucun service américain impliqué.

---

## Fichiers clés

### `compagnion.html`
L'URL du proxy est définie ligne ~337 :
```javascript
const ALBERT_PROXY_URL = 'https://n8n.incubateur.education.gouv.fr/webhook/mentoria_chat';
```
Pour changer le proxy, modifier uniquement cette ligne.

### `mentoria_proxy.json`
Workflow n8n à importer sur `n8n.incubateur.education.gouv.fr`.
Contient 3 nœuds :
1. **Webhook** — reçoit les requêtes POST depuis le navigateur (CORS `*` activé)
2. **Albert API** — relaie la requête vers l'API Albert avec le header Authorization
3. **Répondre** — retourne la réponse au navigateur

### `worker.js`
Alternative Cloudflare Worker (solution de secours, non souveraine).
À utiliser uniquement si le webhook n8n devient indisponible.

---

## Déploiement du workflow n8n

1. Se connecter sur `https://n8n.incubateur.education.gouv.fr`
   (accès via Thomas Sanson — canal Tchap incubateur EN)
2. Créer un nouveau workflow
3. Importer `mentoria_proxy.json` via le menu `...` → Import from file
4. Publier le workflow
5. Récupérer la **Production URL** du nœud Webhook :
   `https://n8n.incubateur.education.gouv.fr/webhook/mentoria_chat`

---

## Contacts utiles

| Personne | Rôle | Contact |
|----------|------|---------|
| Vincent Schoeffter | Co-auteur Live Quiz | vincent.schoeffter@ac-nantes.fr |
| Gauthier Remande | Co-auteur Live Quiz | gauthier.remande@ac-nantes.fr |
| Thomas Sanson | Accès n8n incubateur EN | Via Tchap incubateur |

---

## Modèles Albert disponibles

L'API Albert propose les alias suivants (vérifiés avril 2026) :

| Alias | Modèle | Usage |
|-------|--------|-------|
| `openweight-large` | openai/gpt-oss-120b | Tâches complexes |
| `openweight-medium` | mistralai/Mistral-Small-3.2-24B-Instruct-2506 | Tâches modérées ✅ **utilisé par Mentoria** |
| `openweight-small` | mistralai/Ministral-3-8B-Instruct-2512 | Tâches simples |
| `openweight-code` | Qwen/Qwen3-Coder-30B | Code |
| `openweight-audio` | openai/whisper-large-v3 | Transcription audio |
| `openweight-embeddings` | BAAI/bge-m3 | Vectorisation RAG |

**Modèle par défaut dans Mentoria : `openweight-medium`**
Défini dans `compagnion.html` : `model: botConfig.model || 'openweight-medium'`
Peut être surchargé par le champ `model` dans la config du bot.

### Équivalences et choix du modèle

| Alias Albert | Équivalent commercial | Recommandation |
|-------------|----------------------|----------------|
| `openweight-small` | ≈ GPT-3.5 | Trop limité pour Mentoria |
| `openweight-medium` | ≈ GPT-4o mini / Claude Haiku | **Recommandé** — rapide, suffisant pour usage scolaire |
| `openweight-large` | ≈ GPT-4o / Claude Sonnet | Plus puissant mais plus lent |

**`openweight-medium` (Mistral Small 3.2, 24B paramètres)** est le bon compromis pour Mentoria :
- Suit bien les instructions système (corpus, règles pédagogiques)
- Rapide pour des échanges en classe
- Suffisant pour expliquer un cours, donner des indices, poser des questions
- Pas adapté à du raisonnement très complexe (maths avancées, dissertations longues)

Pour des assistants sur des sujets complexes, passer à `openweight-large` est possible en modifiant le champ `model` dans la config du bot.
