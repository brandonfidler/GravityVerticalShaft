/*
GRAVITY VERTICAL SHAFT
*/

// Define width and height of Applet Draw Area
// This includes portions that will be used to plot gravity
// data graphic and cross-section with tunnel
const AP_WIDTH = 500;
const AP_HEIGHT = 500;
const X_OFFSET = 100;
//Define some  constants for the gravity data plot
// Width of plotting Area
const P_WIDTH = AP_WIDTH;
// Height of plotting Area
const P_HEIGHT = 300;
// Width of Graph within plotting Area
const G_WIDTH = P_WIDTH - 125;
// Height of Graph within plotting Area
const G_HEIGHT = P_HEIGHT - 100;

// Now define the absolute coordinates of each of the four corners of
// the data plotting area
let ulcorx = Math.trunc(((P_WIDTH - G_WIDTH) / 2.0));
let ulcory = Math.trunc(((P_HEIGHT - G_HEIGHT) / 2.0));
let urcory = ulcory;
let urcorx = ulcorx + G_WIDTH;
let llcorx = ulcorx;
let llcory = ulcory + G_HEIGHT;
let lrcorx = urcorx;
let lrcory = llcory;

// Define width and height of cross-section plotting area
let x_width = AP_WIDTH - 125;
let x_height = AP_HEIGHT - P_HEIGHT - 50;

// Now define the absolute coordinates of each of the four corners of
// the plotting area
let xulcorx = Math.trunc(((AP_WIDTH - x_width) / 2.0));
let xulcory = Math.trunc((llcory + 25));
let xurcory = xulcory;
let xurcorx = (xulcorx + x_width);
let xllcorx = xulcorx;
let xllcory = xulcory + x_height;
let xlrcorx = xurcorx;
let xlrcory = xllcory;

// Now define variables that we will need compute plot scale.
// Minimum Station location
let xmin = -250.0;
let xmax = 250.0;
// Minimum gravity value - This is computed
let ymin = 1000.0;
let ymax = -1000.0;
// Maximum plotting depth
let dmin = -25.0;
let xscale;
let yscale;
let dscale;

// Define Variables used to Describe Model Parameters.
// Density contrast gm/cm^3
let rho;
// Depth to top of cylinder (m)
let cyl_top = -5.0;
// Depth to bottom of cylinder (m)
let cyl_bot = 1000.0;
// In line location of cylinder along line (m)
let xloc = 0.0;
// Radius of cylinder (m)
let radius = 25;
// Horizontal location of cylinder across line (m)
let yloc = 0.0;
// Standard deviation of readings
let std = 0.0;
// Number of readings to average
let nobs = 1;
// Reading increment (m)
let dx = 0.5;

//Now define minimum and maximum values in user space
//and corresponding maximums and minimums for the scroll bars
//that must be integers
let DxMin=0.25;   //meters
let DxMax=20.0;
let dDx=0.5;	//Increment in Spacing allowed
let DxBarMin=1;	//Minimum Scroll Bar Value
let DxBarMax=Math.trunc((DxMax-DxMin)/dDx+2.1)-0.5; //Maximum Scroll Bar Value
let YMin=-100.0;   //meters
let YMax=100.0;
let dY=1.0;	//Increment in Spacing allowed
let YBarMin=1;	//Minimum Scroll Bar Value
let YBarMax = Math.trunc((YMax-YMin)/dY+2.1)-1; //Maximum Scroll Bar Value
let RhoMin=-3.2; //gm/cm^3
let RhoMax=0.0;
let dRho=0.05;
let RhoBarMin=1;
let RhoBarMax=Math.trunc((RhoMax-RhoMin)/dRho+2.1)-0.005;
let StdMin=0.0;  //mgal
let StdMax=0.05;
let dStd=0.005;
let StdBarMin=1;
let StdBarMax=Math.trunc((StdMax-StdMin)/dStd+2.1)-0.005;
let NMin=1;
let NMax=20;
let dN=1;
let NBarMin=1;
let NBarMax=Math.trunc((NMax-NMin)/dN+2.1)-1;
let s_value;	//variable used to collect scrollbar info

