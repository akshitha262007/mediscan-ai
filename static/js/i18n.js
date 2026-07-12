/**
 * MediScan AI — Complete i18n Module
 * Languages: English (en), Hindi (hi), Kannada (kn), Telugu (te)
 *
 * Usage: add  data-i18n="key"  to any HTML element.
 * Its textContent will be replaced with the translation for the active language.
 * For input placeholders, use  data-i18n-placeholder="key".
 */

(function () {
    'use strict';

    // ── Translation dictionary ─────────────────────────────────────────────────
    const T = {

        /* ════════════ ENGLISH ════════════ */
        en: {
            // Navigation
            nav_dashboard : 'Dashboard',
            nav_new_scan  : 'New Scan',
            nav_compare   : 'Compare',
            nav_privacy   : 'Privacy Policy',
            nav_signout   : 'Sign Out',
            nav_profile   : 'My Profile',

            // Dashboard stats & table
            dash_title          : 'Dashboard',
            dash_total          : 'Total Scans',
            dash_flagged        : 'Flagged',
            dash_clean_f        : 'Clean',
            dash_avg            : 'Avg Risk Score',
            dash_history        : 'Scan History',
            dash_col_file       : 'File Name',
            dash_col_date       : 'Date & Time',
            dash_col_type       : 'Type',
            dash_col_verdict    : 'Verdict',
            dash_col_score      : 'Risk Score',
            dash_col_actions    : 'Actions',
            dash_view           : 'View',
            dash_pdf            : 'PDF',
            dash_no_scans_title : 'No scans yet',
            dash_no_scans_sub   : 'Upload your first medical document to begin forensic analysis.',
            dash_first_scan     : 'Run First Scan',

            // Scan page
            scan_title      : 'New Forensic Scan',
            scan_subtitle   : 'Upload a medical report to begin real-time forensic analysis.',
            scan_drop_title : 'Drag & drop your file here',
            scan_drop_sub   : 'or click to browse',
            scan_max_size   : 'Max 16 MB',
            scan_analyse    : 'Run Forensic Analysis',
            scan_what       : 'What gets analysed',
            scan_ela_title  : 'Error Level Analysis',
            scan_ela_desc   : 'Detects pixel compression inconsistencies in JPEG images that indicate prior editing.',
            scan_meta_title : 'Metadata Inspection',
            scan_meta_desc  : 'Reads EXIF and PDF metadata — flags editing software, timestamp mismatches, and stripped fields.',
            scan_integ_title: 'File Integrity',
            scan_integ_desc : 'SHA-256 hash, magic byte validation, file structure and size plausibility checks.',
            scan_ocr_title  : 'OCR Consistency',
            scan_ocr_desc   : 'Extracts document text and checks for medical field patterns and formatting anomalies.',
            scan_note       : 'Uploaded files are processed securely and stored only for your account.',
            scan_uploading  : 'Uploading file…',
            scan_prep       : 'Preparing forensic engine',
            scan_step1      : 'Initialising forensic engine',
            scan_step2      : 'Running Error Level Analysis',
            scan_step3      : 'Extracting metadata',
            scan_step4      : 'Verifying file integrity',
            scan_step5      : 'Running OCR analysis',
            scan_step6      : 'Computing forgery score',

            // Auth
            auth_welcome      : 'Welcome back',
            auth_signin_sub   : 'Sign in to your MediScan account',
            auth_email        : 'Email address',
            auth_password     : 'Password',
            auth_remember     : 'Remember me',
            auth_signin       : 'Sign In',
            auth_no_account   : "Don't have an account?",
            auth_create       : 'Create one',
            auth_create_account: 'Create your account',
            auth_create_sub   : 'Free access to MediScan AI forensics',
            auth_username     : 'Username',
            auth_org          : 'Organisation',
            auth_optional     : '(optional)',
            auth_confirm_pw   : 'Confirm password',
            auth_register     : 'Create Account',
            auth_have_account : 'Already have an account?',
            auth_signin_link  : 'Sign in',

            // Compare
            cmp_title     : 'Compare Documents',
            cmp_subtitle  : 'Upload two documents to compare their authenticity side-by-side',
            cmp_doc_a     : 'Document A',
            cmp_doc_b     : 'Document B',
            cmp_compare   : 'Compare Now',
            cmp_similarity: 'Similarity Insight',

            // Result
            result_download : 'Download Report',
            result_ai_sum   : 'AI Medical Summary',
            result_findings : 'Forensic Findings',
            result_modules  : 'Module Scores',

            // Profile
            profile_title     : 'My Profile',
            profile_edit      : 'Edit Details',
            profile_username  : 'Username',
            profile_org       : 'Organization / Hospital',
            profile_change_pw : 'Change Password',
            profile_current_pw: 'Current Password',
            profile_new_pw    : 'New Password',
            profile_confirm_pw: 'Confirm New Password',
            profile_save      : 'Save Changes',
            profile_cancel    : 'Cancel',

            // Footer
            footer_copy: 'MediScan AI © 2025 — CREOVATORS OF SVCE',
        },

        /* ════════════ HINDI ════════════ */
        hi: {
            nav_dashboard : 'डैशबोर्ड',
            nav_new_scan  : 'नई स्कैन',
            nav_compare   : 'तुलना करें',
            nav_privacy   : 'गोपनीयता नीति',
            nav_signout   : 'साइन आउट',
            nav_profile   : 'मेरी प्रोफ़ाइल',

            dash_title          : 'डैशबोर्ड',
            dash_total          : 'कुल स्कैन',
            dash_flagged        : 'संदिग्ध',
            dash_clean_f        : 'साफ़',
            dash_avg            : 'औसत जोखिम स्कोर',
            dash_history        : 'स्कैन इतिहास',
            dash_col_file       : 'फ़ाइल नाम',
            dash_col_date       : 'दिनांक और समय',
            dash_col_type       : 'प्रकार',
            dash_col_verdict    : 'निर्णय',
            dash_col_score      : 'जोखिम स्कोर',
            dash_col_actions    : 'क्रियाएं',
            dash_view           : 'देखें',
            dash_pdf            : 'PDF',
            dash_no_scans_title : 'अभी कोई स्कैन नहीं',
            dash_no_scans_sub   : 'फोरेंसिक विश्लेषण शुरू करने के लिए अपना पहला दस्तावेज़ अपलोड करें।',
            dash_first_scan     : 'पहली स्कैन करें',

            scan_title      : 'नई फोरेंसिक स्कैन',
            scan_subtitle   : 'रीयल-टाइम फोरेंसिक विश्लेषण के लिए एक मेडिकल रिपोर्ट अपलोड करें।',
            scan_drop_title : 'यहां फ़ाइल खींचें और छोड़ें',
            scan_drop_sub   : 'या ब्राउज़ करने के लिए क्लिक करें',
            scan_max_size   : 'अधिकतम 16 MB',
            scan_analyse    : 'फोरेंसिक विश्लेषण चलाएं',
            scan_what       : 'क्या विश्लेषण किया जाता है',
            scan_ela_title  : 'त्रुटि स्तर विश्लेषण',
            scan_ela_desc   : 'JPEG छवियों में पिक्सेल संपीड़न विसंगतियों का पता लगाता है।',
            scan_meta_title : 'मेटाडेटा निरीक्षण',
            scan_meta_desc  : 'EXIF और PDF मेटाडेटा पढ़ता है — संपादन सॉफ़्टवेयर और टाइमस्टैम्प विसंगतियों को चिह्नित करता है।',
            scan_integ_title: 'फ़ाइल अखंडता',
            scan_integ_desc : 'SHA-256 हैश, मैजिक बाइट सत्यापन, और फ़ाइल संरचना जाँच।',
            scan_ocr_title  : 'OCR स्थिरता',
            scan_ocr_desc   : 'दस्तावेज़ पाठ निकालता है और चिकित्सा क्षेत्र के पैटर्न की जाँच करता है।',
            scan_note       : 'अपलोड की गई फ़ाइलें सुरक्षित रूप से संसाधित की जाती हैं।',
            scan_uploading  : 'फ़ाइल अपलोड हो रही है…',
            scan_prep       : 'फोरेंसिक इंजन तैयार हो रहा है',
            scan_step1      : 'फोरेंसिक इंजन प्रारम्भ',
            scan_step2      : 'त्रुटि स्तर विश्लेषण',
            scan_step3      : 'मेटाडेटा निकाल रहे हैं',
            scan_step4      : 'फ़ाइल अखंडता सत्यापन',
            scan_step5      : 'OCR विश्लेषण',
            scan_step6      : 'जालसाजी स्कोर की गणना',

            auth_welcome      : 'वापस स्वागत है',
            auth_signin_sub   : 'अपने MediScan खाते में साइन इन करें',
            auth_email        : 'ईमेल पता',
            auth_password     : 'पासवर्ड',
            auth_remember     : 'मुझे याद रखें',
            auth_signin       : 'साइन इन',
            auth_no_account   : 'खाता नहीं है?',
            auth_create       : 'बनाएं',
            auth_create_account: 'अपना खाता बनाएं',
            auth_create_sub   : 'MediScan AI फोरेंसिक तक मुफ्त पहुँच',
            auth_username     : 'उपयोगकर्ता नाम',
            auth_org          : 'संस्था',
            auth_optional     : '(वैकल्पिक)',
            auth_confirm_pw   : 'पासवर्ड की पुष्टि',
            auth_register     : 'खाता बनाएं',
            auth_have_account : 'पहले से खाता है?',
            auth_signin_link  : 'साइन इन',

            cmp_title     : 'दस्तावेज़ तुलना',
            cmp_subtitle  : 'दो दस्तावेज़ अपलोड करके उनकी प्रामाणिकता की तुलना करें',
            cmp_doc_a     : 'दस्तावेज़ A',
            cmp_doc_b     : 'दस्तावेज़ B',
            cmp_compare   : 'अभी तुलना करें',
            cmp_similarity: 'समानता विश्लेषण',

            result_download : 'रिपोर्ट डाउनलोड करें',
            result_ai_sum   : 'AI चिकित्सा सारांश',
            result_findings : 'फोरेंसिक निष्कर्ष',
            result_modules  : 'मॉड्यूल स्कोर',

            profile_title     : 'मेरी प्रोफ़ाइल',
            profile_edit      : 'विवरण संपादित करें',
            profile_username  : 'उपयोगकर्ता नाम',
            profile_org       : 'संस्था / अस्पताल',
            profile_change_pw : 'पासवर्ड बदलें',
            profile_current_pw: 'वर्तमान पासवर्ड',
            profile_new_pw    : 'नया पासवर्ड',
            profile_confirm_pw: 'नए पासवर्ड की पुष्टि',
            profile_save      : 'परिवर्तन सहेजें',
            profile_cancel    : 'रद्द करें',

            footer_copy: 'MediScan AI © 2025 — CREOVATORS OF SVCE',
        },

        /* ════════════ KANNADA ════════════ */
        kn: {
            nav_dashboard : 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
            nav_new_scan  : 'ಹೊಸ ಸ್ಕ್ಯಾನ್',
            nav_compare   : 'ಹೋಲಿಸಿ',
            nav_privacy   : 'ಗೌಪ್ಯತಾ ನೀತಿ',
            nav_signout   : 'ಸೈನ್ ಔಟ್',
            nav_profile   : 'ನನ್ನ ಪ್ರೊಫೈಲ್',

            dash_title          : 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
            dash_total          : 'ಒಟ್ಟು ಸ್ಕ್ಯಾನ್',
            dash_flagged        : 'ಶಂಕಿತ',
            dash_clean_f        : 'ಸ್ವಚ್ಛ',
            dash_avg            : 'ಸರಾಸರಿ ಅಪಾಯ ಸ್ಕೋರ್',
            dash_history        : 'ಸ್ಕ್ಯಾನ್ ಇತಿಹಾಸ',
            dash_col_file       : 'ಫೈಲ್ ಹೆಸರು',
            dash_col_date       : 'ದಿನಾಂಕ ಮತ್ತು ಸಮಯ',
            dash_col_type       : 'ಪ್ರಕಾರ',
            dash_col_verdict    : 'ತೀರ್ಪು',
            dash_col_score      : 'ಅಪಾಯ ಸ್ಕೋರ್',
            dash_col_actions    : 'ಕ್ರಿಯೆಗಳು',
            dash_view           : 'ನೋಡಿ',
            dash_pdf            : 'PDF',
            dash_no_scans_title : 'ಇನ್ನೂ ಸ್ಕ್ಯಾನ್ ಇಲ್ಲ',
            dash_no_scans_sub   : 'ಫೋರೆನ್ಸಿಕ್ ವಿಶ್ಲೇಷಣೆ ಪ್ರಾರಂಭಿಸಲು ನಿಮ್ಮ ಮೊದಲ ದಾಖಲೆ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ.',
            dash_first_scan     : 'ಮೊದಲ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ',

            scan_title      : 'ಹೊಸ ಫೋರೆನ್ಸಿಕ್ ಸ್ಕ್ಯಾನ್',
            scan_subtitle   : 'ರಿಯಲ್-ಟೈಮ್ ಫೋರೆನ್ಸಿಕ್ ವಿಶ್ಲೇಷಣೆಗಾಗಿ ವೈದ್ಯಕೀಯ ದಾಖಲೆ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ.',
            scan_drop_title : 'ನಿಮ್ಮ ಫೈಲ್ ಇಲ್ಲಿ ಎಳೆದು ಬಿಡಿ',
            scan_drop_sub   : 'ಅಥವಾ ಬ್ರೌಸ್ ಮಾಡಲು ಕ್ಲಿಕ್ ಮಾಡಿ',
            scan_max_size   : 'ಗರಿಷ್ಠ 16 MB',
            scan_analyse    : 'ಫೋರೆನ್ಸಿಕ್ ವಿಶ್ಲೇಷಣೆ ಚಲಾಯಿಸಿ',
            scan_what       : 'ಏನು ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತದೆ',
            scan_ela_title  : 'ದೋಷ ಮಟ್ಟ ವಿಶ್ಲೇಷಣೆ',
            scan_ela_desc   : 'JPEG ಚಿತ್ರಗಳಲ್ಲಿ ಪಿಕ್ಸೆಲ್ ಸಂಕೋಚನ ವ್ಯತ್ಯಾಸಗಳನ್ನು ಪತ್ತೆ ಮಾಡುತ್ತದೆ.',
            scan_meta_title : 'ಮೆಟಾಡೇಟಾ ತಪಾಸಣೆ',
            scan_meta_desc  : 'EXIF ಮತ್ತು PDF ಮೆಟಾಡೇಟಾ ಓದುತ್ತದೆ — ಸಂಪಾದನ ಸಾಫ್ಟ್‌ವೇರ್ ಮತ್ತು ಟೈಮ್‌ಸ್ಟ್ಯಾಂಪ್ ತಪ್ಪುಗಳನ್ನು ಗುರುತಿಸುತ್ತದೆ.',
            scan_integ_title: 'ಫೈಲ್ ಸಮಗ್ರತೆ',
            scan_integ_desc : 'SHA-256 ಹ್ಯಾಶ್, ಮ್ಯಾಜಿಕ್ ಬೈಟ್ ಮೌಲ್ಯೀಕರಣ ಮತ್ತು ಫೈಲ್ ರಚನೆ ತಪಾಸಣೆ.',
            scan_ocr_title  : 'OCR ಸ್ಥಿರತೆ',
            scan_ocr_desc   : 'ದಾಖಲೆ ಪಠ್ಯ ಹೊರತೆಗೆದು ವೈದ್ಯಕೀಯ ಕ್ಷೇತ್ರ ಮಾದರಿಗಳನ್ನು ಪರಿಶೀಲಿಸುತ್ತದೆ.',
            scan_note       : 'ಅಪ್‌ಲೋಡ್ ಮಾಡಿದ ಫೈಲ್‌ಗಳನ್ನು ಸುರಕ್ಷಿತವಾಗಿ ಪ್ರಕ್ರಿಯೆಗೊಳಿಸಲಾಗುತ್ತದೆ.',
            scan_uploading  : 'ಫೈಲ್ ಅಪ್‌ಲೋಡ್ ಆಗುತ್ತಿದೆ…',
            scan_prep       : 'ಫೋರೆನ್ಸಿಕ್ ಎಂಜಿನ್ ಸಿದ್ಧವಾಗುತ್ತಿದೆ',
            scan_step1      : 'ಫೋರೆನ್ಸಿಕ್ ಎಂಜಿನ್ ಪ್ರಾರಂಭ',
            scan_step2      : 'ದೋಷ ಮಟ್ಟ ವಿಶ್ಲೇಷಣೆ',
            scan_step3      : 'ಮೆಟಾಡೇಟಾ ಹೊರತೆಗೆಯುತ್ತಿದೆ',
            scan_step4      : 'ಫೈಲ್ ಸಮಗ್ರತೆ ಪರಿಶೀಲನೆ',
            scan_step5      : 'OCR ವಿಶ್ಲೇಷಣೆ',
            scan_step6      : 'ನಕಲಿ ಸ್ಕೋರ್ ಲೆಕ್ಕಾಚಾರ',

            auth_welcome      : 'ಮರಳಿ ಸ್ವಾಗತ',
            auth_signin_sub   : 'ನಿಮ್ಮ MediScan ಖಾತೆಗೆ ಸೈನ್ ಇನ್ ಮಾಡಿ',
            auth_email        : 'ಇಮೇಲ್ ವಿಳಾಸ',
            auth_password     : 'ಪಾಸ್‌ವರ್ಡ್',
            auth_remember     : 'ನನ್ನನ್ನು ನೆನಪಿಡಿ',
            auth_signin       : 'ಸೈನ್ ಇನ್',
            auth_no_account   : 'ಖಾತೆ ಇಲ್ಲವೇ?',
            auth_create       : 'ತೆರೆಯಿರಿ',
            auth_create_account: 'ನಿಮ್ಮ ಖಾತೆ ರಚಿಸಿ',
            auth_create_sub   : 'MediScan AI ಗೆ ಉಚಿತ ಪ್ರವೇಶ',
            auth_username     : 'ಬಳಕೆದಾರ ಹೆಸರು',
            auth_org          : 'ಸಂಸ್ಥೆ',
            auth_optional     : '(ಐಚ್ಛಿಕ)',
            auth_confirm_pw   : 'ಪಾಸ್‌ವರ್ಡ್ ದೃಢೀಕರಿಸಿ',
            auth_register     : 'ಖಾತೆ ರಚಿಸಿ',
            auth_have_account : 'ಈಗಾಗಲೇ ಖಾತೆ ಇದೆಯೇ?',
            auth_signin_link  : 'ಸೈನ್ ಇನ್',

            cmp_title     : 'ದಾಖಲೆ ಹೋಲಿಕೆ',
            cmp_subtitle  : 'ಎರಡು ದಾಖಲೆಗಳನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ ಮತ್ತು ಹೋಲಿಸಿ',
            cmp_doc_a     : 'ದಾಖಲೆ A',
            cmp_doc_b     : 'ದಾಖಲೆ B',
            cmp_compare   : 'ಈಗ ಹೋಲಿಸಿ',
            cmp_similarity: 'ಸಾಮ್ಯ ವಿಶ್ಲೇಷಣೆ',

            result_download : 'ವರದಿ ಡೌನ್‌ಲೋಡ್',
            result_ai_sum   : 'AI ವೈದ್ಯಕೀಯ ಸಾರಾಂಶ',
            result_findings : 'ಫೋರೆನ್ಸಿಕ್ ಫಲಿತಾಂಶ',
            result_modules  : 'ಮಾಡ್ಯೂಲ್ ಸ್ಕೋರ್‌ಗಳು',

            profile_title     : 'ನನ್ನ ಪ್ರೊಫೈಲ್',
            profile_edit      : 'ವಿವರಗಳನ್ನು ಸಂಪಾದಿಸಿ',
            profile_username  : 'ಬಳಕೆದಾರ ಹೆಸರು',
            profile_org       : 'ಸಂಸ್ಥೆ / ಆಸ್ಪತ್ರೆ',
            profile_change_pw : 'ಪಾಸ್‌ವರ್ಡ್ ಬದಲಿಸಿ',
            profile_current_pw: 'ಪ್ರಸ್ತುತ ಪಾಸ್‌ವರ್ಡ್',
            profile_new_pw    : 'ಹೊಸ ಪಾಸ್‌ವರ್ಡ್',
            profile_confirm_pw: 'ಹೊಸ ಪಾಸ್‌ವರ್ಡ್ ದೃಢೀಕರಿಸಿ',
            profile_save      : 'ಬದಲಾವಣೆಗಳನ್ನು ಉಳಿಸಿ',
            profile_cancel    : 'ರದ್ದುಮಾಡಿ',

            footer_copy: 'MediScan AI © 2025 — CREOVATORS OF SVCE',
        },

        /* ════════════ TELUGU ════════════ */
        te: {
            nav_dashboard : 'డాష్‌బోర్డ్',
            nav_new_scan  : 'కొత్త స్కాన్',
            nav_compare   : 'పోల్చండి',
            nav_privacy   : 'గోప్యతా విధానం',
            nav_signout   : 'సైన్ అవుట్',
            nav_profile   : 'నా ప్రొఫైల్',

            dash_title          : 'డాష్‌బోర్డ్',
            dash_total          : 'మొత్తం స్కాన్లు',
            dash_flagged        : 'సందేహాస్పద',
            dash_clean_f        : 'శుభ్రంగా',
            dash_avg            : 'సగటు రిస్క్ స్కోర్',
            dash_history        : 'స్కాన్ చరిత్ర',
            dash_col_file       : 'ఫైల్ పేరు',
            dash_col_date       : 'తేదీ మరియు సమయం',
            dash_col_type       : 'రకం',
            dash_col_verdict    : 'తీర్పు',
            dash_col_score      : 'రిస్క్ స్కోర్',
            dash_col_actions    : 'చర్యలు',
            dash_view           : 'చూడండి',
            dash_pdf            : 'PDF',
            dash_no_scans_title : 'ఇంకా స్కాన్లు లేవు',
            dash_no_scans_sub   : 'ఫోరెన్సిక్ విశ్లేషణ ప్రారంభించడానికి మీ మొదటి పత్రాన్ని అప్‌లోడ్ చేయండి.',
            dash_first_scan     : 'మొదటి స్కాన్ చేయండి',

            scan_title      : 'కొత్త ఫోరెన్సిక్ స్కాన్',
            scan_subtitle   : 'రియల్-టైమ్ ఫోరెన్సిక్ విశ్లేషణ కోసం వైద్య నివేదికను అప్‌లోడ్ చేయండి.',
            scan_drop_title : 'మీ ఫైల్‌ను ఇక్కడ లాగి వదలండి',
            scan_drop_sub   : 'లేదా బ్రౌజ్ చేయడానికి క్లిక్ చేయండి',
            scan_max_size   : 'గరిష్టం 16 MB',
            scan_analyse    : 'ఫోరెన్సిక్ విశ్లేషణ అమలు చేయండి',
            scan_what       : 'ఏమి విశ్లేషించబడుతుందో',
            scan_ela_title  : 'ఎర్రర్ లెవెల్ అనాలిసిస్',
            scan_ela_desc   : 'JPEG చిత్రాలలో పిక్సెల్ కంప్రెషన్ వ్యత్యాసాలను గుర్తిస్తుంది.',
            scan_meta_title : 'మెటాడేటా తనిఖీ',
            scan_meta_desc  : 'EXIF మరియు PDF మెటాడేటాను చదువుతుంది — సవరణ సాఫ్ట్‌వేర్ మరియు టైమ్‌స్టాంప్ తప్పులను గుర్తిస్తుంది.',
            scan_integ_title: 'ఫైల్ సమగ్రత',
            scan_integ_desc : 'SHA-256 హాష్, మేజిక్ బైట్ ధృవీకరణ మరియు ఫైల్ నిర్మాణ తనిఖీ.',
            scan_ocr_title  : 'OCR స్థిరత్వం',
            scan_ocr_desc   : 'పత్ర వచనాన్ని సేకరించి వైద్య క్షేత్ర నమూనాలను తనిఖీ చేస్తుంది.',
            scan_note       : 'అప్‌లోడ్ చేసిన ఫైల్‌లు సురక్షితంగా ప్రాసెస్ చేయబడతాయి.',
            scan_uploading  : 'ఫైల్ అప్‌లోడ్ అవుతోంది…',
            scan_prep       : 'ఫోరెన్సిక్ ఇంజిన్ సిద్ధమవుతోంది',
            scan_step1      : 'ఫోరెన్సిక్ ఇంజిన్ ప్రారంభం',
            scan_step2      : 'ఎర్రర్ లెవెల్ అనాలిసిస్',
            scan_step3      : 'మెటాడేటా సేకరిస్తున్నాం',
            scan_step4      : 'ఫైల్ సమగ్రత ధృవీకరణ',
            scan_step5      : 'OCR విశ్లేషణ',
            scan_step6      : 'నకిలీ స్కోర్ గణన',

            auth_welcome      : 'మళ్ళీ స్వాగతం',
            auth_signin_sub   : 'మీ MediScan ఖాతాలోకి సైన్ ఇన్ చేయండి',
            auth_email        : 'ఇమెయిల్ చిరునామా',
            auth_password     : 'పాస్‌వర్డ్',
            auth_remember     : 'నన్ను గుర్తుంచుకో',
            auth_signin       : 'సైన్ ఇన్',
            auth_no_account   : 'ఖాతా లేదా?',
            auth_create       : 'సృష్టించండి',
            auth_create_account: 'మీ ఖాతా సృష్టించండి',
            auth_create_sub   : 'MediScan AI కు ఉచిత యాక్సెస్',
            auth_username     : 'వినియోగదారు పేరు',
            auth_org          : 'సంస్థ',
            auth_optional     : '(ఐచ్ఛికం)',
            auth_confirm_pw   : 'పాస్‌వర్డ్ నిర్ధారించండి',
            auth_register     : 'ఖాతా సృష్టించండి',
            auth_have_account : 'ఇప్పటికే ఖాతా ఉందా?',
            auth_signin_link  : 'సైన్ ఇన్',

            cmp_title     : 'పత్రాలు పోల్చండి',
            cmp_subtitle  : 'రెండు పత్రాలు అప్‌లోడ్ చేసి వాటి ప్రామాణికతను పోల్చండి',
            cmp_doc_a     : 'పత్రం A',
            cmp_doc_b     : 'పత్రం B',
            cmp_compare   : 'ఇప్పుడు పోల్చండి',
            cmp_similarity: 'సారూప్య విశ్లేషణ',

            result_download : 'నివేదిక డౌన్‌లోడ్',
            result_ai_sum   : 'AI వైద్య సారాంశం',
            result_findings : 'ఫోరెన్సిక్ ఫలితాలు',
            result_modules  : 'మాడ్యూల్ స్కోర్లు',

            profile_title     : 'నా ప్రొఫైల్',
            profile_edit      : 'వివరాలు సవరించండి',
            profile_username  : 'వినియోగదారు పేరు',
            profile_org       : 'సంస్థ / ఆసుపత్రి',
            profile_change_pw : 'పాస్‌వర్డ్ మార్చండి',
            profile_current_pw: 'ప్రస్తుత పాస్‌వర్డ్',
            profile_new_pw    : 'కొత్త పాస్‌వర్డ్',
            profile_confirm_pw: 'కొత్త పాస్‌వర్డ్ నిర్ధారించండి',
            profile_save      : 'మార్పులు సేవ్ చేయండి',
            profile_cancel    : 'రద్దు చేయండి',

            footer_copy: 'MediScan AI © 2025 — CREOVATORS OF SVCE',
        },
    };

    // ── Apply translations to current page ─────────────────────────────────────
    function applyLang(lang) {
        const dict = T[lang] || T.en;

        // Text content
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.dataset.i18n;
            if (dict[key] !== undefined) el.textContent = dict[key];
        });

        // Input placeholders
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.dataset.i18nPlaceholder;
            if (dict[key] !== undefined) el.placeholder = dict[key];
        });

        // Update lang button label
        const labels = { en: '🌐 EN', hi: '🌐 हि', kn: '🌐 ಕ', te: '🌐 తె' };
        const btn = document.getElementById('langSwitcherBtn');
        if (btn) btn.textContent = labels[lang] || '🌐 EN';

        // Persist & set html lang attr
        try { localStorage.setItem('ms_lang', lang); } catch(e) {}
        document.documentElement.lang = lang;

        // Dispatch event so other scripts can react
        document.dispatchEvent(new CustomEvent('langchange', { detail: { lang } }));
    }

    // Public setter (called by dropdown buttons)
    window.setLang = function (lang) {
        applyLang(lang);
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

        // Load saved language preference
        let lang = 'en';
        try {
            const saved   = localStorage.getItem('ms_lang');
            const browser = (navigator.language || '').slice(0, 2);
            lang = saved || (['hi','kn','te'].includes(browser) ? browser : 'en');
        } catch(e) {}

        applyLang(lang);
    });
}());
