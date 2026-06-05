/* ============================================================
   PROJET WKI - UI PROFILE ENGINE (FINAL STABLE VERSION)
   ============================================================ */

let selectedSlot = null;
let allItems = [];
let activeBuildIndex = 0;
let skinViewer = null;

let filters = {
    search: "",
    rarity: "ALL",
    palier: "ALL",
    stat: "ALL",
    slot: null
};

const rarityColors = {
    'COMMUN': '#9d9d9d',
    'RARE': '#0070dd',
    'ÉPIQUE': '#a335ee',
    'LÉGENDAIRE': '#ff8000',
    'MYTHIQUE': '#e6cc80',
    'GODLIKE': '#e63946',
    'EVENT': '#1ed760'
};

const statIcons = {
    deg_att: 'swords', deg_phys: 'bolt', bonus_phys: 'trending_up', vit_att: 'air',
    crit_chance: 'cyclone', crit_dmg: 'explosion', crit_comp_chance: 'magic_button',
    crit_comp_dmg: 'electric_bolt', deg_mag: 'auto_awesome', deg_proj: 'near_me',
    vamp: 'motion_photos_on', lifesteal: 'bloodtype', def: 'shield',
    red_dmg: 'verified_user', esquive: 'visibility_off', tenacite: 'gavel',
    hp: 'favorite', reg_hp: 'vital_signs', mana: 'diamond', reg_mana: 'shutter_speed',
    stamina: 'eco', reg_stam: 'energy_savings_leaf', heal_bonus: 'add_box',
    dmg_cap: 'flare', cdr: 'progress_activity', speed: 'directions_run',
    magic_find: 'auto_fix_high', bonus_xp: 'keyboard_double_arrow_up'
};

const statLabels = {
    deg_att: 'Attaque', deg_phys: 'Dégâts Phys.', bonus_phys: 'Bonus Phys.',
    vit_att: 'Vit. Attaque', crit_chance: 'Critique %', crit_dmg: 'Dégâts Crit.',
    crit_comp_chance: 'Crit. Comp.', crit_comp_dmg: 'Dég. Crit. Comp.',
    deg_mag: 'Dégâts Mag.', deg_proj: 'Projectiles', vamp: 'Vampirisme',
    lifesteal: 'Vol de Vie', def: 'Défense', red_dmg: 'Réduc. Dégâts',
    esquive: 'Esquive', tenacite: 'Ténacité', hp: 'Santé', reg_hp: 'Régén. Santé',
    mana: 'Mana', reg_mana: 'Régén. Mana', stamina: 'Endurance',
    reg_stam: 'Régén. Stam.', heal_bonus: 'Soin Bonus', dmg_cap: 'Dég. Capacité',
    cdr: 'Récupération', speed: 'Vitesse', magic_find: 'Butin Mag.', bonus_xp: 'Bonus XP'
};

// --- 1. INITIALISATION ---
document.addEventListener('DOMContentLoaded', () => {
    fetchInventory();
    setupFilters();
    setupSlotInteractions();
    setupStatRowFilters();
    setupBuildSwitch();
    initLevelSystem(); 
    init3dSkinViewer(); // <-- Initialise le personnage Minecraft en 3D
});

function setupFilters() {
    // Recherche textuelle
    const searchInp = document.getElementById('search-item');
    if (searchInp) {
        searchInp.addEventListener('input', (e) => {
            filters.search = e.target.value.toLowerCase();
            applyAllFilters();
        });
    }

    // Boutons de Rareté (Filtres groupés)
    const rarityBtns = document.querySelectorAll('#rarity-filter-group .filter-btn');
    rarityBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            rarityBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filters.rarity = btn.getAttribute('data-rarity');
            applyAllFilters();
        });
    });

    // Boutons de Palier
    const palierBtns = document.querySelectorAll('#palier-filter-group .filter-btn');
    palierBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            palierBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filters.palier = btn.getAttribute('data-palier');
            applyAllFilters();
        });
    });
}

function setupStatRowFilters() {
    const rows = document.querySelectorAll('aside:first-of-type .stat-row');
    rows.forEach(row => {
        row.addEventListener('click', () => {
            const statSpan = row.querySelector('span[id^="stat-"]');
            if (!statSpan) return;
            const statKey = statSpan.id.replace('stat-', '');

            if (filters.stat === statKey) {
                filters.stat = 'ALL';
                row.classList.remove('active-filter');
            } else {
                rows.forEach(r => r.classList.remove('active-filter'));
                row.classList.add('active-filter');
                filters.stat = statKey;
            }
            applyAllFilters();
        });
    });
}