//Define Variables used to some initial values
let dxf=1.0;
let rhof=-2.6;
let depthf=5.0;
let stdf=0.01;
let yf=0.0;
let ndataf=2;


let width = 25.0; //Width of dike (m)
let depth2top = -5.0; //Depth to top of dike
let depth2bot = 500.0; //Depth to bottom of dike


// Value for big G and a  value for the random number generator
let G = (6.67 * Math.pow(10.0, -11.0));
let last_y;

// Range Sliders
let dxf_slider = document.getElementById("station_spacing");
let cross_line_loc_slider = document.getElementById("cross_line_loc");
let rho_slider = document.getElementById("densityContrast");
let n_of_obs_slider = document.getElementById("nOfObservations");
let std_dev_slider = document.getElementById("stdDev");

let label_list_x_loc = 100;
let label_list_y_loc  = 100;
let force = 0;
let key_pressed = false;

const canvas = document.querySelector('.gvsCanvas');
const ctx = canvas.getContext('2d');
const width_canvas = document.querySelector('.gtRadSample');
const r_ctx = width_canvas.getContext('2d');

function start()
{
    if (canvas.getContext)
    {
        canvas.width = (AP_WIDTH+10);
        canvas.height = (AP_HEIGHT-70);

        rho = rhof;
        std = stdf;
        nobs = ndataf;
        dx = dxf;
        yloc = yf;
        setScales();
        setSlideBars();
        paint();
        displaySliderValues();
    }
}


function initialPaint(){
    labels();
}



function paint()
{
    // Plot Cross section
    plotXSection();
    // Plot Gravity Data
    plotTheory();
    // Draw Parameter Labels on lower left side of plot
    labels();
    // Draw Axes
    drawAxis();

}

// Compute scales for plotting data graphic
function setScales()
{
    // First set xmax and xmin values from data file values
    // Now check to see if theoretical values will reset ymax and ymin
    let x, temp;
    ymax = -1000.0;
    ymin = 1000.0;

    for (x = xmin; x <= xmax; x += dx)
    {
        temp = getG(x, yloc);
        if (temp < ymin)
        {
            ymin = temp;
        }
        if (temp > ymax)
        {
            ymax = temp;
        }
    }
    // Add buffer to ymin and ymax
    ymin *= 1.1;
    ymax *= 1.1;

    // Compute scales
    xscale = G_WIDTH / (xmax - xmin);
    yscale = G_HEIGHT / (ymax - ymin);
    dscale = (x_height / (0.0 - dmin));
}

function rescale()
{
    ctx.clearRect(0,0, canvas.width, canvas.height);
    r_ctx.clearRect(0,0, width_canvas.width, width_canvas.height);
    setScales();
    paint();
    displaySliderValues();
}

// Plot Theoretical Gravity values
function plotTheory()
{
    let x, temp, temp1;
    // variable for circle object to be drawn.
    let particle;

    for(x = xmin; x <= xmax; x += dx)
    {
        temp = getG(x, yloc);
        particle = new Circle((getDX(x)-3), (getDY(temp)-3), 6, "#FF0000");
        particle.drawCir();
    }
}

