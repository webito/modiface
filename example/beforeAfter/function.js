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
const currentLookStep = [{
    category: 'lipcolor', color_a: 204, color_r: 193, color_g: 60, color_b: 60, intensity: 0.8,
}];

function resetSlider() {
    document.getElementById('compare-slider').style.display = 'none';
    document.getElementById('compare-slider').style.left = '50%';
    document.getElementById('canvas').style.width = '50%';
}

function adjustMargin(id, idRendered) {
    const canvasDiv = document.getElementById(id);
    const canvas = canvasDiv.firstChild;
    const dashboard = document.getElementById('dashboard-container');
    let leftDist = dashboard.clientHeight * canvas.width / canvas.height;
    leftDist = (dashboard.clientWidth - leftDist) / 2;
    canvasDiv.querySelector('canvas').style.left = Math.round(leftDist);
    document.getElementById(idRendered).querySelector('canvas').style.left = Math.round(leftDist);
}

async function startLive() {
    if (currentMode === 'PHOTO_MODE') {
        resetSlider();
        await window.MFE_VTO.destroyPhotoModule();
    }
    currentMode = 'LIVE_MODE';
    await window.MFE_VTO.startLiveMode();
    const canvas = await window.MFE_VTO.setLiveLook({ lookId: 'canvas', lookObject: currentLookStep });
    const originalCanvas = await window.MFE_VTO.setLiveLook({ lookId: 'canvas-original', lookObject: [] });
    canvas.renderedCanvas.style.height = '100%';
    originalCanvas.renderedCanvas.style.height = '100%';
    document.getElementById('canvas').appendChild(canvas.renderedCanvas);
    document.getElementById('canvas-orig').appendChild(originalCanvas.renderedCanvas);
    document.getElementById('compare-slider').style.display = 'block';
    adjustMargin('canvas-orig', 'canvas');
}

async function startPhoto() {
    if (currentMode === 'LIVE_MODE') {
        resetSlider();
        await window.MFE_VTO.stopLiveMode();
        await window.MFE_VTO.destroyLiveModule();
    }
    currentMode = 'PHOTO_MODE';
    await window.MFE_VTO.startPhotoMode(imgUri);
    const canvas = await window.MFE_VTO.setPhotoLook({ lookId: 'canvas', lookObject: currentLookStep });
    const originalCanvas = await window.MFE_VTO.getPhotoOriginalCanvas();
    canvas.renderedCanvas.style.height = '100%';
    originalCanvas.style.height = '100%';
    document.getElementById('canvas').appendChild(canvas.renderedCanvas);
    document.getElementById('canvas-orig').appendChild(originalCanvas);
    document.getElementById('compare-slider').style.display = 'block';
    adjustMargin('canvas-orig', 'canvas');
}

function clamp(n, min, max) {
    return Math.max(Math.min(n, max), min);
}

function mouseSlide(event) {
    if (event.currentTarget === event.target) return;

    const target = event.currentTarget;

    const max = document.getElementById('dashboard-container').clientWidth;
    const mouseX = event.clientX;
    let startX = window.getComputedStyle(target).left;
    startX = parseFloat(startX); // already in px

    const onMouseMove = (e) => {
        const leftDistance = `${clamp(startX + (e.clientX - mouseX), 0, max) / max * 100}%`;
        document.getElementById('canvas').style.width = leftDistance;
        document.getElementById('compare-slider').style.left = leftDistance;
    };

    document.addEventListener('mousemove', onMouseMove);

    target.onmouseup = () => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', target.onmouseup);
        target.onmouseup = null;
    };
    document.addEventListener('mouseup', target.onmouseup);
}
