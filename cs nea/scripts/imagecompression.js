const canvas = document.getElementById("simulationCanvas");
const ctx = canvas.getContext("2d");
const simulationDiv = document.getElementById("simulation");

canvas.width = simulationDiv.clientWidth;
canvas.height = simulationDiv.clientHeight;

const cornerRadius = 15;
var mousePos = [-1,-1]; //-1 -1 is when mouse is not over the simulation
var mouseStartPos = [-1,-1]; // updates when mouse pressed, resets when mouse released
var mouseDown = false;
var prevMouseDown = false;

//note: the functions start with m instead of mouse because then there would be overlap with function and variable names
function mMove(event) {mousePos = [event.offsetX, event.offsetY];}
function mExit() {mousePos = [-1, -1]; mouseDown = false; prevMouseDown = false;}
function mDown() {mouseDown = true;}
function mUp() {mouseDown = false;}

function slider(pos,lineLength,lineThickness,circleDiameter) {

    this.pos = pos;
    this.lineLength = lineLength;
    this.lineThickness = lineThickness;
    this.circleDiameter = circleDiameter;

    this.output = 0; //clamped between 0 and 1

    this.sliderLoop = function() {
        
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

for(var i = 0; i < dftTestInputs.length; i++) {
    console.log("test number " + (i+1).toString())
    console.log(DFT(dftTestInputs[i]))
}


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

    //Draw sliers

    //Draw buttons

    //Logic and updating
    if(mouseDown == true && prevMouseDown == false) {mouseStartPos = mousePos}
    else if(mouseDown == false) {mouseStartPos = [-1,-1]}

    //mouse updating
    prevMouseDown = mouseDown;
}

window.setInterval(mainLoop,15);