function plotXSection()
{
    // Draw grass rectangle.
    ctx.beginPath();
    ctx.fillStyle = "#55ee33";
    ctx.rect( xulcorx, xulcory, x_width, x_height);
    ctx.fill();
    ctx.strokeStyle = "#000000";
    ctx.rect(xulcorx, xulcory, x_width, x_height);
    ctx.stroke();

    let depth;
    let px, py, px1, py1;
    let f_width;

    ctx.fillStyle = "#000000";
    ctx.font = "12px Arial";
    // Draw tick marks and labels
    for(depth = 0.0; depth>dmin; depth -= 5.0)
    {
        px = getDX(xmin);
        py = getXY(depth);
        drawLine(px, py, (px+5), py);
        ctx.fillText((-1.0*depth).toFixed(1), (px-25-2), (py+5));
    }
    ctx.fillText("Depth (m)", (xulcorx/3 - 50/2+69), (xulcory + xllcory)/2-60);


    // Draw Xsection of cylinder
    let x1 = xloc - radius;
    let x2 = xloc + radius;
    if(x1 < xmin)
        x1 = xmin;
    if(x2 > xmax)
        x2 = xmax;
    px = getDX(x1);
    py = getXY(depth2top);
    px1 = getDX(x2)-px;
    py1 = getXY(dmin) - py;

    ctx.beginPath();
    ctx.fillStyle = "#777777";
    ctx.rect(px, py, px1, py1);
    ctx.fill();
    ctx.beginPath();
    ctx.strokeStyle = "#000000";
    ctx.rect(px, py, px1, py1);
    ctx.stroke();
    ctx.fillStyle = "#000000";

}
function labels()
{
    ctx.fillStyle = "#000000";
    r_ctx.fillStyle = "#000000";
    ctx.font = "12px Arial";
    r_ctx.fillText("Depth: ", 5, 12);
    r_ctx.fillText("Radius: ", 5, 24);
    r_ctx.fillText("Move to Surface ", 83, 24);
    r_ctx.fillText("Move to Deeper Depth", 73, 222);
    r_ctx.fillText("Decrease Radius", 2, 87);
    r_ctx.fillText("Increase Radius", 159, 87);
}
// Draw Axes and Labels for x, gravity value, and depth. test
function drawAxis()
{
    let run = false;
    let xint;
    ctx.font = "12px Arial";
    // Get Font information so that we can center text when needed
    ctx.beginPath();
    ctx.strokeStyle = "#000000";
    // Do x axis first
    drawLine(ulcorx, ulcory, urcorx, urcory);
    for (xint = xmin; xint <= xmax; xint += 50.0)
    {
        drawLine(getDX(xint), ulcory, getDX(xint), ulcory - 5);
        ctx.fillText((xint), getDX(xint) - 7, ulcory - 8);
    }
    ctx.fillText("Distance (m)",AP_WIDTH / 2 -  30, 25);

    // Do Gravity value axis
    drawLine(20 + urcorx, urcory, 20 + lrcorx, lrcory);
    for (xint = ymin; xint <= ymax; xint += Math.abs((ymax - ymin) / 5.0))
    {
        run = true;
        drawLine(20 + urcorx, getDY(xint), 15 + urcorx, getDY(xint));
        ctx.fillText(xint.toFixed(1), 20 + urcorx, getDY(xint) + 5);
    }

    ctx.fillText("Gravity (mgal)",lrcorx - 30, lrcory + 20);
    ctx.stroke();
}

// Set slide-bars
function setSlideBars() {
    let s_value;

    //Set Station Spacing
    s_value = Math.trunc((dxf - DxMin) * (DxBarMax - DxBarMin) /
        (DxMax - DxMin) + DxBarMin + 0.5);
    dxf_slider.value = s_value;
    dxf_slider.min = DxBarMin;
    dxf_slider.max = DxBarMax;

    //Set Cross Line Location
    s_value = Math.trunc((yf - YMin) * (YBarMax - YBarMin) /
        (YMax - YMin) + YBarMin + 0.5);
    cross_line_loc_slider.value = s_value;
    cross_line_loc_slider.min = YBarMin;
    cross_line_loc_slider.max = YBarMax;

    //Set Density Contrast
    s_value = Math.trunc((rhof - RhoMin) * (RhoBarMax - RhoBarMin) /
        (RhoMax - RhoMin) + RhoBarMin + 0.5);
    rho_slider.value = s_value;
    rho_slider.min = RhoBarMin;
    rho_slider.max = RhoBarMax;

    //Set Number of Observations, N:
    s_value = Math.trunc((ndataf-NMin) * (NBarMax - NBarMin) /
        (NMax - NMin) + NBarMin + 0.5);
    n_of_obs_slider.value = s_value;
    n_of_obs_slider.min = NBarMin;
    n_of_obs_slider.max = NBarMax;

    // Set Standard Deviation
    s_value = Math.trunc((stdf-StdMin) * (StdBarMax - StdBarMin) /
        (StdMax - StdMin) + StdBarMin + 0.5);
    std_dev_slider.value = s_value;
    std_dev_slider.min = StdBarMin;
    std_dev_slider.max = StdBarMax;
}

