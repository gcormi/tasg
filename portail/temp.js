
        import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
        import { getAuth, onAuthStateChanged, signInAnonymously, signInWithCustomToken } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
        import { getFirestore, collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";

        // --- CONFIGURATION ---
        let db = null, auth = null, appId = 'default';
        let isCloudEnabled = false;

        try {
            if (typeof __firebase_config !== 'undefined' && __firebase_config) {
                const firebaseConfig = JSON.parse(__firebase_config);
                const app = initializeApp(firebaseConfig);
                auth = getAuth(app);
                db = getFirestore(app);
                appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
                isCloudEnabled = true;
                document.getElementById('status-text').textContent = "Cloud Activé : Synchronisation opérationnelle.";
            } else {
                document.getElementById('status-text').textContent = "Mode Local activé.";
            }
        } catch (e) {
            console.warn("Erreur config Firebase:", e);
        }

        let currentUser = null;
        let folders = [], sources = [];
        let activeFolderInModal = null; // Track which folder is open in modal

        const BASE_SOURCES = [
            { id: 'b1', name: "Ludomag", url: "https://www.ludomag.com/feed/", category: "Innovation", icon: "fa-newspaper" },
            { id: 'b2', name: "Outils TICE", url: "https://outilstice.com/feed/", category: "Outils", icon: "fa-tools" },
            { id: 'b3', name: "S'CAPE", url: "https://scape.enepe.fr/spip.php?page=backend", category: "Ludo", icon: "fa-puzzle-piece" }
        ];

        async function hashPassword(password) {
            const encoder = new TextEncoder();
            const data = encoder.encode(password);
            const hashBuffer = await crypto.subtle.digest('SHA-256', data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        }

        async function initAuth() {
            if (!isCloudEnabled) return;
            try {
                if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
                    try {
                        await signInWithCustomToken(auth, __initial_auth_token);
                    } catch (tokenError) {
                        await signInAnonymously(auth);
                    }
                } else { 
                    await signInAnonymously(auth); 
                }
            } catch (error) {
                console.warn("Avertissement Firebase :", error.code);
                
                let errorMessage = "Erreur de connexion Cloud. Mode local activé.";
                if (error.code === 'auth/configuration-not-found' || error.code === 'auth/unauthorized-domain' || (error.message && error.message.includes('configuration-not-found'))) {
                    errorMessage = "⏳ Déploiement Firebase en cours. Si vous venez d'activer le mode 'Anonyme', veuillez patienter 5 minutes. Mode local activé.";
                }

                document.getElementById('status-text').textContent = errorMessage;
                document.getElementById('local-status-msg').className = "mb-8 bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-2xl text-xs flex items-center gap-3";
                
                isCloudEnabled = false;
                loadLocalData();
                fetchAllFeeds();
            }
        }

        if (isCloudEnabled) {
            onAuthStateChanged(auth, async (user) => {
                // Chargement AUTOMATIQUE de la session "6463"
                const effectiveUid = "f2659e26b5b7efa7d8099b64d60a7f68c7797c735cc2f2807923129f397a21a1";
                currentUser = { uid: effectiveUid };
                listenToData(effectiveUid);
                if (user) {
                    document.getElementById('sync-indicator').innerHTML = '<i class="fas fa-cloud"></i> Synchro Active';
                }
            });
        } else {
            loadLocalData();
            fetchAllFeeds();
        }

        // --- UI FUNCTIONS ---
        // (Moved to non-module script above for immediate availability)


        // --- DATA MANAGEMENT ---
        let unsubscribeFolders = null;
        let unsubscribeSources = null;

        function listenToData(uid) {
            if (!db) return;
            if(unsubscribeFolders) unsubscribeFolders();
            if(unsubscribeSources) unsubscribeSources();
            
            const foldersRef = collection(db, 'artifacts', appId, 'users', uid, 'folders');
            const sourcesRef = collection(db, 'artifacts', appId, 'users', uid, 'sources');
            
            unsubscribeFolders = onSnapshot(foldersRef, (snap) => {
                folders = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                updateFolderUI();
                renderFolders();
                if (activeFolderInModal) window.openLinksModal(activeFolderInModal);
            }, (error) => {
                console.warn("Erreur Firestore (dossiers) :", error);
            });
            
            unsubscribeSources = onSnapshot(sourcesRef, (snap) => {
                sources = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                renderFolders();
                if (activeFolderInModal) window.openLinksModal(activeFolderInModal);
                fetchAllFeeds(); // On lance le RSS en arrière-plan
            }, (error) => {
                console.warn("Erreur Firestore (sources) :", error);
            });
        }

        function loadLocalData() {
            folders = JSON.parse(localStorage.getItem('local_folders') || '[]');
            sources = JSON.parse(localStorage.getItem('local_sources') || '[]');
            updateFolderUI();
            renderFolders();
        }

        const forceDeletedFolders = new Set();
        const forceDeletedSources = new Set();

        function updateFolderUI() {
            const select = document.getElementById('folder-select');
            if (!select) return;
            select.innerHTML = '<option value="none">Favoris non classés</option>';
            [...folders]
                .filter(f => !forceDeletedFolders.has(f.id))
                .sort((a,b) => (a.name || "").localeCompare(b.name || ""))
                .forEach(f => {
                    select.innerHTML += `<option value="${f.id}">${f.name}</option>`;
                });
            renderFolders();
        }


        async function fetchRSS(source) {
            const api_url = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(source.rss_url || source.url)}`;
            try {
                const response = await fetch(api_url);
                const data = await response.json();
                if (data.status === 'ok' && data.items.length > 0) {
                    return { items: data.items.slice(0, 2).map(item => ({...item, source})), hasFeed: true };
                }
            } catch (e) {}
            return { items: [], hasFeed: false, source };
        }

        async function fetchAllFeeds() {
            const results = await Promise.all([...BASE_SOURCES, ...sources].map(s => fetchRSS(s)));
            const rssContainer = document.getElementById('rss-container');
            const allItems = results.flatMap(r => r.items).sort((a,b) => new Date(b.pubDate) - new Date(a.pubDate));
            rssContainer.innerHTML = '';
            
            if (allItems.length === 0) rssContainer.innerHTML = '<p class="col-span-full text-center opacity-40 py-10">Aucune actualité. Ajoutez un blog pour voir ses articles.</p>';
            
            allItems.forEach(item => {
                rssContainer.innerHTML += `
                    <div class="card-rss rounded-3xl p-6 flex flex-col h-full group">
                        <div class="flex justify-between items-start mb-3">
                            <span class="text-[10px] font-bold text-indigo-500 uppercase">${item.source.name}</span>
                            <span class="text-[9px] text-slate-400">${new Date(item.pubDate).toLocaleDateString()}</span>
                        </div>
                        <h3 class="text-xs font-bold mb-2 line-clamp-2">${item.title}</h3>
                        <a href="${item.link}" target="_blank" class="mt-auto text-[10px] font-bold text-indigo-600">Lire <i class="fas fa-arrow-right ml-1"></i></a>
                    </div>`;
            });
        }

        function renderFolders() {
            const grid = document.getElementById('folders-grid');
            if (!grid) return;
            grid.innerHTML = '';
            
            const allDisplays = [...folders]
                .filter(f => !forceDeletedFolders.has(f.id))
                .sort((a,b) => (a.name || "").localeCompare(b.name || ""));
            
            // On affiche TOUJOURS "Favoris non classés"
            allDisplays.push({ id: 'none', name: 'Favoris non classés', color: 'slate' });

            allDisplays.forEach(f => {
                const folderLinks = sources.filter(s => !forceDeletedSources.has(s.id) && (f.id === 'none' ? (!s.folderId || s.folderId === 'none' || forceDeletedFolders.has(s.folderId)) : s.folderId === f.id));
                const fColor = f.color || 'indigo';
                
                const card = document.createElement('div');
                card.id = `folder-card-${f.id}`;
                card.className = `group relative bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700 hover:border-${fColor}-400 hover:shadow-xl transition-all cursor-pointer animate-fade-up`;
                
                card.innerHTML = `
                    <div class="flex items-center gap-4 mb-4">
                        <div class="w-12 h-12 rounded-2xl bg-${fColor}-100 dark:bg-${fColor}-900/30 text-${fColor}-600 flex items-center justify-center text-xl">
                            <i class="fas ${f.id === 'none' ? 'fa-inbox' : 'fa-folder'}"></i>
                        </div>
                        <div class="overflow-hidden">
                            <h3 class="font-bold text-slate-900 dark:text-white truncate group-hover:text-${fColor}-600 transition-colors">${f.name}</h3>
                            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">${folderLinks.length} élément(s)</p>
                        </div>
                    </div>
                    
                    <div class="flex justify-between items-center mt-6 pt-4 border-t border-slate-50 dark:border-slate-700/50">
                        <button onclick="event.stopPropagation(); window.openLinksModal('${f.id}')" class="text-[10px] font-bold text-indigo-500 hover:underline uppercase tracking-wide cursor-pointer">Ouvrir le dossier</button>
                        ${f.id !== 'none' ? `
                        <div class="flex gap-2">
                            <button onclick="event.stopPropagation(); window.openFolderModal('${f.id}')" class="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-300 hover:text-indigo-600 transition-all cursor-pointer" title="Modifier">
                                <i class="fas fa-edit text-[10px]"></i>
                            </button>
                            <button onclick="event.stopPropagation(); window.deleteFolder('${f.id}')" class="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-300 hover:text-rose-600 transition-all cursor-pointer" title="Supprimer">
                                <i class="fas fa-trash-alt text-[10px]"></i>
                            </button>
                        </div>` : ''}
                    </div>
                `;
                card.onclick = () => window.openLinksModal(f.id);
                grid.appendChild(card);
            });
        }


        window.openLinksModal = (folderId) => {
            const modal = document.getElementById('links-modal');
            activeFolderInModal = folderId;
            const folder = folderId === 'none' ? { name: 'Favoris non classés', color: 'slate', id: 'none' } : folders.find(f => f.id === folderId);
            if (!folder) {
                activeFolderInModal = null;
                return;
            }

            const folderLinks = sources.filter(s => !forceDeletedSources.has(s.id) && (folderId === 'none' ? (!s.folderId || s.folderId === 'none' || forceDeletedFolders.has(s.folderId)) : s.folderId === folderId));
            
            const title = document.getElementById('links-modal-title');
            const count = document.getElementById('links-modal-count');
            const icon = document.getElementById('links-modal-icon');
            const grid = document.getElementById('links-modal-grid');

            title.textContent = folder.name;
            count.textContent = `${folderLinks.length} SITE(S) ENREGISTRÉ(S)`;
            icon.className = `w-12 h-12 rounded-xl bg-${folder.color || 'indigo'}-100 text-${folder.color || 'indigo'}-600 flex items-center justify-center text-xl`;
            
            grid.innerHTML = '';
            if (folderLinks.length === 0) {
                grid.innerHTML = '<p class="col-span-full text-center text-slate-400 py-10">Ce dossier est vide.</p>';
            }

            folderLinks.forEach(l => {
                const item = document.createElement('div');
                item.id = `link-item-${l.id}`;
                item.className = "bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 flex items-center justify-between group hover:border-indigo-400 hover:bg-white dark:hover:bg-slate-800 transition-all";
                item.innerHTML = `
                    <div class="overflow-hidden pr-4 flex-grow">
                        <h4 class="text-base font-bold text-slate-800 dark:text-white truncate mb-1">${l.name}</h4>
                        <div class="flex items-center gap-3">
                            <a href="${l.url}" target="_blank" class="text-[10px] font-bold text-indigo-500 hover:underline uppercase tracking-tight">Consulter le site</a>
                            <span class="text-[9px] text-slate-400 italic truncate">${new URL(l.url).hostname}</span>
                        </div>
                    </div>
                    <div class="flex gap-2">
                        <button onclick="window.moveLink('${l.id}')" class="w-8 h-8 rounded-lg bg-white dark:bg-slate-700 text-slate-400 hover:text-indigo-600 shadow-sm flex items-center justify-center transition-all cursor-pointer" title="Changer de dossier"><i class="fas fa-exchange-alt text-xs"></i></button>
                        <button onclick="window.deleteLink('${l.id}')" class="w-8 h-8 rounded-lg bg-white dark:bg-slate-700 text-slate-300 hover:text-rose-600 shadow-sm flex items-center justify-center transition-all cursor-pointer" title="Supprimer de la corbeille"><i class="fas fa-trash-alt text-xs"></i></button>
                    </div>
                `;
                grid.appendChild(item);
            });


            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        };

        window.closeLinksModal = () => {
            activeFolderInModal = null;
            const modal = document.getElementById('links-modal');
            if (modal) modal.style.display = 'none';
            document.body.style.overflow = '';
        };

        // --- DRAG AND DROP ---
        window.dragStart = (e, linkId) => {
            e.dataTransfer.setData("linkId", linkId);
            e.target.style.opacity = '0.5';
        };

        document.addEventListener('dragend', (e) => {
            if (e.target && e.target.style) e.target.style.opacity = '1';
            document.querySelectorAll('.folder-section').forEach(el => {
                el.style.border = '1px solid rgba(255, 255, 255, 0.2)';
                el.style.transform = 'scale(1)';
            });
        });

        window.allowDrop = (e) => {
            e.preventDefault();
            const folder = e.currentTarget;
            folder.style.border = '2px dashed var(--primary)';
            folder.style.transform = 'scale(1.02)';
        };

        window.dragLeave = (e) => {
            const folder = e.currentTarget;
            folder.style.border = '1px solid rgba(255, 255, 255, 0.2)';
            folder.style.transform = 'scale(1)';
        };

        window.dropLink = async (e, folderIdString) => {
            e.preventDefault();
            const linkId = e.dataTransfer.getData("linkId");
            if (!linkId) return;
            const targetFolderId = folderIdString === "null" ? null : folderIdString;
            
            const source = sources.find(s => s.id === linkId);
            if (!source || source.folderId === targetFolderId) return;

            if (isCloudEnabled && currentUser) {
                await updateDoc(doc(db, 'artifacts', appId, 'users', currentUser.uid, 'sources', linkId), { folderId: targetFolderId });
            } else {
                const sIdx = sources.findIndex(s => s.id === linkId);
                if (sIdx > -1) {
                    sources[sIdx].folderId = targetFolderId;
                    localStorage.setItem('local_sources', JSON.stringify(sources));
                    renderFolders();
                }
            }
            showToast("Favori déplacé avec succès !");
        };

        // --- MODAL DOSSIER ---
        let activeColor = 'indigo';
        
        document.querySelectorAll('#folder-color-picker button').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('#folder-color-picker button').forEach(b => {
                    b.className = `w-8 h-8 rounded-full bg-${b.dataset.color}-500 opacity-30 hover:opacity-100 transition-all`;
                });
                activeColor = btn.dataset.color;
                btn.className = `w-8 h-8 rounded-full bg-${activeColor}-500 ring-2 ring-offset-2 ring-${activeColor}-500 ring-offset-white dark:ring-offset-slate-800 opacity-100`;
            });
        });

        window.openFolderModal = (id = null) => {
            const modal = document.getElementById('folder-modal');
            const nameInput = document.getElementById('folder-edit-name');
            const idInput = document.getElementById('folder-edit-id');
            const title = document.getElementById('folder-modal-title');
            
            modal.classList.remove('hidden');
            idInput.value = id || '';
            
            if (id) {
                title.textContent = "Modifier le dossier";
                const folder = folders.find(f => f.id === id);
                nameInput.value = folder ? folder.name : '';
                activeColor = folder && folder.color ? folder.color : 'indigo';
            } else {
                title.textContent = "Nouveau dossier";
                nameInput.value = '';
                activeColor = 'indigo';
            }
            const colorBtn = document.querySelector(`#folder-color-picker button[data-color="${activeColor}"]`);
            if (colorBtn) colorBtn.click();
            nameInput.focus();
        };

        window.closeFolderModal = () => {
            document.getElementById('folder-modal').classList.add('hidden');
        };

        window.saveFolder = async () => {
            const id = document.getElementById('folder-edit-id').value;
            const name = document.getElementById('folder-edit-name').value.trim();
            if (!name) return showToast("Le nom du dossier est requis", true);

            if (id) {
                if (isCloudEnabled && currentUser) {
                    await updateDoc(doc(db, 'artifacts', appId, 'users', currentUser.uid, 'folders', id), { name, color: activeColor });
                } else {
                    const idx = folders.findIndex(f => f.id === id);
                    if (idx > -1) {
                        folders[idx].name = name;
                        folders[idx].color = activeColor;
                    }
                    localStorage.setItem('local_folders', JSON.stringify(folders));
                    updateFolderUI();
                }
                showToast("Dossier mis à jour");
            } else {
                const newFolder = { id: isCloudEnabled ? null : Date.now().toString(), name, color: activeColor, createdAt: new Date().toISOString() };
                if (isCloudEnabled && currentUser) {
                    await addDoc(collection(db, 'artifacts', appId, 'users', currentUser.uid, 'folders'), newFolder);
                } else {
                    folders.push(newFolder);
                    localStorage.setItem('local_folders', JSON.stringify(folders));
                    updateFolderUI();
                }
                showToast("Dossier créé avec succès");
            }
            closeFolderModal();
        };

        window.deleteFolder = async (id) => {
            if(!id || id === 'none') return;
            if(!confirm("Voulez-vous supprimer ce dossier ? Les liens qu'il contient retourneront dans 'Non classés'.")) return;
            
            forceDeletedFolders.add(id); // Force hide instantly
            
            const cardEl = document.getElementById(`folder-card-${id}`);
            if (cardEl) cardEl.style.display = 'none';

            try {
                const sourcesInFolder = sources.filter(s => s.folderId === id);
                
                if (isCloudEnabled && currentUser) {
                    deleteDoc(doc(db, 'artifacts', appId, 'users', currentUser.uid, 'folders', id)).catch(e => console.warn(e));
                    for (const s of sourcesInFolder) {
                        updateDoc(doc(db, 'artifacts', appId, 'users', currentUser.uid, 'sources', s.id), { folderId: null }).catch(e => console.warn(e));
                    }
                }
                
                // Exécution locale forcée
                folders = folders.filter(f => f.id !== id);
                localStorage.setItem('local_folders', JSON.stringify(folders));
                sources.forEach(s => { if(s.folderId === id) s.folderId = null; });
                localStorage.setItem('local_sources', JSON.stringify(sources));
                
                showToast("Dossier supprimé");
                updateFolderUI();
                renderFolders();
                if (activeFolderInModal === id) window.closeLinksModal();
            } catch(err) {
                showToast("Erreur locale lors de la suppression", true);
            }
        };

        // ... code import ... (gardé intact via les lignes remplacées)
        document.getElementById('import-input').addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            showToast("Analyse du fichier, patientez...");
            const reader = new FileReader();

            reader.onload = async (event) => {
                const htmlStr = event.target.result;
                const parser = new DOMParser();
                const docParsed = parser.parseFromString(htmlStr, 'text/html');
                const links = Array.from(docParsed.querySelectorAll('a'));
                
                if (links.length === 0) {
                    showToast("Aucun favori trouvé.", true);
                    return;
                }

                const maxLinks = Math.min(links.length, 20);
                let count = 0;

                const newFolder = { id: isCloudEnabled ? null : Date.now().toString(), name: "Import Chrome " + new Date().toLocaleDateString(), color: "emerald", createdAt: new Date().toISOString() };
                let importedFolderId = null;

                if (isCloudEnabled && currentUser) {
                    const docRef = await addDoc(collection(db, 'artifacts', appId, 'users', currentUser.uid, 'folders'), newFolder);
                    importedFolderId = docRef.id;
                } else {
                    folders.push(newFolder);
                    localStorage.setItem('local_folders', JSON.stringify(folders));
                    importedFolderId = newFolder.id;
                    updateFolderUI();
                }

                showToast(`Importation de ${maxLinks} favoris en cours...`);

                for(let i=0; i<maxLinks; i++) {
                    const a = links[i];
                    const url = a.href;
                    if(!url || !url.startsWith('http')) continue;
                    
                    if (sources.some(s => s.url === url || s.rss_url === url)) continue;
                    
                    const name = (a.textContent || new URL(url).hostname).substring(0, 50);
                    const newSource = {
                        id: isCloudEnabled ? null : Date.now().toString() + "_" + i,
                        name: name, 
                        url: url, 
                        rss_url: url.includes('feed') ? url : (url.endsWith('/') ? url + 'feed' : url + '/feed'),
                        folderId: importedFolderId, 
                        addedAt: new Date().toISOString()
                    };

                    if (isCloudEnabled && currentUser) {
                        try { await addDoc(collection(db, 'artifacts', appId, 'users', currentUser.uid, 'sources'), newSource); } catch(err) {}
                    } else {
                        sources.push(newSource);
                    }
                    count++;
                }

                if (!isCloudEnabled) {
                    localStorage.setItem('local_sources', JSON.stringify(sources));
                    fetchAllFeeds();
                }
                
                showToast(`✅ ${count} favoris importés avec succès !`);
                e.target.value = ''; 
            };
            reader.readAsText(file);
        });

        document.getElementById('btn-add-source').addEventListener('click', async () => {
            const urlInput = document.getElementById('new-url');
            const folderId = document.getElementById('folder-select').value;
            let url = urlInput.value.trim();
            if (!url) return;

            if (!url.startsWith('http')) url = 'https://' + url;

            if (sources.some(s => s.url === url)) {
                showToast("❌ Ce lien est déjà enregistré !", true);
                return;
            }

            try {
                showToast("Vérification du site...");
                const domain = new URL(url).hostname.replace('www.', '');
                
                // Détection intelligente du flux RSS
                let rssUrlDetected = null;
                const possiblePaths = [url, url + '/feed', url + '/rss', url + '/index.xml', url + '/feed/'];
                
                for(let path of possiblePaths) {
                    try {
                        const check = await fetchRSS({ url: path });
                        if (check.hasFeed) {
                            rssUrlDetected = path;
                            break;
                        }
                    } catch(e) {}
                }

                const newSource = {
                    id: isCloudEnabled ? null : Date.now().toString(),
                    name: domain, 
                    url, 
                    rss_url: rssUrlDetected, 
                    folderId: folderId === 'none' ? null : folderId, 
                    addedAt: new Date().toISOString()
                };

                if (isCloudEnabled && currentUser) {
                    await addDoc(collection(db, 'artifacts', appId, 'users', currentUser.uid, 'sources'), newSource);
                } else {
                    sources.push(newSource);
                    localStorage.setItem('local_sources', JSON.stringify(sources));
                    fetchAllFeeds();
                }
                
                urlInput.value = "";
                showToast(rssUrlDetected ? "Site ajouté avec flux RSS !" : "Site ajouté aux favoris.");
            } catch(e) {
                showToast("URL invalide.", true);
            }
        });

        window.moveLink = async (id) => {
            const folderList = folders.map((f, i) => `${i + 1}. ${f.name}`).join('\n');
            const choice = prompt(`Déplacer vers :\n0. Non classés\n${folderList}\n\nEntrez le numéro :`);
            if (choice === null) return;
            const index = parseInt(choice);
            let newFolderId = (index > 0 && index <= folders.length) ? folders[index - 1].id : null;

            if (isCloudEnabled && currentUser) {
                updateDoc(doc(db, 'artifacts', appId, 'users', currentUser.uid, 'sources', id), { folderId: newFolderId }).catch(e => console.warn(e));
            }
            
            const sIdx = sources.findIndex(s => s.id === id);
            if (sIdx > -1) {
                sources[sIdx].folderId = newFolderId;
                localStorage.setItem('local_sources', JSON.stringify(sources));
            }
            
            renderFolders();
            if (activeFolderInModal) window.openLinksModal(activeFolderInModal);
        };

        window.deleteLink = async (id) => {
            if(!confirm("Supprimer ce favori ?")) return;
            
            forceDeletedSources.add(id); // Force hide instantly
            
            const linkEl = document.getElementById(`link-item-${id}`);
            if (linkEl) linkEl.style.display = 'none';

            try {
                if (isCloudEnabled && currentUser) {
                    deleteDoc(doc(db, 'artifacts', appId, 'users', currentUser.uid, 'sources', id)).catch(e => console.warn(e));
                }
                
                sources = sources.filter(s => s.id !== id);
                localStorage.setItem('local_sources', JSON.stringify(sources));
                
                showToast("Favori supprimé.");
                renderFolders(); 
                fetchAllFeeds();
                if (activeFolderInModal) window.openLinksModal(activeFolderInModal);
            } catch(e) {
                showToast("Erreur locale lors de la suppression.", true);
            }
        };


        document.getElementById('btn-new-folder').addEventListener('click', () => {
            openFolderModal();
        });

        function showToast(m, err = false) {
            const t = document.createElement('div');
            t.className = `fixed top-20 right-10 ${err ? 'bg-red-500' : 'bg-indigo-600'} text-white px-6 py-3 rounded-2xl shadow-xl z-[2000] text-xs font-bold animate-bounce`;
            t.textContent = m;
            document.body.appendChild(t);
            setTimeout(() => t.remove(), 3000);
        }

        // --- ATTACH LISTENERS IMMEDIATELY ---
        function setupEventListeners() {
            document.getElementById('btn-session-trigger')?.addEventListener('click', () => window.toggleSessionModal());
            document.getElementById('btn-save-session')?.addEventListener('click', () => window.saveAndSync());
            document.getElementById('btn-acc-toggle')?.addEventListener('click', () => document.documentElement.classList.toggle('dark-mode'));
            document.getElementById('btn-refresh')?.addEventListener('click', () => fetchAllFeeds());
            document.getElementById('btn-save-folder')?.addEventListener('click', () => window.saveFolder());
            document.getElementById('btn-new-folder')?.addEventListener('click', () => window.openFolderModal());
            document.getElementById('btn-close-links')?.addEventListener('click', () => window.closeLinksModal());
        }

        // --- INIT WRAPPER ---
        (async () => {
            setupEventListeners(); // UI works immediately
            try {
                await initAuth();
            } catch(e) { console.warn("Init Auth Failed, staying local"); }
        })();

        window.saveAndSync = async () => {
            const pwdInput = document.getElementById('master-password');
            const pwd = pwdInput ? pwdInput.value.trim() : "";
            if (!pwd) return alert("Veuillez entrer votre code secret");
            if (pwd.length < 4) return alert("Le code doit faire au moins 4 caractères");
            
            localStorage.setItem('veille_master_recovery', pwd);
            showToast("Session configurée, rechargement...");
            setTimeout(() => window.location.reload(), 800);
        };

        window.resetToDefaultSession = () => {
            if (confirm("Revenir à la session par défaut (Gilles) ?")) {
                localStorage.removeItem('veille_master_recovery');
                window.location.reload();
            }
        };

    
