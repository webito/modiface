async function startPhoto() {
    const ele = document.getElementById('adjust-container');
    if (ele) ele.remove();
    document.getElementById('coord-buttons').style.display = 'none';

    // Append rendered photo
    adjustableCoords = await window.MFE_VTO.startPhotoMode(imgUri);
    const canvas = await window.MFE_VTO.setPhotoLook({ lookId: 'LOOK', lookObject: currentLookObj });
    document.getElementById('canvas-container').appendChild(canvas.renderedCanvas);
    renderedCanvasHeight = canvas.renderedCanvas.height;
    renderedCanvasWidth = canvas.renderedCanvas.width;

    // Initialize coordinates
    savedCoords = window.MFE_VTO.getOriginalCoords();
    document.getElementById('adjust-buttons').style.display = 'block';
}

function setMask() {
    const canv = document.getElementById('mask');
    Object.assign(canv.style, {
        position: 'absolute',
        ...maskStyle(adjustableCoords, canv),
    });
}

function createCoordinateDiv(x, y, i, dotFeature = feature) {
    const ele = document.createElement('div');
    ele.setAttribute('class', 'div-dot');
    const canvasToContainerCoord = newTransform.transform([x, y]);
    Object.assign(ele.style, {
        position: 'absolute',
        top: canvasToContainerCoord[1],
        left: canvasToContainerCoord[0],
    });

    // Drag element
    ele.onmousedown = (event) => {
        const target = event.currentTarget;

        const maxX = document.getElementById('canvas-container').clientWidth;
        const mouseX = event.clientX;
        let startX = window.getComputedStyle(target).left;
        startX = parseFloat(startX);
        const maxY = document.getElementById('canvas-container').clientHeight;
        const mouseY = event.clientY;
        let startY = window.getComputedStyle(target).top;
        startY = parseFloat(startY);

        const onMouseMove = (e) => {
            const leftDist = `${clamp(startX + (e.clientX - mouseX), 0, maxX)}px`;
            const topDist = `${clamp(startY + (e.clientY - mouseY), 0, maxY)}px`;
            target.style.left = leftDist;
            target.style.top = topDist;

            // adjust canvas mask
            adjustableCoords.facePoints[dotFeature][i] = {
                ...containerCoordToCanvas(leftDist, topDist),
            };
            setMask();
        };

        document.addEventListener('mousemove', onMouseMove);

        target.onmouseup = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', target.onmouseup);
            target.onmouseup = null;
        };
        document.addEventListener('mouseup', target.onmouseup);
    };
    document.getElementById('adjust-container').appendChild(ele);
}

function cancel() {
    // Remove adjustment container
    const ele = document.getElementById('adjust-container');
    if (ele) ele.remove();

    // Reset buttons
    document.getElementById('coord-buttons').style.display = 'none';
    document.getElementById('mouth-open-chk').style.display = 'none';
    document.getElementById('adjust-buttons').style.display = 'block';
}

async function saveCoords() {
    const origCoords = window.MFE_VTO.getOriginalCoords();

    savedCoords.facePoints[feature] = adjustableCoords.facePoints[feature].map(coord => coord);
    if (feature === 'extendedOuterMouth2D') {
        savedCoords.mouthopen = adjustableCoords.mouthopen;
        if (savedCoords.mouthopen === false) {
            const origFP = origCoords.facePoints;
            savedCoords.facePoints.innerMouth2D = origFP.innerMouth2D.map(coord => coord);
        } else {
            const adjFP = adjustableCoords.facePoints;
            savedCoords.facePoints.innerMouth2D = adjFP.innerMouth2D.map(coord => coord);
        }
    }

    await window.MFE_VTO.setCoordinate(savedCoords);
    cancel();
}

async function revertToOriginal() {
    const origCoords = window.MFE_VTO.getOriginalCoords();
    const ele = document.getElementsByClassName('div-dot');
    let canvasToContainer;

    // Retrieve original coords
    const origFP = origCoords.facePoints;
    const adjFP = adjustableCoords.facePoints;
    adjFP[feature] = origFP[feature].map(coord => coord);
    if (feature === 'extendedOuterMouth2D') {
        adjFP.innerMouth2D = origFP.innerMouth2D.map(coord => coord);
    }

    // Loop through all dots for reset
    for (let i = 0; i < ele.length; i += 1) {
        if (i < adjFP[feature].length) {
            const featureCoord = adjFP[feature][i];
            canvasToContainer = newTransform.transform([featureCoord.x, featureCoord.y]);
        } else {
            if (adjustableCoords.mouthopen === false) break;
            const innerlipCoord = adjFP.innerMouth2D[i - adjFP[feature].length];
            canvasToContainer = newTransform.transform([innerlipCoord.x, innerlipCoord.y]);
        }
        Object.assign(ele[i].style, {
            position: 'absolute',
            top: canvasToContainer[1],
            left: canvasToContainer[0],
        });
    }
    setMask();
}