// Trigger events for the range sliders, each time the user moves the slider
// (e.g. Station Spacing or dx) the corresponding function below will fire.
dxf_slider.oninput = function ()
{
    textOutputChange(this.value);
    dxf = dxfFormat(this.value, true);
    frameChanged();
};
function dxf_LeftButton()
{
    dxf_slider.value--;
    dxf = dxfFormat(dxf_slider.value, true);
    textOutputChange(dxf_slider.value);
    frameChanged();
}
function dxf_RightButton()
{
    dxf_slider.value++;
    dxf = dxfFormat(dxf_slider.value, true);
    textOutputChange(dxf_slider.value);
    frameChanged();
}

cross_line_loc_slider.oninput = function()
{
    textOutputChange(dxf_slider.value, this.value);
    yf = cross_line_locFormat(this.value, true);
    frameChanged();

};
function cross_line_loc_LeftButton()
{
    cross_line_loc_slider.value--;
    yf = cross_line_locFormat(cross_line_loc_slider.value, true);
    textOutputChange(dxf_slider.value, cross_line_loc_slider.value);
    frameChanged();
}
function cross_line_loc_RightButton()
{
    cross_line_loc_slider.value++;
    yf = cross_line_locFormat(cross_line_loc_slider.value, true);
    textOutputChange(dxf_slider.value, cross_line_loc_slider.value);
    frameChanged();
}

rho_slider.oninput = function ()
{
    textOutputChange(dxf_slider.value, cross_line_loc_slider.value, this.value);
    rhof = rhoFormat(this.value, true);
    frameChanged();
};
function rho_LeftButton()
{
    rho_slider.value--;
    rhof = rhoFormat(rho_slider.value, true);
    textOutputChange(dxf_slider.value,cross_line_loc_slider.value, rho_slider.value, );
    frameChanged();
}
function rho_RightButton()
{
    rho_slider.value++;
    rhof = rhoFormat(rho_slider.value, true);
    textOutputChange(dxf_slider.value, cross_line_loc_slider.value, rho_slider.value,);
    frameChanged();
}
n_of_obs_slider.oninput = function ()
{
    textOutputChange(dxf_slider.value, cross_line_loc_slider.value, rho_slider.value, this.value);
    ndataf = this.value;
    frameChanged();
};
function n_of_obs_LeftButton()
{
    n_of_obs_slider.value--;
    ndataf = n_of_obs_slider.value;
    textOutputChange(dxf_slider.value, cross_line_loc_slider.value, rho_slider.value, n_of_obs_slider.value);
    frameChanged();
}
function n_of_obs_RightButton()
{
    n_of_obs_slider.value++;
    ndataf = n_of_obs_slider.value;
    textOutputChange(dxf_slider.value, cross_line_loc_slider.value, rho_slider.value, n_of_obs_slider.value);
    frameChanged();
}

std_dev_slider.oninput = function ()
{
    textOutputChange(dxf_slider.value, cross_line_loc_slider.value, rho_slider.value, n_of_obs_slider.value,
        this.value);
    stdf = stdFormat(this.value, true);
    frameChanged();
};
function std_LeftButton()
{
    std_dev_slider.value--;
    stdf = stdFormat(std_dev_slider.value, true);
    textOutputChange(dxf_slider.value, cross_line_loc_slider.value,rho_slider.value, n_of_obs_slider.value, std_dev_slider.value);
    frameChanged();
}
function std_RightButton()
{
    std_dev_slider.value++;
    stdf = stdFormat(std_dev_slider.value, true);
    textOutputChange(dxf_slider.value,cross_line_loc_slider.value, rho_slider.value, n_of_obs_slider.value, std_dev_slider.value);
    frameChanged();
}
//////////////////////////////////////
// Trigger events for the range sliders, each time the user moves the slider
// (e.g. Station Spacing) the corresponding function below will fire.



