# Mentoria — Studio de création d'assistants pédagogiques IA

**Mentoria** permet à un enseignant de créer des assistants IA personnalisés pour ses élèves, en toute souveraineté numérique : sans compte Google, sans Firebase, sans serveur commercial.

> ✍️ Conçu et développé par **Gilles Cormi**, enseignant (académie de Corse)
> [![Licence: CC BY-NC-SA 4.0](https://licensebuttons.net/l/by-nc-sa/4.0/88x31.png)](https://creativecommons.org/licenses/by-nc-sa/4.0/)

---

## Accéder à l'application

**Studio (professeur) :** https://gcormi.forge.apps.education.fr/frojet/mentoria/

---

## Caractéristiques

- **100% souverain** — IA Albert (Etalab/DINUM), stockage Nuage ou La Forge (apps.education.fr)
- **RGPD by design** — aucune base de données tierce, aucun compte élève requis
- **Sans installation** — fonctionne dans le navigateur, sur PC, tablette ou smartphone
- **Boutons de réponse rapide** — guidage de l'élève sans frappe clavier (one-shot prompting)
- **Suivi pédagogique** — supervision des échanges en temps réel avec modération

## Comment ça fonctionne

1. Le professeur crée un assistant dans le **Studio** (`index.html`) : identité, règles pédagogiques, corpus de documents
2. Il clique sur **Publier** → un lien unique est généré (toute la configuration est encodée dans l'URL)
3. Il partage ce lien aux élèves via l'ENT ou un QR code
4. L'élève ouvre le lien → l'assistant est prêt, sans compte, sans installation (`compagnion.html`)

## Modes de stockage

| Mode | Description |
|------|-------------|
| ☁️ **Nuage apps.edu** (recommandé) | Bots sauvegardés sur l'espace Nextcloud académique de l'enseignant |
| 💾 **Clé USB / Local** | Bots en fichiers locaux via File System Access API (Chrome/Edge) |
| 🦊 **La Forge** | Bots dans un dépôt GitLab de l'Éducation Nationale |

## Infrastructure

```
Navigateur
   ├── n8n.incubateur.education.gouv.fr  (proxy Albert + proxy Nuage WebDAV)
   ├── albert.api.etalab.gouv.fr         (IA souveraine — Mistral Small 3.2)
   └── nuage.apps.education.fr           (stockage Nextcloud académique)
```

## Documentation

| Document | Lien |
|----------|------|
| Guide enseignant | [NOTICE-MENTORIA-PROF.html](NOTICE-MENTORIA-PROF.html) |
| Documentation technique | [NOTICE-MENTORIA-TECHNIQUE.html](NOTICE-MENTORIA-TECHNIQUE.html) |
| Feuille de route & vision | [ROADMAPS-MENTORIA.html](ROADMAPS-MENTORIA.html) |

## Fichiers principaux

| Fichier | Rôle |
|---------|------|
| `index.html` | Studio de création (interface professeur) |
| `compagnion.html` | Interface élève (lien partageable) |
| `suivi.html` | Console de suivi pédagogique |
| `mentoria_proxy.json` | Workflow n8n — proxy Albert API |
| `mentoria_storage.json` | Workflow n8n — proxy Nuage WebDAV |
| `worker.js` | Cloudflare Worker de secours (non souverain) |

## Prérequis pour l'enseignant

1. **Une clé API Albert** — sur [albert.etalab.gouv.fr](https://albert.etalab.gouv.fr) (connexion via ProConnect)
2. **Un mot de passe d'application Nuage** — dans Nuage → Paramètres → Sécurité
3. **Accès au relais n8n** — via Thomas Sanson (incubateur EN, Tchap)

## Licence

Mentoria est diffusé sous licence **Creative Commons Attribution — Pas d'Utilisation Commerciale — Partage dans les Mêmes Conditions 4.0 International (CC BY-NC-SA 4.0)**.

Vous êtes libre de partager et d'adapter ce projet à condition de :
- **Créditer Gilles Cormi** comme auteur original
- **Ne pas en faire un usage commercial**
- **Redistribuer sous les mêmes conditions**

Mentoria n'est pas un produit officiel de l'Éducation Nationale — il utilise ses infrastructures souveraines.

→ [Texte complet de la licence](LICENSE)
