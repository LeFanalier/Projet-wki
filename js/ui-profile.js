/* ============================================================
   PROJET WKI - UI PROFILE ENGINE (LUNA COSMIC)
   ============================================================ */

let selectedSlot = null;
let allItems = [];
let activeBuildIndex = 0; // Défini ici pour correspondre aux builds de build-engine.js

let filters = {
    search: "",
    rarity: "ALL",
    palier: "ALL",
    stat: "ALL",
    slot: null
};

// --- 1. INITIALISATION ---
document.addEventListener('DOMContentLoaded', () => {
    fetchInventory();
    setupFilters();
    setupRarityChips();
    setupSlotInteractions();
});

// Initialise les écouteurs de la barre de recherche et des menus
function setupFilters() {
    const searchInp = document.getElementById('search-item');
    if (searchInp) {
        searchInp.addEventListener('input', (e) => {
            filters.search = e.target.value.toLowerCase();
            applyAllFilters();
        });
    }

    const palierSel = document.getElementById('filter-palier');
    if (palierSel) {
        palierSel.addEventListener('change', (e) => {
            filters.palier = e.target.value;
            applyAllFilters();
        });
    }

    const statSel = document.getElementById('filter-stat');
    if (statSel) {
        statSel.addEventListener('change', (e) => {
            filters.stat = e.target.value;
            applyAllFilters();
        });
    }
}

// Gère le clic sur les 8 types de raretés (Chips)
function setupRarityChips() {
    const chips = document.querySelectorAll('.rarity-chip');
    chips.forEach(chip => {
        chip.addEventListener('click', () => {
            // UI : Activer le bouton cliqué
            chips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');

            // Logique : Filtrer
            filters.rarity = chip.getAttribute('data-rarity');
            applyAllFilters();
        });
    });
}

// --- 2. LOGIQUE DE FILTRAGE ---
function applyAllFilters() {
    let filtered = allItems.filter(item => {
        // Match Recherche (Nom ou Set)
        const matchSearch = item.nom.toLowerCase().includes(filters.search) || 
                           (item.nom_set && item.nom_set.toLowerCase().includes(filters.search));
        
        // Match Rareté
        const matchRarity = filters.rarity === "ALL" || item.rarete === filters.rarity;
        
        // Match Palier
        const matchPalier = filters.palier === "ALL" || String(item.palier) === filters.palier;
        
        // Match Slot (Filtrage auto par clic au centre)
        const matchSlot = !filters.slot || item.emplacement.toLowerCase() === filters.slot.toLowerCase();

        // Match Statistique (L'item possède-t-il la stat demandée ?)
        const matchStat = filters.stat === "ALL" || (item.stats && item.stats[filters.stat] > 0);

        return matchSearch && matchRarity && matchPalier && matchSlot && matchStat;
    });

    renderInventory(filtered);
    
    // Mise à jour du compteur en bas
    const countEl = document.getElementById('item-count');
    if (countEl) countEl.innerText = filtered.length;
}

// --- 3. RENDU DE L'INVENTAIRE (CARTES TAROT) ---
function renderInventory(items) {
    const container = document.getElementById('items-container');
    if (!container) return;
    container.innerHTML = '';

    items.forEach(item => {
        const card = document.createElement('div');
        
        // Nettoyage de la rareté pour la classe CSS (ex: LÉGENDAIRE -> legendaire)
        const rarityKey = item.rarete.toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Enlever accents
            .replace(/\s/g, ""); // Enlever espaces
            
        card.className = `item-card border-${rarityKey}`;
        
        card.innerHTML = `
            <img src="${item.image_url}" class="item-card-img" onerror="this.src='https://placehold.co/100x100?text=Item'" draggable="false">
            <div class="item-card-info">
                <h4>${item.nom}</h4>
                <p>${item.rarete} • PALIER ${item.palier || 1}</p>
            </div>
        `;
        
        // Clic pour équiper
        card.addEventListener('click', () => equipItem(item));
        
        container.appendChild(card);
    });
}

// --- 4. ÉQUIPEMENT ET VISUELS ---
function equipItem(item) {
    if (!selectedSlot) {
        alert("SYSTÈME : VEUILLEZ SÉLECTIONNER UN EMPLACEMENT AU CENTRE.");
        return;
    }
    
    // On enregistre l'item dans l'objet global (défini dans build-engine.js)
    if (typeof builds !== 'undefined') {
        builds[activeBuildIndex][selectedSlot] = item;
        refreshVisualSlots();
    }
}

