// Experia Worker v2 — Stockage KV, sans credentials profs
//
// Secrets Cloudflare requis :
//   ALBERT_KEY      → clé Albert partagée (Gilles) pour les élèves
//   MASTER_SECRET   → code d'inscription (Gilles le donne aux profs du test)
//
// KV binding requis : EXPERIA_KV
//
// Aucun credential Nuage n'est stocké. Les profs s'authentifient
// avec profId + profSecret (haché SHA-256 en KV).

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return new Response(null, { headers: CORS });
    if (request.method !== 'POST') return json({ error: 'POST requis' }, 405);

    let body;
    try { body = await request.json(); }
    catch { return json({ error: 'Corps JSON invalide' }, 400); }

    const { action } = body;
    if (!action) return json({ error: 'action requise' }, 400);

    // ── Actions élève (aucune authentification) ───────────────────────────────
    if (action === 'studentReadSession') return handleStudentReadSession(body, env);
    if (action === 'writeResult')        return handleWriteResult(body, env);
    if (action === 'readResult')         return handleStudentReadResult(body, env);
    if (action === 'writePresence')      return handleWritePresence(body, env);
    if (action === 'readPresences')      return handleReadPresences(body, env);
    if (action === 'albert')             return handleAlbert(body, env);
    if (action === 'getCompletions')     return handleGetCompletions(body, env);
    if (action === 'setCompletion')      return handleSetCompletion(body, env);

    // ── Inscription prof ──────────────────────────────────────────────────────
    if (action === 'register') return handleRegister(body, env);

    // ── Actions prof (profId + profSecret requis) ─────────────────────────────
    const auth = await verifyProf(body, env);
    if (!auth.ok) return json({ success: false, error: auth.error }, 403);

    if (action === 'test')          return json({ success: true, profId: body.profId });
    if (action === 'writeSession')  return handleWriteSession(body, env);
    if (action === 'listSessions')  return handleListSessions(body, env);
    if (action === 'readSession')   return handleReadSession(body, env);
    if (action === 'deleteSession') return handleDeleteSession(body, env);
    if (action === 'readResults')   return handleReadResults(body, env);
    if (action === 'listModels')    return handleListModels(body, env);
    if (action === 'listNotes')        return handleListNotes(body, env);
    if (action === 'readNote')         return handleReadNote(body, env);
    if (action === 'writeNote')        return handleWriteNote(body, env);
    if (action === 'deleteNote')       return handleDeleteNote(body, env);
    if (action === 'resetCompletion')  return handleResetCompletion(body, env);

    return json({ success: false, error: 'Action inconnue : ' + action }, 400);
  }
};

// ── Utilitaires ───────────────────────────────────────────────────────────────

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS }
  });
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

