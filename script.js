// ============================================================
// 📦 SCRIPT.JS - Version compatible avec index.html actuel
// ============================================================


// ============================================================
// INDEXEDDB SPÉCIFIQUE POUR ZACC
// ============================================================

const DB_ZACC_NAME = 'DRRS_ZACC_Database';
const DB_ZACC_VERSION = 1;
const STORE_ZACC_NAME = 'zacc_data';

// ✅ Ouvrir la base de données ZACC
function ouvrirDBZACC() {
    return new Promise(function(resolve, reject) {
        var request = indexedDB.open(DB_ZACC_NAME, DB_ZACC_VERSION);
        
        request.onerror = function() {
            console.error('❌ Erreur IndexedDB ZACC:', request.error);
            reject(request.error);
        };
        
        request.onsuccess = function() {
            resolve(request.result);
        };
        
        request.onupgradeneeded = function(event) {
            var db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_ZACC_NAME)) {
                db.createObjectStore(STORE_ZACC_NAME, { keyPath: 'id' });
                console.log('✅ ObjectStore ZACC créé:', STORE_ZACC_NAME);
            }
        };
    });
}

// ✅ Sauvegarder les données ZACC
async function sauvegarderZACCIndexedDB(donnees) {
    if (!donnees || donnees.length === 0) return;
    
    try {
        var db = await ouvrirDBZACC();
        
        // Vider l'ancien contenu
        await new Promise(function(resolve, reject) {
            var tx = db.transaction([STORE_ZACC_NAME], 'readwrite');
            var store = tx.objectStore(STORE_ZACC_NAME);
            var clearRequest = store.clear();
            clearRequest.onsuccess = function() { resolve(); };
            clearRequest.onerror = function() { reject(clearRequest.error); };
        });
        
        // Ajouter par lots
        var BATCH_SIZE = 500;
        for (var i = 0; i < donnees.length; i += BATCH_SIZE) {
            var batch = donnees.slice(i, i + BATCH_SIZE);
            
            await new Promise(function(resolve, reject) {
                var tx = db.transaction([STORE_ZACC_NAME], 'readwrite');
                var store = tx.objectStore(STORE_ZACC_NAME);
                
                batch.forEach(function(d, index) {
                    d.id = i + index;
                    store.put(d);
                });
                
                tx.oncomplete = function() { resolve(); };
                tx.onerror = function() { reject(tx.error); };
            });
        }
        
        db.close();
        console.log('💾 ZACC sauvegardé dans IndexedDB (', donnees.length, 'lignes)');
        return true;
        
    } catch(e) {
        console.error('❌ Erreur sauvegarde ZACC IndexedDB:', e);
        return false;
    }
}

// ✅ Charger les données ZACC
async function chargerZACCIndexedDB() {
    try {
        var db = await ouvrirDBZACC();
        var transaction = db.transaction([STORE_ZACC_NAME], 'readonly');
        var store = transaction.objectStore(STORE_ZACC_NAME);
        
        var donnees = await new Promise(function(resolve, reject) {
            var request = store.getAll();
            request.onsuccess = function() { resolve(request.result); };
            request.onerror = function() { reject(request.error); };
        });
        
        db.close();
        
        if (donnees && donnees.length > 0) {
            console.log('📂 ZACC chargé depuis IndexedDB (', donnees.length, 'lignes)');
            return donnees;
        }
        
        return null;
        
    } catch(e) {
        console.error('❌ Erreur chargement ZACC IndexedDB:', e);
        return null;
    }
}

// ✅ Supprimer les données ZACC
async function supprimerZACCIndexedDB() {
    try {
        var db = await ouvrirDBZACC();
        var transaction = db.transaction([STORE_ZACC_NAME], 'readwrite');
        var store = transaction.objectStore(STORE_ZACC_NAME);
        
        await new Promise(function(resolve, reject) {
            var request = store.clear();
            request.onsuccess = function() { resolve(); };
            request.onerror = function() { reject(request.error); };
        });
        
        db.close();
        console.log('🗑️ ZACC supprimé de IndexedDB');
        return true;
        
    } catch(e) {
        console.error('❌ Erreur suppression ZACC IndexedDB:', e);
        return false;
    }
}

// ============================================================
// INDEXEDDB - Sauvegarde persistante des données
// ============================================================

const DB_NAME = 'DRRS_Database';
const DB_VERSION = 1;
const STORE_NAME = 'accidents';

// ✅ Ouvrir la base de données
function ouvrirDB() {
    return new Promise(function(resolve, reject) {
        var request = indexedDB.open(DB_NAME, DB_VERSION);
        
        request.onerror = function() {
            console.error('❌ Erreur IndexedDB:', request.error);
            reject(request.error);
        };
        
        request.onsuccess = function() {
            resolve(request.result);
        };
        
        request.onupgradeneeded = function(event) {
            var db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id' });
                console.log('✅ ObjectStore créé:', STORE_NAME);
            }
        };
    });
}

// ✅ Sauvegarder les données dans IndexedDB
async function sauvegarderIndexedDB(donnees) {
    if (!donnees || donnees.length === 0) return;
    
    try {
        var db = await ouvrirDB();
        var transaction = db.transaction([STORE_NAME], 'readwrite');
        var store = transaction.objectStore(STORE_NAME);
        
        // ✅ Supprimer les anciennes données
        await new Promise(function(resolve, reject) {
            var clearRequest = store.clear();
            clearRequest.onsuccess = function() { resolve(); };
            clearRequest.onerror = function() { reject(clearRequest.error); };
        });
        
        // ✅ Ajouter les nouvelles données par lots
        var BATCH_SIZE = 500;
        for (var i = 0; i < donnees.length; i += BATCH_SIZE) {
            var batch = donnees.slice(i, i + BATCH_SIZE);
            
            await new Promise(function(resolve, reject) {
                var tx = db.transaction([STORE_NAME], 'readwrite');
                var st = tx.objectStore(STORE_NAME);
                
                batch.forEach(function(d, index) {
                    d.id = i + index; // ID unique
                    st.put(d);
                });
                
                tx.oncomplete = function() { resolve(); };
                tx.onerror = function() { reject(tx.error); };
            });
        }
        
        db.close();
        console.log('💾 Données sauvegardées dans IndexedDB (', donnees.length, 'lignes)');
        return true;
        
    } catch(e) {
        console.error('❌ Erreur sauvegarde IndexedDB:', e);
        return false;
    }
}

// ✅ Charger les données depuis IndexedDB
async function chargerIndexedDB() {
    try {
        var db = await ouvrirDB();
        var transaction = db.transaction([STORE_NAME], 'readonly');
        var store = transaction.objectStore(STORE_NAME);
        
        var donnees = await new Promise(function(resolve, reject) {
            var request = store.getAll();
            request.onsuccess = function() {
                resolve(request.result);
            };
            request.onerror = function() {
                reject(request.error);
            };
        });
        
        db.close();
        
        if (donnees && donnees.length > 0) {
            console.log('📂 Données chargées depuis IndexedDB (', donnees.length, 'lignes)');
            return donnees;
        }
        
        return null;
        
    } catch(e) {
        console.error('❌ Erreur chargement IndexedDB:', e);
        return null;
    }
}

// ✅ Vérifier si des données existent
async function aDesDonneesIndexedDB() {
    try {
        var db = await ouvrirDB();
        var transaction = db.transaction([STORE_NAME], 'readonly');
        var store = transaction.objectStore(STORE_NAME);
        
        var count = await new Promise(function(resolve, reject) {
            var request = store.count();
            request.onsuccess = function() {
                resolve(request.result);
            };
            request.onerror = function() {
                reject(request.error);
            };
        });
        
        db.close();
        return count > 0;
        
    } catch(e) {
        return false;
    }
}

// ✅ Supprimer les données
async function supprimerIndexedDB() {
    try {
        var db = await ouvrirDB();
        var transaction = db.transaction([STORE_NAME], 'readwrite');
        var store = transaction.objectStore(STORE_NAME);
        
        await new Promise(function(resolve, reject) {
            var request = store.clear();
            request.onsuccess = function() { resolve(); };
            request.onerror = function() { reject(request.error); };
        });
        
        db.close();
        console.log('🗑️ Données supprimées de IndexedDB');
        return true;
        
    } catch(e) {
        console.error('❌ Erreur suppression IndexedDB:', e);
        return false;
    }
}
// ============================================================
// 1. VARIABLES GLOBALES
// ============================================================

let toutesLesDonnees = [];
let donneesFiltrees = [];

// ============================================================
// 2. FONCTIONS UTILITAIRES
// ============================================================

const TRONCONS = {
    'T1': { min: 27000, max: 106000, label: 'PK 27000 - PK 106000' },
    'T2': { min: 106001, max: 198000, label: 'PK 106000 - PK 198000' },
    'T2_2': { min: 0, max: 13000, label: 'PK 0 - PK 13000' },
    'T3': { min: 198001, max: 282000, label: 'PK 198000 - PK 282000' },
    'T4': { min: 282001, max: 430000, label: 'PK 282000 - PK 430000' }
};

const SOCIETES_DEPANNAGE = {
    'TransAlmahata 1': { min: 27000, max: 65000 },
    'TransAlmahata 2': { min: 65001, max: 127000 },
    'Ezziraoui': { min: 127001, max: 160000 },
    'INT Assistance': { min: 160001, max: 249000 },
    'Routier Multi Service et INT Assistance': { min: 249001, max: 310000 },
    'Grand Sud': { min: 310001, max: 430000 }
};

// ============================================================
// 🆕 HELPER : Récupérer les tronçons ACTIFS selon le DRR courant
// ============================================================
function getTronconsActifs() {
    let liste = [];
    
    // Priorité 1 : window.TRONCONS
    if (window.TRONCONS && typeof window.TRONCONS === 'object' && Object.keys(window.TRONCONS).length > 0) {
        liste = Object.keys(window.TRONCONS);
        console.log('✅ [getTronconsActifs] Depuis TRONCONS:', liste);
        return liste;
    }
    
    // ✅ Priorité 2 : fallback sur la config du DRR actif (via localStorage)
    const drrActif = (typeof Parametres !== 'undefined' && Parametres.directionActive)
                    || window.directionActiveCourante
                    || 'DRRS';
    
    try {
        const data = localStorage.getItem('config_' + drrActif + '_troncons');
        if (data) {
            const arr = JSON.parse(data);
            if (Array.isArray(arr) && arr.length > 0) {
                liste = arr.map(t => t.id).filter(x => x);
                console.log('✅ [getTronconsActifs] Depuis config_' + drrActif + '_troncons:', liste);
                return liste;
            }
        }
    } catch(e) {
        console.warn('⚠️ [getTronconsActifs] Erreur lecture config:', e);
    }
    
    // Priorité 3 : fallback ultime DRRS
    console.warn('⚠️ [getTronconsActifs] Fallback ultime utilisé');
    return ['T1', 'T2', 'T2_2', 'T3', 'T4'];
}

// ============================================================
// 🆕 Mettre à jour le label de l'année dans le titre Analyse
// ============================================================
function mettreAJourAnneeLabel() {
    const selectAnnee = document.getElementById('chargementAnneeFilter');
    if (!selectAnnee) return;
    
    const val = selectAnnee.value;
    const texte = (val === 'all') ? '' : '— ' + val;
    
    // Page Analyse
    const labelAnalyse = document.getElementById('analyseAnneeLabel');
    if (labelAnalyse) labelAnalyse.textContent = texte;
    
    // Page Intervenants
    const labelInterv = document.getElementById('intervenantsAnneeLabel');
    if (labelInterv) labelInterv.textContent = texte;
    
    // Page Dépanneurs
    const labelDep = document.getElementById('depanneursAnneeLabel');
    if (labelDep) labelDep.textContent = texte;
    
    // Page Graphiques (Tableau de Bord)
    const labelGraph = document.getElementById('graphiquesAnneeLabel');
    if (labelGraph) labelGraph.textContent = texte;

    // Page Rapprochement
    const labelRapp = document.getElementById('rapprochementAnneeLabel');
    if (labelRapp) {
        const selRapp = document.getElementById('rappAnneeFilter');
        const valRapp = selRapp ? selRapp.value : val;
        labelRapp.textContent = (valRapp === 'all' || !valRapp) ? '' : '— ' + valRapp;
    }
}

// ============================================================
// 🆕 HELPER : Récupérer le label PK d'un tronçon (dynamique)
// ============================================================
function getPkRangeDynamique(troncon) {
    if (window.TRONCONS && window.TRONCONS[troncon]) {
        const t = window.TRONCONS[troncon];
        return formatPKLabel(t.min) + ' - ' + formatPKLabel(t.max);
    }
    // Fallback : ancien comportement
    const ranges = {
        'T1': '27 000 - 106 000',
        'T2': '106 000 - 198 000',
        'T2_2': '0 - 13 000',
        'T3': '198 000 - 282 000',
        'T4': '282 000 - 430 000'
    };
    return ranges[troncon] || 'Inconnu';
}

function formatPKLabel(n) {
    const num = parseInt(n);
    if (isNaN(num)) return String(n);
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}
// ============================================================
// CHARGEMENT AUTOMATIQUE DE LA CONFIGURATION (1 seule fois)
// ============================================================

const CONFIG_URL = 'https://raw.githubusercontent.com/Nouari-Abdelkabir/Accidentologie/main/data/config.json';

// ✅ Charger la configuration depuis GitHub UNIQUEMENT si localStorage est vide
async function initialiserConfiguration() {
    const DRRS_LIST = ['DRRS', 'DRRN', 'DRRC', 'DRRO', 'DRRE'];
    
    // ✅ Vérifier si une config existe déjà
    const aDesDonnees = DRRS_LIST.some(drr => 
        localStorage.getItem('config_' + drr + '_societes')
    );
    
    if (aDesDonnees) {
        console.log('✅ Configuration locale trouvée');
        return false;
    }
    
    console.log('📥 Première utilisation → chargement depuis GitHub...');
    
    try {
        const response = await fetch(CONFIG_URL);
        if (!response.ok) return false;
        
        const config = await response.json();
        
        // ✅ Détecter la structure
        const estImbriquee = config.DRRS || config.DRRN || config.DRRC || config.DRRO || config.DRRE;
        
        if (estImbriquee) {
            // Structure imbriquée (nouvelle)
            DRRS_LIST.forEach(drr => {
                if (config[drr]) {
                    if (config[drr].troncons) {
                        localStorage.setItem('config_' + drr + '_troncons', JSON.stringify(config[drr].troncons));
                    }
                    if (config[drr].societes) {
                        localStorage.setItem('config_' + drr + '_societes', JSON.stringify(config[drr].societes));
                    }
                    if (config[drr].gendarmerie) {
                        localStorage.setItem('config_' + drr + '_gendarmerie', JSON.stringify(config[drr].gendarmerie));
                    }
                    if (config[drr].patrouilleurs) {
                        localStorage.setItem('config_' + drr + '_patrouilleurs', JSON.stringify(config[drr].patrouilleurs));
                    }
                    if (config[drr].protectionCivile) {
                        localStorage.setItem('config_' + drr + '_protectionCivile', JSON.stringify(config[drr].protectionCivile));
                    }
                    if (config[drr].fourgonMortelle) {
                        localStorage.setItem('config_' + drr + '_fourgonMortelle', JSON.stringify(config[drr].fourgonMortelle));
                    }
                }
            });
        } else {
            // Structure plate (ancienne) → tout assigner à DRRS
            console.log('📦 Structure plate détectée → assignation à DRRS');
            if (config.troncons) {
                localStorage.setItem('config_DRRS_troncons', JSON.stringify(config.troncons));
            }
            if (config.societes) {
                localStorage.setItem('config_DRRS_societes', JSON.stringify(config.societes));
            }
            if (config.gendarmerie) {
                localStorage.setItem('config_DRRS_gendarmerie', JSON.stringify(config.gendarmerie));
            }
        }
        
        console.log('✅ Configuration initiale chargée');
        return true;
    } catch(e) {
        console.warn('⚠️ Erreur:', e);
        return false;
    }
}

function extrairePK(pkStr) {
    if (pkStr === undefined || pkStr === null || pkStr === '') return null;
    try {
        if (typeof pkStr === 'number') return Math.round(pkStr);
        let texte = String(pkStr).trim();
        texte = texte.replace(/PK\s*/gi, '');
        texte = texte.replace(/croissant|décroissant/gi, '');
        texte = texte.replace(/\+.*$/, '');
        texte = texte.replace(/[^0-9]/g, '');
        if (texte === '') return null;
        return parseInt(texte, 10);
    } catch(e) { return null; }
}

function determinerTroncon(pk) {
    if (pk === null || pk === undefined || isNaN(pk)) return 'Inconnu';
    const pkNum = Number(pk);
    
    // ✅ Utiliser window.TRONCONS (mis à jour dynamiquement selon le DRR actif)
    const troncons = window.TRONCONS;
    
    if (troncons && Object.keys(troncons).length > 0) {
        for (const [id, t] of Object.entries(troncons)) {
            const min = parseInt(t.min);
            const max = parseInt(t.max);
            if (pkNum >= min && pkNum <= max) return id;
        }
        return 'Inconnu';
    }
    
    // ⚠️ Fallback (valeurs par défaut)
    if (pkNum >= 0 && pkNum <= 13000) return 'T2_2';
    if (pkNum >= 27000 && pkNum <= 106000) return 'T1';
    if (pkNum >= 106000 && pkNum <= 198000) return 'T2';
    if (pkNum >= 198000 && pkNum <= 282000) return 'T3';
    if (pkNum >= 282000 && pkNum <= 430000) return 'T4';
    return 'Inconnu';
}

function getPkRange(troncon) {
    return getPkRangeDynamique(troncon);
}

function determinerSociete(pk, axe, dateAccident) {
    if (pk === null || pk === undefined || isNaN(pk)) return 'Inconnue';
    
    const pkNum = Number(pk);
    
    // ✅ Récupérer le DRR actif
    const drrActif = (typeof Parametres !== 'undefined' && Parametres.directionActive) 
                    || window.directionActiveCourante 
                    || 'DRRS';
    
    // ✅ Lire depuis localStorage avec la clé du DRR actif
    let societes = [];
    try {
        const data = localStorage.getItem('config_' + drrActif + '_societes');
        if (data) {
            societes = JSON.parse(data);
        }
    } catch(e) {}
    
    // ✅ Si vide, utiliser SOCIETES_DEPANNAGE global (fallback)
    if (societes.length === 0) {
        for (const [nom, s] of Object.entries(SOCIETES_DEPANNAGE)) {
            if (pkNum >= s.min && pkNum <= s.max) return nom;
        }
        return 'Inconnue';
    }
    
    // ✅ Convertir la date de l'accident en objet Date
    let dateAccidentObj = null;
    if (dateAccident) {
        if (typeof dateAccident === 'number') {
            dateAccidentObj = new Date((dateAccident - 25569) * 86400 * 1000);
        } else if (typeof dateAccident === 'string') {
            let match = dateAccident.match(/(\d{2})[\/\-](\d{2})[\/\-](\d{4})/);
            if (match) {
                dateAccidentObj = new Date(
                    parseInt(match[3]), 
                    parseInt(match[2]) - 1, 
                    parseInt(match[1])
                );
            } else {
                dateAccidentObj = new Date(dateAccident);
            }
        } else if (dateAccident instanceof Date) {
            dateAccidentObj = dateAccident;
        }
    }
    
    // ✅ Chercher la société correspondante
    for (const s of societes) {
        const pkMin = parseInt(s.pk_min);
        const pkMax = parseInt(s.pk_max);
        if (pkNum < pkMin || pkNum > pkMax) continue;
        
        if (s.axe && axe && s.axe !== axe) continue;
        
        if (s.date_entree || s.date_sortie) {
            if (!dateAccidentObj) continue;
            
            const dateEntree = s.date_entree ? new Date(s.date_entree) : new Date('1900-01-01');
            const dateSortie = s.date_sortie ? new Date(s.date_sortie) : new Date('2100-12-31');
            
            if (dateAccidentObj < dateEntree || dateAccidentObj > dateSortie) {
                continue;
            }
        }
        
        return s.nom;
    }
    
    return 'Inconnue';
}

function extraireHeure(valeur) {
    if (!valeur && valeur !== 0) return null;
    if (valeur === '--' || valeur === '-') return null;
    if (typeof valeur === 'string') {
        let temps = valeur.trim();
        if (/^\d{1,2}:\d{2}$/.test(temps)) return temps;
        if (/^\d{1,2}:\d{2}:\d{2}$/.test(temps)) return temps.substring(0, 5);
        const match = temps.match(/(\d{1,2}:\d{2})/);
        if (match) return match[1];
        return null;
    }
    if (typeof valeur === 'number') {
        const totalMinutes = Math.round(valeur * 24 * 60);
        const heures = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        if (heures >= 0 && heures < 24) {
            return String(heures).padStart(2, '0') + ':' + String(minutes).padStart(2, '0');
        }
        return null;
    }
    if (valeur instanceof Date) {
        return String(valeur.getHours()).padStart(2, '0') + ':' + String(valeur.getMinutes()).padStart(2, '0');
    }
    return null;
}

function calculerDifferenceTemps(dateHeureDebut, dateHeureFin) {
    if (!dateHeureDebut || !dateHeureFin) return null;
    if (dateHeureDebut === '--' || dateHeureFin === '--' || 
        dateHeureDebut === '-' || dateHeureFin === '-') return null;
    
    try {
        function extraireHeureSeule(texte) {
            if (!texte) return null;
            let str = String(texte).trim();
            let match = str.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?/);
            if (match) {
                const heures = parseInt(match[1]);
                const minutes = parseInt(match[2]);
                const secondes = match[3] ? parseInt(match[3]) : 0;
                return { heures, minutes, secondes };
            }
            return null;
        }
        
        const debut = extraireHeureSeule(dateHeureDebut);
        const fin = extraireHeureSeule(dateHeureFin);
        if (!debut || !fin) return null;
        
        let secDebut = debut.heures * 3600 + debut.minutes * 60 + debut.secondes;
        let secFin = fin.heures * 3600 + fin.minutes * 60 + fin.secondes;
        let diff = secFin - secDebut;
        if (diff < 0) diff += 86400;
        
        const heures = Math.floor(diff / 3600);
        const minutes = Math.floor((diff % 3600) / 60);
        const secondes = diff % 60;
        return String(heures).padStart(2, '0') + ':' + String(minutes).padStart(2, '0') + ':' + String(secondes).padStart(2, '0');
    } catch(e) { return null; }
}

function obtenirMois(dateStr) {
    if (!dateStr) return null;
    try {
        if (typeof dateStr === 'number') {
            const date = new Date((dateStr - 25569) * 86400 * 1000);
            if (!isNaN(date)) return date.getMonth() + 1;
        }
        let texte = String(dateStr).trim();
        let match = texte.match(/(\d{2})-(\d{2})-(\d{4})/);
        if (match) {
            const jour = parseInt(match[1]), mois = parseInt(match[2]), annee = parseInt(match[3]);
            const date = new Date(annee, mois - 1, jour);
            if (!isNaN(date)) return mois;
        }
        match = texte.match(/(\d{2})\/(\d{2})\/(\d{4})/);
        if (match) {
            const jour = parseInt(match[1]), mois = parseInt(match[2]), annee = parseInt(match[3]);
            const date = new Date(annee, mois - 1, jour);
            if (!isNaN(date)) return mois;
        }
        const date = new Date(texte);
        if (!isNaN(date)) return date.getMonth() + 1;
        return null;
    } catch(e) { return null; }
}