function refreshVisualSlots() {
    if (typeof builds === 'undefined') return;
    
    const current = builds[activeBuildIndex];
    document.querySelectorAll('[data-slot]').forEach(slotEl => {
        const slotName = slotEl.getAttribute('data-slot');
        const item = current[slotName];
        
        if (item) {
            // On affiche l'image de l'item équipé
            slotEl.innerHTML = `<img src="${item.image_url}" class="w-full h-full object-cover p-1 animate-pulse">`;
            slotEl.classList.add('glow-gold');
            slotEl.style.borderColor = "var(--gold)";
        } else {
            // On remet l'icône par défaut si vide
            const iconMap = { 
                arme: 'swords', casque: 'shield_person', plastron: 'apparel', gants: 'front_hand', 
                jambieres: 'layers', bottes: 'ice_skating', amulette: 'military_tech', 
                bracelet: 'watch', anneau1: 'toll', anneau2: 'toll', secondaire: 'shield', 
                artefact1: 'deployed_code', artefact2: 'deployed_code', artefact3: 'deployed_code' 
            };
            slotEl.innerHTML = `<span class="material-symbols-outlined opacity-20 text-3xl">${iconMap[slotName] || 'help'}</span>`;
            slotEl.classList.remove('glow-gold');
            slotEl.style.borderColor = "";
        }
    });
    
    // Recalculer les statistiques globales
    if (typeof updateFinalStats === 'function') {
        updateFinalStats();
    }
}

// --- 5. SÉLECTION DES SLOTS ---
function setupSlotInteractions() {
    document.querySelectorAll('[data-slot]').forEach(slot => {
        slot.addEventListener('click', () => {
            const slotName = slot.getAttribute('data-slot');
            
            // 1. État
            selectedSlot = slotName;
            filters.slot = slotName;

            // 2. UI : Surbrillance blanche sur le slot sélectionné
            document.querySelectorAll('[data-slot]').forEach(s => s.classList.remove('border-white', 'bg-white/10'));
            slot.classList.add('border-white', 'bg-white/10');

            // 3. UI : Affichage de l'indicateur de filtre dans l'aside de droite
            const indicator = document.getElementById('slot-indicator');
            const nameDisplay = document.getElementById('active-slot-name');
            
            if (indicator && nameDisplay) {
                indicator.classList.remove('hidden');
                const namesMapping = { 
                    arme: "Arme", casque: "Casque", plastron: "Plastron", gants: "Gants", 
                    jambieres: "Jambières", bottes: "Bottes", secondaire: "Secondaire", 
                    amulette: "Amulette", bracelet: "Bracelet", anneau1: "Anneau 1", 
                    anneau2: "Anneau 2", artefact1: "Artéfact 1", artefact2: "Artéfact 2", artefact3: "Artéfact 3" 
                };
                nameDisplay.innerText = namesMapping[slotName] || slotName;
            }

            // 4. Filtrer la liste auto
            applyAllFilters();
        });
    });
}

// Supprimer le filtre de slot (bouton X)
function clearSlotFilter() {
    filters.slot = null;
    selectedSlot = null;
    
    const indicator = document.getElementById('slot-indicator');
    if (indicator) indicator.classList.add('hidden');
    
    document.querySelectorAll('[data-slot]').forEach(s => s.classList.remove('border-white', 'bg-white/10'));
    
    applyAllFilters();
}

// --- 6. CHANGEMENT DE BUILD ---
document.querySelectorAll('[data-build]').forEach((btn, i) => {
    btn.addEventListener('click', () => {
        activeBuildIndex = i;
        
        document.querySelectorAll('[data-build]').forEach(b => {
            b.classList.remove('glow-gold', 'border-primary', 'text-primary');
            b.classList.add('opacity-40');
        });
        
        btn.classList.add('glow-gold', 'border-primary', 'text-primary');
        btn.classList.remove('opacity-40');
        
        refreshVisualSlots();
    });
});

// --- 7. CHARGEMENT DEPUIS LA BASE DE DONNÉES ---
async function fetchInventory() {
    if (typeof supabaseClient === 'undefined') return;

    const { data, error } = await supabaseClient.from('items').select('*');
    if (error) {
        console.error("Erreur de récupération des items :", error);
        return;
    }
    
    allItems = data;
    applyAllFilters(); // Affiche tout au début
}

// Réinitialisation totale (bouton Reset)
function resetAllFilters() {
    filters = { search: "", rarity: "ALL", palier: "ALL", stat: "ALL", slot: null };
    
    const searchInp = document.getElementById('search-item');
    if (searchInp) searchInp.value = "";
    
    const palierSel = document.getElementById('filter-palier');
    if (palierSel) palierSel.value = "ALL";

    const statSel = document.getElementById('filter-stat');
    if (statSel) statSel.value = "ALL";
    
    document.querySelectorAll('.rarity-chip').forEach(c => c.classList.remove('active'));
    const allChip = document.querySelector('[data-rarity="ALL"]');
    if (allChip) allChip.classList.add('active');
    
    clearSlotFilter();
}