async function sha256(text) {
  const data = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function safeId(str) {
  return str.replace(/[^a-zA-Z0-9_-]/g, '-').substring(0, 64);
}

// ── Authentification prof ─────────────────────────────────────────────────────

async function verifyProf(body, env) {
  const { profId, profSecret } = body;
  if (!profId || !profSecret) return { ok: false, error: 'profId et profSecret requis' };
  const record = await env.EXPERIA_KV.get('prof:' + safeId(profId), 'json');
  if (!record) return { ok: false, error: 'Compte introuvable — vérifiez votre identifiant.' };
  const hash = await sha256(profSecret);
  if (hash !== record.secretHash) return { ok: false, error: 'Secret incorrect.' };
  return { ok: true };
}

// ── Inscription ───────────────────────────────────────────────────────────────

async function handleRegister(body, env) {
  const { profId, profSecret, masterSecret } = body;

  // Vérification du code d'inscription
  if (!env.MASTER_SECRET || masterSecret !== env.MASTER_SECRET) {
    return json({ success: false, error: 'Code d\'inscription invalide. Contactez l\'administrateur.' }, 403);
  }

  if (!profId || !profSecret) return json({ success: false, error: 'profId et profSecret requis' });
  if (profSecret.length < 6) return json({ success: false, error: 'Secret trop court (6 caractères minimum).' });

  const key = 'prof:' + safeId(profId);
  const existing = await env.EXPERIA_KV.get(key);
  if (existing) return json({ success: false, error: 'Cet identifiant est déjà utilisé. Choisissez-en un autre.' });

  const secretHash = await sha256(profSecret);
  await env.EXPERIA_KV.put(key, JSON.stringify({ secretHash, createdAt: Date.now() }));
  return json({ success: true, profId: safeId(profId) });
}

// ── Sessions (prof) ───────────────────────────────────────────────────────────

async function handleWriteSession(body, env) {
  const { profId, session } = body;
  if (!session) return json({ success: false, error: 'session requise' });

  const sessionId = session.id || ('s_' + uid());
  const safeProfId = safeId(profId);
  const fullSession = { ...session, id: sessionId, profId: safeProfId, updatedAt: Date.now() };

  await env.EXPERIA_KV.put('session:' + sessionId, JSON.stringify(fullSession));

  // Mise à jour du manifeste prof
  const manifestKey = 'manifest:' + safeProfId;
  let manifest = await env.EXPERIA_KV.get(manifestKey, 'json') || [];
  if (!manifest.includes(sessionId)) manifest.push(sessionId);
  await env.EXPERIA_KV.put(manifestKey, JSON.stringify(manifest));

  return json({ success: true, sessionId });
}

async function handleListSessions(body, env) {
  const safeProfId = safeId(body.profId);
  const manifest = await env.EXPERIA_KV.get('manifest:' + safeProfId, 'json') || [];

  const sessions = [];
  for (const sid of manifest) {
    const s = await env.EXPERIA_KV.get('session:' + sid, 'json');
    if (s) sessions.push({
      id: s.id,
      title: s.title || sid,
      code: s.code,
      theme: s.theme,
      model: s.model,
      scoring: s.scoring,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
      activitiesCount: Object.keys(s.questions || {}).length,
      templateId: s.templateId || null,
      classe: s.classe || null
    });
  }
  return json({ success: true, sessions });
}

async function handleReadSession(body, env) {
  const { sessionId } = body;
  if (!sessionId) return json({ success: false, error: 'sessionId requis' });

  const session = await env.EXPERIA_KV.get('session:' + sessionId, 'json');
  if (!session) return json({ success: false, error: 'Session introuvable' });

  // Vérifier que la session appartient bien à ce prof
  if (session.profId !== safeId(body.profId)) {
    return json({ success: false, error: 'Accès non autorisé.' }, 403);
  }
  return json({ success: true, session });
}

async function handleDeleteSession(body, env) {
  const { sessionId } = body;
  if (!sessionId) return json({ success: false, error: 'sessionId requis' });

  const session = await env.EXPERIA_KV.get('session:' + sessionId, 'json');
  if (session && session.profId !== safeId(body.profId)) {
    return json({ success: false, error: 'Accès non autorisé.' }, 403);
  }

  await env.EXPERIA_KV.delete('session:' + sessionId);

  const manifestKey = 'manifest:' + safeId(body.profId);
  let manifest = await env.EXPERIA_KV.get(manifestKey, 'json') || [];
  await env.EXPERIA_KV.put(manifestKey, JSON.stringify(manifest.filter(id => id !== sessionId)));

  return json({ success: true });
}

// ── Résultats ─────────────────────────────────────────────────────────────────

async function handleReadResults(body, env) {
  const { sessionId } = body;
  if (!sessionId) return json({ success: false, error: 'sessionId requis' });

  // Vérifier ownership
  const session = await env.EXPERIA_KV.get('session:' + sessionId, 'json');
  if (!session || session.profId !== safeId(body.profId)) {
    return json({ success: false, error: 'Accès non autorisé.' }, 403);
  }

  const listKey = 'resultlist:' + sessionId;
  const studentIds = await env.EXPERIA_KV.get(listKey, 'json') || [];

  const results = [];
  for (const sid of studentIds) {
    const r = await env.EXPERIA_KV.get('result:' + sessionId + ':' + sid, 'json');
    if (r) results.push(r);
  }
  return json({ success: true, results });
}

// ── Actions élève ─────────────────────────────────────────────────────────────

async function handleStudentReadSession(body, env) {
  const { sessionId } = body;
  if (!sessionId) return json({ success: false, error: 'sessionId requis' });

  const session = await env.EXPERIA_KV.get('session:' + sessionId, 'json');
  if (!session) return json({ success: false, error: 'Session introuvable' });

  // Ne jamais renvoyer profId ni données internes à l'élève
  const { profId: _p, ...safe } = session;
  return json({ success: true, content: safe });
}

async function handleWriteResult(body, env) {
  const { sessionId, studentId, data } = body;
  if (!sessionId || !studentId) return json({ success: false, error: 'sessionId et studentId requis' });

  const safeStudent = safeId(studentId);
  const resultKey = 'result:' + sessionId + ':' + safeStudent;
  const content = typeof data === 'object' ? { ...data, studentId, submittedAt: Date.now() } : { raw: data, studentId, submittedAt: Date.now() };

  await env.EXPERIA_KV.put(resultKey, JSON.stringify(content));

  // Mise à jour de la liste des élèves
  const listKey = 'resultlist:' + sessionId;
  let list = await env.EXPERIA_KV.get(listKey, 'json') || [];
  if (!list.includes(safeStudent)) list.push(safeStudent);
  await env.EXPERIA_KV.put(listKey, JSON.stringify(list));

  return json({ success: true });
}

async function handleWritePresence(body, env) {
  const { sessionId, studentId } = body;
  if (!sessionId || !studentId) return json({ success: false, error: 'sessionId et studentId requis' });
  const safeStudent = safeId(studentId);
  await env.EXPERIA_KV.put('presence:' + sessionId + ':' + safeStudent, JSON.stringify({ studentId, connectedAt: Date.now() }));
  const listKey = 'presencelist:' + sessionId;
  let list = await env.EXPERIA_KV.get(listKey, 'json') || [];
  if (!list.includes(safeStudent)) list.push(safeStudent);
  await env.EXPERIA_KV.put(listKey, JSON.stringify(list));
  return json({ success: true });
}

async function handleReadPresences(body, env) {
  const { sessionId } = body;
  if (!sessionId) return json({ success: false, error: 'sessionId requis' });
  const list = await env.EXPERIA_KV.get('presencelist:' + sessionId, 'json') || [];
  const presences = [];
  for (const sid of list) {
    const p = await env.EXPERIA_KV.get('presence:' + sessionId + ':' + sid, 'json');
    if (p) presences.push(p);
  }
  return json({ success: true, presences });
}

async function handleStudentReadResult(body, env) {
  const { sessionId, studentId } = body;
  if (!sessionId || !studentId) return json({ success: false, error: 'sessionId et studentId requis' });
  const safeStudent = safeId(studentId);
  const content = await env.EXPERIA_KV.get('result:' + sessionId + ':' + safeStudent, 'json');
  if (!content) return json({ success: false });
  return json({ success: true, content });
}

// ── Albert ────────────────────────────────────────────────────────────────────

async function handleAlbert(body, env) {
  const { messages, model, temperature = 0.3, profAlbertKey } = body;
  if (!messages) return json({ error: 'messages requis' }, 400);

  // Le prof peut envoyer sa propre clé ; sinon on utilise la clé partagée
  const key = profAlbertKey || env.ALBERT_KEY;
  if (!key) return json({ error: 'Clé Albert non configurée.' }, 500);

  try {
    const res = await fetch('https://albert.api.etalab.gouv.fr/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: model || 'openai/gpt-oss-120b',
        messages,
        temperature,
        max_tokens: 3000
      })
    });
    const data = await res.json();
    if (res.status >= 400) return json({ error: 'Albert erreur ' + res.status, detail: data });
    return json(data);
  } catch(e) {
    return json({ error: e.message });
  }
}

