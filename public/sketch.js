
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
    background(255);

    if (root && root.childs.length > 0)
        leafs.forEach(leaf => {

          strokeWeight(0.5);

            var type = ".Spon.Médic.Exotic.Serre";
            var decalage = 0;
            if (type.includes(".Spon")){
              beginShape();
              noFill();
              stroke(255,21,17);
              //stroke(105,105,105);

              leaf.draw(2);
              decalage+=3;
              endShape();
            }
            if (type.includes(".Exotic")){
              beginShape();
              noFill();
              stroke(4,163,255);

              //stroke(155,155,155);

              leaf.draw(2);
              decalage+=3;
              endShape();
            }
            if (type.includes(".Serres")){
              beginShape();
              noFill();
              stroke(232,145,21);
              //stroke(205,205,205);

              leaf.draw(2);
              decalage+=3;
              endShape();
            }
            if (type.includes(".Médic")){
              beginShape();
              noFill();
              stroke(21,232,78);
            //  stroke(255,255,255);

              leaf.draw(2);
              decalage+=3;
              endShape();
            }

        })
}

class Branch {
    constructor(debut, parent, rotation, length) {
        this.debut = debut;
        this.fin = new Coord(debut.x + length * cos(rotation), debut.y + length * sin(rotation));
        if(this.debut.y < this.fin.y){
          this.fin.y = this.fin.y-(2*(this.fin.y-this.debut.y));
        }
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

    draw = (decalage) => {

      var plusOrMinus = () => Math.random() < 0.5 ? -1 : 1;

        if (!this.parent || this.parent.marked) {
            curveVertex(this.debut.x+(decalage*plusOrMinus()), this.debut.y+(decalage*plusOrMinus()));
            curveVertex(this.debut.x+(decalage*plusOrMinus()), this.debut.y+(decalage*plusOrMinus()));
        }
        else {
            this.parent.draw(decalage);
            curveVertex(this.debut.x+(decalage*plusOrMinus()), this.debut.y+(decalage*plusOrMinus()));
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
        46
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
