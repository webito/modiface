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
let currentMode = null;
const currentLookObj = [{
    category: 'lipcolor', color_a: 204, color_r: 193, color_g: 60, color_b: 60, intensity: 0.8,
}];

async function startLive() {
    if (currentMode === 'PHOTO_MODE') {
        await window.MFE_VTO.destroyPhotoModule();
    }
    currentMode = 'LIVE_MODE';
    await window.MFE_VTO.startLiveMode();
    const canvas = await window.MFE_VTO.setLiveLook({ lookId: 'canvas', lookObject: currentLookObj });
    if (canvas.renderedCanvas.width > canvas.renderedCanvas.height) {
        canvas.renderedCanvas.style.height = '100%';
    } else {
        canvas.renderedCanvas.style.width = '100%';
    }
    document.getElementById('canvas').appendChild(canvas.renderedCanvas);
}

async function startPhoto() {
    if (currentMode === 'LIVE_MODE') {
        await window.MFE_VTO.stopLiveMode();
        await window.MFE_VTO.destroyLiveModule();
    }
    currentMode = 'PHOTO_MODE';
    // set the image in photo mode
    await window.MFE_VTO.startPhotoMode(imgUri);
    const canvas = await window.MFE_VTO.setPhotoLook({ lookId: 'canvas', lookObject: currentLookObj });
    canvas.renderedCanvas.style.height = '100%';
    document.getElementById('canvas').appendChild(canvas.renderedCanvas);
}

// crops base 64 to the size of the live canvas
function cropImg(base64Img) {
    return new Promise((resolve) => {
        const origCanvas = document.getElementById('canvas').children[0];
        const croppedCanvas = document.getElementById('canvas');

        const xShift = (origCanvas.offsetWidth - croppedCanvas.offsetWidth) / 2;
        const yShift = (origCanvas.offsetHeight - croppedCanvas.offsetHeight) / 2;

        const newCanvas = document.createElement('canvas');
        newCanvas.width = croppedCanvas.offsetWidth;
        newCanvas.height = croppedCanvas.offsetHeight;
        const ctx = newCanvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
            ctx.drawImage(img, -xShift, -yShift, origCanvas.offsetWidth, origCanvas.offsetHeight);
            resolve(newCanvas.toDataURL());
        };
        img.src = base64Img;
    });
}

// also console logs base 64
async function downloadImg() {
    if (currentMode === 'PHOTO_MODE') {
        const base64Img = await window.MFE_VTO.getPhotoAfter({ lookId: 'canvas' });
        document.getElementById('dl-to-cmp').href = base64Img;
        document.getElementById('dl-to-cmp').click();
        console.log(base64Img);
    }
    if (currentMode === 'LIVE_MODE') {
        const base64Img = await window.MFE_VTO.getLiveAfter({ lookId: 'canvas' });
        const croppedImg = await cropImg(base64Img);
        document.getElementById('dl-to-cmp').href = croppedImg;
        document.getElementById('dl-to-cmp').click();
        console.log(croppedImg);
    }
}

function timedDownloadImg() {
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
