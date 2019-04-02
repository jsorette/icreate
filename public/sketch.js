previousColors = [];
colors = [];
leaves = [];
activeLeaves = [];
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
    colors = [['red', 'blue', 'yellow', 'green'][Math.floor(random(0, 4))]];
    resetAll();
    frameRate(settings.FRAME_RATE);
}

draw = () => {
    clear();
    if (origin && activeLeaves.length > 0) {
        shiftNodes();
        selectLabelledLeaves();
        leaves.forEach(leaf => leaf.draw());
    }
}

resetAll = () => {
    previousColors = [];
    activeLeaves = [];
    generateRoots();
    onColorsChanged();
}

onColorsChanged = () => {
    labelledLeaves.forEach(leaf => leaf.removeLabel());
    if (colors.length < 1)
        generateRoots();
    matchGardensToLeaves();
    setWeight();
    previousColors = Array.from(colors);
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
        for (var i = 0; i < settings.BRANCH_SPLIT_COUNT; i++) {
            if (leaves.length >= gardens.length)
                break;
            var child = new Branch(
                this.end,
                this,
                this.rotation + random(-settings.BRANCH_DISPERSION, settings.BRANCH_DISPERSION),
                this.length * settings.BRANCH_LENGTH_RATIO
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
        if (this.labelled && frameCount > settings.BRANCH_MAX_FRAME_COUNT_APPEARANCE)
            this.drawLabel();
    }

    drawCurve(color) {
        if (color.count >= settings.BRANCH_FRAME_COUNT_BY_GROWTH_STEP) {
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
            let x, y, t = color.count / settings.BRANCH_FRAME_COUNT_BY_GROWTH_STEP / 3;
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
                node.shiftX = cos;
                node.shiftY = sin;
            } else {
                node.shiftX = sin;
                node.shiftY = cos;
            }
            node.motion = node.isLeaf ? random(0, settings.BRANCH_MAX_MOTION_RATIO) : settings.BRANCH_MAX_MOTION_RATIO;
        }
        node.count += 0.1;
        node.x += node.shiftX(node.count) * node.motion;
        node.y += node.shiftY(node.count) * node.motion;
    })
}

selectLabelledLeaves = (force=false) => {
    const now = new Date();
    if (force || !lastLabelUpdate || (now - lastLabelUpdate) / 1000 > settings.LABEL_DISPLAY_DURATION) {
        labelledLeaves.forEach(leaf => leaf.removeLabel());
        for (let i = 0; i < settings.LABEL_COUNT; i++) {
            const leaf = activeLeaves[Math.round(random(0, activeLeaves.length - 1))];
            leaf.labelled = true;
            labelledLeaves.push(leaf);
        }
        lastLabelUpdate = now;
    }
}

generateRoots = () => {
    origin = new Branch(
        { x: width / 2, y: height, isOrigin: true },
        undefined,
        settings.BRANCH_ORIGIN_ROTATION,
        settings.BRANCH_ORIGIN_LENGTH
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
        leaf.colors = [];
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

matchColorToLeaf = (leaf, colorName, type, r, g, b) => {
    if (leaf.garden[type] && colors.includes(colorName) && !previousColors.includes(colorName)) {
      let color = { r, g, b, value: leaf.garden[type] };
      color.path = leaf.path.map((point, index) => {
          const randomShift = () => {
              if ((index > 1 || index < leaf.path.length - 2))
                  return randomBool() ? -settings.BRANCH_MAX_SHIFT : settings.BRANCH_MAX_SHIFT;
              return 0;
          }
          const shiftX = randomShift();
          const shiftY = randomShift();
          return {
              x: () => point.x + shiftX,
              y: () => point.y + shiftY
          };
      });
      color.name = colorName;
      color.startingFrame = random(frameCount, frameCount + settings.BRANCH_MAX_FRAME_COUNT_APPEARANCE);
      color.lastCheckPoint = 2;
      color.count = 1;
      leaf.colors.push(color);
      if (color.value > maxExported)
          maxExported = color.value;
    }
    else if (!colors.includes(colorName))
        leaf.colors = leaf.colors.filter(color => color.name != colorName);
}

matchGardensToLeaves = () => {
    sortGardensByCountryAndLatitude();
    leaves = leaves.sort((a, b) => a.end.x < b.end.x ? -1 : 1);
    activeLeaves = [];
    for (var i = 0; i < leaves.length; i++) {
        const garden = gardens[i];
        const leaf = leaves[i];
        leaf.garden = garden;
        matchColorToLeaf(leaf, 'blue', 'EXOTIC', 4, 163, 255);
        matchColorToLeaf(leaf, 'red', 'SPON', 255, 43, 62);
        matchColorToLeaf(leaf, 'yellow', 'SERRES', 255, 244, 47);
        matchColorToLeaf(leaf, 'green', 'MEDIC', 44, 221, 109);
        shuffle(leaf.colors);
        if (leaf.colors.length > 0)
            activeLeaves.push(leaf);
    }
}

setWeight = () => {
    leaves.forEach(leaf => {
        leaf.colors.forEach(color => {
            color.weight = (color.value / maxExported) * (settings.BRANCH_MAX_WEIGHT - settings.BRANCH_MIN_WEIGHT) + settings.BRANCH_MIN_WEIGHT;
        });
    });
}

randomBool = (chances = 1, total = 2) => random(0, total) <= chances;
