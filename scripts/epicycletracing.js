//#region General setup

//Get div/canvas ids from html
const canvas = document.getElementById("simulationCanvas");
const ctx = canvas.getContext("2d");
const simulationDiv = document.getElementById("simulation");

//Set dimensions of canvas
canvas.width = simulationDiv.clientWidth;
canvas.height = simulationDiv.clientHeight;

//Import relevant functions/constants/classes
import { cornerRadius, button, drawBackground, complex, FFT, inverseFFT} from "./utils.js";

//Set up mouse variables
var mousePos = [-1,-1]; //-1 -1 is when mouse is not over the simulation
var mouseStartPos = [-1,-1]; // updates when mouse pressed, resets when mouse released
var mouseDown = false;
var prevMouseDown = false;

//Event listeners for mouse motion
simulationDiv.addEventListener("mousemove",function(event) {mousePos = [event.offsetX, event.offsetY];});
simulationDiv.addEventListener("mouseleave",function() {mousePos = [-1, -1]; mouseDown = false; prevMouseDown = false;});
simulationDiv.addEventListener("mousedown",function() {mouseDown = true;});
simulationDiv.addEventListener("mouseup",function() {mouseDown = false;});

//#endregion

//#region Wave Objects

function epicycle(radius,angularVelocity,initialAngle) {

    this.radius = radius;
    this.angularVelocity = angularVelocity;
    this.currentAngle = initialAngle;

    this.getPosition = function(timestep) {
        this.currentAngle = (this.currentAngle + (this.angularVelocity * timestep)) % (Math.PI * 2);
        let position = [this.radius * Math.cos(this.currentAngle), this.radius * Math.sin(this.currentAngle)];
        return position;
    };
}

//#endregion

//#region Simulation specifics

var samples = [];
var traceLen = 0;
var tracing = false;

//#endregion

function mainLoop() {

    drawBackground(canvas, ctx, cornerRadius) //Draw background

    //#region Mouse tracing

    if(mouseDown == true && prevMouseDown == false) {
        tracing = true;
        traceLen = 0;
        samples = []
    }
    if(tracing) {
        if(mouseDown == false) {
            tracing = false;
            var avgDis = traceLen / samples.length;
            var lastSample = samples[samples.length - 1];
            var startEndDis = Math.sqrt(Math.pow(lastSample[0] - samples[0][0],2) + 
                            Math.pow(lastSample[1] - samples[0][1],2));
            var numOfExtraSamples = Math.floor(startEndDis / avgDis) - 1
            for(var i = 0; i < numOfExtraSamples; i++) {
                samples[samples.length] = [
                    lastSample[0] + (i / numOfExtraSamples) * (lastSample[0] - samples[0][0]),
                    lastSample[1] + (i / numOfExtraSamples) * (lastSample[1] - samples[0][1]),
                ]
            }
        }
        else {
            var prevSample = samples[samples.length - 1];
            samples[samples.length] = mousePos;
            traceLen += Math.sqrt(Math.pow(prevSample[0] - mousePos[0],2) + 
                        Math.pow(prevSample[1] - mousePos[1],2));
        }
    }

    //#endregion

    //#region draw trace

    for(var i = 0; i < samples.length - 1; i++) {
        ctx.beginPath();
        ctx.moveTo(samples[i][0],samples[i][1]);
        ctx.lineTo(samples[i + 1][0], samples[i + 1][1])
        ctx.stroke();
    }

    //#endregion

    //#region Mouse updating

    //Update mouseStartPos if mouse clicked
    if(mouseDown == true && prevMouseDown == false) {mouseStartPos = mousePos}
    else if(mouseDown == false) {mouseStartPos = [-1,-1]}
    prevMouseDown = mouseDown; //Update prevMouseDown

    //#endregion
}

//Set main loop function to occur every 15ms
window.setInterval(mainLoop,15);
