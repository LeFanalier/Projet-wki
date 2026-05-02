// js/build-engine.js

// État initial : 5 builds de 14 slots chacun
let builds = Array.from({ length: 5 }, () => ({
    arme: null, casque: null, plastron: null, gants: null, jambieres: null, bottes: null,
    amulette: null, bracelet: null, anneau1: null, anneau2: null, secondaire: null,
    artefact1: null, artefact2: null, artefact3: null
}));

let activeBuildIndex = 0;

// On commence au Niveau 1 avec 0 partout
let playerAttributes = { 
    force: 0, 
    int: 0, 
    dex: 0, 
    esp: 0, 
    def_base: 0, 
    vit_base: 0, 
    lvl: 1 
};

function updateFinalStats() {
    const lvl = playerAttributes.lvl;
    
    // 1. CALCUL DES STATS DE BASE (Tes formules exactes)
    let totals = {
        // Vitalité
        hp: 19 + lvl + (playerAttributes.vit_base * 3), // +1/lvl et +3/vitalité
        reg_hp: playerAttributes.esp * 0.15,           // +0.15/esprit
        mana: 0, 
        reg_mana: playerAttributes.esp * 0.1,          // +0.1/esprit
        stamina: 0,
        reg_stam: playerAttributes.esp * 0.05,         // +0.05/esprit
        heal_bonus: 0,

        // Offensif
        deg_att: playerAttributes.force * 1,           // +1/force
        deg_phys: 0,
        bonus_phys: playerAttributes.force * 2,        // +2%/force
        vit_att: 0,
        crit_chance: playerAttributes.dex * 0.75,      // +0.75%/dex
        crit_dmg: 0,
        crit_comp_chance: playerAttributes.int * 0.75, // +0.75%/int
        crit_comp_dmg: 0,
        deg_mag: playerAttributes.int * 1,             // +1%/int (magie)
        deg_proj: 0,
        vamp: 0, 
        lifesteal: 0,

        // Défensif
        def: playerAttributes.def_base * 0.4,          // +0.4/défense
        red_dmg: 0,
        esquive: playerAttributes.dex * 0.3,           // +0.3%/dex
        tenacite: 0,

        // Capacités & Utilité
        dmg_cap: 0,
        cdr: 0,
        speed: 0,
        magic_find: 0,
        bonus_xp: 0
    };

    // 2. AJOUT DES STATS DES ITEMS ÉQUIPÉS
    const currentBuild = builds[activeBuildIndex];
    Object.values(currentBuild).forEach(item => {
        if (item && item.stats) {
            for (let s in item.stats) {
                if (totals.hasOwnProperty(s)) {
                    totals[s] += item.stats[s];
                }
            }
        }
    });

    // 3. MISE À JOUR VISUELLE DES 27 STATS
    for (let s in totals) {
        const el = document.getElementById(`stat-${s}`);
        if (el) {
            let val = totals[s];
            // Formatage : Arrondi à 2 décimales pour la propreté
            let displayVal = Number.isInteger(val) ? val : val.toFixed(2);
            
            // Ajout des suffixes %, s, /s
            if (['crit_chance', 'crit_dmg', 'crit_comp_chance', 'crit_comp_dmg', 'vamp', 'lifesteal', 'red_dmg', 'esquive', 'cdr', 'deg_mag', 'bonus_phys', 'magic_find', 'bonus_xp'].includes(s)) {
                displayVal += "%";
            } else if (s.includes('reg_')) {
                displayVal += "/s";
            } else if (s === 'vit_att') {
                displayVal += "s";
            }
            
            el.innerText = displayVal;
        }
    }

    // 4. GESTION DES POINTS D'ATTRIBUTS (Restriction Niveau - 1)
    const spentPoints = playerAttributes.force + playerAttributes.dex + playerAttributes.int + 
                        playerAttributes.esp + playerAttributes.def_base + playerAttributes.vit_base;
    const totalPointsMax = lvl - 1;
    const available = totalPointsMax - spentPoints;

    document.getElementById('points-available').innerText = available;
    document.getElementById('val-force').innerText = playerAttributes.force;
    document.getElementById('val-dex').innerText = playerAttributes.dex;
    document.getElementById('val-int').innerText = playerAttributes.int;
    document.getElementById('val-esp').innerText = playerAttributes.esp;
    document.getElementById('val-def_base').innerText = playerAttributes.def_base;
    document.getElementById('val-vit_base').innerText = playerAttributes.vit_base;
    
    // 5. NIVEAU ET BARRE VISUELLE
    document.getElementById('player-level').innerText = lvl;
    const bar = document.getElementById('level-bar');
    if (bar) bar.style.width = lvl + "%";
}

function changeAttribute(attr, amount) {
    const spentPoints = playerAttributes.force + playerAttributes.dex + playerAttributes.int + 
                        playerAttributes.esp + playerAttributes.def_base + playerAttributes.vit_base;
    const totalPointsMax = playerAttributes.lvl - 1;

    // Bloquer si on n'a plus de points et qu'on veut augmenter
    if (amount > 0 && spentPoints >= totalPointsMax) return;
    
    playerAttributes[attr] += amount;
    if (playerAttributes[attr] < 0) playerAttributes[attr] = 0;
    
    updateFinalStats();
}

