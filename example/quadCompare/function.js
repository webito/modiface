const domain = window.location.hostname;
const portNumber = window.location.port;
const { pathname } = window.location;

window.MFE_VTO.init({
    config: {
        // libraryInfo object could be configured alternatively
        // based on your library hosting location. Example:
        libraryInfo: {
            domain: domain + (portNumber ? `:${portNumber}` : ''),
            path: pathname + (pathname[pathname.length - 1] === '/' ? '../../' : '/../../../'),
            version: '',
            maskPrefix: '../../mask_images/',
            assetPrefix: '../../dist/assets/',
        },
        moduleMode: 'Makeup',
    },
});

const lookObjInput = {
    red: {
        name: 'Test Prod 1',
        product: [{
            category: 'lipcolor', color_a: 204, color_r: 193, color_g: 60, color_b: 60, intensity: 0.8, placement: 'default',
        }],
    },
    pink: {
        name: 'Test Prod 2',
        product: [{
            category: 'lipcolor', color_a: 204, color_r: 229, color_g: 126, color_b: 188, intensity: 0.8, placement: 'default',
        }],
    },
    darkPurple: {
        name: 'Test Prod 3',
        product: [{
            category: 'lipcolor', color_a: 204, color_r: 84, color_g: 32, color_b: 142, intensity: 0.8, placement: 'default',
        }],
    },
    lightPurple: {
        name: 'Test Prod 4',
        product: [{
            category: 'lipcolor', color_a: 204, color_r: 141, color_g: 47, color_b: 214, intensity: 0.8, placement: 'default',
        }],
    },
};

let currentLookInfo = lookObjInput.red;
let currentMode = null;
const quadCanvasIds = ['single-look-0', 'single-look-1', 'single-look-2', 'single-look-3'];
const quadLabelIds = ['single-label-0', 'single-label-1', 'single-label-2', 'single-label-3'];

const lookQueue = {
    size: 0,
    info: [],
};

function displayQuadCanvas() {
    // Clear Quad Canvas
    for (let i = 0; i < 4; i += 1) {
        document.getElementById(quadLabelIds[i]).style.display = 'none';
        const displayedCanvas = document.getElementById(quadCanvasIds[i]).querySelector('canvas');
        if (!displayedCanvas) break;
        displayedCanvas.remove();
    }
    // Append looks onto Quad Canvas
    for (let i = 0; i < lookQueue.size; i += 1) {
        const singleCanvas = lookQueue.info[i].lookCanvas.renderedCanvas;
        document.getElementById(quadCanvasIds[i]).appendChild(singleCanvas);
        document.getElementById(quadLabelIds[i]).textContent = lookQueue.info[i].name;
        document.getElementById(quadLabelIds[i]).style.display = 'inline-block';
    }
}

async function insertLookNodeAndDisplay(newLookInfo) {
    let nextLookId;
    let canvas;

    if (lookQueue.size < 4) {
        nextLookId = `LOOK-${lookQueue.size}`;
    } else {
        let oldLookInfo = lookQueue.info.pop();
        lookQueue.size -= 1;
        nextLookId = oldLookInfo.id;
        oldLookInfo = null;
    }

    // Create rendered canvas
    if (currentMode === 'LIVE_MODE') {
        canvas = await window.MFE_VTO.setLiveLook({
            lookId: nextLookId,
            lookObject: newLookInfo.product,
        });
    } else {
        canvas = await window.MFE_VTO.setPhotoLook({
            lookId: nextLookId,
            lookObject: newLookInfo.product,
        });
    }
    canvas.renderedCanvas.style.height = '100%';

    const lookInfoNode = {
        name: newLookInfo.name,
        id: nextLookId,
        lookCanvas: canvas,
    };
    lookQueue.info.unshift(lookInfoNode);
    lookQueue.size += 1;
    displayQuadCanvas();
}

function emptyLookQueue() {
    lookQueue.info = [];
    lookQueue.size = 0;
}

function getImgDimensions(file) {
    return new Promise(((resolve) => {
        const img = new Image();
        img.onload = () => {
            resolve(img.height);
        };
        img.src = file.imgUri;
    }));
}

