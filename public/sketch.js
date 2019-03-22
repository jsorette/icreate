colors = [];
gardens = [];

leafs = [];
root = undefined;
NB_LABELS = 5;

setup = () => {
    createCanvas(windowWidth, windowHeight);
    smooth();
    noLoop();
    stroke(0);
}

draw = () => {
    clear();

    if (root && root.childs.length > 0) {
        gardens = gardens.sort((a, b) => a.longitude < b.longitude ? -1: 1);
        leafs = leafs.sort((a, b) => a.fin.x < b.fin.x ? -1 : 1);
        for (var i = 0; i < leafs.length; i++)
            leafs[i].garden = gardens[i];
        
        noFill();
        leafs.forEach(leaf => {
            beginShape();
            leaf.draw();
            endShape();
        })
        
        fill(0);
        for (var i = 0; i < NB_LABELS; i++) {
            var index = Math.round(leafs.length / NB_LABELS * i)
            var leaf = leafs[index];
            ellipse(leaf.fin.x, leaf.fin.y, 5, 5);
            
            textAlign(CENTER);
            text(leaf.garden.Nom + "\n" + leaf.garden.Ville, leaf.fin.x, leaf.fin.y);

        }
    }
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
        this.marked = true;
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
    );
    
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
