// js/ui-profile.js

// js/ui-profile.js
let selectedSlot = null;

async function fetchInventory() {
    const { data: items, error } = await supabaseClient.from('items').select('*');
    if (error) return console.error("Erreur Supabase:", error);
    renderInventory(items);
}

function renderInventory(items) {
    const container = document.getElementById('items-container');
    if (!container) return;
    container.innerHTML = '';

    items.forEach(item => {
        const div = document.createElement('div');
        div.className = "glass-panel p-3 border-primary/20 hover:border-primary/50 transition-all group cursor-pointer relative overflow-hidden hover:bg-primary/5";
        
        const rarityColor = item.rarete === 'LÉGENDAIRE' ? 'text-yellow-400 border-yellow-500/40' : 
                          item.rarete === 'ÉPIQUE' ? 'text-purple-400 border-purple-500/40' : 'text-blue-400 border-blue-500/40';

        div.innerHTML = `
            <div class="flex gap-3">
                <div class="w-12 h-12 bg-surface-container-highest/20 border border-primary/20 flex-shrink-0 relative">
                    <img src="${item.image_url}" class="w-full h-full object-cover rendering-pixelated p-1" onerror="this.src='https://placehold.co/100x100?text=Item'">
                </div>
                <div class="flex-grow min-w-0">
                    <div class="flex justify-between items-start">
                        <h4 class="text-[10px] font-black text-on-surface truncate uppercase">${item.nom}</h4>
                        <span class="text-[6px] font-black px-1 border ${rarityColor}">${item.rarete}</span>
                    </div>
                    <p class="text-[8px] text-primary/60 uppercase mt-1">${item.emplacement} • Palier ${item.palier || 1}</p>
                </div>
            </div>`;
        
        div.onclick = () => equipItem(item);
        container.appendChild(div);
    });
}

function equipItem(item) {
    if (!selectedSlot) return alert("SYSTÈME : CLIQUE SUR UN CARRÉ AU CENTRE D'ABORD");
    
    // On équipe l'item dans le build global
    builds[activeBuildIndex][selectedSlot] = item;
    
    refreshVisualSlots();
}

function refreshVisualSlots() {
    const current = builds[activeBuildIndex];
    document.querySelectorAll('[data-slot]').forEach(slotEl => {
        const slotName = slotEl.getAttribute('data-slot');
        const item = current[slotName];
        
        if (item) {
            slotEl.innerHTML = `<img src="${item.image_url}" class="w-full h-full object-cover p-1 animate-pulse">`;
            slotEl.classList.add('glow-cyan', 'border-primary');
        } else {
            // Icônes par défaut pour les 14 slots
            const iconMap = { 
                arme: 'swords', casque: 'shield_person', plastron: 'apparel', gants: 'front_hand', 
                jambieres: 'layers', bottes: 'ice_skating', amulette: 'military_tech', 
                bracelet: 'watch', anneau1: 'toll', anneau2: 'toll', secondaire: 'shield', 
                artefact1: 'deployed_code', artefact2: 'deployed_code', artefact3: 'deployed_code' 
            };
            slotEl.innerHTML = `<span class="material-symbols-outlined opacity-20 text-3xl">${iconMap[slotName]}</span>`;
            slotEl.classList.remove('glow-cyan', 'border-primary');
        }
    });
    updateFinalStats();
}

// Sélection des slots (Anneau bleu)
document.querySelectorAll('[data-slot]').forEach(slot => {
    slot.addEventListener('click', () => {
        document.querySelectorAll('[data-slot]').forEach(s => s.classList.remove('ring-2', 'ring-primary', 'bg-primary/10'));
        selectedSlot = slot.getAttribute('data-slot');
        slot.classList.add('ring-2', 'ring-primary', 'bg-primary/10');
    });
});

// Changement de Build (1-5)
document.querySelectorAll('[data-build]').forEach((btn, i) => {
    btn.addEventListener('click', () => {
        activeBuildIndex = i;
        document.querySelectorAll('[data-build]').forEach(b => {
            b.classList.remove('glow-cyan', 'border-primary', 'text-primary');
            b.classList.add('opacity-50', 'border-primary/20', 'text-primary/40');
        });
        btn.classList.add('glow-cyan', 'border-primary', 'text-primary');
        btn.classList.remove('opacity-50', 'text-primary/40');
        refreshVisualSlots();
    });
});

document.addEventListener('DOMContentLoaded', fetchInventory);

let allItems = [];
let filters = {
    search: "",
    rarity: "ALL",
    palier: "ALL",
    stat: "ALL",
    slot: null
};

// 1. Initialisation et Dropdowns
document.addEventListener('DOMContentLoaded', () => {
    fetchInventory();
    setupDropdowns();
    
    // Recherche textuelle
    document.getElementById('search-item').addEventListener('input', (e) => {
        filters.search = e.target.value.toLowerCase();
        applyAllFilters();
    });

    // Filtre Statistique
    document.getElementById('filter-stat').addEventListener('change', (e) => {
        filters.stat = e.target.value;
        applyAllFilters();
    });
});

