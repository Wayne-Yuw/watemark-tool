// ===== 鍏ㄥ眬鍙橀噺 =====
let uploadedFile = null;
let currentFileType = null;
let originalImageData = null; // 淇濆瓨鍘熷鍥惧儚
// PDF相关变量
let pdfDoc = null; // PDF文档对象
let currentPdfPage = 1; // 当前PDF页码
let totalPdfPages = 0; // PDF总页数
let watermarkSettings = {
    type: 'text',
    text: '',
    fontSize: 24,
    fontColor: '#000000',
    style: 'full',
    position: 'center',
    spacing: 20,
    opacity: 50,
    rotation: -45,
    imageFile: null,
    logoFile: null,
    imageSize: 200,
    logoSize: 100
};

// 棰勮鍖哄煙娴姩鐩稿叧鍙橀噺
let previewInitialPosition = null; // 璁板綍棰勮鍖哄煙鍒濆浣嶇疆
let isPreviewFloating = false; // 是否处于浮动状态
const FLOATING_TOP_MARGIN = 20; // 浮动状态下与浏览器顶部的边距(px)
// ===== DOM鍏冪礌 =====
const mainContent = document.querySelector('.main-content');
const uploadSection = document.getElementById('uploadSection');
const settingsSection = document.getElementById('settingsSection');
const previewSection = document.getElementById('previewSection');
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const uploadBtn = document.getElementById('uploadBtn');
const changeFileBtn = document.getElementById('changeFileBtn');
const clearFileBtn = document.getElementById('clearFileBtn');
const fileInfo = document.getElementById('fileInfo');
const filePreview = document.getElementById('filePreview');
const fileName = document.getElementById('fileName');
const fileSize = document.getElementById('fileSize');
const previewCanvas = document.getElementById('previewCanvas');

// PDF鎺у埗鎸夐挳
const pdfControls = document.getElementById("pdfControls");
const prevPageBtn = document.getElementById("prevPageBtn");
const nextPageBtn = document.getElementById("nextPageBtn");
const currentPageSpan = document.getElementById("currentPage");
const totalPagesSpan = document.getElementById("totalPages");

// Tab鍒囨崲鍏冪礌
const tabBtns = document.querySelectorAll('.tab-btn');
const tabPanels = document.querySelectorAll('.tab-panel');

// 鏍峰紡閫夋嫨鎸夐挳
const styleBtns = document.querySelectorAll('.style-btn');
const positionSelector = document.getElementById('positionSelector');
const positionBtns = document.querySelectorAll('.position-btn');

// 琛ㄥ崟鍏冪礌
const watermarkText = document.getElementById('watermarkText');
const fontSize = document.getElementById('fontSize');
const fontSizeValue = document.getElementById('fontSizeValue');
const fontColor = document.getElementById('fontColor');
const watermarkImage = document.getElementById('watermarkImage');
const imagePreview = document.getElementById('imagePreview');
const logoImage = document.getElementById('logoImage');
const logoPreview = document.getElementById('logoPreview');
const imageSize = document.getElementById('imageSize');
const imageSizeValue = document.getElementById('imageSizeValue');
const logoSize = document.getElementById('logoSize');
const logoSizeValue = document.getElementById('logoSizeValue');
const spacing = document.getElementById('spacing');
const spacingValue = document.getElementById('spacingValue');
const opacity = document.getElementById('opacity');
const opacityValue = document.getElementById('opacityValue');
const rotation = document.getElementById('rotation');
const rotationValue = document.getElementById('rotationValue');

// 鎸夐挳鍏冪礌
const applyBtn = document.getElementById('applyBtn');
const resetBtn = document.getElementById('resetBtn');
const downloadBtn = document.getElementById('downloadBtn');