function changeLevel(amount) {
    playerAttributes.lvl += amount;
    if (playerAttributes.lvl < 1) playerAttributes.lvl = 1;
    if (playerAttributes.lvl > 100) playerAttributes.lvl = 100;
    
    // Si on baisse le niveau, on reset les attributs s'ils dépassent le nouveau quota
    let spentPoints = playerAttributes.force + playerAttributes.dex + playerAttributes.int + 
                      playerAttributes.esp + playerAttributes.def_base + playerAttributes.vit_base;
    
    if (spentPoints > (playerAttributes.lvl - 1)) {
        playerAttributes.force = playerAttributes.dex = playerAttributes.int = 
        playerAttributes.esp = playerAttributes.def_base = playerAttributes.vit_base = 0;
    }

    updateFinalStats();
}
// js/build-engine.js (Version finale avec Sets)

// ... (garder le début du fichier avec builds, playerAttributes, etc.)

function updateFinalStats() {
    const lvl = playerAttributes.lvl;
    
    // 1. STATS DE BASE (Niveau + Attributs)
    let totals = {
        hp: 19 + lvl + (playerAttributes.vit_base * 3), 
        def: playerAttributes.def_base * 0.4,
        deg_att: playerAttributes.force * 1,
        bonus_phys: playerAttributes.force * 2,
        deg_mag: playerAttributes.int * 1,
        crit_comp_chance: playerAttributes.int * 0.75,
        crit_chance: playerAttributes.dex * 0.75,
        esquive: playerAttributes.dex * 0.3,
        reg_mana: playerAttributes.esp * 0.1,
        reg_hp: playerAttributes.esp * 0.15,
        reg_stam: playerAttributes.esp * 0.05,
        mana: 0, stamina: 0, deg_phys: 0, deg_proj: 0, crit_dmg: 0,
        crit_comp_dmg: 0, vamp: 0, lifesteal: 0, red_dmg: 0, tenacite: 0,
        dmg_cap: 0, cdr: 0, heal_bonus: 0, speed: 0, magic_find: 0, bonus_xp: 0
    };

    const currentBuild = builds[activeBuildIndex];
    let setsCount = {}; // Pour compter : { "Givre": 3, "Corruption": 1 }

    // 2. SCAN DES ITEMS ÉQUIPÉS
    Object.values(currentBuild).forEach(item => {
        if (item) {
            // Ajout des stats brutes
            if (item.stats) {
                for (let s in item.stats) {
                    if (totals.hasOwnProperty(s)) totals[s] += item.stats[s];
                }
            }
            // Détection des sets
            if (item.nom_set) {
                setsCount[item.nom_set] = (setsCount[item.nom_set] || 0) + 1;
            }
        }
    });

    // 3. APPLICATION DES BONUS DE SETS (CUMULATIFS)
    // Note: Cette partie récupère les bonus_set enregistrés dans Supabase
    Object.keys(setsCount).forEach(setName => {
        const count = setsCount[setName];
        // On cherche un des items du build pour récupérer les définitions des bonus de ce set
        const itemWithSet = Object.values(currentBuild).find(i => i && i.nom_set === setName);
        
        if (itemWithSet && itemWithSet.bonus_set) {
            // Si on a 2 pièces ou plus : on ajoute bonus 2
            if (count >= 2 && itemWithSet.bonus_set.bonus_2) {
                applySetBonus(totals, itemWithSet.bonus_set.bonus_2);
            }
            // Si on a 3 pièces ou plus : on ajoute AUSSI bonus 3
            if (count >= 3 && itemWithSet.bonus_set.bonus_3) {
                applySetBonus(totals, itemWithSet.bonus_set.bonus_3);
            }
            // Si on a 4 pièces ou plus : on ajoute AUSSI bonus 4
            if (count >= 4 && itemWithSet.bonus_set.bonus_4) {
                applySetBonus(totals, itemWithSet.bonus_set.bonus_4);
            }
        }
    });

    // 4. AFFICHAGE FINAL
    for (let s in totals) {
        const el = document.getElementById(`stat-${s}`);
        if (el) {
            let val = Number(totals[s].toFixed(2));
            if (['crit_chance', 'crit_comp_chance', 'deg_mag', 'bonus_phys', 'esquive', 'red_dmg', 'cdr', 'vamp', 'lifesteal', 'crit_dmg', 'crit_comp_dmg', 'magic_find', 'bonus_xp'].includes(s)) val += "%";
            if (s.includes('reg_')) val += "/s";
            if (s === 'vit_att') val += "s";
            el.innerText = val;
        }
    }

    // Mise à jour de l'UI
    updateAttributeUI();
}

// Fonction utilitaire pour interpréter les bonus de set textuels (ex: "+10 deg_att")
function applySetBonus(totals, bonusString) {
    // Cette fonction transforme "+10 hp" ou "+5% crit_chance" en calcul
    // Pour le moment, comme tes bonus sont textuels, on peut simplement les afficher 
    // ou créer une mini-logique de parsing si tu veux qu'ils s'ajoutent aux chiffres.
    console.log("Bonus de set détecté :", bonusString);
}

function updateAttributeUI() {
    const spent = playerAttributes.force + playerAttributes.dex + playerAttributes.int + playerAttributes.esp + playerAttributes.def_base + playerAttributes.vit_base;
    document.getElementById('points-available').innerText = (playerAttributes.lvl - 1) - spent;
    document.getElementById('val-force').innerText = playerAttributes.force;
    document.getElementById('val-dex').innerText = playerAttributes.dex;
    document.getElementById('val-int').innerText = playerAttributes.int;
    document.getElementById('val-esp').innerText = playerAttributes.esp;
    document.getElementById('val-def_base').innerText = playerAttributes.def_base;
    document.getElementById('val-vit_base').innerText = playerAttributes.vit_base;
    document.getElementById('player-level').innerText = playerAttributes.lvl;
    document.getElementById('level-bar').style.width = playerAttributes.lvl + "%";
}