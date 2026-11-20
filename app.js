/**
 * Ren'Py RPA Studio — Main Application Controller
 * Handles UI interactions, drag-and-drop, theme, i18n, unpacking, and packing.
 */

(function () {
  'use strict';

  // --- State Variables ---
  let currentTheme = localStorage.getItem('rpa_studio_theme') || 'dark';
  let currentArchiveFile = null;
  let currentArchiveData = null;
  let activeTab = 'unpack';
  let queuedPackFiles = []; // Array<{ path: string, file: File|Blob }>
  let generatedPackBlob = null;
  let currentPackXorKey = RPA.utils.generateRandomXorKey();

  // --- DOM Elements Cache ---
  const els = {
    // Theme & Language
    html: document.documentElement,
    body: document.body,
    btnToggleTheme: document.getElementById('btn-toggle-theme'),
    iconThemeDark: document.getElementById('icon-theme-dark'),
    iconThemeLight: document.getElementById('icon-theme-light'),
    btnToggleLang: document.getElementById('btn-toggle-lang'),
    iconLangGlobe: document.getElementById('icon-lang-globe'),
    langIndicator: document.getElementById('lang-indicator'),

    // Tabs
    tabUnpack: document.getElementById('tab-unpack'),
    tabPack: document.getElementById('tab-pack'),
    panelUnpack: document.getElementById('panel-unpack'),
    panelPack: document.getElementById('panel-pack'),

    // Unpack Tab
    unpackUploadCard: document.getElementById('unpack-upload-card'),
    unpackDropzone: document.getElementById('unpack-dropzone'),
    inputRpaFile: document.getElementById('input-rpa-file'),
    btnBrowseRpa: document.getElementById('btn-browse-rpa'),
    btnLoadDemo: document.getElementById('btn-load-demo'),
    unpackProgress: document.getElementById('unpack-progress'),
    unpackStatusLabel: document.getElementById('unpack-status-label'),
    unpackPercent: document.getElementById('unpack-percent'),
    unpackProgressFill: document.getElementById('unpack-progress-fill'),

    // Unpack Results
    unpackResults: document.getElementById('unpack-results'),
    metaArchiveName: document.getElementById('meta-archive-name'),
    metaArchiveVersion: document.getElementById('meta-archive-version'),
    metaArchiveOffset: document.getElementById('meta-archive-offset'),
    metaArchiveKey: document.getElementById('meta-archive-key'),
    metaArchiveCount: document.getElementById('meta-archive-count'),
    metaArchiveSize: document.getElementById('meta-archive-size'),
    metaArchivePackedSize: document.getElementById('meta-archive-packed-size'),
    inputSearchFiles: document.getElementById('input-search-files'),
    btnDownloadZip: document.getElementById('btn-download-zip'),
    btnDownloadZipLabel: document.getElementById('btn-download-zip-label'),
    btnResetUnpack: document.getElementById('btn-reset-unpack'),
    filesTableBody: document.getElementById('files-table-body'),

    // Pack Tab
    packDropzone: document.getElementById('pack-dropzone'),
    inputPackFiles: document.getElementById('input-pack-files'),
    inputPackFolder: document.getElementById('input-pack-folder'),
    btnBrowsePackFiles: document.getElementById('btn-browse-pack-files'),
    btnBrowsePackFolder: document.getElementById('btn-browse-pack-folder'),
    inputArchiveFilename: document.getElementById('input-archive-filename'),
    packXorKeyDisplay: document.getElementById('pack-xor-key-display'),
    btnRegenXorKey: document.getElementById('btn-regen-xor-key'),
    queuedSummaryBadge: document.getElementById('queued-summary-badge'),
    btnClearQueue: document.getElementById('btn-clear-queue'),
    queuedFilesList: document.getElementById('queued-files-list'),
    queuedEmptyPlaceholder: document.getElementById('queued-empty-placeholder'),
    btnPackNow: document.getElementById('btn-pack-now'),

    // Pack Progress & Results
    packProgress: document.getElementById('pack-progress'),
    packStatusLabel: document.getElementById('pack-status-label'),
    packPercent: document.getElementById('pack-percent'),
    packProgressFill: document.getElementById('pack-progress-fill'),
    packSuccessCard: document.getElementById('pack-success-card'),
    resPackSize: document.getElementById('res-pack-size'),
    resPackCount: document.getElementById('res-pack-count'),
    resPackKey: document.getElementById('res-pack-key'),
    btnDownloadRpa: document.getElementById('btn-download-rpa'),
    btnPackReset: document.getElementById('btn-pack-reset'),

    // Crypto Support Modal & Footer
    btnOpenSupportModal: document.getElementById('btn-open-support-modal'),
    supportModalBackdrop: document.getElementById('support-modal-backdrop'),
    btnCloseSupportModal: document.getElementById('btn-close-support-modal'),
    modalCryptoAddress: document.getElementById('modal-crypto-address'),
    btnModalCopyCrypto: document.getElementById('btn-modal-copy-crypto'),
    modalIconCopyNormal: document.getElementById('modal-icon-copy-normal'),
    modalIconCopyChecked: document.getElementById('modal-icon-copy-checked'),
    modalLabelCopyCrypto: document.getElementById('modal-label-copy-crypto'),
    toastContainer: document.getElementById('toast-container')
  };

  // --- File Type Badges & Icons ---
  function getFileTypeBadge(ext) {
    ext = (ext || '').toLowerCase();
    if (['rpy', 'rpym', 'py', 'txt', 'json', 'yaml', 'yml'].includes(ext)) {
      return { label: 'SCRIPT', class: 'badge-script' };
    }
    if (['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg', 'bmp', 'ico'].includes(ext)) {
      return { label: 'IMG', class: 'badge-image' };
    }
    if (['ogg', 'opus', 'mp3', 'wav', 'flac', 'm4a'].includes(ext)) {
      return { label: 'AUDIO', class: 'badge-audio' };
    }
    if (['webm', 'mp4', 'ogv', 'avi', 'mkv'].includes(ext)) {
      return { label: 'VIDEO', class: 'badge-video' };
    }
    if (['ttf', 'otf', 'woff', 'woff2'].includes(ext)) {
      return { label: 'FONT', class: 'badge-font' };
    }
    if (['rpyc', 'rpymc', 'pyc'].includes(ext)) {
      return { label: 'BYTECODE', class: 'badge-bytecode' };
    }
    return { label: (ext || 'DATA').toUpperCase().slice(0, 6), class: 'badge-data' };
  }

  function getFileIconSvg(ext) {
    if (['rpy', 'rpym', 'py', 'txt', 'json'].includes(ext)) {
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><line x1="10" y1="9" x2="8" y2="9"></line></svg>`;
    }
    if (['rpyc', 'rpymc'].includes(ext)) {
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>`;
    }
    if (['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'].includes(ext)) {
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>`;
    }
    if (['ogg', 'opus', 'mp3', 'wav', 'flac'].includes(ext)) {
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>`;
    }
    if (['webm', 'mp4', 'ogv'].includes(ext)) {
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect><line x1="7" y1="2" x2="7" y2="22"></line><line x1="17" y1="2" x2="17" y2="22"></line><line x1="2" y1="12" x2="22" y2="12"></line><line x1="2" y1="7" x2="7" y2="7"></line><line x1="2" y1="17" x2="7" y2="17"></line><line x1="17" y1="17" x2="22" y2="17"></line><line x1="17" y1="7" x2="22" y2="7"></line></svg>`;
    }
    if (['ttf', 'otf', 'woff', 'woff2'].includes(ext)) {
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 7 4 4 20 4 20 7"></polyline><line x1="9" y1="20" x2="15" y2="20"></line><line x1="12" y1="4" x2="12" y2="20"></line></svg>`;
    }
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>`;
  }

  // --- Toast Notifications ---
  function showToast(message, type = 'info', duration = 3500) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let iconSvg = '';
    if (type === 'success') {
      iconSvg = `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
    } else if (type === 'error') {
      iconSvg = `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;
    } else {
      iconSvg = `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
    }

    toast.innerHTML = `${iconSvg}<span>${message}</span>`;
    els.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('toast-hiding');
      setTimeout(() => toast.remove(), 250);
    }, duration);
  }

  // --- Theme Management ---
  function applyTheme(theme, animate = false) {
    const previousTheme = currentTheme;
    currentTheme = theme;
    els.html.setAttribute('data-theme', theme);
    localStorage.setItem('rpa_studio_theme', theme);

    if (els.btnToggleTheme) {
      els.btnToggleTheme.setAttribute(
        'title',
        theme === 'dark'
          ? (window.i18n ? window.i18n.t('themeLight') : 'Switch to Light Mode')
          : (window.i18n ? window.i18n.t('themeDark') : 'Switch to Dark Mode')
      );
    }

    if (animate && els.iconThemeDark && els.iconThemeLight) {
      const outgoing = previousTheme === 'dark' ? els.iconThemeDark : els.iconThemeLight;
      const incoming = theme === 'dark' ? els.iconThemeDark : els.iconThemeLight;

      outgoing.classList.remove('anim-in');
      outgoing.classList.add('anim-out');

      incoming.classList.remove('anim-out');
      incoming.classList.add('anim-in');

      setTimeout(() => {
        outgoing.classList.remove('anim-out');
        incoming.classList.remove('anim-in');
      }, 450);
    }
  }

  function toggleTheme() {
    applyTheme(currentTheme === 'dark' ? 'light' : 'dark', true);
  }

  // --- Language Management ---
  function updateLanguageButton() {
    const isEn = window.i18n.lang === 'en';
    if (els.langIndicator) {
      els.langIndicator.textContent = isEn ? 'AR' : 'EN';
    }
    if (els.btnToggleLang) {
      els.btnToggleLang.setAttribute('title', isEn ? 'التبديل إلى العربية' : 'Switch to English');
    }
  }

  // --- Tab Navigation ---
  function switchTab(tab) {
    activeTab = tab;
    if (tab === 'unpack') {
      els.tabUnpack.classList.add('active');
      els.tabUnpack.setAttribute('aria-selected', 'true');
      els.tabPack.classList.remove('active');
      els.tabPack.setAttribute('aria-selected', 'false');

      els.panelUnpack.classList.add('active');
      els.panelPack.classList.remove('active');
    } else {
      els.tabPack.classList.add('active');
      els.tabPack.setAttribute('aria-selected', 'true');
      els.tabUnpack.classList.remove('active');
      els.tabUnpack.setAttribute('aria-selected', 'false');

      els.panelPack.classList.add('active');
      els.panelUnpack.classList.remove('active');
    }
  }

  // =========================================================================
  // SECTION 1: UNPACK LOGIC
  // =========================================================================

  async function processRpaFile(file) {
    if (!file) return;
    currentArchiveFile = file;

    // Show progress bar
    els.unpackProgress.style.display = 'block';
    els.unpackDropzone.style.display = 'none';
    els.unpackResults.style.display = 'none';

    try {
      const data = await RPA.RPAUnpacker.readArchive(file, (status, percent) => {
        let statusText = '';
        switch (status) {
          case 'reading_header':
            statusText = window.i18n.t('statusReadingHeader');
            break;
          case 'decompressing_index':
            statusText = window.i18n.t('statusDecompressingIndex');
            break;
          case 'parsing_pickle':
            statusText = window.i18n.t('statusParsingPickle');
            break;
          case 'deobfuscating':
            statusText = window.i18n.t('statusDeobfuscating');
            break;
          case 'ready':
            statusText = window.i18n.t('statusReady');
            break;
          default:
            statusText = status;
        }

        els.unpackStatusLabel.textContent = statusText;
        els.unpackPercent.textContent = `${percent}%`;
        els.unpackProgressFill.style.width = `${percent}%`;
      });

      currentArchiveData = data;
      renderUnpackResults(data);

      showToast(window.i18n.t('toastUnpackSuccess', { count: data.totalFiles }), 'success');
    } catch (err) {
      console.error('Unpack error:', err);
      let errorMsgKey = 'errGeneric';
      if (err.message === 'UNSUPPORTED_HEADER') errorMsgKey = 'errUnsupportedHeader';
      else if (err.message === 'CORRUPTED_HEADER_30') errorMsgKey = 'errCorruptedHeader30';
      else if (err.message === 'CORRUPTED_HEADER_20') errorMsgKey = 'errCorruptedHeader20';
      else if (err.message === 'INVALID_INDEX_OFFSET') errorMsgKey = 'errInvalidIndexOffset';
      else if (err.message === 'ZLIB_INFLATE_FAILED') errorMsgKey = 'errZlibInflateFailed';
      else if (err.message === 'PICKLE_PARSE_FAILED') errorMsgKey = 'errPickleParseFailed';
      else if (err.message === 'INVALID_INDEX_STRUCTURE') errorMsgKey = 'errInvalidIndexStructure';
      else if (err.message === 'PAKO_NOT_LOADED') errorMsgKey = 'errPakoNotLoaded';

      showToast(window.i18n.t(errorMsgKey) + (errorMsgKey === 'errGeneric' ? err.message : ''), 'error', 5000);
      resetUnpackWorkspace();
    }
  }

  function renderUnpackResults(data) {
    els.unpackUploadCard.style.display = 'none';
    els.unpackResults.style.display = 'block';

    els.metaArchiveName.textContent = currentArchiveFile.name || 'archive.rpa';
    els.metaArchiveVersion.textContent = data.version;
    if (els.metaArchiveOffset) els.metaArchiveOffset.textContent = data.indexOffset;
    if (els.metaArchivePackedSize) els.metaArchivePackedSize.textContent = data.formattedArchiveSize;
    els.metaArchiveKey.textContent = data.xorKeyHex;
    els.metaArchiveCount.textContent = data.totalFiles.toLocaleString();
    els.metaArchiveSize.textContent = data.formattedTotalSize;

    els.inputSearchFiles.value = '';
    renderFilesTable(data.entries);
  }

  function renderFilesTable(entries) {
    els.filesTableBody.innerHTML = '';

    if (!entries || entries.length === 0) {
      els.filesTableBody.innerHTML = `
        <tr>
          <td colspan="4" class="table-empty">
            ${window.i18n.t('noFilesFound')}
          </td>
        </tr>
      `;
      return;
    }

    const fragment = document.createDocumentFragment();

    entries.forEach((entry, idx) => {
      const tr = document.createElement('tr');
      const ext = entry.name.split('.').pop().toLowerCase();
      const badge = getFileTypeBadge(ext);
      const folderHtml = entry.folder ? `<span class="file-dir-prefix">${escapeHtml(entry.folder)}/</span>` : '';

      tr.innerHTML = `
        <td>
          <div class="file-cell-path">
            <span class="file-badge ${badge.class}">${badge.label}</span>
            <div class="file-path-text">
              ${folderHtml}<span class="file-basename">${escapeHtml(entry.name)}</span>
            </div>
          </div>
        </td>
        <td class="file-size-cell">${entry.formattedSize}</td>
        <td class="file-size-cell">${entry.segments.length}</td>
        <td style="text-align: center;">
          <button type="button" class="btn btn-sm btn-secondary btn-download-single" data-index="${idx}" title="${window.i18n.t('btnDownloadSingle')}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            <span>${window.i18n.t('btnDownloadSingle')}</span>
          </button>
        </td>
      `;

      fragment.appendChild(tr);
    });

    els.filesTableBody.appendChild(fragment);

    // Attach individual download handlers
    els.filesTableBody.querySelectorAll('.btn-download-single').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const idx = parseInt(btn.getAttribute('data-index'), 10);
        const entry = entries[idx];
        if (!entry) return;

        try {
          btn.disabled = true;
          const blob = await RPA.RPAUnpacker.extractFile(currentArchiveFile, entry);
          downloadBlob(blob, entry.name);
        } catch (err) {
          console.error('File extraction error:', err);
          showToast(err.message, 'error');
        } finally {
          btn.disabled = false;
        }
      });
    });
  }

  function filterExtractedFiles() {
    if (!currentArchiveData) return;
    const q = els.inputSearchFiles.value.trim().toLowerCase();
    if (!q) {
      renderFilesTable(currentArchiveData.entries);
      return;
    }
    const filtered = currentArchiveData.entries.filter(e => e.path.toLowerCase().includes(q));
    renderFilesTable(filtered);
  }

  async function downloadAllAsZip() {
    if (!currentArchiveData || !currentArchiveFile) return;

    try {
      els.btnDownloadZip.disabled = true;

      const zipBlob = await RPA.RPAUnpacker.extractToZip(
        currentArchiveFile,
        currentArchiveData.entries,
        (percent, status) => {
          els.btnDownloadZipLabel.textContent = window.i18n.t('btnExtractingZip', { percent: Math.round(percent) });
        }
      );

      const baseName = (currentArchiveFile.name || 'archive').replace(/\.rpa$/i, '');
      downloadBlob(zipBlob, `${baseName}-extracted.zip`);

      showToast(window.i18n.t('toastZipReady'), 'success');
    } catch (err) {
      console.error('ZIP generation error:', err);
      showToast(err.message, 'error');
    } finally {
      els.btnDownloadZip.disabled = false;
      els.btnDownloadZipLabel.textContent = window.i18n.t('btnDownloadAllZip');
    }
  }

  function resetUnpackWorkspace() {
    currentArchiveFile = null;
    currentArchiveData = null;
    els.inputRpaFile.value = '';
    els.unpackUploadCard.style.display = 'block';
    els.unpackDropzone.style.display = 'block';
    els.unpackProgress.style.display = 'none';
    els.unpackResults.style.display = 'none';
    els.filesTableBody.innerHTML = '';
  }

  // --- Load Demo Archive Feature ---
  async function loadDemoArchive() {
    showToast('Generating demo Ren\'Py archive on the fly...', 'info');

    try {
      const demoFiles = [
        {
          path: 'script.rpy',
          file: new Blob([
            `# Ren'Py Sample Script\n`,
            `define e = Character("Eileen")\n\n`,
            `label start:\n`,
            `    scene bg club\n`,
            `    e "Welcome to Ren'Py RPA Studio!"\n`,
            `    e "This archive was packed and unpacked 100% in your browser."\n`,
            `    return\n`
          ], { type: 'text/plain' })
        },
        {
          path: 'options.rpy',
          file: new Blob([
            `define config.name = _("Ren'Py RPA Studio Demo")\n`,
            `define config.version = "1.0.0"\n`,
            `define build.archive("archive", "all")\n`
          ], { type: 'text/plain' })
        },
        {
          path: 'gui.rpy',
          file: new Blob([
            `init -1 python:\n`,
            `    gui.init(1920, 1080)\n`,
            `    gui.accent_color = '#6366f1'\n`
          ], { type: 'text/plain' })
        },
        {
          path: 'images/bg_club.png',
          file: new Blob([new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52])], { type: 'image/png' })
        },
        {
          path: 'audio/bgm_theme.ogg',
          file: new Blob([new Uint8Array([0x4f, 0x67, 0x67, 0x53, 0x00, 0x02, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00])], { type: 'audio/ogg' })
        },
        {
          path: 'tl/arabic/common.rpy',
          file: new Blob([
            `# Arabic Localization File\n`,
            `translate arabic strings:\n`,
            `    old "Start Game"\n`,
            `    new "ابدأ اللعبة"\n`,
            `    old "Load Game"\n`,
            `    new "تحميل اللعبة"\n`,
            `    old "Preferences"\n`,
            `    new "الإعدادات"\n`
          ], { type: 'text/plain;charset=utf-8' })
        }
      ];

      const packed = await RPA.RPAPacker.pack(demoFiles, { xorKeyHex: '5a3c9e12' });
      const demoFile = new File([packed.blob], 'demo_game_archive.rpa', { type: 'application/octet-stream' });

      await processRpaFile(demoFile);
      showToast(window.i18n.t('toastDemoLoaded'), 'success');
    } catch (err) {
      console.error('Demo generation failed:', err);
      showToast('Demo generation failed: ' + err.message, 'error');
    }
  }

  // =========================================================================
  // SECTION 2: PACK LOGIC
  // =========================================================================

  function updatePackXorKeyDisplay() {
    els.packXorKeyDisplay.textContent = '0x' + currentPackXorKey.hex;
  }

  function regeneratePackXorKey() {
    currentPackXorKey = RPA.utils.generateRandomXorKey();
    updatePackXorKeyDisplay();
    showToast(`New XOR key generated: 0x${currentPackXorKey.hex}`, 'info');
  }

  function addFilesToPackQueue(newItems) {
    // Avoid duplicates by path
    const existingPaths = new Set(queuedPackFiles.map(i => i.path));
    let addedCount = 0;

    for (const item of newItems) {
      const normalized = item.path.replace(/\\/g, '/').replace(/^\/+/, '');
      if (!existingPaths.has(normalized)) {
        queuedPackFiles.push({ path: normalized, file: item.file });
        existingPaths.add(normalized);
        addedCount++;
      }
    }

    renderQueuedFiles();

    if (addedCount > 0) {
      els.packSuccessCard.style.display = 'none';
    }
  }

  function renderQueuedFiles() {
    const totalCount = queuedPackFiles.length;
    const totalBytes = queuedPackFiles.reduce((acc, i) => acc + i.file.size, 0);

    els.queuedSummaryBadge.textContent = totalCount > 0
      ? window.i18n.t('queuedCount', { count: totalCount, size: RPA.utils.formatBytes(totalBytes) })
      : '(0 files)';

    els.btnClearQueue.style.display = totalCount > 0 ? 'inline-flex' : 'none';
    els.btnPackNow.disabled = totalCount === 0;

    if (totalCount === 0) {
      els.queuedFilesList.innerHTML = `
        <div id="queued-empty-placeholder" class="table-empty">
          ${window.i18n.t('emptyQueuePrompt')}
        </div>
      `;
      return;
    }

    els.queuedFilesList.innerHTML = '';
    const fragment = document.createDocumentFragment();

    queuedPackFiles.forEach((item, idx) => {
      const row = document.createElement('div');
      row.className = 'queued-item';
      const ext = item.path.split('.').pop().toLowerCase();
      const badge = getFileTypeBadge(ext);
      row.innerHTML = `
        <div class="queued-path-group">
          <span class="file-badge ${badge.class}">${badge.label}</span>
          <span class="queued-path" title="${escapeHtml(item.path)}">${escapeHtml(item.path)}</span>
        </div>
        <div class="queued-actions">
          <span style="color: var(--text-muted);">${RPA.utils.formatBytes(item.file.size)}</span>
          <button type="button" class="btn-remove-queued" data-index="${idx}" title="Remove">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      `;
      fragment.appendChild(row);
    });

    els.queuedFilesList.appendChild(fragment);

    // Attach remove handlers
    els.queuedFilesList.querySelectorAll('.btn-remove-queued').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(btn.getAttribute('data-index'), 10);
        queuedPackFiles.splice(idx, 1);
        renderQueuedFiles();
      });
    });
  }

  function clearPackQueue() {
    queuedPackFiles = [];
    renderQueuedFiles();
    els.packSuccessCard.style.display = 'none';
  }

  // Recursive Directory Traversal for HTML5 Drag & Drop
  async function traverseFileTree(item, currentPath = '') {
    return new Promise((resolve) => {
      if (item.isFile) {
        item.file((file) => {
          resolve([{ path: currentPath + file.name, file }]);
        });
      } else if (item.isDirectory) {
        const dirReader = item.createReader();
        const entries = [];

        const readEntries = () => {
          dirReader.readEntries(async (result) => {
            if (!result.length) {
              const allFiles = [];
              for (const entry of entries) {
                const subFiles = await traverseFileTree(entry, currentPath + item.name + '/');
                allFiles.push(...subFiles);
              }
              resolve(allFiles);
            } else {
              entries.push(...result);
              readEntries();
            }
          });
        };
        readEntries();
      } else {
        resolve([]);
      }
    });
  }

  async function handleDropOnPackZone(e) {
    e.preventDefault();
    els.packDropzone.classList.remove('drag-over');

    const items = e.dataTransfer.items;
    const files = e.dataTransfer.files;

    if (items && items.length > 0 && items[0].webkitGetAsEntry) {
      const allFiles = [];
      for (let i = 0; i < items.length; i++) {
        const entry = items[i].webkitGetAsEntry();
        if (entry) {
          const res = await traverseFileTree(entry);
          allFiles.push(...res);
        }
      }
      if (allFiles.length > 0) {
        addFilesToPackQueue(allFiles);
        return;
      }
    }

    // Fallback standard files
    if (files && files.length > 0) {
      const list = [];
      for (let i = 0; i < files.length; i++) {
        const f = files[i];
        list.push({ path: f.webkitRelativePath || f.name, file: f });
      }
      addFilesToPackQueue(list);
    }
  }

  async function startPacking() {
    if (queuedPackFiles.length === 0) {
      showToast(window.i18n.t('errNoFilesToPack'), 'error');
      return;
    }

    let outName = (els.inputArchiveFilename.value || 'archive.rpa').trim();
    if (!outName.toLowerCase().endsWith('.rpa')) {
      outName += '.rpa';
    }

    els.btnPackNow.disabled = true;
    els.packProgress.style.display = 'block';
    els.packSuccessCard.style.display = 'none';

    try {
      const result = await RPA.RPAPacker.pack(
        queuedPackFiles,
        { xorKeyHex: currentPackXorKey.hex },
        (percent, status) => {
          let statusText = '';
          switch (status) {
            case 'preparing_files':
              statusText = window.i18n.t('statusPreparingFiles');
              break;
            case 'processing_files':
              statusText = window.i18n.t('statusProcessingFiles');
              break;
            case 'serializing_pickle':
              statusText = window.i18n.t('statusSerializingPickle');
              break;
            case 'compressing_index':
              statusText = window.i18n.t('statusCompressingIndex');
              break;
            case 'assembling_archive':
              statusText = window.i18n.t('statusAssemblingArchive');
              break;
            case 'done':
              statusText = window.i18n.t('statusPackDone');
              break;
            default:
              statusText = status;
          }

          els.packStatusLabel.textContent = statusText;
          els.packPercent.textContent = `${percent}%`;
          els.packProgressFill.style.width = `${percent}%`;
        }
      );

      generatedPackBlob = result.blob;

      // Show success card
      els.resPackSize.textContent = result.formattedSize;
      els.resPackCount.textContent = result.fileCount.toLocaleString();
      els.resPackKey.textContent = result.xorKeyHex;

      els.packSuccessCard.style.display = 'block';
      showToast(window.i18n.t('toastPackSuccess'), 'success');

      // Setup download button
      els.btnDownloadRpa.onclick = () => {
        downloadBlob(generatedPackBlob, outName);
      };
    } catch (err) {
      console.error('Packing failed:', err);
      showToast(window.i18n.t('errGeneric') + err.message, 'error');
    } finally {
      els.btnPackNow.disabled = false;
      setTimeout(() => {
        els.packProgress.style.display = 'none';
      }, 1000);
    }
  }

  // =========================================================================
  // SECTION 5: FOOTER, CRYPTO & HELPERS
  // =========================================================================

  function openSupportModal() {
    if (!els.supportModalBackdrop) return;
    els.supportModalBackdrop.style.display = 'flex';
    requestAnimationFrame(() => {
      els.supportModalBackdrop.classList.add('active');
    });
    els.supportModalBackdrop.setAttribute('aria-hidden', 'false');
  }

  function closeSupportModal() {
    if (!els.supportModalBackdrop) return;
    els.supportModalBackdrop.classList.remove('active');
    setTimeout(() => {
      els.supportModalBackdrop.style.display = 'none';
      els.supportModalBackdrop.setAttribute('aria-hidden', 'true');
    }, 220);
  }

  function copyCryptoAddress() {
    const address = els.modalCryptoAddress ? els.modalCryptoAddress.textContent.trim() : '0x6D6637cbea1618AeBc626Bb3eBFa623fD55639C1';

    const onSuccess = () => {
      if (els.modalIconCopyNormal) els.modalIconCopyNormal.style.display = 'none';
      if (els.modalIconCopyChecked) els.modalIconCopyChecked.style.display = 'block';
      if (els.modalLabelCopyCrypto) els.modalLabelCopyCrypto.textContent = window.i18n.t('btnCopied');

      showToast(window.i18n.t('toastSuccessCopied'), 'success');

      setTimeout(() => {
        if (els.modalIconCopyNormal) els.modalIconCopyNormal.style.display = 'block';
        if (els.modalIconCopyChecked) els.modalIconCopyChecked.style.display = 'none';
        if (els.modalLabelCopyCrypto) els.modalLabelCopyCrypto.textContent = window.i18n.t('btnCopyAddress');
      }, 2000);
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(address).then(onSuccess).catch(() => {
        fallbackCopy(address, onSuccess);
      });
    } else {
      fallbackCopy(address, onSuccess);
    }
  }

  function fallbackCopy(text, cb) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      cb();
    } catch (e) {
      showToast(window.i18n.t('toastCopyFailed'), 'error');
    }
    document.body.removeChild(textarea);
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 150);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, (m) => {
      switch (m) {
        case '&': return '&amp;';
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '"': return '&quot;';
        case "'": return '&#39;';
        default: return m;
      }
    });
  }

  // =========================================================================
  // EVENT LISTENERS INITIALIZATION
  // =========================================================================

  function initEventListeners() {
    // Theme & Lang
    els.btnToggleTheme.addEventListener('click', toggleTheme);
    els.btnToggleLang.addEventListener('click', () => {
      // Trigger smooth 360° spin + subtle scale pulse on globe icon
      if (els.iconLangGlobe) {
        els.iconLangGlobe.classList.remove('spin-pulse');
        void els.iconLangGlobe.offsetWidth; // Force reflow to allow re-triggering
        els.iconLangGlobe.classList.add('spin-pulse');
      }

      // Quick smooth fade transition on the language label
      if (els.langIndicator) {
        els.langIndicator.classList.add('fading');
        setTimeout(() => {
          window.i18n.toggle();
          updateLanguageButton();
          els.langIndicator.classList.remove('fading');
        }, 150);
      } else {
        window.i18n.toggle();
        updateLanguageButton();
      }
    });

    window.addEventListener('languageChanged', () => {
      updateLanguageButton();
      if (currentArchiveData) {
        filterExtractedFiles();
      }
      renderQueuedFiles();
    });

    // Tab buttons
    els.tabUnpack.addEventListener('click', () => switchTab('unpack'));
    els.tabPack.addEventListener('click', () => switchTab('pack'));

    // Unpack Drag & Drop & Browse
    els.btnBrowseRpa.addEventListener('click', () => els.inputRpaFile.click());
    els.btnLoadDemo.addEventListener('click', loadDemoArchive);
    els.inputRpaFile.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        processRpaFile(e.target.files[0]);
      }
    });

    els.unpackDropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      els.unpackDropzone.classList.add('drag-over');
    });

    els.unpackDropzone.addEventListener('dragleave', (e) => {
      e.preventDefault();
      els.unpackDropzone.classList.remove('drag-over');
    });

    els.unpackDropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      els.unpackDropzone.classList.remove('drag-over');
      if (e.dataTransfer.files.length > 0) {
        processRpaFile(e.dataTransfer.files[0]);
      }
    });

    // Unpack Actions
    els.inputSearchFiles.addEventListener('input', filterExtractedFiles);
    els.btnDownloadZip.addEventListener('click', downloadAllAsZip);
    els.btnResetUnpack.addEventListener('click', resetUnpackWorkspace);

    // Pack Drag & Drop & Browse
    els.btnBrowsePackFiles.addEventListener('click', () => els.inputPackFiles.click());
    els.btnBrowsePackFolder.addEventListener('click', () => els.inputPackFolder.click());

    els.inputPackFiles.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        const list = Array.from(e.target.files).map(f => ({ path: f.name, file: f }));
        addFilesToPackQueue(list);
        e.target.value = '';
      }
    });

    els.inputPackFolder.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        const list = Array.from(e.target.files).map(f => ({
          path: f.webkitRelativePath || f.name,
          file: f
        }));
        addFilesToPackQueue(list);
        e.target.value = '';
      }
    });

    els.packDropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      els.packDropzone.classList.add('drag-over');
    });

    els.packDropzone.addEventListener('dragleave', (e) => {
      e.preventDefault();
      els.packDropzone.classList.remove('drag-over');
    });

    els.packDropzone.addEventListener('drop', handleDropOnPackZone);

    // Pack Actions
    els.btnRegenXorKey.addEventListener('click', regeneratePackXorKey);
    els.btnClearQueue.addEventListener('click', clearPackQueue);
    els.btnPackNow.addEventListener('click', startPacking);
    els.btnPackReset.addEventListener('click', () => {
      clearPackQueue();
      els.packSuccessCard.style.display = 'none';
    });

    // Crypto Support Modal Actions
    if (els.btnOpenSupportModal) els.btnOpenSupportModal.addEventListener('click', openSupportModal);
    if (els.btnCloseSupportModal) els.btnCloseSupportModal.addEventListener('click', closeSupportModal);
    if (els.supportModalBackdrop) {
      els.supportModalBackdrop.addEventListener('click', (e) => {
        if (e.target === els.supportModalBackdrop) closeSupportModal();
      });
    }
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && els.supportModalBackdrop && els.supportModalBackdrop.classList.contains('active')) {
        closeSupportModal();
      }
    });
    if (els.btnModalCopyCrypto) els.btnModalCopyCrypto.addEventListener('click', copyCryptoAddress);
  }

  // =========================================================================
  // INTERACTIVE MOUSE TRACKING & SPOTLIGHT (DESKTOP)
  // =========================================================================
  function initInteractiveMouse() {
    // Only enable on desktop pointer devices
    const isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!isFinePointer) return;

    const aura = document.getElementById('cursor-aura');
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let auraX = mouseX;
    let auraY = mouseY;
    let hasMoved = false;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (!hasMoved && aura) {
        hasMoved = true;
        aura.classList.add('active');
        auraX = mouseX;
        auraY = mouseY;
      }

      // Dynamic Liquid Glass Spotlight on cards, dropzones, and modal
      const targetCard = e.target.closest('.card, .dropzone, .modal-dialog');
      if (targetCard) {
        const rect = targetCard.getBoundingClientRect();
        targetCard.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
        targetCard.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
      }
    }, { passive: true });

    document.addEventListener('mouseleave', () => {
      if (aura) {
        aura.classList.remove('active');
      }
      hasMoved = false;
    });

    if (aura) {
      function renderAura() {
        if (hasMoved) {
          auraX += (mouseX - auraX) * 0.15;
          auraY += (mouseY - auraY) * 0.15;
          aura.style.transform = `translate3d(${auraX}px, ${auraY}px, 0)`;
        }
        requestAnimationFrame(renderAura);
      }
      requestAnimationFrame(renderAura);
    }
  }

  // --- App Startup ---
  function init() {
    applyTheme(currentTheme);
    window.i18n.applyToDOM();
    updateLanguageButton();
    updatePackXorKeyDisplay();
    initEventListeners();
    initInteractiveMouse();
  }

  document.addEventListener('DOMContentLoaded', init);

})();
