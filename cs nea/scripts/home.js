const canvas = document.getElementById("backgroundCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight * 0.98;

const middleX = canvas.width / 2;
const middleY = canvas.height / 2;
const timestep = 10;

function wave(amplitude, angularFrequency,initialX) {

    this.amplitude = amplitude;
    this.angularFrequency = angularFrequency;
    if (initialX != "random") {
        this.currentX = initialX;
    }
    else; {
        this.currentX = Math.random() * 2 * Math.PI
    }

    this.getX = function(timestep) {
        this.currentX = (this.currentX + (this.angularFrequency * timestep)) % (Math.PI * 2);
        return this.currentX;
    };
    this.getY = function(timestep) {
        x = this.getX(timestep);
        return this.amplitude * Math.sin(x);
    };
};

function cycle(radiusDefault,radiusWave,angularVelocityDefault,angularVelocityWave,initialAngle) {

    this.radiusDefault = radiusDefault;
    this.angularVelocityDefault = angularVelocityDefault;
    this.radiusWave = radiusWave;
    this.angularVelocityWave = angularVelocityWave;
    this.currentAngle = initialAngle;

    this.getPosition = function(timestep) {
        var radius = radiusDefault + radiusWave.getY(timestep);
        var angularVelocity = angularVelocityDefault + angularVelocityWave.getY(timestep);
        this.currentAngle = (this.currentAngle + (angularVelocity * timestep)) % (Math.PI * 2);
        let position = [radius * Math.cos(this.currentAngle), radius * Math.sin(this.currentAngle)];
        return position;
    };
}

//Cycle settings is a 2D array with each array containing settings for an individual cycle
//Layout is same order as parameters in cycle
const cycleSettings = [
    [300, new wave(50,0.25,"random"), 0.3, new wave(0.1,0.08,"random"), "random"],
    [150, new wave(30,0.15,"random"), 0.8, new wave(0.25, 0.1, "random"), "random"],
    [90, new wave(25,0.3, "random"), 0.5, new wave(0.5, 0.2, "random"), "random"],
    [50, new wave(15, 0.75, "random"), 0, new wave(0.75, 0.25, "random"), "random"],
    [20, new wave(20, 0.4, "random"), 1, new wave(0.5, 0.1, "random"), "random"]
]
const numOfCycles = cycleSettings.length;

let cycles = [];
let backgroundCycles = [];
for(var i = 0; i < numOfCycles; i++) {
    if(cycleSettings[i][4] == "random") {cycleSettings[i][4] = Math.random() * 2 * Math.PI} 
    cycles[i] = new cycle(cycleSettings[i][0], cycleSettings[i][1], cycleSettings[i][2], cycleSettings[i][3], cycleSettings[i][4]);
    backgroundCycles[i] = new cycle(cycleSettings[i][0], cycleSettings[i][1], cycleSettings[i][2], cycleSettings[i][3], cycleSettings[i][4]);
}
let cyclePos = [];
let backgroundCyclePos = [];

function mainLoop() {

    //Update cycle positions
    cyclePos = [cycles[0].getPosition(timestep / 1000)];
    backgroundCyclePos = [backgroundCycles[0].getPosition(timestep / 3000)];
    for(var i = 1; i < numOfCycles; i++) {
        currentPosition = cycles[i].getPosition(timestep / 1000);
        cyclePos[i] = [currentPosition[0] + cyclePos[i - 1][0], currentPosition[1] + cyclePos[i - 1][1]];

        currentPosition = backgroundCycles[i].getPosition(timestep / 3000);
        backgroundCyclePos[i] = [currentPosition[0] + backgroundCyclePos[i - 1][0], currentPosition[1] + backgroundCyclePos[i - 1][1]];
    }

    //Draw background circles
    ctx.clearRect(0,0,canvas.width, canvas.height);
    ctx.fillStyle = "rgba(212, 235, 248, 0.3)";
    ctx.beginPath();
    ctx.arc(middleX,middleY,800, 0, 2 * Math.PI);
    ctx.fill();
    for(var i = 0; i < numOfCycles; i++) {
        ctx.beginPath();
        ctx.arc(middleX + (backgroundCyclePos[i][1] * 1.25), middleY + (backgroundCyclePos[i][0] * 1.25), 400 * (1 - (i / numOfCycles)), 0, 2 * Math.PI);
        ctx.fill();
    }

    //Draw foreground circles
    ctx.fillStyle = "rgba(227, 142, 73, 0.9)"
    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgba(227, 142, 73, 0.75)";
    ctx.beginPath();
    ctx.arc(middleX, middleY,200, 0, 2 * Math.Pi);
    ctx.stroke();
    for(var i = 0; i < numOfCycles; i++) {
        ctx.beginPath();
        ctx.arc(middleX + cyclePos[i][0], middleY + cyclePos[i][1], 5 + cycleSettings[i][0] * 0.1, 0, 2 * Math.PI);
        ctx.fill();

        //Draw cycle point is moving around
        ctx.beginPath();
        if(i == 0) {ctx.arc(middleX, middleY,cycleSettings[0][0] + cycleSettings[0][1].getY(0), 0, 2 * Math.PI);}
        else {ctx.arc(middleX + cyclePos[i - 1][0], middleY + cyclePos[i - 1][1],Math.abs(cycleSettings[i][0] + cycleSettings[i][1].getY(0)), 0, 2 * Math.PI);}
        ctx.stroke();        
    }

    //Draw line inbetween
    ctx.lineWidth = 5;
    ctx.strokeStyle = "rgba(227, 142, 73, 0.5)";
    ctx.beginPath();
    ctx.moveTo(middleX, middleY);
    ctx.lineTo(middleX + cyclePos[0][0], middleY + cyclePos[0][1]);
    ctx.stroke();
    for(var i = 1; i < numOfCycles; i++) {
        ctx.beginPath();
        ctx.moveTo(middleX + cyclePos[i - 1][0], middleY + cyclePos[i - 1][1]);
        ctx.lineTo(middleX + cyclePos[i][0], middleY + cyclePos[i][1]);
        ctx.stroke();
    }

    //tiny dot at centre
    ctx.beginPath();
    ctx.arc(middleX , middleY, 2.5, 0, 2 * Math.PI);
    ctx.fill();
}

window.setInterval(mainLoop,timestep);