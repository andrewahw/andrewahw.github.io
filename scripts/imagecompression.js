const canvas = document.getElementById("simulationCanvas");
const ctx = canvas.getContext("2d");
const simulationDiv = document.getElementById("simulation");

canvas.width = simulationDiv.clientWidth;
canvas.height = simulationDiv.clientHeight;

import { cornerRadius } from "./utils";

var mousePos = [-1,-1]; //-1 -1 is when mouse is not over the simulation
var mouseStartPos = [-1,-1]; // updates when mouse pressed, resets when mouse released
var mouseDown = false;
var prevMouseDown = false;

const imageBorder = 6;
const xPadding = 80
const yPadding = 50

//note: the functions start with m instead of mouse because then there would be overlap with function and variable names
function mMove(event) {mousePos = [event.offsetX, event.offsetY];}
function mExit() {mousePos = [-1, -1]; mouseDown = false; prevMouseDown = false;}
function mDown() {mouseDown = true;}
function mUp() {mouseDown = false;}

//UI elements (can't import them sadly)
function slider(pos,lineLength,lineThickness,circleRadius,circleScale,transition, lineColour, circleColour) {

    this.pos = pos;
    this.lineLength = lineLength;
    this.lineThickness = lineThickness;

    this.circleX = this.pos[0]
    this.circlePrevX = this.pos[0]
    this.circleRadius = circleRadius;
    this.circleMinRadius = circleRadius;
    this.circleScale = circleScale

    this.output = 0; //clamped between 0 and 1

    this.currentTransition = 0;
    this.maxTransition = transition;
    this.sliding = false

    this.lineColour = lineColour;
    this.circleColour = circleColour;

    this.sliderLoop = function() {

        this.output = (this.circleX - this.pos[0]) / this.lineLength;

        //Calculate distances
        var disToCircleClick = Math.sqrt(
            Math.pow(mouseStartPos[0] - this.circleX,2) + 
            Math.pow(mouseStartPos[1] - this.pos[1],2)
        )
        var disToCircleCurrent = Math.sqrt(
            Math.pow(mousePos[0] - this.circleX,2) + 
            Math.pow(mousePos[1] - this.pos[1],2)
        )

        //Animation on user hover
        if(disToCircleCurrent < circleRadius) {
            this.currentTransition = Math.min(this.currentTransition + 1, this.maxTransition);
        }
        else {
            this.currentTransition = Math.max(this.currentTransition - 1, 0);
        }
        var percentTransition = this.currentTransition / this.maxTransition;
        var currentAnimation = (2 / (1 + Math.exp(-6 * percentTransition))) + 1;
        this.circleRadius = this.circleMinRadius * (currentAnimation * (this.circleScale - 1));

        if(disToCircleClick < circleRadius
            && mouseStartPos != [-1,-1] && this.sliding == false) { //Check to initiate the sliding
                this.sliding = true
                this.circlePrevX = this.circleX;
        }
        if(mouseDown == true && prevMouseDown == true && this.sliding == true) { //Slide
            this.circleRadius = this.circleMinRadius * this.circleScale
            this.circleX = this.circlePrevX + (mousePos[0] - mouseStartPos[0]) //update circle
            this.circleX = Math.max(Math.min(this.circleX, this.pos[0] + this.lineLength), this.pos[0]) // clamp circle
        }
        if(mouseDown == false) {this.sliding = false}
    }

    this.sliderDraw = function() {
        ctx.lineWidth = this.lineThickness;
        ctx.strokeStyle = this.lineColour;
        ctx.beginPath();
        ctx.moveTo(this.pos[0],this.pos[1]);
        ctx.lineTo(this.pos[0] + this.lineLength, this.pos[1])
        ctx.stroke();

        ctx.fillStyle = circleColour;
        ctx.beginPath();
        ctx.arc(this.circleX,this.pos[1],this.circleRadius,0, Math.PI * 2);
        ctx.fill();
    }
}