async function startLive() {
    if (currentMode === 'PHOTO_MODE') {
        await window.MFE_VTO.destroyPhotoModule();
        for (let i = 0; i < 4; i += 1) {
            document.getElementById(quadLabelIds[i]).style.display = 'none';
        }
    } else if (currentMode === 'LIVE_MODE') return;
    emptyLookQueue();
    currentMode = 'LIVE_MODE';
    await window.MFE_VTO.startLiveMode();
    insertLookNodeAndDisplay(currentLookInfo);
}

async function startPhoto() {
    if (currentMode === 'LIVE_MODE') {
        await window.MFE_VTO.stopLiveMode();
        await window.MFE_VTO.destroyLiveModule();
        for (let i = 0; i < 4; i += 1) {
            document.getElementById(quadLabelIds[i]).style.display = 'none';
        }
    } else if (currentMode === 'PHOTO_MODE') return;
    emptyLookQueue();
    currentMode = 'PHOTO_MODE';
    await window.MFE_VTO.startPhotoMode(imgUri);
    insertLookNodeAndDisplay(currentLookInfo);
}

async function changeLook(color) {
    // Check if makeup color changed
    if (currentLookInfo.name === lookObjInput[color].name) return;
    currentLookInfo = lookObjInput[color];
    // Check if look queue is not empty
    if (lookQueue.size !== 0) {
        insertLookNodeAndDisplay(currentLookInfo);
    }
}

function drawGrid(canvas, lineWidth, lineColor) {
    // draw a 2x2 grid
    const context = canvas.getContext('2d');
    context.strokeStyle = lineColor;
    context.lineWidth = lineWidth;

    // to reduce line blurring, shift by 0.5px
    const canvHalf = {
        w: parseInt(canvas.width / 2, 10) + 0.5,
        h: parseInt(canvas.height / 2, 10) + 0.5,
    };

    // vertical line
    context.beginPath();
    context.moveTo(canvHalf.w, 0);
    context.lineTo(canvHalf.w, canvas.height);
    context.stroke();

    // horizontal line
    context.beginPath();
    context.moveTo(0, canvHalf.h);
    context.lineTo(canvas.width, canvHalf.h);
    context.stroke();

    // border
    context.strokeRect(lineWidth / 2, lineWidth / 2,
        canvas.width - lineWidth, canvas.height - lineWidth);
}

// crops base 64 to position in image cells
function cropImg(canvas, base64Img) {
    return new Promise((resolve) => {
        const cellHeight = canvas.height / 2;
        const croppedCanvas = document.getElementById('single-look-0'); // cell

        const imgHeight = cellHeight * 0.8;
        const imgWidth = imgHeight * (croppedCanvas.offsetWidth / croppedCanvas.offsetHeight);

        // create new image canvas
        const newCanvas = document.createElement('canvas');
        newCanvas.width = imgWidth;
        newCanvas.height = imgHeight;
        const ctx = newCanvas.getContext('2d');
        const img = new Image();

        // return new image canvas
        img.onload = () => {
            ctx.drawImage(img, 0, 0, imgWidth, imgHeight);
            resolve(newCanvas);
        };
        img.src = base64Img;
    });
}

function drawCell(canvas, croppedImg, drawPos, currentName) {
    const quadContainer = document.getElementById('quad-container');
    const ctx = canvas.getContext('2d');
    const cellHeight = canvas.height / 2;

    const label = document.getElementById('single-label-0');
    const canvasLabel = document.createElement('canvas');
    const ctxLabel = canvasLabel.getContext('2d');
    canvasLabel.width = cellHeight;
    canvasLabel.height = cellHeight * 0.2;

    const style = getComputedStyle(label);
    const origFontSize = parseFloat(style.fontSize);

    const fontScale = Math.ceil(cellHeight / quadContainer.offsetHeight * 1.8);
    const fontSize = origFontSize * fontScale;
    ctxLabel.font = `${fontSize}px ${style.fontFamily}`;
    const textWidth = ctx.measureText(currentName).width;
    ctxLabel.fillText(currentName, (canvasLabel.width / 2)
        - (textWidth * fontScale / 2), canvasLabel.height / 2);

    ctx.drawImage(canvasLabel, ...drawPos);
    drawPos[1] += canvasLabel.height;
    ctx.drawImage(croppedImg, ...drawPos);
}

