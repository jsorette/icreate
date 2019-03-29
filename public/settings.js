let settings = {
    DETECTION_ACTIVATED: true,
    LABEL_COUNT: 2,
    LABEL_DISPLAY_DURATION: 5,
    BRANCH_MIN_WEIGHT: 0.1,
    BRANCH_MAX_WEIGHT: 0.5,
    BRANCH_SPLIT_COUNT: 2,
    BRANCH_ORIGIN_LENGTH: 30,
    BRANCH_LENGTH_RATIO: 1.2,
    BRANCH_ORIGIN_ROTATION: -1.75,
    BRANCH_MAX_SHIFT: 2,
    BRANCH_MAX_FRAME_COUNT_APPEARANCE: 30,
    BRANCH_FRAME_COUNT_BY_GROWTH_STEP: 5,
    BRANCH_DISPERSION: 1,
    FRAME_RATE: 20,
};

let toggleSettingsVisibility = () => {};
let onColorsChangedUpdateSettings = () => {};

window.addEventListener('load', _ => {
    let settingsPanel = document.getElementById('settings');
    let settingsButton = document.getElementById('settings-button');
    settingsPanel.style.visibility = 'visible';

    const toggleSettings = () => settingsPanel.classList.toggle("is-active");
    toggleSettingsVisibility = () => {
        settingsPanel.style.visibility = settingsPanel.style.visibility === 'visible' ? 'hidden' : 'visible';
    }

    window.addEventListener('click', e => {
        if (!settingsPanel.contains(e.target) && settingsPanel.classList.contains('is-active'))
            toggleSettings();
    });

    settingsButton.addEventListener('click', toggleSettings);

    ['red', 'yellow', 'green', 'blue'].forEach(color => {
        let typeSwitch = document.getElementById(`color-${color}`);
        typeSwitch.addEventListener('change', () => {
            if (colors.includes(color))
                colors = colors.filter(c => c !== color);
            else
                colors.push(color);
            onColorsChanged();
        }, false);
    });

    onColorsChangedUpdateSettings = () => {
        ['red', 'yellow', 'green', 'blue'].forEach(color => {
            let typeSwitch = document.getElementById(`color-${color}`);
            typeSwitch.checked = colors.includes(color);
        });
    }

    let toggleDetection = document.getElementById('toggle-detection');
    toggleDetection.addEventListener("click", () => {
        toggleDetection.classList.toggle('active');
        settings.DETECTION_ACTIVATED = !settings.DETECTION_ACTIVATED;
    });

    let labelCountInput = document.getElementById('label-count');
    labelCountInput.value = settings.LABEL_COUNT;
    labelCountInput.addEventListener("change", () => {
        settings.LABEL_COUNT = parseFloat(labelCountInput.value);
        selectLabelledLeaves(force=true);
    }, false);

    let labelDisplayDurationInput = document.getElementById('label-display-duration');
    labelDisplayDurationInput.value = settings.LABEL_DISPLAY_DURATION;
    labelDisplayDurationInput.addEventListener("change", () => {
        settings.LABEL_DISPLAY_DURATION = parseFloat(labelDisplayDurationInput.value);
        selectLabelledLeaves(force=true);
    }, false);

    let branchMinWeightInput = document.getElementById('branch-min-weight');
    branchMinWeightInput.value = settings.BRANCH_MIN_WEIGHT;
    branchMinWeightInput.addEventListener("change", () => {
        settings.BRANCH_MIN_WEIGHT = parseFloat(branchMinWeightInput.value);
        resetAll();
    }, false);

    let branchMaxWeightInput = document.getElementById('branch-max-weight');
    branchMaxWeightInput.value = settings.BRANCH_MAX_WEIGHT;
    branchMaxWeightInput.addEventListener("change", () => {
        settings.BRANCH_MAX_WEIGHT = parseFloat(branchMaxWeightInput.value);
        resetAll();
    }, false);

    let branchSplitCountInput = document.getElementById('branch-split-count');
    branchSplitCountInput.value = settings.BRANCH_SPLIT_COUNT;
    branchSplitCountInput.addEventListener("change", () => {
        settings.BRANCH_SPLIT_COUNT = parseFloat(branchSplitCountInput.value);
        resetAll();
    }, false);

    let branchOriginLengthInput = document.getElementById('branch-origin-length');
    branchOriginLengthInput.value = settings.BRANCH_ORIGIN_LENGTH;
    branchOriginLengthInput.addEventListener("change", () => {
        settings.BRANCH_ORIGIN_LENGTH = parseFloat(branchOriginLengthInput.value);
        resetAll();
    }, false);

    let branchLengthRatioInput = document.getElementById('branch-length-ratio');
    branchLengthRatioInput.value = settings.BRANCH_LENGTH_RATIO;
    branchLengthRatioInput.addEventListener("change", () => {
        settings.BRANCH_LENGTH_RATIO = parseFloat(branchLengthRatioInput.value);
        resetAll();
    }, false);

    let branchOriginRotationInput = document.getElementById('branch-origin-rotation');
    branchOriginRotationInput.value = settings.BRANCH_ORIGIN_ROTATION;
    branchOriginRotationInput.addEventListener("change", () => {
        settings.BRANCH_ORIGIN_ROTATION = parseFloat(branchOriginRotationInput.value);
        resetAll();
    }, false);

    let branchDispersionInput = document.getElementById('branch-dispersion');
    branchDispersionInput.value = settings.BRANCH_DISPERSION;
    branchDispersionInput.addEventListener("change", () => {
        settings.BRANCH_DISPERSION = parseFloat(branchDispersionInput.value);
        resetAll();
    }, false);


    let branchMaxShiftInput = document.getElementById('branch-max-shift');
    branchMaxShiftInput.value = settings.BRANCH_MAX_SHIFT;
    branchMaxShiftInput.addEventListener("change", () => {
        settings.BRANCH_MAX_SHIFT = parseFloat(branchMaxShiftInput.value);
        resetAll();
    }, false);

    let branchMaxFrameCountAppearanceInput = document.getElementById('branch-max-frame-count-appearance');
    branchMaxFrameCountAppearanceInput.value = settings.BRANCH_MAX_FRAME_COUNT_APPEARANCE;
    branchMaxFrameCountAppearanceInput.addEventListener("change", () => {
        settings.BRANCH_MAX_FRAME_COUNT_APPEARANCE = parseFloat(branchMaxFrameCountAppearanceInput.value);
        resetAll();
    }, false);

    let frameRateInput = document.getElementById('frame-rate');
    frameRateInput.value = settings.FRAME_RATE;
    frameRateInput.addEventListener("change", () => {
        settings.FRAME_RATE = parseFloat(frameRateInput.value);
        setup();
    }, false);

    let reload = document.getElementById('reload');
    reload.addEventListener("click", () => {
        resetAll();
        toggleSettings();
    }, false);

    document.addEventListener('keydown', function(event) {
        if(event.keyCode == 32)
            resetAll();
    });
});
