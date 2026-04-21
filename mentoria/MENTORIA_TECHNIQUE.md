# Documentation technique — Mentoria v2.6

---

## Architecture générale

```
Navigateur (élève ou prof)
       │
       ├─► n8n.incubateur.education.gouv.fr/webhook/mentoria_chat
       │         (proxy Albert — API IA souveraine)
       │
       ├─► n8n.incubateur.education.gouv.fr/webhook/mentoria_storage
       │         (proxy Nuage — WebDAV apps.education.fr)
       │
       └─► forge.apps.education.fr / nuage.apps.education.fr
                 (stockage des bots JSON)
```

**Souveraineté** : 100% infrastructure française (EN + Etalab/DINUM). Aucun service américain.

---

## Problème CORS résolu

L'API Albert (`https://albert.api.etalab.gouv.fr`) ne retourne pas les headers CORS nécessaires depuis un navigateur. Solution : proxy n8n souverain hébergé sur `n8n.incubateur.education.gouv.fr`, obtenu via **Thomas Sanson** (incubateur EN).

---

## Fichiers clés

| Fichier | Rôle |
|---------|------|
| `index.html` | Studio de création (interface professeur) |
| `compagnion.html` | Interface élève (lien partageable) |
| `mentoria_proxy.json` | Workflow n8n — proxy Albert API |
| `mentoria_storage.json` | Workflow n8n — proxy Nuage apps.edu (WebDAV) |
| `worker.js` | Alternative Cloudflare Worker (secours, non souverain) |

---

## Workflow n8n 1 — Proxy Albert (`mentoria_chat`)

**URL** : `https://n8n.incubateur.education.gouv.fr/webhook/mentoria_chat`

3 nœuds : Webhook POST → HTTP Request Albert API → Répondre

Le navigateur envoie :
```json
{
  "model": "openweight-medium",
  "messages": [...],
  "temperature": 0.7
}
```
avec le header `Authorization: Bearer sk-...`

---

## Workflow n8n 2 — Proxy Nuage (`mentoria_storage`)

**URL** : `https://n8n.incubateur.education.gouv.fr/webhook/mentoria_storage`

3 nœuds : Webhook POST → Code JavaScript (logique WebDAV) → Répondre

### Actions supportées

| Action | Méthode WebDAV | Description |
|--------|---------------|-------------|
| `test` | GET OCS API | Vérifie les identifiants, crée le dossier Mentoria |
| `list` | GET | Lit `manifest.json` (liste des bots) |
| `read` | GET | Lit un fichier `bot_xxx.json` |
| `write` | PUT | Écrit un fichier + met à jour `manifest.json` |
| `delete` | DELETE | Supprime un fichier + met à jour `manifest.json` |

### Pourquoi un manifest ?
La méthode WebDAV `PROPFIND` (listing de dossier) n'est pas supportée par le moteur HTTP du Code node n8n. On utilise à la place un fichier `manifest.json` qui liste les bots — mis à jour à chaque écriture/suppression.

### Gestion des instances Nuage

apps.education.fr répartit les utilisateurs sur plusieurs instances (`nuage01`, `nuage02`, `nuage03`...). Le proxy accepte un paramètre `server` optionnel pour cibler la bonne instance. Si absent, il utilise `nuage.apps.education.fr` par défaut.

Le champ "Instance Nuage" dans le Studio permet à l'enseignant de préciser son instance (visible dans l'URL de son navigateur quand il est connecté au Nuage). La valeur est sauvegardée dans `localStorage` si "Rester connecté" est coché.

**Diagnostic d'un 405 :** la réponse `test` inclut `debug.server` pour confirmer l'instance utilisée.

### Structure dans le Nuage
```
{nuageXX}.apps.education.fr/remote.php/dav/files/{username}/mentoria/
├── manifest.json          ← liste des noms de fichiers
├── bot_1234567890.json
├── bot_9876543210.json
└── ...
```

### Requête depuis le Studio
```javascript
fetch('https://n8n.incubateur.education.gouv.fr/webhook/mentoria_storage', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'list' | 'read' | 'write' | 'delete' | 'test',
    username: 'gcormi',
    password: 'mot-de-passe-application',
    server: 'nuage03.apps.education.fr',  // optionnel, défaut : nuage.apps.education.fr
    filename: 'bot_xxx.json',   // pour read/write/delete
    content: { ... }            // pour write
  })
})
```

---

## Modes de stockage (Studio)

