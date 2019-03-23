NB_LABELS = 5;
LABEL_DISPLAY_LENGTH = 5;
ROOT_ROTATION = -1.75;
ROOT_LENGTH = 30;
SPLIT_BRANCHES = 2;
LEAF_RATIO_LENGTH = 1.2;
BRANCH_SHIFT = 2;
MIN_BRANCH_WEIGHT = 0.1;
MAX_BRANCH_WEIGHT = 0.5;

colors = ['yellow', 'blue', 'green'];
gardens = [];
leaves = [];
root = undefined;
nodes = [];
minExported = 1;
maxExported = 1;
lastLabelUpdate = undefined;
labelledLeaves = [];

setup = () => {
    createCanvas(windowWidth, windowHeight);
    smooth();
    stroke(0);
    onColorsChanged();
    frameRate(20);
}

draw = () => {
    clear();
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
            node.speed = node.isLeaf ? random(2, 5) : 1;
        }
        node.count += 0.1;
        node.x += node.shiftX(node.count) * node.speed;
        node.y += node.shiftY(node.count) * node.speed;
    })
    const now = new Date();
    if (!lastLabelUpdate || (now - lastLabelUpdate) / 1000 > LABEL_DISPLAY_LENGTH) {
        labelledLeaves = [];
        for (var i = 0; i < NB_LABELS; i++)
            labelledLeaves.push(leaves[Math.round(random(0, leaves.length - 1))]);
            lastLabelUpdate = now;
    }
    if (root && root.childs.length > 1) {
        leaves.forEach(leaf => leaf.drawCurve());
        // labelledLeaves.forEach(leaf => leaf.drawLabel());
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
        this.garden = undefined;
        this.count = 0;
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
            path.push(this.start);
        }
        else {
            path = this.parent.generatePath();
            path.push(this.start);
        }
        if (this.childs.length < 1) {
            path.push(this.end);
            path.push(this.end);
        }
        return path;
    }

    drawCurve = () => {
        this.colors.forEach(color => {
            beginShape();
            noFill();
            strokeWeight(color.weight);
            stroke(color.r, color.g, color.b);
            color.path.forEach(point => {
                curveVertex(point.x(), point.y());
            })
            endShape();
        });
    }

    drawLabel = () => {
        fill(0);
        stroke(0);
        ellipse(this.end.x, this.end.y, 10, 10);
        textAlign(LEFT,BOTTOM);
        text(this.garden.Nom + "\n" + this.garden.Ville, this.end.x, this.end.y - 10);
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
            leaf.colors.push({r:255 ,g: 21,b: 17, value: garden.SPON});
        if (garden.EXOTIC && colors.includes('blue'))
            leaf.colors.push({r:4 ,g: 163,b: 255, value: garden.EXOTIC});
        if (garden.SERRES && colors.includes('yellow'))
            leaf.colors.push({r:232 ,g: 145,b: 21, value: garden.SERRES});
        if (garden.MEDIC && colors.includes('green'))
            leaf.colors.push({r:21 ,g: 232,b: 78, value: garden.MEDIC});
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
        })
    })
}

randomBool = (chances = 1, total = 2) => random(0, total) <= chances;