// --- 2. LOGIQUE DE FILTRAGE ---
function applyAllFilters() {
    let filtered = allItems.filter(item => {
        const matchSearch = item.nom.toLowerCase().includes(filters.search);
        const matchRarity = filters.rarity === "ALL" || item.rarete === filters.rarity;
        const matchPalier = filters.palier === "ALL" || String(item.palier) === filters.palier;
        const matchSlot = !filters.slot || item.emplacement.toLowerCase() === filters.slot.toLowerCase();
        const matchStat = filters.stat === "ALL" || (item.stats && item.stats[filters.stat] > 0);
        return matchSearch && matchRarity && matchPalier && matchSlot && matchStat;
    });

    renderInventory(filtered);
    const countEl = document.getElementById('item-count');
    if (countEl) countEl.innerText = filtered.length;
}

// --- 3. RENDU DE L'INVENTAIRE ---
function renderInventory(items) {
    const container = document.getElementById('items-container');
    if (!container) return;
    container.innerHTML = '';

    items.forEach(item => {
        const rarity = item.rarete.toUpperCase();
        const color = rarityColors[rarity] || '#9d9d9d';

        let statsHtml = '<div class="grid grid-cols-2 gap-x-2 gap-y-1 mt-2">';
        if (item.stats) {
            Object.entries(item.stats).forEach(([statName, value]) => {
                if (value > 0) {
                    const icon = statIcons[statName] || 'add';
                    const label = statLabels[statName] || statName;
                    const isPercent = ['crit_chance', 'crit_dmg', 'crit_comp_chance', 'crit_comp_dmg', 'vamp', 'lifesteal', 'red_dmg', 'esquive', 'cdr', 'deg_mag', 'bonus_phys', 'magic_find', 'bonus_xp'].includes(statName);
                    
                    statsHtml += `
                        <div class="flex items-center justify-between bg-black/50 px-2 py-1.5 rounded" style="border: 1px solid rgba(163, 133, 91, 0.15)">
                            <div class="flex items-center gap-1.5 overflow-hidden">
                                <span class="material-symbols-outlined text-[11px] text-cyan-400 opacity-90">${icon}</span>
                                <span class="text-[8px] uppercase text-white/80 tracking-wider font-semibold truncate">${label}</span>
                            </div>
                            <span class="text-[10px] font-black" style="color: var(--gold-bright)">${value}${isPercent ? '%' : ''}</span>
                        </div>`;
                }
            });
        }
        statsHtml += '</div>';

        const card = document.createElement('div');
        card.className = `group cursor-pointer bg-white/[0.01] border-l-2 p-3 hover:bg-white/[0.04] transition-all relative overflow-hidden mb-2`;
        card.style.borderLeftColor = color;
        
        card.innerHTML = `
            <div class="flex gap-4">
                <div class="w-14 h-14 bg-black border-2 flex-shrink-0 relative ${rarity === 'LÉGENDAIRE' || rarity === 'MYTHIQUE' ? 'glow-rarity' : ''}" 
                     style="border-color: ${color}">
                    <img src="${item.image_url}" class="w-full h-full object-cover p-1 brightness-75 group-hover:brightness-100 transition-all">
                </div>
                <div class="flex-grow min-w-0">
                    <div class="flex justify-between items-start mb-0.5">
                        <h4 class="text-[10px] font-black text-white truncate uppercase tracking-widest">${item.nom}</h4>
                        <span class="text-[6px] font-black uppercase px-1 border" style="color: ${color}; border-color: ${color}">${item.rarete}</span>
                    </div>
                    <div class="flex gap-3 text-[7px] opacity-30 uppercase font-bold mb-1">
                        <span>${item.emplacement}</span><span>Palier ${item.palier || 1}</span>
                    </div>
                    ${statsHtml}
                </div>
            </div>`;
        
        card.onclick = () => equipItem(item);
        container.appendChild(card);
    });
}

// --- 4. ÉQUIPEMENT ET VISUELS ---
function equipItem(item) {
    if (!selectedSlot) return alert("SYSTÈME : CHOISIS UN SLOT D'ABORD");
    builds[activeBuildIndex][selectedSlot] = item;
    refreshVisualSlots();

    const slotEl = document.querySelector(`[data-slot="${selectedSlot}"]`);
    if (slotEl) {
        slotEl.classList.add('equip-pulse-effect');
        setTimeout(() => slotEl.classList.remove('equip-pulse-effect'), 2000);
    }
}