function button(position, dimensions, imgLink, imgDimensions, colour, colourTransition, borderRadius, transition, transitionScale,onClick, onClickArguments) {

    this.origPos = position;
    this.origDim = dimensions;
    this.origBorderRadius = borderRadius;
    this.origImgDim = imgDimensions;

    this.pos = position; //position and dimensions are a 2d vector with x/width and y/height respectively
    this.dim = dimensions;
    this.onClick = function() {onClick(onClickArguments);}

    this.imageLink = "../images/" + imgLink
    this.image = new Image();
    this.image.src = this.imageLink
    this.imageDim = imgDimensions;

    this.origColour = colour; // colours are in 4d array (rgba) to make colour interpolation easier
    this.transColour = colourTransition; // colour it transitions to when hovered
    this.colour = colour; // current colour
    this.borderRadius = borderRadius;

    this.currentTransition = 0;
    this.maxTransition = transition;
    this.transitionMaxScale = transitionScale;

    this.buttonLoop = function() {
        
        //Mouse user handling
        if(mousePos[0] > this.pos[0] && mousePos[0] < (this.pos[0] + this.dim[0])
        && mousePos[1] > this.pos[1] && mousePos[1] < (this.pos[1] + this.dim[1])) {
            this.currentTransition = Math.min(this.currentTransition + 1, this.maxTransition);
            if(mouseDown == true && prevMouseDown == false) {this.onClick();}
        }
        else {
            this.currentTransition = Math.max(this.currentTransition - 1, 0);
        }

        //Position and dimension and colour updating
        var percentTransition = this.currentTransition / this.maxTransition;
        var currentAnimation = (2 / (1 + Math.exp(-6 * percentTransition)));
        var currentScale = 1 + ((transitionScale - 1) * currentAnimation);

        this.dim = [this.origDim[0] * currentScale, this.origDim[1] * currentScale];
        this.imageDim = [this.origImgDim[0] * currentScale, this.origImgDim[1] * currentScale];
        this.pos = [this.origPos[0] - (0.5 * this.dim[0]), this.origPos[1] - (0.5 * this.dim[1])];

        this.borderRadius = this.origBorderRadius * ((1.2 / (1 + Math.exp(6 * percentTransition))) + 0.4); // border is special

        //note: I know there's better ways of colour interpolation, but in general the animations are pretty short so shouldn't matter
        var currentColourArray = [
            this.origColour[0] + ((this.transColour[0] - this.origColour[0]) * percentTransition),
            this.origColour[1] + ((this.transColour[1] - this.origColour[1]) * percentTransition),
            this.origColour[2] + ((this.transColour[2] - this.origColour[2]) * percentTransition),
            this.origColour[3] + ((this.transColour[3] - this.origColour[3]) * percentTransition),
        ]
        this.colour = "#"
            + Math.floor(currentColourArray[0]).toString(16)
            + Math.floor(currentColourArray[1]).toString(16)
            + Math.floor(currentColourArray[2]).toString(16)
            + Math.floor(currentColourArray[3] * 255).toString(16)
    }

    this.buttonDraw = function() {
        ctx.beginPath(); //Main body
        ctx.fillStyle = this.colour;
        ctx.arc(this.pos[0] + this.borderRadius, this.pos[1] + this.borderRadius, this.borderRadius, Math.PI, 1.5 * Math.PI);
        ctx.arc(this.pos[0] + this.dim[0] - this.borderRadius, this.pos[1] + this.borderRadius, this.borderRadius, 1.5 * Math.PI, 0);
        ctx.arc(this.pos[0] + this.dim[0] - this.borderRadius, this.pos[1] + this.dim[1] - this.borderRadius, this.borderRadius, 0, 0.5 * Math.PI);
        ctx.arc(this.pos[0] + this.borderRadius, this.pos[1] + this.dim[1] - this.borderRadius, this.borderRadius, 0.5 * Math.PI, Math.PI);
        ctx.fill();

        ctx.drawImage(this.image,this.pos[0] + ((this.dim[0] - this.imageDim[0]) / 2),
            this.pos[1] + ((this.dim[1] - this.imageDim[1]) / 2),this.imageDim[0],this.imageDim[1]);
    }
}

