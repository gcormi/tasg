// Experia Worker — Albert API + Nuage WebDAV proxy
// Secrets requis (wrangler secret put) :
//   NUAGE_USER   → identifiant Nuage apps.education.fr
//   NUAGE_PASS   → mot de passe d'application Nextcloud
//   NUAGE_SERVER → ex: nuage03.apps.education.fr (optionnel, défaut ci-dessous)
//   ALBERT_KEY   → clé API Albert Etalab (sk-...)
//   PROF_SECRET  → mot de passe professeur (choisi librement)

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS });
    }
    if (request.method !== 'POST') {
      return json({ error: 'POST requis' }, 405);
    }

    let body;
    try { body = await request.json(); }
    catch { return json({ error: 'Corps JSON invalide' }, 400); }

    const { action } = body;
    if (!action) return json({ error: 'action requise' }, 400);

    // ── Actions élève (sans authentification) ──────────────────────────────
    if (action === 'readSession') return handleReadSession(body, env);
    if (action === 'writeResult') return handleWriteResult(body, env);
    if (action === 'readResult')  return handleReadResult(body, env);
    if (action === 'albert')      return handleAlbert(body, env);

    // ── Actions prof (profSecret obligatoire) ──────────────────────────────
    if (!env.PROF_SECRET || body.profSecret !== env.PROF_SECRET) {
      return json({ success: false, error: 'Secret professeur invalide.' }, 403);
    }
    if (action === 'test')       return handleTest(env);
    if (action === 'listModels') return handleListModels(env);
    if (action === 'list')       return handleList(env);
    if (action === 'read')       return handleRead(body, env);
    if (action === 'write')      return handleWrite(body, env);
    if (action === 'delete')     return handleDelete(body, env);

    return json({ success: false, error: 'Action inconnue : ' + action }, 400);
  }
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS }
  });
}

function nuageAuth(env) {
  return 'Basic ' + btoa(`${env.NUAGE_USER}:${env.NUAGE_PASS}`);
}

function nuageBase(env) {
  const server = (env.NUAGE_SERVER || 'nuage03.apps.education.fr').replace(/^https?:\/\//, '').replace(/\/$/, '');
  return `https://${server}/remote.php/dav/files/${encodeURIComponent(env.NUAGE_USER)}/experia/`;
}

async function nuageGet(url, env) {
  return fetch(url, { headers: { Authorization: nuageAuth(env) } });
}

async function nuagePut(url, data, env) {
  return fetch(url, {
    method: 'PUT',
    headers: { Authorization: nuageAuth(env), 'Content-Type': 'application/octet-stream' },
    body: data
  });
}

async function nuageMkcol(url, env) {
  return fetch(url, { method: 'MKCOL', headers: { Authorization: nuageAuth(env) } });
}

async function nuageDelete(url, env) {
  return fetch(url, { method: 'DELETE', headers: { Authorization: nuageAuth(env) } });
}

async function readManifest(env) {
  const res = await nuageGet(nuageBase(env) + 'manifest.json', env);
  if (res.status !== 200) return [];
  try {
    const text = await res.text();
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}

async function writeManifest(manifest, env) {
  await nuagePut(nuageBase(env) + 'manifest.json', JSON.stringify(manifest), env);
}

// ── Test connexion (prof) ─────────────────────────────────────────────────────

async function handleTest(env) {
  const server = (env.NUAGE_SERVER || 'nuage03.apps.education.fr').replace(/^https?:\/\//, '').replace(/\/$/, '');
  try {
    const res = await fetch(`https://${server}/ocs/v1.php/cloud/user?format=json`, {
      headers: { Authorization: nuageAuth(env), 'OCS-APIREQUEST': 'true' }
    });
    if (res.status === 401 || res.status === 403) {
      return json({ success: false, error: 'Credentials Nuage invalides dans le Worker. Vérifiez vos secrets Cloudflare.' });
    }
    if (res.status !== 200) {
      return json({ success: false, error: `Erreur OCS : ${res.status} — vérifiez NUAGE_SERVER.` });
    }
    await nuageMkcol(nuageBase(env), env); // crée /experia/ si nécessaire
    return json({ success: true, user: env.NUAGE_USER, server });
  } catch (e) {
    return json({ success: false, error: e.message });
  }
}

// ── Albert (prof + élève) ─────────────────────────────────────────────────────

async function handleAlbert(body, env) {
  const { messages, model, temperature = 0.3 } = body;
  if (!messages) return json({ error: 'messages requis' }, 400);
  try {
    const res = await fetch('https://albert.api.etalab.gouv.fr/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.ALBERT_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model || 'openai/gpt-oss-120b',
        messages,
        temperature,
        max_tokens: 3000
      })
    });
    const data = await res.json();
    if (res.status >= 400) return json({ error: `Albert erreur ${res.status}`, detail: data });
    return json(data);
  } catch (e) {
    return json({ error: e.message });
  }
}

async function handleListModels(env) {
  try {
    const res = await fetch('https://albert.api.etalab.gouv.fr/v1/models', {
      headers: { Authorization: `Bearer ${env.ALBERT_KEY}` }
    });
    const data = await res.json();
    if (res.status >= 400) return json({ error: `Albert erreur ${res.status}` });
    return json(data);
  } catch (e) {
    return json({ error: e.message });
  }
}

