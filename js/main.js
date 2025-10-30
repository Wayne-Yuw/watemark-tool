// ===== 全局变量 =====
let uploadedFile = null;
let currentFileType = null;
let originalImageData = null; // 保存原始图像
let watermarkSettings = {
    type: 'text',
    text: '水印文字',
    fontSize: 24,
    fontColor: '#000000',
    style: 'full',
    position: 'center',
    spacing: 50,
    opacity: 50,
    rotation: -45,
    imageFile: null,
    logoFile: null,
    imageSize: 200,
    logoSize: 100
};

// 预览区域浮动相关变量
let previewInitialPosition = null; // 记录预览区域初始位置
let isPreviewFloating = false; // 是否处于浮动状态
const FLOATING_TOP_MARGIN = 20; // 浮动状态下与浏览器顶部的边距（px）

// ===== DOM元素 =====
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

// Tab切换元素
const tabBtns = document.querySelectorAll('.tab-btn');
const tabPanels = document.querySelectorAll('.tab-panel');

// 样式选择按钮
const styleBtns = document.querySelectorAll('.style-btn');
const positionSelector = document.getElementById('positionSelector');
const positionBtns = document.querySelectorAll('.position-btn');

// 表单元素
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

// 按钮元素
const applyBtn = document.getElementById('applyBtn');
const resetBtn = document.getElementById('resetBtn');
const downloadBtn = document.getElementById('downloadBtn');

// ===== 初始化事件监听 =====
function initEventListeners() {
    // 上传按钮点击
    uploadBtn.addEventListener('click', () => fileInput.click());
    changeFileBtn.addEventListener('click', () => fileInput.click());
    clearFileBtn.addEventListener('click', clearAllAndReset);

    // 文件选择
    fileInput.addEventListener('change', handleFileSelect);

    // 拖拽上传
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
    uploadArea.addEventListener('click', (e) => {
        if (e.target === uploadArea || uploadArea.contains(e.target)) {
            fileInput.click();
        }
    });

    // Tab切换
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    // 样式选择
    styleBtns.forEach(btn => {
        btn.addEventListener('click', () => selectStyle(btn.dataset.style));
    });

    // 位置选择
    positionBtns.forEach(btn => {
        btn.addEventListener('click', () => selectPosition(btn.dataset.position));
    });

    // 滑动条同步
    syncSliderWithInput(fontSize, fontSizeValue);
    syncSliderWithInput(imageSize, imageSizeValue);
    syncSliderWithInput(logoSize, logoSizeValue);
    syncSliderWithInput(spacing, spacingValue);
    syncSliderWithInput(opacity, opacityValue);
    syncSliderWithInput(rotation, rotationValue);

    // 水印设置变化
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

    // 按钮事件
    applyBtn.addEventListener('click', applyWatermark);
    resetBtn.addEventListener('click', resetSettings);
    downloadBtn.addEventListener('click', downloadFile);
}

// ===== 清除所有内容并重置到初始状态 =====
function clearAllAndReset() {
    // 清除上传的文件
    uploadedFile = null;
    currentFileType = null;
    originalImageData = null;
    fileInput.value = '';

    // 清空文件预览和信息
    filePreview.innerHTML = '';
    fileName.textContent = '';
    fileSize.textContent = '';

    // 清空canvas
    const ctx = previewCanvas.getContext('2d');
    ctx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);

    // 移除浮动效果并清除记录的位置
    if (isPreviewFloating) {
        removeFloatingEffect();
    }
    previewInitialPosition = null;

    // 隐藏文件信息，显示上传区域
    fileInfo.style.display = 'none';
    uploadArea.style.display = 'block';

    // 恢复初始状态的居中样式
    mainContent.classList.add('initial-state');

    // 隐藏设置和预览区域
    settingsSection.style.display = 'none';
    previewSection.style.display = 'none';

    // 重置所有水印设置
    resetSettings();

    // 清空水印图片预览
    imagePreview.innerHTML = '';
    logoPreview.innerHTML = '';
    watermarkImage.value = '';
    logoImage.value = '';
}

