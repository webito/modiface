function startTryOn(mode) {
    let commonScriptList = [];
    let photoScriptList = [];
    let liveScriptList = [];
    const assetsList = {
        'eyeshadow-swatch-gold': './assets/images/eyeswatch1.png',
        'eyeshadow-swatch-bronze': './assets/images/eyeswatch2.png',
        'eyeshadow-swatch-purple': './assets/images/eyeswatch3.png',
        'eyeshadow-swatch-red': './assets/images/eyeswatch4.png',
        'eyeshadow-swatch-brown': './assets/images/eyeswatch5.png',
        'lipcolor-swatch-brick': './assets/images/swatch1.png',
        'lipcolor-swatch-brown': './assets/images/swatch2.png',
        'lipcolor-swatch-mauve': './assets/images/swatch3.png',
        'lipcolor-swatch-red': './assets/images/swatch4.png',
        'lipcolor-swatch-orange': './assets/images/swatch5.png',
        'compare-drag': './assets/images/Before-After-Slider.svg',
        'adjust-collapse-cta': './assets/images/down_arrow.png',
        'adjust-left-eye-cta': './assets/images/adjust_left.png',
        'adjust-right-eye-cta': './assets/images/adjust_right.png',
        'adjust-lips-cta': './assets/images/adjust_lip.png',
        'adjust-cta': './assets/images/adjust_btn.png',
        'before-after-cta': './assets/images/before_after.png',
        'close-button': './assets/images/close.png',
        'left-adjust-image': './assets/images/adjust_left.png',
        'right-adjust-image': './assets/images/adjust_right.png',
        'checkmark': './assets/images/icon_checkmark.svg',
        'gif-loader': './assets/images/loading.gif',
    };
    commonScriptList.push(
        'https://cdnjs.cloudflare.com/ajax/libs/mathjs/5.10.3/math.min.js',
        './states.js',
        './utils/toggleMakeup.js',
        './utils/loader.js',
        './utils/toggleBeforeAfter.js',
        './utils/disableBeforeAfter.js',
        './utils/enableBeforeAfter.js',
        './utils/sliderListeners.js',
        './utils/adjustMargin.js',
        './utils/resetAll.js',
        './utils/deselectCategorySwatches.js',
        './utils/selectMakeupCategory.js',
        './utils/stopMakeupApp.js',
        './utils/adjustFeature.js',
        './utils/clamp.js',
        './utils/transformCoordinates.js',
        './utils/drawMask.js',
        './utils/enableAdjustPanelButtons.js',
        './utils/disableAdjustButtons.js',
        './utils/saveCoords.js',
        './utils/revertToOriginal.js',
        './utils/centerFeature.js',
        './utils/setMask.js',
        './utils/createCoordinateDiv.js',
        './utils/toggleMouth.js',
        './utils/adjustButtonAnimation.js',
        './utils/closeErrorScreen.js',
    );
    photoScriptList.push(
        './utils/startPhoto.js',
        './utils/uploadImage.js',
    );
    liveScriptList.push('./utils/startLive.js');
    let script = null;
    if(typeof photoResourceLoaded === 'undefined' && typeof liveResourceLoaded === 'undefined') {
        // load scripts when first time click on the photo/live button
        for (let i = 0; i < commonScriptList.length; i += 1) {
            script = document.createElement('script');
            script.setAttribute('src', commonScriptList[i]);
            document.head.appendChild(script);
        }
        if (mode === 'photo') {
            for (let i = 0; i < photoScriptList.length; i += 1) {
                script = document.createElement('script');
                script.setAttribute('src', photoScriptList[i]);
                document.head.appendChild(script);
            }
        } else if (mode === 'live') {
            for (let i = 0; i < liveScriptList.length; i += 1) {
                script = document.createElement('script');
                script.setAttribute('src', liveScriptList[i]);
                document.head.appendChild(script);
            }
        }
        // load assets
        Object.keys(assetsList).forEach((id) => {
            document.getElementById(id).src = assetsList[id];
        });
        script.onload = function(){
            if (mode === 'photo') {
                triggerImageUpload();
            } else if (mode === 'live') {
                startLive();
            }
        }
    } else if (typeof photoResourceLoaded === 'undefined' && mode === 'photo') {
        // load scripts when first time click on the photo button but has already used live mode
        if (mode === 'photo') {
            for (let i = 0; i < photoScriptList.length; i += 1) {
                script = document.createElement('script');
                script.setAttribute('src', photoScriptList[i]);
                document.head.appendChild(script);
            }
            script.onload = function(){
                triggerImageUpload();
            }
        }
    } else if (typeof liveResourceLoaded === 'undefined' && mode === 'live') {
        // load scripts when first time click on the live button but has already used photo mode
        if (mode === 'live') {
            for (let i = 0; i < liveScriptList.length; i += 1) {
                script = document.createElement('script');
                script.setAttribute('src', liveScriptList[i]);
                document.head.appendChild(script);
            }
            script.onload = function(){
                startLive();
            };
        }
    } else if (mode === 'photo') {
        triggerImageUpload();
    } else if (mode === 'live') {
        startLive();
    }
}