// ── Notes (prof) ─────────────────────────────────────────────────────────────

async function handleListNotes(body, env) {
  const safeProfId = safeId(body.profId);
  const list = await env.EXPERIA_KV.get('notelist:' + safeProfId, 'json') || [];
  const notes = [];
  for (const nid of list) {
    const n = await env.EXPERIA_KV.get('note:' + safeProfId + ':' + nid, 'json');
    if (n) notes.push({ id: n.id, title: n.title, color: n.color || null, order: n.order || 0, updatedAt: n.updatedAt });
  }
  notes.sort((a, b) => (a.order || 0) - (b.order || 0));
  return json({ success: true, notes });
}

async function handleReadNote(body, env) {
  const { noteId } = body;
  if (!noteId) return json({ success: false, error: 'noteId requis' });
  const safeProfId = safeId(body.profId);
  const note = await env.EXPERIA_KV.get('note:' + safeProfId + ':' + noteId, 'json');
  if (!note) return json({ success: false, error: 'Note introuvable' });
  return json({ success: true, note });
}

async function handleWriteNote(body, env) {
  const { note } = body;
  if (!note) return json({ success: false, error: 'note requise' });
  const safeProfId = safeId(body.profId);
  const noteId = note.id || ('n_' + uid());
  const fullNote = { ...note, id: noteId, updatedAt: Date.now() };
  if (!fullNote.createdAt) fullNote.createdAt = Date.now();
  await env.EXPERIA_KV.put('note:' + safeProfId + ':' + noteId, JSON.stringify(fullNote));
  const listKey = 'notelist:' + safeProfId;
  let list = await env.EXPERIA_KV.get(listKey, 'json') || [];
  if (!list.includes(noteId)) list.push(noteId);
  await env.EXPERIA_KV.put(listKey, JSON.stringify(list));
  return json({ success: true, noteId });
}

