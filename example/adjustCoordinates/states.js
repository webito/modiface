let renderedCanvasWidth; let renderedCanvasHeight; let savedCoords; let
    feature; let adjustableCoords;
const currentLookObj = [{
    category: 'mascara', color_a: 204, color_r: 255, color_g: 0, color_b: 0, intensity: 0.8, placement: 'extreme',
},
{
    category: 'lipcolor', color_a: 204, color_r: 193, color_g: 60, color_b: 60, intensity: 0.8, placement: 'default',
},
{
    category: 'brow', color_a: 204, color_r: 255, color_g: 0, color_b: 0, intensity: 0.8, placement: 'default',
}];
const zoomFactor = {
    extendedOuterMouth2D: 0.6,
    leftExtendedEye2D: 0.4,
    rightExtendedEye2D: 0.4,
    leftExtendedBrow2D: 0.4,
    rightExtendedBrow2D: 0.4,
};
let newTransform;
