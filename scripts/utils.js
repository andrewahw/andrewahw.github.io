//#region UI related

export const cornerRadius = 15; // Radius of the background corners

export function drawBackground(canvas, ctx, cornerRadius) { //Draw white background
    ctx.clearRect(0,0,canvas.width, canvas.height);

    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(cornerRadius, cornerRadius, cornerRadius,Math.PI, 1.5 * Math.PI);
    ctx.arc(canvas.width - cornerRadius, cornerRadius, cornerRadius,1.5 * Math.PI, 0);
    ctx.arc(canvas.width - cornerRadius, canvas.height - cornerRadius, cornerRadius,0, 0.5 * Math.PI);
    ctx.arc(cornerRadius, canvas.height - cornerRadius, cornerRadius,0.5 * Math.PI, Math.PI);
    ctx.fill();
}

export function button(position, dimensions, imgLink, imgDimensions, colour, colourTransition, borderRadius, transition, transitionScale,onClick, onClickArguments) { //Button class

    //Original size (as size changes when held over)
    this.origPos = position; //position and dimensions are a 2d vector with x/width and y/height respectively
    this.origDim = dimensions;
    this.origBorderRadius = borderRadius;
    this.origImgDim = imgDimensions;

    //Current position/Dimensions
    this.pos = position;
    this.dim = dimensions;
    this.borderRadius = borderRadius;
    this.onClick = function() {onClick(onClickArguments);} //Setup function that runs when clicked

    //Image setup (making image object with dimensions)
    this.imageLink = "../images/" + imgLink
    this.image = new Image();
    this.image.src = this.imageLink
    this.imageDim = imgDimensions;

    //Colour setting up
    this.origColour = colour; // colours are in 4d array (rgba) to make colour interpolation easier
    this.transColour = colourTransition; // colour it transitions to when hovered
    this.colour = colour; // current colour

    //Animation scaling
    this.currentTransition = 0;
    this.maxTransition = transition;
    this.transitionMaxScale = transitionScale;

    this.buttonLoop = function(mousePos, mouseDown, prevMouseDown) { //Function that runs every cycle
        
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

    this.buttonDraw = function(ctx) { //Draws button (also called every cycle)

        ctx.beginPath(); //Main body (rectangle with rounded corners)
        ctx.fillStyle = this.colour;
        ctx.arc(this.pos[0] + this.borderRadius, this.pos[1] + this.borderRadius, this.borderRadius, Math.PI, 1.5 * Math.PI);
        ctx.arc(this.pos[0] + this.dim[0] - this.borderRadius, this.pos[1] + this.borderRadius, this.borderRadius, 1.5 * Math.PI, 0);
        ctx.arc(this.pos[0] + this.dim[0] - this.borderRadius, this.pos[1] + this.dim[1] - this.borderRadius, this.borderRadius, 0, 0.5 * Math.PI);
        ctx.arc(this.pos[0] + this.borderRadius, this.pos[1] + this.dim[1] - this.borderRadius, this.borderRadius, 0.5 * Math.PI, Math.PI);
        ctx.fill();

        ctx.drawImage(this.image,this.pos[0] + ((this.dim[0] - this.imageDim[0]) / 2), //Drawing image icon
            this.pos[1] + ((this.dim[1] - this.imageDim[1]) / 2),this.imageDim[0],this.imageDim[1]);
    }
}

export function slider(pos,lineLength,lineThickness,circleRadius,circleScale,transition, lineColour, circleColour, defaultOutput) {

    this.pos = pos;
    this.lineLength = lineLength;
    this.lineThickness = lineThickness;

    this.circleX = this.pos[0] + (this.lineLength * defaultOutput)
    this.circlePrevX = this.circleX
    this.circleRadius = circleRadius;
    this.circleMinRadius = circleRadius;
    this.circleScale = circleScale

    this.output = defaultOutput; //clamped between 0 and 1

    this.currentTransition = 0;
    this.maxTransition = transition;
    this.sliding = false

    this.lineColour = lineColour;
    this.circleColour = circleColour;

    this.sliderLoop = function(mousePos, mouseStartPos, mouseDown, prevMouseDown) {

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

        if(disToCircleClick < circleRadius && this.sliding == false) { //Check to initiate the sliding
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

    this.sliderDraw = function(ctx) {
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

//#endregion

//#region DFT/Complex related
export function complex(cartesian, polar) {

    this.re = 0;
    this.im = 0;
    this.mod = 0;
    this.arg = 0;

    if(polar == -1) {
        this.re = cartesian[0];
        this.im = cartesian[1];
        this.mod = Math.sqrt((this.re * this.re) + (this.im * this.im));
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

export function multComplex(complex1, complex2) {
    var complexResult = new complex(
        [(complex1.re * complex2.re) - (complex1.im * complex2.im),
        (complex1.re * complex2.im) + (complex2.re * complex1.im)],-1
    )
    return complexResult;
}
export function addComplex(complex1, complex2) {
    var complexResult = new complex(
        [complex1.re + complex2.re,
        complex1.im + complex2.im],-1
    )
    return complexResult;
}
export function subComplex(complex1, complex2) {
    var complexResult = new complex(
        [complex1.re - complex2.re,
        complex1.im - complex2.im],-1
    )
    return complexResult; 
}

export function DFT(samples) {
    var frequencies = []
    var sampleLen = samples.length
    for(var i = 0; i < sampleLen; i++) {
        var currentFrequencyReal = 0
        var currentFrequencyImag = 0
        for(var j = 0; j < sampleLen; j++) {
            currentFrequencyReal += samples[j] * Math.cos(Math.PI * 2 * (i * j / sampleLen))
            currentFrequencyImag += samples[j] * -Math.sin(Math.PI * 2 * (i * j / sampleLen))
        }
        frequencies[i] = new complex([currentFrequencyReal,currentFrequencyImag],-1)
    }
    return frequencies
}

export function inverseDFT(complexFrequencies) {
    var samples = []
    var sampleLen = complexFrequencies.length
    for(var i = 0; i < sampleLen; i++) {

        var currentSampleReal = 0
        var currentSampleImag = 0
        for(var j = 0; j < sampleLen; j++) {
            var multiplicand = new complex(-1, [1, Math.PI * 2 * i * j / sampleLen])
            var multiplication = multComplex(complexFrequencies[j],multiplicand)
            currentSampleReal += multiplication.re
            currentSampleImag += multiplication.im
        }
        samples[i] = currentSampleReal / sampleLen
    }
    return samples
}

export function FFT(samples, inverse = false) { //Note: only works when sampleLen is power of 2!!
    var frequencies = []
    var sampleLen = samples.length
    if(sampleLen == 1) { //Base case
        if(inverse == false) {return [new complex([samples[0], 0], -1)]}
        else {return [samples[0]]}
    }
    else {

        //Splitting into even and odd indexed samples
        var evenSamples = []
        var oddSamples = []
        for(var i = 0; i < sampleLen; i++) {
            if(i % 2 == 0) {evenSamples[i / 2] = samples[i]}
            else {oddSamples[(i - 1) / 2] = samples[i]}
        }

        //Recursive step
        var evenFreq = FFT(evenSamples, inverse)
        var oddFreq = FFT(oddSamples, inverse)

        //Returning final frequencies
        for(var i = 0; i < sampleLen / 2; i++) {
            if(inverse == false) {
                var oddFreqToAdd = multComplex(oddFreq[i], 
                    new complex(-1, [1, Math.PI * -2 * i / sampleLen])
                )
            }
            else {
                var oddFreqToAdd = multComplex(oddFreq[i], 
                    new complex(-1, [1, Math.PI * 2 * i / sampleLen])
                )
            }
            var oddFreqToSub = multComplex(new complex([-1,0],-1), oddFreqToAdd)
            frequencies[i] = addComplex(evenFreq[i], oddFreqToAdd)
            frequencies[i + sampleLen / 2] = addComplex(evenFreq[i], oddFreqToSub)
        }
        return frequencies
    }
}

export function inverseFFT(frequencies) { //Inverse FFT is very similar, so this just uses FFT as baseline
    var unscaled = FFT(frequencies, true)
    var samples = []
    for(var i = 0; i < unscaled.length; i++) {
        samples[i] = unscaled[i].re / unscaled.length
    }
    return samples
}

export function complexFFT(samples, inverse = false) { //The actual FFT

    var frequencies = [];
    var sampleLen = samples.length;

    if(sampleLen == 1) {return samples} //Base case
    else {

        //Splitting into even and odd indexed samples
        var evenSamples = []
        var oddSamples = []
        for(var i = 0; i < sampleLen; i++) {
            if(i % 2 == 0) {evenSamples[i / 2] = samples[i]}
            else {oddSamples[(i - 1) / 2] = samples[i]}
        }

        //Recursive step
        var evenFreq = complexFFT(evenSamples, inverse)
        var oddFreq = complexFFT(oddSamples, inverse)

        for(var i = 0; i < sampleLen/2; i++) {

            if(inverse == false)
                {var multiplicand = new complex(-1, [1,2 * Math.PI * i / sampleLen])}
            else
                {var multiplicand = new complex(-1, [1 / sampleLen, -2 * Math.PI * i / sampleLen])}

            frequencies[i] = addComplex(evenFreq[i], multComplex(multiplicand,oddFreq[i]))
            frequencies[i + sampleLen/2] = subComplex(evenFreq[i], multComplex(multiplicand,oddFreq[i]))
        }
        return frequencies

    }

}

export const dftTestInputs = [ //Just for testing
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

//#endregion