let settings = document.getElementById('settings');
let settingsButton = document.getElementById('settings-button');
settings.style.visibility = 'visible';

const toggleSettings = () => settings.classList.toggle("is-active");
const toggleSettingsVisibility = () => {
    settings.style.visibility = settings.style.visibility === 'visible' ? 'hidden' : 'visible';
}

window.addEventListener('click', e => {
    if (!settings.contains(e.target) && settings.classList.contains('is-active'))
        toggleSettings();
});

settingsButton.addEventListener('click', toggleSettings);

let labelCountInput = document.getElementById('label-count');
labelCountInput.value = LABEL_COUNT;
labelCountInput.addEventListener("change", () => {
    LABEL_COUNT = labelCountInput.value;
    selectLabelledLeaves(force=true);
}, false);

let labelDisplayDurationInput = document.getElementById('label-display-duration');
labelDisplayDurationInput.value = LABEL_DISPLAY_DURATION;
labelDisplayDurationInput.addEventListener("change", () => {
    LABEL_DISPLAY_DURATION = labelDisplayDurationInput.value;
    selectLabelledLeaves(force=true);
}, false);

let branchMinWeightInput = document.getElementById('branch-min-weight');
branchMinWeightInput.value = BRANCH_MIN_WEIGHT;
branchMinWeightInput.addEventListener("change", () => {
    BRANCH_MIN_WEIGHT = branchMinWeightInput.value;
    setWeight();
}, false);

let branchMaxWeightInput = document.getElementById('branch-max-weight');
branchMaxWeightInput.value = BRANCH_MAX_WEIGHT;
branchMaxWeightInput.addEventListener("change", () => {
    BRANCH_MAX_WEIGHT = branchMaxWeightInput.value;
    setWeight();
}, false);

let branchSplitCountInput = document.getElementById('branch-split-count');
branchSplitCountInput.value = BRANCH_SPLIT_COUNT;
branchSplitCountInput.addEventListener("change", () => {
    BRANCH_SPLIT_COUNT = branchSplitCountInput.value;
    onColorsChanged();
}, false);

let branchOriginLengthInput = document.getElementById('branch-origin-length');
branchOriginLengthInput.value = BRANCH_ORIGIN_LENGTH;
branchOriginLengthInput.addEventListener("change", () => {
    BRANCH_ORIGIN_LENGTH = branchOriginLengthInput.value;
    onColorsChanged();
}, false);

let branchLengthRatioInput = document.getElementById('branch-length-ratio');
branchLengthRatioInput.value = BRANCH_LENGTH_RATIO;
branchLengthRatioInput.addEventListener("change", () => {
    BRANCH_LENGTH_RATIO = branchLengthRatioInput.value;
    onColorsChanged();
}, false);

let branchOriginRotationInput = document.getElementById('branch-origin-rotation');
branchOriginRotationInput.value = BRANCH_ORIGIN_ROTATION;
branchOriginRotationInput.addEventListener("change", () => {
    BRANCH_ORIGIN_ROTATION = branchOriginRotationInput.value;
    onColorsChanged();
}, false);

let branchMaxShiftInput = document.getElementById('branch-max-shift');
branchMaxShiftInput.value = BRANCH_MAX_SHIFT;
branchMaxShiftInput.addEventListener("change", () => {
    BRANCH_MAX_SHIFT = branchMaxShiftInput.value;
    matchGardensToLeaves();
}, false);

let branchMaxFrameCountAppearanceInput = document.getElementById('branch-max-frame-count-appearance');
branchMaxFrameCountAppearanceInput.value = BRANCH_MAX_FRAME_COUNT_APPEARANCE;
branchMaxFrameCountAppearanceInput.addEventListener("change", () => {
    BRANCH_MAX_FRAME_COUNT_APPEARANCE = branchMaxFrameCountAppearanceInput.value;
    setStartingFrame();
}, false);

let frameRateInput = document.getElementById('frame-rate');
frameRateInput.value = FRAME_RATE;
frameRateInput.addEventListener("change", () => {
    FRAME_RATE = frameRateInput.value;
    setup();
}, false);