// If the Boolean value "number_val" is set to true, then the following format
// functions will return float values instead of a string.
function dxfFormat(val, number_val=false)
{
    if(number_val)
        return ((val-1)*dDx+DxMin);
    return ((val-1)*dDx+DxMin).toFixed(2);
}
function cross_line_locFormat(val, number_val=false)
{
    if (number_val)
        return ((val-1)*dY + YMin);
    return ((val-1)*dY + YMin).toFixed(2);
}
function rhoFormat(val, number_val=false)
{
    if(number_val)
        return ((val-1)*dRho+RhoMin);
    return ((val-1)*dRho+RhoMin).toFixed(2);
}
function stdFormat(val, number_val=false)
{
    if(number_val)
        return ((val-1)*dStd+StdMin);
    return ((val-1)*dStd+StdMin).toFixed(3);
}

// This function clears the space where the unit text is, and redraws it.
function textOutputChange(dxf_v = dxf_slider.value, cr_ln_loc_v = cross_line_loc_slider.value, rho_v = rho_slider.value,
                          n_of_obs_v = n_of_obs_slider.value, std_v = std_dev_slider.value)
{
    // alert("textOutputChange")
    ctx.clearRect(X_OFFSET, label_list_y_loc-10, 130, 70);
    ctx.fillStyle = "#00DD00";
    ctx.rect( X_OFFSET, label_list_y_loc-10, 130, 70);
    ctx.fill();
    labels();
    displaySliderValues(dxf_v, cr_ln_loc_v, rho_v, n_of_obs_v, std_v);
}

// Displays the current slider value
function displaySliderValues(dxf_v = dxf_slider.value, cr_ln_loc_v = cross_line_loc_slider.value, rho_v = rho_slider.value,
                             n_of_obs_v = n_of_obs_slider.value, std_v = std_dev_slider.value)
{
    document.getElementById("depth_val").innerHTML = ((-depth2top).toFixed(1)+" m");
    document.getElementById("radius_val").innerHTML = (radius.toFixed(1)+" m");
    r_ctx.fillText((-depth2top).toFixed(1)+" m", 42, 12);
    r_ctx.fillText(radius.toFixed(1)+" m", 42, 24);
    document.getElementById("contrast_val").innerHTML = (rhoFormat(rho_v)+" gm/cm^3");
    document.getElementById("y_location_val").innerHTML = (cross_line_locFormat(cr_ln_loc_v)+" m");
    document.getElementById("station_spacing_val").innerHTML = (dxfFormat(dxf_v)+" m");
    document.getElementById("num_of_obs_value").innerHTML = n_of_obs_v.toString();
    document.getElementById("std_val").innerHTML = (stdFormat(std_v)+" mgal");
}

function frameChanged()
{
    rho = rhof;
    dx = dxf;
    ndata = ndataf;
    std = stdf;
    yloc = yf;

    ctx.clearRect(0,0, canvas.width, canvas.height);
    r_ctx.clearRect(0,0, width_canvas.width, width_canvas.height);
    paint();
    displaySliderValues();
}

function setValues(dx, rho, depth, std, ndata)
{
    dxf = dx;
    rhof = rho;
    depthf = depth;
    stdf = std;
    ndataf = ndata;

    // reset range sliders
    //Set Station Spacing
    s_value = Math.trunc((dxf - DxMin) * (DxBarMax - DxBarMin) /
        (DxMax - DxMin) + DxBarMin + 0.5);
    dxf_slider.value = s_value;

    //Set Density Contrast
    s_value = Math.trunc((rhof - RhoMin) * (RhoBarMax - RhoBarMin) /
        (RhoMax - RhoMin) + RhoBarMin + 0.5);
    rho_slider.value = s_value;

    //Set Number of Observations, N:
    s_value = Math.trunc((ndataf-NMin) * (NBarMax - NBarMin) /
        (NMax - NMin) + NBarMin + 0.5);
    n_of_obs_slider.value = s_value;

    // Set Standard Deviation
    s_value = Math.trunc((stdf-StdMin) * (StdBarMax - StdBarMin) /
        (StdMax - StdMin) + StdBarMin + 0.5);
    std_dev_slider.value = s_value;
}

