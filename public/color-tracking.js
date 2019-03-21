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
    var context = canvas.getContext('2d');
    
    context.clearRect(0, 0, canvas.width, canvas.height);
    event.data.forEach(function (rect) {
        context.strokeStyle = rect.color;
        context.strokeRect(rect.x, rect.y, rect.width, rect.height);
        context.font = '11px Helvetica';
        context.fillStyle = "#fff";
        context.fillText('x: ' + rect.x + 'px', rect.x + rect.width + 5, rect.y + 11);
        context.fillText('y: ' + rect.y + 'px', rect.x + rect.width + 5, rect.y + 22);
    });

    const trackedColors = new Set(event.data.map(rect => rect.color));
    if (trackedColors.size === colors.length && [...colors].every(color => trackedColors.has(color)))
        return;
    colors = Array.from(trackedColors);

    onColorsChanged();
}