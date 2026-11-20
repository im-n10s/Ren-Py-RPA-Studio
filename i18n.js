/**
 * Internationalization (i18n) Engine
 * Arabic & English Bilingual Dictionaries
 */

(function (global) {
  'use strict';

  const translations = {
    en: {
      appName: "Ren'Py RPA Studio",
      appTagline: "100% Client-Side Ren'Py Archive Unpacker & Packer",
      clientBadge: "100% Local / Zero Server",
      themeDark: "Dark Mode",
      themeLight: "Light Mode",
      langSwitch: "العربية",

      // Tabs
      tabUnpack: "Unpack RPA",
      tabPack: "Pack to RPA",

      // Tab 1: Unpack
      unpackTitle: "Extract Ren'Py Archive (.rpa)",
      unpackSubtitle: "Pack and extract Ren'Py (.rpa) archives directly in your browser — no external tools or downloads required.",
      dropzoneUnpackTitle: "Drop your .rpa file here",
      dropzoneUnpackSubtitle: "or click to select from your device",
      btnSelectRpa: "Browse .rpa File",
      btnLoadDemo: "Load Demo Archive",
      unpackSupportedBadge: "Supports RPA-3.0 & RPA-2.0 • Python Pickle Protocols 0-5",
      
      // Unpack Status
      statusReadingHeader: "Reading archive header...",
      statusDecompressingIndex: "Decompressing index via zlib...",
      statusParsingPickle: "Decoding Python Pickle binary stream...",
      statusDeobfuscating: "Deobfuscating file offsets & lengths...",
      statusReady: "Archive parsed successfully!",
      
      // Metadata Card
      metaTitle: "Archive Information",
      metaName: "File Name",
      metaVersion: "RPA Format",
      metaOffset: "Index Offset",
      metaXorKey: "XOR Key",
      metaTotalFiles: "Total Files",
      metaTotalSize: "Extracted Size",
      metaArchiveSize: "Packed Size",
      
      // Extracted Files Table
      extractedTitle: "Extracted Files",
      searchPlaceholder: "Search files or folders...",
      showingFiles: "Showing {count} of {total} files",
      btnDownloadAllZip: "Download All as .zip",
      btnExtractingZip: "Packaging .zip ({percent}%)...",
      btnDownloadSingle: "Download",
      btnResetUnpack: "Open Another Archive",
      tableHeaderPath: "File Path",
      tableHeaderSize: "Size",
      tableHeaderSegments: "Segments",
      tableHeaderActions: "Action",
      noFilesFound: "No files match your search filter.",

      // Tab 2: Pack
      packTitle: "Create Ren'Py Archive (.rpa)",
      packSubtitle: "Bundle game scripts, assets, images, and audio into an authentic Ren'Py RPA-3.0 archive with Python Pickle Protocol 2 compatibility.",
      dropzonePackTitle: "Drop files or a folder here",
      dropzonePackSubtitle: "Relative directory paths will be automatically preserved",
      btnSelectFiles: "Select Files",
      btnSelectFolder: "Select Entire Folder",
      
      // Pack Config Card
      packConfigTitle: "Archive Settings",
      labelArchiveName: "Output Archive Filename",
      placeholderArchiveName: "archive.rpa",
      labelTargetFormat: "Target Format",
      badgeTargetFormat: "RPA-3.0 (Pickle Protocol 2)",
      labelXorKey: "XOR Obfuscation Key",
      badgeAutoKey: "Auto-generated 32-bit random key",
      btnRegenKey: "Regenerate Key",
      
      // Queued Files
      queuedTitle: "Queued Files",
      queuedCount: "{count} files queued ({size})",
      btnClearQueue: "Clear All",
      searchQueuedPlaceholder: "Filter queued files...",
      emptyQueuePrompt: "No files queued yet. Drop files or select a folder above.",
      
      // Pack Actions & Status
      btnPackNow: "Pack to .rpa Archive",
      statusPreparingFiles: "Preparing files...",
      statusProcessingFiles: "Processing files and calculating offsets...",
      statusSerializingPickle: "Serializing index with Python Pickle Protocol 2...",
      statusCompressingIndex: "Compressing index via zlib...",
      statusAssemblingArchive: "Assembling final RPA-3.0 binary...",
      statusPackDone: "Archive generated successfully!",
      
      // Pack Result Card
      packSuccessTitle: "Archive Created Successfully!",
      packSuccessSubtitle: "Your RPA-3.0 file is ready for Ren'Py games and engines.",
      resultArchiveSize: "Final Archive Size",
      resultFileCount: "Files Packaged",
      resultXorKey: "XOR Key Used",
      btnDownloadRpa: "Download .rpa File",
      btnPackAnother: "Create Another Archive",

      // Crypto Donation Section & Modal
      btnSupport: "Support",
      cryptoTitle: "Support via Crypto",
      cryptoSubtitle: "If this tool helped your visual novel modding, development, or localization, consider supporting!",
      cryptoMessage: "Thank you so much for your support! Your contribution helps keep this tool free, fast, and continuously improved.",
      cryptoNetwork: "BNB Smart Chain (BEP-20)",
      btnCopyAddress: "Copy Address",
      btnCopied: "Copied!",
      modalClose: "Close",

      // Credits & Socials
      creditsAuthor: "Made with ❤️ by n10s_exe",
      socialTwitter: "X (Twitter)",
      socialGithub: "GitHub",

      // Errors & Toasts
      toastSuccessCopied: "Wallet address copied to clipboard!",
      toastCopyFailed: "Failed to copy address automatically.",
      toastPackSuccess: "Archive successfully packed and ready!",
      toastUnpackSuccess: "Archive parsed with {count} files!",
      toastZipReady: "ZIP download initialized!",
      toastDemoLoaded: "Demo archive loaded successfully!",
      errNoFilesToPack: "Please add at least one file to pack.",
      errUnsupportedHeader: "Unsupported archive format: only RPA-3.0 and RPA-2.0 are supported.",
      errCorruptedHeader30: "Corrupted RPA-3.0 header: missing offset or XOR key.",
      errCorruptedHeader20: "Corrupted RPA-2.0 header: missing index offset.",
      errInvalidIndexOffset: "Invalid index offset: offset exceeds archive file size.",
      errZlibInflateFailed: "Decompression error: corrupted zlib stream in index.",
      errPickleParseFailed: "Pickle error: unable to decode Python binary pickle data.",
      errInvalidIndexStructure: "Invalid archive index structure.",
      errPakoNotLoaded: "Zlib library (pako) could not be loaded.",
      errJsZipNotLoaded: "ZIP library (JSZip) could not be loaded.",
      errGeneric: "An unexpected error occurred: "
    },
    ar: {
      appName: "استوديو رينباي RPA",
      appTagline: "أداة متكاملة لفك وضغط أرشيفات Ren'Py من المتصفح 100% دون خوادم",
      clientBadge: "محلي 100% • خالي تماماً من الخوادم",
      themeDark: "الوضع الليلي",
      themeLight: "الوضع النهاري",
      langSwitch: "English",

      // Tabs
      tabUnpack: "فك ضغط ملف RPA",
      tabPack: "ضغط ملفات إلى RPA",

      // Tab 1: Unpack
      unpackTitle: "فك ضغط أرشيف رينباي (.rpa)",
      unpackSubtitle: "أداة متكاملة لضغط واستخراج ملفات RPA مباشرة من متصفحك، دون الحاجة لأي أدوات أو تحميل خارجي.",
      dropzoneUnpackTitle: "اسحب وأفلت ملف .rpa هنا",
      dropzoneUnpackSubtitle: "أو انقر لاختيار الملف من جهازك",
      btnSelectRpa: "اختيار ملف .rpa",
      btnLoadDemo: "تحميل ملف تجريبي",
      unpackSupportedBadge: "يدعم RPA-3.0 و RPA-2.0 • يدعم بروتوكولات بيكل بايثون 0 إلى 5",
      
      // Unpack Status
      statusReadingHeader: "جاري قراءة ترويسة الأرشيف...",
      statusDecompressingIndex: "جاري فك ضغط الفهرس بواسطة zlib...",
      statusParsingPickle: "جاري تحليل بنية بايثون بيكل الثنائية...",
      statusDeobfuscating: "جاري فك تشفير إزاحات وأطوال الملفات (XOR)...",
      statusReady: "تم فك وتحليل الأرشيف بنجاح!",
      
      // Metadata Card
      metaTitle: "بيانات ومعلومات الأرشيف",
      metaName: "اسم الملف",
      metaVersion: "صيغة RPA",
      metaOffset: "إزاحة الفهرس",
      metaXorKey: "مفتاح XOR",
      metaTotalFiles: "إجمالي الملفات",
      metaTotalSize: "الحجم بعد الفك",
      metaArchiveSize: "حجم الأرشيف",
      
      // Extracted Files Table
      extractedTitle: "الملفات المستخرجة",
      searchPlaceholder: "البحث في الملفات أو المجلدات...",
      showingFiles: "عرض {count} من أصل {total} ملف",
      btnDownloadAllZip: "تحميل الكل كملف مضغوط .zip",
      btnExtractingZip: "جاري تجهيز ملف .zip ({percent}%)...",
      btnDownloadSingle: "تحميل",
      btnResetUnpack: "فتح أرشيف آخر",
      tableHeaderPath: "مسار الملف",
      tableHeaderSize: "الحجم",
      tableHeaderSegments: "الأجزاء",
      tableHeaderActions: "الإجراء",
      noFilesFound: "لا توجد ملفات تطابق معايير البحث.",

      // Tab 2: Pack
      packTitle: "إنشاء أرشيف رينباي (.rpa)",
      packSubtitle: "حزم نصوص اللعبة، والصور، والمؤثرات الصوتية والخطوط في أرشيف RPA-3.0 قياسي متوافق 100% مع محرك Ren'Py وبروتوكول بيكل 2.",
      dropzonePackTitle: "اسحب وأفلت الملفات أو مجلداً هنا",
      dropzonePackSubtitle: "سيتم الحفاظ على مسارات المجلدات الفرعية تلقائياً",
      btnSelectFiles: "اختيار ملفات",
      btnSelectFolder: "اختيار مجلد كامل",
      
      // Pack Config Card
      packConfigTitle: "إعدادات الأرشيف الناتج",
      labelArchiveName: "اسم الأرشيف الناتج",
      placeholderArchiveName: "archive.rpa",
      labelTargetFormat: "الصيغة المستهدفة",
      badgeTargetFormat: "RPA-3.0 (بيكل بروتوكول 2)",
      labelXorKey: "مفتاح تشفير XOR",
      badgeAutoKey: "مفتاح عشوائي 32-بت يتم توليده تلقائياً",
      btnRegenKey: "توليد مفتاح جديد",
      
      // Queued Files
      queuedTitle: "الملفات المحددة للضغط",
      queuedCount: "{count} ملف محدد ({size})",
      btnClearQueue: "مسح الكل",
      searchQueuedPlaceholder: "تصفية الملفات المحددة...",
      emptyQueuePrompt: "لا توجد ملفات بعد. اسحب وأفلت ملفات أو اختر مجلداً أعلاه.",
      
      // Pack Actions & Status
      btnPackNow: "ضغط وحزم أرشيف .rpa",
      statusPreparingFiles: "جاري تجهيز الملفات...",
      statusProcessingFiles: "جاري قراءة الملفات وحساب الإزاحات والأطوال...",
      statusSerializingPickle: "جاري ترميز الفهرس ببروتوكول بيكل 2...",
      statusCompressingIndex: "جاري ضغط الفهرس بـ zlib...",
      statusAssemblingArchive: "جاري تجميع ملف RPA-3.0 النهائي...",
      statusPackDone: "تم إنشاء الأرشيف بنجاح!",
      
      // Pack Result Card
      packSuccessTitle: "تم إنشاء الأرشيف بنجاح!",
      packSuccessSubtitle: "ملف RPA-3.0 جاهز للاستخدام المباشر في ألعاب ومحرك Ren'Py.",
      resultArchiveSize: "حجم الأرشيف النهائي",
      resultFileCount: "عدد الملفات المحزومة",
      resultXorKey: "مفتاح XOR المستخدم",
      btnDownloadRpa: "تحميل ملف .rpa",
      btnPackAnother: "ضغط حزمة أخرى",

      // Crypto Donation Section & Modal
      btnSupport: "دعم",
      cryptoTitle: "الدعم المادي عبر الكريبتو",
      cryptoSubtitle: "إذا ساعدتك هذه الأداة في تعديل أو تعريب أو تطوير الروايات المرئية، يمكنك دعم استمرار المشروع!",
      cryptoMessage: "شكراً جزيلاً لدعمك! مساهمتك تساعد في تطوير هذه الأداة وإبقائها مجانية ومفتوحة للجميع.",
      cryptoNetwork: "شبكة بينانس الذكية (BEP-20)",
      btnCopyAddress: "نسخ العنوان",
      btnCopied: "تم النسخ!",
      modalClose: "إغلاق",

      // Credits & Socials
      creditsAuthor: "Made with ❤️ by n10s_exe",
      socialTwitter: "إكس (تويتر)",
      socialGithub: "غيت هاب",

      // Errors & Toasts
      toastSuccessCopied: "تم نسخ عنوان المحفظة بنجاح!",
      toastCopyFailed: "تعذر نسخ العنوان تلقائياً.",
      toastPackSuccess: "تم ضغط الأرشيف وتجهيزه بنجاح!",
      toastUnpackSuccess: "تم فك الأرشيف بنجاح واكتشاف {count} ملف!",
      toastZipReady: "بدأ تحميل ملف ZIP المضغوط!",
      toastDemoLoaded: "تم تحميل الأرشيف التجريبي بنجاح!",
      errNoFilesToPack: "يرجى إضافة ملف واحد على الأقل للضغط.",
      errUnsupportedHeader: "صيغة غير مدعومة: يتم دعم RPA-3.0 و RPA-2.0 فقط.",
      errCorruptedHeader30: "ترويسة RPA-3.0 تالفة: إزاحة الفهرس أو مفتاح XOR مفقود.",
      errCorruptedHeader20: "ترويسة RPA-2.0 تالفة: إزاحة الفهرس مفقودة.",
      errInvalidIndexOffset: "إزاحة الفهرس غير صالحة: تتجاوز حجم الملف.",
      errZlibInflateFailed: "خطأ فك الضغط: تيار zlib للفهرس تالف.",
      errPickleParseFailed: "خطأ بيكل: تعذر فك تشفير بيانات بايثون بيكل.",
      errInvalidIndexStructure: "هيكل فهرس الأرشيف غير صالح.",
      errPakoNotLoaded: "تعذر تحميل مكتبة فك الضغط (pako).",
      errJsZipNotLoaded: "تعذر تحميل مكتبة الحزم (JSZip).",
      errGeneric: "حدث خطأ غير متوقع: "
    }
  };

  class I18nManager {
    constructor() {
      const savedLang = localStorage.getItem('rpa_studio_lang');
      this.currentLang = (savedLang === 'ar' || savedLang === 'en') ? savedLang : 'en';
    }

    get lang() {
      return this.currentLang;
    }

    setLang(lang) {
      if (lang !== 'ar' && lang !== 'en') return;
      this.currentLang = lang;
      localStorage.setItem('rpa_studio_lang', lang);
      this.applyToDOM();
    }

    toggle() {
      this.setLang(this.currentLang === 'en' ? 'ar' : 'en');
    }

    t(key, params = {}) {
      const dict = translations[this.currentLang] || translations.en;
      let text = dict[key] || translations.en[key] || key;
      for (const [k, v] of Object.entries(params)) {
        text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
      }
      return text;
    }

    applyToDOM() {
      const isAr = this.currentLang === 'ar';
      document.documentElement.lang = this.currentLang;
      document.documentElement.dir = isAr ? 'rtl' : 'ltr';

      if (isAr) {
        document.body.classList.add('lang-ar');
        document.body.classList.remove('lang-en');
      } else {
        document.body.classList.add('lang-en');
        document.body.classList.remove('lang-ar');
      }

      // Update elements with data-i18n
      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        el.textContent = this.t(key);
      });

      // Update placeholders with data-i18n-placeholder
      document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        el.setAttribute('placeholder', this.t(key));
      });

      // Update titles with data-i18n-title
      document.querySelectorAll('[data-i18n-title]').forEach(el => {
        const key = el.getAttribute('data-i18n-title');
        el.setAttribute('title', this.t(key));
      });

      // Dispatch custom event for dynamic components
      window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang: this.currentLang } }));
    }
  }

  global.i18n = new I18nManager();

})(typeof window !== 'undefined' ? window : this);
