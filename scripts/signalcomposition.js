const canvas = document.getElementById("simulationCanvas");
const ctx = canvas.getContext("2d");
const simulationDiv = document.getElementById("simulation");

canvas.width = simulationDiv.clientWidth;
canvas.height = simulationDiv.clientHeight;

import { cornerRadius, button, drawBackground } from "./utils.js";

var mousePos = [-1,-1]; //-1 -1 is when mouse is not over the simulation
var mouseStartPos = [-1,-1]; // updates when mouse pressed, resets when mouse released
var mouseDown = false;
var prevMouseDown = false;

const maxAngFreq = 4.5;
const minAngFreq = 0.085

//Event listners for mouse motion
simulationDiv.addEventListener("mousemove",function(event) {mousePos = [event.offsetX, event.offsetY];});
simulationDiv.addEventListener("mouseleave",function() {mousePos = [-1, -1]; mouseDown = false; prevMouseDown = false;});
simulationDiv.addEventListener("mousedown",function() {mouseDown = true;});
simulationDiv.addEventListener("mouseup",function() {mouseDown = false;});

//Buttons!
const buttonList = [
    new button([95,390],[60,60], "sawtooth icon.png",[50,50], [212,235,248,0.5],[212,235,248,0.8], 10,15,1.1,loadPreset,0),
    new button([185,390],[60,60], "square icon.png",[50,50], [212,235,248,0.5],[212,235,248,0.8], 10,15,1.1,loadPreset,1),
    new button([275,390],[60,60], "triangle icon.png",[50,50], [212,235,248,0.5],[212,235,248,0.8], 10,15,1.1,loadPreset,2),
    new button([390,390],[80,80], "m icon.png",[60,60], [212,235,248,0.7],[212,235,248,1.0], 25,15,1.1,loadWave,0),
    new button([500,390],[60,60], "one icon.png",[50,50], [212,235,248,0.5],[212,235,248,0.8], 25,15,1.1,loadWave,1),
    new button([590,390],[60,60], "two icon.png",[50,50], [212,235,248,0.5],[212,235,248,0.8], 25,15,1.1,loadWave,2),
    new button([680,390],[60,60], "three icon.png",[50,50], [212,235,248,0.5],[212,235,248,0.8], 25,15,1.1,loadWave,3),
    new button([770,390],[60,60], "four icon.png",[50,50], [212,235,248,0.5],[212,235,248,0.8], 25,15,1.1,loadWave,4),
]
const numOfButtons = buttonList.length;

//Wave classes
function componentWave(amplitude, angularFrequency,phase) {
    this.amplitude = amplitude;
    this.angularFrequency = angularFrequency;
    this.phase = phase;
    this.getY = function(x) {
        return this.amplitude * Math.sin((this.angularFrequency * x) + this.phase);
    }
}
function mainWave(child1, child2, child3, child4) {
    this.componentWave1 = child1;
    this.componentWave2 = child2;
    this.componentWave3 = child3;
    this.componentWave4 = child4;
    this.getY = function(x) {
        return this.componentWave1.getY(x) + this.componentWave2.getY(x)
            + this.componentWave3.getY(x) + this.componentWave4.getY(x)
    }
}

let waveList = ["main wave",
    new componentWave(-1, 0.5, 0),
    new componentWave((Math.random() - 0.5) * 2, minAngFreq + Math.random() * (maxAngFreq - minAngFreq), Math.random() * 2 * Math.PI),
    new componentWave((Math.random() - 0.5) * 2, minAngFreq + Math.random() * (maxAngFreq - minAngFreq), Math.random() * 2 * Math.PI),
    new componentWave((Math.random() - 0.5) * 2, minAngFreq + Math.random() * (maxAngFreq - minAngFreq), Math.random() * 2 * Math.PI)
]
waveList[0] = new mainWave(waveList[1],waveList[2],waveList[3],waveList[4])

//sawtooth wavelist
let sawtoothWaveList = ["main wave",
    new componentWave(-1/1, 0.75 * 1, 0),
    new componentWave(+1/2, 0.75 * 2, 0),
    new componentWave(-1/3, 0.75 * 3, 0),
    new componentWave(+1/4, 0.75 * 3, 0)
]
sawtoothWaveList[0] = new mainWave(sawtoothWaveList[1],sawtoothWaveList[2],sawtoothWaveList[3],sawtoothWaveList[4])

//square wavelist
let squareWaveList = ["main wave",
    new componentWave(-1/1, 0.6 * 1, 0),
    new componentWave(-1/3, 0.6 * 3, 0),
    new componentWave(-1/5, 0.6 * 5, 0),
    new componentWave(-1/7, 0.6 * 7, 0)
]
squareWaveList[0] = new mainWave(squareWaveList[1],squareWaveList[2],squareWaveList[3],squareWaveList[4])

let triangleWaveList = ["main wave",
    new componentWave(-1/1, 0.6 * 1, Math.PI * 0.5),
    new componentWave(-1/9, 0.6 * 3, Math.PI * 0.5),
    new componentWave(-1/16, 0.6 * 5, Math.PI * 0.5),
    new componentWave(-1/25, 0.6 * 7, Math.PI * 0.5)
]
triangleWaveList[0] = new mainWave(triangleWaveList[1],triangleWaveList[2],triangleWaveList[3],triangleWaveList[4])

