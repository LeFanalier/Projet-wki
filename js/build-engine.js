// js/build-engine.js

// État initial : 5 builds incluant le slot 'secondaire'
let builds = Array.from({ length: 5 }, () => ({
    arme: null, casque: null, plastron: null, gants: null, jambieres: null, bottes: null,
    amulette: null, bracelet: null, anneau1: null, anneau2: null, secondaire: null,
    artefact1: null, artefact2: null, artefact3: null
}));

// Attributs du joueur
let playerAttributes = { 
    force: 0, int: 0, dex: 0, esp: 0, def_base: 0, vit_base: 0, lvl: 1 
};

function updateFinalStats() {
    const lvl = playerAttributes.lvl;
    
    // 1. STATS DE BASE (Niveau + Attributs)
    let totals = {
        hp: 19 + lvl + (playerAttributes.vit_base * 3), 
        reg_hp: playerAttributes.esp * 0.15,
        mana: 0, 
        reg_mana: playerAttributes.esp * 0.1,
        stamina: 0,
        reg_stam: playerAttributes.esp * 0.05,
        heal_bonus: 0,
        deg_att: playerAttributes.force * 1,
        deg_phys: 0,
        bonus_phys: playerAttributes.force * 2,
        vit_att: 0,
        crit_chance: playerAttributes.dex * 0.75,
        crit_dmg: 0,
        crit_comp_chance: playerAttributes.int * 0.75,
        crit_comp_dmg: 0,
        deg_mag: playerAttributes.int * 1,
        deg_proj: 0,
        vamp: 0, 
        lifesteal: 0,
        def: playerAttributes.def_base * 0.4,
        red_dmg: 0,
        esquive: playerAttributes.dex * 0.3,
        tenacite: 0,
        dmg_cap: 0,
        cdr: 0,
        speed: 8, // Vitesse de base
        magic_find: 0,
        bonus_xp: 0
    };

    const currentBuild = builds[activeBuildIndex];
    let setsCount = {};

    // 2. AJOUT DES STATS DES ITEMS ÉQUIPÉS
    Object.values(currentBuild).forEach(item => {
        if (item) {
            // Stats brutes
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

    // 3. BONUS DE SETS
    Object.keys(setsCount).forEach(setName => {
        const count = setsCount[setName];
        const itemWithSet = Object.values(currentBuild).find(i => i && i.nom_set === setName);
        if (itemWithSet && itemWithSet.bonus_set) {
            if (count >= 2 && itemWithSet.bonus_set.bonus_2) applySetBonus(totals, itemWithSet.bonus_set.bonus_2);
            if (count >= 3 && itemWithSet.bonus_set.bonus_3) applySetBonus(totals, itemWithSet.bonus_set.bonus_3);
            if (count >= 4 && itemWithSet.bonus_set.bonus_4) applySetBonus(totals, itemWithSet.bonus_set.bonus_4);
        }
    });

    // 4. AFFICHAGE FINAL
    for (let s in totals) {
        const el = document.getElementById(`stat-${s}`);
        if (el) {
            let val = totals[s];
            let displayVal = Number.isInteger(val) ? val : val.toFixed(2);
            
            // Formatage Suffixes
            const percentStats = ['crit_chance', 'crit_dmg', 'crit_comp_chance', 'crit_comp_dmg', 'vamp', 'lifesteal', 'red_dmg', 'esquive', 'cdr', 'deg_mag', 'bonus_phys', 'magic_find', 'bonus_xp'];
            if (percentStats.includes(s)) {
                displayVal += "%";
            } else if (s.includes('reg_')) {
                displayVal += "/s";
            } else if (s === 'vit_att') {
                displayVal += "s";
            }
            el.innerText = displayVal;
        }
    }

    updateAttributeUI();
}

function applySetBonus(totals, bonusString) {
    // Logique simplifiée : cherche "+10 hp" ou "+5% crit_chance"
    // À adapter selon le format exact de ta base de données
    console.log("Bonus Set Activé :", bonusString);
}

function changeAttribute(attr, amount) {
    const spent = playerAttributes.force + playerAttributes.dex + playerAttributes.int + playerAttributes.esp + playerAttributes.def_base + playerAttributes.vit_base;
    const totalMax = playerAttributes.lvl - 1;
    if (amount > 0 && spent >= totalMax) return;
    
    playerAttributes[attr] += amount;
    if (playerAttributes[attr] < 0) playerAttributes[attr] = 0;
    updateFinalStats();
}

function changeLevel(amount) {
    playerAttributes.lvl += amount;
    if (playerAttributes.lvl < 1) playerAttributes.lvl = 1;
    if (playerAttributes.lvl > 100) playerAttributes.lvl = 100;
    
    const spent = playerAttributes.force + playerAttributes.dex + playerAttributes.int + playerAttributes.esp + playerAttributes.def_base + playerAttributes.vit_base;
    if (spent > (playerAttributes.lvl - 1)) {
        playerAttributes.force = playerAttributes.dex = playerAttributes.int = playerAttributes.esp = playerAttributes.def_base = playerAttributes.vit_base = 0;
    }
    updateFinalStats();
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
    const bar = document.getElementById('level-bar');
    if (bar) bar.style.width = playerAttributes.lvl + "%";
}

// Initialisation au chargement
document.addEventListener('DOMContentLoaded', updateFinalStats);