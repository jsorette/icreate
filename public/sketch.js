colors = [];
gardens = [];

leafs = [];
root = undefined;

setup = () => {
    createCanvas(windowWidth, windowHeight);
    smooth();
    noLoop();
    stroke(0);
}

draw = () => {
    clear();
    if (root && root.childs.length > 0)
        leafs.forEach(leaf => {
            beginShape();
            noFill();
            leaf.draw();
            endShape();
        })
}

class Branch {
    constructor(debut, parent, rotation, length) {
        this.debut = debut;
        this.fin = new Coord(debut.x + length * cos(rotation), debut.y + length * sin(rotation));
        this.parent = parent;
        this.childs = [];
        this.rotation = rotation;
        this.length = length;
        this.marked = false;
    }

    split = () => {
        for (var i = 0; i < 2; i++) {
            if (leafs.length >= gardens.length)
                break;
            var child = new Branch(
                this.fin,
                this,
                this.rotation + random(-1, 1),
                this.length * 1.2
            )
            this.childs.push(child);
            leafs.push(child);
        }
    }

    draw = () => {
        if (!this.parent || this.parent.marked) {
            curveVertex(this.debut.x, this.debut.y);
            curveVertex(this.debut.x, this.debut.y);
        }
        else {
            this.parent.draw();
            curveVertex(this.debut.x, this.debut.y);
        }
        if (this.childs.length < 1) {
            curveVertex(this.fin.x, this.fin.y);
            curveVertex(this.fin.x, this.fin.y);
        }
    }
}

class Coord {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

onColorsChanged = () => {
    gardens = data.filter(garden =>
        (garden[".Serres"] && colors.includes('yellow'))
        || (garden[".Médic"] && colors.includes('green'))
        || (garden[".Spon"] && colors.includes('blue'))
        || (garden[".Exotic"] && colors.includes('red'))
    )
    
    root = new Branch(
        new Coord(width / 2, height),
        undefined,
        -1.75,
        50
    )
    var parents = [root];
    leafs = parents;
    while (leafs.length < gardens.length) {
        parents = leafs;
        leafs = [];
        parents.forEach(parent => parent.split())
    }
    redraw();
}