function refreshVisualSlots() {
    const current = builds[activeBuildIndex];
    document.querySelectorAll('[data-slot]').forEach(slotEl => {
        const slotName = slotEl.getAttribute('data-slot');
        const item = current[slotName];

        slotEl.classList.remove('border-white/10', 'border-white/20', 'glow-rarity');
        slotEl.style.border = ""; 
        slotEl.style.boxShadow = "";

        if (item) {
            const rarity = item.rarete.trim().toUpperCase();
            const color = rarityColors[rarity] || '#9d9d9d';
            slotEl.style.setProperty('border', `2px solid ${color}`, 'important');
            slotEl.style.boxShadow = `0 0 10px ${color}33`; 
            if (rarity !== 'COMMUN') slotEl.classList.add('glow-rarity');
            slotEl.innerHTML = `<img src="${item.image_url}" class="w-full h-full object-cover p-1">`;
        } else {
            const iconMap = { arme: 'swords', casque: 'shield_person', plastron: 'apparel', gants: 'front_hand', jambieres: 'layers', bottes: 'ice_skating', amulette: 'military_tech', bracelet: 'watch', anneau1: 'toll', anneau2: 'toll', secondaire: 'shield', artefact1: 'deployed_code', artefact2: 'deployed_code', artefact3: 'deployed_code' };
            slotEl.innerHTML = `<span class="material-symbols-outlined opacity-10 text-3xl">${iconMap[slotName]}</span>`;
            slotEl.style.border = "1px solid rgba(255,255,255,0.1)";
        }
    });

    // Recalcule les statistiques finales de combat
    if (typeof updateFinalStats === "function") {
        updateFinalStats();
    }

    // Force la réapplication de notre niveau interactif après le calcul
    if (typeof updateLevelUI === "function") {
        updateLevelUI();
    }
}

// --- 5. INTERACTIONS SLOTS ---
function setupSlotInteractions() {
    document.querySelectorAll('[data-slot]').forEach(slot => {
        
        // 1. CLIC GAUCHE : Sélectionner le slot et filtrer l'inventaire
        slot.addEventListener('click', () => {
            // Nettoie l'ancien slot actif
            document.querySelectorAll('[data-slot]').forEach(s => {
                s.classList.remove('active-slot-selection');
            });
            
            selectedSlot = slot.getAttribute('data-slot');
            filters.slot = selectedSlot;
            
            // Applique le halo néon sur le slot actif
            slot.classList.add('active-slot-selection');

            const indicator = document.getElementById('slot-indicator');
            const nameDisplay = document.getElementById('active-slot-name');
            if (indicator && nameDisplay) {
                indicator.classList.remove('hidden');
                nameDisplay.innerText = selectedSlot.toUpperCase();
            }
            applyAllFilters();
        });

        // 2. CLIC DROIT : Déséquiper l'objet du slot
        slot.addEventListener('contextmenu', (e) => {
            e.preventDefault(); // Empêche le menu contextuel classique du navigateur d'apparaître
            
            const slotName = slot.getAttribute('data-slot');
            
            // Si un objet est équipé dans ce slot pour le build actif, on le retire
            if (builds && builds[activeBuildIndex] && builds[activeBuildIndex][slotName]) {
                builds[activeBuildIndex][slotName] = null; // Supprime l'objet du build
                
                refreshVisualSlots(); // Actualise l'affichage (remet l'icône par défaut et recalcule les stats)

                // Si le slot qu'on vient de déséquiper était celui sélectionné, on rafraîchit la liste d'objets
                if (selectedSlot === slotName) {
                    applyAllFilters();
                }
            }
        });

    });
}

function clearSlotFilter() {
    filters.slot = null;
    selectedSlot = null;
    document.querySelectorAll('[data-slot]').forEach(s => {
        s.classList.remove('active-slot-selection');
    });
    if (document.getElementById('slot-indicator')) document.getElementById('slot-indicator').classList.add('hidden');
    applyAllFilters();
}

// --- 6. SYSTÈME DE BUILDS ---
function setupBuildSwitch() {
    document.querySelectorAll('[data-build]').forEach((btn, i) => {
        btn.addEventListener('click', () => {
            activeBuildIndex = i;
            // Supprime l'état actif de tous les boutons de builds
            document.querySelectorAll('[data-build]').forEach(b => b.classList.remove('active'));
            // Ajoute l'état actif sur le bouton cliqué (géré en CSS)
            btn.classList.add('active');
            refreshVisualSlots();
        });
    });
}