// function value to produce normal distributed values clustered around a mean.
function gaussianRand()
{
    let x1, x2, rad, y1;
    do {
        x1 = 2 * Math.random() - 1;
        x2 = 2 * Math.random() - 1;
        rad = x1 * x1 + x2 * x2;
    } while(rad >= 1 || rad === 0);
    let c = Math.sqrt(-2 * Math.log(rad) / rad);
    return (x1 * c);
}

function getDX(x)
{
    return Math.trunc((( (x-xmin) * xscale+llcorx )));
}
// Compute y pix location in data graphic.
function getDY(y)
{
    return Math.trunc((( (ymax-y) * yscale + ulcory )));
}
// Compute y pixel location for cross section graphic
function  getXY(y)
{
    return Math.trunc(((-1*y)*dscale+xulcory));
}
// Compute gravity at a given x location
function getG(x, y)
{
    let save, save1, fudge;
    let xs, r, cos_theta, p1, p2, p4, p6, t;
    //There are two expressions to be used one for r > radius
    //and one for r < radius. To insure that both match at
    //r = radius we'll evaluate both there and add a small
    //constant to one of the expressions.
    cos_theta = Math.abs(depth2top / radius);
    p1 = cos_theta;
    p2 = (3.0 * Math.pow(cos_theta, 2.0) - 1.0) / 2.0;
    p4 = (35.0 * Math.pow(cos_theta, 4.0) -
        30.0 * Math.pow(cos_theta, 2.0) + 3.0) / 8.0;
    p6 = (231.0 * Math.pow(cos_theta, 6.0) -
        315.0 * Math.pow(cos_theta, 4.0) +
        105.0 * Math.pow(cos_theta, 2.0) - 5.0) / 16.0;
    t = 1.0 / 2.0;
    save = 2.0 * Math.PI * G * rho * radius *
        (1.0 - 2.0 * t * p1 + 2.0 * t * t * p2 -
            2.0 * t * t * t * t * p4 + 2.0 * t * t * t * t * t * t * p6);
    save1 = 2.0 * Math.PI * G * rho * radius *
        (t - t * t * t * p2 + 2.0 * t * t * t * t * t * p4 -
            2.0 * t * t * t * t * t * t * t * p6);
    fudge = save1 - save;

    //Now do computations at correct location
    xs = Math.sqrt((xloc - x) * (xloc - x) + y * y);
    r = Math.sqrt(depth2top * depth2top + xs * xs);
    cos_theta = Math.abs(depth2top / r);
    p1 = cos_theta;
    p2 = (3.0 * Math.pow(cos_theta, 2.0) - 1.0) / 2.0;
    p4 = (35.0 * Math.pow(cos_theta, 4.0) -
        30.0 * Math.pow(cos_theta, 2.0) + 3.0) / 8.0;
    p6 = (231.0 * Math.pow(cos_theta, 6.0) -
        315.0 * Math.pow(cos_theta, 4.0) +
        105.0 * Math.pow(cos_theta, 2.0) - 5.0) / 16.0;
    if (radius > r) {
        t = r / (2.0 * radius);
        save = 2.0 * Math.PI * G * rho * radius *
            (1.0 - 2.0 * t * p1 + 2.0 * t * t * p2 -
                2.0 * t * t * t * t * p4 +
                2.0 * t * t * t * t * t * t * p6) + fudge;
    } else {
        t = radius / (2.0 * r);
        save = 2.0 * Math.PI * G * rho * radius *
            (t - t * t * t * p2 + 2.0 * t * t * t * t * t * p4 -
                2.0 * t * t * t * t * t * t * t * p6);
    }


    return save * Math.pow(10.0, 8.0) +
        gaussianRand() * std / Math.sqrt(nobs);
}