async function centerFeature(feature, scale) {
    const canvasContainer = document.getElementById('canvas-container');
    const simImg = document.createElement('img');
    simImg.setAttribute('draggable', 'false');
    document.getElementById('adjust-container').appendChild(simImg);

    // Find top left point and bottom right point
    const coords = window.MFE_VTO.getOriginalCoords();

    const lipCoords = coords.facePoints[feature];
    const boxCoords = getbox(lipCoords);
    const topLeft = boxCoords.slice(0, 2);
    const bottomRight = boxCoords.slice(2, 4);

    // Centers feature
    newTransform = new TransformCoordinatesForFace(topLeft, bottomRight,
        renderedCanvasWidth, renderedCanvasHeight, canvasContainer.offsetWidth,
        canvasContainer.offsetHeight, scale);
    const centerFeatureCSS = newTransform.getCSSTransformStyle();
    const originalCanvas = await window.MFE_VTO.getPhotoOriginalCanvas();
    simImg.src = originalCanvas.toDataURL();
    Object.assign(simImg.style, {
        position: 'absolute',
        top: 0,
        left: 0,
        ...centerFeatureCSS,
    });
}

function toggleMouth() {
    if (adjustableCoords.mouthopen === true) {
        // Remove all inner lips dots
        const ele = document.getElementsByClassName('div-dot');
        adjustableCoords.facePoints.innerMouth2D.forEach(() => {
            ele[adjustableCoords.facePoints.extendedOuterMouth2D.length].remove();
        });
    } else {
        // Create inner lip dots
        adjustableCoords.facePoints.innerMouth2D.forEach((coord, i) => {
            createCoordinateDiv(coord.x, coord.y, i, 'innerMouth2D');
        });
    }
    adjustableCoords.mouthopen = !adjustableCoords.mouthopen;
    // Adjust mask
    setMask();
}

function adjustFeature(currFeature) {
    // Set global variable
    feature = currFeature;

    // Create a div to place all of the adjustable components in
    const ele = document.createElement('div');
    ele.setAttribute('id', 'adjust-container');
    document.getElementById('canvas-container').appendChild(ele);

    // Zoom into feature
    centerFeature(feature, zoomFactor[feature]);

    // Adjustable canvas mask
    const canv = document.createElement('canvas');
    canv.width = document.getElementById('canvas-container').offsetWidth;
    canv.height = document.getElementById('canvas-container').offsetHeight;
    canv.setAttribute('class', 'mask');
    canv.setAttribute('id', 'mask');

    const maskFeatureCSS = maskStyle(savedCoords, canv);
    Object.assign(canv.style, {
        position: 'absolute',
        ...maskFeatureCSS,
    });
    ele.appendChild(canv);

    // Create movable div for each coordinate
    const adjFP = adjustableCoords.facePoints;
    adjustableCoords.mouthopen = savedCoords.mouthopen;
    adjFP.innerMouth2D = savedCoords.facePoints.innerMouth2D.map(coord => coord);
    adjFP[feature] = savedCoords.facePoints[feature].map(coord => coord);
    adjFP[feature].forEach((coord, i) => {
        createCoordinateDiv(coord.x, coord.y, i);
    });

    // Directives for innerlip: automatically show
    document.getElementById('toggle-mouth').checked = savedCoords.mouthopen;
    if (currFeature === 'extendedOuterMouth2D' && savedCoords.mouthopen === true) {
        adjustableCoords.mouthopen = false;
        toggleMouth();
    }

    // Button display
    document.getElementById('coord-buttons').style.display = 'block';
    document.getElementById('adjust-buttons').style.display = 'none';
    if (feature === 'extendedOuterMouth2D') document.getElementById('mouth-open-chk').style.display = 'block';
}