//DFT and related
function complex(cartesian, polar) {

    this.re = 0;
    this.im = 0;
    this.mod = 0;
    this.arg = 0;

    if(polar == -1) {
        this.re = cartesian[0];
        this.im = cartesian[1];
        this.mod = (this.re * this.re) + (this.im * this.im);
        this.arg = Math.atan2(this.im, this.re);
    }
    else if(cartesian == -1) {
        this.mod = polar[0];
        this.arg = polar[1];
        this.re = this.mod * Math.cos(this.arg);
        this.im = this.mod * Math.sin(this.arg);
    }

    //Updates modulus/argument ("cartesian" or "polar")
    this.updateVars = function(update) {
        if(update = "cartesian") {
            this.re = this.mod * Math.cos(this.arg);
            this.im = this.mod * Math.sin(this.arg);
        }
        else if(update = "polar") {
            this.mod = (this.re * this.re) + (this.im * this.im);
            this.arg = Math.atan2(this.im, this.re);            
        }
    }
}

function multComplex(complex1, complex2) {
    var complexResult = new complex(
        (complex1.re * complex2.re) - (complex1.im * complex2.im),
        (complex1.re * complex2.im) + (complex2.re * complex1.im)
    )
    return complexResult;
}
function addComplex(complex1, complex2) {
    var complexResult = new complex(
        complex1.re + complex2.re,
        complex1.im + complex2.im
    )
    return complexResult;
}

function DFT(samples) {
    var frequencies = []
    var sampleLen = samples.length
    for(var i = 0; i < sampleLen; i++) {
        var currentFrequencyReal = 0
        var currentFrequencyImag = 0
        for(var j = 0; j < sampleLen; j++)
        {
            currentFrequencyReal += samples[j] * Math.cos(Math.PI * 2 * (i * j / sampleLen))
            currentFrequencyImag += samples[j] * -Math.sin(Math.PI * 2 * (i * j / sampleLen))
        }
        frequencies[i] = new complex([currentFrequencyReal,currentFrequencyImag],-1)
    }
    return frequencies
}

const dftTestInputs = [
    [0, -6, -1, -10, 8],
    [-7, 7, -9, 6, 3, -10],
    [5, 4, 10, -6, -3, 9, 10],
    [0, 0, -6, -1, 4, -10, -9, -2],
    [5, 4, 1, 0, -9, 7, -5, 8, 9],
    [-2, 6, 4, 2, -10, 1, 2, -5, -3, -1],
    [2, 4, -3, 2, -7, 0, 0, -7, 3, -8, 3],
    [2, -4, 10, 5, 0, -8, 8, 10, -3, 0, -4, -5],
    [-2, 3, 6, 10, 10, -2, -6, -8, -2, -1, 10, -3, -6],
    [-5, 3, 2, -4, -4, 3, 10, -1, -7, 3, 3, 5, 1, -6]
]

//Setting up images
let imageNo = 0
const numOfImages = 5
let imageObjects = []
for(var i = 0; i < numOfImages; i++) {
    imageObjects[i] = new Image()
    imageObjects[i].src = "../images/imagecompress " + (i + 1).toString() + ".png"
}
let outputImageData = ctx.createImageData(256,256);

//Button functions
function cycleImage() {imageNo = (imageNo + 1) % numOfImages;}

function imageCompress(argumentArray) { //Note: only works with square image of size 256
    const inpImagePos = argumentArray[0]
    const outImagePos = argumentArray[1]
    const percentFrequencies = argumentArray[2] //percentage of frequencies to keep
    const chunkSize = argumentArray[3] //size of each chunk in pixels

    const numOfChunks = Math.pow(256 / chunkSize, 2);

    //Basically do everything
    let chunkData = ctx.createImageData(chunkSize,chunkSize)
    for(var i = 0; i < numOfChunks; i++){

        let chunkData = ctx.getImageData(
            inpImagePos[0] + ((i % chunkSize) * chunkSize),
            inpImagePos[1] + (Math.floor(i / chunkSize) * chunkSize),
            chunkSize - 1,chunkSize - 1
        )

        //Output transformed chunk
        ctx.putImageData(chunkData,
            outImagePos[0] + ((i % chunkSize) * chunkSize),
            outImagePos[1] + (Math.floor(i / chunkSize) * chunkSize),            
        )
    }

    //Turn output chunks into single chunkand update the output image
    outputImageData = ctx.getImageData(outImagePos[0],outImagePos[1],256,256);
}


