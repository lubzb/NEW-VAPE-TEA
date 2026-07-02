// ═══════════════════════════════════════════════════════
//  SETTINGS PAGE
// ═══════════════════════════════════════════════════════

function renderSettings(el) {
    const s = getSettings();
    el.innerHTML = `
        <div class="card" style="max-width:700px;">
          <h4 style="font-weight:600;margin-bottom:1.5rem;">${t('settings')}</h4>
          <form id="settingsForm">
            <div class="form-group">
              <label>${t('language')}</label>
              <select class="form-control" id="setLang">
                <option value="en" ${s.language === 'en' ? 'selected' : ''}>${t('english')}</option>
                <option value="kh" ${s.language === 'kh' ? 'selected' : ''}>${t('khmer')}</option>
              </select>
            </div>
            <div class="form-group">
              <label>${t('currency')}</label>
              <select class="form-control" id="setCurrency">
                <option value="usd" ${s.currency === 'usd' ? 'selected' : ''}>${t('usd')}</option>
                <option value="khr" ${s.currency === 'khr' ? 'selected' : ''}>${t('khr')}</option>
              </select>
            </div>
            <div class="form-group">
              <label>${t('settings')}</label>
              <select class="form-control" id="setTheme">
                <option value="light" ${s.theme === 'light' ? 'selected' : ''}>${t('light_mode')}</option>
                <option value="dark" ${s.theme === 'dark' ? 'selected' : ''}>${t('dark_mode')}</option>
              </select>
            </div>
            <hr style="border-color:var(--border-color);margin:1.2rem 0;" />
            <h5 style="font-weight:600;margin-bottom:1rem;">${t('telegram_config')}</h5>
            <div class="form-group">
              <label>${t('bot_token')}</label>
              <input class="form-control" id="setBotToken" value="${s.telegramBotToken || ''}" placeholder="123456:ABC-DEF" />
            </div>
            <div class="form-group">
              <label>${t('chat_id')}</label>
              <input class="form-control" id="setChatId" value="${s.telegramChatId || ''}" placeholder="-123456789" />
            </div>
            <div class="form-group">
              <label>${t('auto_send')}</label>
              <select class="form-control" id="setAutoSend">
                <option value="true" ${s.autoSendReport ? 'selected' : ''}>${t('enabled')}</option>
                <option value="false" ${!s.autoSendReport ? 'selected' : ''}>${t('disabled')}</option>
              </select>
            </div>
            <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> ${t('save')}</button>
            <button type="button" class="btn btn-outline" onclick="showChangePassword(${getCurrentUser().id})" style="margin-left:10px;">
              <i class="fas fa-key"></i> ${t('change_password')}
            </button>
          </form>
        </div>
      `;

    document.getElementById('settingsForm').addEventListener('submit', async function (e) {
        e.preventDefault();
        const newSettings = {
            ...getSettings(),
            language: document.getElementById('setLang').value,
            currency: document.getElementById('setCurrency').value,
            theme: document.getElementById('setTheme').value,
            telegramBotToken: document.getElementById('setBotToken').value.trim(),
            telegramChatId: document.getElementById('setChatId').value.trim(),
            autoSendReport: document.getElementById('setAutoSend').value === 'true'
        };
        try {
            await updateSettingsDb(newSettings);
            applyTheme(getSettings().theme);
            toast('Settings saved!', 'success');
            renderNav();
            renderPage(currentRoute);
            scheduleAutoReport();
        } catch (e2) {
            toast('Failed to save settings: ' + e2.message, 'error');
        }
    });
}