// ===== 文件处理函数 =====
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
    // 验证文件类型
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
        alert('请上传 JPG、PNG 或 PDF 格式的文件');
        return;
    }

    // 验证文件大小 (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
        alert('文件大小不能超过 10MB');
        return;
    }

    uploadedFile = file;
    currentFileType = file.type.startsWith('image/') ? 'image' : 'pdf';

    // 更新文件信息显示
    fileName.textContent = file.name;
    fileSize.textContent = formatFileSize(file.size);

    // 显示文件预览
    if (currentFileType === 'image') {
        const reader = new FileReader();
        reader.onload = (e) => {
            filePreview.innerHTML = `<img src="${e.target.result}" alt="预览">`;
            loadImageToCanvas(e.target.result);
        };
        reader.readAsDataURL(file);
    } else {
        filePreview.innerHTML = '<p style="color: #64748b;">PDF 文件</p>';
        // PDF处理将在后续实现
    }

    // 显示文件信息和隐藏上传区域
    uploadArea.style.display = 'none';
    fileInfo.style.display = 'flex';

    // 移除初始状态的居中样式
    mainContent.classList.remove('initial-state');

    // 显示设置和预览区域
    settingsSection.style.display = 'block';
    previewSection.style.display = 'block';

    // 调整预览区域位置和高度，并记录初始位置
    setTimeout(() => {
        adjustPreviewPosition();
        recordPreviewInitialPosition();
    }, 100);
}

function loadImageToCanvas(imageSrc) {
    const img = new Image();
    img.onload = () => {
        // 设置canvas尺寸
        const maxWidth = 800;
        const maxHeight = 600;
        let width = img.width;
        let height = img.height;

        // 按比例缩放
        if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width *= ratio;
            height *= ratio;
        }

        previewCanvas.width = width;
        previewCanvas.height = height;

        const ctx = previewCanvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // 保存原始图像数据
        originalImageData = ctx.getImageData(0, 0, width, height);

        // 应用初始水印
        updatePreview();
    };
    img.src = imageSrc;
}

// ===== 水印图片处理 =====
function handleWatermarkImage(e, type) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
            if (type === 'image') {
                watermarkSettings.imageFile = img;
                imagePreview.innerHTML = `<img src="${event.target.result}" alt="水印图片">`;
            } else {
                watermarkSettings.logoFile = img;
                logoPreview.innerHTML = `<img src="${event.target.result}" alt="Logo">`;
            }
            updatePreview();
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
}