function obtenirNomMois(dateStr) {
    const moisNoms = ['Janvier','Février','Mars','Avril','Mai','Juin',
                      'Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
    const mois = obtenirMois(dateStr);
    if (mois && mois >= 1 && mois <= 12) return moisNoms[mois - 1];
    return null;
}

function moyenneTemps(temps) {
    if (!temps || temps.length === 0) return null;
    
    // تصفية القيم الفارغة وغير الصالحة
    const tempsValides = temps.filter(t => {
        if (!t) return false;
        if (t === '--' || t === '-') return false;
        if (t === '00:00:00' || t === '00:00') return false;
        return true;
    });
    
    if (tempsValides.length === 0) return null;
    
    let secondes = [];
    tempsValides.forEach(t => {
        const parts = t.toString().split(':');
        let sec = 0;
        if (parts.length === 2) {
            sec = parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60;
        } else if (parts.length === 3) {
            sec = parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
        }
        if (sec > 0) {
            secondes.push(sec);
        }
    });
    
    if (secondes.length === 0) return null;
    
    // ✅ استبعاد القيم الخيالية (أكبر من 1:50:00 = 6600 ثانية)
    const seuilMax = 6600; // 1:50:00
    const secondesFiltrees = secondes.filter(s => s <= seuilMax);
    
    // إذا لم يتبقى أي قيم بعد التصفية
    if (secondesFiltrees.length === 0) {
        // إذا كانت كل القيم كبيرة، نأخذ أصغرها
        return formatTemps(Math.min(...secondes));
    }
    
    // حساب المتوسط
    const total = secondesFiltrees.reduce((a, b) => a + b, 0);
    const moyenne = total / secondesFiltrees.length;
    
    return formatTemps(moyenne);
}

// ✅ أضف moyenneTempsDep هنا (بعد moyenneTemps)
function moyenneTempsDep(temps) {
    if (!temps || temps.length === 0) return null;
    
    const tempsValides = temps.filter(t => {
        if (!t) return false;
        if (t === '--' || t === '-') return false;
        if (t === '00:00:00' || t === '00:00') return false;
        return true;
    });
    
    if (tempsValides.length === 0) return null;
    
    let secondes = [];
    tempsValides.forEach(t => {
        const parts = t.toString().split(':');
        let sec = 0;
        if (parts.length === 2) {
            sec = parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60;
        } else if (parts.length === 3) {
            sec = parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
        }
        if (sec > 0) {
            secondes.push(sec);
        }
    });
    
    if (secondes.length === 0) return null;
    
    // ✅ استبعاد القيم الخيالية (أكبر من 4 ساعات = 14400 ثانية)
    const seuilMax = 14400;
    const secondesFiltrees = secondes.filter(s => s <= seuilMax);
    
    if (secondesFiltrees.length === 0) {
        return formatTemps(Math.min(...secondes));
    }
    
    const total = secondesFiltrees.reduce((a, b) => a + b, 0);
    const moyenne = total / secondesFiltrees.length;
    
    return formatTemps(moyenne);
}
function formatTemps(secondes) {
    if (secondes === undefined || secondes === null || isNaN(secondes)) return '-';
    const h = Math.floor(secondes / 3600);
    const m = Math.floor((secondes % 3600) / 60);
    const s = Math.round(secondes % 60);
    return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
}
function chargerFichierPourDirection(fichier, direction) {
    console.log(`📄 Fichier sélectionné pour ${direction}:`, fichier.name);
    
    const reader = new FileReader();
    reader.onload = function(event) {
        try {
            const data = new Uint8Array(event.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const premiereFeuille = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(premiereFeuille);
            
            jsonData.forEach(ligne => {
                ligne['_source_fichier'] = fichier.name;
                ligne['_direction_assignee'] = direction;
            });
            
            toutesLesDonnees = enrichirDonnees(jsonData);
            sauvegarderDonnees(toutesLesDonnees);
            
            document.getElementById('fileStatus').textContent = `✅ ${toutesLesDonnees.length} accidents chargés (${direction})`;
            document.getElementById('fileStatus').style.color = '#27ae60';
            
            const memoryStatus = document.getElementById('memoryStatus');
            if (memoryStatus) {
                memoryStatus.textContent = `💾 ${toutesLesDonnees.length} lignes en mémoire (${direction})`;
                memoryStatus.style.color = '#27ae60';
                memoryStatus.style.background = '#e8f8f0';
            }
            
            const fileList = document.getElementById('fileList');
            if (fileList) {
                fileList.innerHTML = `<span class="file-tag">📄 ${fichier.name} (${direction})</span>`;
            }
            
            reinitialiserTout();
            changerPage('analyse');
            
            alert(`✅ Données chargées avec succès pour la Direction "${direction}"!`);
            
        } catch (error) {
            console.error('Erreur:', error);
            alert('❌ Erreur lors du chargement du fichier: ' + error.message);
        }
    };
    reader.readAsArrayBuffer(fichier);
}

// ============================================================
// 3. ENRICHIR LES DONNÉES
// ============================================================

function enrichirDonnees(donnees) {
    console.log('🔄 enrichirDonnees - Début');
    if (donnees.length === 0) return donnees;
    const resultats = donnees.map((ligne) => {
        const nouvelle = { ...ligne };
        const pk = extrairePK(ligne['PK']);
        nouvelle['_pk_num'] = pk;
        nouvelle['_troncon'] = determinerTroncon(pk);
        
        // ✅ Calculer l'axe AVANT d'appeler determinerSociete
        let axe = 'A3';
        if (pk !== null && !isNaN(pk)) {
            // Détecter l'axe via les tronçons configurés (dynamique)
            let axeTrouve = null;
            if (window.TRONCONS) {
                for (const [tId, info] of Object.entries(window.TRONCONS)) {
                    if (pk >= parseInt(info.min) && pk <= parseInt(info.max)) {
                        axeTrouve = info.axe;
                        break;
                    }
                }
            }
            if (axeTrouve) {
                axe = axeTrouve;
            } else {
                // Fallback (ancien comportement)
                if (pk >= 0 && pk <= 13000) axe = 'A301';
                else if (pk >= 27000 && pk <= 430000) axe = 'A3';
            }
        }
        nouvelle['_axe'] = axe;
        
        // ✅ Maintenant determinerSociete reçoit l'axe CORRECT
        const datePourSociete = ligne['Date prise en charge'] || ligne['Date et heure accident'];
        nouvelle['_societe'] = determinerSociete(pk, axe, datePourSociete);

      
        
        // حساب المصابين
        const tuesUsager = parseInt(ligne['Nbr Tués Usagers'] || 0);
        const tuesPietonUsager = parseInt(ligne['Nbr Tués Piéton Usager'] || 0);
        const tuesPietonVagabond = parseInt(ligne['Nbr Tués Piéton Vagabond'] || 0);
        const tuesPietonRiverain = parseInt(ligne['Nbr Tués Piéton Riverain'] || 0);
        const tuesPietonIntervention = parseInt(ligne['Nbr Tués Piéton Pers. D\'intervention'] || 0);
        nouvelle['_total_tues'] = tuesUsager + tuesPietonUsager + tuesPietonVagabond + tuesPietonRiverain + tuesPietonIntervention;
        
        const bgUsager = parseInt(ligne['Nbr BG Usagers'] || 0);
        const bgPietonUsager = parseInt(ligne['Nbr BG Piéton Usager'] || 0);
        const bgPietonVagabond = parseInt(ligne['Nbr BG Piéton Vagabond'] || 0);
        const bgPietonRiverain = parseInt(ligne['Nbr BG Piéton Riverain'] || 0);
        const bgPietonIntervention = parseInt(ligne['Nbr BG Piéton Pers. D\'intervention'] || 0);
        nouvelle['_total_bg'] = bgUsager + bgPietonUsager + bgPietonVagabond + bgPietonRiverain + bgPietonIntervention;
        
        const blUsager = parseInt(ligne['Nbr BL Usagers'] || 0);
        const blPietonUsager = parseInt(ligne['Nbr BL Piéton Usager'] || 0);
        const blPietonVagabond = parseInt(ligne['Nbr BL Piéton Vagabond'] || 0);
        const blPietonRiverain = parseInt(ligne['Nbr BL Piéton Riverain'] || 0);
        const blPietonIntervention = parseInt(ligne['Nbr BL Piéton Pers. D\'intervention'] || 0);
        nouvelle['_total_bl'] = blUsager + blPietonUsager + blPietonVagabond + blPietonRiverain + blPietonIntervention;
        nouvelle['_total_blesses'] = nouvelle['_total_bg'] + nouvelle['_total_bl'];
        
        const datePriseEnCharge = ligne['Date prise en charge'] || ligne['Date et heure accident'];
        nouvelle['_mois'] = obtenirMois(datePriseEnCharge);
        nouvelle['_nom_mois'] = obtenirNomMois(datePriseEnCharge);
        
        const dateHeureAccident = ligne['Date et heure accident'];
        if (dateHeureAccident) {
            const heureAccident = extraireHeure(dateHeureAccident);
            if (heureAccident) {
                nouvelle['_heure_accident'] = heureAccident;
                const parts = heureAccident.split(':');
                const h = parseInt(parts[0]);
                if (!isNaN(h)) {
                    if (h >= 6 && h < 12) nouvelle['_periode'] = 'Matin';
                    else if (h >= 12 && h < 18) nouvelle['_periode'] = 'Midi';
                    else if (h >= 18 && h < 24) nouvelle['_periode'] = 'Soir';
                    else nouvelle['_periode'] = 'Nuit';
                }
            }
        }
        // ====== ✅ أضف هذا القسم هنا ======
                // استخراج يوم الأسبوع (محسّن)
                try {
                    let dateObj = null;
                    let dateStr = String(dateHeureAccident).trim();
                    
                    // تنسيق "03-01-2026 02:10"
                    let match = dateStr.match(/(\d{2})-(\d{2})-(\d{4})/);
                    if (match) {
                        const jour = parseInt(match[1]);
                        const mois = parseInt(match[2]) - 1;
                        const annee = parseInt(match[3]);
                        dateObj = new Date(annee, mois, jour);
                    }
                    
                    // تنسيق "03/01/2026 02:10"
                    if (!dateObj || isNaN(dateObj)) {
                        match = dateStr.match(/(\d{2})\/(\d{2})\/(\d{4})/);
                        if (match) {
                            const jour = parseInt(match[1]);
                            const mois = parseInt(match[2]) - 1;
                            const annee = parseInt(match[3]);
                            dateObj = new Date(annee, mois, jour);
                        }
                    }
                    
                    // محاولة مباشرة
                    if (!dateObj || isNaN(dateObj)) {
                        dateObj = new Date(dateStr);
                    }
                    
                    if (dateObj && !isNaN(dateObj)) {
                        const jours = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
                        nouvelle['_jour_semaine'] = jours[dateObj.getDay()];
                    }
                } catch(e) {
            }
        // ====== ✅ أضف هذا القسم هنا ======
        // استخراج يوم الأسبوع
        try {
            const dateObj = new Date(dateHeureAccident);
            if (!isNaN(dateObj)) {
                const jours = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
                nouvelle['_jour_semaine'] = jours[dateObj.getDay()];
            }
        } catch(e) {}
        // ====== نهاية الإضافة ======
        
        // فروقات التوقيت
      // فروقات التوقيت
        const dateHeureAccidentComplet = ligne['Date et heure accident'];
        if (dateHeureAccidentComplet) {
            const dateHeurePatrouilleur = ligne["Arrivée de l'agent de l'assistance"];
            if (dateHeurePatrouilleur && dateHeurePatrouilleur !== '--' && dateHeurePatrouilleur !== '-') {
                nouvelle['_delai_patrouilleur'] = calculerDifferenceTemps(dateHeureAccidentComplet, dateHeurePatrouilleur);
            }
            const dateHeureGR = ligne['Arrivée Gendarmerie Royale'];
            if (dateHeureGR && dateHeureGR !== '--' && dateHeureGR !== '-') {
                nouvelle['_delai_gr'] = calculerDifferenceTemps(dateHeureAccidentComplet, dateHeureGR);
            }
            const dateHeurePC = ligne['Arrivée Ambulance'];
            if (dateHeurePC && dateHeurePC !== '--' && dateHeurePC !== '-') {
                nouvelle['_delai_pc'] = calculerDifferenceTemps(dateHeureAccidentComplet, dateHeurePC);
            }
            const dateHeureDepannage = ligne['Arrivée Dépannage'];
            if (dateHeureDepannage && dateHeureDepannage !== '--' && dateHeureDepannage !== '-') {
                nouvelle['_delai_depannage'] = calculerDifferenceTemps(dateHeureAccidentComplet, dateHeureDepannage);
            }
            // 🆕 FOURGON MORTELLE
            const dateHeureFourgon = ligne['Arrivée Fourgon Mortuaire'];
            if (dateHeureFourgon && dateHeureFourgon !== '--' && dateHeureFourgon !== '-') {
                nouvelle['_delai_fourgon'] = calculerDifferenceTemps(dateHeureAccidentComplet, dateHeureFourgon);
            }
        }
        
       if (ligne['Catégorie']) {
            const cat = ligne['Catégorie'].toLowerCase();
            // PL إذا كان يحتوي على pl أو autocar
            if (cat.includes('pl') || cat.includes('autocar')) {
                nouvelle['_type_vehicule'] = 'PL';
            } else {
                nouvelle['_type_vehicule'] = 'VL';
            }
        }
        return nouvelle;
    });
    return resultats;
}

// ============================================================
// 4. SAUVEGARDE / CHARGEMENT
// ============================================================

function sauvegarderDonnees(donnees) {
    if (!donnees || donnees.length === 0) return;
    
    // ✅ Sauvegarder dans IndexedDB (sans limite de taille)
    sauvegarderIndexedDB(donnees);
    
    // ✅ Essayer aussi localStorage avec colonnes réduites
    try {
        // Ne garder que les colonnes essentielles
        var donneesReduites = donnees.map(function(d) {
            var reduced = {};
            var colonnesGardees = [
                'Ticket', 'Date prise en charge', 'Heure prise en charge2',
                'Sens', 'PK', 'Gravité accident', 'Catégorie',
                'GravitéZACC',
                'Nbr Tués Usagers', 'Nbr BG Usagers', 'Nbr BL Usagers',
                'Nbr Tués Piéton Usager', 'Nbr BG Piéton Usager', 'Nbr BL Piéton Usager',
                'Nbr Tués Piéton Vagabond', 'Nbr BG Piéton Vagabond', 'Nbr BL Piéton Vagabond',
                'Nbr Tués Piéton Riverain', 'Nbr BG Piéton Riverain', 'Nbr BL Piéton Riverain',
                'Nbr Tués Piéton Pers. D\'intervention', 'Nbr BG Piéton Pers. D\'intervention', 'Nbr BL Piéton Pers. D\'intervention',
                '_pk_num', '_troncon', '_societe', '_axe', '_mois', '_nom_mois',
                '_total_tues', '_total_bg', '_total_bl', '_total_blesses',
                '_direction', '_heure_accident', '_periode', '_jour_semaine',
                '_type_vehicule', '_delai_patrouilleur', '_delai_gr', '_delai_pc', '_delai_depannage',
                '_source_fichier'
            ];
            colonnesGardees.forEach(function(col) {
                if (d[col] !== undefined) reduced[col] = d[col];
            });
            return reduced;
        });
        
        localStorage.setItem('accidentsData', JSON.stringify(donneesReduites));
        console.log('💾 Données sauvegardées dans localStorage et IndexedDB');
    } catch(e) {
        console.warn('⚠️ localStorage plein, mais IndexedDB a tout');
    }
}


function chargerDonnees() {
    try {
        const data = localStorage.getItem('accidentsData');
        if (data) {
            const donnees = JSON.parse(data);
            if (donnees && donnees.length > 0) {
                console.log('📂 Données chargées (', donnees.length, 'lignes)');
                return donnees;
            }
        }
    } catch(e) { localStorage.removeItem('accidentsData'); }
    return null;
}

async function restaurerDonnees() {
    console.log('🔄 Restauration des données...');
    
    // ✅ Essayer IndexedDB d'abord (données complètes)
    var donnees = await chargerIndexedDB();
    
    // ✅ Si pas trouvé, essayer localStorage
    if (!donnees || donnees.length === 0) {
        console.log('📂 IndexedDB vide, essai localStorage...');
        donnees = chargerDonnees();
    }
    
    if (!donnees || donnees.length === 0) {
        console.log('📭 Aucune donnée sauvegardée');
        return false;
    }
    
    toutesLesDonnees = donnees;
    console.log('✅ Données restaurées:', toutesLesDonnees.length, 'lignes');
    
    // ✅ Vérifier que les données sont enrichies
    if (!toutesLesDonnees[0] || !toutesLesDonnees[0]['_troncon']) {
        toutesLesDonnees = enrichirDonnees(toutesLesDonnees);
        await sauvegarderIndexedDB(toutesLesDonnees);
    }
    
    return true;
}

// ============================================================
// 5. CHARGEMENT DES FICHIERS
// ============================================================

function ouvrirSelectionFichiers() {
    const choix = confirm('🔽 Choisissez une option :\n\n✅ "OK" pour sélectionner un dossier complet\n❌ "Annuler" pour sélectionner des fichiers individuels');
    if (choix) {
        const input = document.createElement('input');
        input.type = 'file';
        input.webkitdirectory = true;
        input.multiple = true;
        input.accept = '.xlsx,.xls';
        input.onchange = function(e) {
            if (e.target.files.length > 0) {
                traiterDossier(e.target.files);
            }
        };
        input.click();
    } else {
        document.getElementById('fileInput').click();
    }
}

document.getElementById('fileInput').addEventListener('change', function(e) {
    const fichiers = e.target.files;
    if (fichiers.length === 0) return;
    document.getElementById('fileList').innerHTML = '';
    Array.from(fichiers).forEach(f => {
        const tag = document.createElement('span');
        tag.className = 'file-tag';
        tag.textContent = '📄 ' + f.name;
        document.getElementById('fileList').appendChild(tag);
    });
    document.getElementById('fileStatus').textContent = '📥 ' + fichiers.length + ' fichier(s) chargé(s)...';
    let traites = 0;
    toutesLesDonnees = [];
    Array.from(fichiers).forEach(fichier => {
        const reader = new FileReader();
        reader.onload = function(event) {
            try {
                const data = new Uint8Array(event.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const premiereFeuille = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(premiereFeuille);
                jsonData.forEach(ligne => ligne['_source_fichier'] = fichier.name);
                toutesLesDonnees = toutesLesDonnees.concat(jsonData);
                traites++;
                if (traites === fichiers.length) {
                    finaliserChargement(toutesLesDonnees, fichiers.length);
                }
            } catch (error) {
                console.error('Erreur:', error);
                document.getElementById('fileStatus').textContent = '❌ Erreur: ' + error.message;
            }
        };
        reader.readAsArrayBuffer(fichier);
    });
});

function traiterDossier(fichiers) {
    document.getElementById('fileList').innerHTML = '';
    let toutesLesDonneesTemp = [];
    let fichiersExcel = 0, fichiersLus = 0, erreurs = 0;
    Array.from(fichiers).forEach(fichier => {
        const extension = fichier.name.split('.').pop().toLowerCase();
        if (extension !== 'xlsx' && extension !== 'xls') return;
        fichiersExcel++;
        const tag = document.createElement('span');
        tag.className = 'file-tag';
        tag.textContent = '📄 ' + fichier.name;
        document.getElementById('fileList').appendChild(tag);
        const reader = new FileReader();
        reader.onload = function(event) {
            try {
                const data = new Uint8Array(event.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const premiereFeuille = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(premiereFeuille);
                jsonData.forEach(ligne => ligne['_source_fichier'] = fichier.name);
                toutesLesDonneesTemp = toutesLesDonneesTemp.concat(jsonData);
                fichiersLus++;
                console.log('✅ Fichier lu:', fichier.name, '(', jsonData.length, 'lignes)');
                if (fichiersLus + erreurs === fichiersExcel && toutesLesDonneesTemp.length > 0) {
                    finaliserChargement(toutesLesDonneesTemp, fichiersExcel);
                }
            } catch (error) {
                console.error('❌ Erreur:', fichier.name, error);
                erreurs++;
                fichiersLus++;
                if (fichiersLus + erreurs === fichiersExcel && toutesLesDonneesTemp.length === 0) {
                    document.getElementById('fileStatus').textContent = '❌ Erreur lors du chargement';
                    document.getElementById('fileStatus').style.color = '#e74c3c';
                }
            }
        };
        reader.readAsArrayBuffer(fichier);
    });
    if (fichiersExcel === 0) {
        document.getElementById('fileStatus').textContent = '⚠️ Aucun fichier Excel trouvé';
        document.getElementById('fileStatus').style.color = '#e74c3c';
    } else {
        document.getElementById('fileStatus').textContent = '📥 ' + fichiersExcel + ' fichier(s) trouvé(s)...';
        document.getElementById('fileStatus').style.color = '#f39c12';
    }
}

function finaliserChargement(donnees, nombreFichiers) {
    if (donnees.length === 0) {
        document.getElementById('fileStatus').textContent = '⚠️ Aucune donnée valide';
        document.getElementById('fileStatus').style.color = '#e74c3c';
        return;
    }
    
    toutesLesDonnees = donnees;
    toutesLesDonnees = enrichirDonnees(toutesLesDonnees);
    
    // ✅ حفظ البيانات في localStorage
    sauvegarderDonnees(toutesLesDonnees);
    
    document.getElementById('fileStatus').textContent = '✅ ' + toutesLesDonnees.length + ' accidents chargés (' + nombreFichiers + ' fichiers)';
    document.getElementById('fileStatus').style.color = '#27ae60';
    const memoryStatus = document.getElementById('memoryStatus');
    if (memoryStatus) {
        memoryStatus.textContent = '💾 ' + toutesLesDonnees.length + ' lignes en mémoire';
        memoryStatus.style.color = '#27ae60';
        memoryStatus.style.background = '#e8f8f0';
    }
    
    // ✅ تحديث جميع الأقسام
    reinitialiserTout();
}

async function effacerDonneesEtReinitialiser() {
    if (!confirm('Voulez-vous vraiment effacer toutes les données ?')) return;
    
    // ✅ Supprimer de localStorage
    localStorage.removeItem('accidentsData');
    
    // ✅ Supprimer de IndexedDB (principal)
    await supprimerIndexedDB();
    
    // ✅ Supprimer de IndexedDB (ZACC)
    await supprimerZACCIndexedDB();
    
    // ✅ Réinitialiser ZACC
    if (typeof ZACC !== 'undefined') {
        ZACC.donnees = [];
        document.getElementById('zaccFileStatus').textContent = 'Aucun fichier';
        document.getElementById('zaccFileStatus').style.color = '#999';
    }
    
    toutesLesDonnees = [];
    donneesFiltrees = [];
    document.getElementById('fileStatus').textContent = '🗑️ Données effacées';
    document.getElementById('fileList').innerHTML = '';
    const memoryStatus = document.getElementById('memoryStatus');
    if (memoryStatus) {
        memoryStatus.textContent = '💾 Mémoire: Aucune donnée';
        memoryStatus.style.color = '#999';
        memoryStatus.style.background = '#f5f8fa';
    }
    reinitialiserTout();
    
    if (typeof Rapprochement !== 'undefined' && Rapprochement.reinitialiser) {
        Rapprochement.reinitialiser();
    }
}

// ============================================================
// 6. SECTION ANALYSE (مستقلة)
// ============================================================

const Analyse = {
    chartGravite: null,
    chartVictimes: null,
    chartTroncons: null,
    pkTooltipTimer: null,
    
    // تهيئة القسم
    init: function() {
        mettreAJourAnneeLabel();
        
        // ✅ Vérification : si window.TRONCONS est vide, restaurer depuis Parametres
        if ((!window.TRONCONS || Object.keys(window.TRONCONS).length === 0) 
            && typeof Parametres !== 'undefined' && Parametres.mettreAJourConstantes) {
            console.log('🔄 [Analyse.init] Restauration de window.TRONCONS...');
            Parametres.mettreAJourConstantes();
        }
        
        this.mettreAJourFiltres();
        this.appliquerFiltres();
    },
    
    // ====== تحديث قوائم الفلاتر ======
     mettreAJourFiltres: function() {
        // ✅ Mettre à jour le label de l'année
        mettreAJourAnneeLabel();
        
        // ✅ CORRECTION : utiliser les BONS IDs (analyse*, pas graph*)
        const selectTroncon = document.getElementById('analyseTronconFilter');
        const selectMois = document.getElementById('analyseMoisFilter');
        
        if (!selectTroncon || !selectMois) return;
        
        // Sauvegarder les sélections actuelles
        const selectedTroncon = Array.from(selectTroncon.selectedOptions).map(opt => opt.value);
        const selectedMois = Array.from(selectMois.selectedOptions).map(opt => opt.value);
        
        // ---- Tronçons dynamiques ----
        selectTroncon.innerHTML = '<option value="all">Tous les tronçons</option>';
        getTronconsActifs().forEach(t => {
            const opt = document.createElement('option');
            opt.value = t;
            opt.textContent = t + ' (' + getPkRangeDynamique(t) + ')';
            selectTroncon.appendChild(opt);
        });
        
        // Restaurer les sélections
        Array.from(selectTroncon.options).forEach(opt => {
            if (selectedTroncon.includes(opt.value)) opt.selected = true;
        });
        if (selectTroncon.selectedOptions.length === 0) {
            selectTroncon.querySelector('option[value="all"]').selected = true;
        }
        
        // ---- Mois ----
        const moisExistants = new Set();
        toutesLesDonnees.forEach(d => {
            if (d['_mois'] && d['_mois'] >= 1 && d['_mois'] <= 12) {
                moisExistants.add(d['_mois']);
            }
        });
        
        selectMois.innerHTML = '<option value="all">Tous les mois</option>';
        const moisNoms = ['Janvier','Février','Mars','Avril','Mai','Juin',
                          'Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
        Array.from(moisExistants).sort((a,b) => a-b).forEach(m => {
            const opt = document.createElement('option');
            opt.value = m;
            opt.textContent = moisNoms[m - 1];
            selectMois.appendChild(opt);
        });
        
        Array.from(selectMois.options).forEach(opt => {
            if (selectedMois.includes(opt.value)) opt.selected = true;
        });
        if (selectMois.selectedOptions.length === 0) {
            selectMois.querySelector('option[value="all"]').selected = true;
        }
    },
    // ====== تطبيق الفلاتر (مع دعم التحديدات المتعددة) ======
    appliquerFiltres: function() {
        const tronconSelect = document.getElementById('analyseTronconFilter');
        const moisSelect = document.getElementById('analyseMoisFilter');
        
        // ✅ قراءة جميع القيم المحددة (وليس قيمة واحدة)
        const tronconValues = Array.from(tronconSelect.selectedOptions).map(opt => opt.value);
        const moisValues = Array.from(moisSelect.selectedOptions).map(opt => opt.value);
        
        // التحقق من وجود "all"
        const tronconAll = tronconValues.includes('all');
        const moisAll = moisValues.includes('all');
        
        console.log('🔍 Analyse - Tronçons sélectionnés:', tronconValues);
        console.log('🔍 Analyse - Mois sélectionnés:', moisValues);
        
        // تصفية البيانات
        donneesFiltrees = toutesLesDonnees.filter(d => {
            // فلتر المقاطع
            if (!tronconAll && !tronconValues.includes(d['_troncon'])) {
                return false;
            }
            // فلتر الأشهر
            if (!moisAll && !moisValues.includes(String(d['_mois']))) {
                return false;
            }
            return true;
        });
        
        console.log('📊 Analyse - Données après filtrage:', donneesFiltrees.length);
        
        // تحديث الجدول والرسومات
        this.mettreAJourTableau();
        this.mettreAJourGraphiques();
    },
        // ====== إعادة تعيين فلاتر Analyse فقط ======
    reinitialiserFiltres: function() {
        console.log('🔄 Analyse - Réinitialisation des filtres...');
        
        const tronconSelect = document.getElementById('analyseTronconFilter');
        const moisSelect = document.getElementById('analyseMoisFilter');
        
        // ✅ إعادة تعيين فلاتر Analyse فقط
        if (tronconSelect) {
            // تحديد "all" فقط
            Array.from(tronconSelect.options).forEach(opt => {
                opt.selected = (opt.value === 'all');
            });
        }
        if (moisSelect) {
            Array.from(moisSelect.options).forEach(opt => {
                opt.selected = (opt.value === 'all');
            });
        }
        
        // تطبيق الفلاتر
        this.appliquerFiltres();
    },
    // ====== ✅ أضف هذه الدالة هنا ======
    reinitialiserFiltresPK: function() {
        console.log('🔄 Analyse - Réinitialisation des filtres PK...');
        
        const elTues = document.getElementById('filterTues');
        const elBG = document.getElementById('filterBG');
        const elBL = document.getElementById('filterBL');
        
        if (elTues) elTues.checked = true;
        if (elBG) elBG.checked = true;
        if (elBL) elBL.checked = true;
        
        // إعادة رسم PK
        const donnees = donneesFiltrees.length > 0 ? donneesFiltrees : toutesLesDonnees;
        this.dessinerPK(donnees);
    },
    
    mettreAJourTableau: function() {
        const container = document.getElementById('analyseTable');
        if (!container) return;
        
        const tronconSelect = document.getElementById('analyseTronconFilter');
        const moisSelect = document.getElementById('analyseMoisFilter');
        const tronconFiltre = tronconSelect ? tronconSelect.value : 'all';
        const moisFiltre = moisSelect ? moisSelect.value : 'all';
        
        const tousLesTroncons = getTronconsActifs();  
        const resultats = {};
        tousLesTroncons.forEach(t => {
            resultats[t] = { corporelle: 0, materielle: 0, mortelle: 0, total: 0, tues: 0, bg: 0, bl: 0 };
        });
        
        donneesFiltrees.forEach(d => {
            const t = d['_troncon'];
            if (t && t in resultats) {
                resultats[t].total++;
                const gravite = d['Gravité accident'];
                if (gravite === 'Corporelle') resultats[t].corporelle++;
                else if (gravite === 'Matérielle') resultats[t].materielle++;
                else if (gravite === 'Mortelle') resultats[t].mortelle++;
                resultats[t].tues += parseInt(d['_total_tues'] || 0);
                resultats[t].bg += parseInt(d['_total_bg'] || 0);
                resultats[t].bl += parseInt(d['_total_bl'] || 0);
            }
        });
        
        let totalCorp = 0, totalMat = 0, totalMort = 0, totalAcc = 0, totalTues = 0, totalBG = 0, totalBL = 0;
        let html = '<table><thead><tr><th>Tronçon</th><th>Entre PK et PK</th><th>Corporelle</th><th>Matérielle</th><th>Mortelle</th><th>Total ACC</th><th>Nbr Tués</th><th>Nbr BG</th><th>Nbr BL</th></tr></thead><tbody>';
        tousLesTroncons.forEach(t => {
            const d = resultats[t];
            totalCorp += d.corporelle; totalMat += d.materielle; totalMort += d.mortelle;
            totalAcc += d.total; totalTues += d.tues; totalBG += d.bg; totalBL += d.bl;
            const range = getPkRange(t);
            const isFiltered = (tronconFiltre === t);
            const rowClass = isFiltered ? 'filtered-row' : '';
            html += `<tr class="${rowClass}"><td><strong>${t}</strong></td><td>${range}</td><td>${d.corporelle}</td><td>${d.materielle}</td><td>${d.mortelle}</td><td><strong>${d.total}</strong></td><td>${d.tues}</td><td>${d.bg}</td><td>${d.bl}</td></tr>`;
        });
        html += `<tr class="total-row"><td colspan="2"><strong>Total</strong></td><td><strong>${totalCorp}</strong></td><td><strong>${totalMat}</strong></td><td><strong>${totalMort}</strong></td><td><strong>${totalAcc}</strong></td><td><strong>${totalTues}</strong></td><td><strong>${totalBG}</strong></td><td><strong>${totalBL}</strong></td></tr></tbody></table>`;
        
        const moisNom = moisFiltre !== 'all' ? obtenirNomMois(new Date(2026, parseInt(moisFiltre)-1, 1)) : 'Tous les mois';
        const tronconNom = tronconFiltre !== 'all' ? tronconFiltre : 'Tous les tronçons';
        html = `<div style="padding:12px 16px;background:#f0f8ff;border-radius:10px;margin-bottom:15px;display:flex;justify-content:space-between;flex-wrap:wrap;gap:10px;">
            <span><strong>📅 Mois :</strong> ${moisNom}</span>
            <span><strong>📍 Tronçon :</strong> ${tronconNom}</span>
            <span><strong>📊 Total accidents :</strong> ${donneesFiltrees.length}</span>
        </div>` + html;
        container.innerHTML = html;
    },
    
    mettreAJourGraphiques: function() {
        const donnees = donneesFiltrees.length > 0 ? donneesFiltrees : toutesLesDonnees;
        if (donnees.length === 0) return;
        const resultats = this.calculerResultats(donnees);
        this.dessinerGravite(resultats);
        this.dessinerVictimes(resultats);
        this.dessinerTroncons(resultats);
        this.dessinerPK(donnees);  // ← تأكد من وجود هذا السطر
    },
    
    calculerResultats: function(donnees) {
        const tousLesTroncons = getTronconsActifs();
        const resultats = {};
        tousLesTroncons.forEach(t => {
            resultats[t] = { corporelle: 0, materielle: 0, mortelle: 0, total: 0, tues: 0, bg: 0, bl: 0 };
        });
        
        donnees.forEach(d => {
            const t = d['_troncon'];
            if (t && t in resultats) {
                resultats[t].total++;
                const gravite = d['Gravité accident'];
                if (gravite === 'Corporelle') resultats[t].corporelle++;
                else if (gravite === 'Matérielle') resultats[t].materielle++;
                else if (gravite === 'Mortelle') resultats[t].mortelle++;
                resultats[t].tues += parseInt(d['_total_tues'] || 0);
                resultats[t].bg   += parseInt(d['_total_bg']   || 0);
                resultats[t].bl   += parseInt(d['_total_bl']   || 0);
            }
        });
        
        return resultats;
    },
    
    dessinerGravite: function(resultats) {
        const canvas = document.getElementById('chartAnalyseGravite');
        if (!canvas) return;
        if (this.chartGravite) { this.chartGravite.destroy(); this.chartGravite = null; }
        
        const troncons = getTronconsActifs();
        const sum = (key) => troncons.reduce((acc, t) => acc + ((resultats[t] && resultats[t][key]) || 0), 0);
        const data = [sum('corporelle'), sum('materielle'), sum('mortelle')];
        
        if (data.every(d => d === 0)) return;
        this.chartGravite = new Chart(canvas, {
            type: 'doughnut',
            data: {
                labels: ['Corporelle', 'Matérielle', 'Mortelle'],
                datasets: [{ data: data, backgroundColor: ['#e67e22', '#3498db', '#e74c3c'], borderWidth: 2, borderColor: '#fff' }]
            },
            options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
        });
    },
    
   dessinerVictimes: function(resultats) {
        const canvas = document.getElementById('chartAnalyseVictimes');
        if (!canvas) return;
        if (this.chartVictimes) { this.chartVictimes.destroy(); this.chartVictimes = null; }
        
        const troncons = getTronconsActifs();
        const sum = (key) => troncons.reduce((acc, t) => acc + ((resultats[t] && resultats[t][key]) || 0), 0);
        const data = [sum('tues'), sum('bg'), sum('bl')];
        
        if (data.every(d => d === 0)) return;
        this.chartVictimes = new Chart(canvas, {
            type: 'doughnut',
            data: {
                labels: ['Tués', 'BG', 'BL'],
                datasets: [{ data: data, backgroundColor: ['#c0392b', '#e67e22', '#2ecc71'], borderWidth: 2, borderColor: '#fff' }]
            },
            options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
        });
    },
    
    dessinerTroncons: function(resultats) {
        const canvas = document.getElementById('chartAnalyseTroncons');
        if (!canvas) return;
        if (this.chartTroncons) { this.chartTroncons.destroy(); this.chartTroncons = null; }
        
        const labels = getTronconsActifs();
        const dataCorp = labels.map(t => (resultats[t] && resultats[t].corporelle) || 0);
        const dataMat  = labels.map(t => (resultats[t] && resultats[t].materielle) || 0);
        const dataMort = labels.map(t => (resultats[t] && resultats[t].mortelle) || 0);
        
        if (dataCorp.every(d => d === 0) && dataMat.every(d => d === 0) && dataMort.every(d => d === 0)) return;
        
        this.chartTroncons = new Chart(canvas, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    { label: 'Corporelle', data: dataCorp, backgroundColor: '#e67e22', borderRadius: 4 },
                    { label: 'Matérielle', data: dataMat, backgroundColor: '#3498db', borderRadius: 4 },
                    { label: 'Mortelle', data: dataMort, backgroundColor: '#e74c3c', borderRadius: 4 }
                ]
            },
            options: {
                responsive: true,
                plugins: { legend: { position: 'top' } },
                scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
            }
        });
    },
    
    dessinerPK: function(donnees) {
        console.log('📈 ===== Dessin PK dynamique =====');
        const container = document.getElementById('pkChartContainer');
        if (!container) {
            console.warn('⚠️ #pkChartContainer introuvable');
            return;
        }
        
        if (!donnees || donnees.length === 0) {
            container.innerHTML = '<div style="text-align:center;color:#999;padding:40px;">📭 Aucune donnée</div>';
            return;
        }
        
        const showTues = document.getElementById('filterTues')?.checked ?? true;
        const showBG   = document.getElementById('filterBG')?.checked   ?? true;
        const showBL   = document.getElementById('filterBL')?.checked   ?? true;
        
        // ===== 1. Grouper les tronçons par axe =====
        const troncons = getTronconsActifs();
        const parAxe = {};
        troncons.forEach(tId => {
            const info = window.TRONCONS && window.TRONCONS[tId];
            if (!info) return;
            const axe = info.axe || 'A3';
            const pkMin = parseInt(info.min);
            const pkMax = parseInt(info.max);
            if (isNaN(pkMin) || isNaN(pkMax)) return;
            
            if (!parAxe[axe]) parAxe[axe] = { troncons: [], min: Infinity, max: -Infinity };
            parAxe[axe].troncons.push({ id: tId, min: pkMin, max: pkMax });
            if (pkMin < parAxe[axe].min) parAxe[axe].min = pkMin;
            if (pkMax > parAxe[axe].max) parAxe[axe].max = pkMax;
        });
        
        // Trier les tronçons par pk_min
        Object.values(parAxe).forEach(a => a.troncons.sort((x, y) => x.min - y.min));
        
        // ===== 2. Générer le HTML dynamiquement =====
        let html = '';
        let top = 10;
        const axesList = Object.keys(parAxe);
        
        axesList.forEach((axeName, axeIdx) => {
            const axeData = parAxe[axeName];
            const range = (axeData.max - axeData.min) || 1;
            
            // Titre de l'axe
            html += `<div style="position:absolute; top:${top}px; left:40px; font-size:12px; color:#1a3a5c; font-weight:bold; background:#e8f0f8; padding:2px 8px; border-radius:6px; z-index:6;">🛣️ ${axeName}</div>`;
            top += 22;
            
            // ===== Labels PK au-dessus des barres (début, frontières, fin) =====
                   // ===== Labels PK au-dessus des barres (début, frontières, fin) =====
            html += `<div style="position:absolute; top:${top}px; left:40px; right:40px; height:16px; font-size:10px; color:#0861df; font-weight:600;">`;
            
            // Début du premier tronçon
            html += `<span style="position:absolute; left:0%; transform:translateX(-50%); white-space:nowrap; color:#2d7db8; font-weight:700;">PK ${formatPKLabel(axeData.min)}</span>`;
            
            // Frontières intermédiaires (fin de chaque tronçon sauf le dernier)
            for (let i = 0; i < axeData.troncons.length - 1; i++) {
                const boundary = axeData.troncons[i].max;
                const posPct = ((boundary - axeData.min) / range) * 100;
                html += `<span style="position:absolute; left:${posPct}%; transform:translateX(-50%); white-space:nowrap; color:#e67e22; font-weight:700;">PK ${formatPKLabel(boundary)}</span>`;
            }
            
            // Fin du dernier tronçon
            html += `<span style="position:absolute; left:100%; transform:translateX(-50%); white-space:nowrap; color:#2d7db8; font-weight:700;">PK ${formatPKLabel(axeData.max)}</span>`;
            
            html += `</div>`;
            top += 20;
            
             // ===== Barre Croissant =====
            // ===== Barre Croissant =====
            html += `<div style="position:absolute; top:${top}px; left:40px; right:40px; height:85px; background:rgba(208,216,224,0.6); border-radius:8px; border:1px solid rgba(176,184,192,0.6); overflow:hidden;">`;
            // Ligne médiane discontinue (effet route)
            html += `<div style="position:absolute; top:50%; left:0; right:0; height:3px; margin-top:-1.5px; background-image:linear-gradient(to right, #fff 50%, transparent 50%); background-size:24px 3px; background-repeat:repeat-x;"></div>`;
            // Lignes verticales aux frontières des tronçons
            for (let i = 0; i < axeData.troncons.length - 1; i++) {
                const boundary = axeData.troncons[i].max;
                const posPct = ((boundary - axeData.min) / range) * 100;
                html += `<div style="position:absolute; left:${posPct}%; top:0; bottom:0; width:1px; background:rgba(45,125,184,0.35);"></div>`;
            }
            html += `</div>`;
            html += `<div style="position:absolute; top:${top - 14}px; left:40px; font-size:11px; color:#2d7db8; font-weight:bold; z-index:6;">⬆️ ${axeName} Croissant</div>`;
            html += `<div id="pkPoints-${axeIdx}-croissant" style="position:absolute; top:${top}px; left:40px; right:40px; height:110px; z-index:5;"></div>`;
            top += 108;
            
            // ===== Barre Décroissant =====
            html += `<div style="position:absolute; top:${top}px; left:40px; right:40px; height:85px; background:rgba(208,216,224,0.6); border-radius:8px; border:1px solid rgba(176,184,192,0.6); overflow:hidden;">`;
            html += `<div style="position:absolute; top:50%; left:0; right:0; height:3px; margin-top:-1.5px; background-image:linear-gradient(to right, #fff 50%, transparent 50%); background-size:24px 3px; background-repeat:repeat-x;"></div>`;
            for (let i = 0; i < axeData.troncons.length - 1; i++) {
                const boundary = axeData.troncons[i].max;
                const posPct = ((boundary - axeData.min) / range) * 100;
                html += `<div style="position:absolute; left:${posPct}%; top:0; bottom:0; width:1px; background:rgba(45,125,184,0.35);"></div>`;
            }
            html += `</div>`;
            html += `<div style="position:absolute; top:${top - 14}px; left:40px; font-size:11px; color:#2d7db8; font-weight:bold; z-index:6;">⬇️ ${axeName} décroissant</div>`;
            html += `<div id="pkPoints-${axeIdx}-decroissant" style="position:absolute; top:${top}px; left:40px; right:40px; height:110px; z-index:5;"></div>`;
            top += 115;
        });
        
        // Légende
        html += `<div style="position:absolute; bottom:4px; right:15px; display:flex; gap:10px; font-size:10px; color:#4a5a6a; background:rgba(255,255,255,0.9); padding:2px 8px; border-radius:6px; border:1px solid #e8ecf2;">
            <span>🔴 Tués</span><span>🟠 BG</span><span>🟢 BL</span>
        </div>`;
        
        // Tooltip
        html += `<div id="pkTooltip" style="display:none; position:absolute; background:white; padding:10px 14px; border-radius:8px; box-shadow:0 4px 20px rgba(0,0,0,0.15); border:1px solid #d0d8e0; font-size:13px; z-index:100; min-width:180px; pointer-events:none;">
            <div id="pkTooltipContent"></div>
        </div>`;
        
        container.innerHTML = html;
        container.style.height = (top + 40) + 'px';
        
        // ===== 3. Placer les points =====
        const dataSource = donneesFiltrees.length > 0 ? donneesFiltrees : toutesLesDonnees;
        let grandTotalCroissant = 0;
        let grandTotalDecroissant = 0;
        
        axesList.forEach((axeName, axeIdx) => {
            const axeData = parAxe[axeName];
            
            const donneesAxe = dataSource.filter(d => {
                const pk = parseInt(d['_pk_num'] || 0);
                return pk >= axeData.min && pk <= axeData.max;
            });
            
            const donneesCroissant = donneesAxe.filter(d => {
                const sens = String(d['Sens'] || '').trim().toLowerCase();
                return sens.includes('croissant') && !sens.includes('décroissant') && !sens.includes('decroissant');
            });
            
            const donneesDecroissant = donneesAxe.filter(d => {
                const sens = String(d['Sens'] || '').trim().toLowerCase();
                return sens.includes('décroissant') || sens.includes('decroissant');
            });
            
            grandTotalCroissant += donneesCroissant.length;
            grandTotalDecroissant += donneesDecroissant.length;
            
            this.genererPointsPK(
                document.getElementById(`pkPoints-${axeIdx}-croissant`),
                donneesCroissant, showTues, showBG, showBL,
                axeData.min, axeData.max
            );
            
            this.genererPointsPK(
                document.getElementById(`pkPoints-${axeIdx}-decroissant`),
                donneesDecroissant, showTues, showBG, showBL,
                axeData.min, axeData.max
            );
        });
        
        // ===== 4. Mettre à jour les stats =====
        const elC = document.getElementById('totalCroissant');
        const elD = document.getElementById('totalDecroissant');
        if (elC) elC.textContent = grandTotalCroissant;
        if (elD) elD.textContent = grandTotalDecroissant;
        
        let totalTues = 0, totalBG = 0, totalBL = 0;
        dataSource.forEach(d => {
            totalTues += parseInt(d['_total_tues'] || 0);
            totalBG   += parseInt(d['_total_bg']   || 0);
            totalBL   += parseInt(d['_total_bl']   || 0);
        });
        
        const elT = document.getElementById('totalTuesPK');
        const elB = document.getElementById('totalBGPK');
        const elL = document.getElementById('totalBLPK');
        const elTot = document.getElementById('totalAccidentsPK');
        if (elT) elT.textContent = totalTues;
        if (elB) elB.textContent = totalBG;
        if (elL) elL.textContent = totalBL;
        if (elTot) elTot.textContent = dataSource.length;
        
        console.log('✅ PK dessiné:', axesList.length, 'axe(s)');
    },
        
    genererPointsPK: function(container, donnees, showTues, showBG, showBL, pkMin, pkMax) {
    if (!container) return 0;
    
            // ✅ Protection contre division par zéro
            const range = (pkMax - pkMin) || 1;
            
            const donneesFiltreesPK = donnees.filter(d => {

            const pk = parseInt(d['_pk_num'] || 0);
            if (!pk || isNaN(pk) || pk < pkMin || pk > pkMax) return false;
            
            const tues = parseInt(d['_total_tues'] || 0);
            const bg = parseInt(d['_total_bg'] || 0);
            const bl = parseInt(d['_total_bl'] || 0);
            
            if (!showTues && !showBG && !showBL) return false;
            let correspond = false;
            if (showTues && tues > 0) correspond = true;
            if (showBG && bg > 0) correspond = true;
            if (showBL && bl > 0) correspond = true;
            return correspond;
        });
        
        if (donneesFiltreesPK.length === 0) {
            container.innerHTML = '<div style="text-align:center;color:#999;padding:5px;font-size:11px;">Pas de PK ici</div>';
            return 0;
        }
        
        const baseTop = 40;
        let html = '';
        
        const pointsParPK = {};
        donneesFiltreesPK.forEach(d => {
            const pk = parseInt(d['_pk_num'] || 0);
            if (!pointsParPK[pk]) pointsParPK[pk] = [];
            pointsParPK[pk].push(d);
        });
        
        Object.keys(pointsParPK).forEach(pkStr => {
            const pk = parseInt(pkStr);
            const accidents = pointsParPK[pkStr];
            const position = ((pk - pkMin) / range) * 100;
            
            accidents.forEach((d, index) => {
                const niveau = index % 3;
                const decalage = (niveau - 1) * 20;
                const topPosition = baseTop + decalage;
                
                const tues = parseInt(d['_total_tues'] || 0);
                const bg = parseInt(d['_total_bg'] || 0);
                const bl = parseInt(d['_total_bl'] || 0);
                
                let couleur = '#3498db';
                let type = 'Matérielle';
                if (tues > 0) { couleur = '#c0392b'; type = 'Mortelle'; }
                else if (bg > 0) { couleur = '#e67e22'; type = 'Corporelle (BG)'; }
                else if (bl > 0) { couleur = '#2ecc71'; type = 'Corporelle (BL)'; }
                
                const totalVictimes = tues + bg + bl;
                // لتكبير حجم الدوائر 6 + Math.min(totalVictimes * 2, 14)	الحجم الحالي (صغير)+8 + Math.min(totalVictimes * 2, 18)	حجم متوسط+10 + Math.min(totalVictimes * 2, 22)	حجم كبير+12 + Math.min(totalVictimes * 2, 26)	حجم كبير جداً
                let taille = 8 + Math.min(totalVictimes * 2, 18);
                
                const date = String(d['Date et heure accident'] || 'N/A').replace(/'/g, "\\'").replace(/"/g, '&quot;');
                const sensTexte = String(d['Sens'] || 'N/A').replace(/'/g, "\\'").replace(/"/g, '&quot;');
                const gravite = String(d['Gravité accident'] || 'N/A').replace(/'/g, "\\'").replace(/"/g, '&quot;');
                const ticket = String(d['Ticket'] || 'N/A').replace(/'/g, "\\'").replace(/"/g, '&quot;');
                
                html += `<div class="pk-point" style="position:absolute; left:${position}%; top:${topPosition}%; transform:translate(-50%, -50%); width:${taille}px; height:${taille}px; background:${couleur}; border-radius:50%; cursor:pointer; border:2px solid white; box-shadow:0 2px 6px rgba(0,0,0,0.2); z-index:5; transition:transform 0.2s, box-shadow 0.2s;" onmouseover="this.style.transform='translate(-50%, -50%) scale(1.4)'; this.style.boxShadow='0 0 0 4px rgba(45,125,184,0.3), 0 4px 15px rgba(0,0,0,0.3)';" onmouseout="this.style.transform='translate(-50%, -50%) scale(1)'; this.style.boxShadow='0 2px 6px rgba(0,0,0,0.2)';" onclick="Analyse.afficherInfoPK(${pk}, '${date}', '${sensTexte}', '${type}', ${tues}, ${bg}, ${bl}, '${gravite}', '${ticket}', event)"></div>`;
            });
        });
        
        container.innerHTML = html;
        return donneesFiltreesPK.length;
    },
    
    afficherInfoPK: function(pk, date, sens, type, tues, bg, bl, gravite, ticket, event) {
        const tooltip = document.getElementById('pkTooltip');
        const content = document.getElementById('pkTooltipContent');
        if (!tooltip || !content) return;
        if (event) event.stopPropagation();
         // ✅ إضافة + قبل آخر ثلاثة أرقام
        function formaterPK(pk) {
            const str = String(pk);
            if (str.length <= 3) return str;
            const debut = str.slice(0, -3);
            const fin = str.slice(-3);
            return debut + '+' + fin;
        }
        const pkFormate = formaterPK(pk);

        content.innerHTML = `
                <div style="font-weight:bold;color:#1a3a5c;border-bottom:1px solid #eef2f7;padding-bottom:6px;margin-bottom:6px;">📍 PK ${pkFormate}</div>
                <div style="display:grid;grid-template-columns:auto 1fr;gap:3px 12px;font-size:12px;">
                    <span style="color:#6b7a8f;">📅 Date:</span><span>${date}</span>
                    <span style="color:#6b7a8f;">📌 Sens:</span><span>${sens}</span>
                    <span style="color:#6b7a8f;">⚠️ Gravité:</span><span>${gravite}</span>
                    <span style="color:#6b7a8f;">🔴 Tués:</span><span>${tues}</span>
                    <span style="color:#6b7a8f;">🟠 BG:</span><span>${bg}</span>
                    <span style="color:#6b7a8f;">🟢 BL:</span><span>${bl}</span>
                    <span style="color:#6b7a8f;">🎫 Ticket:</span><span>${ticket}</span>
                </div>
            `;
            const container = document.getElementById('pkChartContainer');
        if (!container) return;
        const rect = container.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        let left = Math.min(x + 15, rect.width - 210);
        let top = Math.min(y - 10, rect.height - 130);
        if (top < 10) top = 10;
        tooltip.style.left = Math.max(10, left) + 'px';
        tooltip.style.top = Math.max(10, top) + 'px';
        tooltip.style.display = 'block';
        if (this.pkTooltipTimer) { clearTimeout(this.pkTooltipTimer); this.pkTooltipTimer = null; }
        document.removeEventListener('click', this.cacherTooltip);
        document.addEventListener('click', this.cacherTooltip.bind(this));
    },
    
    cacherTooltip: function(event) {
        const tooltip = document.getElementById('pkTooltip');
        const points = document.querySelectorAll('.pk-point');
        let estPoint = false;
        points.forEach(p => {
            if (p.contains(event.target)) estPoint = true;
        });
        if (!estPoint && tooltip) {
            tooltip.style.display = 'none';
            document.removeEventListener('click', this.cacherTooltip);
            if (this.pkTooltipTimer) { clearTimeout(this.pkTooltipTimer); this.pkTooltipTimer = null; }
        }
    }
};

// ============================================================
// SECTION INTERVENANTS (مستقلة تماماً)
// ============================================================

const Intervenants = {
    chart: null,
    donneesFiltrees: [],
    
    // ============================================================
    // Mapping Type → Clé de délai + Label + Emoji
    // ============================================================
    getTypeInfo: function(type) {
        switch(type) {
            case 'patrouilleur': return { cle: '_delai_patrouilleur', label: 'Patrouilleur', emoji: '👮' };
            case 'gr':           return { cle: '_delai_gr',           label: 'GR',           emoji: '🚔' };
            case 'pc':           return { cle: '_delai_pc',           label: 'Protection Civile', emoji: '🚑' };
            case 'fourgon':      return { cle: '_delai_fourgon',      label: 'Fourgon Mortelle', emoji: '⚰️' };
            default:             return { cle: '_delai_gr',           label: 'GR',           emoji: '🚔' };
        }
    },
    
    // ============================================================
    // Mapping Type → Configuration des entités (window.*)
    // ============================================================
    getEntitesPourType: function(type) {
        switch(type) {
            case 'patrouilleur': return window.PATROUILLEURS || [];
            case 'gr':           return window.GENDARMERIE || [];
            case 'pc':           return window.PROTECTION_CIVILE || [];
            case 'fourgon':      return window.FOURGON_MORTELLE || [];
            default:             return [];
        }
    },
    
    // ============================================================
    // INIT
    // ============================================================
    init: function() {
        mettreAJourAnneeLabel();
        this.mettreAJourFiltres();
        this.gererAffichageEntite();
        this.appliquerFiltres();
    },
    
    // ============================================================
    // METTRE À JOUR LES FILTRES
    // ============================================================
    mettreAJourFiltres: function() {
        const selectTroncon = document.getElementById('intervTronconFilter');
        const selectMois = document.getElementById('intervMoisFilter');
        if (!selectTroncon || !selectMois) return;
        
        // Sauvegarder les sélections actuelles
        const selectedTroncon = Array.from(selectTroncon.selectedOptions).map(opt => opt.value);
        const selectedMois = Array.from(selectMois.selectedOptions).map(opt => opt.value);
        
        // ---- Tronçons dynamiques ----
        selectTroncon.innerHTML = '<option value="all">Tous les tronçons</option>';
        getTronconsActifs().forEach(t => {
            const opt = document.createElement('option');
            opt.value = t;
            opt.textContent = t + ' (' + getPkRangeDynamique(t) + ')';
            selectTroncon.appendChild(opt);
        });
        
        Array.from(selectTroncon.options).forEach(opt => {
            if (selectedTroncon.includes(opt.value)) opt.selected = true;
        });
        if (selectTroncon.selectedOptions.length === 0) {
            selectTroncon.querySelector('option[value="all"]').selected = true;
        }
        
        // ---- Mois ----
        const moisExistants = new Set();
        toutesLesDonnees.forEach(d => {
            if (d['_mois'] && d['_mois'] >= 1 && d['_mois'] <= 12) {
                moisExistants.add(d['_mois']);
            }
        });
        
        selectMois.innerHTML = '<option value="all">Tous les mois</option>';
        const moisNoms = ['Janvier','Février','Mars','Avril','Mai','Juin',
                          'Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
        Array.from(moisExistants).sort((a,b) => a-b).forEach(m => {
            const opt = document.createElement('option');
            opt.value = m;
            opt.textContent = moisNoms[m - 1];
            selectMois.appendChild(opt);
        });
        
        Array.from(selectMois.options).forEach(opt => {
            if (selectedMois.includes(opt.value)) opt.selected = true;
        });
        if (selectMois.selectedOptions.length === 0) {
            selectMois.querySelector('option[value="all"]').selected = true;
        }
        
        // ---- Entités (PMA / Patrouilleurs / PC / Fourgon) ----
        this.rafraichirEntites();
    },
    
    // ============================================================
    // 🆕 Rafraîchir la liste des entités selon le Type actif
    // ============================================================
    rafraichirEntites: function() {
        const selectEntite = document.getElementById('intervEntiteFilter');
        const labelEntite = document.getElementById('entiteFilterLabel');
        if (!selectEntite) return;
        
        const type = document.getElementById('intervTypeFilter').value;
        const entites = this.getEntitesPourType(type);
        
        // Mettre à jour le label
        if (labelEntite) {
            switch(type) {
                case 'patrouilleur': labelEntite.textContent = '👮 Patrouille :'; break;
                case 'gr':           labelEntite.textContent = '🚔 PMA :'; break;
                case 'pc':           labelEntite.textContent = '🚑 PC :'; break;
                case 'fourgon':      labelEntite.textContent = '⚰️ Fourgon :'; break;
                default:             labelEntite.textContent = '📋 Entité :'; break;
            }
        }
        
        // Sauvegarder la sélection actuelle
        const valActuelle = selectEntite.value;
        
        // Reconstruire la liste
        selectEntite.innerHTML = '<option value="all">Toutes</option>';
        const noms = new Set();
        entites.forEach(e => {
            if (e.nom) noms.add(e.nom);
        });
        Array.from(noms).sort().forEach(nom => {
            const opt = document.createElement('option');
            opt.value = nom;
            opt.textContent = nom;
            selectEntite.appendChild(opt);
        });
        
        // Restaurer la sélection si elle existe encore
        if (noms.has(valActuelle)) {
            selectEntite.value = valActuelle;
        } else {
            selectEntite.value = 'all';
        }
    },
    
    // ============================================================
    // AFFICHER/MASQUER LE FILTRE ENTITÉ SELON LE TYPE
    // ============================================================
    gererAffichageEntite: function() {
        const type = document.getElementById('intervTypeFilter').value;
        const entiteGroup = document.getElementById('entiteFilterGroup');
        
        if (!entiteGroup) return;
        
        // Types qui ont besoin d'un filtre entité
        const typesAvecEntites = ['patrouilleur', 'gr', 'pc', 'fourgon'];
        
        if (typesAvecEntites.includes(type)) {
            entiteGroup.style.display = 'flex';
            this.rafraichirEntites();
        } else {
            entiteGroup.style.display = 'none';
            const selectEntite = document.getElementById('intervEntiteFilter');
            if (selectEntite) selectEntite.value = 'all';
        }
        
        this.appliquerFiltres();
    },
    
    // ============================================================
    // APPLIQUER LES FILTRES
    // ============================================================
    appliquerFiltres: function() {
        const tronconSelect = document.getElementById('intervTronconFilter');
        const moisSelect = document.getElementById('intervMoisFilter');
        const type = document.getElementById('intervTypeFilter').value;
        const entiteSelect = document.getElementById('intervEntiteFilter');
        const entite = entiteSelect ? entiteSelect.value : 'all';
        
        if (!tronconSelect || !moisSelect) return;
        
        // Lire les sélections multiples
        const tronconValues = Array.from(tronconSelect.selectedOptions).map(opt => opt.value);
        const moisValues = Array.from(moisSelect.selectedOptions).map(opt => opt.value);
        
        const tronconAll = tronconValues.includes('all');
        const moisAll = moisValues.includes('all');
        
        // Filtrer les données
        let donnees = toutesLesDonnees || [];
        donnees = donnees.filter(d => {
            if (!tronconAll && !tronconValues.includes(d['_troncon'])) return false;
            if (!moisAll && !moisValues.includes(String(d['_mois']))) return false;
            return true;
        });
        
        // Filtrer par entité (si sélectionnée)
        if (entite !== 'all' && type !== 'all') {
            const entites = this.getEntitesPourType(type);
            const entiteInfo = entites.find(e => e.nom === entite);
            if (entiteInfo) {
                const pkMin = parseInt(entiteInfo.min);
                const pkMax = parseInt(entiteInfo.max);
                const axeEntite = entiteInfo.axe;
                
                donnees = donnees.filter(d => {
                    const pk = parseInt(d['_pk_num'] || 0);
                    if (pk < pkMin || pk > pkMax) return false;
                    // Vérifier aussi l'axe
                    if (axeEntite) {
                        const info = window.TRONCONS && window.TRONCONS[d['_troncon']];
                        if (info && info.axe && info.axe !== axeEntite) return false;
                    }
                    return true;
                });
            }
        }
        
        this.donneesFiltrees = donnees;
        
        this.mettreAJourStatistiques();
        this.mettreAJourTableau();
        this.mettreAJourGraphique();
    },
    
    // ============================================================
    // RÉINITIALISER LES FILTRES
    // ============================================================
    reinitialiserFiltres: function() {
        const tronconSelect = document.getElementById('intervTronconFilter');
        const moisSelect = document.getElementById('intervMoisFilter');
        const entiteSelect = document.getElementById('intervEntiteFilter');
        const typeSelect = document.getElementById('intervTypeFilter');
        
        if (tronconSelect) {
            Array.from(tronconSelect.options).forEach(opt => {
                opt.selected = (opt.value === 'all');
            });
        }
        if (moisSelect) {
            Array.from(moisSelect.options).forEach(opt => {
                opt.selected = (opt.value === 'all');
            });
        }
        if (entiteSelect) entiteSelect.value = 'all';
        if (typeSelect) typeSelect.value = 'gr';   // ✅ 'gr' existe dans la liste
        
        // Masquer le filtre entité si Type = all
        const entiteGroup = document.getElementById('entiteFilterGroup');
        if (entiteGroup) entiteGroup.style.display = 'flex';
        
        this.rafraichirEntites();
        this.appliquerFiltres();
    },
    
    // ============================================================
    // STATISTIQUES
    // ============================================================
    mettreAJourStatistiques: function() {
        const donnees = this.donneesFiltrees;
        const type = document.getElementById('intervTypeFilter').value;
        const typeInfo = this.getTypeInfo(type);
        const cleDelai = typeInfo.cle;
        
        const delais = donnees.map(d => d[cleDelai]).filter(d => d && d !== '--' && d !== '-');
        
        const elMin = document.getElementById('intervDelaiMin');
        const elMax = document.getElementById('intervDelaiMax');
        const elMoy = document.getElementById('intervDelaiMoyen');
        const elCnt = document.getElementById('intervDelaiCount');
        
        if (delais.length === 0) {
            if (elMin) elMin.textContent = '-';
            if (elMax) elMax.textContent = '-';
            if (elMoy) elMoy.textContent = '-';
            if (elCnt) elCnt.textContent = '0';
            return;
        }
        
        const seuilMax = 6600; // 1:50:00
        const enSecondes = delais.map(t => {
            const parts = t.split(':');
            if (parts.length === 2) return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60;
            else if (parts.length === 3) return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
            return 0;
        }).filter(s => s > 0 && s <= seuilMax);
        
        if (enSecondes.length === 0) {
            if (elMin) elMin.textContent = '-';
            if (elMax) elMax.textContent = '-';
            if (elMoy) elMoy.textContent = '-';
            if (elCnt) elCnt.textContent = '0';
            return;
        }
        
        const min = Math.min(...enSecondes);
        const max = Math.max(...enSecondes);
        const moyenne = enSecondes.reduce((a,b) => a+b, 0) / enSecondes.length;
        
        if (elMin) elMin.textContent = formatTemps(min);
        if (elMax) elMax.textContent = formatTemps(max);
        if (elMoy) elMoy.textContent = formatTemps(moyenne);
        if (elCnt) elCnt.textContent = enSecondes.length;
    },
    
    // ============================================================
    // TABLEAU
    // ============================================================
    mettreAJourTableau: function() {
        const container = document.getElementById('intervenantsTable');
        if (!container) return;
        
        const donnees = this.donneesFiltrees;
        const type = document.getElementById('intervTypeFilter').value;
        const typeInfo = this.getTypeInfo(type);
        const cleDelai = typeInfo.cle;
        const nomColonne = typeInfo.label;
        const emoji = typeInfo.emoji;
        
        if (donnees.length === 0) {
            container.innerHTML = `<div class="status-empty"><h3>📭 Aucune donnée</h3><p>Ajustez les filtres ou chargez des fichiers</p></div>`;
            return;
        }
        
        // Grouper par mois + tronçon
        const parMoisTroncon = {};
        donnees.forEach(d => {
            const mois = d['_nom_mois'] || 'Inconnu';
            const troncon = d['_troncon'] || 'Inconnu';
            const delai = d[cleDelai];
            if (mois === 'Inconnu' || troncon === 'Inconnu' || !delai) return;
            if (!parMoisTroncon[mois]) parMoisTroncon[mois] = {};
            if (!parMoisTroncon[mois][troncon]) parMoisTroncon[mois][troncon] = [];
            parMoisTroncon[mois][troncon].push(delai);
        });
        
        // Calculer les moyennes
        const resultats = {};
        for (const [mois, troncons] of Object.entries(parMoisTroncon)) {
            resultats[mois] = {};
            for (const [troncon, delais] of Object.entries(troncons)) {
                resultats[mois][troncon] = moyenneTemps(delais);
            }
        }
        
        const ordreTroncons = getTronconsActifs();   // ✅ dynamique
        const ordreMois = ['Janvier','Février','Mars','Avril','Mai','Juin',
                           'Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
        
        const moisExistants = Object.keys(resultats).filter(m => m !== 'Inconnu')
            .sort((a, b) => ordreMois.indexOf(a) - ordreMois.indexOf(b));
        
        if (moisExistants.length === 0) {
            container.innerHTML = `<div class="status-empty"><h3>📭 Aucune donnée de délais</h3><p>Pour "${nomColonne}"</p></div>`;
            return;
        }
        
        let html = `<div style="padding:10px 16px;background:#e8f4fd;border-radius:10px;margin-bottom:15px;">
            <span><strong>🛠️ Type :</strong> ${emoji} ${nomColonne}</span>
            <span style="margin-left:20px;"><strong>📊 Total :</strong> ${donnees.length} interventions</span>
        </div>`;
        html += '<table><thead><tr><th>Mois / Catégorie</th>';
        ordreTroncons.forEach(t => html += `<th>${t}</th>`);
        html += '</tr></thead><tbody>';
        
        const totalParTroncon = {};
        ordreTroncons.forEach(t => totalParTroncon[t] = []);
        
        moisExistants.forEach(mois => {
            html += `<tr><td><strong>${mois}</strong></td>`;
            ordreTroncons.forEach(t => {
                const val = resultats[mois]?.[t] || '-';
                if (val !== '-') totalParTroncon[t].push(val);
                html += `<td>${val}</td>`;
            });
            html += '</tr>';
        });
        
        html += `<tr class="total-row"><td><strong>Moyenne Générale</strong></td>`;
        ordreTroncons.forEach(t => {
            const moyenne = moyenneTemps(totalParTroncon[t]);
            html += `<td><strong>${moyenne || '-'}</strong></td>`;
        });
        html += '</tr></tbody></table>';
        container.innerHTML = html;
    },
    
    // ============================================================
    // GRAPHIQUE
    // ============================================================
    mettreAJourGraphique: function() {
        const ctx = document.getElementById('intervChart');
        if (!ctx) return;
        if (this.chart) { this.chart.destroy(); this.chart = null; }
        
        const donnees = this.donneesFiltrees;
        const type = document.getElementById('intervTypeFilter').value;
        
        if (donnees.length === 0) return;
        
        // Grouper les délais par mois pour chaque type
        const parMois = {
            patrouilleur: {},
            gr: {},
            pc: {},
            fourgon: {}
        };
        
        donnees.forEach(d => {
            const mois = d['_nom_mois'] || 'Inconnu';
            if (mois === 'Inconnu') return;
            
            const delaiPat = d['_delai_patrouilleur'];
            if (delaiPat) {
                if (!parMois.patrouilleur[mois]) parMois.patrouilleur[mois] = [];
                parMois.patrouilleur[mois].push(delaiPat);
            }
            
            const delaiGR = d['_delai_gr'];
            if (delaiGR) {
                if (!parMois.gr[mois]) parMois.gr[mois] = [];
                parMois.gr[mois].push(delaiGR);
            }
            
            const delaiPC = d['_delai_pc'];
            if (delaiPC) {
                if (!parMois.pc[mois]) parMois.pc[mois] = [];
                parMois.pc[mois].push(delaiPC);
            }
            
            const delaiFourgon = d['_delai_fourgon'];
            if (delaiFourgon) {
                if (!parMois.fourgon[mois]) parMois.fourgon[mois] = [];
                parMois.fourgon[mois].push(delaiFourgon);
            }
        });
        
        const ordreMois = ['Janvier','Février','Mars','Avril','Mai','Juin',
                        'Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
        
        const moisSet = new Set();
        Object.values(parMois).forEach(obj => {
            Object.keys(obj).forEach(m => moisSet.add(m));
        });
        
        const moisExistants = Array.from(moisSet).filter(m => m !== 'Inconnu')
            .sort((a, b) => ordreMois.indexOf(a) - ordreMois.indexOf(b));
        
        if (moisExistants.length === 0) return;
        
        const labels = moisExistants;
        
        function calculerDonnees(parMoisType) {
            return moisExistants.map(m => {
                const moyenne = moyenneTemps(parMoisType[m]);
                if (!moyenne) return null;
                const parts = moyenne.split(':');
                if (parts.length === 2) return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60;
                else if (parts.length === 3) return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
                return 0;
            });
        }
        
        const datasets = [];
        
        // Patrouilleur (bleu)
        if (type === 'patrouilleur' || type === 'all') {
            datasets.push({
                label: '👮 Patrouilleur',
                data: calculerDonnees(parMois.patrouilleur),
                borderColor: '#2d7db8',
                backgroundColor: 'rgba(45,125,184,0.1)',
                fill: true,
                tension: 0.3,
                pointBackgroundColor: '#1a5f8a',
                pointRadius: 4,
                spanGaps: true
            });
        }
        
        // GR (orange)
        if (type === 'gr' || type === 'all') {
            datasets.push({
                label: '🚔 GR',
                data: calculerDonnees(parMois.gr),
                borderColor: '#e67e22',
                backgroundColor: 'rgba(230,126,34,0.1)',
                fill: true,
                tension: 0.3,
                pointBackgroundColor: '#d35400',
                pointRadius: 4,
                spanGaps: true
            });
        }
        
        // Protection Civile (vert)
        if (type === 'pc' || type === 'all') {
            datasets.push({
                label: '🚑 Protection Civile',
                data: calculerDonnees(parMois.pc),
                borderColor: '#27ae60',
                backgroundColor: 'rgba(39,174,96,0.1)',
                fill: true,
                tension: 0.3,
                pointBackgroundColor: '#1e8449',
                pointRadius: 4,
                spanGaps: true
            });
        }
        
        // Fourgon Mortelle (violet)
        if (type === 'fourgon' || type === 'all') {
            datasets.push({
                label: '⚰️ Fourgon Mortelle',
                data: calculerDonnees(parMois.fourgon),
                borderColor: '#6c5ce7',
                backgroundColor: 'rgba(108,92,231,0.1)',
                fill: true,
                tension: 0.3,
                pointBackgroundColor: '#4834d4',
                pointRadius: 4,
                spanGaps: true
            });
        }
        
        // Seuil 25 min pour Patrouilleur
        if (type === 'patrouilleur' || type === 'all') {
            datasets.push({
                label: 'Seuil 25 min',
                data: Array(labels.length).fill(25 * 60),
                borderColor: 'rgba(231, 76, 60, 0.4)',
                borderDash: [8, 8],
                borderWidth: 2,
                pointRadius: 0,
                fill: false,
                tension: 0
            });
        }
        
        if (datasets.length === 0) return;
        
        this.chart = new Chart(ctx, {
            type: 'line',
            data: { labels: labels, datasets: datasets },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            pointStyle: 'circle',
                            filter: function(item) {
                                return !item.text.includes('Seuil');
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': ' + formatTemps(context.parsed.y);
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) { return formatTemps(value); }
                        }
                    }
                }
            }
        });
    }
};

// ============================================================
// 8. SECTION DEPANNEURS (مستقلة - متوافقة مع index.html)
// ============================================================

const Depanneurs = {
    chart: null,
    donneesFiltrees: [],
    
    // ====== تهيئة القسم ======
    init: function() {
        mettreAJourAnneeLabel();
        this.mettreAJourFiltres();
        this.appliquerFiltres();
    },
    
    // ====== تحديث قوائم الفلاتر ======
    mettreAJourFiltres: function() {
        const selectTroncon = document.getElementById('depTronconFilter');
        const selectMois = document.getElementById('depMoisFilter');
        const selectSociete = document.getElementById('depSocieteFilter');
        
        if (!selectTroncon || !selectMois || !selectSociete) return;
        
        // ---- حفظ التحديدات الحالية ----
        const selectedTroncon = Array.from(selectTroncon.selectedOptions).map(opt => opt.value);
        const selectedMois = Array.from(selectMois.selectedOptions).map(opt => opt.value);
        const selectedSociete = Array.from(selectSociete.selectedOptions).map(opt => opt.value);
        
        // ---- بناء قائمة المقاطع (مع T2_2) ----
        
        
        selectTroncon.innerHTML = '<option value="all">Tous les tronçons</option>';
        getTronconsActifs().forEach(t => {
            const opt = document.createElement('option');
            opt.value = t;
            opt.textContent = t + ' (' + getPkRangeDynamique(t) + ')';
            selectTroncon.appendChild(opt);
        });
        
        Array.from(selectTroncon.options).forEach(opt => {
            if (selectedTroncon.includes(opt.value)) opt.selected = true;
        });
        if (selectTroncon.selectedOptions.length === 0) {
            selectTroncon.querySelector('option[value="all"]').selected = true;
        }
        
        // ---- بناء قائمة الأشهر ----
        const moisExistants = new Set();
        toutesLesDonnees.forEach(d => {
            if (d['_mois'] && d['_mois'] >= 1 && d['_mois'] <= 12) {
                moisExistants.add(d['_mois']);
            }
        });
        
        selectMois.innerHTML = '<option value="all">Tous les mois</option>';
        const moisNoms = ['Janvier','Février','Mars','Avril','Mai','Juin',
                          'Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
        Array.from(moisExistants).sort((a,b) => a-b).forEach(m => {
            const opt = document.createElement('option');
            opt.value = m;
            opt.textContent = moisNoms[m - 1];
            selectMois.appendChild(opt);
        });
        
        Array.from(selectMois.options).forEach(opt => {
            if (selectedMois.includes(opt.value)) opt.selected = true;
        });
        if (selectMois.selectedOptions.length === 0) {
            selectMois.querySelector('option[value="all"]').selected = true;
        }
        
                // ---- بناء قائمة الشركات ----
       // ---- بناء قائمة الشركات ----
        // ====== Filtrage à 3 dimensions :
        //   📅 Année  → depuis _annee des données chargées
        //   📅 Mois   → depuis le filtre Mois (si actif)
        //   📍 PK     → depuis le filtre Tronçon (si actif)
        // ======
        const drrActif = (typeof Parametres !== 'undefined' && Parametres.directionActive)
                        || window.directionActiveCourante
                        || 'DRRS';
        
        let societesConfig = [];
        try {
            const dataConfig = localStorage.getItem('config_' + drrActif + '_societes');
            if (dataConfig) societesConfig = JSON.parse(dataConfig);
        } catch(e) {
            console.warn('⚠️ Impossible de lire config_' + drrActif + '_societes');
        }
        
        // Récupérer les filtres actifs
        const tronconSelectValues = Array.from(selectTroncon.selectedOptions).map(opt => opt.value);
        const moisSelectValues = Array.from(selectMois.selectedOptions).map(opt => opt.value);
        const tronconAllFiltre = tronconSelectValues.includes('all');
        const moisAllFiltre = moisSelectValues.includes('all');
        
        // ========== ÉTAPE 1 : Récupérer les ANNÉES présentes dans les données ==========
        const anneesSet = new Set();
        
        toutesLesDonnees.forEach(d => {
            // Priorité 1 : champ "_annee" (rempli au chargement)
            if (d['_annee'] && parseInt(d['_annee']) > 0) {
                anneesSet.add(parseInt(d['_annee']));
                return;
            }
            // Priorité 2 : extraire depuis les dates
            const dateVal = d['Date prise en charge'] || d['Date et heure accident'];
            if (!dateVal && dateVal !== 0) return;
            
            let annee = null;
            if (typeof dateVal === 'number') {
                const dt = new Date((dateVal - 25569) * 86400 * 1000);
                if (!isNaN(dt)) annee = dt.getFullYear();
            } else if (typeof dateVal === 'string') {
                const m = dateVal.match(/(\d{2})[\/\-](\d{2})[\/\-](\d{4})/);
                if (m) annee = parseInt(m[3]);
            }
            if (annee) anneesSet.add(annee);
        });
        
        const anneesList = Array.from(anneesSet).sort();
        console.log('📅 [Sociétés] Années détectées:', anneesList);
        
        // ========== ÉTAPE 2 : Construire les PÉRIODES de référence (Année × Mois) ==========
        // Chaque période = {debut, fin, label} à tester contre les sociétés
        const periodes = [];
        
        if (anneesList.length > 0) {
            if (moisAllFiltre) {
                // Toute l'année pour chaque année
                anneesList.forEach(an => {
                    periodes.push({
                        debut: new Date(an, 0, 1),
                        fin:   new Date(an, 11, 31),
                        label: String(an)
                    });
                });
            } else {
                // Croiser chaque année × chaque mois sélectionné
                anneesList.forEach(an => {
                    moisSelectValues.forEach(mStr => {
                        const m = parseInt(mStr);
                        if (m >= 1 && m <= 12) {
                            periodes.push({
                                debut: new Date(an, m - 1, 1),
                                fin:   new Date(an, m, 0),  // dernier jour du mois
                                label: mStr + '/' + an
                            });
                        }
                    });
                });
            }
        }
        
        console.log('📅 [Sociétés] Périodes de référence:',
                    periodes.map(p => p.label).join(', ') || 'aucune');
        
        // ========== ÉTAPE 3 : Construire les PLAGES PK des tronçons sélectionnés ==========
        let pkRanges = [];
        if (!tronconAllFiltre) {
            pkRanges = tronconSelectValues.map(tId => {
                const info = window.TRONCONS && window.TRONCONS[tId];
                if (!info) return null;
                return {
                    id: tId,
                    min: parseInt(info.min),
                    max: parseInt(info.max),
                    axe: info.axe
                };
            }).filter(x => x);
        }
        console.log('📍 [Sociétés] PK ranges:', pkRanges.map(r => r.id + ':' + r.min + '-' + r.max).join(', ') || 'tous');
        
        // ========== ÉTAPE 4 : Filtrer les sociétés ==========
        const societes = new Set();
        
        societesConfig.forEach(s => {
            if (!s.nom || s.nom.trim() === '') return;
            const sNom = s.nom.trim();
            const sPkMin = parseInt(s.pk_min) || 0;
            const sPkMax = parseInt(s.pk_max) || 0;
            const sAxe = s.axe || null;
            
            // ---------- Filtre A : CHEVAUCHEMENT PK ----------
            if (!tronconAllFiltre && pkRanges.length > 0) {
                let chevauchementPK = false;
                for (const r of pkRanges) {
                    if (sPkMax >= r.min && sPkMin <= r.max) {
                        if (r.axe && sAxe && r.axe !== sAxe) continue;
                        chevauchementPK = true;
                        break;
                    }
                }
                if (!chevauchementPK) {
                    console.log('⛔ [Exclue - hors PK]', sNom,
                                '| PK:', sPkMin, '-', sPkMax,
                                '| filtre:', pkRanges.map(r => r.id).join(', '));
                    return;
                }
            }
            
            // ---------- Filtre B : CHEVAUCHEMENT DE PÉRIODE ----------
            if (periodes.length > 0 && (s.date_entree || s.date_sortie)) {
                const dateEntree = s.date_entree ? new Date(s.date_entree) : new Date('1900-01-01');
                const dateSortie = s.date_sortie ? new Date(s.date_sortie) : new Date('2100-12-31');
                
                // Chevauchement avec AU MOINS une période
                const chevauche = periodes.some(p => {
                    return !(dateSortie < p.debut || dateEntree > p.fin);
                });
                
                if (!chevauche) {
                    console.log('⛔ [Exclue - hors période]', sNom,
                                '| société:', s.date_entree, '→', s.date_sortie,
                                '| périodes testées:', periodes.map(p => p.label).join(', '));
                    return;
                }
            }
            
            // ✅ Société retenue
            societes.add(sNom);
        });
        
        console.log('✅ [Sociétés] Retenues (' + societes.size + '):', Array.from(societes).sort());
        
        // Trier alphabétiquement
        const societesTriees = Array.from(societes).sort();
        
        // Reconstruire la liste
        selectSociete.innerHTML = '<option value="all">Toutes les sociétés</option>';
        societesTriees.forEach(s => {
            const opt = document.createElement('option');
            opt.value = s;
            opt.textContent = s;
            selectSociete.appendChild(opt);
        });
            
            // 6. Restaurer les sélections précédentes SI elles existent encore
            Array.from(selectSociete.options).forEach(opt => {
                if (selectedSociete.includes(opt.value) && opt.value !== 'all') {
                    opt.selected = true;
                }
            });
            
            // Si aucune société n'est sélectionnée, sélectionner "all"
            if (selectSociete.selectedOptions.length === 0) {
                selectSociete.querySelector('option[value="all"]').selected = true;
            }
            
            // Si la société précédemment sélectionnée n'existe plus, revenir à "all"
            if (selectedSociete.length > 0 && !selectedSociete.includes('all')) {
                const existeEncore = selectedSociete.some(s => societes.has(s));
                if (!existeEncore) {
                    console.log('⚠️ Société sélectionnée introuvable → retour à "Toutes"');
                    selectSociete.querySelector('option[value="all"]').selected = true;
                }
            }
        },
    // ====== تطبيق الفلاتر ======
    appliquerFiltres: function() {
        const tronconSelect = document.getElementById('depTronconFilter');
        const moisSelect = document.getElementById('depMoisFilter');
        const societeSelect = document.getElementById('depSocieteFilter');
        const typeSelect = document.getElementById('depTypeFilter');
        
        const tronconValues = Array.from(tronconSelect.selectedOptions).map(opt => opt.value);
        const moisValues = Array.from(moisSelect.selectedOptions).map(opt => opt.value);
        const societeValues = Array.from(societeSelect.selectedOptions).map(opt => opt.value);
        const typeValue = typeSelect ? typeSelect.value : 'all';
        
        const tronconAll = tronconValues.includes('all');
        const moisAll = moisValues.includes('all');
        const societeAll = societeValues.includes('all');
        
        let donnees = toutesLesDonnees || [];
        donnees = donnees.filter(d => {
            if (!tronconAll && !tronconValues.includes(d['_troncon'])) return false;
            if (!moisAll && !moisValues.includes(String(d['_mois']))) return false;
            if (!societeAll && !societeValues.includes(d['_societe'])) return false;
            if (typeValue !== 'all' && d['_type_vehicule'] !== typeValue) return false;
            return true;
        });
        
        this.donneesFiltrees = donnees;
        
        this.mettreAJourStatistiques();
        this.mettreAJourTableau();
        this.mettreAJourGraphique();
    },
    
    // ====== إعادة تعيين الفلاتر ======
    reinitialiserFiltres: function() {
        const tronconSelect = document.getElementById('depTronconFilter');
        const moisSelect = document.getElementById('depMoisFilter');
        const societeSelect = document.getElementById('depSocieteFilter');
        const typeSelect = document.getElementById('depTypeFilter');
        
        if (tronconSelect) {
            Array.from(tronconSelect.options).forEach(opt => {
                opt.selected = (opt.value === 'all');
            });
        }
        if (moisSelect) {
            Array.from(moisSelect.options).forEach(opt => {
                opt.selected = (opt.value === 'all');
            });
        }
        if (societeSelect) {
            Array.from(societeSelect.options).forEach(opt => {
                opt.selected = (opt.value === 'all');
            });
        }
        
        if (typeSelect) {
            typeSelect.value = 'all';
        }
        
        // ✅ Reconstruire la liste des sociétés après réinitialisation
        this.mettreAJourFiltres();
        this.appliquerFiltres();
    },
        
    // ====== عرض الإحصائيات ======
    mettreAJourStatistiques: function() {
        const donnees = this.donneesFiltrees;
        const delais = donnees.map(d => d['_delai_depannage']).filter(d => d && d !== '--' && d !== '-');
        
        if (delais.length === 0) {
            document.getElementById('depDelaiMin').textContent = '-';
            document.getElementById('depDelaiMax').textContent = '-';
            document.getElementById('depDelaiMoyen').textContent = '-';
            document.getElementById('depDelaiCount').textContent = '0';
            return;
        }
        
        // ✅ استبعاد القيم الخيالية (أكبر من 4 ساعات = 14400 ثانية)
        const seuilMax = 14400; // 4 ساعات
        const enSecondes = delais.map(t => {
            const parts = t.split(':');
            if (parts.length === 2) return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60;
            else if (parts.length === 3) return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
            return 0;
        }).filter(s => s > 0 && s <= seuilMax);
        
        if (enSecondes.length === 0) {
            document.getElementById('depDelaiMin').textContent = '-';
            document.getElementById('depDelaiMax').textContent = '-';
            document.getElementById('depDelaiMoyen').textContent = '-';
            document.getElementById('depDelaiCount').textContent = '0';
            return;
        }
        
        const min = Math.min(...enSecondes);
        const max = Math.max(...enSecondes);
        const moyenne = enSecondes.reduce((a,b) => a+b, 0) / enSecondes.length;
        
        document.getElementById('depDelaiMin').textContent = formatTemps(min);
        document.getElementById('depDelaiMax').textContent = formatTemps(max);
        document.getElementById('depDelaiMoyen').textContent = formatTemps(moyenne);
        document.getElementById('depDelaiCount').textContent = enSecondes.length;
    },
    
    // ====== عرض الجدول ======
    mettreAJourTableau: function() {
        const container = document.getElementById('depanneursTable');
        if (!container) return;
        
        const donnees = this.donneesFiltrees;
        if (donnees.length === 0) {
            container.innerHTML = `<div class="status-empty"><h3>📭 Aucune donnée</h3><p>Ajustez les filtres ou chargez des fichiers</p></div>`;
            return;
        }
        
        // ✅ الحصول على قيمة فلتر Type
        const typeFilter = document.getElementById('depTypeFilter')?.value || 'all';
        
        // تجميع البيانات حسب الشهر والشركة ونوع المركبة
        const parMoisSociete = {};
        donnees.forEach(d => {
            const mois = d['_nom_mois'] || 'Inconnu';
            const societe = d['_societe'] || 'Inconnue';
            const type = d['_type_vehicule'] || 'VL';
            const delai = d['_delai_depannage'];
            if (!delai || mois === 'Inconnu' || societe === 'Inconnue') return;
            
            // ✅ إذا كان هناك فلتر Type، نتجاهل البيانات التي لا تطابق
            if (typeFilter !== 'all' && type !== typeFilter) return;
            
            if (!parMoisSociete[mois]) parMoisSociete[mois] = {};
            if (!parMoisSociete[mois][societe]) parMoisSociete[mois][societe] = { PL: [], VL: [] };
            if (type === 'PL') parMoisSociete[mois][societe].PL.push(delai);
            else parMoisSociete[mois][societe].VL.push(delai);
        });
        
        // حساب المتوسطات
        const resultats = {};
        for (const [mois, societes] of Object.entries(parMoisSociete)) {
            resultats[mois] = {};
            for (const [societe, types] of Object.entries(societes)) {
                resultats[mois][societe] = {
                    PL: moyenneTempsDep(types.PL),
                    VL: moyenneTempsDep(types.VL)
                };
            }
        }
        
        // ترتيب الأشهر
        const ordreMois = ['Janvier','Février','Mars','Avril','Mai','Juin',
                        'Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
        const moisExistants = Object.keys(resultats).filter(m => m !== 'Inconnu')
            .sort((a, b) => ordreMois.indexOf(a) - ordreMois.indexOf(b));
        
        if (moisExistants.length === 0) {
            container.innerHTML = `<div class="status-empty"><h3>📭 Aucune donnée de délais</h3></div>`;
            return;
        }
        
        // الشركات
       // ====== ✅ الشركات (dynamique depuis les données) ======
        const societesSet = new Set();
        Object.keys(parMoisSociete).forEach(mois => {
            Object.keys(parMoisSociete[mois]).forEach(s => {
                societesSet.add(s);
            });
        });
        const societesListe = Array.from(societesSet).sort();
        
        console.log('📊 Sociétés affichées dans le tableau:', societesListe);
        
        if (societesListe.length === 0) {
            container.innerHTML = `<div class="status-empty"><h3>📭 Aucune société avec des délais</h3></div>`;
            return;
        }
        
        // ✅ تحديد الأعمدة التي ستظهر بناءً على فلتر Type
        const showPL = (typeFilter === 'all' || typeFilter === 'PL');
        const showVL = (typeFilter === 'all' || typeFilter === 'VL');
        
        let html = '<table><thead><tr><th>Mois / Catégorie</th>';
        societesListe.forEach(s => {
            html += `<th colspan="${(showPL ? 1 : 0) + (showVL ? 1 : 0)}">${s}</th>`;
        });
        html += '</tr><tr><th></th>';
        societesListe.forEach(() => {
            if (showPL) html += '<th>PL</th>';
            if (showVL) html += '<th>VL</th>';
        });
        html += '</tr></thead><tbody>';
        
        const totalParSociete = {};
        societesListe.forEach(s => totalParSociete[s] = { PL: [], VL: [] });
        
        moisExistants.forEach(mois => {
            html += `<tr><td><strong>${mois}</strong></td>`;
            societesListe.forEach(s => {
                const d = resultats[mois]?.[s];
                if (showPL) {
                    const pl = d?.PL || '-';
                    if (pl !== '-') totalParSociete[s].PL.push(pl);
                    html += `<td>${pl}</td>`;
                }
                if (showVL) {
                    const vl = d?.VL || '-';
                    if (vl !== '-') totalParSociete[s].VL.push(vl);
                    html += `<td>${vl}</td>`;
                }
            });
            html += '</tr>';
        });
        
        html += `<tr class="total-row"><td><strong>Moyenne Générale</strong></td>`;
        societesListe.forEach(s => {
            if (showPL) {
                const pl = moyenneTempsDep(totalParSociete[s].PL);
                html += `<td><strong>${pl || '-'}</strong></td>`;
            }
            if (showVL) {
                const vl = moyenneTempsDep(totalParSociete[s].VL);
                html += `<td><strong>${vl || '-'}</strong></td>`;
            }
        });
        html += '</tr></tbody></table>';
        
        container.innerHTML = html;
    },
    
    // ====== عرض المنحنى ======
    mettreAJourGraphique: function() {
        const ctx = document.getElementById('depChart');
        if (!ctx) return;
        if (this.chart) { this.chart.destroy(); this.chart = null; }
        
        const donnees = this.donneesFiltrees;
        if (donnees.length === 0) return;
        
        const typeFilter = document.getElementById('depTypeFilter')?.value || 'all';
        
        // تجميع البيانات حسب الشهر لكل نوع
        const parMoisPL = {};
        const parMoisVL = {};
        
        donnees.forEach(d => {
            const mois = d['_nom_mois'] || 'Inconnu';
            const type = d['_type_vehicule'] || 'VL';
            const delai = d['_delai_depannage'];
            if (!delai || mois === 'Inconnu') return;
            
            if (type === 'PL') {
                if (!parMoisPL[mois]) parMoisPL[mois] = [];
                parMoisPL[mois].push(delai);
            } else {
                if (!parMoisVL[mois]) parMoisVL[mois] = [];
                parMoisVL[mois].push(delai);
            }
        });
        
        const ordreMois = ['Janvier','Février','Mars','Avril','Mai','Juin',
                        'Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
        
        const moisSet = new Set();
        Object.keys(parMoisPL).forEach(m => moisSet.add(m));
        Object.keys(parMoisVL).forEach(m => moisSet.add(m));
        
        const moisExistants = Array.from(moisSet).filter(m => m !== 'Inconnu')
            .sort((a, b) => ordreMois.indexOf(a) - ordreMois.indexOf(b));
        
        if (moisExistants.length === 0) return;
        
        const labels = moisExistants;
        
        const dataPL = moisExistants.map(m => {
            const moyenne = moyenneTempsDep(parMoisPL[m]);
            if (!moyenne) return null;
            const parts = moyenne.split(':');
            if (parts.length === 2) return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60;
            else if (parts.length === 3) return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
            return 0;
        });
        
        const dataVL = moisExistants.map(m => {
            const moyenne = moyenneTempsDep(parMoisVL[m]);
            if (!moyenne) return null;
            const parts = moyenne.split(':');
            if (parts.length === 2) return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60;
            else if (parts.length === 3) return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
            return 0;
        });
        
        // ✅ تحويل 30 دقيقة و 45 دقيقة إلى ثواني
        const seuilVL = 30 * 60;   // 1800 ثانية
        const seuilPL = 45 * 60;   // 2700 ثانية
        
        // بناء مجموعة البيانات
        const datasets = [];
        
        if (typeFilter === 'all' || typeFilter === 'PL') {
            datasets.push({
                label: 'PL',
                data: dataPL,
                borderColor: '#e74c3c',
                backgroundColor: 'rgba(231, 76, 60, 0.1)',
                fill: true,
                tension: 0.3,
                pointBackgroundColor: '#e74c3c',
                pointRadius: 4,
                spanGaps: true
            });
        }
        
        if (typeFilter === 'all' || typeFilter === 'VL') {
            datasets.push({
                label: 'VL',
                data: dataVL,
                borderColor: '#2d7db8',
                backgroundColor: 'rgba(45, 125, 184, 0.1)',
                fill: true,
                tension: 0.3,
                pointBackgroundColor: '#2d7db8',
                pointRadius: 4,
                spanGaps: true
            });
        }
        
        // ✅ إضافة الخطوط الأفقية (كـ dataset منفصلة)
        // خط 45 دقيقة لـ PL (أحمر فاتح، متقطع)
        if (typeFilter === 'all' || typeFilter === 'PL') {
            datasets.push({
                label: 'Seuil PL (45 min)',
                data: Array(labels.length).fill(seuilPL),
                borderColor: 'rgba(231, 76, 60, 0.4)',
                borderDash: [8, 8],
                borderWidth: 2,
                pointRadius: 0,
                fill: false,
                tension: 0
            });
        }
        
        // خط 30 دقيقة لـ VL (أزرق فاتح، متقطع)
        if (typeFilter === 'all' || typeFilter === 'VL') {
            datasets.push({
                label: 'Seuil VL (30 min)',
                data: Array(labels.length).fill(seuilVL),
                borderColor: 'rgba(45, 125, 184, 0.4)',
                borderDash: [8, 8],
                borderWidth: 2,
                pointRadius: 0,
                fill: false,
                tension: 0
            });
        }
        
        if (datasets.length === 0) return;
        
        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: datasets
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            pointStyle: 'circle',
                            // ✅ إخفاء تسميات الخطوط الأفقية من الأسطورة
                            filter: function(item) {
                                return !item.text.includes('Seuil');
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                if (context.dataset.label.includes('Seuil')) {
                                    return context.dataset.label + ': ' + formatTemps(context.parsed.y);
                                }
                                return context.dataset.label + ': ' + formatTemps(context.parsed.y);
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return formatTemps(value);
                            }
                        }
                    }
                }
            }
        });
    },
};