// --- 7. DATABASE & RESET ---
async function fetchInventory() {
    if (typeof supabaseClient === 'undefined') return;
    const { data, error } = await supabaseClient.from('items').select('*');
    if (error) return console.error("Erreur Database:", error);
    allItems = data;
    applyAllFilters(); 
}

function resetAllFilters() {
    filters = { search: "", rarity: "ALL", palier: "ALL", stat: "ALL", slot: null };
    
    // UI Resets
    document.getElementById('search-item').value = "";
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector('[data-rarity="ALL"]').classList.add('active');
    document.querySelector('[data-palier="ALL"]').classList.add('active');
    document.querySelectorAll('.stat-row').forEach(r => r.classList.remove('active-filter'));
    
    clearSlotFilter();
}

// --- 8. SYSTÈME DE NIVEAUX & ATTRIBUTION DE POINTS ---
let currentLevel = 1;
let availablePoints = 0;

function initLevelSystem() {
    const levelEl = document.getElementById('player-level');
    if (levelEl) {
        currentLevel = parseInt(levelEl.innerText) || 1;
    }
    const pointsEl = document.getElementById('points-available');
    if (pointsEl) {
        availablePoints = parseInt(pointsEl.innerText) || 0;
    }
    updateLevelUI();
}

function changeLevel(amount) {
    if (currentLevel + amount < 1) return; // Niveau minimum = 1
    currentLevel += amount;
    
    // Chaque montée de niveau octroie +5 Points de Bénédiction.
    // Chaque baisse de niveau retire 5 points (sans descendre sous 0).
    if (amount > 0) {
        availablePoints += amount * 1;
    } else {
        availablePoints = Math.max(0, availablePoints + (amount * 1));
    }
    
    updateLevelUI();
}

function updateLevelUI() {
    // Mise à jour de l'affichage du niveau
    const levelEl = document.getElementById('player-level');
    if (levelEl) levelEl.innerText = currentLevel;

    // Mise à jour des Points de Bénédiction disponibles pour les attributs
    const pointsEl = document.getElementById('points-available');
    if (pointsEl) pointsEl.innerText = availablePoints;

    // Progression de la barre d'XP (simulée de façon dynamique par le niveau)
    const levelBar = document.getElementById('level-bar');
    if (levelBar) {
        let xpPercent = (currentLevel * 12) % 100;
        if (xpPercent === 0) xpPercent = 15; // Pour éviter une barre vide
        levelBar.style.width = `${xpPercent}%`;
    }
}
// --- 9. VISUALISEUR 3D MINECRAFT ANIMÉ & INTERACTIF (CORRIGÉ) ---
function init3dSkinViewer() {
    const canvasElement = document.getElementById("skin_container");
    if (!canvasElement) return;

    // Initialisation globale robuste pour éviter tout problème de portée
    window.skinViewer = new skinview3d.SkinViewer({
        canvas: canvasElement,
        width: 320,
        height: 520,
        alpha: true, // Fond transparent
        skin: "../assets/images/frr-kayou-skin.png" // Skin par défaut
    });

    // Configuration des contrôles caméra
    window.skinViewer.controls.enableRotate = true;
    window.skinViewer.controls.enableZoom = false;
    window.skinViewer.controls.enablePan = false;

    // Ajout d'une animation douce de marche
    const walk = window.skinViewer.animations.add(skinview3d.WalkingAnimation);
    walk.speed = 0.55;

    // Intensités lumineuses
    window.skinViewer.cameraLight.intensity = 0.8;
    window.skinViewer.globalLight.intensity = 0.55;

    // Écouteur d'évènement pour l'uploader de Skin (Sécurisé via window et Blob)
    const uploader = document.getElementById("skin-uploader");
    if (uploader) {
        uploader.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (!file) return;

            console.log("Chargement du skin utilisateur :", file.name);

            // Génère une URL locale directe de l'image
            const blobUrl = URL.createObjectURL(file);
            
            // Applique la texture
            if (window.skinViewer) {
                window.skinViewer.loadSkin(blobUrl);
                console.log("Skin appliqué avec succès.");
            } else {
                console.error("Erreur : L'instance 3D (window.skinViewer) est introuvable.");
            }
        });
    }
}