// ===== 鍒濆鍖栦簨浠剁洃鍚?=====
function initEventListeners() {
    // 涓婁紶鎸夐挳鐐瑰嚮
uploadBtn.addEventListener('click', (e) => { e.stopPropagation(); fileInput.click(); });
    changeFileBtn.addEventListener('click', (e) => { e.stopPropagation(); fileInput.click(); });
    clearFileBtn.addEventListener('click', clearAllAndReset);

    // 鏂囦欢閫夋嫨
fileInput.addEventListener('change', handleFileSelect);

    // 鎷栨嫿涓婁紶
uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
    uploadArea.addEventListener('click', () => { fileInput.click(); });

    // Tab鍒囨崲
tabBtns.forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    // 鏍峰紡閫夋嫨
styleBtns.forEach(btn => {
        btn.addEventListener('click', () => selectStyle(btn.dataset.style));
    });

    // 浣嶇疆閫夋嫨
positionBtns.forEach(btn => {
        btn.addEventListener('click', () => selectPosition(btn.dataset.position));
    });

    // 婊戝姩鏉″悓姝?
syncSliderWithInput(fontSize, fontSizeValue);
    syncSliderWithInput(imageSize, imageSizeValue);
    syncSliderWithInput(logoSize, logoSizeValue);
    syncSliderWithInput(spacing, spacingValue);
    syncSliderWithInput(opacity, opacityValue);
    syncSliderWithInput(rotation, rotationValue);

    // 姘村嵃璁剧疆鍙樺寲
watermarkText.addEventListener('input', (e) => {
        watermarkSettings.text = e.target.value;
        updatePreview();
    });

    fontSize.addEventListener('input', (e) => {
        watermarkSettings.fontSize = parseInt(e.target.value);
        updatePreview();
    });

    fontColor.addEventListener('input', (e) => {
        watermarkSettings.fontColor = e.target.value;
        updatePreview();
    });

    watermarkImage.addEventListener('change', (e) => handleWatermarkImage(e, 'image'));
    logoImage.addEventListener('change', (e) => handleWatermarkImage(e, 'logo'));

    imageSize.addEventListener('input', (e) => {
        watermarkSettings.imageSize = parseInt(e.target.value);
        updatePreview();
    });

    logoSize.addEventListener('input', (e) => {
        watermarkSettings.logoSize = parseInt(e.target.value);
        updatePreview();
    });

    spacing.addEventListener('input', (e) => {
        watermarkSettings.spacing = parseInt(e.target.value);
        updatePreview();
    });

    opacity.addEventListener('input', (e) => {
        watermarkSettings.opacity = parseInt(e.target.value);
        updatePreview();
    });

    rotation.addEventListener('input', (e) => {
        watermarkSettings.rotation = parseInt(e.target.value);
        updatePreview();
    });

    // 鎸夐挳浜嬩欢
applyBtn.addEventListener('click', applyWatermark);
    resetBtn.addEventListener('click', resetSettings);
    downloadBtn.addEventListener('click', downloadFile);

    // PDF缈婚〉鎸夐挳
    prevPageBtn.addEventListener("click", showPreviousPage);
    nextPageBtn.addEventListener("click", showNextPage);
}

// ===== 娓呴櫎鎵€鏈夊唴瀹瑰苟閲嶇疆鍒板垵濮嬬姸鎬?=====
function clearAllAndReset() {
    // 娓呴櫎涓婁紶鐨勬枃浠?
uploadedFile = null;
    currentFileType = null;
    originalImageData = null;
    fileInput.value = '';

    // 娓呯┖鏂囦欢棰勮鍜屼俊鎭?
filePreview.innerHTML = '';
    fileName.textContent = '';
    fileSize.textContent = '';

    // 娓呯┖canvas
const ctx = previewCanvas.getContext('2d');
    ctx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);

    // 绉婚櫎娴姩鏁堟灉骞舵竻闄よ褰曠殑浣嶇疆
if (isPreviewFloating) {
        removeFloatingEffect();
    }
    previewInitialPosition = null;

    // 闅愯棌鏂囦欢淇℃伅锛屾樉绀轰笂浼犲尯鍩?
fileInfo.style.display = 'none';
    uploadArea.style.display = 'block';

    // 鎭㈠鍒濆鐘舵€佺殑灞呬腑鏍峰紡
mainContent.classList.add('initial-state');

    // 闅愯棌璁剧疆鍜岄瑙堝尯鍩?
settingsSection.style.display = 'none';
    previewSection.style.display = 'none';

    // 閲嶇疆鎵€鏈夋按鍗拌缃?