function setupDropdowns() {
    document.querySelectorAll('.custom-dropdown').forEach(dropdown => {
        const header = dropdown.querySelector('.drop-header');
        const options = dropdown.querySelector('.drop-options');
        const span = header.querySelector('span');

        header.onclick = (e) => {
            e.stopPropagation();
            options.classList.toggle('hidden');
            header.classList.toggle('border-primary');
        };

        options.querySelectorAll('.option').forEach(opt => {
            opt.onclick = () => {
                const val = opt.dataset.value;
                const type = dropdown.id.split('-')[1]; // rarity ou palier
                filters[type] = val;
                span.innerText = opt.innerText;
                options.classList.add('hidden');
                header.classList.remove('border-primary');
                applyAllFilters();
            };
        });
    });

    // Fermer les menus si on clique ailleurs
    window.onclick = () => {
        document.querySelectorAll('.drop-options').forEach(d => d.classList.add('hidden'));
    };
}

// 2. Logique de filtrage surpuissante
function applyAllFilters() {
    let filtered = allItems.filter(item => {
        // Match Nom ou Set
        const matchSearch = item.nom.toLowerCase().includes(filters.search) || 
                           (item.nom_set && item.nom_set.toLowerCase().includes(filters.search));
        
        // Match Rareté
        const matchRarity = filters.rarity === "ALL" || item.rarete === filters.rarity;
        
        // Match Palier
        const matchPalier = filters.palier === "ALL" || String(item.palier) === filters.palier;
        
        // Match Slot (Filtrage auto par clic au centre)
        const matchSlot = !filters.slot || item.emplacement.toLowerCase() === filters.slot.toLowerCase();

        // Match Statistique (L'item possède-t-il cette stat > 0 ?)
        const matchStat = filters.stat === "ALL" || (item.stats && item.stats[filters.stat] > 0);

        return matchSearch && matchRarity && matchPalier && matchSlot && matchStat;
    });

    renderInventory(filtered);
    document.getElementById('item-count').innerText = filtered.length;
}

// 3. Filtrage par Clic sur les slots centraux
document.querySelectorAll('[data-slot]').forEach(slot => {
    slot.addEventListener('click', () => {
        const slotName = slot.getAttribute('data-slot');
        filters.slot = slotName;
        
        // UI
        const indicator = document.getElementById('slot-indicator');
        indicator.classList.remove('hidden');
        document.getElementById('active-slot-name').innerText = slotName;
        
        applyAllFilters();
    });
});

function clearSlotFilter() {
    filters.slot = null;
    document.getElementById('slot-indicator').classList.add('hidden');
    document.querySelectorAll('[data-slot]').forEach(s => s.classList.remove('ring-2', 'ring-primary'));
    applyAllFilters();
}

function resetAllFilters() {
    filters = { search: "", rarity: "ALL", palier: "ALL", stat: "ALL", slot: null };
    document.getElementById('search-item').value = "";
    document.getElementById('filter-stat').value = "ALL";
    document.getElementById('slot-indicator').classList.add('hidden');
    // Reset labels dropdowns
    document.querySelector('#dropdown-rarity .drop-header span').innerText = "Rareté";
    document.querySelector('#dropdown-palier .drop-header span').innerText = "Palier";
    applyAllFilters();
}

// 4. Charger et Afficher
async function fetchInventory() {
    const { data, error } = await supabaseClient.from('items').select('*');
    if (error) return console.error(error);
    allItems = data;
    applyAllFilters();
}

function renderInventory(items) {
    const container = document.getElementById('items-container');
    container.innerHTML = '';

    items.forEach(item => {
        const rarityClass = item.rarete === 'LÉGENDAIRE' ? 'text-yellow-400 border-yellow-500/40' : 
                          item.rarete === 'ÉPIQUE' ? 'text-purple-400 border-purple-500/40' : 'text-blue-400 border-blue-500/40';
        
        const card = document.createElement('div');
        card.className = "glass-panel p-3 border-primary/20 hover:border-primary/50 transition-all group cursor-pointer relative overflow-hidden";
        card.innerHTML = `
            <div class="flex gap-3">
                <div class="w-10 h-10 bg-surface-container-highest border border-primary/10 flex-shrink-0">
                    <img src="${item.image_url}" class="w-full h-full object-cover rendering-pixelated p-1">
                </div>
                <div class="flex-grow min-w-0">
                    <div class="flex justify-between items-start">
                        <h4 class="text-[9px] font-black text-on-surface truncate uppercase">${item.nom}</h4>
                        <span class="text-[6px] px-1 border ${rarityClass}">${item.rarete}</span>
                    </div>
                    <div class="flex justify-between mt-1">
                        <span class="text-[7px] text-primary/40 uppercase">${item.emplacement}</span>
                        <span class="text-[7px] text-white/20 uppercase">Palier ${item.palier || 1}</span>
                    </div>
                </div>
            </div>`;
        card.onclick = () => equipItem(item);
        container.appendChild(card);
    });
}

