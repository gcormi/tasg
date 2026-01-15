// APPLICATION PRINCIPALE - Générateur Master Technologie
// Combine les fonctionnalités avancées de techno.html avec la base de données riche

document.addEventListener('DOMContentLoaded', () => {
    // Gestion interface design panel
    const radios = document.getElementsByName('outputFormat');
    const designPanel = document.getElementById('designPanel');
    radios.forEach(r => r.addEventListener('change', () => {
        const val = document.querySelector('input[name="outputFormat"]:checked').value;
        designPanel.style.display = (val === 'html' || val === 'pdf_ebook') ? 'block' : 'none';
    }));

    const gradeSelect = document.getElementById('gradeSelect');
    const sequenceSelect = document.getElementById('sequenceSelect');
    const studyObjectInput = document.getElementById('studyObjectInput');
    const addObjectButton = document.getElementById('addObjectButton');
    const selectedObjectsContainer = document.getElementById('selectedObjectsContainer');
    const suggestionContainer = document.getElementById('suggestionContainer');

    let selectedObjects = [];
    const MAX_OBJECTS = 6;

    // Population du sélecteur de séquences
    gradeSelect.addEventListener('change', (e) => {
        const val = e.target.value;
        sequenceSelect.innerHTML = '<option value="">-- Sélectionner --</option>';
        selectedObjects = [];
        renderSelectedObjects();
        suggestionContainer.innerHTML = '';

        if (val && modulesData[val]) {
            sequenceSelect.disabled = false;
            const groups = { [T1]: document.createElement('optgroup'), [T2]: document.createElement('optgroup'), [T3]: document.createElement('optgroup') };
            Object.keys(groups).forEach(k => groups[k].label = k);

            Object.keys(modulesData[val]).forEach(id => {
                const mod = modulesData[val][id];
                const opt = document.createElement('option');
                opt.value = id;
                opt.textContent = `S${id.toString().padStart(2, '0')} - ${mod.title}`;
                if (groups[mod.mainTheme]) groups[mod.mainTheme].appendChild(opt);
            });
            Object.values(groups).forEach(g => { if (g.children.length > 0) sequenceSelect.appendChild(g); });
            updateSuggestions();
        } else {
            sequenceSelect.disabled = true;
        }
    });

    sequenceSelect.addEventListener('change', updateSuggestions);

    // Gestion objets d'étude
    function renderSelectedObjects() {
        selectedObjectsContainer.innerHTML = '';
        selectedObjects.forEach((obj, idx) => {
            const item = document.createElement('span');
            item.className = 'selected-item';
            item.innerHTML = `${obj} <button class="remove-item-btn" onclick="removeObj(${idx})">&times;</button>`;
            selectedObjectsContainer.appendChild(item);
        });
    }

    function addObject(name) {
        const clean = name.trim();
        if (clean && selectedObjects.length < MAX_OBJECTS && !selectedObjects.includes(clean)) {
            selectedObjects.push(clean);
            renderSelectedObjects();
            studyObjectInput.value = '';
        }
    }

    window.removeObj = (idx) => { selectedObjects.splice(idx, 1); renderSelectedObjects(); };

    addObjectButton.addEventListener('click', () => addObject(studyObjectInput.value));
    studyObjectInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); addObject(studyObjectInput.value); } });

    function updateSuggestions() {
        suggestionContainer.innerHTML = '';
        const suggestions = [...suggestionDatabase['général']].sort(() => 0.5 - Math.random()).slice(0, 8);
        suggestions.forEach(s => {
            const el = document.createElement('span');
            el.className = 'suggestion-item';
            el.textContent = s;
            el.onclick = () => addObject(s);
            suggestionContainer.appendChild(el);
        });
    }

    // Génération du prompt
    document.getElementById('generateButton').onclick = () => {
        const grade = gradeSelect.value;
        const seqId = sequenceSelect.value;
        if (!grade || !seqId) return alert("Sélectionnez niveau et séquence.");

        const mod = modulesData[grade][seqId];
        const format = document.querySelector('input[name="outputFormat"]:checked').value;
        const includePix = document.getElementById('pixCheckbox').checked;
        const objects = selectedObjects.join(', ');
        const plan = document.getElementById('planInput').value.trim();
        const videos = document.getElementById('videoLinks').value.trim();
        const websites = document.getElementById('websiteLinks').value.trim();
        const text = document.getElementById('rawText').value.trim();
        const col1 = document.getElementById('color1').value;
        const col2 = document.getElementById('color2').value;
        const col3 = document.getElementById('color3').value;
        const mimic = document.getElementById('mimicImage').checked;
        const imgCount = document.getElementById('imageCount').value;

        let prompt = `**RÔLE & MISSION**\nTu es un concepteur pédagogique expert, auteur pour un éditeur de manuels scolaires. Professeur agrégé de Technologie, tu maîtrises les programmes Cycle 4.\n\nMission : Rédiger un document de cours complet pour ${grade}. Pas de résumé, qualité manuel scolaire.\n\n`;

        if (objects || plan || videos || websites || text) {
            prompt += `**INSTRUCTIONS IMPÉRATIVES**\n`;
            if (objects) prompt += `- Objets centraux : ${objects}\n`;
            if (plan) prompt += `- Plan imposé :\n${plan}\n`;
            if (videos || websites || text) {
                prompt += `- Ressources :\n`;
                if (videos) prompt += `  Vidéos: ${videos}\n`;
                if (websites) prompt += `  Web: ${websites}\n`;
                if (text) prompt += `  Texte: ${text}\n`;
            }
            prompt += '\n';
        }

        prompt += `**CAHIER DES CHARGES PÉDAGOGIQUE**\n- Thème : ${mod.mainTheme}\n- Titre : ${mod.title}\n- Accroche : "${mod.hook}"\n- **Compétences disciplinaires visées** : ${mod.skills}\n- **Savoirs & Connaissances à acquérir** : ${mod.knowledge}\n- **Compétences du Socle Commun travaillées** : ${mod.socleSkills}\n  ⚠️ IMPORTANT : Ces compétences du socle doivent être EXPLICITEMENT développées dans la section "Objectifs Pédagogiques". Explique concrètement COMMENT chaque domaine est mobilisé dans cette séquence.\n\n`;

        prompt += `**STRUCTURE (10 POINTS)**\nFormat de sortie : ${format.toUpperCase()}\n\n`;

        if ((format === 'html' || format === 'pdf_ebook')) {
            prompt += `**OPTIONS DESIGN & MISE EN PAGE**\n`;
            if (mimic) {
                prompt += `🎨 **CLONER DESIGN (MODE PRIORITAIRE)** :\n`;
                prompt += `- Une capture d'écran est jointe au prompt\n`;
                prompt += `- IMITE ce style : couleurs, typographie, mise en page, espacements\n`;
                prompt += `- ⚠️ PRIORITÉ ABSOLUE : Ignore TOUTE autre instruction de couleur\n`;
                prompt += `- Analyse la capture et reproduis son esthétique fidèlement\n\n`;
            } else {
                prompt += `**Palette de couleurs** :\n`;
                prompt += `- Primaire : ${col1}\n`;
                prompt += `- Accent : ${col2}\n`;
                prompt += `- Texte : ${col3}\n\n`;
            }
            if (format === 'pdf_ebook') {
                prompt += `⚠️ **FORMAT E-BOOK PAYSAGE** :\n`;
                prompt += `- CSS Page : @page { size: 29.7cm 21cm; margin: 0; }\n`;
                prompt += `- **CSS Slide (IMPÉRATIF)** :\n`;
                prompt += `  .slide {\n`;
                prompt += `    width: 100%;\n`;
                prompt += `    min-height: 21cm;\n`;
                prompt += `    padding: 2cm 2.5cm;  /* IMPORTANT : marges internes généreuses */\n`;
                prompt += `    box-sizing: border-box;\n`;
                prompt += `    page-break-after: always;\n`;
                prompt += `    overflow: hidden;  /* Éviter débordement */\n`;
                prompt += `  }\n`;
                prompt += `- ⚠️ GESTION DE L'ESPACE : Si le contenu d'une slide dépasse (risque de toucher le bas), ARRÊTE le contenu AVANT la fin et crée une NOUVELLE slide pour la suite\n`;
                prompt += `- Ne JAMAIS remplir une slide jusqu'en bas : laisse TOUJOURS 1-2 cm de marge inférieure vide\n`;
                prompt += `- Structure visuelle : Sépare les grandes sections par des <div class="slide"> pour faciliter la navigation\n`;
                prompt += `- ⚠️ ATTENTION CRITIQUE : Le format E-Book concerne UNIQUEMENT la MISE EN PAGE, PAS le contenu !\n`;
                prompt += `- Le contenu doit rester AUSSI RICHE ET DÉTAILLÉ que pour les autres formats.\n`;
                prompt += `- Si une section est longue (ce qui est SOUHAITÉ), elle peut s'étendre sur PLUSIEURS slides/pages.\n`;
                prompt += `- NE JAMAIS résumer ou raccourcir pour "faire tenir" sur une page. La pagination est automatique.\n\n`;
            }
            if (imgCount > 0) {
                prompt += `**IMAGES À INTÉGRER** : ${imgCount} images numérotées\n`;
                prompt += `- Utilise des balises <img> RÉELLES avec des chemins : 1.jpg, 2.jpg, 3.jpg, ... ${imgCount}.jpg\n`;
                prompt += `- ⚠️ ATTRIBUT ALT = PROMPT D'IA GÉNÉRATEUR D'IMAGES :\n`;
                prompt += `  Pour chaque image, l'attribut alt="" doit contenir un PROMPT COMPLET et OPTIMAL pour DALL-E/Midjourney/Stable Diffusion.\n`;
                prompt += `  Format du prompt alt :\n`;
                prompt += `  - Description précise de l'image (sujet, action, contexte)\n`;
                prompt += `  - Style souhaité (schéma, infographie, photo réaliste, illustration pédagogique...)\n`;
                prompt += `  - Détails importants (couleurs, perspective, éléments clés, légendes si besoin)\n`;
                prompt += `  - BUT : L'utilisateur doit pouvoir COPIER directement l'attribut alt et l'envoyer à une IA d'images\n`;
                prompt += `- Exemple OPTIMAL : <img src="3.jpg" alt="Schéma technique en coupe d'un mécanisme de transmission par engrenages, vue isométrique, avec flèches indiquant le sens de rotation, légendes claires, style infographie pédagogique colorée (bleu et orange), fond blanc" style="max-width:100%; height:auto; margin:20px 0;">\n`;
                if (format === 'pdf_ebook') {
                    prompt += `- ⚠️ PLACEMENT E-BOOK : Place TOUJOURS les images À L'INTÉRIEUR d'une <div class="slide">, JAMAIS entre deux slides\n`;
                    prompt += `- Si une slide contient déjà beaucoup de texte, crée une NOUVELLE slide dédiée à l'image\n`;
                }
                prompt += `- Répartis intelligemment les ${imgCount} images dans les sections 2, 5, 8 et 10 du cours\n`;
                prompt += `- Priorité aux sections qui bénéficient le plus d'une illustration visuelle\n\n`;
            }
            prompt += '\n';
        }

        // RAPPEL CRITIQUE pour TOUS les formats, spécialement E-Book
        if (format === 'pdf_ebook') {
            prompt += `🚨 **RAPPEL CRITIQUE POUR FORMAT E-BOOK** 🚨\n`;
            prompt += `Tu vas générer un E-Book en format paysage. ATTENTION :\n`;
            prompt += `- ❌ NE PAS RÉSUMER les sections pour "faire tenir sur une page"\n`;
            prompt += `- ❌ NE PAS RACCOURCIR le point 3 (Objectifs), 5 (Développement) ou 9 (Glossaire)\n`;
            prompt += `- ✅ CHAQUE SECTION peut et DOIT s'étendre sur AUTANT DE PAGES que nécessaire\n`;
            prompt += `- ✅ Le point 3 (Objectifs) fera facilement 5-10 pages : c'est NORMAL et SOUHAITÉ\n`;
            prompt += `- ✅ Le point 5 (Développement) fera 20-40 pages : c'est NORMAL et SOUHAITÉ\n`;
            prompt += `- ✅ Le seul changement par rapport à HTML/DOCX est la STRUCTURE VISUELLE (slides), PAS la longueur\n\n`;
        }

        prompt += `1. TITRE\n2. SITUATION DÉCLENCHANTE (scénarise "${mod.hook}")\n\n3. OBJECTIFS PÉDAGOGIQUES DÉTAILLÉS ET EXPLICITES :\n   **a) Compétences disciplinaires** (${mod.skills}) :\n      Pour CHAQUE compétence listée :\n      - Reformule-la clairement pour un élève de ${grade}\n      - Donne 2-3 exemples CONCRETS d'activités/situations où l'élève mobilise cette compétence\n      - Explique les critères de réussite observables\n   \n   **b) Savoirs & Connaissances** (${mod.knowledge}) :\n      Pour CHAQUE savoir/connaissance :\n      - Définis-le précisément\n      - Explique son importance et son utilité concrète\n      - Donne des exemples d'application dans la vie quotidienne ou professionnelle\n   \n   **c) Compétences du Socle Commun** (${mod.socleSkills}) :\n      Pour chaque domaine mentionné, EXPLICITE précisément :\n      - Comment il est travaillé dans cette séquence\n      - Quelles activités concrètes mobilisent ce domaine\n      - Quels observables permettent d'évaluer cette compétence\n`;
        if (includePix) prompt += `   \n   **d) Compétences Numériques Pix/CRCN** :\n      Identifie 2 à 4 compétences précises parmi les 16 du référentiel (ex: "1.1 Mener une recherche", "2.3 Collaborer", "3.2 Développer des documents").\n      Pour CHAQUE compétence Pix identifiée :\n      - Nomme-la avec son code (ex: "1.1") et son intitulé complet\n      - Décris UNE activité concrète de la séquence qui mobilise cette compétence\n      - Explique COMMENT l'élève développe cette compétence à travers l'activité\n      - Indique le niveau Pix visé (1 à 5)\n`;
        prompt += `\n4. PROBLÉMATIQUE\n5. DÉVELOPPEMENT (Pour chaque notion de "${mod.knowledge}", développe 8 points : a)Définition b)Analogie c)Cas concret d)Tuto e)Erreurs f)Anecdote g)Liens interdisciplinaires h)Experts)\n6. AVENIR & PERSPECTIVES\n7. CONCLUSION\n8. CARTE MENTALE\n9. **GLOSSAIRE TECHNIQUE** : 10 à 15 termes techniques importants du cours, par ordre alphabétique, avec définitions claires. Inclus les termes de "${mod.knowledge}" + mots techniques essentiels du développement.\n10. POUR ALLER PLUS LOIN\n\n`;

        prompt += `**RÈGLES FINALES IMPÉRATIVES** :\n1. Génère uniquement le contenu final, sans méta-discours.\n2. Qualité Nathan/Delagrave (manuel scolaire de référence).\n3. **COMPÉTENCES DISCIPLINAIRES** : Pour chaque compétence, donner des exemples concrets d'activités et des critères de réussite.\n4. **SAVOIRS & CONNAISSANCES** : Pour chaque notion, expliquer son importance, son utilité et donner des exemples d'application.\n5. **COMPÉTENCES DU SOCLE** : Expliquer concrètement comment chaque domaine est travaillé avec des activités précises et des observables.\n6. **GLOSSAIRE** : 10 à 15 termes techniques définis de manière précise et complète.\n7. **PIX/CRCN** (si activé) : Pour chaque compétence, donner le code (ex: "1.1"), une activité concrète, la démarche de l'élève et le niveau visé.`;

        document.getElementById('outputPrompt').value = prompt;
    };

    // Copie
    document.getElementById('copyButton').onclick = () => {
        const txt = document.getElementById('outputPrompt').value;
        if (!txt) return;
        navigator.clipboard.writeText(txt).then(() => {
            const msg = document.getElementById('copyMessage');
            msg.classList.add('show');
            setTimeout(() => msg.classList.remove('show'), 2500);
        });
    };

    // Outils annexes
    document.getElementById('logbookButton').onclick = () => {
        const g = gradeSelect.value, s = sequenceSelect.value;
        if (!g || !s) return;
        document.getElementById('pedagogicalOutput').value = `Technologie ${g} - ${modulesData[g][s].title}. Compétences : ${modulesData[g][s].skills}.`;
    };

    document.getElementById('summaryButton').onclick = () => {
        const g = gradeSelect.value, s = sequenceSelect.value;
        if (!g || !s) return;
        document.getElementById('pedagogicalOutput').value = `À retenir (${g}) : ${modulesData[g][s].knowledge}`;
    };
});
