/**
 * MediScan AI — Internationalization (i18n)
 * Supports: English (en), Hindi (hi), Kannada (kn), Telugu (te)
 *
 * Usage: add data-i18n="key" to any HTML element.
 * The element's textContent will be replaced with the translation.
 */

(function () {
    'use strict';

    const translations = {
        en: {
            // Nav
            nav_dashboard:  'Dashboard',
            nav_new_scan:   'New Scan',
            nav_compare:    'Compare',
            nav_privacy:    'Privacy Policy',
            nav_signout:    'Sign Out',
            // Dashboard
            dash_title:     'Dashboard',
            dash_subtitle:  'Your forensic analysis history',
            dash_total:     'Total Scans',
            dash_flagged:   'Flagged',
            dash_clean:     'Clean',
            dash_avg:       'Avg Risk Score',
            dash_new_scan:  'New Scan',
            dash_compare:   'Compare Documents',
            dash_search:    'Search scans…',
            dash_all:       'All',
            dash_clean_f:   'Clean',
            dash_susp:      'Suspicious',
            dash_high:      'High Risk',
            dash_no_scans:  'No scans yet. Upload your first document.',
            // Scan
            scan_title:     'New Forensic Scan',
            scan_subtitle:  'Upload a medical document to analyse',
            scan_upload:    'Upload Document',
            scan_analyse:   'Analyse Document',
            // Result
            result_title:   'Analysis Result',
            result_verdict: 'Verdict',
            result_score:   'Forgery Risk Score',
            result_download:'Download Report',
            result_ai_sum:  'AI Medical Summary',
            result_chat:    'Ask AI Assistant',
            // Compare
            cmp_title:      'Compare Documents',
            cmp_subtitle:   'Upload two documents to compare their authenticity',
            cmp_doc_a:      'Document A',
            cmp_doc_b:      'Document B',
            cmp_compare:    'Compare Now',
            cmp_similarity: 'Similarity Insight',
            // Misc
            loading:        'Analysing…',
            footer_copy:    'MediScan AI © 2025 — CREOVATORS OF SVCE',
        },

        hi: {
            nav_dashboard:  'डैशबोर्ड',
            nav_new_scan:   'नई स्कैन',
            nav_compare:    'तुलना करें',
            nav_privacy:    'गोपनीयता नीति',
            nav_signout:    'साइन आउट',
            dash_title:     'डैशबोर्ड',
            dash_subtitle:  'आपका फोरेंसिक विश्लेषण इतिहास',
            dash_total:     'कुल स्कैन',
            dash_flagged:   'संदिग्ध',
            dash_clean:     'साफ़',
            dash_avg:       'औसत जोखिम स्कोर',
            dash_new_scan:  'नई स्कैन',
            dash_compare:   'दस्तावेज़ तुलना',
            dash_search:    'स्कैन खोजें…',
            dash_all:       'सभी',
            dash_clean_f:   'साफ़',
            dash_susp:      'संदिग्ध',
            dash_high:      'उच्च जोखिम',
            dash_no_scans:  'अभी कोई स्कैन नहीं। अपना पहला दस्तावेज़ अपलोड करें।',
            scan_title:     'नई फोरेंसिक स्कैन',
            scan_subtitle:  'विश्लेषण के लिए चिकित्सा दस्तावेज़ अपलोड करें',
            scan_upload:    'दस्तावेज़ अपलोड करें',
            scan_analyse:   'दस्तावेज़ विश्लेषण करें',
            result_title:   'विश्लेषण परिणाम',
            result_verdict: 'निर्णय',
            result_score:   'जालसाजी जोखिम स्कोर',
            result_download:'रिपोर्ट डाउनलोड करें',
            result_ai_sum:  'AI चिकित्सा सारांश',
            result_chat:    'AI सहायक से पूछें',
            cmp_title:      'दस्तावेज़ तुलना',
            cmp_subtitle:   'दो दस्तावेज़ अपलोड करके उनकी प्रामाणिकता की तुलना करें',
            cmp_doc_a:      'दस्तावेज़ A',
            cmp_doc_b:      'दस्तावेज़ B',
            cmp_compare:    'अभी तुलना करें',
            cmp_similarity: 'समानता विश्लेषण',
            loading:        'विश्लेषण हो रहा है…',
            footer_copy:    'MediScan AI © 2025 — CREOVATORS OF SVCE',
        },

        kn: {
            nav_dashboard:  'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
            nav_new_scan:   'ಹೊಸ ಸ್ಕ್ಯಾನ್',
            nav_compare:    'ಹೋಲಿಸಿ',
            nav_privacy:    'ಗೌಪ್ಯತಾ ನೀತಿ',
            nav_signout:    'ಸೈನ್ ಔಟ್',
            dash_title:     'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
            dash_subtitle:  'ನಿಮ್ಮ ಫೋರೆನ್ಸಿಕ್ ವಿಶ್ಲೇಷಣೆ ಇತಿಹಾಸ',
            dash_total:     'ಒಟ್ಟು ಸ್ಕ್ಯಾನ್',
            dash_flagged:   'ಶಂಕಿತ',
            dash_clean:     'ಸ್ವಚ್ಛ',
            dash_avg:       'ಸರಾಸರಿ ಅಪಾಯ ಸ್ಕೋರ್',
            dash_new_scan:  'ಹೊಸ ಸ್ಕ್ಯಾನ್',
            dash_compare:   'ದಾಖಲೆ ಹೋಲಿಕೆ',
            dash_search:    'ಸ್ಕ್ಯಾನ್ ಹುಡುಕಿ…',
            dash_all:       'ಎಲ್ಲಾ',
            dash_clean_f:   'ಸ್ವಚ್ಛ',
            dash_susp:      'ಶಂಕಿತ',
            dash_high:      'ಹೆಚ್ಚಿನ ಅಪಾಯ',
            dash_no_scans:  'ಇನ್ನೂ ಸ್ಕ್ಯಾನ್ ಇಲ್ಲ. ನಿಮ್ಮ ಮೊದಲ ದಾಖಲೆ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ.',
            scan_title:     'ಹೊಸ ಫೋರೆನ್ಸಿಕ್ ಸ್ಕ್ಯಾನ್',
            scan_subtitle:  'ವಿಶ್ಲೇಷಣೆಗಾಗಿ ವೈದ್ಯಕೀಯ ದಾಖಲೆ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ',
            scan_upload:    'ದಾಖಲೆ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ',
            scan_analyse:   'ದಾಖಲೆ ವಿಶ್ಲೇಷಿಸಿ',
            result_title:   'ವಿಶ್ಲೇಷಣೆ ಫಲಿತಾಂಶ',
            result_verdict: 'ತೀರ್ಪು',
            result_score:   'ಜಾಲಿಯ ಅಪಾಯ ಸ್ಕೋರ್',
            result_download:'ವರದಿ ಡೌನ್‌ಲೋಡ್',
            result_ai_sum:  'AI ವೈದ್ಯಕೀಯ ಸಾರಾಂಶ',
            result_chat:    'AI ಸಹಾಯಕನನ್ನು ಕೇಳಿ',
            cmp_title:      'ದಾಖಲೆ ಹೋಲಿಕೆ',
            cmp_subtitle:   'ಎರಡು ದಾಖಲೆಗಳನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ ಮತ್ತು ಹೋಲಿಸಿ',
            cmp_doc_a:      'ದಾಖಲೆ A',
            cmp_doc_b:      'ದಾಖಲೆ B',
            cmp_compare:    'ಈಗ ಹೋಲಿಸಿ',
            cmp_similarity: 'ಸಾಮ್ಯ ವಿಶ್ಲೇಷಣೆ',
            loading:        'ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ…',
            footer_copy:    'MediScan AI © 2025 — CREOVATORS OF SVCE',
        },

        te: {
            nav_dashboard:  'డాష్‌బోర్డ్',
            nav_new_scan:   'కొత్త స్కాన్',
            nav_compare:    'పోల్చండి',
            nav_privacy:    'గోప్యతా విధానం',
            nav_signout:    'సైన్ అవుట్',
            dash_title:     'డాష్‌బోర్డ్',
            dash_subtitle:  'మీ ఫోరెన్సిక్ విశ్లేషణ చరిత్ర',
            dash_total:     'మొత్తం స్కాన్లు',
            dash_flagged:   'సందేహాస్పద',
            dash_clean:     'శుభ్రంగా',
            dash_avg:       'సగటు రిస్క్ స్కోర్',
            dash_new_scan:  'కొత్త స్కాన్',
            dash_compare:   'పత్రాలు పోల్చండి',
            dash_search:    'స్కాన్లు వెతకండి…',
            dash_all:       'అన్నీ',
            dash_clean_f:   'శుభ్రంగా',
            dash_susp:      'సందేహాస్పద',
            dash_high:      'అధిక రిస్క్',
            dash_no_scans:  'ఇంకా స్కాన్లు లేవు. మీ మొదటి పత్రాన్ని అప్‌లోడ్ చేయండి.',
            scan_title:     'కొత్త ఫోరెన్సిక్ స్కాన్',
            scan_subtitle:  'విశ్లేషణ కోసం వైద్య పత్రాన్ని అప్‌లోడ్ చేయండి',
            scan_upload:    'పత్రం అప్‌లోడ్ చేయండి',
            scan_analyse:   'పత్రాన్ని విశ్లేషించండి',
            result_title:   'విశ్లేషణ ఫలితం',
            result_verdict: 'తీర్పు',
            result_score:   'జాలి రిస్క్ స్కోర్',
            result_download:'నివేదిక డౌన్‌లోడ్',
            result_ai_sum:  'AI వైద్య సారాంశం',
            result_chat:    'AI సహాయకుడిని అడగండి',
            cmp_title:      'పత్రాలు పోల్చండి',
            cmp_subtitle:   'రెండు పత్రాలు అప్‌లోడ్ చేసి వాటి ప్రామాణికతను పోల్చండి',
            cmp_doc_a:      'పత్రం A',
            cmp_doc_b:      'పత్రం B',
            cmp_compare:    'ఇప్పుడు పోల్చండి',
            cmp_similarity: 'సారూప్య విశ్లేషణ',
            loading:        'విశ్లేషిస్తున్నాం…',
            footer_copy:    'MediScan AI © 2025 — CREOVATORS OF SVCE',
        },
    };

    // ── Apply translations ─────────────────────────────────────────────────────
    function applyLang(lang) {
        const dict = translations[lang] || translations.en;
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.dataset.i18n;
            if (dict[key]) el.textContent = dict[key];
        });
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.dataset.i18nPlaceholder;
            if (dict[key]) el.placeholder = dict[key];
        });
        // Update lang switcher button label
        const langLabels = { en: '🌐 EN', hi: '🌐 हि', kn: '🌐 ಕ', te: '🌐 తె' };
        const btn = document.getElementById('langSwitcherBtn');
        if (btn) btn.textContent = langLabels[lang] || '🌐 EN';
        // Persist
        localStorage.setItem('ms_lang', lang);
        document.documentElement.lang = lang;
    }

    window.setLang = function (lang) {
        applyLang(lang);
        // Close dropdown
        const dd = document.getElementById('langDropdown');
        if (dd) dd.classList.remove('open');
    };

    // ── Language switcher dropdown toggle ─────────────────────────────────────
    document.addEventListener('DOMContentLoaded', function () {
        const btn = document.getElementById('langSwitcherBtn');
        const dd  = document.getElementById('langDropdown');
        if (btn && dd) {
            btn.addEventListener('click', e => {
                e.stopPropagation();
                dd.classList.toggle('open');
            });
            document.addEventListener('click', () => dd.classList.remove('open'));
        }
        // Apply saved or browser language
        const saved  = localStorage.getItem('ms_lang');
        const browser = (navigator.language || '').slice(0, 2);
        const lang   = saved || (['hi','kn','te'].includes(browser) ? browser : 'en');
        applyLang(lang);
    });
}());
