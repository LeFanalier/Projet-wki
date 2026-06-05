// js/supabase-config.js
const SUPABASE_URL = 'https://mjsqolvnsxcmmgwtlrsz.supabase.co';
const SUPABASE_KEY = 'sb_publishable_nq5yEwJlkmKXz63xOLfPpw_KxC5-7La';

// On change 'const supabase' par 'const supabaseClient'
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ============================================================
// LOGIQUE D'AUTHENTIFICATION DISCORD VIA SUPABASE
// ============================================================

// Fonction de redirection vers la page d'autorisation de Discord
async function signInWithDiscord() {
    if (typeof supabaseClient === 'undefined') return;
    const { error } = await supabaseClient.auth.signInWithOAuth({
        provider: 'discord',
        options: {
            // Redirige l'utilisateur vers votre calculateur après authentification
            redirectTo: window.location.origin + '/pages/stuff.html' 
        }
    });
    if (error) console.error("Erreur de connexion Discord :", error.message);
}

// Fonction de déconnexion de la session
async function signOut() {
    if (typeof supabaseClient === 'undefined') return;
    const { error } = await supabaseClient.auth.signOut();
    if (error) console.error("Erreur de déconnexion :", error.message);
    else window.location.reload(); // Recharge la page pour nettoyer la session
}

// Fonction pour rafraîchir l'interface utilisateur du Header
function updateHeaderAuthUI(session) {
    const loginBtn = document.getElementById('login-btn');
    const userProfile = document.getElementById('user-profile');
    const userName = document.getElementById('user-name');
    const userAvatar = document.getElementById('user-avatar');
    const logoutBtn = document.getElementById('logout-btn');

    // Si les éléments du header ne sont pas encore chargés dans le DOM, on s'arrête
    if (!loginBtn || !userProfile) return;

    if (session && session.user) {
        const user = session.user;
        const name = user.user_metadata.full_name || user.user_metadata.name || "Joueur";
        const avatar = user.user_metadata.avatar_url || "";

        // Affiche le profil connecté et masque le bouton d'authentification
        loginBtn.style.display = 'none';
        userProfile.style.display = 'flex';
        if (userName) userName.innerText = name.toUpperCase();
        if (userAvatar) userAvatar.src = avatar;

        // Lie l'action de déconnexion au clic sur l'avatar hexagonal
        if (logoutBtn) logoutBtn.onclick = signOut;
    } else {
        // Affiche le bouton d'authentification et masque le profil connecté
        loginBtn.style.display = 'flex';
        userProfile.style.display = 'none';

        // Lie l'action de connexion au bouton Discord
        loginBtn.onclick = signInWithDiscord;
    }
}

// Écoute automatique des changements d'état d'authentification de Supabase
if (typeof supabaseClient !== 'undefined') {
    supabaseClient.auth.onAuthStateChange(async (event, session) => {
        // Vérification immédiate
        updateHeaderAuthUI(session);

        // Double vérification par sécurité pour s'adapter au temps de chargement du header via app.js
        setTimeout(() => updateHeaderAuthUI(session), 150);
        setTimeout(() => updateHeaderAuthUI(session), 600);
    });
}