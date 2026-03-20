/**
 * Studio Pro - Logique de Gestion du Flipbook
 * Commentaires en français pour une maintenance aisée.
 */

// Configuration globale
let instanceFlipbook = null;
let sourceActuelle = "";
let mode2DForce = false;
let chargementTimeout = null;

/**
 * Initialise le moteur de flipbook avec le fichier fourni.
 * @param {string} source - URL ou Blob du PDF.
 * @param {string} titre - Titre du document.
 */
function initialiserFlipbook(source, titre = "Document") {
    logDiagnostic("Initialisation du moteur...");
    
    // Annuler tout timeout précédent
    if(chargementTimeout) clearTimeout(chargementTimeout);

    // Nettoyage de l'interface
    $('#empty-view').addClass('hidden');
    $('#fb-container').removeClass('hidden').empty();
    $('#thumb-strip').removeClass('hidden');
    document.title = "Studio Pro - " + titre;

    // Vérification du mode
    const isEleve = new URLSearchParams(window.location.search).get('mode') === 'eleve';

    // Options Pro optimisées pour le local et les élèves
    const options = {
        height: '100%',
        duration: 800,
        backgroundColor: 'transparent',
        webgl: !mode2DForce,
        soundEnable: false,
        enableDownload: !isEleve, // True pour Prof, False pour les Élèves
        text: { loading: "Analyse du PDF... " + (!mode2DForce ? "WEBGL 3D" : "Mode 2D"), close: "Quitter" },
        onReady: function(fb) {
            logDiagnostic("Moteur prêt !", "success");
            if(chargementTimeout) clearTimeout(chargementTimeout);
            
            // Si l'application détecte que c'est un élève, on bloque en plein écran (cache header & sidebar)
            if (isEleve) {
                // Le mode zen cache la latérale et les vignettes.
                $('body').addClass('zen'); 
                $('header').addClass('hidden'); // Enlève la barre du haut
            }
        }
    };

    // Création de l'élément wrapper
    const wrapper = $('<div id="pro-instance" style="width:100%; height:100%;"></div>');
    $('#fb-container').append(wrapper);

    // Timeout de secours : si après 5s on est toujours bloqué, on tente le mode 2D
    if (!mode2DForce) {
        chargementTimeout = setTimeout(() => {
            logDiagnostic("Détection d'un blocage 3D... Passage en mode 2D.", "warn");
            forcerMode2D();
        }, 6000);
    }

    // Lancement de DearFlip
    setTimeout(() => {
        try {
            wrapper.flipBook(source, options);
            logDiagnostic("Moteur lancé. Tentative de rendu...", "info");
            sourceActuelle = source;
        } catch (e) {
            logDiagnostic("ERREUR critique: " + e, "error");
        }
    }, 100);
}

// Gestion des notes
let notes = JSON.parse(localStorage.getItem('studio_notes_pro') || '[]');

function ajouterNote() {
    const val = $('#note-input').val();
    if(!val) return;
    notes.push({ texte: val, date: new Date().toLocaleTimeString() });
    $('#note-input').val('');
    sauvegarderNotes();
}

function sauvegarderNotes() {
    localStorage.setItem('studio_notes_pro', JSON.stringify(notes));
    afficherNotes();
}

function afficherNotes() {
    const liste = $('#liste-notes').empty();
    notes.forEach((n, i) => {
        liste.append(`
            <div class="card" style="padding:10px; font-size:0.8rem; position:relative">
                <div>${n.texte}</div>
                <div style="font-size:0.6rem; color:var(--text-dim); margin-top:5px">${n.date}</div>
                <button onclick="supprimerNote(${i})" style="position:absolute; top:5px; right:5px; background:none; border:none; color:#ff4757; cursor:pointer">×</button>
            </div>
        `);
    });
}

function supprimerNote(i) {
    notes.splice(i, 1);
    sauvegarderNotes();
}

/**
 * Enregistre un message dans la console de diagnostic visuelle.
 */
function logDiagnostic(msg, type = "info") {
    const box = $('#diag-console');
    if(!box.length) return;
    
    let couleur = "#4ade80"; // Vert par défaut
    if(type === "error") couleur = "#ff4757";
    if(type === "warn") couleur = "#ffa502";

    box.append(`<div style="color: ${couleur}">> ${msg}</div>`);
    box.scrollTop(box[0].scrollHeight);
}

// Gestion des onglets
function changerOnglet(id) {
    $('.tab-content').addClass('hidden');
    $(`#tab-${id}`).removeClass('hidden');
    $('.tab-link').removeClass('active');
    $(`.tab-link[onclick*='${id}']`).addClass('active');
}

/**
 * Alterne entre le mode 2D et 3D en cas de problème graphique.
 */
