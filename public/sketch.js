LABEL_COUNT = 2;
LABEL_DISPLAY_DURATION = 5;
BRANCH_MIN_WEIGHT = 0.1;
BRANCH_MAX_WEIGHT = 0.5;
BRANCH_SPLIT_COUNT = 2;
BRANCH_ORIGIN_LENGTH = 30;
BRANCH_LENGTH_RATIO = 1.2;
BRANCH_ORIGIN_ROTATION = -1.75;
BRANCH_MAX_SHIFT = 2;
BRANCH_MAX_FRAME_COUNT_APPEARANCE = 30;
BRANCH_FRAME_COUNT_BY_GROWTH_STEP = 5;
FRAME_RATE = 20;

colors = ['green', 'red', 'yellow', 'green'];
gardens = [];
leaves = [];
origin = undefined;
nodes = [];
minExported = 1;
maxExported = 1;
lastLabelUpdate = undefined;
labelledLeaves = [];
labelIds = 0;

setup = () => {
    createCanvas(windowWidth, windowHeight);
    smooth(10);
    onColorsChanged();
    frameRate(FRAME_RATE);
}

draw = () => {
    clear();
    if (origin && origin.childs.length > 1) {
        shiftNodes();
        selectLabelledLeaves();
        leaves.forEach(leaf => leaf.draw());
    }
}

onColorsChanged = () => {
    filterGardensByDetectedColor();
    generateRoots();
    matchGardensToLeaves();
    labelledLeaves.forEach(leaf => leaf.removeLabel());
}

class Branch {
    constructor(start, parent, rotation, length) {
        this.start = start;
        this.end = {
            x: start.x + length * cos(rotation),
            y: start.y + length * sin(rotation)
        };
        if (this.start.y < this.end.y) {
            this.end.y = this.end.y - (2 * (this.end.y - this.start.y));
        }
        nodes.push(this.end);
        this.parent = parent;
        this.childs = [];
        this.rotation = rotation;
        this.length = length;
    }

    split() {
        for (var i = 0; i < BRANCH_SPLIT_COUNT; i++) {
            if (leaves.length >= gardens.length)
                break;
            var child = new Branch(
                this.end,
                this,
                this.rotation + random(-1, 1),
                this.length * BRANCH_LENGTH_RATIO
            )
            this.childs.push(child);
            leaves.push(child);
        }
    }

    generatePath() {
        var path = [];
        if (!this.parent) {
            path.push(this.start);
        }
        else {
            path = this.parent.generatePath();
            path.push(this.start);
        }
        if (this.childs.length < 1) {
            path.push(this.end);
        }
        return path;
    }

    draw() {
        this.colors.forEach(color => {
            const { r, g, b, weight, startingFrame } = color;
            if (startingFrame > frameCount)
                return;
            beginShape();
            noFill();
            strokeWeight(weight);
            stroke(r, g, b);
            this.drawCurve(color);
            endShape();
        });
        if (this.labelled && frameCount > BRANCH_MAX_FRAME_COUNT_APPEARANCE)
            this.drawLabel();
    }

    drawCurve(color) {
        if (color.count >= BRANCH_FRAME_COUNT_BY_GROWTH_STEP) {
            color.lastCheckPoint+=1;
            color.count = 1;
        }

        const { path } = color;
        curveVertex(path[0].x(), path[0].y());
        for (let i = 0; i < color.lastCheckPoint && i < path.length; i++) {
            curveVertex(path[i].x(), path[i].y());
        }
        const i = color.lastCheckPoint;
        if (i >= path.length - 1) {
            curveVertex(path[path.length - 1].x(), path[path.length - 1].y());
        }
        else {
            let x, y, t = color.count / BRANCH_FRAME_COUNT_BY_GROWTH_STEP / 3;
            if (i === path.length - 1) {
                const n = path.length;
                x = curvePoint(path[n-4].x(), path[n-3].x(), path[n-2].x(), path[n-1].x(), t + 0.66);
                y = curvePoint(path[n-4].y(), path[n-3].y(), path[n-2].y(), path[n-1].y(), t + 0.66);
            }
            else {
                x = curvePoint(path[i-2].x(), path[i-1].x(), path[i].x(), path[i+1].x(), t + 0.66);
                y = curvePoint(path[i-2].y(), path[i-1].y(), path[i].y(), path[i+1].y(), t + 0.66);
            }
            curveVertex(x, y);
            curveVertex(x, y);
        }
        color.count+=1;
    }

    drawLabel() {
        if (!this.label) {
            this.label = createDiv();
            this.label.addClass('label');
            this.labelId = `label-${labelIds++}`;
            this.label.id(this.labelId);

            let name = createSpan(this.garden.NAME);
            name.addClass('name');
            this.label.child(name);

            let location = createSpan(`${this.garden.CITY}, ${this.garden.COUNTRY}`);
            location.addClass('location');
            this.label.child(location);

            let colorsDiv = createDiv();
            colorsDiv.addClass('colors');
            this.colors.forEach(aColor => {
                const { r, g, b, value} = aColor;

                let dot = createDiv();
                dot.addClass('dot');
                dot.style('background-color', color(r, g, b));
                colorsDiv.child(dot);

                let valueSpan = createSpan(value);
                valueSpan.addClass('value');
                colorsDiv.child(valueSpan);
            });
            this.label.child(colorsDiv);
        }
        const { width, height } = this.label.size();
        this.label.position(this.end.x - (width / 2), this.end.y - height - 10);
        stroke(255);
        strokeWeight(3);
        line(this.end.x, this.end.y, this.end.x, this.end.y - 20);
    }

