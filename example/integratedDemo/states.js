const DEFAULT_LIPCOLOR = {
    category: 'lipcolor', color_a: 0, color_r: 255, color_g: 255, color_b: 255, intensity: 0, placement: 'default',
};

const DEFAULT_EYESHADOW = {
    category: 'eyeshadow', color_a: 0, color_r: 255, color_g: 255, color_b: 255, intensity: 0, placement: 'default',
};

const currentLookObj = {
    lipcolor: DEFAULT_LIPCOLOR,
    eyeshadow: DEFAULT_EYESHADOW,
};

const lookObjInput = {
    eyeshadow: {
        gold: {
            category: 'eyeshadow', color_a: 150, color_r: 240, color_g: 160, color_b: 67, intensity: 0.8, placement: 'default',
        },
        bronze: {
            category: 'eyeshadow', color_a: 200, color_r: 186, color_g: 114, color_b: 60, intensity: 0.8, placement: 'default',
        },
        purple: {
            category: 'eyeshadow', color_a: 150, color_r: 142, color_g: 60, color_b: 186, intensity: 0.8, placement: 'default',
        },
        red: {
            category: 'eyeshadow', color_a: 150, color_r: 186, color_g: 60, color_b: 70, intensity: 0.8, placement: 'default',
        },
        brown: {
            category: 'eyeshadow', color_a: 222, color_r: 140, color_g: 78, color_b: 54, intensity: 0.8, placement: 'default',
        },
    },
    lipcolor: {
        brick: {
            category: 'lipcolor', color_a: 200, color_r: 168, color_g: 71, color_b: 80, intensity: 0.8, placement: 'default',
        },
        brown: {
            category: 'lipcolor', color_a: 200, color_r: 180, color_g: 83, color_b: 65, intensity: 0.8, placement: 'default',
        },
        mauve: {
            category: 'lipcolor', color_a: 150, color_r: 161, color_g: 59, color_b: 110, intensity: 0.8, placement: 'default',
        },
        red: {
            category: 'lipcolor', color_a: 227, color_r: 227, color_g: 54, color_b: 39, intensity: 0.8, placement: 'default',
        },
        orange: {
            category: 'lipcolor', color_a: 222, color_r: 222, color_g: 100, color_b: 100, intensity: 0.8, placement: 'default',
        },
    },
};

const zoomFactor = {
    extendedOuterMouth2D: 0.6,
    leftExtendedEye2D: 0.4,
    rightExtendedEye2D: 0.4,
};

const CANVAS_CONTAINER_HEIGHT_RATIO = 0.8;

let renderedCanvasWidth;
let renderedCanvasHeight;
let currentMode;
let savedCoords;
let feature;
let adjustableCoords;
let newTransform;