//list containing all presets
const presetList = [sawtoothWaveList, squareWaveList, triangleWaveList];

//Button functions
function loadWave(waveID) {
    currentWave = waveID;
}
function loadPreset(presetID) {
    for(var i = 1; i < 5; i++)
    {
        waveList[i] = new componentWave(
            presetList[presetID][i].amplitude,presetList[presetID][i].angularFrequency,presetList[presetID][i].phase
        )
    }
    waveList[0] = new mainWave(waveList[1],waveList[2],waveList[3],waveList[4])
    preset = presetID;
}

let currentWave = 0; //0 is main, 1-4 is waves 1-4 repespectively
let preset = -1; //-1 for custom waves, 0-2 for preset

const yAxisHeight = 270;
const xPadding = 60;
const yPadding = 50
let yScale = yAxisHeight / 2;
const xScale = 0.1;
const stepSize = 1;
let waveParametersToEdit = [-1,-1,-1];
// (for wave updating)

function mainLoop() {

    drawBackground(canvas, ctx, cornerRadius)

    //Draw/Handle buttons
    for(var i = 0; i < numOfButtons; i++) {

        let b = buttonList[i];
        if(currentWave + 3 == i || preset == i) {b.currentTransition = b.maxTransition + 1} //check to highlight button
        b.buttonLoop(mousePos, mouseDown, prevMouseDown);
        b.buttonDraw(ctx);
    }

    //Draw wave axes
    ctx.lineWidth = 6;
    ctx.strokeStyle = "black";

    ctx.beginPath();
    ctx.moveTo(xPadding,yPadding - 10);
    ctx.lineTo(xPadding,yPadding + yAxisHeight + 10);
    ctx.lineTo(xPadding,yPadding + yAxisHeight/2);
    ctx.lineTo(canvas.width - xPadding,yPadding + yAxisHeight/2);
    ctx.stroke();

    //Draw wave
    if(currentWave == 0) {yScale = yAxisHeight / 8}
    else {yScale = yAxisHeight / 2}
    ctx.lineWidth = 4;

    ctx.moveTo(xPadding,yPadding + yAxisHeight/2);
    for(var i = 0; i < canvas.width - (2 * xPadding) - stepSize; i += stepSize) {
        ctx.beginPath();
        ctx.moveTo(xPadding + i,yPadding + (yAxisHeight/2) + waveList[currentWave].getY(xScale * i) * yScale)
        ctx.lineTo(xPadding + i + stepSize,yPadding + (yAxisHeight/2) + waveList[currentWave].getY(xScale * (i + stepSize)) * yScale);
        ctx.stroke();
    }

    //Wave/mouse updating
    if(mouseDown == true && prevMouseDown == false
        && mousePos[0] < (canvas.width - xPadding) && mousePos[0] > xPadding
        && mousePos[1] < yPadding + yAxisHeight && mousePos[1] > yPadding
        && currentWave > 0)
    {
        mouseStartPos = [mousePos[0],mousePos[1]]
        waveParametersToEdit = [waveList[currentWave].amplitude, waveList[currentWave].angularFrequency, waveList[currentWave].phase]
    }
    if(mouseDown == false) {mouseStartPos = [-1, -1]}
    if(mouseStartPos[0] < (canvas.width - xPadding) && mouseStartPos[0] > xPadding
    && mouseStartPos[1] < yPadding + yAxisHeight && mouseStartPos[1] > yPadding
    && currentWave > 0 && mouseDown == true && prevMouseDown == true)
    {
        preset = -1
        var mouseRel = [
            mousePos[0] - mouseStartPos[0],
            mousePos[1] - mouseStartPos[1]
        ]
        var wavePeriod = Math.PI * 2 / (xScale * waveList[currentWave].angularFrequency);
        var percentPeriod = mouseRel[0] / wavePeriod; 

        //Update angular frequency and amplitude only if mouse started not near x axis
        if(mouseStartPos[1] > ((yAxisHeight/2) + yPadding + 15) || mouseStartPos[1] < ((yAxisHeight/2) + yPadding - 15)) {

            //Update amplitude
            var vertNormalisedMouseRel = mouseRel[1] / (yAxisHeight / 2) // normalised section of vertical mouse rel
            waveList[currentWave].amplitude = Math.max(Math.min(waveParametersToEdit[0] - vertNormalisedMouseRel,1),-1)

            //Update frequency
            if(percentPeriod != 0) {
                waveList[currentWave].angularFrequency = Math.max(Math.min(waveParametersToEdit[1] / (mousePos[0] / mouseStartPos[0]),maxAngFreq),minAngFreq);
            }

        }
        //Update phase instead if mouse started near x axis
        else {
            waveList[currentWave].phase = (waveParametersToEdit[2] - (percentPeriod * 2 * Math.PI)) % (2 * Math.PI);
        }
    }

    //mouse updating
    prevMouseDown = mouseDown;
}

window.setInterval(mainLoop,15);
