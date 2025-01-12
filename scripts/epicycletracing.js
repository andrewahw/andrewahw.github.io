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

function mainLoop() {

    drawBackground(canvas, ctx, cornerRadius) //Draw background

    //#region Mouse updating

    //Update mouseStartPos if mouse clicked
    if(mouseDown == true && prevMouseDown == false) {mouseStartPos = mousePos}
    else if(mouseDown == false) {mouseStartPos = [-1,-1]}
    prevMouseDown = mouseDown; //Update prevMouseDown

    //#endregion
}

//Set main loop function to occur every 15ms
window.setInterval(mainLoop,15);
