MIN_CONSECUTIVE_COLORS = 5;
consecutiveColors = 0;

registerColor = (name, hslCondition) => {
    window.tracking.ColorTracker.registerColor(name, function (r, g, b) {
        const {h, s, l} = rgbToHsl(r, g, b);
        return hslCondition(h, s, l);
    });
}

window.onload = () => {
    registerColor('red', (h, s, l) => 0 < h && h < 8 && s > 50 && l < 50);
    registerColor('blue', (h, s, l) => h > 220 && h < 230 && s > 50 && l < 50);
    registerColor('green', (h, s, l) => h > 100 && h < 160 && s > 50 && l < 50);
    registerColor('yellow', (h, s, l) => 58 && h < 64 && s > 50 && l < 50 && l > 20);
    
    var tracker = new window.tracking.ColorTracker(['red', 'blue', 'yellow', 'green']);
    tracker.setMinDimension(3);
    tracker.setMinGroupSize(3);
    window.tracking.track('#video', tracker, { camera: true });
    tracker.on('track', onTrack);
}

onTrack = (event) => {
    var canvas = document.getElementById('canvas');
    var camera = document.getElementById('camera');
    camera.classList.add('active');
    var context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);

    if (!settings.DETECTION_ACTIVATED)
        return;

    event.data.forEach(function (rect) {
        context.strokeStyle = rect.color;
        context.strokeRect(rect.x, rect.y, rect.width, rect.height);
    });

    const trackedColors = new Set(event.data.map(rect => rect.color));
    if (trackedColors.size === colors.length && [...colors].every(color => trackedColors.has(color))) {
        consecutiveColors++;
    }
    else {
        consecutiveColors = 0;
        colors = Array.from(trackedColors);
    }

    if (consecutiveColors == MIN_CONSECUTIVE_COLORS) {
        onColorsChanged();
        onColorsChangedUpdateSettings();
    }
}
