//#region General setup

//Get div/canvas ids from html
const canvas = document.getElementById("simulationCanvas");
const ctx = canvas.getContext("2d");
const simulationDiv = document.getElementById("simulation");

//Set dimensions of canvas
canvas.width = simulationDiv.clientWidth;
canvas.height = simulationDiv.clientHeight;

//Import relevant functions/constants/classes
import { cornerRadius, button, drawBackground, complex, FFT, inverseFFT, DFT} from "./utils.js";

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

    this.getPosition = function(timestep) { //Update position by timestep, then returns position
        this.currentAngle = (this.currentAngle + (this.angularVelocity * timestep)) % (Math.PI * 2);
        let position = [this.radius * Math.cos(this.currentAngle), this.radius * Math.sin(this.currentAngle)];
        return position;
    };
}

//#endregion

//#region Simulation specifics

//Things to do with recording the actual sample
var samplesX = [];
var samplesY = [];
var prevSample = [];
var tracing = false;

//Things to do with resampling to powers of 2
var newSamplesX = [];
var newSamplesY = [];
var newSampleLen = [];
var lerpFactor = [];

//Epicycle things
var epicycles = [];

//#endregion

function mainLoop() {

    drawBackground(canvas, ctx, cornerRadius) //Draw background

    //#region Mouse tracing

    if(mouseDown == true && prevMouseDown == false) { //Check to initiate tracing
        tracing = true;
        samplesX = [];
        samplesY = [];
    }
    if(tracing) {
        if(mouseDown == false) { //Checking if tracing has finished

            //#region Interpolating between start and end points
            tracing = false;
            var avgDis = 0;
            for(var i = 1; i < samplesX.length; i++) { //Calculate average distance between samples
                avgDis += Math.sqrt(Math.pow(samplesX[i - 1] - samplesX[i],2) + 
                Math.pow(samplesY[i - 1] - samplesY[i],2)) / samplesX.length;
            }

            var startEndDis = Math.sqrt(Math.pow(prevSample[0] - samplesX[0],2) + 
                            Math.pow(prevSample[1] - samplesY[0],2)); //Pythagoras to calculate distance between start and end
            var numOfExtraSamples = Math.max(Math.floor(startEndDis / avgDis) - 1, 2) //Calculate number of extra samples to add

            for(var i = 1; i <= numOfExtraSamples; i++) { //Add sampes by interpolating between start and end points
                samplesX.push(prevSample[0] + (i / numOfExtraSamples) * (samplesX[0] - prevSample[0]))
                samplesY.push(prevSample[1] + (i / numOfExtraSamples) * (samplesY[0] - prevSample[1]))
            }
            //#endregion
        
            //#region Reconfigure samples to powers of 2
            newSamplesX = [];
            newSamplesY = [];
            newSampleLen = Math.pow(2, Math.ceil(Math.log2(samplesX.length)));
            lerpFactor = [];
            
            for(var i = 0; i < newSampleLen; i++) {
                lerpFactor = [
                    Math.floor(i * samplesX.length / newSampleLen),
                    (i * samplesX.length / newSampleLen) % 1
                ] //Gets int and decimal part of sample percentage mapped to sampleLen

                samplesX.push(samplesX[samplesX.length - 1]); //Need to pad out the end
                samplesY.push(samplesY[samplesY.length - 1]);

                newSamplesX.push(samplesX[lerpFactor[0]] + lerpFactor[1] * (samplesX[lerpFactor[0] + 1] - samplesX[lerpFactor[0]]))
                newSamplesY.push(samplesY[lerpFactor[0]] + lerpFactor[1] * (samplesY[lerpFactor[0] + 1] - samplesY[lerpFactor[0]]))

                samplesX.pop(); //Un-pad out the end (kinda stupid fix)
                samplesY.pop();
            }
            samplesX = newSamplesX;
            samplesY = newSamplesY;
            //#endregion

            //#region FFT it up (and create set of epicycles)
            epicycles = [];
            var frequenciesX = FFT(samplesX)
            var frequenciesY = FFT(samplesY)

            for(var i = 0; i < newSampleLen; i++) { //Why isn't this woorking
                epicycles.push(new epicycle(frequenciesX[i].mod / newSampleLen, i, frequenciesX[i].arg));
                epicycles.push(new epicycle(frequenciesY[i].mod / newSampleLen, i, frequenciesY[i].arg));
            }
            console.log(frequenciesX)
            console.log(frequenciesY)
            console.log(epicycles)
            //#endregion
        }
        else { //Continuing with the tracing
            samplesX.push(mousePos[0]);
            samplesY.push(mousePos[1]);
        }
        prevSample = [samplesX[samplesX.length - 1], samplesY[samplesY.length - 1]];
    }

    //#endregion

    //#region Draw Trace

    for(var i = 0; i < samplesX.length; i++) {
        ctx.beginPath();
        //ctx.moveTo(samplesX[i],samplesY[i]);
        //ctx.lineTo(samples[i + 1][0], samples[i + 1][1])
        ctx.arc(samplesX[i],samplesY[i],2,0,Math.PI * 2)
        ctx.stroke();
    }

    //#endregion

    //#region Draw Epicycles

    var currentPos = [0,0];
    var epicyclePos = [];
    for(var i = 0; i < epicycles.length; i++) {
        epicyclePos = epicycles[i].getPosition(0.1); //Get position of current epicycle
        ctx.beginPath();
        ctx.moveTo(currentPos[0], currentPos[1]);
        ctx.lineTo(currentPos[0] + epicyclePos[0], currentPos[1] + epicyclePos[1])
        ctx.stroke();
        currentPos = [currentPos[0] + epicyclePos[0], currentPos[1] + epicyclePos[1]]; //Update current position
        if(i == epicycles.length - 1) {console.log(currentPos)}
    }

    //not fully done yet lol

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