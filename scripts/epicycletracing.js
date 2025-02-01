//#region General setup

//Get div/canvas ids from html
const canvas = document.getElementById("simulationCanvas");
const ctx = canvas.getContext("2d");
const simulationDiv = document.getElementById("simulation");

//Set dimensions of canvas
canvas.width = simulationDiv.clientWidth;
canvas.height = simulationDiv.clientHeight;

//Import relevant functions/constants/classes
import { cornerRadius, button, drawBackground, complex, complexFFT, dftTestInputs} from "./utils.js";

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
var samples = [];
var prevSample = [];
var tracing = false;

//Things to do with resampling to powers of 2
var newSamples = [];
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
        samples = [];
    }
    if(tracing) {
        if(mouseDown == false) { //Checking if tracing has finished

            //#region Interpolating between start and end points
            tracing = false;
            var avgDis = 0;
            for(var i = 1; i < samples.length; i++) { //Calculate average distance between samples
                avgDis += Math.sqrt(Math.pow(samples[i - 1].re - samples[i].re,2) + 
                Math.pow(samples[i - 1].im - samples[i].im,2)) / samples.length;
            }

            var startEndDis = Math.sqrt(Math.pow(prevSample.re - samples[0].re,2) + 
                            Math.pow(prevSample.im - samples[0].im,2)); //Pythagoras to calculate distance between start and end
            var numOfExtraSamples = Math.max(Math.floor(startEndDis / avgDis) - 1, 2) //Calculate number of extra samples to add

            for(var i = 1; i <= numOfExtraSamples; i++) { //Add sampes by interpolating between start and end points
                samples.push(new complex(
                    [prevSample.re + (i / numOfExtraSamples) * (samples[0].re - prevSample.re),
                    prevSample.im + (i / numOfExtraSamples) * (samples[0].im - prevSample.im)],
                 -1))
            }
            //#endregion
        
            //#region Reconfigure samples to powers of 2
            newSamples = [];
            newSampleLen = Math.pow(2, Math.ceil(Math.log2(samples.length)));
            lerpFactor = [];
            
            for(var i = 0; i < newSampleLen; i++) {
                lerpFactor = [
                    Math.floor(i * samples.length / newSampleLen),
                    (i * samples.length / newSampleLen) % 1
                ] //Gets int and decimal part of sample percentage mapped to sampleLen

                samples.push(samples[samples.length - 1]); //Need to pad out the end

                newSamples.push(new complex(
                    [samples[lerpFactor[0]].re + lerpFactor[1] * (samples[lerpFactor[0] + 1].re - samples[lerpFactor[0]].re),
                    samples[lerpFactor[0]].im + lerpFactor[1] * (samples[lerpFactor[0] + 1].im - samples[lerpFactor[0]].im)],
                -1))

                samples.pop(); //Un-pad out the end (kinda stupid fix)
            }
            samples = newSamples;
            //#endregion

            //#region FFT it up (and create set of epicycles)
            epicycles = [];
            var frequencies = complexFFT(samples)

            for(var i = 0; i < newSampleLen; i++) {
                epicycles.push(new epicycle(frequencies[i].mod / newSampleLen, i, frequencies[i].arg));
                if(i > (newSampleLen / 2))
                    {epicycles[i].angularVelocity = -newSampleLen + i}
            }
            epicycles.sort((a, b) => b.radius - a.radius) // sort epicycles by radius
            //#endregion
        }
        else { //Continuing with the tracing
            samples.push(new complex(mousePos,-1))
        }
        prevSample = samples[samples.length - 1];
    }

    //#endregion

    //#region Draw Trace

    for(var i = 0; i < samples.length - 1; i++) {
        ctx.beginPath();
        ctx.moveTo(samples[i].re,samples[i].im);
        ctx.lineTo(samples[i + 1].re, samples[i + 1].im)
        //ctx.arc(samples[i].re,samples[i].im,2,0,Math.PI * 2)
        ctx.stroke();
    }

    //#endregion

    //#region Draw Epicycles

    if(epicycles.length > 0) {
        var currentPos = epicycles[0].getPosition(0);
        var epicyclePos = [];
        for(var i = 1; i < epicycles.length; i++) {
            epicyclePos = epicycles[i].getPosition(0.025); //Get position of current epicycle

            ctx.beginPath(); //Draw disc around epicycle
            ctx.arc(currentPos[0],currentPos[1],epicycles[i].radius,0,Math.PI * 2);
            ctx.stroke();

            ctx.beginPath(); //Draw connecting line
            ctx.moveTo(currentPos[0], currentPos[1]);
            currentPos = [currentPos[0] + epicyclePos[0], currentPos[1] + epicyclePos[1]]; //Update current position
            ctx.lineTo(currentPos[0], currentPos[1]);
            ctx.stroke();
        }
        console.log(currentPos)
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