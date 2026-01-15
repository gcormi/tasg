// BASE DE DONNÉES - GÉNÉRATEUR MASTER TECHNOLOGIE
// Version consolidée : Séquences riches issues de technologie.html (45 séquences) organisées par thèmes

const T1 = "Thème 1 (Design, Innovation, Créativité)";
const T2 = "Thème 2 (Informatique & Programmation)";
const T3 = "Thème 3 (Société & Environnement)";

// Voir fichier technologie_master_data_full.js pour la base complète
// Version simplifiée ci-dessous (15 séquences par niveau comme technologie2.html)

const modulesData = {
    "5e": {
        1: { mainTheme: T1, title: "Analyse du besoin et fonctions de l'objet", hook: "Imagine : tu dois concevoir un nouveau sac à dos pour les collégiens. Par où commences-tu ?", skills: "Identifier un besoin. Distinguer fonction d'usage et fonction d'estime. Lister les contraintes.", knowledge: "Besoin utilisateur. Fonction d'usage. Fonction d'estime. Contraintes.", socleSkills: "Domaine 1, 2" },
        2: { mainTheme: T1, title: "Structure et constituants d'un système", hook: "Comment fonctionne une lampe de poche ? Démontage virtuel !", skills: "Identifier composants. Décrire fonctions. Schématiser.", knowledge: "Composants. Fonctions techniques. Schéma. Matériaux.", socleSkills: "Domaine 1, 4" },
        3: { mainTheme: T1, title: "Familles de matériaux et propriétés", hook: "Bois, plastique ou métal pour ton médiator ?", skills: "Classer matériaux. Associer propriétés et usages.", knowledge: "Familles de matériaux. Propriétés mécaniques et physiques.", socleSkills: "Domaine 2, 4" },
        4: { mainTheme: T1, title: "Représentation 3D et CAO", hook: "Crée ton objet en 3D virtuel !", skills: "Interface CAO. Esquisse 2D. Extrusion 3D.", knowledge: "CAO. Modélisation volumique. Fonctions de base.", socleSkills: "Domaine 2, 4" },
        5: { mainTheme: T1, title: "Atelier de fabrication et sécurité", hook: "Du plan à l'objet réel : outils et règles", skills: "Choisir outils. Gamme de fabrication. Sécurité.", knowledge: "Outils. EPI. Procédés d'assemblage.", socleSkills: "Domaine 2, 3" },
        6: { mainTheme: T2, title: "Environnement numérique (ENT)", hook: "Organise tes fichiers comme ta chambre !", skills: "Arborescence. Créer/déplacer fichiers.", knowledge: "Système d'exploitation. Fichiers. Dossiers. Cloud.", socleSkills: "Domaine 1, 2" },
        7: { mainTheme: T2, title: "Identité et citoyenneté numériques", hook: "Construis et protège ton avatar !", skills: "Info personnelles. Mot de passe. Nétiquette.", knowledge: "Identité numérique. RGPD. Cyberharcèlement.", socleSkills: "Domaine 2, 3" },
        8: { mainTheme: T2, title: "Algorithme et programmation par blocs", hook: "Programme ton premier jeu avec Scratch !", skills: "Algorithme. Blocs. Boucles.", knowledge: "Programme. Instructions. Événements. Boucles.", socleSkills: "Domaine 2, 4" },
        9: { mainTheme: T2, title: "Pilotage système automatisé (Micro:bit)", hook: "Fais clignoter une LED avec du code !", skills: "Capteurs. Actionneurs. Microcontrôleur.", knowledge: "Chaîne d'information. Micro:bit. Signaux.", socleSkills: "Domaine 1, 4" },
        10: { mainTheme: T2, title: "Données et signaux numériques", hook: "0 et 1 : le langage secret des machines", skills: "Binaire. Codage. Transmission.", knowledge: "Signal analogique vs numérique. Codage binaire.", socleSkills: "Domaine 1, 4" },
        11: { mainTheme: T3, title: "Cycle de vie et environnement", hook: "L'histoire cachée de ton stylo", skills: "Étapes du cycle de vie. Impacts environnementaux.", knowledge: "ACV. Éco-conception. Recyclage. Obsolescence.", socleSkills: "Domaine 3, 5" },
        12: { mainTheme: T3, title: "Gestion de l'énergie", hook: "Batterie ou prise : quelle énergie pour quoi ?", skills: "Sources d'énergie. Stockage. Distribution.", knowledge: "Énergie. Stockage. Chaîne d'énergie. Puissance.", socleSkills: "Domaine 4, 5" },
        13: { mainTheme: T3, title: "Réparabilité et obsolescence", hook: "Répare, ne jette pas !", skills: "Diagnostic. Indice de réparabilité. Maintenance.", knowledge: "Obsolescence. Réparabilité. Maintenance.", socleSkills: "Domaine 3, 5" },
        14: { mainTheme: T3, title: "Initiation à l'IA", hook: "Comment ton téléphone reconnaît ton visage ?", skills: "Apprentissage machine. Biais.", knowledge: "IA. Machine Learning. Reconnaissance.", socleSkills: "Domaine 2, 5" },
        15: { mainTheme: T3, title: "[PROJET] Distributeur automatique", hook: "Nourrir ton animal sans être là !", skills: "Synthèse. Conception. Programmation.", knowledge: "Fonction d'usage. Algorithme. Événements.", socleSkills: "Domaine 1, 4" }
    },
    "4e": {
        1: { mainTheme: T1, title: "Cahier des Charges Fonctionnel", hook: "Le document secret des ingénieurs", skills: "Fonctions de service. Critères. Performances.", knowledge: "CdCF. Fonctions. Critères d'appréciation.", socleSkills: "Domaine 1, 2" },
        2: { mainTheme: T1, title: "Ergonomie et UX Design", hook: "Pourquoi certaines apps sont addictives ?", skills: "Analyser ergonomie. IHM. UX.", knowledge: "Ergonomie. IHM. UX Design.", socleSkills: "Domaine 3, 4" },
        3: { mainTheme: T1, title: "Chaîne d'information et d'énergie", hook: "Comment le store voit le soleil ?", skills: "Chaînes info/énergie. Blocs fonctionnels.", knowledge: "Système automatisé. Capteurs. Actionneurs.", socleSkills: "Domaine 1, 4" },
        4: { mainTheme: T1, title: "ACV et éco-conception", hook: "Le coût caché de ton smartphone", skills: "Cycle de vie. Impacts. Éco-conception.", knowledge: "ACV. Éco-conception. Obsolescence.", socleSkills: "Domaine 3, 5" },
        5: { mainTheme: T1, title: "CAO avancée : assemblages", hook: "Assemble un mécanisme en 3D", skills: "Assemblage CAO. Contraintes. Liaisons.", knowledge: "Assemblage. Liaisons mécaniques. Degrés de liberté.", socleSkills: "Domaine 2, 4" },
        6: { mainTheme: T1, title: "Simulation numérique", hook: "Crash-test virtuel de ton pont", skills: "Simulation. Efforts. Validation.", knowledge: "Simulation. Modèle. Optimisation.", socleSkills: "Domaine 2, 4" },
        7: { mainTheme: T2, title: "Algorithmique : variables et conditions", hook: "Donne de la mémoire à ton jeu !", skills: "Variables. Conditions. Boucles.", knowledge: "Variable. Types. Opérateurs. Structures.", socleSkills: "Domaine 1, 2" },
        8: { mainTheme: T2, title: "Traitement de données (tableur)", hook: "Détective de la donnée sur tableur", skills: "CSV. Tri. Filtres. Graphiques.", knowledge: "Tableur. CSV. Métadonnées.", socleSkills: "Domaine 1, 2" },
        9: { mainTheme: T2, title: "Pilotage système complexe", hook: "Alarme intelligente avec capteurs", skills: "Capteurs. Actionneurs. Microcontrôleur.", knowledge: "Microcontrôleur. Capteurs. Signaux.", socleSkills: "Domaine 2, 4" },
        10: { mainTheme: T2, title: "Architecture des réseaux", hook: "Du Wi-Fi aux câbles sous-marins", skills: "Réseau. Adressage IP. Protocoles.", knowledge: "LAN/WAN. Client/serveur. TCP/IP. DNS.", socleSkills: "Domaine 1, 4" },
        11: { mainTheme: T3, title: "Gestion de l'énergie avancée", hook: "Sources d'énergie et stockage", skills: "Sources. Stockage. Comparaison.", knowledge: "Énergie. Batterie. Chaîne énergie. Renouvelables.", socleSkills: "Domaine 4, 5" },
        12: { mainTheme: T3, title: "Cybersécurité", hook: "Défends-toi contre les pirates !", skills: "Menaces. Hygiène numérique. 2FA.", knowledge: "Phishing. Ransomware. Chiffrement. RGPD.", socleSkills: "Domaine 2, 3" },
        13: { mainTheme: T3, title: "IA et algorithmes de recommandation", hook: "Pourquoi TikTok te propose ça ?", skills: "Algorithmes. Biais. Recommandation.", knowledge: "Algorithme recommandation. Big Data. Biais.", socleSkills: "Domaine 3, 5" },
        14: { mainTheme: T3, title: "Éthique robotique", hook: "Qui est fautif si la voiture autonome crash ?", skills: "Débat éthique. Autonomie. Responsabilité.", knowledge: "Éthique. Autonomie robotique. Lois Asimov.", socleSkills: "Domaine 3, 4" },
        15: { mainTheme: T3, title: "[PROJET] Smart City", hook: "Gère l'éclairage de la ville", skills: "Système urbain. Programmation. Justification.", knowledge: "Smart City. Urbanisme. Programmation avancée.", socleSkills: "Domaine 4, 5" }
    },
    "3e": {
        1: { mainTheme: T1, title: "Gestion de projet collaborative", hook: "Organise ton projet comme une start-up", skills: "Objectifs. Gantt. Revues. Outils collaboratifs.", knowledge: "Gestion projet. Gantt. Jalons. Kanban.", socleSkills: "Domaine 2, 3" },
        2: { mainTheme: T1, title: "Veille et propriété intellectuelle", hook: "Protège ton invention !", skills: "Veille. Antériorité. Brevet.", knowledge: "Veille. Brevet. Marque. Creative Commons.", socleSkills: "Domaine 2, 3" },
        3: { mainTheme: T1, title: "Systèmes complexes mécatroniques", hook: "Le drone : mécanique + électronique + code", skills: "Architecture système. Flux. Fiabilité.", knowledge: "Mécatronique. Systèmes embarqués. Redondance.", socleSkills: "Domaine 1, 4" },
        4: { mainTheme: T1, title: "Prototypage vs industrialisation", hook: "D'une pièce à un million", skills: "Prototypage. Procédés. Production série.", knowledge: "Prototypage. Procédés fabrication. CNC.", socleSkills: "Domaine 4, 5" },
        5: { mainTheme: T1, title: "Éco-conception et coût complet", hook: "Le vrai prix de ton smartphone", skills: "ACV complète. Coût. Éco-conception.", knowledge: "ACV. Empreinte carbone. Économie circulaire. Réparabilité.", socleSkills: "Domaine 3, 5" },
        6: { mainTheme: T1, title: "Fabrication additive (impression 3D)", hook: "Du modèle à l'objet en 30 minutes", skills: "FDM. Slicer. Paramétrage.", knowledge: "Impression 3D. Slicer. Matériaux FDM.", socleSkills: "Domaine 2, 4" },
        7: { mainTheme: T1, title: "Simulation comportementale", hook: "Jumeau numérique avant construction", skills: "Simulation. Paramètres. Validation.", knowledge: "Jumeau numérique. Simulation. Optimisation.", socleSkills: "Domaine 2, 4" },
        8: { mainTheme: T2, title: "Python : du bloc au texte", hook: "Code comme un vrai développeur", skills: "Python. Syntaxe. Fonctions.", knowledge: "Python. Syntaxe. Variables. Fonctions. Bibliothèques.", socleSkills: "Domaine 1, 2" },
        9: { mainTheme: T2, title: "Projet IA : entraîner un modèle", hook: "Apprends à ton IA à reconnaître des images", skills: "Dataset. Entraînement. Test. Biais.", knowledge: "Machine Learning. Dataset. Entraînement. Biais IA.", socleSkills: "Domaine 2, 5" },
        10: { mainTheme: T2, title: "Architecture services en ligne", hook: "Comment fonctionne Instagram ?", skills: "Client/Serveur. Front/Back. API.", knowledge: "Client/Serveur. API. Base de données. Cloud.", socleSkills: "Domaine 4, 5" },
        11: { mainTheme: T3, title: "Cybersécurité avancée", hook: "Chiffrement et authentification", skills: "Phishing. 2FA. Chiffrement. RGPD.", knowledge: "Phishing. Chiffrement. RGPD. Empreinte numérique.", socleSkills: "Domaine 2, 3" },
        12: { mainTheme: T3, title: "Bilan carbone projet", hook: "Combien de CO2 pèse ton projet ?", skills: "Empreinte carbone. Éco-conception.", knowledge: "Bilan carbone. Énergie grise. Économie fonctionnalité.", socleSkills: "Domaine 4, 5" },
        13: { mainTheme: T3, title: "Prospective : Ville 2050", hook: "Imagine la ville durable du futur", skills: "Scénarios. Prospective. Urbanisme.", knowledge: "Smart City. Mobilité. Prospective. Urbanisme.", socleSkills: "Domaine 4, 5" },
        14: { mainTheme: T3, title: "Communication orale : soutenance DNB", hook: "Convainc le jury en 5 minutes", skills: "Structurer oral. Support visuel. Argumentation.", knowledge: "Oral. Argumentation. Diaporama. Éloquence.", socleSkills: "Domaine 1, 2" },
        15: { mainTheme: T3, title: "[PROJET DNB] Mission drone", hook: "Drone autonome pour secours", skills: "Synthèse Cycle 4. Projet complet. Python. Soutenance.", knowledge: "Synthèse : projet, systèmes, Python, cybersécurité, oral.", socleSkills: "Synthèse Socle Commun" }
    }
};

const suggestionDatabase = {
    'général': ["Trottinette électrique", "Smartphone", "Drone", "Robot mBot", "Station météo"],
    'conception': ["Sac à dos", "Support téléphone", "Porte-clés"],
    'programmation': ["Micro:bit", "Arduino", "Scratch"],
    'énergie': ["Vélo électrique", "Lampe solaire", "Panneau solaire"],
    'réseau': ["Box internet", "Réseau collège", "Cloud"]
};