// Draw line function
function drawLine(x1, y1, x2, y2)
{
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

// Circle Object
function Circle(x, y, r, stroke) {
    this.startingAngle = 0;
    this.endAngle = 2 * Math.PI;
    this.x = x;
    this.y = y;
    this.r = r;

    this.stroke = stroke;

    this.drawCir = function () {
        ctx.beginPath();
        // Treating r as a diameter to mimic java oval() function.
        // arc() method doesn't center to diameter, but builds out from origin.
        // I've added the radius to center the oval/circle object to grid.
        // -Jason
        ctx.arc(this.x+((this.r/2)), this.y+((this.r/2)), this.r/2, this.startingAngle, this.endAngle);
        ctx.lineWidth = 1;
        ctx.strokeStyle = this.stroke;
        ctx.stroke();
    }
}


// Controls for the shaft object
window.addEventListener('keydown', function (e) {
    e.preventDefault();
    if(e.key === "ArrowDown" && (-depth2top)<24)
    {
        key_pressed = true;
        depth2top -= 0.1;
        force += 1;
        ctx.clearRect(0,0, canvas.width, canvas.height);
        r_ctx.clearRect(0,0, width_canvas.width, width_canvas.height);

        paint();
        displaySliderValues();
    }
    else if(e.key === "ArrowUp" && (-depth2top)>0.2)
    {
        key_pressed = true;
        depth2top += 0.1;
        force += 1;
        ctx.clearRect(0,0, canvas.width, canvas.height);
        r_ctx.clearRect(0,0, width_canvas.width, width_canvas.height);

        paint();
        displaySliderValues();
    }
    else if(e.key === "ArrowRight" && (radius<150))
    {
        key_pressed = true;
        if(force >= 30 && force < 90)
            radius += 0.2;
        else if(force >= 90)
            radius += 1;
        else
            radius += 0.1;

        force += 1;
        ctx.clearRect(0,0, canvas.width, canvas.height);
        r_ctx.clearRect(0,0, width_canvas.width, width_canvas.height);

        paint();
        displaySliderValues();
    }
    else if(e.key === "ArrowLeft" && (radius > 2.1))
    {
        key_pressed = true;
        if(force >= 30 && force < 90)
            radius -= 0.2;
        else if(force >= 90)
            radius -= 1;
        else
            radius -= 0.1;
        force += 1;
        ctx.clearRect(0,0, canvas.width, canvas.height);
        r_ctx.clearRect(0,0, width_canvas.width, width_canvas.height);

        paint();
        displaySliderValues();
    }
});

// Check if a key was released
window.addEventListener('keyup', function (e) {
    if (e.defaultPrevented){
        return;
    }
    key_pressed = false;
    force = 0;
});

let dragging = false;

function radArrowLeft()
{
    if(radius > -500)
    {
        if(force >= 30 && force < 90)
            radius -= 0.2;
        else if(force >= 90)
            radius -= 2;
        else
            radius -= 0.1;
        force += 1;
        ctx.clearRect(0,0, canvas.width, canvas.height);
        r_ctx.clearRect(0,0, width_canvas.width, width_canvas.height);
        paint();
        displaySliderValues();
    }
}
function radArrowRight()
{
    if(radius < 2000)
    {
        if(force >= 30 && force < 90)
            radius += 1;
        else if(force >= 90)
            radius += 2;
        else
            radius += 0.1;

        force += 1;
        ctx.clearRect(0,0, canvas.width, canvas.height);
        r_ctx.clearRect(0,0, width_canvas.width, width_canvas.height);
        paint();
        displaySliderValues();
    }
}
function radArrowUp()
{
    if(-depth2top > .1)
    {
        key_pressed = true;
        depth2top += 0.1;
        force += 1;
        ctx.clearRect(0,0, canvas.width, canvas.height);
        r_ctx.clearRect(0,0, width_canvas.width, width_canvas.height);
        paint();
        displaySliderValues();
    }
}
function radArrowDown()
{
    if(-depth2top < 25)
    {
        key_pressed = true;
        depth2top -= 0.1;
        force += 1;
        ctx.clearRect(0,0, canvas.width, canvas.height);
        r_ctx.clearRect(0,0, width_canvas.width, width_canvas.height);
        paint();
        displaySliderValues();
    }
}