async function handleDeleteNote(body, env) {
  const { noteId } = body;
  if (!noteId) return json({ success: false, error: 'noteId requis' });
  const safeProfId = safeId(body.profId);
  await env.EXPERIA_KV.delete('note:' + safeProfId + ':' + noteId);
  const listKey = 'notelist:' + safeProfId;
  let list = await env.EXPERIA_KV.get(listKey, 'json') || [];
  await env.EXPERIA_KV.put(listKey, JSON.stringify(list.filter(id => id !== noteId)));
  return json({ success: true });
}

// ── Completions activités ─────────────────────────────────────────────────────

async function handleGetCompletions(body, env) {
  const { sessionId, studentId } = body;
  if (!sessionId || !studentId) return json({ success: false, error: 'sessionId et studentId requis' });
  const data = await env.EXPERIA_KV.get('completion:' + sessionId + ':' + safeId(studentId), 'json') || {};
  return json({ success: true, completions: data });
}

async function handleSetCompletion(body, env) {
  const { sessionId, studentId, activityId, score, max } = body;
  if (!sessionId || !studentId || !activityId) return json({ success: false, error: 'paramètres requis' });
  const key = 'completion:' + sessionId + ':' + safeId(studentId);
  const data = await env.EXPERIA_KV.get(key, 'json') || {};
  data[activityId] = { done: true, score: score || 0, max: max || 0, doneAt: Date.now() };
  await env.EXPERIA_KV.put(key, JSON.stringify(data));
  return json({ success: true });
}

async function handleResetCompletion(body, env) {
  const { sessionId, studentId, activityId } = body;
  if (!sessionId || !studentId) return json({ success: false, error: 'sessionId et studentId requis' });
  const key = 'completion:' + sessionId + ':' + safeId(studentId);
  const data = await env.EXPERIA_KV.get(key, 'json') || {};
  if (activityId) {
    delete data[activityId];
  } else {
    Object.keys(data).forEach(k => delete data[k]);
  }
  await env.EXPERIA_KV.put(key, JSON.stringify(data));
  return json({ success: true });
}

async function handleListModels(body, env) {
  const key = body.profAlbertKey || env.ALBERT_KEY;
  if (!key) return json({ error: 'Clé Albert non configurée.' }, 500);
  try {
    const res = await fetch('https://albert.api.etalab.gouv.fr/v1/models', {
      headers: { Authorization: 'Bearer ' + key }
    });
    const data = await res.json();
    if (res.status >= 400) return json({ error: 'Albert erreur ' + res.status });
    return json(data);
  } catch(e) {
    return json({ error: e.message });
  }
}
