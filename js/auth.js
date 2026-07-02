// ═══════════════════════════════════════════════════════
//  AUTH — session stored locally, credentials verified
//  against the Supabase `users` table.
// ═══════════════════════════════════════════════════════

const SESSION_KEY = 'vape_session';

function saveSession(user) {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ id: user.id }));
}
function clearSession() {
    localStorage.removeItem(SESSION_KEY);
}
function getSessionUserId() {
    try {
        const raw = localStorage.getItem(SESSION_KEY);
        const parsed = raw ? JSON.parse(raw) : null;
        return parsed?.id ?? null;
    } catch {
        return null;
    }
}

// Called from index.html's login form
async function attemptLogin(username, password) {
    const user = await loginDb(username, password);
    if (!user) return null;
    saveSession(user);
    return user;
}

function logout() {
    clearSession();
    window.location.href = 'index.html';
}
