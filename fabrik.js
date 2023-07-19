const svgns = "http://www.w3.org/2000/svg"
class Point {
    constructor(canvas, x, y, locked = false, connected = []) {
        this.canvas = canvas
        this.x = x;
        this.y = y;
        this.tempx = 0;
        this.tempy = 0;
        this.iterated = 0;
        this.locked = locked;
        this.lengths = [];
        this.connected = [];
        this.tick = Date.now();
        this.stickLength = 50;
        this.maxLength = 10;
        this.clicked = () => {console.log("hi");}
        for (let i = 0; i < connected.length; i++) {
            this.addConnection(connected[i])
        }

        this.sticks = [];
        // this.calculateLength()
        this.circle = document.createElementNS(svgns, "circle");
        this.circle.classList.add("circle");
        canvas.append(this.circle);
        this.render()

        this.circle.addEventListener("mousedown", (e) => {
            this.clicked();
        })

    }

    addToTemp = (x,y)=>{
        // console.log(x,y);
        this.tempx += x;
        this.tempy += y;
        this.iterated = this.iterated + 1;
        // console.log("att",this.tempx / this.iterated);
    }

    getFinalCoord = async ()=>{
        this.x = this.tempx / this.iterated || this.x;
        this.y = this.tempy / this.iterated || this.y;

        // console.log("fc",this.iterated);
        
    }

    render = () => {
        this.tick = Date.now();
        this.tempx = 0;
        this.tempy = 0;
        this.iterated = 0;

        this.pullConnectors(1);

        this.circle.setAttributeNS(null, 'cx', this.x);
        this.circle.setAttributeNS(null, 'cy', this.y);
        this.circle.setAttributeNS(null, 'r', 10);

        this.circle.classList.toggle("locked", this.locked);
    }

    addConnection = (p) => {
        this.connected.push(p);
        // this.lengths.push(distance(this, p));
        this.lengths.push(this.stickLength);
        p.connected.push(this);
        p.lengths.push(this.stickLength);
    }

    pullConnectors = async (iteration = 2) => {

        for(let ind = 0; ind < this.connected.length; ind++){
            let val = this.connected[ind];
            let origLen = this.lengths[ind];
            await val.changePositionRecursive(this, origLen, iteration);
        }
        // console.log(this.tempx / this.iterated);
        await this.getFinalCoord()
    }

    changePositionRecursive = (caller, targetLength, iteration = 0, p = 0.9) => {
        
        if (!this.locked) {
            let d = { x: this.x - caller.x, y: this.y - caller.y };
            let nowLen = Math.min(Math.sqrt(d.x * d.x + d.y * d.y));
            let targetVector = { x: (d.x / nowLen) * targetLength + caller.x, y: (d.y / nowLen) * targetLength + caller.y };
            let tx = (this.x * (1-p) + targetVector.x * (p));
            let ty = (this.y * (1-p) + targetVector.y * (p));
            // console.log(this.x * (1 - p) + targetVector.x * p,this.y * (1 - p) + targetVector.y * p);
            this.addToTemp(tx,ty);
        }

        if (iteration > 0) {
            caller.changePositionRecursive(this, targetLength, iteration - 1);
        }
        
    }

}

function distance(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
}