// ── Stockage (prof) ───────────────────────────────────────────────────────────

async function handleList(env) {
  try {
    const manifest = await readManifest(env);
    return json({ success: true, files: manifest.map(n => ({ name: n })) });
  } catch (e) {
    return json({ success: false, error: e.message });
  }
}

async function handleRead(body, env) {
  const { filename } = body;
  if (!filename) return json({ success: false, error: 'filename requis' });
  const base = nuageBase(env);
  try {
    const res = await nuageGet(base + encodeURIComponent(filename), env);
    if (res.status === 404) return json({ success: false, error: 'Fichier introuvable' });
    if (res.status === 401) return json({ success: false, error: 'Session expirée' });
    if (res.status >= 400) return json({ success: false, error: `Erreur lecture (code ${res.status})` });
    const text = await res.text();
    const content = JSON.parse(text);
    return json({ success: true, content });
  } catch (e) {
    return json({ success: false, error: e.message });
  }
}

async function handleWrite(body, env) {
  const { filename, content } = body;
  if (!filename) return json({ success: false, error: 'filename requis' });
  const base = nuageBase(env);
  const data = typeof content === 'string' ? content : JSON.stringify(content, null, 2);
  try {
    let res = await nuagePut(base + encodeURIComponent(filename), data, env);
    if ([404, 405, 409].includes(res.status)) {
      await nuageMkcol(base, env);
      res = await nuagePut(base + encodeURIComponent(filename), data, env);
    }
    if (res.status >= 400) return json({ success: false, error: `Erreur écriture (code ${res.status})` });
    let manifest = await readManifest(env);
    if (!manifest.includes(filename)) manifest.push(filename);
    await writeManifest(manifest, env);
    return json({ success: true, action: 'write' });
  } catch (e) {
    return json({ success: false, error: e.message });
  }
}

async function handleDelete(body, env) {
  const { filename } = body;
  if (!filename) return json({ success: false, error: 'filename requis' });
  const base = nuageBase(env);
  try {
    await nuageDelete(base + encodeURIComponent(filename), env);
    let manifest = await readManifest(env);
    await writeManifest(manifest.filter(n => n !== filename), env);
    return json({ success: true, action: 'delete' });
  } catch (e) {
    return json({ success: false, error: e.message });
  }
}

// ── Stockage (élève) — actions restreintes, sans authentification ─────────────

async function handleReadSession(body, env) {
  const { sessionId } = body;
  if (!sessionId) return json({ success: false, error: 'sessionId requis' });
  // Sécurité : on n'accepte que les fichiers session_*
  const filename = sessionId.startsWith('session_') ? sessionId + '.json' : 'session_' + sessionId + '.json';
  const base = nuageBase(env);
  try {
    const res = await nuageGet(base + encodeURIComponent(filename), env);
    if (res.status === 404) return json({ success: false, error: 'Session introuvable' });
    if (res.status >= 400) return json({ success: false, error: `Erreur ${res.status}` });
    const text = await res.text();
    const content = JSON.parse(text);
    // On ne renvoie JAMAIS de credentials depuis le fichier session
    const { apiKey: _k, nuagePass: _p, nuageUser: _u, ...safe } = content;
    return json({ success: true, content: safe });
  } catch (e) {
    return json({ success: false, error: e.message });
  }
}

async function handleWriteResult(body, env) {
  const { sessionId, studentId, data } = body;
  if (!sessionId || !studentId) return json({ success: false, error: 'sessionId et studentId requis' });
  const safeStudent = studentId.replace(/[^a-zA-Z0-9]/g, '-').substring(0, 64);
  const filename = `result_${sessionId}_${safeStudent}.json`;
  const base = nuageBase(env);
  const content = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
  try {
    let res = await nuagePut(base + encodeURIComponent(filename), content, env);
    if ([404, 405, 409].includes(res.status)) {
      await nuageMkcol(base, env);
      res = await nuagePut(base + encodeURIComponent(filename), content, env);
    }
    if (res.status >= 400) return json({ success: false, error: `Erreur écriture (code ${res.status})` });
    let manifest = await readManifest(env);
    if (!manifest.includes(filename)) manifest.push(filename);
    await writeManifest(manifest, env);
    return json({ success: true });
  } catch (e) {
    return json({ success: false, error: e.message });
  }
}

async function handleReadResult(body, env) {
  const { sessionId, studentId } = body;
  if (!sessionId || !studentId) return json({ success: false, error: 'sessionId et studentId requis' });
  const safeStudent = studentId.replace(/[^a-zA-Z0-9]/g, '-').substring(0, 64);
  const filename = `result_${sessionId}_${safeStudent}.json`;
  const base = nuageBase(env);
  try {
    const res = await nuageGet(base + encodeURIComponent(filename), env);
    if (res.status === 404) return json({ success: false, error: 'Résultat introuvable' });
    if (res.status >= 400) return json({ success: false, error: `Erreur ${res.status}` });
    const text = await res.text();
    return json({ success: true, content: JSON.parse(text) });
  } catch (e) {
    return json({ success: false, error: e.message });
  }
}
