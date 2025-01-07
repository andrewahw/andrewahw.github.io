const canvas = document.getElementById("simulationCanvas");
const ctx = canvas.getContext("2d");
const simulationDiv = document.getElementById("simulation");

canvas.width = simulationDiv.clientWidth;
canvas.height = simulationDiv.clientHeight;

import { cornerRadius, button, slider, drawBackground, DFT, inverseDFT, complex} from "./utils.js";

var mousePos = [-1,-1]; //-1 -1 is when mouse is not over the simulation
var mouseStartPos = [-1,-1]; // updates when mouse pressed, resets when mouse released
var mouseDown = false;
var prevMouseDown = false;

const imageBorder = 6;
const xPadding = 80
const yPadding = 50

//Event listners for mouse motion
simulationDiv.addEventListener("mousemove",function(event) {mousePos = [event.offsetX, event.offsetY];});
simulationDiv.addEventListener("mouseleave",function() {mousePos = [-1, -1]; mouseDown = false; prevMouseDown = false;});
simulationDiv.addEventListener("mousedown",function() {mouseDown = true;});
simulationDiv.addEventListener("mouseup",function() {mouseDown = false;});

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

    const numOfChunkRows = 256 / chunkSize;
    const numOfFrequencies = Math.round(Math.ceil((Math.pow(chunkSize, 2) - 1) / 2) * (1 - percentFrequencies))
    //this is actually now number of frequencies to remove

    //Basically do everything
    let chunkData = ctx.createImageData(chunkSize,chunkSize)
    let samples = []
    let frequencies = []
    for(var i = 0; i < Math.pow(numOfChunkRows,2); i++){

        //Getting input chunk
        chunkData = ctx.getImageData(
            inpImagePos[0] + ((i % numOfChunkRows) * chunkSize),
            inpImagePos[1] + (Math.floor(i / numOfChunkRows) * chunkSize),
            chunkSize,chunkSize
        )

        //Performing the DFT and filtering
        for(var j = 0; j < Math.pow(chunkSize, 2); j++) {
            samples[j] = chunkData.data[j * 4] // rgb is same as grayscale, so can sample any channel apart from alpha
        }
        frequencies = DFT(samples)
        var mid = frequencies.length / 2
        for(var j = 0; j < numOfFrequencies; j++) { //applying filter
            frequencies[Math.floor(mid) - j] = new complex([0,0],-1)
            frequencies[Math.ceil(mid) + j] = new complex([0,0],-1)
        }
        samples = inverseDFT(frequencies)
        console.log(samples)
        for(var j = 0; j < samples.length; j++) {
            chunkData.data[(j * 4) + 0] = Math.floor(samples[j])
            chunkData.data[(j * 4) + 1] = Math.floor(samples[j])
            chunkData.data[(j * 4) + 2] = Math.floor(samples[j])
        }

        //Output transformed chunk
        ctx.putImageData(chunkData,
            outImagePos[0] + ((i % numOfChunkRows) * chunkSize),
            outImagePos[1] + (Math.floor(i / numOfChunkRows) * chunkSize),           
        )
    }

    //Turn output chunks into single chunkand update the output image
    outputImageData = ctx.getImageData(outImagePos[0],outImagePos[1],256,256);
}

//Buttons/Sliders and other variables
let frequencyToKeep = 0.5;
let chunkPixelSize = 16;

let frequencySlider = new slider([80,410],250,5,10,1.5,15,"rgba(31, 80, 154, 0.5)","rgba(31, 80, 154, 0.9)");
let chunkSlider = new slider([380,410],250,5,10,1.5,15,"rgba(31, 80, 154, 0.5)","rgba(31, 80, 154, 0.9)");
let runButton = new button([canvas.width/2,yPadding + 128],
    [120,120],"right arrow.png",[100,100],[0,0,0,0],[0,0,0,0],30,15,1.1,imageCompress,
    [[xPadding,yPadding],[canvas.width - xPadding - 256, yPadding],frequencyToKeep,chunkPixelSize])
let imageButton = new button([730,400],[140,40],"empty.png",[0,0],[250,218,122,0.7],[250,218,122,1],15,15,1.1,cycleImage)
//rgba(250, 218, 122, 1)

function mainLoop() {

    drawBackground(canvas, ctx, cornerRadius)

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
    ctx.beginPath()
    ctx.rect(0,350,canvas.width, canvas.height);
    ctx.fill();

    //Manage sliders
    ctx.textAlign = "start"
    ctx.font = "18px Arial";
    ctx.fillStyle = "black";
    ctx.fillText("% Frequencies",frequencySlider.pos[0],frequencySlider.pos[1] - 20);
    ctx.fillText("Chunk Size",chunkSlider.pos[0],chunkSlider.pos[1] - 20);

    frequencySlider.sliderLoop(mousePos,mouseStartPos,mouseDown,prevMouseDown);
    chunkSlider.sliderLoop(mousePos,mouseStartPos,mouseDown,prevMouseDown);
    frequencySlider.sliderDraw(ctx);
    chunkSlider.sliderDraw(ctx);

    //Draw slider text underneath slider and update slider vars
    ctx.textAlign = "center"
    ctx.font = "16px Arial";
    frequencyToKeep = frequencySlider.output
    ctx.fillStyle = "#000000" + (Math.round(255 * frequencySlider.currentTransition / frequencySlider.maxTransition)).toString(16);
    ctx.fillText((Math.round(frequencyToKeep * 100)).toString(),
        frequencySlider.circleX,frequencySlider.pos[1] + 50)

    chunkPixelSize = Math.pow(2,Math.round(chunkSlider.output * 7) + 1);
    ctx.fillStyle = "#000000" + (Math.round(255 * chunkSlider.currentTransition / chunkSlider.maxTransition)).toString(16);
    ctx.fillText(chunkPixelSize.toString(),
        chunkSlider.circleX,frequencySlider.pos[1] + 50)

    //Manage buttons
    runButton.buttonLoop(mousePos,mouseDown,prevMouseDown);
    imageButton.buttonLoop(mousePos,mouseDown,prevMouseDown);
    runButton.buttonDraw(ctx);
    imageButton.buttonDraw(ctx);
    ctx.font = "18px Arial";
    ctx.fillStyle = "black"
    ctx.fillText("Change Image",imageButton.origPos[0] + imageButton.origDim[0] * 0.5, imageButton.origPos[1] + 6)

    //Mouse updating
    if(mouseDown == true && prevMouseDown == false) {mouseStartPos = mousePos}
    else if(mouseDown == false) {mouseStartPos = [-1,-1]}
    prevMouseDown = mouseDown;
}

window.setInterval(mainLoop,15);
