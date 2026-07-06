/**
 * scan.js — Drag-and-drop upload + processing overlay animation
 */

const dropzone     = document.getElementById('dropzone');
const fileInput    = document.getElementById('fileInput');
const submitBtn    = document.getElementById('submitBtn');
const scanForm     = document.getElementById('scanForm');
const filePreview  = document.getElementById('filePreview');
const previewName  = document.getElementById('previewName');
const previewSize  = document.getElementById('previewSize');
const dropzoneIcon = document.getElementById('dropzoneIcon');
const dropzoneTitle= document.getElementById('dropzoneTitle');
const dropzoneSub  = document.getElementById('dropzoneSub');
const dropzoneFmts = document.querySelector('.dropzone-formats');
const removeBtn    = document.getElementById('removeFile');
const overlay      = document.getElementById('processingOverlay');

const STEPS = [
    'pstep-1', 'pstep-2', 'pstep-3',
    'pstep-4', 'pstep-5', 'pstep-6'
];

function formatBytes(bytes) {
    if (bytes < 1024)       return bytes + ' B';
    if (bytes < 1048576)    return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
}

function showFile(file) {
    previewName.textContent = file.name;
    previewSize.textContent = formatBytes(file.size);

    // Hide default dropzone UI, show file preview
    dropzoneIcon.style.display = 'none';
    dropzoneTitle.style.display = 'none';
    dropzoneSub.style.display = 'none';
    if (dropzoneFmts) dropzoneFmts.style.display = 'none';
    filePreview.style.display = 'flex';
    submitBtn.disabled = false;
}

function clearFile() {
    fileInput.value = '';
    dropzoneIcon.style.display = '';
    dropzoneTitle.style.display = '';
    dropzoneSub.style.display = '';
    if (dropzoneFmts) dropzoneFmts.style.display = '';
    filePreview.style.display = 'none';
    submitBtn.disabled = true;
    dropzone.classList.remove('drag-over');
}

// File input change
fileInput.addEventListener('change', () => {
    if (fileInput.files.length > 0) {
        showFile(fileInput.files[0]);
    }
});

// Remove file button
removeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    clearFile();
});

// Click on dropzone → open file browser
dropzone.addEventListener('click', (e) => {
    if (e.target === removeBtn || removeBtn.contains(e.target)) return;
    if (filePreview.style.display === 'flex') return;
    fileInput.click();
});

// Drag events
dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('drag-over');
});
dropzone.addEventListener('dragleave', () => {
    dropzone.classList.remove('drag-over');
});
dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('drag-over');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        const allowed = ['application/pdf','image/jpeg','image/png'];
        if (!allowed.includes(files[0].type) &&
            !/\.(pdf|jpg|jpeg|png)$/i.test(files[0].name)) {
            alert('Please upload a PDF, JPEG, or PNG file.');
            return;
        }
        // Assign to input
        const dt = new DataTransfer();
        dt.items.add(files[0]);
        fileInput.files = dt.files;
        showFile(files[0]);
    }
});

// Form submit → show overlay + animate steps
scanForm.addEventListener('submit', () => {
    overlay.classList.add('active');
    submitBtn.disabled = true;

    let step = 0;
    function activateStep() {
        if (step < STEPS.length) {
            // Mark previous step done
            if (step > 0) {
                document.getElementById(STEPS[step - 1]).classList.remove('active');
                document.getElementById(STEPS[step - 1]).classList.add('done');
            }
            document.getElementById(STEPS[step]).classList.add('active');
            step++;
            // Each step takes roughly 600ms (total ~3.6s)
            setTimeout(activateStep, 600);
        } else {
            // Mark last done
            document.getElementById(STEPS[step - 1]).classList.remove('active');
            document.getElementById(STEPS[step - 1]).classList.add('done');
        }
    }
    activateStep();
});