// ============================================================
// 🆕 PLUGIN : Étiquettes externes avec flèches pour les doughnuts
// ============================================================
const doughnutExternalLabelsPlugin = {
    id: 'doughnutExternalLabels',
    afterDatasetsDraw: function(chart) {
        if (chart.config.type !== 'doughnut') return;
        
        const ctx = chart.ctx;
        const meta = chart.getDatasetMeta(0);
        if (!meta || !meta.data || meta.data.length === 0) return;
        
        const dataset = chart.data.datasets[0];
        const total = dataset.data.reduce((a, b) => a + (b || 0), 0);
        if (total === 0) return;
        // ✅ Adapter à la taille de l'écran
        const isMobile = window.innerWidth <= 768;
        const elbowLength = isMobile ? 22 : 40;
        const fontSizes = isMobile ? '600 10px "Segoe UI", Arial, sans-serif' : '600 12px "Segoe UI", Arial, sans-serif';
        
        chart.data.labels.forEach(function(label, i) {
            const value = dataset.data[i] || 0;
            if (value === 0) return;
            
            const arc = meta.data[i];
            if (!arc) return;
            
            const centerAngle = (arc.startAngle + arc.endAngle) / 2;
            const outerRadius = arc.outerRadius;
            const cx = arc.x;
            const cy = arc.y;
            
            const cos = Math.cos(centerAngle);
            const sin = Math.sin(centerAngle);
            
            // Point sur l'arc
            const x1 = cx + cos * outerRadius;
            const y1 = cy + sin * outerRadius;
            
            // Point du coude
            const x2 = cx + cos * (outerRadius + 15);
            const y2 = cy + sin * (outerRadius + 15);
            
            // Point final (aligné horizontalement)
            const isRight = cos >= 0;
            const x3 = isRight ? x2 + elbowLength : x2 - elbowLength;
            const y3 = y2;
            
            ctx.save();
            
            // Ligne coudée
            ctx.strokeStyle = '#aaa';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.lineTo(x3, y3);
            ctx.stroke();
            
            // Petit point sur l'arc (raccord)
            ctx.beginPath();
            ctx.arc(x1, y1, 3, 0, Math.PI * 2);
            ctx.fillStyle = dataset.backgroundColor[i] || '#999';
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1.5;
            ctx.stroke();
            
            // Texte
            const percentage = ((value / total) * 100).toFixed(1);
            const text = label + ' : ' + value + ' (' + percentage + '%)';
            
            ctx.fillStyle = '#1a3a5c';
            ctx.font = fontSizes;
            ctx.textBaseline = 'middle';
            ctx.textAlign = isRight ? 'left' : 'right';
            ctx.fillText(text, x3 + (isRight ? 6 : -6), y3);
            
            ctx.restore();
        });
    }
};