async function drawQuadImg() {
    // assume all images and their containers have the same dimensions
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const origImgHeight = await getImgDimensions(imgUri);

    canvas.width = origImgHeight * 2;
    canvas.height = origImgHeight * 2;
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const drawPos = [
        [0, 0], // top left
        [canvas.width / 2, 0], // top right
        [0, canvas.height / 2], // bottom left
        [canvas.width / 2, canvas.height / 2], // bottom right
    ];

    return new Promise((async (resolve) => {
        if (currentMode === 'LIVE_MODE') await window.MFE_VTO.stopLiveMode();

        // get base64 images using get photo / live after
        const base64ImgPromise = [];
        for (let i = 0; i < 4; i += 1) {
            if (!document.getElementById(quadCanvasIds[i]).querySelector('canvas')) break;
            if (currentMode === 'PHOTO_MODE') {
                base64ImgPromise.push(window.MFE_VTO.getPhotoAfter(
                    { lookId: lookQueue.info[i].id },
                ));
            }
            if (currentMode === 'LIVE_MODE') {
                base64ImgPromise.push(window.MFE_VTO.getLiveAfter(
                    { lookId: lookQueue.info[i].id },
                ));
            }
        }
        const base64Img = await Promise.all(base64ImgPromise);

        // crop images
        if (currentMode === 'LIVE_MODE') await window.MFE_VTO.startLiveMode();
        const croppedImgPromise = [];
        for (let i = 0; i < 4; i += 1) {
            if (!document.getElementById(quadCanvasIds[i]).querySelector('canvas')) break;
            croppedImgPromise.push(cropImg(canvas, base64Img[i]));
        }
        const croppedImg = await Promise.all(croppedImgPromise);

        // draw canvas
        for (let i = 0; i < croppedImg.length; i += 1) {
            drawCell(canvas, croppedImg[i], drawPos[i], lookQueue.info[i].name);
        }
        drawGrid(canvas, 5, 'black');

        resolve(canvas.toDataURL());
    }));
}

function parseBase64(base64) {
    const parsed = base64.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,(.*)/);
    if (!parsed) {
        // no match, assume already in base64 data format
        return {
            b64Data: base64,
            contentType: '',
        };
    }
    return {
        b64Data: parsed[2],
        contentType: parsed[1],
    };
}

// source: https://github.com/jeremyBanks/b64-to-blob
function b64ToBlob({ b64Data, contentType = '', sliceSize = 512 }) {
    const byteCharacters = window.atob(b64Data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        const slice = byteCharacters.slice(offset, offset + sliceSize);

        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i += 1) {
            byteNumbers[i] = slice.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNumbers);

        byteArrays.push(byteArray);
    }

    const blob = new Blob(byteArrays, { type: contentType });
    return blob;
}

async function downloadImg() {
    const base64Img = await drawQuadImg();
    const base64Info = parseBase64(base64Img);
    document.getElementById('dl-to-cmp').href = URL.createObjectURL(b64ToBlob(base64Info));
    document.getElementById('dl-to-cmp').click();
    console.log(base64Img);
}

async function timedDownloadImg() {
    if (currentMode === 'LIVE_MODE') {
        document.getElementById('loading-overlay').style.display = 'block';
        document.getElementById('countdown').style.display = 'block';
        let seconds = 3;
        document.getElementById('countdown').textContent = seconds;
        const countdown = setInterval(async () => {
            seconds -= 1;
            if (seconds <= 0) {
                clearInterval(countdown);
                document.getElementById('countdown').textContent = '';
                document.getElementById('instant-dl-btn').click();
                document.getElementById('countdown').style.display = 'none';
                document.getElementById('loading-overlay').style.display = 'none';
                return;
            }
            document.getElementById('countdown').textContent = seconds;
        }, 1000);
    }
}