resetSettings();

    // 娓呯┖姘村嵃鍥剧墖棰勮
imagePreview.innerHTML = '';
    logoPreview.innerHTML = '';
    watermarkImage.value = '';
    logoImage.value = '';
}

// ===== 鏂囦欢澶勭悊鍑芥暟 =====
function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        processFile(file);
    }
}

function handleDragOver(e) {
    e.preventDefault();
    uploadArea.classList.add('drag-over');
}

function handleDragLeave(e) {
    e.preventDefault();
    uploadArea.classList.remove('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    uploadArea.classList.remove('drag-over');

    const file = e.dataTransfer.files[0];
    if (file) {
        processFile(file);
    }
}

function processFile(file) {
    // 楠岃瘉鏂囦欢绫诲瀷
// Robust file type detection: support common image mimes/exts and PDF
const mime = file.type || '';
const nameLower = (file.name || '').toLowerCase();
const ext = nameLower.substring(nameLower.lastIndexOf('.') + 1);
const imageMimes = new Set(['image/jpeg','image/png','image/jpg','image/webp','image/gif','image/bmp']);
const imageExts = new Set(['jpg','jpeg','png','webp','gif','bmp','jfif']);
const isImage = (mime.startsWith('image/') && (mime !== 'image/svg+xml')) || imageMimes.has(mime) || imageExts.has(ext);
const isPdf = mime === 'application/pdf' || ext === 'pdf';
if (!isImage && !isPdf) { alert('不支持的文件类型，请选择 JPG/PNG/WebP/GIF/BMP 或 PDF 文件'); fileInput.value = ''; return; }

    // 楠岃瘉鏂囦欢澶у皬 (10MB)
const maxSize = 10 * 1024 * 1024;
if (file.size > maxSize) { alert('文件过大，最大支持 10MB'); fileInput.value = ''; return; }

    uploadedFile = file;
    currentFileType = isImage ? 'image' : 'pdf';

    // 鏇存柊鏂囦欢淇℃伅鏄剧ず
fileName.textContent = file.name;
    fileSize.textContent = formatFileSize(file.size);

    // 鏄剧ず鏂囦欢棰勮
if (currentFileType === 'image') {
        const reader = new FileReader();
        reader.onload = (e) => {
            filePreview.innerHTML = `<img src="${e.target.result}" alt="棰勮">`;
            loadImageToCanvas(e.target.result);
        };
        reader.onerror = () => { alert('读取文件失败，请重试'); fileInput.value = ''; };
        reader.readAsDataURL(file);
    } else {
        filePreview.innerHTML = '<p style="color: #64748b;">PDF 鏂囦欢</p>';
        // 加载并预览PDF
        loadPdfFile(file);
}

    // 鏄剧ず鏂囦欢淇℃伅鍜岄殣钘忎笂浼犲尯鍩?
uploadArea.style.display = 'none';
    fileInfo.style.display = 'flex';

    // 绉婚櫎鍒濆鐘舵€佺殑灞呬腑鏍峰紡
mainContent.classList.remove('initial-state');

    // 鏄剧ず璁剧疆鍜岄瑙堝尯鍩?
settingsSection.style.display = 'block';
    previewSection.style.display = 'block';

    // 璋冩暣棰勮鍖哄煙浣嶇疆鍜岄珮搴︼紝骞惰褰曞垵濮嬩綅缃?
setTimeout(() => {
        adjustPreviewPosition();
        recordPreviewInitialPosition();
    }, 100);
}

function loadImageToCanvas(imageSrc) {
    const img = new Image();
    img.onload = () => {
        // Set canvas size with a max to keep preview manageable
        const maxWidth = 800;
        const maxHeight = 600;
        let width = img.width;
        let height = img.height;

        // Scale down proportionally if needed
        if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width *= ratio;
            height *= ratio;
        }

        previewCanvas.width = width;
        previewCanvas.height = height;

        const ctx = previewCanvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Store original image for re-rendering watermarks
        originalImageData = ctx.getImageData(0, 0, width, height);

        // Apply initial watermark
        updatePreview();
    };
    img.onerror = () => { alert('图片加载失败，可能格式不受支持'); fileInput.value=''; };
    img.src = imageSrc;
}