// ============================================================
// SECTION GRAPHIQUES (DASHBOARD)
// ============================================================

const Graphiques = {
    chartMensuel: null,
    chartJournalier: null,
    chartPeriode: null,
    chartCause: null,
    chartGravite: null,
    chartVictimes: null,
    
    // ====== تهيئة الفلاتر ======
    mettreAJourFiltres: function() {
        const selectTroncon = document.getElementById('graphTronconFilter');
        const selectMois = document.getElementById('graphMoisFilter');
        
        if (!selectTroncon || !selectMois) return;
        
        // ---- Tronçons (avec T2_2) ----
        // ---- Tronçons dynamiques selon DRR actif ----
        const valTroncon = selectTroncon.value;
        selectTroncon.innerHTML = '<option value="all">Tous les tronçons</option>';
        getTronconsActifs().forEach(t => {
            const opt = document.createElement('option');
            opt.value = t;
            opt.textContent = t + ' (' + getPkRangeDynamique(t) + ')';
            selectTroncon.appendChild(opt);
        });
        // Restaurer la sélection si elle existe encore
        const tronconExisteEncore = Array.from(selectTroncon.options).some(opt => opt.value === valTroncon);
        selectTroncon.value = tronconExisteEncore ? valTroncon : 'all';
        
        // ---- Mois ----
        const moisExistants = new Set();
        toutesLesDonnees.forEach(d => {
            if (d['_mois'] && d['_mois'] >= 1 && d['_mois'] <= 12) {
                moisExistants.add(d['_mois']);
            }
        });
        const valMois = selectMois.value;
        selectMois.innerHTML = '<option value="all">Tous les mois</option>';
        const moisNoms = ['Janvier','Février','Mars','Avril','Mai','Juin',
                          'Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
        Array.from(moisExistants).sort((a,b) => a-b).forEach(m => {
            const opt = document.createElement('option');
            opt.value = m;
            opt.textContent = moisNoms[m - 1];
            selectMois.appendChild(opt);
        });
        if (moisExistants.has(parseInt(valMois))) selectMois.value = valMois;
        else selectMois.value = 'all';
    },
    
     // ====== تطبيق الفلاتر (avec liaison en cascade) ======
    appliquerFiltres: function() {
        const troncon = document.getElementById('graphTronconFilter').value;
        const mois = document.getElementById('graphMoisFilter').value;
        const semaine = document.getElementById('graphSemaineFilter').value;
        const jour = document.getElementById('graphJourFiltre').value;
        const heure = document.getElementById('graphHeureFiltre').value;
        
        // ===== BASE : Tronçon + Mois =====
        const donneesBase = toutesLesDonnees.filter(d => {
            if (troncon !== 'all' && d['_troncon'] !== troncon) return false;
            if (mois !== 'all' && d['_mois'] !== parseInt(mois)) return false;
            return true;
        });
        
        // ===== Helpers internes =====
        const extraireSemaine = (d) => {
            const dateVal = d['Date prise en charge'] || d['Date et heure accident'];
            if (!dateVal && dateVal !== 0) return null;
            
            let dateObj = null;
            if (typeof dateVal === 'number') {
                dateObj = new Date((dateVal - 25569) * 86400 * 1000);
            } else if (typeof dateVal === 'string') {
                let m = dateVal.match(/(\d{2})[\/\-](\d{2})[\/\-](\d{4})/);
                if (m) dateObj = new Date(parseInt(m[3]), parseInt(m[2]) - 1, parseInt(m[1]));
                else dateObj = new Date(dateVal);
            }
            
            if (!dateObj || isNaN(dateObj)) return null;
            const annee = dateObj.getFullYear();
            const debutAnnee = new Date(annee, 0, 1);
            const diff = (dateObj - debutAnnee) / 86400000;
            return Math.ceil((diff + debutAnnee.getDay() + 1) / 7);
        };
        
        const extraireHeureNum = (d) => {
            const h = d['_heure_accident'];
            if (!h) return null;
            return parseInt(h.split(':')[0]);
        };
        
        // ===== Filtre HEURE appliqué à tous (le plus spécifique) =====
        const filtreHeure = (arr) => {
            if (heure === 'all') return arr;
            return arr.filter(d => extraireHeureNum(d) === parseInt(heure));
        };
        
        // ===== Filtre JOUR =====
        const filtreJour = (arr) => {
            if (jour === 'all') return arr;
            return arr.filter(d => d['_jour_semaine'] === jour);
        };
        
        // ===== Filtre SEMAINE =====
        const filtreSemaine = (arr) => {
            if (semaine === 'all') return arr;
            return arr.filter(d => extraireSemaine(d) === parseInt(semaine));
        };
        
        // ===== 1. KPI + Doughnuts : TOUS les filtres =====
        const donneesFinales = filtreHeure(filtreJour(filtreSemaine(donneesBase)));
        this.mettreAJourKPI(donneesFinales);
        this.mettreAJourGraphiqueCause(donneesFinales);
        this.mettreAJourGraphiqueGravite(donneesFinales);
        this.mettreAJourGraphiqueVictimes(donneesFinales);
        
        // ===== 2. Hebdomadaire : base ∩ jour ∩ heure =====
        // (le chart filtre par semaine en interne pour ses labels)
        const donneesPourSemaine = filtreHeure(filtreJour(donneesBase));
        this.mettreAJourGraphiqueMensuel(donneesPourSemaine);
        
        // ===== 3. Journalier : base ∩ semaine ∩ heure =====
        const donneesPourJour = filtreHeure(filtreSemaine(donneesBase));
        this.mettreAJourGraphiqueJournalier(donneesPourJour);
        
        // ===== 4. Période (24h) : base ∩ semaine ∩ jour =====
        const donneesPourHeure = filtreJour(filtreSemaine(donneesBase));
        this.mettreAJourGraphiquePeriode(donneesPourHeure);
    },
    
    // ====== Réinitialiser ======
    reinitialiserFiltres: function() {
        document.getElementById('graphTronconFilter').value = 'all';
        document.getElementById('graphMoisFilter').value = 'all';
        document.getElementById('graphSemaineFilter').innerHTML = '<option value="all">Toutes les semaines</option>';
        document.getElementById('graphJourFiltre').value = 'all';
        document.getElementById('graphHeureFiltre').value = 'all';
        document.getElementById('graphCauseType').value = 'principale';
        this.appliquerFiltres();
    },
    
    // ====== KPI ======
    mettreAJourKPI: function(donnees) {
        // Total Accidents
        document.getElementById('kpiTotal').textContent = donnees.length;
        
        // Moyenne par jour
        const jours = new Set();
        donnees.forEach(d => {
            const date = d['Date et heure accident'];
            if (date) {
                try {
                    const jour = new Date(date).toLocaleDateString();
                    jours.add(jour);
                } catch(e) {}
            }
        });
        // ✅ حساب متوسط على أساس عدد الأيام الفعلية
                // ✅ Moyenne par jour — basé sur le nombre de jours UNIQUES
        const joursUniques = new Set();
        donnees.forEach(d => {
            const dateVal = d['Date prise en charge'] || d['Date et heure accident'];
            if (!dateVal && dateVal !== 0) return;
            
            try {
                let dateObj;
                if (typeof dateVal === 'number') {
                    dateObj = new Date((dateVal - 25569) * 86400 * 1000);
                } else if (typeof dateVal === 'string') {
                    // Formats "DD-MM-YYYY" ou "DD/MM/YYYY"
                    let m = dateVal.match(/(\d{2})[\/\-](\d{2})[\/\-](\d{4})/);
                    if (m) {
                        dateObj = new Date(parseInt(m[3]), parseInt(m[2]) - 1, parseInt(m[1]));
                    } else {
                        dateObj = new Date(dateVal);
                    }
                } else if (dateVal instanceof Date) {
                    dateObj = dateVal;
                }
                
                if (dateObj && !isNaN(dateObj)) {
                    const key = dateObj.getFullYear() + '-' + 
                                String(dateObj.getMonth() + 1).padStart(2, '0') + '-' + 
                                String(dateObj.getDate()).padStart(2, '0');
                    joursUniques.add(key);
                }
            } catch(e) {}
        });
        
        const nbJours = joursUniques.size || 1;
        document.getElementById('kpiMoyenne').textContent = (donnees.length / nbJours).toFixed(1) + '/jour';
        
        // Jour le plus dangereux
        // Jour le plus dangereux (avec conversion correcte)
        const parJour = {};
        donnees.forEach(d => {
            const date = d['Date prise en charge'];
            if (!date) return;
            
            try {
                let dateObj;
                if (typeof date === 'number') {
                    // Convertir le nombre Excel en Date
                    dateObj = new Date((date - 25569) * 86400 * 1000);
                } else {
                    dateObj = new Date(date);
                }
                
                if (!isNaN(dateObj)) {
                    const jour = dateObj.toLocaleDateString('fr-FR');
                    parJour[jour] = (parJour[jour] || 0) + 1;
                }
            } catch(e) {}
        });

        let maxJour = '-', maxCount = 0;
        for (const [j, c] of Object.entries(parJour)) {
            if (c > maxCount) { maxCount = c; maxJour = j; }
        }
        document.getElementById('kpiJourDangereux').textContent = maxJour + ' (' + maxCount + ')';
        // Mois le plus dangereux (seulement par mois, pas par tronçon)
        const parMois = {};
        donnees.forEach(d => {
            const date = d['Date prise en charge'];
            if (!date) return;
            
            try {
                let dateObj;
                if (typeof date === 'number') {
                    dateObj = new Date((date - 25569) * 86400 * 1000);
                } else {
                    dateObj = new Date(date);
                }
                
                if (!isNaN(dateObj)) {
                    const mois = dateObj.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
                    parMois[mois] = (parMois[mois] || 0) + 1;
                }
            } catch(e) {}
        });

        let maxMois = '-', maxMoisCount = 0;
        for (const [m, c] of Object.entries(parMois)) {
            if (c > maxMoisCount) { maxMoisCount = c; maxMois = m; }
        }
        document.getElementById('kpiMoisDangereux').textContent = maxMois + ' (' + maxMoisCount + ')';
        // Cause principale (filtrer les valeurs vides)
        const causes = {};
        donnees.forEach(d => {
            let c = d['Cause principale'] !== undefined ? String(d['Cause principale']).trim() : '';
            if (c === '' || c === '--' || c === '-' || c === 'N/A' || c === 'n/a') {
                c = 'Non spécifiée';
            }
            causes[c] = (causes[c] || 0) + 1;
        });
        let maxCause = '-', maxCauseCount = 0;
        for (const [c, cnt] of Object.entries(causes)) {
            if (cnt > maxCauseCount) { maxCauseCount = cnt; maxCause = c; }
        }
        
        // ✅ Affichage adapté
        if (maxCause === 'Non spécifiée' && maxCauseCount > 0) {
            // La colonne est vide dans le fichier Excel
            document.getElementById('kpiCause').textContent = '❓ Non renseignée';
            document.getElementById('kpiCause').style.color = '#999';
            document.getElementById('kpiCause').style.fontSize = '0.85em';
            document.getElementById('kpiCause').title = 'La colonne "Cause principale" est vide dans le fichier Excel';
        } else if (maxCause && maxCause !== '-') {
            document.getElementById('kpiCause').textContent = maxCause + ' (' + maxCauseCount + ')';
            document.getElementById('kpiCause').style.color = '';
            document.getElementById('kpiCause').style.fontSize = '';
            document.getElementById('kpiCause').title = '';
        } else {
            document.getElementById('kpiCause').textContent = '-';
        }

        
        // Tronçon le plus dangereux (seulement par mois, pas par tronçon)
        const troncons = {};
        donnees.forEach(d => {
            const t = d['_troncon'] || 'Inconnu';
            troncons[t] = (troncons[t] || 0) + 1;
        });
        let maxTroncon = '-', maxTronconCount = 0;
        for (const [t, c] of Object.entries(troncons)) {
            if (c > maxTronconCount) { maxTronconCount = c; maxTroncon = t; }
        }
        document.getElementById('kpiTroncon').textContent = maxTroncon + ' (' + maxTronconCount + ')';
// ✅ Période analysée
        let dMin = null, dMax = null;
        donnees.forEach(d => {
            const dateVal = d['Date prise en charge'] || d['Date et heure accident'];
            if (!dateVal && dateVal !== 0) return;
            
            let dObj = null;
            if (typeof dateVal === 'number') {
                dObj = new Date((dateVal - 25569) * 86400 * 1000);
            } else if (typeof dateVal === 'string') {
                const m = dateVal.match(/(\d{2})[\/\-](\d{2})[\/\-](\d{4})/);
                if (m) dObj = new Date(parseInt(m[3]), parseInt(m[2]) - 1, parseInt(m[1]));
                else dObj = new Date(dateVal);
            }
            if (dObj && !isNaN(dObj)) {
                if (!dMin || dObj < dMin) dMin = dObj;
                if (!dMax || dObj > dMax) dMax = dObj;
            }
        });
        
        const elPeriode = document.getElementById('kpiPeriode');
        if (elPeriode) {
            if (dMin && dMax) {
                const fmt = (dt) => String(dt.getDate()).padStart(2,'0') + '/' 
                                 + String(dt.getMonth()+1).padStart(2,'0') + '/' 
                                 + dt.getFullYear();
                elPeriode.textContent = fmt(dMin) + ' → ' + fmt(dMax);
                elPeriode.style.fontSize = '0.6em';
            } else {
                elPeriode.textContent = '-';
            }
        }
        // ✅ Total Victimes
        let vTues = 0, vBG = 0, vBL = 0;
        donnees.forEach(d => {
            vTues += parseInt(d['_total_tues'] || 0);
            vBG   += parseInt(d['_total_bg']   || 0);
            vBL   += parseInt(d['_total_bl']   || 0);
        });
        
        const elVict = document.getElementById('kpiVictimes');
        if (elVict) {
            const total = vTues + vBG + vBL;
            elVict.textContent = total;
            elVict.title = '🔴 Tués: ' + vTues + ' | 🟠 BG: ' + vBG + ' | 🟢 BL: ' + vBL;
        }


    },
    
    // ====== 1. Graphique: Évolution mensuelle (colonnes) ======
    mettreAJourGraphiqueMensuel: function(donnees) {
        const ctx = document.getElementById('graphChartMensuel');
        if (!ctx) return;
        if (this.chartMensuel) { this.chartMensuel.destroy(); this.chartMensuel = null; }
        
        const semaineFiltre = document.getElementById('graphSemaineFilter').value;
        const moisFiltre = document.getElementById('graphMoisFilter').value;
        
        console.log('📊 Données pour le graphique:', donnees.length);
        
        // ====== Fonction pour extraire la semaine (modifiée) ======
        function getWeekNumber(valeur) {
            if (!valeur && valeur !== 0) return null;
            
            let dateObj = null;
            
            // 1. Si c'est un nombre (Excel serial number)
            if (typeof valeur === 'number') {
                dateObj = new Date((valeur - 25569) * 86400 * 1000);
                if (!isNaN(dateObj)) {
                    const annee = dateObj.getFullYear();
                    const debutAnnee = new Date(annee, 0, 1);
                    const diff = (dateObj - debutAnnee) / 86400000;
                    const semaine = Math.ceil((diff + debutAnnee.getDay() + 1) / 7);
                    return semaine;
                }
            }
            
            // 2. Si c'est une chaîne de caractères
            if (typeof valeur === 'string') {
                let texte = valeur.trim();
                let match = texte.match(/(\d{2})\/(\d{2})\/(\d{4})/);
                if (match) {
                    const jour = parseInt(match[1]);
                    const mois = parseInt(match[2]) - 1;
                    const annee = parseInt(match[3]);
                    dateObj = new Date(annee, mois, jour);
                    if (!isNaN(dateObj)) {
                        const debutAnnee = new Date(annee, 0, 1);
                        const diff = (dateObj - debutAnnee) / 86400000;
                        const semaine = Math.ceil((diff + debutAnnee.getDay() + 1) / 7);
                        return semaine;
                    }
                }
            }
            
            return null;
        }
        
        // ====== Compter les accidents par semaine ======
        const parSemaine = {};
        let compteurDates = 0;
        
        donnees.forEach(d => {
            const dateVal = d['Date prise en charge'] || d['Date et heure accident'];
            if (!dateVal && dateVal !== 0) return;
            
            const semaine = getWeekNumber(dateVal);
            if (semaine === null) return;
            
            compteurDates++;
            
            // الحصول على الشهر من التاريخ
            let mois = 0;
            if (typeof dateVal === 'number') {
                const dateObj = new Date((dateVal - 25569) * 86400 * 1000);
                if (!isNaN(dateObj)) mois = dateObj.getMonth() + 1;
            } else if (typeof dateVal === 'string') {
                const parts = dateVal.split('/');
                if (parts.length === 3) mois = parseInt(parts[1]);
            }
            
            const key = 'S' + semaine;
            if (!parSemaine[key]) {
                parSemaine[key] = { total: 0, mois: mois };
            }
            parSemaine[key].total++;
        });
        
        console.log('📊 Dates valides:', compteurDates);
        console.log('📊 Semaines trouvées:', Object.keys(parSemaine));
        
        // ====== Filtrer par mois ======
        let labels = Object.keys(parSemaine).sort((a, b) => {
            return parseInt(a.replace('S', '')) - parseInt(b.replace('S', ''));
        });
        
        if (moisFiltre !== 'all') {
            const moisNum = parseInt(moisFiltre);
            labels = labels.filter(label => parSemaine[label].mois === moisNum);
        }
        
        let data = labels.map(label => parSemaine[label].total);
        
        console.log('📊 Labels après filtrage:', labels);
        console.log('📊 Data:', data);
        
        // ====== Mettre à jour le select des semaines ======
        const selectSemaine = document.getElementById('graphSemaineFilter');
        if (selectSemaine) {
            const valActuelle = selectSemaine.value;
            selectSemaine.innerHTML = '<option value="all">Toutes les semaines</option>';
            labels.forEach((label, index) => {
                const opt = document.createElement('option');
                opt.value = label.replace('S', '');
                opt.textContent = label + ' (' + data[index] + ' accidents)';
                selectSemaine.appendChild(opt);
            });
            if (labels.some(l => l.replace('S', '') === valActuelle)) {
                selectSemaine.value = valActuelle;
            }
        }
        
        // ====== Filtrer par semaine ======
        if (semaineFiltre !== 'all' && labels.length > 0) {
            const idx = parseInt(semaineFiltre) - 1;
            if (idx >= 0 && idx < labels.length) {
                labels = [labels[idx]];
                data = [data[idx]];
            }
        }
        
        // ====== Créer le graphique ======
        if (labels.length === 0 || data.every(d => d === 0)) {
            this.chartMensuel = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['Aucune donnée'],
                    datasets: [{ label: "Accidents", data: [0], backgroundColor: '#e8ecf2' }]
                },
                options: { responsive: true, plugins: { legend: { display: false } } }
            });
            return;
        }
        
        this.chartMensuel = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: "Nombre d'accidents",
                    data: data,
                    backgroundColor: '#2d7db8',
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, ticks: { stepSize: 1 } }
                }
            }
        });
    },
        
    // ====== 2. Graphique: Évolution journalière (colonnes) ======
    mettreAJourGraphiqueJournalier: function(donnees) {
        const ctx = document.getElementById('graphChartJournalier');
        if (!ctx) return;
        if (this.chartJournalier) { this.chartJournalier.destroy(); this.chartJournalier = null; }
        
        const jours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
        const data = jours.map(j => {
            return donnees.filter(d => d['_jour_semaine'] === j).length;
        });
        
        const jourFiltre = document.getElementById('graphJourFiltre').value;
        let labels = jours;
        let dataAff = data;
        if (jourFiltre !== 'all') {
            const idx = jours.indexOf(jourFiltre);
            if (idx !== -1) {
                labels = [jours[idx]];
                dataAff = [data[idx]];
            }
        }
        
        this.chartJournalier = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: "Nombre d'accidents",
                    data: dataAff,
                    backgroundColor: '#27ae60',
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, ticks: { stepSize: 1 } }
                }
            }
        });
    },
    
    // ====== 3. Graphique: Évolution par période (colonnes) ======
    mettreAJourGraphiquePeriode: function(donnees) {
        const ctx = document.getElementById('graphChartPeriode');
        if (!ctx) return;
        if (this.chartPeriode) { this.chartPeriode.destroy(); this.chartPeriode = null; }
        
        const heures = Array.from({length: 24}, (_, i) => i);
        const data = heures.map(h => {
            return donnees.filter(d => {
                const heure = d['_heure_accident'];
                if (!heure) return false;
                const hh = parseInt(heure.split(':')[0]);
                return hh === h;
            }).length;
        });
        
        const heureFiltre = document.getElementById('graphHeureFiltre').value;
        let labels = heures.map(h => String(h).padStart(2, '0') + ':00');
        let dataAff = data;
        if (heureFiltre !== 'all') {
            const idx = parseInt(heureFiltre);
            labels = [String(idx).padStart(2, '0') + ':00'];
            dataAff = [data[idx]];
        }
        
        this.chartPeriode = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: "Nombre d'accidents",
                    data: dataAff,
                    backgroundColor: '#e67e22',
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, ticks: { stepSize: 1 } }
                }
            }
        });
    },
    
    // ====== 4. Graphique: Répartition par Cause (doughnut) ======
    mettreAJourGraphiqueCause: function(donnees) {
        const ctx = document.getElementById('graphChartCause');
        if (!ctx) return;
        if (this.chartCause) { this.chartCause.destroy(); this.chartCause = null; }
        
        const type = document.getElementById('graphCauseType').value;
        const col = type === 'principale' ? 'Cause principale' : 'Cause secondaire';
        
        const causes = {};
        donnees.forEach(d => {
            const c = d[col] || 'Non spécifiée';
            causes[c] = (causes[c] || 0) + 1;
        });
        
        const trie = Object.entries(causes).sort((a,b) => b[1]-a[1]).slice(0, 8);
        const labels = trie.map(t => t[0]);
        const data = trie.map(t => t[1]);
        const couleurs = ['#2d7db8', '#4a90c4', '#6ba3d4', '#8bb6e0', '#abc9ec', '#c4dbf5', '#dce9f9', '#eef4fc'];
        
        this.chartCause = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: couleurs.slice(0, labels.length),
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                
                plugins: {
                    legend: { position: 'bottom' },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const total = context.dataset.data.reduce((a,b) => a+b, 0);
                                const p = total > 0 ? ((context.parsed / total) * 100).toFixed(1) : 0;
                                return context.label + ': ' + context.parsed + ' (' + p + '%)';
                            }
                        }
                    }
                }
            }
        });
    },
    
    // ====== 5. Graphique: Répartition par Gravité (doughnut) ======
    // ====== 5. Graphique: Répartition par Gravité (doughnut + étiquettes externes) ======
    mettreAJourGraphiqueGravite: function(donnees) {
        const ctx = document.getElementById('graphChartGravite');
        if (!ctx) return;
        if (this.chartGravite) { this.chartGravite.destroy(); this.chartGravite = null; }
        
        const gravites = ['Corporelle', 'Matérielle', 'Mortelle'];
        const data = gravites.map(g => donnees.filter(d => d['Gravité accident'] === g).length);
        const couleurs = ['#e67e22', '#3498db', '#e74c3c'];
        
        this.chartGravite = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: gravites,
                datasets: [{
                    data: data,
                    backgroundColor: couleurs,
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,   // ✅ AJOUTER CETTE LIGNE

                // ✅ Padding pour faire de la place aux étiquettes externes
                layout: {
                    padding: {
                        top: 20,
                        bottom: 20,
                        left: 100,
                        right: 100
                    }
                },
                plugins: {
                    legend: { position: 'bottom' },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const total = context.dataset.data.reduce((a,b) => a+b, 0);
                                const p = total > 0 ? ((context.parsed / total) * 100).toFixed(1) : 0;
                                return context.label + ': ' + context.parsed + ' (' + p + '%)';
                            }
                        }
                    }
                }
            },
            // ✅ Enregistrer le plugin pour ce graphique
            plugins: [doughnutExternalLabelsPlugin]
        });
    },
    
     // ====== 6. Graphique: Répartition des Victimes (doughnut + étiquettes externes) ======
    mettreAJourGraphiqueVictimes: function(donnees) {
        const ctx = document.getElementById('graphChartVictimes');
        if (!ctx) return;
        if (this.chartVictimes) { this.chartVictimes.destroy(); this.chartVictimes = null; }
        
        let totalTues = 0, totalBG = 0, totalBL = 0;
        donnees.forEach(d => {
            totalTues += parseInt(d['_total_tues'] || 0);
            totalBG += parseInt(d['_total_bg'] || 0);
            totalBL += parseInt(d['_total_bl'] || 0);
        });
        
        const labels = ['Tués', 'BG', 'BL'];
        const data = [totalTues, totalBG, totalBL];
        const couleurs = ['#c0392b', '#e67e22', '#2ecc71'];
        
        this.chartVictimes = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: couleurs,
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,   // ✅ AJOUTER CETTE LIGNE
                // ✅ Padding pour faire de la place aux étiquettes externes
                layout: {
                    padding: {
                        top: 20,
                        bottom: 20,
                        left: 100,
                        right: 100
                    }
                },
                plugins: {
                    legend: { position: 'bottom' },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const total = context.dataset.data.reduce((a,b) => a+b, 0);
                                const p = total > 0 ? ((context.parsed / total) * 100).toFixed(1) : 0;
                                return context.label + ': ' + context.parsed + ' (' + p + '%)';
                            }
                        }
                    }
                }
            },
            // ✅ Enregistrer le plugin pour ce graphique
            plugins: [doughnutExternalLabelsPlugin]
        });
    }
};


