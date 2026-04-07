# 📘 Guide Ultime : Intégration Albert API & La Forge (v4.0)

Ce document est conçu pour être transmis à **Gemini 3** (ou tout autre modèle de langage) afin de lui servir de "Spécifications de Référence" pour coder des applications pédagogiques souveraines.

---

## 🏗️ 1. Architecture du Projet (Le Concept "Relais")

**Problème :** Une application hébergée sur **La Forge** (GitLab Pages) est entièrement publique. Si vous mettez votre clé API Albert dans votre fichier `index.html`, n'importe qui peut la voler.
**Solution :** Utiliser un "Proxy" ou "Relais".

### Le flux de données :
1. **Frontend (La Forge) :** L'utilisateur clique sur "Générer". Le JavaScript envoie une requête à l'URL de votre **Relais**.
2. **Relais (Invisible) :** Un petit moteur (Cloudflare Worker, Firebase Function ou n8n) intercepte la demande. Il y injecte votre **Clé API Albert** de manière sécurisée.
3. **Albert (IA) :** Il reçoit la demande "officielle", traite le texte, et renvoie la réponse au Relais.
4. **Relais :** Il renvoie la réponse finale à votre **Frontend**.

---

## ⚙️ 2. Spécifications Techniques Albert API

Albert est compatible avec le format **OpenAI**. Voici les réglages à donner à toute IA qui code pour vous :

- **Base URL :** `https://albert.etalab.gouv.fr/v1` (ou l'adresse fournie par votre académie/DINUM).
- **Format :** JSON (standard REST).
- **Authentification :** En-tête `Authorization: Bearer [CLE_API_SECURE]`.
- **Méthode :** `POST` sur l'endpoint `/chat/completions`.
- **Modèles conseillés :**
  - `albert-small-1` (Rapide, pour les corrections simples)
  - `albert-base-1` (Équilibré, pour la préparation de cours)
  - `albert-large-1` (Puisant, pour les analyses complexes)

---

## 📜 3. Le "Meta-Prompt" pour Gemini 3 (À copier-coller)

*Lorsque vous commencez un nouveau projet avec Gemini 3, donnez-lui ce texte :*

> "Je veux créer une application web pédagogique hébergée sur La Forge (Éducation Nationale).
> L'IA utilisée sera **Albert** (DINUM).
> 
> **Voici tes contraintes de programmation :**
> 1. **Architecture Sécurisée :** Ne propose JAMAIS d'inclure la clé API directement dans le code JavaScript du Frontend. Propose toujours une structure séparant le Client (HTML/CSS/JS) et le Proxy Relais.
> 2. **Standard API :** Albert utilise le format exact d'OpenAI (Endpoint: `/v1/chat/completions`). Configurer les en-têtes (headers) avec `Authorization: Bearer [CLE]`.
> 3. **Design :** Utilise Vanilla CSS 'Premium' avec Glassmorphism (effets de transparence et flou). L'interface doit être sobre, moderne et adaptée aux enseignants.
> 4. **Interaction :** Gère le 'streaming' (affichage du texte en direct) si possible pour une meilleure expérience utilisateur.
> 
> Comprends-tu ces spécifications techniques avant que je te donne le sujet de l'application ?"

---

## 🛠️ 4. Exemples de Code de Référence (Frontend)

C'est le code que Gemini doit générer pour votre fichier sur La Forge :

```javascript
/* Fonction d'appel à Albert via un Relais */
async function appelerAlbert(promptUtilisateur) {
    const urlRelais = "https://votre-relais.workers.dev"; // Sera votre URL de relais Cloudflare ou autre
    
    try {
        const response = await fetch(`${urlRelais}/v1/chat/completions`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "albert-base-1",
                messages: [
                    { role: "system", content: "Tu es un expert pédagogique de l'Éducation Nationale." },
                    { role: "user", content: promptUtilisateur }
                ],
                temperature: 0.7
            })
        });

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error("Erreur Albert API :", error);
        return "Une erreur est survenue lors de la génération.";
    }
}
```

---

## 🚀 5. Checklist de Déploiement sur La Forge

1. **Clé API :** Avoir récupéré son jeton sur le portail Albert/DINUM.
2. **Relais :** Avoir configuré un petit service gratuit (ex: Cloudflare Worker ou Firebase) qui stocke la clé.
3. **CORS :** S'assurer que le Relais autorise les requêtes venant du domaine `apps.education.fr`.
4. **GitLab Pages :** Pousser le code HTML/JS sur La Forge sans oublier de configurer le fichier `.gitlab-ci.yml`.

---

*Guide rédigé par Antigravity - Expert IA Souveraine & Développement.*