// ===== UI交互函数 =====
function switchTab(tabName) {
    // 更新Tab按钮状态
    tabBtns.forEach(btn => {
        if (btn.dataset.tab === tabName) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // 更新Tab面板显示
    tabPanels.forEach(panel => {
        if (panel.id === tabName + 'Panel') {
            panel.classList.add('active');
        } else {
            panel.classList.remove('active');
        }
    });

    // 更新水印类型
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

    // 显示/隐藏位置选择器
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

// ===== 水印预览更新 =====
function updatePreview() {
    if (!uploadedFile || currentFileType !== 'image' || !originalImageData) return;

    const ctx = previewCanvas.getContext('2d');
    const canvas = previewCanvas;

    // 先恢复原始图像（清除之前的水印）
    ctx.putImageData(originalImageData, 0, 0);

    // 应用新的水印
    applyWatermarkToCanvas(ctx, canvas.width, canvas.height);
}

function applyWatermarkToCanvas(ctx, width, height) {
    // 保存当前状态
    ctx.save();

    // 设置透明度
    ctx.globalAlpha = watermarkSettings.opacity / 100;

    if (watermarkSettings.style === 'single') {
        // 单个水印
        drawSingleWatermark(ctx, width, height);
    } else {
        // 平铺水印
        drawTiledWatermark(ctx, width, height);
    }

    // 恢复状态
    ctx.restore();
}

function drawSingleWatermark(ctx, width, height) {
    const position = watermarkSettings.position;
    let x, y;

    // 计算位置
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
    const rotation = watermarkSettings.rotation;

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
    }

    // 平铺绘制
    for (let y = startY; y < endY; y += spacing + 100) {
        for (let x = startX; x < endX; x += spacing + 200) {
            drawWatermarkAt(ctx, x, y);
        }
    }
}

function drawWatermarkAt(ctx, x, y) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((watermarkSettings.rotation * Math.PI) / 180);

    if (watermarkSettings.type === 'text') {
        // 绘制文字水印
        ctx.font = `${watermarkSettings.fontSize}px Arial`;
        ctx.fillStyle = watermarkSettings.fontColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(watermarkSettings.text, 0, 0);
    } else if (watermarkSettings.type === 'image' && watermarkSettings.imageFile) {
        // 绘制图片水印
        const size = watermarkSettings.imageSize;
        ctx.drawImage(watermarkSettings.imageFile, -size / 2, -size / 2, size, size);
    } else if (watermarkSettings.type === 'logo' && watermarkSettings.logoFile) {
        // 绘制Logo水印
        const size = watermarkSettings.logoSize;
        ctx.drawImage(watermarkSettings.logoFile, -size / 2, -size / 2, size, size);
    }

    ctx.restore();
}

// ===== 应用和下载 =====
function applyWatermark() {
    updatePreview();
    alert('水印已应用到预览！');
}

function downloadFile() {
    if (!previewCanvas) return;

    const link = document.createElement('a');
    link.download = `watermarked_${uploadedFile.name}`;
    link.href = previewCanvas.toDataURL('image/png');
    link.click();
}

function resetSettings() {
    // 重置所有设置
    watermarkText.value = '水印文字';
    fontSize.value = 24;
    fontSizeValue.value = 24;
    fontColor.value = '#000000';
    spacing.value = 50;
    spacingValue.value = 50;
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
        text: '水印文字',
        fontSize: 24,
        fontColor: '#000000',
        style: 'full',
        position: 'center',
        spacing: 50,
        opacity: 50,
        rotation: -45,
        imageFile: null,
        logoFile: null,
        imageSize: 200,
        logoSize: 100
    };

    // 重置样式选择
    styleBtns.forEach(btn => {
        if (btn.dataset.style === 'full') {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    updatePreview();
}

// ===== 工具函数 =====
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// ===== 预览区域浮动效果管理 =====
/**
 * 记录预览区域的初始位置
 */
function recordPreviewInitialPosition() {
    // 只在桌面端执行
    if (window.innerWidth < 1024) return;

    // 如果预览区域不可见，不需要记录
    if (previewSection.style.display === 'none') return;

    // 获取预览区域相对于文档的位置
    const rect = previewSection.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    previewInitialPosition = {
        // 元素距离文档顶部的绝对距离
        offsetTop: rect.top + scrollTop,
        // 元素左侧距离视口左边的距离
        left: rect.left,
        // 元素宽度
        width: rect.width,
        // 元素高度
        height: rect.height
    };

    console.log('预览区域初始位置已记录:', previewInitialPosition);
}

/**
 * 处理预览区域的滚动跟随效果
 */
function handlePreviewScroll() {
    // 只在桌面端执行
    if (window.innerWidth < 1024) {
        // 移动端移除浮动效果
        if (isPreviewFloating) {
            removeFloatingEffect();
        }
        return;
    }

    // 如果预览区域不可见或没有记录初始位置，不处理
    if (previewSection.style.display === 'none' || !previewInitialPosition) return;

    const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;

    // 计算预览区域顶部距离视口顶部的距离
    // 预览区域在文档中的位置 - 当前滚动距离 = 预览区域顶部距离视口顶部的距离
    const distanceToViewportTop = previewInitialPosition.offsetTop - currentScrollTop;

    // 判断是否需要启用浮动效果
    // 当预览区域顶部即将被视口顶部遮盖时（距离小于等于设定的边距）
    const shouldFloat = distanceToViewportTop <= FLOATING_TOP_MARGIN;

    if (shouldFloat && !isPreviewFloating) {
        // 应用浮动效果
        applyFloatingEffect();
    } else if (!shouldFloat && isPreviewFloating) {
        // 移除浮动效果
        removeFloatingEffect();
    }
}

/**
 * 应用浮动效果
 */
function applyFloatingEffect() {
    if (!previewInitialPosition) return;

    isPreviewFloating = true;

    // 添加浮动类
    previewSection.classList.add('floating');

    // 设置fixed定位的位置和尺寸
    previewSection.style.position = 'fixed';
    previewSection.style.top = `${FLOATING_TOP_MARGIN}px`; // 使用固定的顶部边距
    previewSection.style.left = `${previewInitialPosition.left}px`; // 使用left保持左右位置不变
    previewSection.style.width = `${previewInitialPosition.width}px`;

    console.log('预览区域已切换为浮动模式，顶部边距:', FLOATING_TOP_MARGIN, '左侧位置:', previewInitialPosition.left);
}

/**
 * 移除浮动效果
 */
function removeFloatingEffect() {
    isPreviewFloating = false;

    // 移除浮动类
    previewSection.classList.remove('floating');

    // 恢复原始定位
    previewSection.style.position = '';
    previewSection.style.top = '';
    previewSection.style.left = '';
    previewSection.style.width = '';

    console.log('预览区域已恢复正常模式');
}

/**
 * 窗口大小改变时重新记录位置
 */
function handleWindowResize() {
    // 如果当前处于浮动状态，先移除浮动效果
    if (isPreviewFloating) {
        removeFloatingEffect();
    }

    // 重新记录初始位置
    previewInitialPosition = null;

    // 延迟一帧后记录新位置，确保布局已更新
    requestAnimationFrame(() => {
        if (previewSection.style.display !== 'none') {
            recordPreviewInitialPosition();
            adjustPreviewPosition();
        }
    });
}

// ===== 预览区域滚动跟随 =====
function adjustPreviewPosition() {
    // 只在桌面端执行（窗口宽度大于1024px）
    if (window.innerWidth < 1024) return;

    // 如果预览区域不可见，不需要调整
    if (previewSection.style.display === 'none') return;

    const previewRect = previewSection.getBoundingClientRect();
    const viewportHeight = window.innerHeight;

    // 计算预览区域的实际高度
    const previewHeight = previewSection.offsetHeight;

    // 如果预览区域高度超过视窗高度
    if (previewHeight > viewportHeight - 40) {
        // 设置最大高度，确保完整显示在视窗内
        previewSection.style.maxHeight = `${viewportHeight - 40}px`;
        previewSection.style.overflowY = 'auto';
    } else {
        // 如果预览区域可以完整显示，移除最大高度限制
        previewSection.style.maxHeight = 'none';
        previewSection.style.overflowY = 'visible';
    }
}

// ===== 初始化应用 =====
document.addEventListener('DOMContentLoaded', () => {
    // 添加初始状态样式类
    mainContent.classList.add('initial-state');

    initEventListeners();

    // 监听滚动事件 - 使用新的浮动效果处理函数
    window.addEventListener('scroll', handlePreviewScroll);

    // 监听窗口大小变化
    window.addEventListener('resize', handleWindowResize);

    // 监听预览区域的内容变化
    const resizeObserver = new ResizeObserver(() => {
        adjustPreviewPosition();
        // 如果预览区域内容变化，重新记录位置
        if (previewSection.style.display !== 'none' && !isPreviewFloating) {
            recordPreviewInitialPosition();
        }
    });
    resizeObserver.observe(previewSection);

    console.log('文件水印工具已初始化');
});
