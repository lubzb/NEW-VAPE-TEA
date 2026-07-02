// ═══════════════════════════════════════════════════════
//  ENTRY POINT — runs on app.html load
// ═══════════════════════════════════════════════════════

async function initApp() {
    const sessionId = getSessionUserId();
    if (!sessionId) {
        window.location.href = 'index.html';
        return;
    }

    try {
        await loadAllData();
    } catch (e) {
        document.getElementById('appLoading').innerHTML =
            `<p style="color:var(--danger);max-width:360px;text-align:center;">
               Could not connect to the database.<br/>${e.message}<br/><br/>
               Check js/config.js has the correct Supabase URL/key and that sql/schema.sql has been run.
             </p>`;
        return;
    }

    const user = getUsers().find(u => u.id === sessionId);
    if (!user) {
        // Session points at a user that no longer exists
        clearSession();
        window.location.href = 'index.html';
        return;
    }
    cache.currentUser = user;

    applyTheme(getSettings().theme);
    initModal();
    renderNav();
    navigateTo('dashboard');
    scheduleAutoReport();

    document.getElementById('appLoading').classList.add('hidden');
    document.getElementById('appShell').classList.remove('hidden');
}

initApp();
setInterval(() => { if (getCurrentUser()) checkAutoReport(); }, 3600000);