    removeLabel() {
        if (this.label) {
            this.label.remove();
            this.label = undefined;
        }
        this.labelled = false;
    }
}

shiftNodes = () => {
    nodes.forEach(node => {
        if (node.isOrigin)
            return;
        if (!node.count || !node.shiftX || !node.shiftY) {
            node.count = random(0, 10);
            if (random(0, 1) > 0.5) {
                node.shiftX = randomBool(1, 10) ? () => 0 : cos;
                node.shiftY = randomBool(1, 10) ? () => 0 : sin;
            } else {
                node.shiftX = randomBool(1, 10) ? () => 0 : sin;
                node.shiftY = randomBool(1, 10) ? () => 0 : cos;
            }
            node.speed = node.isLeaf ? random(0, 1) : 1;
        }
        node.count += 0.1;
        node.x += node.shiftX(node.count) * node.speed;
        node.y += node.shiftY(node.count) * node.speed;
    })
}

selectLabelledLeaves = (force=false) => {
    const now = new Date();
    if (force || !lastLabelUpdate || (now - lastLabelUpdate) / 1000 > LABEL_DISPLAY_DURATION) {
        labelledLeaves.forEach(leaf => leaf.removeLabel());
        for (let i = 0; i < LABEL_COUNT; i++) {
            const leaf = leaves[Math.round(random(0, leaves.length - 1))];
            leaf.labelled = true;
            labelledLeaves.push(leaf);
        }
        lastLabelUpdate = now;
    }
}

filterGardensByDetectedColor = () => {
    gardens = data.filter(garden =>
        (garden.SERRES > 0 && colors.includes('yellow'))
        || (garden.MEDIC > 0 && colors.includes('green'))
        || (garden.SPON > 0 && colors.includes('red'))
        || (garden.EXOTIC > 0 && colors.includes('blue'))
    );
}

generateRoots = () => {
    origin = new Branch(
        { x: width / 2, y: height, isOrigin: true },
        undefined,
        BRANCH_ORIGIN_ROTATION,
        BRANCH_ORIGIN_LENGTH
    )
    var parents = [origin];
    leaves = parents;
    while (leaves.length < gardens.length) {
        parents = leaves;
        leaves = [];
        parents.forEach(parent => parent.split())
    }

    leaves.forEach(leaf => {
        leaf.path = leaf.generatePath();
        leaf.end.isLeaf = true;
    });
}

sortGardensByCountryAndLatitude = () => {
    let countries = {};
    gardens.forEach(garden => {
        if (!countries[garden.COUNTRY])
            countries[garden.COUNTRY] = {
                gardens: [],
                averageLatitude: 0
            };
        countries[garden.COUNTRY].gardens.push(garden);
        countries[garden.COUNTRY].averageLatitude += garden.LATITUDE;
    });
    Object.keys(countries).forEach(countryName => {
        const country = countries[countryName];
        country.averageLatitude /= country.gardens.length;
        country.gardens = country.gardens.sort((a, b) => a.LATITUDE < b.LATITUDE ? -1 : 1);
    });
    countries = Object.values(countries).sort((a, b) => a.averageLatitude < b.averageLatitude ? -1 : 1);
    
    gardens = countries.reduce((gardens, country) => gardens.concat(country.gardens), []);
}

matchGardensToLeaves = () => {
    sortGardensByCountryAndLatitude();
    leaves = leaves.sort((a, b) => a.end.x < b.end.x ? -1 : 1);

    for (var i = 0; i < leaves.length; i++) {
        const garden = gardens[i];
        const leaf = leaves[i];

        leaf.garden = garden;
        leaf.colors = [];

        if (garden.SPON && colors.includes('red'))
            leaf.colors.push({ r: 255, g: 21, b: 17, value: garden.SPON });
        if (garden.EXOTIC && colors.includes('blue'))
            leaf.colors.push({ r: 4, g: 163, b: 255, value: garden.EXOTIC });
        if (garden.SERRES && colors.includes('yellow'))
            leaf.colors.push({ r: 232, g: 145, b: 21, value: garden.SERRES });
        if (garden.MEDIC && colors.includes('green'))
            leaf.colors.push({ r: 44, g: 221, b: 109, value: garden.MEDIC });
        shuffle(leaf.colors);

        leaf.colors.forEach(color => {
            if (color.value > maxExported)
                maxExported = color.value;
            color.path = leaf.path.map((point, index) => {
                const randomShift = () => {
                    if ((index > 1 || index < leaf.path.length - 2))
                        return randomBool() ? -BRANCH_MAX_SHIFT : BRANCH_MAX_SHIFT;
                    return 0;
                }
                const shiftX = randomShift();
                const shiftY = randomShift();
                return {
                    x: () => point.x + shiftX,
                    y: () => point.y + shiftY
                };
            });
        });
    }
    setWeight();
    setStartingFrame();
}

setWeight = () => {
    leaves.forEach(leaf => {
        leaf.colors.forEach(color => {
            color.weight = (color.value / maxExported) * (BRANCH_MAX_WEIGHT - BRANCH_MIN_WEIGHT) + BRANCH_MIN_WEIGHT;
        });
    });
}

setStartingFrame = () => {
    leaves.forEach(leaf => {
        leaf.colors.forEach(color => {
            color.startingFrame = random(frameCount, frameCount + BRANCH_MAX_FRAME_COUNT_APPEARANCE);
            color.lastCheckPoint = 2;
            color.count = 1;
        });
    });
}

randomBool = (chances = 1, total = 2) => random(0, total) <= chances;
