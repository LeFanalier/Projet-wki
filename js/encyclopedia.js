// js/encyclopedia.js
const form = document.getElementById('add-item-form');

if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const code = document.getElementById('secret_code').value;
        if (code !== '1234') return alert("CODE INCORRECT");

        const newItem = {
            nom: document.getElementById('nom').value,
            emplacement: document.getElementById('emplacement').value,
            rarete: document.getElementById('rarete').value,
            image_url: document.getElementById('image_url').value,
            nom_set: document.getElementById('nom_set').value || null,
            palier: parseInt(document.getElementById('req_lvl').value) > 50 ? 3 : 1, // Logique palier simple
            restrictions: {
                lvl: parseInt(document.getElementById('req_lvl').value) || 0,
                force: parseInt(document.getElementById('req_force').value) || 0,
                int: parseInt(document.getElementById('req_int').value) || 0,
                dex: parseInt(document.getElementById('req_dex').value) || 0
            },
            stats: {
                deg_att: parseInt(document.getElementById('stat-deg_att').value) || 0,
                hp: parseInt(document.getElementById('stat-hp').value) || 0,
                def: parseInt(document.getElementById('stat-def').value) || 0,
                crit_chance: parseInt(document.getElementById('stat-crit_chance').value) || 0,
                speed: parseInt(document.getElementById('stat-speed').value) || 0
            }
        };

        const { error } = await supabaseClient.from('items').insert([newItem]);
        if (error) alert(error.message);
        else { alert("ITEM ENREGISTRÉ !"); form.reset(); }
    });
}