// ===== 姘村嵃鍥剧墖澶勭悊 =====
function handleWatermarkImage(e, type) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
            if (type === 'image') {
                watermarkSettings.imageFile = img;
                imagePreview.innerHTML = `<img src="${event.target.result}" alt="姘村嵃鍥剧墖">`;
            } else {
                watermarkSettings.logoFile = img;
                logoPreview.innerHTML = `<img src="${event.target.result}" alt="Logo">`;
            }
            updatePreview();
        };
        img.src = event.target.result;
    };
    reader.onerror = () => { alert('读取文件失败，请重试'); fileInput.value = ''; };
        reader.readAsDataURL(file);
}

// ===== UI浜や簰鍑芥暟 =====
function switchTab(tabName) {
    // 鏇存柊Tab鎸夐挳鐘舵€?
tabBtns.forEach(btn => {
        if (btn.dataset.tab === tabName) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // 鏇存柊Tab闈㈡澘鏄剧ず
tabPanels.forEach(panel => {
        if (panel.id === tabName + 'Panel') {
            panel.classList.add('active');
        } else {
            panel.classList.remove('active');
        }
    });

    // 鏇存柊姘村嵃绫诲瀷
watermarkSettings.type = tabName;
    updatePreview();
}

function selectStyle(style) {
    styleBtns.forEach(btn => {
        if (btn.dataset.style === style) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    watermarkSettings.style = style;

    // 鏄剧ず/闅愯棌浣嶇疆閫夋嫨鍣?
if (style === 'single') {
        positionSelector.style.display = 'block';
    } else {
        positionSelector.style.display = 'none';
    }

    updatePreview();
}

function selectPosition(position) {
    positionBtns.forEach(btn => {
        if (btn.dataset.position === position) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    watermarkSettings.position = position;
    updatePreview();
}

function syncSliderWithInput(slider, input) {
    slider.addEventListener('input', (e) => {
        input.value = e.target.value;
    });

    input.addEventListener('input', (e) => {
        slider.value = e.target.value;
    });
}

// ===== 姘村嵃棰勮鏇存柊 =====
function updatePreview() {
    if (!uploadedFile || !originalImageData) return;

    // 支持图片和PDF的水印预览
    if (currentFileType !== 'image' && currentFileType !== 'pdf') return;

    const ctx = previewCanvas.getContext('2d');
    const canvas = previewCanvas;

    // 鍏堟仮澶嶅師濮嬪浘鍍忥紙娓呴櫎涔嬪墠鐨勬按鍗帮級
ctx.putImageData(originalImageData, 0, 0);

    // 搴旂敤鏂扮殑姘村嵃
applyWatermarkToCanvas(ctx, canvas.width, canvas.height);
}

function applyWatermarkToCanvas(ctx, width, height) {
    // 淇濆瓨褰撳墠鐘舵€?
ctx.save();

    // 璁剧疆閫忔槑搴?
ctx.globalAlpha = watermarkSettings.opacity / 100;

    if (watermarkSettings.style === 'single') {
        // 鍗曚釜姘村嵃
drawSingleWatermark(ctx, width, height);
    } else {
        // 骞抽摵姘村嵃
drawTiledWatermark(ctx, width, height);
    }

    // 鎭㈠鐘舵€?
ctx.restore();
}

function drawSingleWatermark(ctx, width, height) {
    const position = watermarkSettings.position;
    let x, y;

    // 璁＄畻浣嶇疆
switch (position) {
        case 'top-left':
            x = 50; y = 50;
            break;
        case 'top-center':
            x = width / 2; y = 50;
            break;
        case 'top-right':
            x = width - 50; y = 50;
            break;
        case 'center-left':
            x = 50; y = height / 2;
            break;
        case 'center':
            x = width / 2; y = height / 2;
            break;
        case 'center-right':
            x = width - 50; y = height / 2;
            break;
        case 'bottom-left':
            x = 50; y = height - 50;
            break;
        case 'bottom-center':
            x = width / 2; y = height - 50;
            break;
        case 'bottom-right':
            x = width - 50; y = height - 50;
            break;
        default:
            x = width / 2; y = height / 2;
    }

    drawWatermarkAt(ctx, x, y);
}

function drawTiledWatermark(ctx, width, height) {
    const spacing = watermarkSettings.spacing;

    // 计算当前水印的轴对齐尺寸（考虑旋转后的包围盒）
const { stepX, stepY, bboxW, bboxH } = (function computeTilingSteps() {
        let baseW = 0, baseH = 0;
        if (watermarkSettings.type === 'text') {
            // 在测量前设置与绘制一致的字体
ctx.save();
            ctx.font = `${watermarkSettings.fontSize}px \"Microsoft YaHei\", \"PingFang SC\", \"Noto Sans CJK SC\", \"WenQuanYi Micro Hei\", Arial, sans-serif`;
            const metrics = ctx.measureText(watermarkSettings.text || ' ');
            // 文本宽度使用测量值，高度用字号的近似（更稳妥可以 metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent）
baseW = Math.max(1, metrics.width);
            const ascent = metrics.actualBoundingBoxAscent || 0;
            const descent = metrics.actualBoundingBoxDescent || 0;
            baseH = Math.max(1, (ascent + descent) || watermarkSettings.fontSize);
            ctx.restore();
        } else if (watermarkSettings.type === 'image' && watermarkSettings.imageFile) {
            baseW = watermarkSettings.imageSize;
            baseH = watermarkSettings.imageSize;
        } else if (watermarkSettings.type === 'logo' && watermarkSettings.logoFile) {
            baseW = watermarkSettings.logoSize;
            baseH = watermarkSettings.logoSize;
        } else {
            // 兜底：按文字的默认大小
baseW = watermarkSettings.fontSize * 2;
            baseH = watermarkSettings.fontSize;
        }

        // 旋转后的轴对齐包围盒尺寸
const rad = (watermarkSettings.rotation * Math.PI) / 180;
        const cos = Math.abs(Math.cos(rad));
        const sin = Math.abs(Math.sin(rad));
        const bboxW = baseW * cos + baseH * sin;
        const bboxH = baseW * sin + baseH * cos;

        // 每个平铺步长 = 包围盒尺寸 + 间距，实现“间距与大小联动”
const stepX = Math.max(4, Math.floor(bboxW + spacing));
        const stepY = Math.max(4, Math.floor(bboxH + spacing));
        return { stepX, stepY, bboxW, bboxH };
    })();

    // 确定绘制区域
let startX = 0, startY = 0, endX = width, endY = height;
    switch (watermarkSettings.style) {
        case 'top':
            endY = height / 2;
            break;
        case 'bottom':
            startY = height / 2;
            break;
        case 'left':
            endX = width / 2;
            break;
        case 'right':
            startX = width / 2;
            break;
        // 'full' 或其他：使用整张区域
}

    // 为了避免边缘留白，从负的包围盒尺寸开始并延伸到超出尾部一个包围盒
const tileStartY = startY - Math.ceil(bboxH);
    const tileEndY = endY + Math.ceil(bboxH);
    const tileStartX = startX - Math.ceil(bboxW);
    const tileEndX = endX + Math.ceil(bboxW);

    for (let y = tileStartY; y <= tileEndY; y += stepY) {
        for (let x = tileStartX; x <= tileEndX; x += stepX) {
            drawWatermarkAt(ctx, x, y);
        }
    }
}

function drawWatermarkAt(ctx, x, y) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((watermarkSettings.rotation * Math.PI) / 180);

    if (watermarkSettings.type === 'text') {
        // 缁樺埗鏂囧瓧姘村嵃
ctx.font = `${watermarkSettings.fontSize}px \"Microsoft YaHei\", \"PingFang SC\", \"Noto Sans CJK SC\", \"WenQuanYi Micro Hei\", Arial, sans-serif`;
        ctx.fillStyle = watermarkSettings.fontColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(watermarkSettings.text, 0, 0);
    } else if (watermarkSettings.type === 'image' && watermarkSettings.imageFile) {
        // 缁樺埗鍥剧墖姘村嵃
const size = watermarkSettings.imageSize;
        ctx.drawImage(watermarkSettings.imageFile, -size / 2, -size / 2, size, size);
    } else if (watermarkSettings.type === 'logo' && watermarkSettings.logoFile) {
        // 缁樺埗Logo姘村嵃
const size = watermarkSettings.logoSize;
        ctx.drawImage(watermarkSettings.logoFile, -size / 2, -size / 2, size, size);
    }

    ctx.restore();
}

// ===== 搴旂敤鍜屼笅杞?=====
function applyWatermark() {
    updatePreview();
    }

function downloadFile() {
    if (!previewCanvas) return;

    const link = document.createElement('a');
    link.download = `watermarked_${uploadedFile.name}`;
    link.href = previewCanvas.toDataURL('image/png');
    link.click();
}

function resetSettings() {
    // 閲嶇疆鎵€鏈夎缃?
const __def = watermarkText.getAttribute('data-default-text') || '\u6c34\u5370\u6587\u5b57'; watermarkText.value = __def;
    fontSize.value = 24;
    fontSizeValue.value = 24;
    fontColor.value = '#000000';
    spacing.value = 20;
    spacingValue.value = 20;
    opacity.value = 50;
    opacityValue.value = 50;
    rotation.value = -45;
    rotationValue.value = -45;
    imageSize.value = 200;
    imageSizeValue.value = 200;
    logoSize.value = 100;
    logoSizeValue.value = 100;

    watermarkSettings = {
        type: 'text',
        text: watermarkText.value,
        fontSize: 24,
        fontColor: '#000000',
        style: 'full',
        position: 'center',
        spacing: 20,
        opacity: 50,
        rotation: -45,
        imageFile: null,
        logoFile: null,
        imageSize: 200,
        logoSize: 100
    };

    // 閲嶇疆鏍峰紡閫夋嫨
styleBtns.forEach(btn => {
        if (btn.dataset.style === 'full') {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    updatePreview();
}

// ===== 宸ュ叿鍑芥暟 =====
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// ===== 棰勮鍖哄煙娴姩鏁堟灉绠＄悊 =====
/**
 * 璁板綍棰勮鍖哄煙鐨勫垵濮嬩綅缃? */
function recordPreviewInitialPosition() {
    // 鍙湪妗岄潰绔墽琛?
if (window.innerWidth < 1024) return;

    // 濡傛灉棰勮鍖哄煙涓嶅彲瑙侊紝涓嶉渶瑕佽褰?
if (previewSection.style.display === 'none') return;

    // 鑾峰彇棰勮鍖哄煙鐩稿浜庢枃妗ｇ殑浣嶇疆
const rect = previewSection.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    previewInitialPosition = {
        // 鍏冪礌璺濈鏂囨。椤堕儴鐨勭粷瀵硅窛绂?
offsetTop: rect.top + scrollTop,
        // 鍏冪礌宸︿晶璺濈瑙嗗彛宸﹁竟鐨勮窛绂?
left: rect.left,
        // 鍏冪礌瀹藉害
width: rect.width,
        // 鍏冪礌楂樺害
height: rect.height
    };

    }

/**
 * 澶勭悊棰勮鍖哄煙鐨勬粴鍔ㄨ窡闅忔晥鏋? */
function handlePreviewScroll() {
    // 鍙湪妗岄潰绔墽琛?
if (window.innerWidth < 1024) {
        // 绉诲姩绔Щ闄ゆ诞鍔ㄦ晥鏋?
if (isPreviewFloating) {
            removeFloatingEffect();
        }
        return;
    }

    // 濡傛灉棰勮鍖哄煙涓嶅彲瑙佹垨娌℃湁璁板綍鍒濆浣嶇疆锛屼笉澶勭悊
if (previewSection.style.display === 'none' || !previewInitialPosition) return;

    const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;

    // 璁＄畻棰勮鍖哄煙椤堕儴璺濈瑙嗗彛椤堕儴鐨勮窛绂?
// 棰勮鍖哄煙鍦ㄦ枃妗ｄ腑鐨勪綅缃?- 褰撳墠婊氬姩璺濈 = 棰勮鍖哄煙椤堕儴璺濈瑙嗗彛椤堕儴鐨勮窛绂?
const distanceToViewportTop = previewInitialPosition.offsetTop - currentScrollTop;

    // 鍒ゆ柇鏄惁闇€瑕佸惎鐢ㄦ诞鍔ㄦ晥鏋?
// 褰撻瑙堝尯鍩熼《閮ㄥ嵆灏嗚瑙嗗彛椤堕儴閬洊鏃讹紙璺濈灏忎簬绛変簬璁惧畾鐨勮竟璺濓級
    const shouldFloat = distanceToViewportTop <= FLOATING_TOP_MARGIN;

    if (shouldFloat && !isPreviewFloating) {
        // 搴旂敤娴姩鏁堟灉
applyFloatingEffect();
    } else if (!shouldFloat && isPreviewFloating) {
        // 绉婚櫎娴姩鏁堟灉
removeFloatingEffect();
    }
}

/**
 * 搴旂敤娴姩鏁堟灉
 */
function applyFloatingEffect() {
    if (!previewInitialPosition) return;

    isPreviewFloating = true;

    // 娣诲姞娴姩绫?
previewSection.classList.add('floating');

    // 璁剧疆fixed瀹氫綅鐨勪綅缃拰灏哄
previewSection.style.position = 'fixed';
    previewSection.style.top = `${FLOATING_TOP_MARGIN}px`; // 浣跨敤鍥哄畾鐨勯《閮ㄨ竟璺?
previewSection.style.left = `${previewInitialPosition.left}px`; // 浣跨敤left淇濇寔宸﹀彸浣嶇疆涓嶅彉
    previewSection.style.width = `${previewInitialPosition.width}px`;

    }

/**
 * 绉婚櫎娴姩鏁堟灉
 */
function removeFloatingEffect() {
    isPreviewFloating = false;

    // 绉婚櫎娴姩绫?
previewSection.classList.remove('floating');

    // 鎭㈠鍘熷瀹氫綅
previewSection.style.position = '';
    previewSection.style.top = '';
    previewSection.style.left = '';
    previewSection.style.width = '';

    }

/**
 * 绐楀彛澶у皬鏀瑰彉鏃堕噸鏂拌褰曚綅缃? */
function handleWindowResize() {
    // 濡傛灉褰撳墠澶勪簬娴姩鐘舵€侊紝鍏堢Щ闄ゆ诞鍔ㄦ晥鏋?
if (isPreviewFloating) {
        removeFloatingEffect();
    }

    // 閲嶆柊璁板綍鍒濆浣嶇疆
previewInitialPosition = null;

    // 寤惰繜涓€甯у悗璁板綍鏂颁綅缃紝纭繚甯冨眬宸叉洿鏂?
requestAnimationFrame(() => {
        if (previewSection.style.display !== 'none') {
            recordPreviewInitialPosition();
            adjustPreviewPosition();
        }
    });
}

// ===== 棰勮鍖哄煙婊氬姩璺熼殢 =====
function adjustPreviewPosition() {
    // 鍙湪妗岄潰绔墽琛岋紙绐楀彛瀹藉害澶т簬1024px锛?
    if (window.innerWidth < 1024) return;

    // 濡傛灉棰勮鍖哄煙涓嶅彲瑙侊紝涓嶉渶瑕佽皟鏁?
    if (previewSection.style.display === 'none') return;

    // 移除高度限制，改为在CSS中通过preview-container的max-height控制
    // 这样可以保证preview-container内部可以滚动
    previewSection.style.maxHeight = 'none';
    previewSection.style.overflowY = 'visible';
}

// ===== 鍒濆鍖栧簲鐢?=====
document.addEventListener('DOMContentLoaded', () => {
    // 初始化水印文字：优先使用输入框的值，否则使用 data-default-text
    const defaultText = watermarkText.getAttribute('data-default-text') || '\u6c34\u5370\u6587\u5b57';
    if (!watermarkText.value) { watermarkText.value = defaultText; }
    watermarkSettings.text = watermarkText.value;
    // 娣诲姞鍒濆鐘舵€佹牱寮忕被
mainContent.classList.add('initial-state');

    initEventListeners();

    // 鐩戝惉婊氬姩浜嬩欢 - 浣跨敤鏂扮殑娴姩鏁堟灉澶勭悊鍑芥暟
window.addEventListener('scroll', handlePreviewScroll);

    // 鐩戝惉绐楀彛澶у皬鍙樺寲
window.addEventListener('resize', handleWindowResize);

    // 鐩戝惉棰勮鍖哄煙鐨勫唴瀹瑰彉鍖?
const resizeObserver = new ResizeObserver(() => {
        adjustPreviewPosition();
        // 濡傛灉棰勮鍖哄煙鍐呭鍙樺寲锛岄噸鏂拌褰曚綅缃?
if (previewSection.style.display !== 'none' && !isPreviewFloating) {
            recordPreviewInitialPosition();
        }
    });
    resizeObserver.observe(previewSection);

    });

// ===== PDF鐩稿叧鍑芥暟 =====

/**
 * 鍔犺浇PDF鏂囦欢
 */
async function loadPdfFile(file) {
    try {
        // 璁剧疆PDF.js worker
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        
        // 璇诲彇鏂囦欢涓篈rrayBuffer
        const arrayBuffer = await file.arrayBuffer();
        
        // 鍔犺浇PDF鏂囨。
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        pdfDoc = await loadingTask.promise;
        totalPdfPages = pdfDoc.numPages;
        currentPdfPage = 1;
        
        // 鏄剧ずPDF鎺у埗鎸夐挳
        pdfControls.style.display = 'flex';
        
        // 娓叉煋绗竴椤?
        await renderPdfPage(currentPdfPage);
        
        // 鏇存柊椤电爜鏄剧ず
        updatePageInfo();
    } catch (error) {
        console.error('鍔犺浇PDF澶辫触:', error);
        alert('鍔犺浇PDF澶辫触锛岃閲嶈瘯');
    }
}

/**
 * 娓叉煋鎸囧畾椤电殑PDF
 */
async function renderPdfPage(pageNum) {
    if (!pdfDoc) return;
    
    try {
        // 鑾峰彇鎸囧畾椤?
        const page = await pdfDoc.getPage(pageNum);
        
        // 璁剧疆canvas灏哄
        const viewport = page.getViewport({ scale: 2 });
        previewCanvas.width = viewport.width;
        previewCanvas.height = viewport.height;
        
        // 娓叉煋PDF椤靛埌canvas
        const ctx = previewCanvas.getContext('2d');
        
        // 清空canvas确保完整渲染
        ctx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
        const renderContext = {
            canvasContext: ctx,
            viewport: viewport
        };
        
        await page.render(renderContext).promise;
        
        // 淇濆瓨鍘熷PDF鍥惧儚锛屼互渚垮姞姘村嵃
        originalImageData = ctx.getImageData(0, 0, previewCanvas.width, previewCanvas.height);
        
        // 应用水印到当前PDF页面
        applyWatermarkToCanvas(ctx, previewCanvas.width, previewCanvas.height);
    } catch (error) {
        console.error('娓叉煋PDF椤靛け璐?:', error);
        alert('娓叉煋PDF澶辫触锛岃閲嶈瘯');
    }
}

/**
 * 鏇存柊椤电爜淇℃伅鏄剧ず
 */
function updatePageInfo() {
    currentPageSpan.textContent = currentPdfPage;
    totalPagesSpan.textContent = totalPdfPages;
    
    // 鏇存柊鎸夐挳鐘舵€?
    prevPageBtn.disabled = currentPdfPage <= 1;
    nextPageBtn.disabled = currentPdfPage >= totalPdfPages;
}

/**
 * 鏄剧ず涓婁竴椤?
 */
async function showPreviousPage() {
    if (currentPdfPage <= 1) return;
    currentPdfPage--;
    await renderPdfPage(currentPdfPage);
    updatePageInfo();
}

/**
 * 鏄剧ず涓嬩竴椤?
 */
async function showNextPage() {
    if (currentPdfPage >= totalPdfPages) return;
    currentPdfPage++;
    await renderPdfPage(currentPdfPage);
    updatePageInfo();
}

/**
 * 閲嶇疆PDF鐘舵€?
 */
function resetPdfState() {
    pdfDoc = null;
    currentPdfPage = 1;
    totalPdfPages = 0;
    pdfControls.style.display = 'none';
}