//Buttons/Sliders
let frequencySlider = new slider([80,410],250,5,10,1.5,15,"rgba(31, 80, 154, 0.5)","rgba(31, 80, 154, 0.9)");
let chunkSlider = new slider([380,410],250,5,10,1.5,15,"rgba(31, 80, 154, 0.5)","rgba(31, 80, 154, 0.9)");
let runButton = new button([canvas.width/2,yPadding + 128],
    [100,100],"right arrow.png",[100,100],[0,0,0,0],[0,0,0,0],25,15,1.1,imageCompress,
    [[xPadding,yPadding],[canvas.width - xPadding - 256, yPadding],1,8])
let imageButton = new button([730,400],[140,40],"empty.png",[0,0],[250,218,122,0.7],[250,218,122,1],15,15,1.1,cycleImage)
//rgba(250, 218, 122, 1)

function mainLoop() {

    ctx.clearRect(0,0,canvas.width, canvas.height);

    //Draw background (white with rounded corners)
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(cornerRadius, cornerRadius, cornerRadius,Math.PI, 1.5 * Math.PI);
    ctx.arc(canvas.width - cornerRadius, cornerRadius, cornerRadius,1.5 * Math.PI, 0);
    ctx.arc(canvas.width - cornerRadius, canvas.height - cornerRadius, cornerRadius,0, 0.5 * Math.PI);
    ctx.arc(cornerRadius, canvas.height - cornerRadius, cornerRadius,0.5 * Math.PI, Math.PI);
    ctx.fill();

    //Draw image
    ctx.lineWidth = imageBorder;
    ctx.strokeStyle = "rgba(31, 80, 154, 0.5)"
    ctx.beginPath();
    ctx.rect(xPadding - imageBorder/2, yPadding - imageBorder/2,
        256 + imageBorder,256 + imageBorder);
    ctx.drawImage(imageObjects[imageNo],xPadding, yPadding);
    ctx.stroke();

    ctx.beginPath();
    ctx.rect(canvas.width - xPadding - 256 - imageBorder/2, yPadding - imageBorder/2,
        256 + imageBorder,256 + imageBorder);
    ctx.stroke();
    ctx.putImageData(outputImageData,canvas.width - xPadding - 256, yPadding);

    //Mini background
    ctx.fillStyle = "rgba(212, 235, 248, 0.8)";
    ctx.rect(0,350,canvas.width, canvas.height);
    ctx.fill();

    //Manage sliders
    ctx.font = "18px Arial";
    ctx.fillStyle = "black";
    ctx.fillText("% Frequencies",frequencySlider.pos[0],frequencySlider.pos[1] - 20);
    ctx.fillText("Chunk Size",chunkSlider.pos[0],chunkSlider.pos[1] - 20);
    frequencySlider.sliderLoop();
    frequencySlider.sliderDraw();
    chunkSlider.sliderLoop();
    chunkSlider.sliderDraw();

    //Manage buttons
    runButton.buttonLoop();
    imageButton.buttonLoop();
    runButton.buttonDraw();
    imageButton.buttonDraw();
    ctx.fillStyle = "black"
    ctx.fillText("Change Image",imageButton.origPos[0] - imageButton.origDim[0] * 0.5 + 10, imageButton.origPos[1] + 6)

    //Mouse updating
    if(mouseDown == true && prevMouseDown == false) {mouseStartPos = mousePos}
    else if(mouseDown == false) {mouseStartPos = [-1,-1]}
    prevMouseDown = mouseDown;
}

window.setInterval(mainLoop,15);