// ============================================================
// 10. SECTION PARAMÈTRES - Version Multi-DRR
// ============================================================

const Parametres = {
    directions: ['DRRS', 'DRRN', 'DRRC', 'DRRO', 'DRRE'],
    directionActive: 'DRRS',
    
   
    // ============================================================
    // CHANGEMENT DE DRR (avec réinitialisation complète)
    // ============================================================
    changerDRR: function(drr) {
        console.log('🔄 ===== Changement de DRR: ' + drr + ' =====');
        this.directionActive = drr;
        window.directionActiveCourante = drr;
        
        try {
            localStorage.setItem('drr_actif', drr);
        } catch(e) {}
        
        // Étape 1 : Mettre à jour l'apparence des boutons DRR
        document.querySelectorAll('.drr-tab').forEach(btn => {
            if (btn.dataset.drr === drr) {
                btn.classList.add('active');
                btn.style.background = '#2d7db8';
                btn.style.color = 'white';
                btn.style.border = '2px solid #2d7db8';
            } else {
                btn.classList.remove('active');
                btn.style.background = 'white';
                btn.style.color = '#1a3a5c';
                btn.style.border = '2px solid #d0d8e0';
            }
        });
        
        const drrNom = document.getElementById('drrActifNom');
        if (drrNom) drrNom.textContent = drr;
        // ✅ Mettre à jour le nom dans la sidebar
        const sidebarDrr = document.getElementById('sidebarDrrName');
        if (sidebarDrr) sidebarDrr.textContent = drr;
        
        // Étape 2 : Mettre à jour les constantes + ré-enrichir les données
        // (Utilise le NOUVEAU directionActive pour lire la config correcte)
        this.mettreAJourConstantes();
        
        // Étape 3 : 🆕 Réinitialiser TOUS les filtres de toutes les sections
        this.reinitialiserTousLesFiltres();
        
       // Étape 4 : Recharger les tableaux de paramètres
        this.afficherTroncons();
        this.afficherSocietes();
        this.afficherGendarmerie();
        this.afficherPatrouilleurs();
        this.afficherProtectionCivile();
        this.afficherFourgonMortelle();
        
        // Étape 5 : Rafraîchir tous les onglets (reconstruit les dropdowns)
        this.rafraichirTousLesOnglets();
        this.restaurerEtatCards();
        
        console.log('✅ ===== DRR actif: ' + drr + ' =====');
    },
    // ============================================================
    // CARDS PLIABLES
    // ============================================================
    basculerCard: function(cardId) {
        const card = document.querySelector(`.param-card[data-card="${cardId}"]`);
        if (!card) return;
        
        card.classList.toggle('collapsed');
        
        // Sauvegarder l'état (par DRR)
        const etats = JSON.parse(localStorage.getItem('params_cards_state') || '{}');
        const cle = this.directionActive + '_' + cardId;
        etats[cle] = card.classList.contains('collapsed');
        localStorage.setItem('params_cards_state', JSON.stringify(etats));
    },
    
    restaurerEtatCards: function() {
        const etats = JSON.parse(localStorage.getItem('params_cards_state') || '{}');
        const cards = document.querySelectorAll('.param-card[data-card]');
        cards.forEach(card => {
            const cardId = card.dataset.card;
            const cle = this.directionActive + '_' + cardId;
            if (etats[cle] === true) {
                card.classList.add('collapsed');
            } else {
                card.classList.remove('collapsed');
            }
        });
    },

     // ============================================================
    // BASCULER LA SECTION "Configuration (Admin)"
    // ============================================================
    basculerExportConfig: function() {
        const body = document.getElementById('exportConfigBody');
        const icon = document.getElementById('exportConfigToggleIcon');
        if (!body) return;
        
        const estCache = body.style.display === 'none';
        body.style.display = estCache ? 'block' : 'none';
        if (icon) icon.textContent = estCache ? '▼' : '▶';
        
        try {
            localStorage.setItem('export_config_collapsed', estCache ? 'false' : 'true');
        } catch(e) {}
    },
    
    restaurerEtatExportConfig: function() {
        try {
            const collapsed = localStorage.getItem('export_config_collapsed');
            if (collapsed === 'true') {
                const body = document.getElementById('exportConfigBody');
                const icon = document.getElementById('exportConfigToggleIcon');
                if (body) body.style.display = 'none';
                if (icon) icon.textContent = '▶';
            }
        } catch(e) {}
    },

    // ============================================================
    // RÉINITIALISER TOUS LES FILTRES (appelé lors du changement de DRR)
    // Chaque section repart de zéro avec les nouveaux paramètres du DRR
    // ============================================================
    reinitialiserTousLesFiltres: function() {
        console.log('🧹 Réinitialisation de tous les filtres...');
        
        // --- Helpers ---
        const resetMulti = (id) => {
            const sel = document.getElementById(id);
            if (!sel) return;
            Array.from(sel.options).forEach(opt => {
                opt.selected = (opt.value === 'all');
            });
        };
        
        const resetSelect = (id, val) => {
            const sel = document.getElementById(id);
            if (sel) sel.value = val;
        };
        
        const resetCheck = (id, val) => {
            const cb = document.getElementById(id);
            if (cb) cb.checked = val;
        };
        
        // ========== 1. ANALYSE ==========
        resetMulti('analyseTronconFilter');
        resetMulti('analyseMoisFilter');
        resetCheck('filterTues', true);
        resetCheck('filterBG', true);
        resetCheck('filterBL', true);
        
        // ========== 2. INTERVENANTS ==========
        resetMulti('intervTronconFilter');
        resetMulti('intervMoisFilter');
        resetSelect('intervTypeFilter', 'all');
        resetSelect('intervEntiteFilter', 'all');
        
        // Masquer le filtre entité (car Type = all)
        const entiteGroup = document.getElementById('entiteFilterGroup');
        if (entiteGroup) entiteGroup.style.display = 'none';
        
        // ========== 3. DÉPANNEURS ==========
        resetMulti('depTronconFilter');
        resetMulti('depMoisFilter');
        resetMulti('depSocieteFilter');
        resetSelect('depTypeFilter', 'all');
        
        // ========== 4. GRAPHIQUES ==========
        resetSelect('graphTronconFilter', 'all');
        resetSelect('graphMoisFilter', 'all');
        resetSelect('graphSemaineFilter', 'all');
        resetSelect('graphJourFiltre', 'all');
        resetSelect('graphHeureFiltre', 'all');
        resetSelect('graphCauseType', 'principale');
        
        // ========== 5. RAPPROCHEMENT ==========
        resetMulti('rappTronconFilter');
        resetMulti('rappMoisFilter');
        
        // ========== 6. ZACC (état interne + boutons) ==========
        if (typeof ZACC !== 'undefined') {
            ZACC.pariteActuelle = 'paire';
            ZACC.directionActuelle = 'tous';
            
            const btnPaire = document.getElementById('zaccBtnPaire');
            const btnImpaire = document.getElementById('zaccBtnImpaire');
            const btnTous = document.getElementById('zaccBtnTous');
            const btnCroissant = document.getElementById('zaccBtnCroissant');
            const btnDecroissant = document.getElementById('zaccBtnDecroissant');
            
            if (btnPaire) {
                btnPaire.style.background = '#2d7db8';
                btnPaire.style.color = 'white';
                btnPaire.style.border = '2px solid #2d7db8';
            }
            if (btnImpaire) {
                btnImpaire.style.background = 'white';
                btnImpaire.style.color = '#1a3a5c';
                btnImpaire.style.border = '2px solid #d0d8e0';
            }
            if (btnTous) {
                btnTous.style.background = '#2d7db8';
                btnTous.style.color = 'white';
                btnTous.style.border = '2px solid #2d7db8';
            }
            if (btnCroissant) {
                btnCroissant.style.background = 'white';
                btnCroissant.style.color = '#1a3a5c';
                btnCroissant.style.border = '2px solid #d0d8e0';
            }
            if (btnDecroissant) {
                btnDecroissant.style.background = 'white';
                btnDecroissant.style.color = '#1a3a5c';
                btnDecroissant.style.border = '2px solid #d0d8e0';
            }
        }
        
        console.log('✅ Tous les filtres réinitialisés');
    },
    rafraichirTousLesOnglets: function() {
        console.log('🔄 Rafraîchissement de tous les onglets...');
        
        if (typeof Analyse !== 'undefined' && Analyse.init) Analyse.init();
        if (typeof Intervenants !== 'undefined' && Intervenants.init) Intervenants.init();
        if (typeof Depanneurs !== 'undefined' && Depanneurs.init) Depanneurs.init();
        
        if (typeof Graphiques !== 'undefined') {
            if (Graphiques.mettreAJourFiltres) Graphiques.mettreAJourFiltres();
            if (Graphiques.appliquerFiltres) Graphiques.appliquerFiltres();
        }
        
        if (typeof ZACC !== 'undefined' && ZACC.appliquerFiltres) {
            ZACC.appliquerFiltres();
        }
        
        console.log('✅ Tous les onglets rafraîchis');
    },
    
    // ============================================================
    // CLÉS localStorage PAR DRR
    // ============================================================
    getCleConfig: function(type) {
        return 'config_' + this.directionActive + '_' + type;
    },
    
    // ============================================================
    // DONNÉES PAR DÉFAUT
    // ============================================================
    getDefaultData: function() {
        return {
            troncons: [
                { id: 'T1', axe: 'A3', pk_min: 27000, pk_max: 106000 },
                { id: 'T2', axe: 'A3', pk_min: 106001, pk_max: 198000 },
                { id: 'T2_2', axe: 'A301', pk_min: 0, pk_max: 13000 },
                { id: 'T3', axe: 'A3', pk_min: 198001, pk_max: 282000 },
                { id: 'T4', axe: 'A3', pk_min: 282001, pk_max: 430000 }
            ],
            societes: [
                { nom: 'TransAlmahata 1', axe: 'A3', pk_min: 27000, pk_max: 65000, date_entree: '2010-01-01', date_sortie: '2028-12-31' },
                { nom: 'TransAlmahata 2', axe: 'A3', pk_min: 65001, pk_max: 127000, date_entree: '2010-01-01', date_sortie: '2028-12-31' },
                { nom: 'Ezziraoui', axe: 'A3', pk_min: 127001, pk_max: 160000, date_entree: '2025-04-01', date_sortie: '2028-12-31' },
                { nom: 'INT Assistance', axe: 'A3', pk_min: 160001, pk_max: 249000, date_entree: '2025-04-01', date_sortie: '2028-12-31' },
                { nom: 'INT Assistance', axe: 'A301', pk_min: 0, pk_max: 13000, date_entree: '2025-04-01', date_sortie: '2028-12-31' },
                { nom: 'Routier Multi Service et INT Assistance', axe: 'A3', pk_min: 249001, pk_max: 310000, date_entree: '2025-04-01', date_sortie: '2028-12-31' },
                { nom: 'Grand Sud', axe: 'A3', pk_min: 310001, pk_max: 430000, date_entree: '2025-04-01', date_sortie: '2028-12-31' },
                { nom: 'Essalam Assistance', axe: 'A3', pk_min: 199001, pk_max: 430000, date_entree: '2010-01-01', date_sortie: '2025-03-31' },
                { nom: 'INSAF Secour', axe: 'A3', pk_min: 127001, pk_max: 199000, date_entree: '2010-01-01', date_sortie: '2025-03-31' },
                { nom: 'INSAF Secour', axe: 'A301', pk_min: 0, pk_max: 13000, date_entree: '2010-01-01', date_sortie: '2025-03-31' }
            ],
            gendarmerie: [
                { nom: 'PMA Settat', axe: 'A3', pk_min: 27000, pk_max: 106000 },
                { nom: 'PMA Skhour', axe: 'A3', pk_min: 106001, pk_max: 140000 },
                { nom: 'PMA Bengurir', axe: 'A3', pk_min: 140001, pk_max: 187000 },
                { nom: 'PMA Palmeraie', axe: 'A3', pk_min: 187001, pk_max: 198000 },
                { nom: 'PMA Palmeraie', axe: 'A301', pk_min: 0, pk_max: 13000 },
                { nom: 'PMA Targa', axe: 'A3', pk_min: 198001, pk_max: 246500 },
                { nom: 'PMA Chihcaoua', axe: 'A3', pk_min: 246501, pk_max: 290000 },
                { nom: 'PMA Imintanout', axe: 'A3', pk_min: 290001, pk_max: 380000 },
                { nom: 'PMA Amskroud', axe: 'A3', pk_min: 380001, pk_max: 430000 }
            ],
            patrouilleurs: [],
            protectionCivile: [],
            fourgonMortelle: []
        };
    },
    
    getDefaultDataForDRR: function(drr) {
        if (drr === 'DRRS') {
            return this.getDefaultData();
        }
        return {
            troncons: [],
            societes: [],
            gendarmerie: [],
            patrouilleurs: [],
            protectionCivile: [],
            fourgonMortelle: []
        };
    },
    
    // ============================================================
    // CHARGER / SAUVEGARDER (par DRR)
    // ============================================================
    chargerDonnees: function(type) {
        const key = this.getCleConfig(type);
        try {
            const data = localStorage.getItem(key);
            if (data) {
                const parsed = JSON.parse(data);
                if (parsed && Array.isArray(parsed)) return parsed;
            }
        } catch(e) {}
        
        const defaults = this.getDefaultDataForDRR(this.directionActive);
        return defaults[type] || [];
    },
    
    sauvegarderDonnees: function(type, data) {
        const key = this.getCleConfig(type);
        try {
            localStorage.setItem(key, JSON.stringify(data));
            console.log('💾 Config sauvegardée:', key, data.length, 'éléments');
            return true;
        } catch(e) {
            console.warn('❌ Erreur sauvegarde config:', e);
            return false;
        }
    },
    
    // ============================================================
    // AFFICHER LES TRONÇONS
    // ============================================================
    afficherTroncons: function() {
        const data = this.chargerDonnees('troncons');
        const tbody = document.getElementById('tronconsBody');
        if (!tbody) return;
        
        tbody.innerHTML = data.map((item, index) => `
            <tr>
                <td><input type="text" value="${item.id || ''}" data-index="${index}" data-field="id" class="editable" style="width:70px;"></td>
                <td><input type="text" value="${item.axe || ''}" data-index="${index}" data-field="axe" class="editable" style="width:70px;"></td>
                <td><input type="number" value="${item.pk_min || 0}" data-index="${index}" data-field="pk_min" class="editable" style="width:90px;"></td>
                <td><input type="number" value="${item.pk_max || 0}" data-index="${index}" data-field="pk_max" class="editable" style="width:90px;"></td>
                <td><button class="btn-delete" onclick="Parametres.supprimerLigne('troncons', ${index})">🗑️</button></td>
            </tr>
        `).join('');
    },
    
    // ============================================================
    // AFFICHER LES SOCIÉTÉS
    // ============================================================
    afficherSocietes: function() {
        const data = this.chargerDonnees('societes');
        const tbody = document.getElementById('societesBody');
        if (!tbody) return;
        
        tbody.innerHTML = data.map((item, index) => `
            <tr>
                <td><input type="text" value="${item.nom || ''}" data-index="${index}" data-field="nom" class="editable" style="width:150px;"></td>
                <td><input type="text" value="${item.axe || ''}" data-index="${index}" data-field="axe" class="editable" style="width:70px;"></td>
                <td><input type="number" value="${item.pk_min || 0}" data-index="${index}" data-field="pk_min" class="editable" style="width:90px;"></td>
                <td><input type="number" value="${item.pk_max || 0}" data-index="${index}" data-field="pk_max" class="editable" style="width:90px;"></td>
                <td><input type="date" value="${item.date_entree || '2024-01-01'}" data-index="${index}" data-field="date_entree" class="editable" style="width:130px;"></td>
                <td><input type="date" value="${item.date_sortie || '2026-12-31'}" data-index="${index}" data-field="date_sortie" class="editable" style="width:130px;"></td>
                <td><button class="btn-delete" onclick="Parametres.supprimerLigne('societes', ${index})">🗑️</button></td>
            </tr>
        `).join('');
    },
    
    // ============================================================
    // AFFICHER LA GENDARMERIE
    // ============================================================
    afficherGendarmerie: function() {
        const data = this.chargerDonnees('gendarmerie');
        const tbody = document.getElementById('gendarmerieBody');
        if (!tbody) return;
        
        tbody.innerHTML = data.map((item, index) => `
            <tr>
                <td><input type="text" value="${item.nom || ''}" data-index="${index}" data-field="nom" class="editable" style="width:150px;"></td>
                <td><input type="text" value="${item.axe || ''}" data-index="${index}" data-field="axe" class="editable" style="width:70px;"></td>
                <td><input type="number" value="${item.pk_min || 0}" data-index="${index}" data-field="pk_min" class="editable" style="width:90px;"></td>
                <td><input type="number" value="${item.pk_max || 0}" data-index="${index}" data-field="pk_max" class="editable" style="width:90px;"></td>
                <td><button class="btn-delete" onclick="Parametres.supprimerLigne('gendarmerie', ${index})">🗑️</button></td>
            </tr>
        `).join('');
    },

    // ============================================================
    // AFFICHER LES PATROUILLEURS
    // ============================================================
    afficherPatrouilleurs: function() {
        const data = this.chargerDonnees('patrouilleurs');
        const tbody = document.getElementById('patrouilleursBody');
        if (!tbody) return;
        tbody.innerHTML = data.map((item, index) => `
            <tr>
                <td><input type="text" value="${item.id || ''}" data-index="${index}" data-field="id" class="editable" style="width:90px;"></td>
                <td><input type="text" value="${item.axe || ''}" data-index="${index}" data-field="axe" class="editable" style="width:70px;"></td>
                <td><input type="number" value="${item.pk_min || 0}" data-index="${index}" data-field="pk_min" class="editable" style="width:90px;"></td>
                <td><input type="number" value="${item.pk_max || 0}" data-index="${index}" data-field="pk_max" class="editable" style="width:90px;"></td>
                <td><button class="btn-delete" onclick="Parametres.supprimerLigne('patrouilleurs', ${index})">🗑️</button></td>
            </tr>
        `).join('');
    },

    // ============================================================
    // AFFICHER LA PROTECTION CIVILE
    // ============================================================
    afficherProtectionCivile: function() {
        const data = this.chargerDonnees('protectionCivile');
        const tbody = document.getElementById('protectionCivileBody');
        if (!tbody) return;
        tbody.innerHTML = data.map((item, index) => `
            <tr>
                <td><input type="text" value="${item.id || ''}" data-index="${index}" data-field="id" class="editable" style="width:90px;"></td>
                <td><input type="text" value="${item.axe || ''}" data-index="${index}" data-field="axe" class="editable" style="width:70px;"></td>
                <td><input type="number" value="${item.pk_min || 0}" data-index="${index}" data-field="pk_min" class="editable" style="width:90px;"></td>
                <td><input type="number" value="${item.pk_max || 0}" data-index="${index}" data-field="pk_max" class="editable" style="width:90px;"></td>
                <td><button class="btn-delete" onclick="Parametres.supprimerLigne('protectionCivile', ${index})">🗑️</button></td>
            </tr>
        `).join('');
    },

    // ============================================================
    // AFFICHER LE FOURGON MORTELLE
    // ============================================================
    afficherFourgonMortelle: function() {
        const data = this.chargerDonnees('fourgonMortelle');
        const tbody = document.getElementById('fourgonMortelleBody');
        if (!tbody) return;
        tbody.innerHTML = data.map((item, index) => `
            <tr>
                <td><input type="text" value="${item.id || ''}" data-index="${index}" data-field="id" class="editable" style="width:90px;"></td>
                <td><input type="text" value="${item.axe || ''}" data-index="${index}" data-field="axe" class="editable" style="width:70px;"></td>
                <td><input type="number" value="${item.pk_min || 0}" data-index="${index}" data-field="pk_min" class="editable" style="width:90px;"></td>
                <td><input type="number" value="${item.pk_max || 0}" data-index="${index}" data-field="pk_max" class="editable" style="width:90px;"></td>
                <td><button class="btn-delete" onclick="Parametres.supprimerLigne('fourgonMortelle', ${index})">🗑️</button></td>
            </tr>
        `).join('');
    },

    // ============================================================
    // AJOUTER DES LIGNES
    // ============================================================
    ajouterPatrouilleur: function() {
        const data = this.chargerDonnees('patrouilleurs');
        data.push({ id: 'PAT' + (data.length + 1), axe: 'A3', pk_min: 0, pk_max: 0 });
        this.sauvegarderDonnees('patrouilleurs', data);
        this.afficherPatrouilleurs();
    },

    ajouterProtectionCivile: function() {
        const data = this.chargerDonnees('protectionCivile');
        data.push({ id: 'PC' + (data.length + 1), axe: 'A3', pk_min: 0, pk_max: 0 });
        this.sauvegarderDonnees('protectionCivile', data);
        this.afficherProtectionCivile();
    },

    ajouterFourgonMortelle: function() {
        const data = this.chargerDonnees('fourgonMortelle');
        data.push({ id: 'FM' + (data.length + 1), axe: 'A3', pk_min: 0, pk_max: 0 });
        this.sauvegarderDonnees('fourgonMortelle', data);
        this.afficherFourgonMortelle();
    },

    // ============================================================
    // SAUVEGARDER LES MODIFICATIONS
    // ============================================================
    sauvegarderPatrouilleurs: function() {
        const inputs = document.querySelectorAll('#patrouilleursBody .editable');
        const data = this.chargerDonnees('patrouilleurs');
        inputs.forEach(input => {
            const index = parseInt(input.dataset.index);
            const field = input.dataset.field;
            if (data[index]) data[index][field] = input.value;
        });
        this.sauvegarderDonnees('patrouilleurs', data);
        alert('✅ Patrouilleurs sauvegardés!');
        this.mettreAJourConstantes();
    },

    sauvegarderProtectionCivile: function() {
        const inputs = document.querySelectorAll('#protectionCivileBody .editable');
        const data = this.chargerDonnees('protectionCivile');
        inputs.forEach(input => {
            const index = parseInt(input.dataset.index);
            const field = input.dataset.field;
            if (data[index]) data[index][field] = input.value;
        });
        this.sauvegarderDonnees('protectionCivile', data);
        alert('✅ Protection Civile sauvegardée!');
        this.mettreAJourConstantes();
    },

    sauvegarderFourgonMortelle: function() {
        const inputs = document.querySelectorAll('#fourgonMortelleBody .editable');
        const data = this.chargerDonnees('fourgonMortelle');
        inputs.forEach(input => {
            const index = parseInt(input.dataset.index);
            const field = input.dataset.field;
            if (data[index]) data[index][field] = input.value;
        });
        this.sauvegarderDonnees('fourgonMortelle', data);
        alert('✅ Fourgon Mortelle sauvegardé!');
        this.mettreAJourConstantes();
    },
    
    // ============================================================
    // AJOUTER DES LIGNES
    // ============================================================
    ajouterTroncon: function() {
        const data = this.chargerDonnees('troncons');
        const newId = 'T' + (data.length + 1);
        data.push({ id: newId, axe: 'A3', pk_min: 0, pk_max: 0 });
        this.sauvegarderDonnees('troncons', data);
        this.afficherTroncons();
    },
    
    ajouterSociete: function() {
        const data = this.chargerDonnees('societes');
        data.push({
            nom: 'Nouvelle Société',
            axe: 'A3',
            pk_min: 0,
            pk_max: 0,
            date_entree: '2024-01-01',
            date_sortie: '2026-12-31'
        });
        this.sauvegarderDonnees('societes', data);
        this.afficherSocietes();
    },
    
    ajouterGendarmerie: function() {
        const data = this.chargerDonnees('gendarmerie');
        data.push({ nom: 'Nouvelle PMA', axe: 'A3', pk_min: 0, pk_max: 0 });
        this.sauvegarderDonnees('gendarmerie', data);
        this.afficherGendarmerie();
    },
    
    // ============================================================
    // SUPPRIMER UNE LIGNE
    // ============================================================
    supprimerLigne: function(type, index) {
        if (!confirm('Voulez-vous vraiment supprimer cette ligne ?')) return;
        const data = this.chargerDonnees(type);
        data.splice(index, 1);
        this.sauvegarderDonnees(type, data);
        switch(type) {
            case 'troncons': this.afficherTroncons(); break;
            case 'societes': this.afficherSocietes(); break;
            case 'gendarmerie': this.afficherGendarmerie(); break;
            case 'patrouilleurs': this.afficherPatrouilleurs(); break;
            case 'protectionCivile': this.afficherProtectionCivile(); break;
            case 'fourgonMortelle': this.afficherFourgonMortelle(); break;
        }
    },
    
    // ============================================================
    // SAUVEGARDER LES MODIFICATIONS
    // ============================================================
    sauvegarderTroncons: function() {
        const inputs = document.querySelectorAll('#tronconsBody .editable');
        const data = this.chargerDonnees('troncons');
        inputs.forEach(input => {
            const index = parseInt(input.dataset.index);
            const field = input.dataset.field;
            if (data[index]) data[index][field] = input.value;
        });
        this.sauvegarderDonnees('troncons', data);
        alert('✅ Tronçons sauvegardés!');
        this.mettreAJourConstantes();
    },
    
    sauvegarderSocietes: function() {
        const inputs = document.querySelectorAll('#societesBody .editable');
        const data = this.chargerDonnees('societes');
        inputs.forEach(input => {
            const index = parseInt(input.dataset.index);
            const field = input.dataset.field;
            if (data[index]) data[index][field] = input.value;
        });
        this.sauvegarderDonnees('societes', data);
        alert('✅ Sociétés sauvegardées!');
        this.mettreAJourConstantes();
    },
    
    sauvegarderGendarmerie: function() {
        const inputs = document.querySelectorAll('#gendarmerieBody .editable');
        const data = this.chargerDonnees('gendarmerie');
        inputs.forEach(input => {
            const index = parseInt(input.dataset.index);
            const field = input.dataset.field;
            if (data[index]) data[index][field] = input.value;
        });
        this.sauvegarderDonnees('gendarmerie', data);
        alert('✅ Gendarmerie sauvegardée!');
        this.mettreAJourConstantes();
    },
    
    // ============================================================
    // METTRE À JOUR LES CONSTANTES
    // ============================================================
    mettreAJourConstantes: function() {
        console.log('🔄 Mise à jour des constantes pour:', this.directionActive);
        
        const troncons = this.chargerDonnees('troncons');
        const societes = this.chargerDonnees('societes');
        const gendarmerie = this.chargerDonnees('gendarmerie');
        const patrouilleurs = this.chargerDonnees('patrouilleurs');
        const protectionCivile = this.chargerDonnees('protectionCivile');
        const fourgonMortelle = this.chargerDonnees('fourgonMortelle');
        
        // TRONCONS
        window.TRONCONS = {};
        troncons.forEach(t => {
            window.TRONCONS[t.id] = {
                min: parseInt(t.pk_min),
                max: parseInt(t.pk_max),
                label: `PK ${t.pk_min} - PK ${t.pk_max}`,
                axe: t.axe,
                direction: this.directionActive
            };
        });
        
        // SOCIETES
        window.SOCIETES_DEPANNAGE = {};
        societes.forEach(s => {
            const key = s.nom + '_' + (s.axe || '') + '_' + (s.date_entree || '');
            window.SOCIETES_DEPANNAGE[key] = {
                min: parseInt(s.pk_min),
                max: parseInt(s.pk_max),
                axe: s.axe,
                direction: this.directionActive,
                nom: s.nom,
                date_entree: s.date_entree,
                date_sortie: s.date_sortie
            };
        });
        
        // GENDARMERIE
        window.GENDARMERIE = gendarmerie.map(g => ({
            nom: g.nom,
            direction: this.directionActive,
            axe: g.axe,
            min: parseInt(g.pk_min),
            max: parseInt(g.pk_max)
        }));
        // PATROUILLEURS
        window.PATROUILLEURS = patrouilleurs.map(p => ({
            nom: p.id,
            direction: this.directionActive,
            axe: p.axe,
            min: parseInt(p.pk_min),
            max: parseInt(p.pk_max)
        }));
        
        // PROTECTION CIVILE
        window.PROTECTION_CIVILE = protectionCivile.map(p => ({
            nom: p.id,
            direction: this.directionActive,
            axe: p.axe,
            min: parseInt(p.pk_min),
            max: parseInt(p.pk_max)
        }));
        
        // FOURGON MORTELLE
        window.FOURGON_MORTELLE = fourgonMortelle.map(p => ({
            nom: p.id,
            direction: this.directionActive,
            axe: p.axe,
            min: parseInt(p.pk_min),
            max: parseInt(p.pk_max)
        }));
        
        console.log('✅ Constantes mises à jour pour:', this.directionActive);
        
        // Ré-enrichir les données
        if (toutesLesDonnees && toutesLesDonnees.length > 0) {
            console.log('🔄 Ré-enrichissement des données...');
            toutesLesDonnees = enrichirDonnees(toutesLesDonnees);
            sauvegarderDonnees(toutesLesDonnees);
            console.log('✅ Données ré-enrichies');
        }
    },
    
    // ============================================================
    // GITHUB API - TOKEN
    // ============================================================
    sauvegarderToken: function() {
        const token = document.getElementById('githubToken').value.trim();
        
        if (!token) {
            alert('❌ Veuillez entrer un token');
            return;
        }
        
        if (!token.startsWith('ghp_') && !token.startsWith('github_pat_')) {
            alert('❌ Format de token invalide\n\nLe token doit commencer par "ghp_" ou "github_pat_"');
            return;
        }
        
        try {
            localStorage.setItem('github_token', token);
            document.getElementById('githubToken').value = '';
            this.mettreAJourGithubStatus();
            alert('✅ Token enregistré avec succès!');
        } catch(e) {
            alert('❌ Erreur: ' + e.message);
        }
    },
    
    supprimerToken: function() {
        if (!confirm('⚠️ Supprimer le token GitHub ?')) return;
        localStorage.removeItem('github_token');
        this.mettreAJourGithubStatus();
        alert('✅ Token supprimé');
    },
    
    mettreAJourGithubStatus: function() {
        const token = localStorage.getItem('github_token');
        const statusDiv = document.getElementById('githubStatus');
        if (!statusDiv) return;
        
        if (token) {
            const derniereSauvegarde = localStorage.getItem('github_last_save') || 'Jamais';
            statusDiv.innerHTML = `✅ Connecté à GitHub<br>📅 Dernière sauvegarde : ${derniereSauvegarde}`;
            statusDiv.style.background = '#e8f5e9';
            statusDiv.style.color = '#2e7d32';
        } else {
            statusDiv.innerHTML = '⚪ Non connecté à GitHub (mode manuel uniquement)';
            statusDiv.style.background = '#f8fafc';
            statusDiv.style.color = '#6b7a8f';
        }
    },
    
    // ============================================================
    // SAUVEGARDER VERS GITHUB
    // ============================================================
    sauvegarderVersGitHub: async function() {
        const token = localStorage.getItem('github_token');
        
        if (!token) {
            alert('❌ Aucun token GitHub configuré\n\nVeuillez d\'abord enregistrer un token.');
            return;
        }
        
        if (!confirm('☁️ Sauvegarder la configuration vers GitHub ?\n\nLe fichier data/config.json sera mis à jour.')) return;
        
        // Construire le contenu
        const drrs = ['DRRS', 'DRRN', 'DRRC', 'DRRO', 'DRRE'];
        const config = {};
        
        drrs.forEach(drr => {
           config[drr] = {
                troncons: JSON.parse(localStorage.getItem('config_' + drr + '_troncons') || '[]'),
                societes: JSON.parse(localStorage.getItem('config_' + drr + '_societes') || '[]'),
                gendarmerie: JSON.parse(localStorage.getItem('config_' + drr + '_gendarmerie') || '[]'),
                patrouilleurs: JSON.parse(localStorage.getItem('config_' + drr + '_patrouilleurs') || '[]'),
                protectionCivile: JSON.parse(localStorage.getItem('config_' + drr + '_protectionCivile') || '[]'),
                fourgonMortelle: JSON.parse(localStorage.getItem('config_' + drr + '_fourgonMortelle') || '[]')
            };
        });
        
        const contenuJSON = JSON.stringify(config, null, 4);
        const contenuBase64 = btoa(unescape(encodeURIComponent(contenuJSON)));
        
        const statusDiv = document.getElementById('githubStatus');
        statusDiv.innerHTML = '⏳ Sauvegarde en cours...';
        statusDiv.style.background = '#fff3e0';
        statusDiv.style.color = '#e65100';
        
        try {
            const owner = 'Nouari-Abdelkabir';
            const repo = 'Accidentologie';
            const path = 'data/config.json';
            const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
            
            // Étape A: Obtenir le SHA
            const getResponse = await fetch(apiUrl, {
                headers: {
                    'Authorization': `token ${token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });
            
            let sha = null;
            if (getResponse.ok) {
                const data = await getResponse.json();
                sha = data.sha;
            } else if (getResponse.status !== 404) {
                throw new Error(`Impossible de récupérer le fichier (${getResponse.status})`);
            }
            
            // Étape B: Envoyer la mise à jour
            const body = {
                message: `⚙️ Mise à jour config (${new Date().toLocaleString('fr-FR')})`,
                content: contenuBase64,
                branch: 'main'
            };
            
            if (sha) body.sha = sha;
            
            const putResponse = await fetch(apiUrl, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });
            
            if (!putResponse.ok) {
                const errorData = await putResponse.json();
                throw new Error(errorData.message || `Erreur ${putResponse.status}`);
            }
            
            const dateStr = new Date().toLocaleString('fr-FR');
            localStorage.setItem('github_last_save', dateStr);
            
            statusDiv.innerHTML = `✅ Sauvegardé sur GitHub à ${dateStr}`;
            statusDiv.style.background = '#e8f5e9';
            statusDiv.style.color = '#2e7d32';
            
            alert('✅ Configuration sauvegardée sur GitHub!\n\n' +
                  '📁 Fichier: data/config.json\n' +
                  '📅 Date: ' + dateStr + '\n\n' +
                  '💡 Les modifications seront visibles dans ~1 minute.');
            
        } catch(e) {
            console.error('❌ Erreur:', e);
            statusDiv.innerHTML = `❌ Erreur : ${e.message}`;
            statusDiv.style.background = '#ffebee';
            statusDiv.style.color = '#c62828';
            alert('❌ Erreur lors de la sauvegarde :\n\n' + e.message);
        }
    },
    
    // ============================================================
    // EXPORTER MANUELLEMENT
    // ============================================================
    exporterConfigJSON: function() {
        const drrs = ['DRRS', 'DRRN', 'DRRC', 'DRRO', 'DRRE'];
        const config = {};
        
        drrs.forEach(drr => {
            config[drr] = {
                troncons: JSON.parse(localStorage.getItem('config_' + drr + '_troncons') || '[]'),
                societes: JSON.parse(localStorage.getItem('config_' + drr + '_societes') || '[]'),
                gendarmerie: JSON.parse(localStorage.getItem('config_' + drr + '_gendarmerie') || '[]'),
                patrouilleurs: JSON.parse(localStorage.getItem('config_' + drr + '_patrouilleurs') || '[]'),
                protectionCivile: JSON.parse(localStorage.getItem('config_' + drr + '_protectionCivile') || '[]'),
                fourgonMortelle: JSON.parse(localStorage.getItem('config_' + drr + '_fourgonMortelle') || '[]')
            };
        });
        
        const contenuJSON = JSON.stringify(config, null, 4);
        const blob = new Blob([contenuJSON], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'config.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        alert('✅ Fichier config.json exporté!\n\n📁 Instructions :\n1. Ouvrez GitHub\n2. Allez sur data/config.json\n3. Cliquez sur Edit\n4. Collez le contenu du fichier téléchargé\n5. Commit changes');
    },
    
    // ============================================================
    // INITIALISATION
    // ============================================================
    init: async function() {
        console.log('⚙️ Initialisation des paramètres...');
        
        // Restaurer le dernier DRR actif
        try {
            const drrSauvegarde = localStorage.getItem('drr_actif');
            if (drrSauvegarde && this.directions.includes(drrSauvegarde)) {
                this.directionActive = drrSauvegarde;
                window.directionActiveCourante = drrSauvegarde;
                console.log('✅ DRR restauré:', drrSauvegarde);
            }
        } catch(e) {}
        
        // Charger depuis GitHub si nécessaire
        await initialiserConfiguration();
        
        // Créer les données par défaut si nécessaire (par DRR)
        this.directions.forEach(drr => {
            const types = ['troncons', 'societes', 'gendarmerie', 'patrouilleurs', 'protectionCivile', 'fourgonMortelle'];
            types.forEach(type => {
                const key = 'config_' + drr + '_' + type;
                if (!localStorage.getItem(key)) {
                    const defaultData = this.getDefaultDataForDRR(drr)[type] || [];
                    localStorage.setItem(key, JSON.stringify(defaultData));
                }
            });
        });
        
        // Afficher les tableaux
        this.afficherTroncons();
        this.afficherSocietes();
        this.afficherGendarmerie();
        this.afficherPatrouilleurs();
        this.afficherProtectionCivile();
        this.afficherFourgonMortelle();
        
        // Mettre à jour les constantes
        this.mettreAJourConstantes();
        
        // Mettre à jour l'onglet actif
        document.querySelectorAll('.drr-tab').forEach(btn => {
            if (btn.dataset.drr === this.directionActive) {
                btn.classList.add('active');
                btn.style.background = '#2d7db8';
                btn.style.color = 'white';
                btn.style.border = '2px solid #2d7db8';
            } else {
                btn.classList.remove('active');
                btn.style.background = 'white';
                btn.style.color = '#1a3a5c';
                btn.style.border = '2px solid #d0d8e0';
            }
        });
        
        const drrNom = document.getElementById('drrActifNom');
        if (drrNom) drrNom.textContent = this.directionActive;
        // ✅ Mettre à jour le nom dans la sidebar
        const sidebarDrr = document.getElementById('sidebarDrrName');
        if (sidebarDrr) sidebarDrr.textContent = this.directionActive;
        // Restaurer l'état de la section Export Config
        this.restaurerEtatExportConfig();
        
        console.log('✅ Paramètres initialisés pour:', this.directionActive);
    }
};

// ============================================================
// 11. REINITIALISATION GLOBALE
// ============================================================

function reinitialiserTout() {
    console.log('🔄 Réinitialisation de tous les affichages...');
    
    // قسم التحليل
    if (typeof Analyse !== 'undefined' && Analyse.init) {
        Analyse.init();
    }
    
    // قسم المتدخلين
    if (typeof Intervenants !== 'undefined' && Intervenants.appliquerFiltres) {
        Intervenants.appliquerFiltres();
    }
    
    // قسم المزودين
    if (typeof Depanneurs !== 'undefined' && Depanneurs.mettreAJourTableau) {
        Depanneurs.mettreAJourTableau();
    }
    
    // لوحة القيادة
    if (typeof Graphiques !== 'undefined' && Graphiques.mettreAJour) {
        Graphiques.mettreAJour();
    }
}

// ============================================================
// 12. NAVIGATION
// ============================================================

function changerPage(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const pageEl = document.getElementById('page-' + page);
    if (pageEl) pageEl.classList.add('active');
     // ✅ Mode accueil (mobile) : cache la sidebar
    if (window.innerWidth <= 768) {
        if (page === 'accueil') {
            document.body.classList.add('accueil-mode');
        } else {
            document.body.classList.remove('accueil-mode');
        }
    }
    
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    const btn = document.querySelector('.nav-btn[data-page="' + page + '"]');
    if (btn) btn.classList.add('active');
    
    // إظهار/إخفاء الفلاتر الخاصة
    const interventionGroup = document.getElementById('interventionFilterGroup');
    const depGroup = document.getElementById('depanneurFilterGroup');
    const entiteGroup = document.getElementById('entiteFilterGroup');
    
    if (interventionGroup) interventionGroup.style.display = 'none';
    if (depGroup) depGroup.style.display = 'none';
    if (entiteGroup) entiteGroup.style.display = 'none';
    
    if (page === 'intervenants') {
        if (interventionGroup) interventionGroup.style.display = 'flex';
        // Afficher le filtre entité seulement si le Type le justifie
        if (typeof Intervenants !== 'undefined' && Intervenants.gererAffichageEntite) {
            Intervenants.gererAffichageEntite();
        }
    } else if (page === 'depanneurs') {
        if (depGroup) depGroup.style.display = 'flex';
    }
    
    setTimeout(() => {
        if (page === 'analyse') {
            Analyse.init();
        } else if (page === 'intervenants') {
            Intervenants.appliquerFiltres();
        } else if (page === 'depanneurs') {
            Depanneurs.appliquerFiltres();
        } else if (page === 'graphiques') {
            if (typeof Graphiques !== 'undefined') {
                if (Graphiques.mettreAJourFiltres) Graphiques.mettreAJourFiltres();
                if (Graphiques.appliquerFiltres) Graphiques.appliquerFiltres();
            }
        }
    }, 100);
}

// ============================================================
// 13. ÉVÉNEMENTS
// ============================================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM chargé');
    // ✅ Sur mobile : démarrer sur la page d'accueil
    if (window.innerWidth <= 768) {
        // Retirer "active" de la page chargement
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        const accueil = document.getElementById('page-accueil');
        if (accueil) accueil.classList.add('active');
        document.body.classList.add('accueil-mode');
    }
    // ====== Initialiser le label de l'année ======
    mettreAJourAnneeLabel();

    // ====== Écouter le changement d'année ======
    const selectAnnee = document.getElementById('chargementAnneeFilter');
    if (selectAnnee) {
        selectAnnee.addEventListener('change', function() {
            mettreAJourAnneeLabel();
        });
    }
    // ====== ربط فلاتر Analyse ======
    const analyseTroncon = document.getElementById('analyseTronconFilter');
    const analyseMois = document.getElementById('analyseMoisFilter');
   if (analyseTroncon) analyseTroncon.addEventListener('change', function() { 
        Analyse.mettreAJourFiltres();
        Analyse.appliquerFiltres(); 
    });
    if (analyseMois) analyseMois.addEventListener('change', function() { 
        Analyse.mettreAJourFiltres();
        Analyse.appliquerFiltres(); 
    });

    // ====== ربط فلاتر Intervenants ======
    const intervTroncon = document.getElementById('intervTronconFilter');
    const intervMois = document.getElementById('intervMoisFilter');
    const intervType = document.getElementById('intervTypeFilter');
    const intervEntite = document.getElementById('intervEntiteFilter');

     if (intervTroncon) intervTroncon.addEventListener('change', function() { 
        Intervenants.mettreAJourFiltres();
        Intervenants.appliquerFiltres(); 
    });
    if (intervMois) intervMois.addEventListener('change', function() { 
        Intervenants.mettreAJourFiltres();
        Intervenants.appliquerFiltres(); 
    });
    if (intervType) intervType.addEventListener('change', function() { Intervenants.appliquerFiltres(); });
    if (intervEntite) intervEntite.addEventListener('change', function() { Intervenants.appliquerFiltres(); });

    // ====== ربط فلاتر Dépanneurs ======
    const depTroncon = document.getElementById('depTronconFilter');
    const depMois = document.getElementById('depMoisFilter');
    const depSociete = document.getElementById('depSocieteFilter');
    const depType = document.getElementById('depTypeFilter');
    
    if (depTroncon) depTroncon.addEventListener('change', function() { 
        Depanneurs.mettreAJourFiltres();  // ✅ Mettre à jour les listes
        Depanneurs.appliquerFiltres(); 
    });
    if (depMois) depMois.addEventListener('change', function() { 
        Depanneurs.mettreAJourFiltres();  // ✅ Mettre à jour les listes
        Depanneurs.appliquerFiltres(); 
    });
    if (depSociete) depSociete.addEventListener('change', function() { Depanneurs.appliquerFiltres(); });
    if (depType) depType.addEventListener('change', function() { Depanneurs.appliquerFiltres(); });

    // ====== ربط فلاتر Graphiques ======
    const graphTroncon = document.getElementById('graphTronconFilter');
    const graphMois = document.getElementById('graphMoisFilter');
    const graphSemaine = document.getElementById('graphSemaineFilter');
    const graphJour = document.getElementById('graphJourFiltre');
    const graphHeure = document.getElementById('graphHeureFiltre');
    const graphCause = document.getElementById('graphCauseType');

    if (graphTroncon) graphTroncon.addEventListener('change', function() { Graphiques.appliquerFiltres(); });
    if (graphMois) graphMois.addEventListener('change', function() { Graphiques.appliquerFiltres(); });
    if (graphSemaine) graphSemaine.addEventListener('change', function() { Graphiques.appliquerFiltres(); });
    if (graphJour) graphJour.addEventListener('change', function() { Graphiques.appliquerFiltres(); });
    if (graphHeure) graphHeure.addEventListener('change', function() { Graphiques.appliquerFiltres(); });
    if (graphCause) graphCause.addEventListener('change', function() { Graphiques.appliquerFiltres(); });
    
    // ====== ✅ ربط فلاتر Rapprochement ======
    // ====== ربط فلاتر Rapprochement ======
    const rappTroncon = document.getElementById('rappTronconFilter');
    const rappMois = document.getElementById('rappMoisFilter');
    const rappAnnee = document.getElementById('rappAnneeFilter');

    if (rappTroncon) rappTroncon.addEventListener('change', function() { Rapprochement.appliquerFiltres(); });
    if (rappMois) rappMois.addEventListener('change', function() { Rapprochement.appliquerFiltres(); });
    if (rappAnnee) rappAnnee.addEventListener('change', function() {
        mettreAJourAnneeLabel();
        Rapprochement.mettreAJourFiltres();
        Rapprochement.appliquerFiltres();
    });
    // ====== استعادة البيانات ======
    (async function() {
    const donneesRestorees = await restaurerDonnees();
    
    if (donneesRestorees) {
        console.log('✅ Données restaurées avec succès');
        document.getElementById('fileStatus').textContent = '✅ ' + toutesLesDonnees.length + ' accidents chargés (mémoire)';
        document.getElementById('fileStatus').style.color = '#27ae60';
        const memoryStatus = document.getElementById('memoryStatus');
        if (memoryStatus) {
            memoryStatus.textContent = '💾 ' + toutesLesDonnees.length + ' lignes en mémoire (IndexedDB)';
            memoryStatus.style.color = '#27ae60';
            memoryStatus.style.background = '#e8f8f0';
        }
        
        if (typeof Analyse !== 'undefined' && Analyse.init) Analyse.init();
        if (typeof Intervenants !== 'undefined' && Intervenants.init) Intervenants.init();
        if (typeof Depanneurs !== 'undefined' && Depanneurs.init) Depanneurs.init();
        if (typeof Graphiques !== 'undefined' && Graphiques.mettreAJourFiltres) Graphiques.mettreAJourFiltres();
        if (typeof Graphiques !== 'undefined' && Graphiques.appliquerFiltres) Graphiques.appliquerFiltres();
        if (typeof Parametres !== 'undefined' && Parametres.init) Parametres.init();
        if (typeof ZACC !== 'undefined' && ZACC.init) ZACC.init();
        
    } else {
        console.log('📭 Aucune donnée sauvegardée');
        document.getElementById('fileStatus').textContent = '📁 Cliquez sur "Charger les fichiers" pour commencer';
        document.getElementById('fileStatus').style.color = '#f39c12';
    }
})();

// ✅ Sauvegarde automatique désactivée (fichier volumineux)
console.log('💡 Sauvegarde automatique désactivée');
}); 

// ============================================================
// TRAITER LES DONNÉES CHARGÉES (أضف هذه الدالة أولاً)
// ============================================================

function traiterDonneesChargees(jsonData, nomFichier) {
    console.log('🔄 Traitement des données chargées...');
    console.log('📊 Nombre de lignes:', jsonData.length);
    
    toutesLesDonnees = enrichirDonnees(jsonData);
    sauvegarderDonnees(toutesLesDonnees);
    
    document.getElementById('fileStatus').textContent = `✅ ${toutesLesDonnees.length} accidents chargés (${nomFichier})`;
    document.getElementById('fileStatus').style.color = '#27ae60';
    
    const memoryStatus = document.getElementById('memoryStatus');
    if (memoryStatus) {
        memoryStatus.textContent = `💾 ${toutesLesDonnees.length} lignes en mémoire`;
        memoryStatus.style.color = '#27ae60';
        memoryStatus.style.background = '#e8f8f0';
    }
    
    const fileList = document.getElementById('fileList');
    if (fileList) {
        fileList.innerHTML = `<span class="file-tag">📄 ${nomFichier}</span>`;
    }
    // ✅ تحديث جميع الأقسام
    reinitialiserTout();
    // ✅ تحديث معطيات Rapprochement إذا كانت موجودة
        if (typeof Rapprochement !== 'undefined' && Rapprochement.donneesSource) {
            // محاولة تحديث بيانات المصدر إذا كان الملف المحمّل هو DRRS
            if (nomFichier.includes('DRRS') || nomFichier.includes('source')) {
                Rapprochement.donneesSource = toutesLesDonnees;
                document.getElementById('rappSourceStatus').textContent = `✅ ${toutesLesDonnees.length} lignes`;
                document.getElementById('rappSourceStatus').style.color = '#27ae60';
            }
            // تحديث بيانات المقارنة إذا كان الملف المحمّل هو Rapprochement
            else if (nomFichier.includes('Rapprochement')) {
                Rapprochement.donneesCompare = toutesLesDonnees;
                document.getElementById('rappCompareStatus').textContent = `✅ ${toutesLesDonnees.length} lignes`;
                document.getElementById('rappCompareStatus').style.color = '#27ae60';
            }
            
            // إعادة تطبيق الفلاتر وتحديث الجداول
            Rapprochement.mettreAJourFiltres();
            Rapprochement.appliquerFiltres();
            
            // إعادة تعيين حالة الزر التفصيلي
            const detailsContainer = document.getElementById('rappDetailsContainer');
            if (detailsContainer) {
                detailsContainer.style.display = 'none';
                const btn = document.querySelector('[onclick="Rapprochement.basculerDetails()"]');
                if (btn) btn.textContent = '📋 Afficher les accidents différents';
            }
        }
    changerPage('analyse');
    
    console.log(`✅ Fichier ${nomFichier} chargé avec succès`);
}

// ============================================================
// CHARGEMENT LOCAL
// ============================================================

function chargerFichierLocal() {
    const annee = document.getElementById('chargementAnneeFilter').value;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx,.xls';
    
    if (annee === 'all') {
        input.multiple = true;
    } else {
        input.multiple = false;
    }
    
    input.onchange = function(e) {
        const fichiers = e.target.files;
        if (fichiers.length === 0) return;
        
        if (annee !== 'all') {
            const fichier = fichiers[0];
            const nomAttendu = 'DRRS' + annee + '.xlsx';
            if (fichier.name !== nomAttendu) {
                alert(`❌ Veuillez sélectionner le fichier ${nomAttendu}\n\nFichier sélectionné: ${fichier.name}`);
                return;
            }
            lireEtTraiterFichier(fichier, annee);
        } else {
            let fichiersTraites = 0;
            let toutesLesDonneesTemp = [];
            
            Array.from(fichiers).forEach(fichier => {
                const reader = new FileReader();
                reader.onload = function(event) {
                    try {
                        const data = new Uint8Array(event.target.result);
                        const workbook = XLSX.read(data, { type: 'array' });
                        const premiereFeuille = workbook.Sheets[workbook.SheetNames[0]];
                        const jsonData = XLSX.utils.sheet_to_json(premiereFeuille);
                        
                        jsonData.forEach(ligne => {
                            ligne['_source_fichier'] = fichier.name;
                            ligne['_direction_assignee'] = 'DRRS';
                            ligne['_annee'] = 0;
                        });
                        
                        toutesLesDonneesTemp = toutesLesDonneesTemp.concat(jsonData);
                        fichiersTraites++;
                        
                        if (fichiersTraites === fichiers.length) {
                            traiterDonneesChargees(toutesLesDonneesTemp, fichiers.length + ' fichiers');
                        }
                    } catch (error) {
                        console.error('Erreur:', error);
                        document.getElementById('fileStatus').textContent = '❌ Erreur: ' + error.message;
                        document.getElementById('fileStatus').style.color = '#e74c3c';
                    }
                };
                reader.readAsArrayBuffer(fichier);
            });
        }
    };
    
    input.click();
}

// ============================================================
// LIRE ET TRAITER UN SEUL FICHIER
// ============================================================

function lireEtTraiterFichier(fichier, annee) {
    const reader = new FileReader();
    reader.onload = function(event) {
        try {
            const data = new Uint8Array(event.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const premiereFeuille = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(premiereFeuille);
            
            jsonData.forEach(ligne => {
                ligne['_source_fichier'] = fichier.name;
                ligne['_direction_assignee'] = 'DRRS';
                ligne['_annee'] = parseInt(annee);
            });
            
            traiterDonneesChargees(jsonData, fichier.name);
            
        } catch (error) {
            console.error('Erreur:', error);
            document.getElementById('fileStatus').textContent = '❌ Erreur: ' + error.message;
            document.getElementById('fileStatus').style.color = '#e74c3c';
        }
    };
    reader.readAsArrayBuffer(fichier);
}

// ============================================================
// CHARGEMENT EXTERNE (GitHub)
// ============================================================

function chargerFichierExterne() {
    const annee = document.getElementById('chargementAnneeFilter').value;
    
    let nomFichier, url;
    
    if (annee !== 'all') {
        nomFichier = 'DRRS' + annee + '.xlsx';
        url = 'https://raw.githubusercontent.com/Nouari-Abdelkabir/Accidentologie/main/data/' + nomFichier;
    } else {
        nomFichier = 'DRRS.xlsx';
        url = 'https://raw.githubusercontent.com/Nouari-Abdelkabir/Accidentologie/main/data/' + nomFichier;
    }
    
    console.log(`📂 Chargement externe: ${nomFichier}`);
    document.getElementById('fileStatus').textContent = `📥 Chargement de ${nomFichier}...`;
    document.getElementById('fileStatus').style.color = '#f39c12';
    
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Fichier ${nomFichier} non trouvé (${response.status})`);
            }
            return response.arrayBuffer();
        })
        .then(arrayBuffer => {
            const data = new Uint8Array(arrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            const premiereFeuille = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(premiereFeuille);
            
            jsonData.forEach(ligne => {
                ligne['_source_fichier'] = nomFichier;
                ligne['_direction_assignee'] = 'DRRS';
                ligne['_annee'] = annee !== 'all' ? parseInt(annee) : 0;
            });
            
            traiterDonneesChargees(jsonData, nomFichier);
        })
        .catch(error => {
            console.error('❌ Erreur:', error);
            document.getElementById('fileStatus').textContent = `❌ Erreur: ${error.message}`;
            document.getElementById('fileStatus').style.color = '#e74c3c';
            alert(`❌ Le fichier ${nomFichier} n'existe pas sur GitHub.\n\nVeuillez utiliser le chargement local.`);
        });
}

// ============================================================
// SECTION RAPPROCHEMENT (مستقلة تماماً)
// ============================================================

const Rapprochement = {
    donneesSource: [],
    donneesCompare: [],
    donneesFiltreesSource: [],
    donneesFiltreesCompare: [],
    
    // ====== CHARGER LE FICHIER SOURCE ======
    // ============================================================
    // CHARGER SOURCE LOCAL (avec vérification de l'année)
    // ============================================================

    chargerFichierSource: function() {
        const annee = document.getElementById('rappAnneeFilter').value;
        const nomAttendu = 'DRRS' + annee + '.xlsx';
        
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.xlsx,.xls';
        
        input.onchange = function(e) {
            const fichier = e.target.files[0];
            if (!fichier) return;
            
            if (fichier.name !== nomAttendu) {
                alert(`❌ Veuillez sélectionner le fichier ${nomAttendu}\n\nFichier sélectionné: ${fichier.name}`);
                return;
            }
            
            const reader = new FileReader();
            reader.onload = function(event) {
                try {
                    const data = new Uint8Array(event.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const premiereFeuille = workbook.Sheets[workbook.SheetNames[0]];
                    const jsonData = XLSX.utils.sheet_to_json(premiereFeuille);
                    
                    jsonData.forEach(ligne => {
                        ligne['_source_fichier'] = fichier.name;
                        ligne['_direction_assignee'] = 'DRRS';
                        ligne['_annee'] = parseInt(annee);
                    });
                    
                    Rapprochement.donneesSource = enrichirDonnees(jsonData);
                    document.getElementById('rappSourceStatus').textContent = `✅ ${Rapprochement.donneesSource.length} lignes (${annee})`;
                    document.getElementById('rappSourceStatus').style.color = '#27ae60';
                    
                    Rapprochement.mettreAJourFiltres();
                    Rapprochement.appliquerFiltres();
                } catch (error) {
                    console.error('Erreur:', error);
                    document.getElementById('rappSourceStatus').textContent = '❌ Erreur';
                    document.getElementById('rappSourceStatus').style.color = '#e74c3c';
                }
            };
            reader.readAsArrayBuffer(fichier);
        };
        input.click();
    },

    // ============================================================
    // CHARGER COMPARAISON LOCAL (avec vérification de l'année)
    // ============================================================

    chargerFichierComparaison: function() {
        const annee = document.getElementById('rappAnneeFilter').value;
        const nomAttendu = 'Rapprochement' + annee + '.xlsx';
        
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.xlsx,.xls';
        
        input.onchange = function(e) {
            const fichier = e.target.files[0];
            if (!fichier) return;
            
            if (fichier.name !== nomAttendu) {
                alert(`❌ Veuillez sélectionner le fichier ${nomAttendu}\n\nFichier sélectionné: ${fichier.name}`);
                return;
            }
            
            const reader = new FileReader();
            reader.onload = function(event) {
                try {
                    const data = new Uint8Array(event.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const premiereFeuille = workbook.Sheets[workbook.SheetNames[0]];
                    const jsonData = XLSX.utils.sheet_to_json(premiereFeuille);
                    
                    jsonData.forEach(ligne => {
                        ligne['_source_fichier'] = fichier.name;
                        ligne['_direction_assignee'] = 'DRRS';
                        ligne['_annee'] = parseInt(annee);
                    });
                    
                    Rapprochement.donneesCompare = enrichirDonnees(jsonData);
                    document.getElementById('rappCompareStatus').textContent = `✅ ${Rapprochement.donneesCompare.length} lignes (${annee})`;
                    document.getElementById('rappCompareStatus').style.color = '#27ae60';
                    
                    Rapprochement.mettreAJourFiltres();
                    Rapprochement.appliquerFiltres();
                } catch (error) {
                    console.error('Erreur:', error);
                    document.getElementById('rappCompareStatus').textContent = '❌ Erreur';
                    document.getElementById('rappCompareStatus').style.color = '#e74c3c';
                }
            };
            reader.readAsArrayBuffer(fichier);
        };
        input.click();
    },
    
    // ====== METTRE À JOUR LES FILTRES ======
  // ====== METTRE À JOUR LES FILTRES ======
    mettreAJourFiltres: function() {
        // ✅ Mettre à jour le label de l'année
        if (typeof mettreAJourAnneeLabel === 'function') {
            mettreAJourAnneeLabel();
        }
        
        // ✅ BONS IDs : rapp* (pas dep*)
        const selectTroncon = document.getElementById('rappTronconFilter');
        const selectMois = document.getElementById('rappMoisFilter');
        
        if (!selectTroncon || !selectMois) return;
        
        // ---- Sauvegarder les sélections actuelles ----
        const selectedTroncon = Array.from(selectTroncon.selectedOptions).map(opt => opt.value);
        const selectedMois = Array.from(selectMois.selectedOptions).map(opt => opt.value);
        
        // ---- Tronçons dynamiques ----
        selectTroncon.innerHTML = '<option value="all">Tous les tronçons</option>';
        getTronconsActifs().forEach(t => {
            const opt = document.createElement('option');
            opt.value = t;
            opt.textContent = t + ' (' + getPkRangeDynamique(t) + ')';
            selectTroncon.appendChild(opt);
        });
        
        Array.from(selectTroncon.options).forEach(opt => {
            if (selectedTroncon.includes(opt.value)) opt.selected = true;
        });
        if (selectTroncon.selectedOptions.length === 0) {
            selectTroncon.querySelector('option[value="all"]').selected = true;
        }
        
        // ---- Mois (union source + comparaison) ----
        const moisExistants = new Set();
        (this.donneesSource || []).forEach(d => {
            if (d['_mois'] && d['_mois'] >= 1 && d['_mois'] <= 12) moisExistants.add(d['_mois']);
        });
        (this.donneesCompare || []).forEach(d => {
            if (d['_mois'] && d['_mois'] >= 1 && d['_mois'] <= 12) moisExistants.add(d['_mois']);
        });
        
        selectMois.innerHTML = '<option value="all">Tous les mois</option>';
        const moisNoms = ['Janvier','Février','Mars','Avril','Mai','Juin',
                          'Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
        Array.from(moisExistants).sort((a,b) => a-b).forEach(m => {
            const opt = document.createElement('option');
            opt.value = m;
            opt.textContent = moisNoms[m - 1];
            selectMois.appendChild(opt);
        });
        
        Array.from(selectMois.options).forEach(opt => {
            if (selectedMois.includes(opt.value)) opt.selected = true;
        });
        if (selectMois.selectedOptions.length === 0) {
            selectMois.querySelector('option[value="all"]').selected = true;
        }
        
        console.log('📊 [Rapprochement] Filtres mis à jour');
    },
    
    // ====== APPLIQUER LES FILTRES ======
    appliquerFiltres: function() {
        const tronconSelect = document.getElementById('rappTronconFilter');
        const moisSelect = document.getElementById('rappMoisFilter');
        
        const tronconValues = Array.from(tronconSelect.selectedOptions).map(opt => opt.value);
        const moisValues = Array.from(moisSelect.selectedOptions).map(opt => opt.value);
        
        const tronconAll = tronconValues.includes('all');
        const moisAll = moisValues.includes('all');
        
        // Filtrer les données source
        this.donneesFiltreesSource = this.donneesSource.filter(d => {
            if (!tronconAll && !tronconValues.includes(d['_troncon'])) return false;
            if (!moisAll && !moisValues.includes(String(d['_mois']))) return false;
            return true;
        });
        
        // Filtrer les données de comparaison
        this.donneesFiltreesCompare = this.donneesCompare.filter(d => {
            if (!tronconAll && !tronconValues.includes(d['_troncon'])) return false;
            if (!moisAll && !moisValues.includes(String(d['_mois']))) return false;
            return true;
        });
        
        this.mettreAJourTableaux();
    },
    
     // ====== METTRE À JOUR LES TABLEAUX ======
    mettreAJourTableaux: function() {
        this.afficherTableau('rappSourceTable', this.donneesFiltreesSource, 'Source');
        this.afficherTableau('rappCompareTable', this.donneesFiltreesCompare, 'Comparaison');
        this.afficherDifferences();
        
        // ✅ Si le panneau des détails est ouvert, le rafraîchir aussi
        const detailsContainer = document.getElementById('rappDetailsContainer');
        if (detailsContainer && detailsContainer.style.display !== 'none') {
            this.afficherDetailsDifferences();
        }
    },
    
    // ====== AFFICHER UN TABLEAU ======
    afficherTableau: function(containerId, donnees, titre) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        if (donnees.length === 0) {
            container.innerHTML = `<p style="text-align:center;color:#999;padding:40px;">Aucune donnée à afficher</p>`;
            return;
        }
        
        const tousLesTroncons = getTronconsActifs();
        const resultats = {};
        tousLesTroncons.forEach(t => {
            resultats[t] = { corporelle: 0, materielle: 0, mortelle: 0, total: 0, tues: 0, bg: 0, bl: 0 };
        });
        
        donnees.forEach(d => {
            const t = d['_troncon'];
            if (t && t in resultats) {
                resultats[t].total++;
                const gravite = d['Gravité accident'];
                if (gravite === 'Corporelle') resultats[t].corporelle++;
                else if (gravite === 'Matérielle') resultats[t].materielle++;
                else if (gravite === 'Mortelle') resultats[t].mortelle++;
                resultats[t].tues += parseInt(d['_total_tues'] || 0);
                resultats[t].bg += parseInt(d['_total_bg'] || 0);
                resultats[t].bl += parseInt(d['_total_bl'] || 0);
            }
        });
        
        let totalCorp = 0, totalMat = 0, totalMort = 0, totalAcc = 0, totalTues = 0, totalBG = 0, totalBL = 0;
        let html = '<table><thead><tr><th>Tronçon</th><th>Entre PK et PK</th><th>Corporelle</th><th>Matérielle</th><th>Mortelle</th><th>Total ACC</th><th>Nbr Tués</th><th>Nbr BG</th><th>Nbr BL</th></tr></thead><tbody>';
        
        tousLesTroncons.forEach(t => {
            const d = resultats[t];
            totalCorp += d.corporelle; totalMat += d.materielle; totalMort += d.mortelle;
            totalAcc += d.total; totalTues += d.tues; totalBG += d.bg; totalBL += d.bl;
            const range = getPkRange(t);
            html += `<tr><td><strong>${t}</strong></td><td>${range}</td><td>${d.corporelle}</td><td>${d.materielle}</td><td>${d.mortelle}</td><td><strong>${d.total}</strong></td><td>${d.tues}</td><td>${d.bg}</td><td>${d.bl}</td></tr>`;
        });
        
        html += `<tr class="total-row"><td colspan="2"><strong>Total</strong></td><td><strong>${totalCorp}</strong></td><td><strong>${totalMat}</strong></td><td><strong>${totalMort}</strong></td><td><strong>${totalAcc}</strong></td><td><strong>${totalTues}</strong></td><td><strong>${totalBG}</strong></td><td><strong>${totalBL}</strong></td></tr></tbody></table>`;
        
        container.innerHTML = html;
    },
    
    // ====== AFFICHER LES DIFFÉRENCES ======
    afficherDifferences: function() {
        const container = document.getElementById('rappDiffTable');
        if (!container) return;
        
        if (this.donneesFiltreesSource.length === 0 || this.donneesFiltreesCompare.length === 0) {
            container.innerHTML = `<p style="text-align:center;color:#999;padding:40px;">Chargez les deux fichiers pour voir les différences</p>`;
            return;
        }
        
        // Calculer les différences
        const tousLesTroncons = getTronconsActifs();
        const diff = {};
        tousLesTroncons.forEach(t => {
            diff[t] = { corporelle: 0, materielle: 0, mortelle: 0, total: 0, tues: 0, bg: 0, bl: 0 };
        });
        
        // Calculer source
        const sourceResultats = this.calculerResultats(this.donneesFiltreesSource);
        const compareResultats = this.calculerResultats(this.donneesFiltreesCompare);
        
        let totalCorp = 0, totalMat = 0, totalMort = 0, totalAcc = 0, totalTues = 0, totalBG = 0, totalBL = 0;
        
        tousLesTroncons.forEach(t => {
            diff[t].corporelle = compareResultats[t].corporelle - sourceResultats[t].corporelle;
            diff[t].materielle = compareResultats[t].materielle - sourceResultats[t].materielle;
            diff[t].mortelle = compareResultats[t].mortelle - sourceResultats[t].mortelle;
            diff[t].total = compareResultats[t].total - sourceResultats[t].total;
            diff[t].tues = compareResultats[t].tues - sourceResultats[t].tues;
            diff[t].bg = compareResultats[t].bg - sourceResultats[t].bg;
            diff[t].bl = compareResultats[t].bl - sourceResultats[t].bl;
            
            totalCorp += diff[t].corporelle;
            totalMat += diff[t].materielle;
            totalMort += diff[t].mortelle;
            totalAcc += diff[t].total;
            totalTues += diff[t].tues;
            totalBG += diff[t].bg;
            totalBL += diff[t].bl;
        });
        
        let html = '<table><thead><tr><th>Tronçon</th><th>Entre PK et PK</th><th>Corporelle</th><th>Matérielle</th><th>Mortelle</th><th>Total ACC</th><th>Nbr Tués</th><th>Nbr BG</th><th>Nbr BL</th></tr></thead><tbody>';
        
        tousLesTroncons.forEach(t => {
            const d = diff[t];
            const range = getPkRange(t);
            const isDiff = d.corporelle !== 0 || d.materielle !== 0 || d.mortelle !== 0 || d.total !== 0 || d.tues !== 0 || d.bg !== 0 || d.bl !== 0;
            const style = isDiff ? 'background:#fff3cd;' : '';
            html += `<tr style="${style}"><td><strong>${t}</strong></td><td>${range}</td><td>${d.corporelle > 0 ? '+' : ''}${d.corporelle}</td><td>${d.materielle > 0 ? '+' : ''}${d.materielle}</td><td>${d.mortelle > 0 ? '+' : ''}${d.mortelle}</td><td><strong>${d.total > 0 ? '+' : ''}${d.total}</strong></td><td>${d.tues > 0 ? '+' : ''}${d.tues}</td><td>${d.bg > 0 ? '+' : ''}${d.bg}</td><td>${d.bl > 0 ? '+' : ''}${d.bl}</td></tr>`;
        });
        
        html += `<tr class="total-row"><td colspan="2"><strong>Total</strong></td><td><strong>${totalCorp > 0 ? '+' : ''}${totalCorp}</strong></td><td><strong>${totalMat > 0 ? '+' : ''}${totalMat}</strong></td><td><strong>${totalMort > 0 ? '+' : ''}${totalMort}</strong></td><td><strong>${totalAcc > 0 ? '+' : ''}${totalAcc}</strong></td><td><strong>${totalTues > 0 ? '+' : ''}${totalTues}</strong></td><td><strong>${totalBG > 0 ? '+' : ''}${totalBG}</strong></td><td><strong>${totalBL > 0 ? '+' : ''}${totalBL}</strong></td></tr></tbody></table>`;
        
      // ✅ Résumé en haut du tableau
        const nbSource = this.donneesFiltreesSource.length;
        const nbCompare = this.donneesFiltreesCompare.length;
        const diffLignes = nbCompare - nbSource;
        const diffLignesStr = (diffLignes >= 0 ? '+' : '') + diffLignes;
        
        const resume = `<div style="padding:12px 16px;background:#f0f8ff;border-radius:10px;margin-bottom:15px;display:flex;gap:20px;flex-wrap:wrap;font-size:13px;">
            <span><strong>📊 Lignes source :</strong> ${nbSource}</span>
            <span><strong>📊 Lignes comparaison :</strong> ${nbCompare}</span>
            <span><strong>📌 Différence :</strong> <span style="color:${diffLignes !== 0 ? '#e74c3c' : '#27ae60'};font-weight:700;">${diffLignesStr}</span></span>
        </div>`;
        
        container.innerHTML = resume + html;
    },
    
    // ====== CALCULER LES RÉSULTATS ======
    calculerResultats: function(donnees) {
        const tousLesTroncons = getTronconsActifs();
        const resultats = {};
        
        // 1. Initialiser tous les tronçons actifs à zéro
        tousLesTroncons.forEach(t => {
            resultats[t] = { corporelle: 0, materielle: 0, mortelle: 0, total: 0, tues: 0, bg: 0, bl: 0 };
        });
        
        // 2. Compter les accidents
        donnees.forEach(d => {
            const t = d['_troncon'];
            if (t && t in resultats) {
                resultats[t].total++;
                const gravite = d['Gravité accident'];
                if (gravite === 'Corporelle') resultats[t].corporelle++;
                else if (gravite === 'Matérielle') resultats[t].materielle++;
                else if (gravite === 'Mortelle') resultats[t].mortelle++;
                resultats[t].tues += parseInt(d['_total_tues'] || 0);
                resultats[t].bg   += parseInt(d['_total_bg']   || 0);
                resultats[t].bl   += parseInt(d['_total_bl']   || 0);
            }
        });
        
        return resultats;
    },
    
    // ====== RÉINITIALISER ======
    reinitialiserFiltres: function() {
        const tronconSelect = document.getElementById('rappTronconFilter');
        const moisSelect = document.getElementById('rappMoisFilter');
        
        if (tronconSelect) {
            Array.from(tronconSelect.options).forEach(opt => {
                opt.selected = (opt.value === 'all');
            });
        }
        if (moisSelect) {
            Array.from(moisSelect.options).forEach(opt => {
                opt.selected = (opt.value === 'all');
            });
        }
        
        this.appliquerFiltres();
    },
// ====== BASCULER L'AFFICHAGE DES DÉTAILS ======
    basculerDetails: function() {
        const container = document.getElementById('rappDetailsContainer');
        const btn = document.querySelector('[onclick="Rapprochement.basculerDetails()"]');
        
        if (container.style.display === 'none') {
            container.style.display = 'block';
            btn.textContent = '📋 Masquer les accidents différents';
            this.afficherDetailsDifferences();
        } else {
            container.style.display = 'none';
            btn.textContent = '📋 Afficher les accidents différents';
        }
    },
    
    // ====== AFFICHER LES DÉTAILS DES DIFFÉRENCES ======
    // ====== AFFICHER LES DÉTAILS DES DIFFÉRENCES ======
    afficherDetailsDifferences: function() {
        const container = document.getElementById('rappDetailsTable');
        if (!container) return;
        
        if (this.donneesFiltreesSource.length === 0 || this.donneesFiltreesCompare.length === 0) {
            container.innerHTML = `<p style="text-align:center;color:#999;padding:20px;">Chargez les deux fichiers pour voir les détails</p>`;
            return;
        }
        
        // Identifier les accidents différents
        const differences = [];
        const sourceMap = {};
        
        this.donneesFiltreesSource.forEach(d => {
            const key = d['Ticket'] + '_' + d['Date prise en charge'];
            sourceMap[key] = d;
        });
        
        this.donneesFiltreesCompare.forEach(d => {
            const key = d['Ticket'] + '_' + d['Date prise en charge'];
            const source = sourceMap[key];
            if (source) {
                const diff = this.comparerLignes(source, d);
                if (diff.hasDiff) {
                    differences.push({
                        source: source,
                        compare: d,
                        differences: diff.details
                    });
                }
            }
        });
        
        if (differences.length === 0) {
            container.innerHTML = `<p style="text-align:center;color:#27ae60;padding:20px;">✅ Aucune différence trouvée entre les deux fichiers</p>`;
            return;
        }
        
        const colonnes = [
            'Date prise en charge',
            'Gravité accident',
            'Sens',
            'PK',
            'Nbr Tués Usagers',
            'Nbr BG Usagers',
            'Nbr BL Usagers',
            'is autocar',
            'Nbr Tués Piéton Usager',
            'Nbr BG Piéton Usager',
            'Nbr BL Piéton Usager',
            'Nbr Tués Piéton Vagabond',
            'Nbr BG Piéton Vagabond',
            'Nbr BL Piéton Vagabond',
            'Nbr Tués Piéton Riverain',
            'Nbr BG Piéton Riverain',
            'Nbr BL Piéton Riverain',
            'Nbr Tués Piéton Pers. D\'intervention',
            'Nbr BG Piéton Pers. D\'intervention',
            'Nbr BL Piéton Pers. D\'intervention'
        ];
        
        let html = '<table><thead><tr>';
        html += '<th>#</th>';
        colonnes.forEach(col => {
            html += `<th>${col}</th>`;
        });
        html += '<th>Différence</th>';
        html += '</tr></thead><tbody>';
        
        differences.forEach((item, index) => {
            const source = item.source;
            const compare = item.compare;
            const diffDetails = item.differences;
            
            html += `<tr style="background:#fff3cd;">`;
            html += `<td><strong>${index + 1}</strong></td>`;
            
            colonnes.forEach(col => {
                let valSource = source[col] !== undefined ? source[col] : '';
                let valCompare = compare[col] !== undefined ? compare[col] : '';
                
                // ✅ تنسيق التاريخ
                if (col === 'Date prise en charge') {
                    valSource = formaterDate(valSource);
                    valCompare = formaterDate(valCompare);
                }
                
                // ✅ تنسيق PK
                if (col === 'PK') {
                    valSource = formaterPK(valSource);
                    valCompare = formaterPK(valCompare);
                }
                
                const isDiff = diffDetails.includes(col);
                const style = isDiff ? 'color:#e74c3c; font-weight:bold;' : '';
                html += `<td style="${style}">${valSource} → ${valCompare}</td>`;
            });
            
            html += `<td style="color:#e74c3c; font-weight:bold;">⚠️ ${diffDetails.length} différences</td>`;
            html += '</tr>';
        });
        
        html += '</tbody></table>';
        
        const summary = `<div style="padding:10px; background:#f8fafc; border-radius:8px; margin-bottom:15px;">
            <span style="font-weight:bold;">📊 Total des accidents différents : ${differences.length}</span>
        </div>`;
        
        container.innerHTML = summary + html;
    },
    
    // ====== COMPARER DEUX LIGNES ======
    comparerLignes: function(source, compare) {
        const colonnes = [
            'Date prise en charge',
            'Gravité accident',
            'Sens',
            'PK',
            'Nbr Tués Usagers',
            'Nbr BG Usagers',
            'Nbr BL Usagers',
            'is autocar',
            'Nbr Tués Piéton Usager',
            'Nbr BG Piéton Usager',
            'Nbr BL Piéton Usager',
            'Nbr Tués Piéton Vagabond',
            'Nbr BG Piéton Vagabond',
            'Nbr BL Piéton Vagabond',
            'Nbr Tués Piéton Riverain',
            'Nbr BG Piéton Riverain',
            'Nbr BL Piéton Riverain',
            'Nbr Tués Piéton Pers. D\'intervention',
            'Nbr BG Piéton Pers. D\'intervention',
            'Nbr BL Piéton Pers. D\'intervention'
        ];
        
        const details = [];
        let hasDiff = false;
        
        colonnes.forEach(col => {
            const valSource = source[col] !== undefined ? String(source[col]).trim() : '';
            const valCompare = compare[col] !== undefined ? String(compare[col]).trim() : '';
            
            if (valSource !== valCompare) {
                hasDiff = true;
                details.push(col);
            }
        });
        
        return { hasDiff, details };
    },
    // ============================================================
    // CHARGER SOURCE DEPUIS GITHUB
    // ============================================================
    // ============================================================
    // CHARGER SOURCE DEPUIS GITHUB (avec année)
    // ============================================================

    chargerSourceDepuisGitHub: function() {
        const annee = document.getElementById('rappAnneeFilter').value;
        const nomFichier = 'DRRS' + annee + '.xlsx';
        const url = 'https://raw.githubusercontent.com/Nouari-Abdelkabir/Accidentologie/main/data/' + nomFichier;
        
        document.getElementById('rappSourceStatus').textContent = '📥 Téléchargement...';
        document.getElementById('rappSourceStatus').style.color = '#f39c12';
        
        fetch(url)
            .then(response => {
                if (!response.ok) throw new Error(`Fichier ${nomFichier} non trouvé (${response.status})`);
                return response.arrayBuffer();
            })
            .then(arrayBuffer => {
                const data = new Uint8Array(arrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const premiereFeuille = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(premiereFeuille);
                
                jsonData.forEach(ligne => {
                    ligne['_source_fichier'] = nomFichier;
                    ligne['_direction_assignee'] = 'DRRS';
                    ligne['_annee'] = parseInt(annee);
                });
                
                this.donneesSource = enrichirDonnees(jsonData);
                document.getElementById('rappSourceStatus').textContent = `✅ ${this.donneesSource.length} lignes (${annee})`;
                document.getElementById('rappSourceStatus').style.color = '#27ae60';
                
                this.mettreAJourFiltres();
                this.appliquerFiltres();
                
                console.log(`✅ Fichier ${nomFichier} chargé depuis GitHub`);
            })
            .catch(error => {
                console.error('❌ Erreur:', error);
                document.getElementById('rappSourceStatus').textContent = '❌ Erreur';
                document.getElementById('rappSourceStatus').style.color = '#e74c3c';
                alert(`❌ Le fichier ${nomFichier} n'existe pas sur GitHub.\n\nVeuillez vérifier l'année sélectionnée.`);
            });
    },

    // ============================================================
    // CHARGER COMPARAISON DEPUIS GITHUB (avec année)
    // ============================================================

    chargerComparaisonDepuisGitHub: function() {
        const annee = document.getElementById('rappAnneeFilter').value;
        const nomFichier = 'Rapprochement' + annee + '.xlsx';
        const url = 'https://raw.githubusercontent.com/Nouari-Abdelkabir/Accidentologie/main/data/' + nomFichier;
        
        document.getElementById('rappCompareStatus').textContent = '📥 Téléchargement...';
        document.getElementById('rappCompareStatus').style.color = '#f39c12';
        
        fetch(url)
            .then(response => {
                if (!response.ok) throw new Error(`Fichier ${nomFichier} non trouvé (${response.status})`);
                return response.arrayBuffer();
            })
            .then(arrayBuffer => {
                const data = new Uint8Array(arrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const premiereFeuille = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(premiereFeuille);
                
                jsonData.forEach(ligne => {
                    ligne['_source_fichier'] = nomFichier;
                    ligne['_direction_assignee'] = 'DRRS';
                    ligne['_annee'] = parseInt(annee);
                });
                
                this.donneesCompare = enrichirDonnees(jsonData);
                document.getElementById('rappCompareStatus').textContent = `✅ ${this.donneesCompare.length} lignes (${annee})`;
                document.getElementById('rappCompareStatus').style.color = '#27ae60';
                
                this.mettreAJourFiltres();
                this.appliquerFiltres();
                
                console.log(`✅ Fichier ${nomFichier} chargé depuis GitHub`);
            })
            .catch(error => {
                console.error('❌ Erreur:', error);
                document.getElementById('rappCompareStatus').textContent = '❌ Erreur';
                document.getElementById('rappCompareStatus').style.color = '#e74c3c';
                alert(`❌ Le fichier ${nomFichier} n'existe pas sur GitHub.\n\nVeuillez vérifier l'année sélectionnée.`);
            });
    },
    // ====== إعادة تعيين بيانات Rapprochement ======
    reinitialiser: function() {
        this.donneesSource = [];
        this.donneesCompare = [];
        this.donneesFiltreesSource = [];
        this.donneesFiltreesCompare = [];
        
        document.getElementById('rappSourceStatus').textContent = 'Aucun fichier';
        document.getElementById('rappSourceStatus').style.color = '#999';
        document.getElementById('rappCompareStatus').textContent = 'Aucun fichier';
        document.getElementById('rappCompareStatus').style.color = '#999';
        
        document.getElementById('rappSourceTable').innerHTML = '<p style="text-align:center;color:#999;padding:40px;">Chargez le fichier source</p>';
        document.getElementById('rappCompareTable').innerHTML = '<p style="text-align:center;color:#999;padding:40px;">Chargez le fichier à comparer</p>';
        document.getElementById('rappDiffTable').innerHTML = '<p style="text-align:center;color:#999;padding:40px;">Chargez les deux fichiers pour voir les différences</p>';
        
        const detailsContainer = document.getElementById('rappDetailsContainer');
        if (detailsContainer) {
            detailsContainer.style.display = 'none';
            const btn = document.querySelector('[onclick="Rapprochement.basculerDetails()"]');
            if (btn) btn.textContent = '📋 Afficher les accidents différents';
        }
        
        document.getElementById('rappDetailsTable').innerHTML = '<p style="text-align:center;color:#999;padding:20px;">Aucune donnée</p>';
    }
};

// ====== حساب عدد الأيام الفعلية في النطاق الزمني ======
function getDaysInRange(donnees) {
    if (!donnees || donnees.length === 0) return 1;
    
    let minDate = null, maxDate = null;
    donnees.forEach(d => {
        const date = d['Date prise en charge'];
        if (date) {
            try {
                let dObj;
                if (typeof date === 'number') {
                    dObj = new Date((date - 25569) * 86400 * 1000);
                } else {
                    dObj = new Date(date);
                }
                if (!isNaN(dObj)) {
                    if (!minDate || dObj < minDate) minDate = dObj;
                    if (!maxDate || dObj > maxDate) maxDate = dObj;
                }
            } catch(e) {}
        }
    });
    
    if (!minDate || !maxDate) return 1;
    const diffTime = Math.abs(maxDate - minDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
}




// ============================================================
// SECTION ZACC - Version avec noms de direction unifiés
// ============================================================

// ============================================================
// SECTION ZACC - Version avec GravitéZACC
// ============================================================

const ZACC = {
    donnees: [],
    donneesFiltrees: [],
    pariteActuelle: 'paire',
    directionActuelle: 'tous',
    
    // ====== Charger fichier local ======
    chargerFichierLocal: function() {
            var input = document.createElement('input');
            input.type = 'file';
            input.accept = '.xlsx,.xls';
            input.onchange = function(e) {
                var fichier = e.target.files[0];
                if (!fichier) return;
                
                var reader = new FileReader();
                reader.onload = function(event) {
                    try {
                        var data = new Uint8Array(event.target.result);
                        var workbook = XLSX.read(data, { type: 'array' });
                        var premiereFeuille = workbook.Sheets[workbook.SheetNames[0]];
                        var jsonData = XLSX.utils.sheet_to_json(premiereFeuille);
                        
                        // ✅ Vérifier que GravitéZACC existe
                        console.log('📊 Colonnes du fichier:', Object.keys(jsonData[0] || {}).length);
                        console.log('📊 GravitéZACC dans le fichier:', jsonData[0] ? jsonData[0]['GravitéZACC'] : 'N/A');
                        
                        jsonData.forEach(function(ligne) {
                            ligne['_source_fichier'] = fichier.name;
                        });
                        
                        ZACC.donnees = enrichirDonnees(jsonData);
                        document.getElementById('zaccFileStatus').textContent = '✅ ' + ZACC.donnees.length + ' lignes';
                        document.getElementById('zaccFileStatus').style.color = '#27ae60';
                        
                        // ✅ Vérifier après enrichissement
                        console.log('📊 GravitéZACC après enrichissement:', ZACC.donnees[0] ? ZACC.donnees[0]['GravitéZACC'] : 'N/A');
                        
                        // ✅ Sauvegarder dans IndexedDB pour ZACC
                        sauvegarderZACCIndexedDB(ZACC.donnees);
                        
                        ZACC.appliquerFiltres();
                    } catch (error) {
                        console.error('Erreur:', error);
                        document.getElementById('zaccFileStatus').textContent = '❌ Erreur';
                        document.getElementById('zaccFileStatus').style.color = '#e74c3c';
                    }
                };
                reader.readAsArrayBuffer(fichier);
            };
            input.click();
        },
    
    // ====== Charger depuis GitHub ======
    // ====== Charger depuis GitHub ======
        chargerFichierGitHub: function() {
            var nomFichier = 'ZACC.xlsx';
            var url = 'https://raw.githubusercontent.com/Nouari-Abdelkabir/Accidentologie/main/data/' + nomFichier;
            
            document.getElementById('zaccFileStatus').textContent = '📥 Téléchargement...';
            document.getElementById('zaccFileStatus').style.color = '#f39c12';
            
            fetch(url)
                .then(function(response) {
                    if (!response.ok) throw new Error('Fichier ' + nomFichier + ' non trouvé (' + response.status + ')');
                    return response.arrayBuffer();
                })
                .then(function(arrayBuffer) {
                    var data = new Uint8Array(arrayBuffer);
                    var workbook = XLSX.read(data, { type: 'array' });
                    var premiereFeuille = workbook.Sheets[workbook.SheetNames[0]];
                    var jsonData = XLSX.utils.sheet_to_json(premiereFeuille);
                    
                    jsonData.forEach(function(ligne) {
                        ligne['_source_fichier'] = nomFichier;
                    });
                    
                    ZACC.donnees = enrichirDonnees(jsonData);
                    document.getElementById('zaccFileStatus').textContent = '✅ ' + ZACC.donnees.length + ' lignes';
                    document.getElementById('zaccFileStatus').style.color = '#27ae60';
                    
                    // ✅ Sauvegarder dans IndexedDB pour ZACC
                    sauvegarderZACCIndexedDB(ZACC.donnees);
                    
                    ZACC.appliquerFiltres();
                })
                .catch(function(error) {
                    console.error('❌ Erreur:', error);
                    document.getElementById('zaccFileStatus').textContent = '❌ Erreur';
                    document.getElementById('zaccFileStatus').style.color = '#e74c3c';
                    alert('❌ Le fichier ' + nomFichier + ' n\'existe pas sur GitHub.');
                });
        },
    
    // ====== Changer la parité ======
    changerParite: function(parite) {
        this.pariteActuelle = parite;
        
        var btnPaire = document.getElementById('zaccBtnPaire');
        var btnImpaire = document.getElementById('zaccBtnImpaire');
        
        if (btnPaire && btnImpaire) {
            if (parite === 'paire') {
                btnPaire.style.background = '#2d7db8';
                btnPaire.style.color = 'white';
                btnPaire.style.border = '2px solid #2d7db8';
                btnImpaire.style.background = 'white';
                btnImpaire.style.color = '#1a3a5c';
                btnImpaire.style.border = '2px solid #d0d8e0';
            } else {
                btnImpaire.style.background = '#2d7db8';
                btnImpaire.style.color = 'white';
                btnImpaire.style.border = '2px solid #2d7db8';
                btnPaire.style.background = 'white';
                btnPaire.style.color = '#1a3a5c';
                btnPaire.style.border = '2px solid #d0d8e0';
            }
        }
        
        this.appliquerFiltres();
    },
    
    // ====== Changer la direction ======
    changerDirection: function(direction) {
        this.directionActuelle = direction;
        
        var btnTous = document.getElementById('zaccBtnTous');
        var btnCroissant = document.getElementById('zaccBtnCroissant');
        var btnDecroissant = document.getElementById('zaccBtnDecroissant');
        
        [btnTous, btnCroissant, btnDecroissant].forEach(function(btn) {
            if (btn) {
                btn.style.background = 'white';
                btn.style.color = '#1a3a5c';
                btn.style.border = '2px solid #d0d8e0';
            }
        });
        
        if (direction === 'tous' && btnTous) {
            btnTous.style.background = '#2d7db8';
            btnTous.style.color = 'white';
            btnTous.style.border = '2px solid #2d7db8';
        } else if (direction === 'croissant' && btnCroissant) {
            btnCroissant.style.background = '#27ae60';
            btnCroissant.style.color = 'white';
            btnCroissant.style.border = '2px solid #27ae60';
        } else if (direction === 'decroissant' && btnDecroissant) {
            btnDecroissant.style.background = '#e67e22';
            btnDecroissant.style.color = 'white';
            btnDecroissant.style.border = '2px solid #e67e22';
        }
        
        this.appliquerFiltres();
    },
    
    // ====== Convertir les dates Excel ======
    convertirDateExcel: function(valeur) {
        if (!valeur && valeur !== 0) return null;
        
        if (typeof valeur === 'number') {
            var date = new Date((valeur - 25569) * 86400 * 1000);
            if (!isNaN(date)) return date;
        }
        
        if (typeof valeur === 'string') {
            var texte = valeur.trim();
            var date = new Date(texte);
            if (!isNaN(date)) return date;
        }
        
        return null;
    },
    
    // ====== Appliquer les filtres ======
    appliquerFiltres: function() {
        console.log('📊 === ZACC.appliquerFiltres ===');
        console.log('📊 Nombre total de données:', this.donnees.length);
        
        if (this.donnees.length === 0) {
            console.warn('⚠️ Aucune donnée dans ZACC.donnees');
            document.getElementById('zaccTable').innerHTML = '<p style="text-align:center;color:#999;padding:40px;">Chargez le fichier DRRS pour afficher l\'analyse ZACC</p>';
            document.getElementById('zaccNiveau1').textContent = '0';
            document.getElementById('zaccNiveau2').textContent = '0';
            document.getElementById('zaccNiveau3').textContent = '0';
            return;
        }
        
        // ====== DEBUG: Vérifier GravitéZACC ======
        var valeursZACC = {};
        this.donnees.forEach(function(d) {
            var v = String(d['GravitéZACC']);
            valeursZACC[v] = (valeursZACC[v] || 0) + 1;
        });
        console.log('📊 Valeurs de GravitéZACC:', valeursZACC);
        
        var periode = document.getElementById('zaccPeriodeFilter').value;
        
        // ====== 1. FILTRER PAR ANNÉES ======
        var annees = [];
        if (periode.includes('-')) {
            var parts = periode.split('-');
            var debut = parseInt(parts[0]);
            var fin = parseInt(parts[1]);
            for (var a = debut; a <= fin; a++) {
                annees.push(a);
            }
        } else {
            annees = [parseInt(periode)];
        }
        
        console.log('📊 1. Filtrage par années:', annees);
        
        var donneesParAnnee = this.donnees.filter(function(d) {
            var date = d['Date prise en charge'];
            if (!date) return false;
            
            var dateObj = ZACC.convertirDateExcel(date);
            if (!dateObj) return false;
            
            var annee = dateObj.getFullYear();
            return annees.includes(annee);
        });
        
        console.log('📊 Accidents après filtre années:', donneesParAnnee.length);
        
        // ============================================================
        // 2. SÉPARATION DES DIRECTIONS
        // ============================================================
        
        var donneesCroissant = donneesParAnnee.filter(function(d) {
            var sens = String(d['Sens'] || '').trim().toLowerCase();
            return sens === 'casa-agadir' || sens.includes('casa-agadir');
        });
        
        var donneesDecroissant = donneesParAnnee.filter(function(d) {
            var sens = String(d['Sens'] || '').trim().toLowerCase();
            return sens === 'agadir-casa' || sens.includes('agadir-casa');
        });
        
        console.log('📊 2. Répartition des directions:');
        console.log('  - Casa-Agadir (croissant):', donneesCroissant.length);
        console.log('  - Agadir-Casa (decroissant):', donneesDecroissant.length);
        
        // ============================================================
        // 3. CALCULER ZACC POUR CHAQUE DIRECTION
        // ============================================================
        
        var resultatsCroissant = this.calculerZACCPourDirection(donneesCroissant, 'croissant');
        var resultatsDecroissant = this.calculerZACCPourDirection(donneesDecroissant, 'decroissant');
        
        console.log('📊 3. Résultats ZACC:');
        console.log('  - Casa-Agadir (croissant):', resultatsCroissant.length, 'zones');
        console.log('  - Agadir-Casa (decroissant):', resultatsDecroissant.length, 'zones');
        
        // ============================================================
        // 4. AFFICHER SELON LE FILTRE DE DIRECTION
        // ============================================================
        
        var tousLesResultats = [];
        
        if (this.directionActuelle === 'croissant') {
            tousLesResultats = resultatsCroissant;
        } else if (this.directionActuelle === 'decroissant') {
            tousLesResultats = resultatsDecroissant;
        } else {
            tousLesResultats = resultatsCroissant.concat(resultatsDecroissant);
        }
        
        tousLesResultats.sort(function(a, b) {
            if (a.sectionStart !== b.sectionStart) {
                return a.sectionStart - b.sectionStart;
            }
            return a.direction.localeCompare(b.direction);
        });
        
        // ====== Statistiques ======
        var n1 = tousLesResultats.filter(function(r) { return r.niveau === 1; }).length;
        var n2 = tousLesResultats.filter(function(r) { return r.niveau === 2; }).length;
        var n3 = tousLesResultats.filter(function(r) { return r.niveau === 3; }).length;
        
        document.getElementById('zaccNiveau1').textContent = n1;
        document.getElementById('zaccNiveau2').textContent = n2;
        document.getElementById('zaccNiveau3').textContent = n3;
        
        // ====== Affichage ======
        var container = document.getElementById('zaccTable');
        if (!container) return;
        
        if (tousLesResultats.length === 0) {
            var msg = '✅ Aucune zone ZACC détectée pour la période ' + periode;
            if (this.directionActuelle === 'croissant') {
                msg += ' dans la direction Casa-Agadir (' + donneesCroissant.length + ' accidents)';
            } else if (this.directionActuelle === 'decroissant') {
                msg += ' dans la direction Agadir-Casa (' + donneesDecroissant.length + ' accidents)';
            } else {
                msg += ' (Casa-Agadir: ' + donneesCroissant.length + ' accidents, Agadir-Casa: ' + donneesDecroissant.length + ' accidents)';
            }
            container.innerHTML = '<p style="text-align:center;color:#27ae60;padding:40px;">' + msg + '</p>';
            return;
        }
        
        var html = '<div style="padding:12px 16px;background:#f0f8ff;border-radius:10px;margin-bottom:15px;">';
        html += '<strong>📊 ZACC ' + periode + ' — ' + (this.pariteActuelle === 'paire' ? '🟦 Paire' : '🟧 Impaire') + ' — par tranche de 2 Km</strong>';
        html += '<div style="margin-top:8px;font-size:13px;color:#4a5a6a;">';
        html += '• ZACC 1 : ≥ 6 accidents corporels dont ≥ 3 accidents graves &nbsp;🔴<br>';
        html += '• ZACC 2 : ≥ 6 accidents corporels dont ≥ 2 accidents graves &nbsp;🟠<br>';
        html += '• ZACC 3 : ≥ 6 accidents corporels dont ≥ 1 accident grave &nbsp;🟡<br>';
        html += '<span style="font-size:11px;color:#6b7a8f;">⚠️ Accident corporel = Corporelle + Mortelle</span><br>';
        html += '<span style="font-size:11px;color:#6b7a8f;">⚠️ Accident grave = GravitéZACC = 1</span><br>';
        html += '<span style="font-size:11px;color:#6b7a8f;">📌 Chaque direction est analysée séparément</span><br>';
        html += '<span style="font-size:11px;color:#27ae60;">✅ Casa-Agadir: ' + donneesCroissant.length + ' accidents | Agadir-Casa: ' + donneesDecroissant.length + ' accidents</span><br>';
        html += '<span style="font-size:11px;color:#2d7db8;">🔍 Direction affichée: ' + (this.directionActuelle === 'tous' ? 'Tous' : this.directionActuelle === 'croissant' ? '⬆️ Casa-Agadir' : '⬇️ Agadir-Casa') + '</span>';
        html += '</div></div>';
        
        html += '<table><thead><tr>';
        html += '<th>Niveau</th><th>Section PK</th><th>Parité</th><th>Direction</th><th>Total Acc.</th><th>Acc. Corporels</th><th>Acc. Graves</th>';
        html += '</tr></thead><tbody>';
        
        tousLesResultats.forEach(function(r) {
            var niveauColor = r.niveau === 1 ? '#e74c3c' : (r.niveau === 2 ? '#e67e22' : '#f1c40f');
            var section = r.sectionStart + ' – ' + r.sectionEnd;
            var directionIcon = r.direction === 'croissant' ? '⬆️ Casa-Agadir' : '⬇️ Agadir-Casa';
            html += '<tr style="border-left:4px solid ' + niveauColor + ';">';
            html += '<td><strong style="color:' + niveauColor + ';">' + r.niveauLabel + '</strong></td>';
            html += '<td>' + section + '</td>';
            html += '<td>' + r.parite + '</td>';
            html += '<td>' + directionIcon + '</td>';
            html += '<td><strong>' + r.total + '</strong></td>';
            html += '<td>' + r.corporelle + '</td>';
            html += '<td>' + r.accidentsGraves + '</td>';
            html += '</tr>';
        });
        
        html += '</tbody></table>';
        container.innerHTML = html;
        
        // ====== Mettre à jour le tableau des détails si ouvert ======
        var detailsContainer = document.getElementById('zaccDetailsContainer');
        if (detailsContainer && detailsContainer.style.display !== 'none') {
            this.afficherDetailsDates();
        }
    },
    
     // ====== Calculer ZACC pour une direction ======
    calculerZACCPourDirection: function(donnees, directionNom) {
        console.log('📊 === Calcul ZACC pour ' + directionNom + ' ===');
        console.log('📊 Nombre d\'accidents:', donnees.length);
        
        if (donnees.length === 0) {
            console.log('📊 Aucune donnée pour ' + directionNom);
            return [];
        }
        
        var PK_MIN = 0;
        var PK_MAX = 430000;
        
        var sections = {};
        
        donnees.forEach(function(d) {
            var pk = parseInt(d['_pk_num'] || 0);
            if (pk < PK_MIN || pk > PK_MAX) return;
            
            // ====== حساب بداية ونهاية المقطع ======
            var sectionStart, sectionEnd;
            
            if (ZACC.pariteActuelle === 'paire') {
                // المجالات الزوجية: 0-1999, 2000-3999, 4000-5999, ...
                if (pk < 0) return;
                
                var cycle = Math.floor(pk / 2000);
                sectionStart = cycle * 2000;
                sectionEnd = sectionStart + 1999;
                
            } else {
                // المجالات الفردية: 1000-2999, 3000-4999, 5000-6999, ...
                if (pk < 1000) return;
                
                var cycle = Math.floor((pk - 1000) / 2000);
                sectionStart = 1000 + cycle * 2000;
                sectionEnd = sectionStart + 1999;
            }
            
            if (sectionStart < 0 || sectionStart > PK_MAX) return;
            
            // ====== المفتاح الفريد ======
            var pariteLabel = (ZACC.pariteActuelle === 'paire') ? 'Paire' : 'Impaire';
            var key = sectionStart + '-' + sectionEnd + '_' + pariteLabel + '_' + directionNom;
            
            if (!sections[key]) {
                sections[key] = {
                    sectionStart: sectionStart,
                    sectionEnd: sectionEnd,
                    parite: pariteLabel,
                    direction: directionNom,
                    total: 0,
                    corporelle: 0,
                    accidentsGraves: 0
                };
            }
            
            // ====== 1. Total Acc. = tous les accidents ======
            sections[key].total++;
            
            // ====== 2. Acc. Corporels = Corporelle + Mortelle ======
            var gravite = d['Gravité accident'] || '';
            var estCorporel = (gravite === 'Corporelle' || gravite === 'Mortelle');
            if (estCorporel) {
                sections[key].corporelle++;
            }
            
            // ====== 3. Acc. Graves = somme de GravitéZACC ======
            var graviteZACC = d['GravitéZACC'];
            var valeurZACC = 0;
            
            if (graviteZACC !== undefined && graviteZACC !== null && graviteZACC !== '') {
                if (typeof graviteZACC === 'number') {
                    valeurZACC = graviteZACC;
                } else {
                    var str = String(graviteZACC).trim().replace(',', '.');
                    valeurZACC = parseFloat(str);
                    if (isNaN(valeurZACC)) valeurZACC = 0;
                }
            }
            
            if (Math.round(valeurZACC) === 1) {
                sections[key].accidentsGraves++;
            }
        });
        
        // ====== ترتيب المقاطع ======
        var sectionsArray = Object.values(sections);
        sectionsArray.sort(function(a, b) { return a.sectionStart - b.sectionStart; });
        
        console.log('📊 Sections pour ' + directionNom + ' (' + sectionsArray.length + ' sections):');
        sectionsArray.forEach(function(s) {
            var section = s.sectionStart + ' – ' + s.sectionEnd;
            console.log('  PK ' + section + ' | Total: ' + s.total + ' | Corporels: ' + s.corporelle + ' | Acc.Graves: ' + s.accidentsGraves);
        });
        
        // ====== تحديد المستويات ======
        var resultats = [];
        
        sectionsArray.forEach(function(section) {
            var corporelle = section.corporelle;
            var accidentsGraves = section.accidentsGraves;
            
            var niveau = 0;
            var niveauLabel = '';
            
            if (corporelle >= 6 && accidentsGraves >= 3) {
                niveau = 1;
                niveauLabel = 'Niveau 1';
            } else if (corporelle >= 6 && accidentsGraves >= 2) {
                niveau = 2;
                niveauLabel = 'Niveau 2';
            } else if (corporelle >= 6 && accidentsGraves >= 1) {
                niveau = 3;
                niveauLabel = 'Niveau 3';
            }
            
            if (niveau > 0) {
                resultats.push({
                    niveau: niveau,
                    niveauLabel: niveauLabel,
                    sectionStart: section.sectionStart,
                    sectionEnd: section.sectionEnd,
                    parite: section.parite,
                    direction: section.direction,
                    total: section.total,
                    corporelle: section.corporelle,
                    accidentsGraves: section.accidentsGraves
                });
            }
        });
        
        console.log('📊 Résultats ZACC pour ' + directionNom + ' (' + resultats.length + ' zones):');
        resultats.forEach(function(r) {
            var section = r.sectionStart + ' – ' + r.sectionEnd;
            console.log('  ' + r.niveauLabel + ' | PK ' + section + ' | Corp: ' + r.corporelle + ' | Graves: ' + r.accidentsGraves);
        });
        
        return resultats;
    },
    
    // ====== Réinitialiser les filtres ======
    reinitialiserFiltres: function() {
        document.getElementById('zaccPeriodeFilter').value = '2024-2025';
        this.pariteActuelle = 'paire';
        this.directionActuelle = 'tous';
        
        var btnPaire = document.getElementById('zaccBtnPaire');
        var btnImpaire = document.getElementById('zaccBtnImpaire');
        
        if (btnPaire && btnImpaire) {
            btnPaire.style.background = '#2d7db8';
            btnPaire.style.color = 'white';
            btnPaire.style.border = '2px solid #2d7db8';
            btnImpaire.style.background = 'white';
            btnImpaire.style.color = '#1a3a5c';
            btnImpaire.style.border = '2px solid #d0d8e0';
        }
        
        var btnTous = document.getElementById('zaccBtnTous');
        var btnCroissant = document.getElementById('zaccBtnCroissant');
        var btnDecroissant = document.getElementById('zaccBtnDecroissant');
        
        if (btnTous) {
            btnTous.style.background = '#2d7db8';
            btnTous.style.color = 'white';
            btnTous.style.border = '2px solid #2d7db8';
        }
        if (btnCroissant) {
            btnCroissant.style.background = 'white';
            btnCroissant.style.color = '#1a3a5c';
            btnCroissant.style.border = '2px solid #d0d8e0';
        }
        if (btnDecroissant) {
            btnDecroissant.style.background = 'white';
            btnDecroissant.style.color = '#1a3a5c';
            btnDecroissant.style.border = '2px solid #d0d8e0';
        }
        
        this.appliquerFiltres();
    },
    
    // ====== Afficher/Masquer les détails des dates ======
    basculerDetailsDates: function() {
        var container = document.getElementById('zaccDetailsContainer');
        var icon = document.getElementById('zaccDetailsIcon');
        
        if (!container) return;
        
        if (container.style.display === 'none') {
            container.style.display = 'block';
            if (icon) icon.textContent = '▼';
            this.afficherDetailsDates();
        } else {
            container.style.display = 'none';
            if (icon) icon.textContent = '▶';
        }
    },
    
    // ====== Afficher les détails des dates ======
    afficherDetailsDates: function() {
        var container = document.getElementById('zaccDetailsTable');
        if (!container) return;
        
        var donnees = this.donneesFiltrees.length > 0 ? this.donneesFiltrees : this.donnees;
        if (donnees.length === 0) {
            container.innerHTML = '<p style="text-align:center;color:#999;padding:20px;">Chargez des données pour afficher les détails</p>';
            return;
        }
        
        var periode = document.getElementById('zaccPeriodeFilter').value;
        var direction = this.directionActuelle;
        
        var annees = [];
        if (periode.includes('-')) {
            var parts = periode.split('-');
            var debut = parseInt(parts[0]);
            var fin = parseInt(parts[1]);
            for (var a = debut; a <= fin; a++) {
                annees.push(a);
            }
        } else {
            annees = [parseInt(periode)];
        }
        
        var donneesParAnnee = donnees.filter(function(d) {
            var date = d['Date prise en charge'];
            if (!date) return false;
            var dateObj = ZACC.convertirDateExcel(date);
            if (!dateObj) return false;
            var annee = dateObj.getFullYear();
            return annees.includes(annee);
        });
        
        var donneesCroissant = donneesParAnnee.filter(function(d) {
            var sens = String(d['Sens'] || '').trim().toLowerCase();
            return sens === 'casa-agadir' || sens.includes('casa-agadir');
        });
        
        var donneesDecroissant = donneesParAnnee.filter(function(d) {
            var sens = String(d['Sens'] || '').trim().toLowerCase();
            return sens === 'agadir-casa' || sens.includes('agadir-casa');
        });
        
        var resultatsCroissant = this.calculerZACCPourDirection(donneesCroissant, 'croissant');
        var resultatsDecroissant = this.calculerZACCPourDirection(donneesDecroissant, 'decroissant');
        
        var tousLesResultats = [];
        if (direction === 'croissant') {
            tousLesResultats = resultatsCroissant;
        } else if (direction === 'decroissant') {
            tousLesResultats = resultatsDecroissant;
        } else {
            tousLesResultats = resultatsCroissant.concat(resultatsDecroissant);
        }
        
        tousLesResultats.sort(function(a, b) {
            if (a.sectionStart !== b.sectionStart) {
                return a.sectionStart - b.sectionStart;
            }
            return a.direction.localeCompare(b.direction);
        });
        
        if (tousLesResultats.length === 0) {
            container.innerHTML = '<p style="text-align:center;color:#27ae60;padding:20px;">✅ Aucune zone ZACC détectée pour cette période</p>';
            return;
        }
        
        var html = '<table style="width:100%; border-collapse:collapse; font-size:13px;">';
        html += '<thead><tr style="background:#2d7db8; color:white;">';
        html += '<th style="padding:10px 14px; border:1px solid #1a5276;">Niveau</th>';
        html += '<th style="padding:10px 14px; border:1px solid #1a5276;">Section PK</th>';
        html += '<th style="padding:10px 14px; border:1px solid #1a5276;">Parité</th>';
        html += '<th style="padding:10px 14px; border:1px solid #1a5276;">Direction</th>';
        html += '<th style="padding:10px 14px; border:1px solid #1a5276;">Total Acc.</th>';
        html += '<th style="padding:10px 14px; border:1px solid #1a5276;">Acc. Corporels</th>';
        html += '<th style="padding:10px 14px; border:1px solid #1a5276; min-width:200px;">Toutes les dates</th>';
        html += '</tr></thead><tbody>';
        
        tousLesResultats.forEach(function(r) {
            var niveauColor = r.niveau === 1 ? '#e74c3c' : (r.niveau === 2 ? '#e67e22' : '#f1c40f');
            var section = r.sectionStart + ' – ' + r.sectionEnd;
            var directionIcon = r.direction === 'croissant' ? '⬆️ Casa-Agadir' : '⬇️ Agadir-Casa';
            
            var dates = ZACC.getDatesPourSection(r.sectionStart, r.sectionEnd, r.direction, donneesParAnnee);
            
            var datesHtml = '';
            if (dates.length > 0) {
                datesHtml = dates.map(function(date) {
                    return '<div style="padding:2px 0; border-bottom:1px dashed #eee;">' + date + '</div>';
                }).join('');
            } else {
                datesHtml = '<span style="color:#999;">Aucune date</span>';
            }
            
            html += '<tr style="border-left:4px solid ' + niveauColor + ';">';
            html += '<td style="padding:8px 12px; border:1px solid #d0d8e0;"><strong style="color:' + niveauColor + ';">' + r.niveauLabel + '</strong></td>';
            html += '<td style="padding:8px 12px; border:1px solid #d0d8e0;">' + section + '</td>';
            html += '<td style="padding:8px 12px; border:1px solid #d0d8e0;">' + r.parite + '</td>';
            html += '<td style="padding:8px 12px; border:1px solid #d0d8e0;">' + directionIcon + '</td>';
            html += '<td style="padding:8px 12px; border:1px solid #d0d8e0; text-align:center; font-weight:bold;">' + r.total + '</td>';
            html += '<td style="padding:8px 12px; border:1px solid #d0d8e0; text-align:center; font-weight:bold;">' + r.corporelle + '</td>';
            html += '<td style="padding:8px 12px; border:1px solid #d0d8e0; font-size:12px;">' + datesHtml + '</td>';
            html += '</tr>';
        });
        
        html += '</tbody></table>';
        container.innerHTML = html;
    },
    
    // ====== Récupérer les dates des accidents corporels pour une section ======
     getDatesPourSection: function(sectionStart, sectionEnd, direction, donnees) {
        var dates = [];
        
        var accidentsSection = donnees.filter(function(d) {
            var pk = parseInt(d['_pk_num'] || 0);
            var sens = String(d['Sens'] || '').trim().toLowerCase();
            var estCorporel = (d['Gravité accident'] === 'Corporelle' || d['Gravité accident'] === 'Mortelle');
            
            var dirOk = false;
            if (direction === 'croissant') {
                dirOk = sens === 'casa-agadir' || sens.includes('casa-agadir');
            } else if (direction === 'decroissant') {
                dirOk = sens === 'agadir-casa' || sens.includes('agadir-casa');
            }
            
            // ✅ pk <= sectionEnd (النهاية شاملة)
            return pk >= sectionStart && pk <= sectionEnd && estCorporel && dirOk;
        });
        
        accidentsSection.forEach(function(d) {
            var date = d['Date prise en charge'];
            if (date) {
                var dateObj = ZACC.convertirDateExcel(date);
                if (dateObj && !isNaN(dateObj)) {
                    var jour = String(dateObj.getDate()).padStart(2, '0');
                    var mois = String(dateObj.getMonth() + 1).padStart(2, '0');
                    var annee = dateObj.getFullYear();
                    dates.push(jour + '/' + mois + '/' + annee);
                }
            }
        });
        
        dates.sort(function(a, b) {
            var partsA = a.split('/');
            var partsB = b.split('/');
            var dateA = new Date(partsA[2], partsA[1] - 1, partsA[0]);
            var dateB = new Date(partsB[2], partsB[1] - 1, partsB[0]);
            return dateB - dateA;
        });
        
        return dates;
    },
        // ====== Initialisation automatique ======
    init: async function() {
        console.log('🔄 Initialisation ZACC...');
        
        // ✅ Essayer de charger depuis IndexedDB
        var donneesSauvegardees = await chargerZACCIndexedDB();
        
        if (donneesSauvegardees && donneesSauvegardees.length > 0) {
            ZACC.donnees = donneesSauvegardees;
            document.getElementById('zaccFileStatus').textContent = '✅ ' + ZACC.donnees.length + ' lignes (mémoire)';
            document.getElementById('zaccFileStatus').style.color = '#27ae60';
            console.log('✅ ZACC restauré:', ZACC.donnees.length, 'lignes');
            
            ZACC.appliquerFiltres();
        } else {
            console.log('📭 Aucune donnée ZACC sauvegardée');
            document.getElementById('zaccFileStatus').textContent = 'Aucun fichier';
            document.getElementById('zaccFileStatus').style.color = '#999';
        }
    }
};



// ============================================================
// Convertir une date Excel (nombre) en objet Date
// ============================================================

function convertirDateExcel(valeur) {
    if (!valeur && valeur !== 0) return null;
    
    try {
        // Si c'est un nombre (format Excel)
        if (typeof valeur === 'number') {
            // Excel: 1 = 1 janvier 1900
            const date = new Date((valeur - 25569) * 86400 * 1000);
            if (!isNaN(date)) return date;
        }
        
        // Si c'est une chaîne de caractères
        if (typeof valeur === 'string') {
            let texte = valeur.trim();
            
            // Format "03/01/2026"
            let match = texte.match(/(\d{2})\/(\d{2})\/(\d{4})/);
            if (match) {
                const jour = parseInt(match[1]);
                const mois = parseInt(match[2]) - 1;
                const annee = parseInt(match[3]);
                const date = new Date(annee, mois, jour);
                if (!isNaN(date)) return date;
            }
            
            // Format "03-01-2026"
            match = texte.match(/(\d{2})-(\d{2})-(\d{4})/);
            if (match) {
                const jour = parseInt(match[1]);
                const mois = parseInt(match[2]) - 1;
                const annee = parseInt(match[3]);
                const date = new Date(annee, mois, jour);
                if (!isNaN(date)) return date;
            }
            
            // Format "2026-01-03"
            match = texte.match(/(\d{4})-(\d{2})-(\d{2})/);
            if (match) {
                const annee = parseInt(match[1]);
                const mois = parseInt(match[2]) - 1;
                const jour = parseInt(match[3]);
                const date = new Date(annee, mois, jour);
                if (!isNaN(date)) return date;
            }
        }
        
        return null;
    } catch(e) {
        console.warn('Erreur conversion date:', e);
        return null;
    }
}
// ============================================================
// تنسيق التاريخ من رقم Excel إلى نص مقروء
// ============================================================

function formaterDate(valeur) {
    if (!valeur && valeur !== 0) return '';
    
    try {
        let dateObj;
        if (typeof valeur === 'number') {
            dateObj = new Date((valeur - 25569) * 86400 * 1000);
        } else {
            dateObj = new Date(valeur);
        }
        if (!isNaN(dateObj)) {
            const jour = String(dateObj.getDate()).padStart(2, '0');
            const mois = String(dateObj.getMonth() + 1).padStart(2, '0');
            const annee = dateObj.getFullYear();
            return jour + '/' + mois + '/' + annee;
        }
        return String(valeur);
    } catch(e) {
        return String(valeur);
    }
}

// ============================================================
// تنسيق PK (إضافة + قبل آخر 3 أرقام)
// ============================================================

function formaterPK(valeur) {
    if (!valeur && valeur !== 0) return '';
    const str = String(valeur).trim();
    if (str.length <= 3) return str;
    const debut = str.slice(0, -3);
    const fin = str.slice(-3);
    return debut + '+' + fin;
}



// ============================================================
// SECTION EXPORT - Exporter les données vers Excel/HTML
// ============================================================

const Exporter = {
    
    // ====== Obtenir le nom du fichier avec date ======
    getNomFichier: function(base) {
        var now = new Date();
        var dateStr = now.getFullYear() + '-' + 
                     String(now.getMonth() + 1).padStart(2, '0') + '-' + 
                     String(now.getDate()).padStart(2, '0');
        return base + '_' + dateStr;
    },
    
    // ====== Exporter une page complète en XLSX (avec mise en forme) ======
    exporterPageEnXLSX: function(pageId, nomFichier) {
        var page = document.getElementById(pageId);
        if (!page) {
            alert('❌ Page non trouvée');
            return;
        }
        
        // Récupérer le titre de la page
        var titre = page.querySelector('h2')?.innerText || 'Rapport';
        
        // Construire le HTML avec tous les tableaux et leurs styles
        var html = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office"
              xmlns:x="urn:schemas-microsoft-com:office:excel"
              xmlns="http://www.w3.org/TR/REC-html40">
        <head>
            <meta charset="UTF-8">
            <!--[if gte mso 9]>
            <xml>
                <x:ExcelWorkbook>
                    <x:ExcelWorksheets>
                        <x:ExcelWorksheet>
                            <x:Name>${nomFichier}</x:Name>
                            <x:WorksheetOptions>
                                <x:DisplayGridlines/>
                            </x:WorksheetOptions>
                        </x:ExcelWorksheet>
                    </x:ExcelWorksheets>
                </x:ExcelWorkbook>
            </xml>
            <![endif]-->
            <style>
                /* ====== STYLES GÉNÉRAUX ====== */
                body { 
                    font-family: 'Segoe UI', Arial, sans-serif; 
                    padding: 20px; 
                    background: #ffffff;
                }
                h1 { 
                    color: #1a3a5c; 
                    font-size: 24px;
                    border-bottom: 3px solid #2d7db8;
                    padding-bottom: 10px;
                }
                .subtitle {
                    color: #6b7a8f;
                    font-size: 12px;
                    margin-bottom: 20px;
                }
                h2 { 
                    color: #2d7db8; 
                    font-size: 16px;
                    margin-top: 25px;
                    margin-bottom: 10px;
                }
                
                /* ====== STYLES DES TABLEAUX ====== */
                table { 
                    width: 100%; 
                    border-collapse: collapse; 
                    margin: 10px 0 20px 0;
                    font-size: 12px;
                    font-family: 'Segoe UI', Arial, sans-serif;
                }
                th { 
                    background-color: #2d7db8; 
                    color: #ffffff; 
                    font-weight: bold; 
                    padding: 8px 12px; 
                    border: 1px solid #1a5276;
                    text-align: left;
                }
                td { 
                    padding: 6px 10px; 
                    border: 1px solid #d0d8e0;
                    background-color: #ffffff;
                    color: #1a3a5c;
                }
                tr:nth-child(even) td { 
                    background-color: #f8f9fa; 
                }
                tr:hover td { 
                    background-color: #e8f4fd; 
                }
                
                /* ====== LIGNES SPÉCIALES ====== */
                .total-row td { 
                    background-color: #e8f4fd !important; 
                    font-weight: bold; 
                    color: #1a3a5c;
                }
                .filtered-row td { 
                    background-color: #fff3cd !important; 
                }
                .niveau-1 td:first-child { 
                    border-left: 4px solid #e74c3c; 
                }
                .niveau-2 td:first-child { 
                    border-left: 4px solid #e67e22; 
                }
                .niveau-3 td:first-child { 
                    border-left: 4px solid #f1c40f; 
                }
                
                /* ====== STATISTIQUES ====== */
                .stats-grid {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 15px;
                    margin: 15px 0;
                }
                .stat-card {
                    background: #f0f8ff;
                    padding: 12px 20px;
                    border-radius: 8px;
                    border: 1px solid #d0e8f0;
                    min-width: 120px;
                }
                .stat-card .label {
                    font-size: 11px;
                    color: #6b7a8f;
                    font-weight: 600;
                }
                .stat-card .value {
                    font-size: 20px;
                    font-weight: 700;
                    color: #1a3a5c;
                }
                .stat-card .value.blue { color: #2d7db8; }
                .stat-card .value.green { color: #27ae60; }
                .stat-card .value.red { color: #e74c3c; }
                .stat-card .value.orange { color: #e67e22; }
                
                /* ====== FILTRES ====== */
                .filter-info {
                    background: #f0f8ff;
                    padding: 8px 14px;
                    border-radius: 6px;
                    border: 1px solid #d0e8f0;
                    margin: 10px 0;
                    font-size: 12px;
                    color: #4a5a6a;
                }
                
                .footer {
                    margin-top: 30px;
                    text-align: center;
                    color: #999;
                    font-size: 11px;
                    border-top: 1px solid #e8ecf2;
                    padding-top: 15px;
                }
            </style>
        </head>
        <body>
            <h1>📊 ${titre}</h1>
            <div class="subtitle">
                📅 Exporté le ${new Date().toLocaleString('fr-FR')} &nbsp;|&nbsp; 
                📁 Fichier: ${nomFichier}
            </div>
        `;
        
        // ====== 1. AJOUTER LES KPI (si présents) ======
        var kpis = page.querySelectorAll('.kpi-card');
        if (kpis.length > 0) {
            html += `<h2>📊 Indicateurs Clés</h2><div class="stats-grid">`;
            kpis.forEach(function(kpi) {
                var label = kpi.querySelector('.kpi-label')?.innerText || '';
                var value = kpi.querySelector('.kpi-value')?.innerText || '0';
                var colorClass = '';
                if (kpi.classList.contains('blue')) colorClass = 'blue';
                else if (kpi.classList.contains('green')) colorClass = 'green';
                else if (kpi.classList.contains('red')) colorClass = 'red';
                else if (kpi.classList.contains('orange')) colorClass = 'orange';
                html += `
                    <div class="stat-card">
                        <div class="label">${label}</div>
                        <div class="value ${colorClass}">${value}</div>
                    </div>
                `;
            });
            html += `</div>`;
        }
        
        // ====== 2. AJOUTER LES STATISTIQUES ZACC ======
        var zaccStats = page.querySelector('#zaccStats');
        if (zaccStats) {
            var stats = zaccStats.querySelectorAll('.stat-card');
            if (stats.length > 0) {
                html += `<h2>📊 Statistiques ZACC</h2><div class="stats-grid">`;
                stats.forEach(function(stat) {
                    var label = stat.querySelector('h4')?.innerText || '';
                    var value = stat.querySelector('p')?.innerText || '0';
                    html += `
                        <div class="stat-card">
                            <div class="label">${label}</div>
                            <div class="value">${value}</div>
                        </div>
                    `;
                });
                html += `</div>`;
            }
        }
        
        // ====== 3. AJOUTER LES FILTRES ======
        var filters = page.querySelector('.filter-area');
        if (filters) {
            var filterText = filters.innerText.replace(/Réinitialiser/g, '').trim();
            if (filterText.length > 10) {
                html += `
                    <div class="filter-info">
                        <strong>🔍 Filtres appliqués:</strong> ${filterText}
                    </div>
                `;
            }
        }
        
        // ====== 4. AJOUTER TOUS LES TABLEAUX AVEC LEURS STYLES ======
        var tables = page.querySelectorAll('.table-container table, table');
        var tableIndex = 0;
        tables.forEach(function(table) {
            var text = table.innerText;
            if (text.includes('Chargez') || text.includes('Aucune donnée') || text.includes('Aucun fichier')) {
                return;
            }
            tableIndex++;
            
            // Cloner le tableau pour garder les classes
            var clone = table.cloneNode(true);
            
            // Remplacer le HTML du tableau par le clone
            html += `<h2>📋 Tableau ${tableIndex}</h2>`;
            html += clone.outerHTML;
        });
        
        // ====== 5. AJOUTER LES STATISTIQUES PK ======
        var pkStats = page.querySelector('[id^="total"]')?.parentElement;
        if (pkStats) {
            var statsHtml = pkStats.outerHTML;
            if (statsHtml && statsHtml.length > 50) {
                html += `<h2>📊 Statistiques PK</h2>`;
                html += `<div style="background:#f8fafc; padding:12px; border-radius:6px; border:1px solid #e8ecf2; margin:10px 0;">`;
                html += statsHtml;
                html += `</div>`;
            }
        }
        
        // ====== 6. FOOTER ======
        html += `
                <div class="footer">
                    Généré par DRRS - Analyse des Accidents © ${new Date().getFullYear()}
                </div>
            </body>
            </html>
        `;
        
        // Créer le fichier Excel (avec extension .xls)
        var blob = new Blob([html], { type: 'application/vnd.ms-excel' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = nomFichier + '.xls';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },
    
    // ====== Exporter une page complète en HTML (avec graphiques) ======
    exporterPageEnHTML: function(pageId, nomFichier) {
        var page = document.getElementById(pageId);
        if (!page) {
            alert('❌ Page non trouvée');
            return;
        }
        
        // Récupérer le titre de la page
        var titre = page.querySelector('h2')?.innerText || 'Rapport';
        
        var html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>${nomFichier}</title>
            <style>
                * { box-sizing: border-box; }
                body { 
                    font-family: 'Segoe UI', Arial, sans-serif; 
                    padding: 30px; 
                    background: #f0f2f5; 
                    margin: 0;
                }
                .container { 
                    max-width: 1400px; 
                    margin: 0 auto; 
                    background: white; 
                    padding: 30px; 
                    border-radius: 12px; 
                    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
                }
                h1 { 
                    color: #1a3a5c; 
                    border-bottom: 4px solid #2d7db8; 
                    padding-bottom: 15px; 
                    margin-bottom: 10px;
                    font-size: 28px;
                }
                .subtitle {
                    color: #6b7a8f;
                    font-size: 14px;
                    margin-bottom: 30px;
                }
                h2 { 
                    color: #2d7db8; 
                    margin-top: 35px; 
                    margin-bottom: 15px;
                    font-size: 20px;
                    border-left: 4px solid #2d7db8;
                    padding-left: 12px;
                }
                h3 {
                    color: #1a3a5c;
                    margin-top: 25px;
                    margin-bottom: 10px;
                    font-size: 16px;
                }
                table { 
                    width: 100%; 
                    border-collapse: collapse; 
                    margin: 15px 0 25px 0;
                    font-size: 13px;
                    border-radius: 8px;
                    overflow: hidden;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
                }
                th { 
                    background: #2d7db8; 
                    color: white; 
                    padding: 10px 14px; 
                    border: 1px solid #1a5276; 
                    font-weight: 600;
                    text-align: left;
                }
                td { 
                    padding: 8px 12px; 
                    border: 1px solid #dde4ec; 
                }
                tr:nth-child(even) { background: #f8fafc; }
                tr:hover { background: #eef4fb; }
                .total-row { background: #e8f4fd !important; font-weight: 600; }
                .filtered-row { background: #fff8e1 !important; }
                
                /* Couleurs pour ZACC */
                .niveau-1 { border-left: 4px solid #e74c3c; }
                .niveau-2 { border-left: 4px solid #e67e22; }
                .niveau-3 { border-left: 4px solid #f1c40f; }
                td.niveau-1 { border-left: 4px solid #e74c3c; }
                td.niveau-2 { border-left: 4px solid #e67e22; }
                td.niveau-3 { border-left: 4px solid #f1c40f; }
                
                .chart-container {
                    margin: 25px 0;
                    text-align: center;
                    background: #fafbfc;
                    padding: 20px;
                    border-radius: 10px;
                    border: 1px solid #e8ecf2;
                }
                .chart-container img {
                    max-width: 100%;
                    max-height: 500px;
                    border-radius: 8px;
                }
                .chart-container h4 {
                    color: #1a3a5c;
                    margin-top: 0;
                    margin-bottom: 15px;
                    font-size: 15px;
                }
                
                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
                    gap: 15px;
                    margin: 20px 0;
                }
                .stat-card {
                    background: #f8fafc;
                    padding: 15px 20px;
                    border-radius: 10px;
                    border: 1px solid #e8ecf2;
                    text-align: center;
                }
                .stat-card .label {
                    font-size: 12px;
                    color: #6b7a8f;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .stat-card .value {
                    font-size: 24px;
                    font-weight: 700;
                    color: #1a3a5c;
                    margin-top: 5px;
                }
                .stat-card .value.blue { color: #2d7db8; }
                .stat-card .value.green { color: #27ae60; }
                .stat-card .value.red { color: #e74c3c; }
                .stat-card .value.orange { color: #e67e22; }
                .stat-card .value.purple { color: #6c5ce7; }
                .stat-card .value.yellow { color: #f39c12; }
                
                .filter-info {
                    background: #f0f8ff;
                    padding: 10px 16px;
                    border-radius: 8px;
                    border: 1px solid #d0e8f0;
                    margin: 15px 0;
                    font-size: 13px;
                    color: #4a5a6a;
                }
                
                .footer {
                    margin-top: 40px;
                    text-align: center;
                    color: #999;
                    font-size: 12px;
                    border-top: 1px solid #e8ecf2;
                    padding-top: 20px;
                }
                
                @media print {
                    body { background: white; padding: 10px; }
                    .container { box-shadow: none; border: 1px solid #ddd; }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>📊 ${titre}</h1>
                <div class="subtitle">
                    📅 Exporté le ${new Date().toLocaleString('fr-FR')} &nbsp;|&nbsp; 
                    📁 Fichier: ${nomFichier}
                </div>
        `;
        
        // ====== 1. AJOUTER LES KPI ======
        var kpis = page.querySelectorAll('.kpi-card');
        if (kpis.length > 0) {
            html += `<h2>📊 Indicateurs Clés</h2><div class="stats-grid">`;
            kpis.forEach(function(kpi) {
                var label = kpi.querySelector('.kpi-label')?.innerText || '';
                var value = kpi.querySelector('.kpi-value')?.innerText || '0';
                var colorClass = '';
                if (kpi.classList.contains('blue')) colorClass = 'blue';
                else if (kpi.classList.contains('green')) colorClass = 'green';
                else if (kpi.classList.contains('red')) colorClass = 'red';
                else if (kpi.classList.contains('orange')) colorClass = 'orange';
                else if (kpi.classList.contains('purple')) colorClass = 'purple';
                else if (kpi.classList.contains('yellow')) colorClass = 'yellow';
                html += `
                    <div class="stat-card">
                        <div class="label">${label}</div>
                        <div class="value ${colorClass}">${value}</div>
                    </div>
                `;
            });
            html += `</div>`;
        }
        
        // ====== 2. AJOUTER LES STATISTIQUES ZACC ======
        var zaccStats = page.querySelector('#zaccStats');
        if (zaccStats) {
            var stats = zaccStats.querySelectorAll('.stat-card');
            if (stats.length > 0) {
                html += `<h2>📊 Statistiques ZACC</h2><div class="stats-grid">`;
                stats.forEach(function(stat) {
                    var label = stat.querySelector('h4')?.innerText || '';
                    var value = stat.querySelector('p')?.innerText || '0';
                    html += `
                        <div class="stat-card">
                            <div class="label">${label}</div>
                            <div class="value">${value}</div>
                        </div>
                    `;
                });
                html += `</div>`;
            }
        }
        
        // ====== 3. AJOUTER LES FILTRES ======
        var filters = page.querySelector('.filter-area');
        if (filters) {
            var filterText = filters.innerText.replace(/Réinitialiser/g, '').trim();
            if (filterText.length > 10) {
                html += `
                    <div class="filter-info">
                        <strong>🔍 Filtres appliqués:</strong> ${filterText}
                    </div>
                `;
            }
        }
        
        // ====== 4. AJOUTER TOUS LES TABLEAUX ======
        var tables = page.querySelectorAll('.table-container table, table');
        var tableIndex = 0;
        tables.forEach(function(table) {
            var text = table.innerText;
            if (text.includes('Chargez') || text.includes('Aucune donnée') || text.includes('Aucun fichier')) {
                return;
            }
            tableIndex++;
            html += `<h2>📋 Tableau ${tableIndex}</h2>`;
            html += table.outerHTML;
        });
        
        // ====== 5. AJOUTER LES GRAPHIQUES ======
        var canvasElements = page.querySelectorAll('canvas');
        var chartIndex = 0;
        canvasElements.forEach(function(canvas) {
            try {
                var imgData = canvas.toDataURL('image/png');
                if (imgData && imgData.length > 100) {
                    chartIndex++;
                    var label = canvas.parentElement?.querySelector('h4')?.innerText || 
                               canvas.parentElement?.parentElement?.querySelector('h4')?.innerText ||
                               'Graphique ' + chartIndex;
                    html += `
                        <div class="chart-container">
                            <h4>📈 ${label}</h4>
                            <img src="${imgData}" alt="${label}">
                        </div>
                    `;
                }
            } catch(e) {}
        });
        
        // ====== 6. AJOUTER LES STATISTIQUES PK ======
        var pkStats = page.querySelector('[id^="total"]')?.parentElement;
        if (pkStats) {
            var statsHtml = pkStats.outerHTML;
            if (statsHtml && statsHtml.length > 50) {
                html += `<h2>📊 Statistiques PK</h2>`;
                html += `<div style="background:#f8fafc; padding:15px; border-radius:8px; border:1px solid #e8ecf2; margin:15px 0;">`;
                html += statsHtml;
                html += `</div>`;
            }
        }
        
        // ====== 7. FOOTER ======
        html += `
                <div class="footer">
                    Généré par DRRS - Analyse des Accidents © ${new Date().getFullYear()}<br>
                    <span style="font-size:11px; color:#bbb;">Exporté le ${new Date().toLocaleString('fr-FR')}</span>
                </div>
            </div>
        </body>
        </html>
        `;
        
        var blob = new Blob([html], { type: 'text/html;charset=utf-8' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = nomFichier + '.html';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },
    
    // ============================================================
    // FONCTIONS D'EXPORT PAR PAGE
    // ============================================================
    
    // ====== Analyse ======
    exporterAnalyse: function() {
        var nom = this.getNomFichier('Analyse_Accidents');
        this.exporterPageEnXLSX('page-analyse', nom);
    },
    
    exporterAnalyseComplet: function() {
        var nom = this.getNomFichier('Analyse_Accidents_Complete');
        this.exporterPageEnHTML('page-analyse', nom);
    },
    
    // ====== Intervenants ======
    exporterIntervenants: function() {
        var nom = this.getNomFichier('Delais_Intervenants');
        this.exporterPageEnXLSX('page-intervenants', nom);
    },
    
    exporterIntervenantsComplet: function() {
        var nom = this.getNomFichier('Delais_Intervenants_Complete');
        this.exporterPageEnHTML('page-intervenants', nom);
    },
    
    // ====== Dépanneurs ======
    exporterDepanneurs: function() {
        var nom = this.getNomFichier('Delais_Depanneurs');
        this.exporterPageEnXLSX('page-depanneurs', nom);
    },
    
    exporterDepanneursComplet: function() {
        var nom = this.getNomFichier('Delais_Depanneurs_Complete');
        this.exporterPageEnHTML('page-depanneurs', nom);
    },
    
    // ====== ZACC ======
    exporterZACC: function() {
        var nom = this.getNomFichier('ZACC_Resultats');
        this.exporterPageEnXLSX('page-zacc', nom);
    },
    
    exporterZACCComplet: function() {
        var nom = this.getNomFichier('ZACC_Resultats_Complete');
        this.exporterPageEnHTML('page-zacc', nom);
    },
    
    // ====== Graphiques (Dashboard) ======
    exporterGraphiques: function() {
        var nom = this.getNomFichier('Dashboard');
        this.exporterPageEnHTML('page-graphiques', nom);
    },
    
    exporterGraphiquesComplet: function() {
        var nom = this.getNomFichier('Dashboard_Complet');
        this.exporterPageEnHTML('page-graphiques', nom);
    },
    
    // ====== Rapprochement ======
    exporterRapprochement: function() {
        var nom = this.getNomFichier('Rapprochement_Differences');
        this.exporterPageEnXLSX('page-rapprochement', nom);
    },
    
    exporterRapprochementComplet: function() {
        var nom = this.getNomFichier('Rapprochement_Complet');
        this.exporterPageEnHTML('page-rapprochement', nom);
    },
    
    // ====== Chargement ======
    exporterToutesLesDonnees: function() {
        if (!toutesLesDonnees || toutesLesDonnees.length === 0) {
            alert('❌ Aucune donnée à exporter. Chargez d\'abord un fichier.');
            return;
        }
        var nom = this.getNomFichier('Toutes_Les_Donnees');
        try {
            var ws = XLSX.utils.json_to_sheet(toutesLesDonnees);
            var wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Donnees');
            var wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
            var blob = new Blob([wbout], { type: 'application/octet-stream' });
            var url = URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url;
            a.download = nom + '.xlsx';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch(e) {
            alert('❌ Erreur: ' + e.message);
        }
    },
    
    exporterDonneesBrutes: function() {
        if (!toutesLesDonnees || toutesLesDonnees.length === 0) {
            alert('❌ Aucune donnée à exporter.');
            return;
        }
        var nom = this.getNomFichier('Donnees_Brutes');
        var blob = new Blob([JSON.stringify(toutesLesDonnees, null, 2)], { type: 'application/json' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = nom + '.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
};

