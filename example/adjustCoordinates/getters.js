function maskStyle(maskCoords, mask) {
    const maskObj = drawMask({
        canvas: mask,
        imgW: renderedCanvasWidth,
        imgH: renderedCanvasHeight,
        color: 'rgba(0,0,0,0.3)',
        coordinates: maskCoords,
    });
    newCoord = newTransform.transform([maskObj.coords[0], maskObj.coords[1]]);
    transformMatrix = newTransform.getCanvasTransformMatrix();
    return {
        left: `${newCoord[0]}px`,
        top: `${newCoord[1]}px`,
        width: `${maskObj.coords[2] * transformMatrix[0]}px`,
        height: `${maskObj.coords[3] * transformMatrix[3]}px`,
    };
}

function containerCoordToCanvas(coordX, coordY) {
    const x = parseFloat(coordX);
    const y = parseFloat(coordY);
    const centerFeatureCoord = newTransform.inverseTransform([x, y]);
    return {
        x: centerFeatureCoord[0],
        y: centerFeatureCoord[1],
    };
}

// Box around feature
function getbox(pointsArray) {
    let minx; let miny; let maxx; let
        maxy;
    minx = pointsArray[0].x;
    maxx = pointsArray[0].x;
    miny = pointsArray[0].y;
    maxy = pointsArray[0].y;
    for (let i = 1; i < pointsArray.length; i += 1) {
        minx = (minx < pointsArray[i].x) ? minx : pointsArray[i].x;
        miny = (miny < pointsArray[i].y) ? miny : pointsArray[i].y;
        maxx = (maxx > pointsArray[i].x) ? maxx : pointsArray[i].x;
        maxy = (maxy > pointsArray[i].y) ? maxy : pointsArray[i].y;
    }

    return [minx, miny, maxx, maxy];
}
