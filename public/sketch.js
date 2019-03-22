colors = [];
gardens = [];

var leafs = [];
var bg = 0;
var fg = 255;
var root;

setup = () => {
    createCanvas(windowWidth, windowHeight);
    smooth();
    background(fg);
    stroke(bg);
    root = new Branch(
        new Coord(width / 2, height),
        null,
        -HALF_PI,
        100
    )
    var parents = [root];
    parents.map(parent => parent.split())
    while (leafs.length < 194) {
        parents = leafs;
        leafs = [];
        parents.map(parent => parent.split())
    }
}

draw = () => {
    root.draw();
}

class Branch {
    constructor(debut, parent, rotation, length) {
        this.debut = debut;
        this.fin = new Coord(debut.x + length * cos(rotation), debut.y + length * sin(rotation));
        this.parent = parent;
        this.childs = [];
        this.rotation = rotation;
        this.length = length;
    }

    split = () => {
        for (var i = 0; i < 2; i++) {
            var child = new Branch(
                this.fin,
                this,
                this.rotation + random(-1, 1),
                this.length * 1
            )
            this.childs.push(child);
            leafs.push(child);
        }
    }

    draw = () => {
        line(this.debut.x, this.debut.y, this.fin.x, this.fin.y);
        this.childs.forEach(child => child.draw());
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
}