function forcerMode2D() {
    mode2DForce = true;
    logDiagnostic("Mode 2D activé par sécurité.", "warn");
    if(sourceActuelle) initialiserFlipbook(sourceActuelle);
}

// Outil Importer depuis URL Distante
function chargerDepuisURL() {
    const url = $('#url-input').val().trim();
    if(url) {
        logDiagnostic("Vérification du lien distant : " + url);
        // Ajout du paramètre fictif pour forcer le même comportement stable
        const baseUrl = window.location.href.split('?')[0];
        window.location.href = `${baseUrl}?pdf=${encodeURIComponent(url)}`;
    }
}

// Outil Générateur de Lien (Studio)
function creerLienEleve() {
    let nom = $('#eleve-pdf-name').val().trim();
    if(!nom) nom = $('#eleve-pdf-name').attr('placeholder') || 'cours.pdf';
    
    const baseUrl = window.location.href.split('?')[0];
    const urlEleve = `${baseUrl}?mode=eleve&pdf=${encodeURIComponent(nom)}`;
    
    $('#eleve-link-result').html(`<a href="${urlEleve}" target="_blank" style="color:var(--accent-blue)">Lien généré: ${urlEleve}</a>`);
}

// Outil Générateur Multi-Cours (Rafale)
function genererLiensRafale() {
    const lignes = $('#multi-pdf-list').val().split('\n');
    const zoneRes = $('#rafale-results').empty();
    const baseUrl = window.location.href.split('?')[0];

    lignes.forEach(ligne => {
        let fichier = ligne.trim();
        if(fichier) {
            if(!fichier.toLowerCase().endsWith('.pdf')) fichier += '.pdf';
            const urlEleve = `${baseUrl}?mode=eleve&pdf=${encodeURIComponent(fichier)}`;
            zoneRes.append(`
                <div style="background: var(--bg-card); padding: 8px; border: 1px solid var(--border); border-radius: 4px;">
                    <div style="font-weight: 600; color: var(--text-primary); margin-bottom: 4px;">📘 ${fichier}</div>
                    <a href="${urlEleve}" target="_blank" style="color: var(--accent-blue); word-break: break-all; font-size: 0.65rem;">${urlEleve}</a>
                </div>
            `);
        }
    });

    if(zoneRes.children().length === 0) {
        zoneRes.html("<div style='color: #ff4757'>Veuillez entrer au moins un nom de fichier.</div>");
    } else {
        logDiagnostic(`${zoneRes.children().length} liens générés.`);
    }
}

// Fonction de bascule Clair/Sombre
function toggleTheme() {
    $('body').toggleClass('light-theme');
    const isLight = $('body').hasClass('light-theme');
    $('#theme-toggle').text(isLight ? '🌙' : '💡');
    localStorage.setItem('studio_theme', isLight ? 'light' : 'dark');
}

// Initialisation au chargement
$(document).ready(() => {
    // Restauration du thème
    if(localStorage.getItem('studio_theme') === 'light') {
         $('body').addClass('light-theme');
         $('#theme-toggle').text('🌙');
    }

    afficherNotes();
    
    // Détection auto Mode et PDF
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode');
    const pdfUrl = params.get('pdf');

    if (mode === 'eleve') {
        $('body').addClass('zen');
        $('header').addClass('hidden');
        logDiagnostic("Lancement du Mode Visualisation pour Élève (Sécurisé).");
    } else {
        logDiagnostic("Studio Pro prêt (Mode Professeur / Conception).");
    }

    // Charger le PDF pré-inscrit (Utile sur serveur web/forge)
    if (pdfUrl) {
        logDiagnostic("Téléchargement du cours distant : " + pdfUrl);
        
        // On force le téléchargement du fichier par le navigateur lui-même (Fetch)
        // plutôt que de laisser DearFlip échouer avec son erreur interne "Cannot access file"
        fetch(pdfUrl)
            .then(res => {
                if(!res.ok) throw new Error("Fichier introuvable sur le serveur");
                return res.arrayBuffer();
            })
            .then(buffer => {
                const octets = new Uint8Array(buffer);
                const blob = new Blob([octets], { type: 'application/pdf' });
                const blobUrl = URL.createObjectURL(blob);
                
                const modeCrt = new URLSearchParams(window.location.search).get('mode') === 'eleve';
                logDiagnostic("Document téléchargé. Initialisation du lecteur " + (modeCrt ? "Élève..." : "Studio..."), "success");
                
                // On donne le BLOB à DearFlip
                initialiserFlipbook(blobUrl, pdfUrl);
                
                // Et on génère les miniatures
                genererVignettes(octets);
            })
            .catch(e => {
                logDiagnostic("Erreur critique de récupération : " + e.message, "error");
                // Fallback direct (sans garantie, mais au cas où)
                initialiserFlipbook(pdfUrl, pdfUrl);
            });
    }
});
