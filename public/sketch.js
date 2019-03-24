NB_LABELS = 2;
LABEL_DISPLAY_LENGTH = 5;
ROOT_ROTATION = -1.75;
ROOT_LENGTH = 30;
SPLIT_BRANCHES = 2;
LEAF_RATIO_LENGTH = 1.2;
BRANCH_SHIFT = 2;
MIN_BRANCH_WEIGHT = 0.1;
MAX_BRANCH_WEIGHT = 0.5;
MAX_FRAME_COUNT_APPEARANCE = 30;
NB_STEPS_FULL_APPEARANCE = 5;

colors = ['yellow', 'green', 'blue'];
gardens = [];
leaves = [];
root = undefined;
nodes = [];
minExported = 1;
maxExported = 1;
lastLabelUpdate = undefined;
labelledLeaves = [];
labelIds = 0;

setup = () => {
    createCanvas(windowWidth, windowHeight);
    smooth(10);
    stroke(0);
    onColorsChanged();
    frameRate(20);
}

draw = () => {
    clear();
    if (root && root.childs.length > 1) {
        shiftNodes();
        selectLabelledLeaves();
        leaves.forEach(leaf => leaf.draw());
    }
}

onColorsChanged = () => {
    filterGardensByDetectedColor();
    generateRoots();
    matchGardensToLeaves();
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

    split = () => {
        for (var i = 0; i < SPLIT_BRANCHES; i++) {
            if (leaves.length >= gardens.length)
                break;
            var child = new Branch(
                this.end,
                this,
                this.rotation + random(-1, 1),
                this.length * LEAF_RATIO_LENGTH
            )
            this.childs.push(child);
            leaves.push(child);
        }
    }

    generatePath = () => {
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

    draw = () => {
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
        if (this.labelled && frameCount > MAX_FRAME_COUNT_APPEARANCE)
            this.drawLabel();
    }

    drawCurve = (color) => {
        if (!color.count || !color.lastCheckPoint) {
            color.lastCheckPoint = 2;
            color.count = 1;
        }
        else if (color.count >= NB_STEPS_FULL_APPEARANCE) {
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
            let x, y, t = color.count / NB_STEPS_FULL_APPEARANCE / 3;
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

    drawLabel = () => {
        fill(150,150,150);
        ellipseMode(CENTER);
        ellipse(this.end.x, this.end.y, 6, 6);
        if (!this.label) {
            this.label = createDiv();
            this.label.addClass('label');
            this.labelId = `label-${labelIds++}`;
            this.label.id(this.labelId);

            let name = createSpan(this.garden.Nom);
            name.addClass('name');
            this.label.child(name);

            let location = createSpan(`${this.garden.Ville}, ${this.garden.Pays}`);
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
    }

    removeLabel = () => {
        if (this.label) {
            this.label.remove();
            this.label = undefined;
        }
        this.labelled = false;
    }
}

shiftNodes = () => {
    nodes.forEach(node => {
        if (node.isRoot)
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

selectLabelledLeaves = () => {
    const now = new Date();
    if (!lastLabelUpdate || (now - lastLabelUpdate) / 1000 > LABEL_DISPLAY_LENGTH) {
        labelledLeaves.forEach(leaf => leaf.removeLabel());
        for (let i = 0; i < NB_LABELS; i++) {
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
        || (garden.SPON > 0 && colors.includes('blue'))
        || (garden.EXOTIC > 0 && colors.includes('red'))
    );
}

generateRoots = () => {
    root = new Branch(
        { x: width / 2, y: height, isRoot: true },
        undefined,
        ROOT_ROTATION,
        ROOT_LENGTH
    )
    var parents = [root];
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

matchGardensToLeaves = () => {
    gardens = gardens.sort((a, b) => a.longitude < b.longitude ? -1 : 1);
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
            leaf.colors.push({ r: 21, g: 232, b: 78, value: garden.MEDIC });
        shuffle(leaf.colors);

        leaf.colors.forEach(color => {
            if (color.value > maxExported)
                maxExported = color.value;
            color.path = leaf.path.map((point, index) => {
                const randomShift = () => {
                    if ((index > 1 || index < leaf.path.length - 2))
                        return randomBool() ? -BRANCH_SHIFT : BRANCH_SHIFT;
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
    leaves.forEach(leaf => {
        leaf.colors.forEach(color => {
            color.weight = (color.value / maxExported) * (MAX_BRANCH_WEIGHT - MIN_BRANCH_WEIGHT) + MIN_BRANCH_WEIGHT;
            color.startingFrame = random(0, MAX_FRAME_COUNT_APPEARANCE);
        });
    });
}

randomBool = (chances = 1, total = 2) => random(0, total) <= chances;
