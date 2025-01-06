export const cornerRadius = 15;

export function drawBackground(canvas, ctx, cornerRadius) {
    ctx.clearRect(0,0,canvas.width, canvas.height);

    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(cornerRadius, cornerRadius, cornerRadius,Math.PI, 1.5 * Math.PI);
    ctx.arc(canvas.width - cornerRadius, cornerRadius, cornerRadius,1.5 * Math.PI, 0);
    ctx.arc(canvas.width - cornerRadius, canvas.height - cornerRadius, cornerRadius,0, 0.5 * Math.PI);
    ctx.arc(cornerRadius, canvas.height - cornerRadius, cornerRadius,0.5 * Math.PI, Math.PI);
    ctx.fill();
}

export function button(position, dimensions, imgLink, imgDimensions, colour, colourTransition, borderRadius, transition, transitionScale,onClick, onClickArguments) {

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

    this.buttonLoop = function(mousePos, mouseDown, prevMouseDown) {
        
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

    this.buttonDraw = function(ctx) {
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

export function slider(pos,lineLength,lineThickness,circleRadius,circleScale,transition, lineColour, circleColour) {

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