### 🦊 La Forge (GitLab EN)
- Bots stockés dans `{projet}/mentoria/bot_xxx.json`
- API GitLab : lecture/écriture via `PRIVATE-TOKEN`
- Accessible depuis n'importe quel PC avec le jeton

### ☁️ Nuage apps.education.fr
- Bots stockés dans `Mentoria/` du Nuage personnel
- Via proxy n8n WebDAV
- Nécessite un **mot de passe d'application** (pas le vrai mot de passe)
- Création : Nuage → Paramètres → Sécurité → Mot de passe d'application

### 💾 Dossier local / USB
- Bots dans un dossier choisi via File System Access API
- Chrome/Edge uniquement
- Non portable entre PC (sauf si dossier Nuage synchronisé)

---

## Lien élève — Encodage

Le lien élève contient toute la configuration encodée dans le hash URL :
```
compagnion.html#config={encoded}
```

**Encodage (index.html)** :
```javascript
LZString.compressToEncodedURIComponent(JSON.stringify(bot))
```

**Décodage (compagnion.html)** :
```javascript
// Essaie LZString (nouveau format), puis btoa (ancien format)
json = LZString.decompressFromEncodedURIComponent(b64);
```

LZString compresse le JSON à ~40% de sa taille originale, permettant des corpus de 300KB+ sans problème.

---

## Limites du corpus

| Taille texte | Verdict |
|-------------|---------|
| < 50KB (≈ 15 pages) | ✅ Idéal |
| 50-120KB (≈ 50 pages) | ✅ OK — limite de la fenêtre Albert |
| 120-300KB | ⚠️ Albert ignore la fin |
| > 300KB | ❌ Lien trop long |

PDF.js extrait uniquement le texte (pas les images). 50 pages PDF ≈ 75-100KB de texte extrait.

---

## Avatar / vignette

L'image uploadée est automatiquement redimensionnée à **128×128 px max** (JPEG 82%) via un canvas HTML5 avant stockage. Cela réduit une photo de 400KB à ~6KB.

---

## Modèles Albert disponibles

| Alias | Modèle | Usage |
|-------|--------|-------|
| `openweight-large` | openai/gpt-oss-120b | Tâches complexes |
| `openweight-medium` | mistralai/Mistral-Small-3.2-24B-Instruct-2506 | **Défaut Mentoria** ✅ |
| `openweight-small` | mistralai/Ministral-3-8B-Instruct-2512 | Tâches simples |
| `openweight-code` | Qwen/Qwen3-Coder-30B | Code |
| `openweight-audio` | openai/whisper-large-v3 | Audio |
| `openweight-embeddings` | BAAI/bge-m3 | RAG |

**`openweight-medium`** = Mistral Small 3.2 (24B) ≈ GPT-4o mini. Rapide, suit bien les instructions système, suffisant pour usage scolaire.

---

## Source des réponses

Champ `config.answerSource` dans le bot JSON :

| Valeur | Comportement |
|--------|-------------|
| `'both'` | Corpus + connaissances générales (défaut) |
| `'corpus'` | Corpus exclusivement — l'IA signale si absent |
| `'albert'` | Connaissances générales uniquement (corpus ignoré) |

Modifie le system prompt dans `compagnion.html` ligne ~424.

---

## Boutons de réponse rapide — comportement

Les boutons rapides envoient un prompt "one-shot" pour éviter que l'IA reste bloquée dans un mode (ex: quiz permanent). Le prompt réel est préfixé par :

```
[DEMANDE PONCTUELLE — exécute UNIQUEMENT cette action,
puis reprends ton rôle d'assistant habituel pour la suite]
```

L'élève voit le label du bouton, pas ce préfixe.

---

## Contacts

| Personne | Rôle | Contact |
|----------|------|---------|
| Gilles Cormi | Auteur Mentoria | forge.apps.education.fr |
| Thomas Sanson | Accès n8n incubateur EN | Via Tchap incubateur |
| Nicolas Varlot | Support Nuage Ac-Versailles | Via Tchap apps.edu |
| Paulo Santos | Support Nuage Ac-Reims | Via Tchap apps.edu |
| Benoît Piedallu | Support technique EN | Via Tchap apps.edu |
| Vincent Schoeffter | Co-auteur Live Quiz | vincent.schoeffter@ac-nantes.fr |
| Gauthier Remande | Co-auteur Live Quiz | gauthier.remande@ac-nantes.fr |
