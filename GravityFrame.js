/*
GRAVITY FRAME
 */

//Now define minimum and maximum values in user space
//and corresponding maximums and minimums for the scroll bars
//that must be integers
let DxMin=0.25;   //meters
let DxMax=10.0;
let dDx=0.25;	//Increment in Spacing allowed
let DxBarMin=1;	//Minimum Scroll Bar Value
let DxBarMax=Math.trunc((DxMax-DxMin)/dDx+2.1)-DxMin; //Maximum Scroll Bar Value
let RhoMin=-3.2; //gm/cm^3
let RhoMax=0.0;
let dRho=0.05;
let RhoBarMin=1;
let RhoBarMax=Math.trunc((RhoMax-RhoMin)/dRho+2.1)-0.05;
let StdMin=0.0;  //mgal
let StdMax=0.05;
let dStd=0.005;
let StdBarMin=1;
let StdBarMax=Math.trunc((StdMax-StdMin)/dStd+2.1)-0.005;
let NMin=1;
let NMax=20;
let dN=1;
let NBarMin=1;
let NBarMax=Math.trunc((NMax-NMin)/dN+0.5)-1;
let s_value;	//variable used to collect scrollbar info
let s_size;   //variable to hold scroller size

//Define Variables used to some initial values
let dxf=1.0;
let rhof=-2.67;
let stdf=0.01;
let ndataf=2;

// Range Sliders
let dxf_slider = document.getElementById("station_spacing");
let rho_slider = document.getElementById("densityContrast");
let n_of_obs_slider = document.getElementById("nOfObservations");
let std_dev_slider = document.getElementById("stdDev");

let label_list_x_loc = X_OFFSET;
let label_list_y_loc  = 400;

function start()
{
    if (canvas.getContext)
    {
        canvas.width = (C_WIDTH+10);
        canvas.height = (C_HEIGHT+5);

        setScales();
        setValues(dx, rho, depth, std, ndata);
        setSlideBars();
        paint();
        displaySliderValues();
    }
}

function rescale()
{
    ctx.clearRect(0,0, canvas.width, canvas.height);
    r_ctx.clearRect(0,0, rad_canvas.width, rad_canvas.height);
    setScales();
    paint();
    displaySliderValues();
}

function displaySliderValues(dxf_v = dxf_slider.value, rho_v = rho_slider.value,
                             n_of_obs_v = n_of_obs_slider.value, std_v = std_dev_slider.value)
{

    document.getElementById("depth_val").innerHTML = ((depth).toFixed(1)+" m");
    document.getElementById("radius_val").innerHTML = (rad.toFixed(1)+" m");
    r_ctx.fillText((depth).toFixed(1)+" m", 42, 12);
    r_ctx.fillText(rad.toFixed(1)+" m", 42, 24);
    document.getElementById("contrast_val").innerHTML = (rhoFormat(rho_v)+" gm/cm^3");
    document.getElementById("station_spacing_val").innerHTML = (dxfFormat(dxf_v)+" m");
    document.getElementById("num_of_obs_value").innerHTML = n_of_obs_v.toString();
    document.getElementById("std_val").innerHTML = (stdFormat(std_v)+" mgal");
}

// Trigger events for the range sliders, each time the user moves the slider
// (e.g. Station Spacing) the corresponding function below will fire.
cross_line_loc_slider.oninput= function(){
    textOutputChange(this.value);
    dxf = dxfFormat(this.value, true);
    frameChanged();
}
function cross_line_loc_LeftButton(){
    dxf_slider.value--;
    dxf = dxfFormat(dxf_slider.value, true);
    textOutputChange(dxf_slider.value);
    frameChanged();
}
function cross_line_loc_RightButton(){
    dxf_slider.value++;
    dxf = dxfFormat(dxf_slider.value, true);
    textOutputChange(dxf_slider.value);
    frameChanged();
}

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

rho_slider.oninput = function ()
{
    textOutputChange(dxf_slider.value, this.value);
    rhof = rhoFormat(this.value, true);
    frameChanged();
};
function rho_LeftButton()
{
    rho_slider.value--;
    rhof = rhoFormat(rho_slider.value, true);
    textOutputChange(dxf_slider.value, rho_slider.value);
    frameChanged();
}
function rho_RightButton()
{
    rho_slider.value++;
    rhof = rhoFormat(rho_slider.value, true);
    textOutputChange(dxf_slider.value, rho_slider.value);
    frameChanged();
}


n_of_obs_slider.oninput = function ()
{
    textOutputChange(dxf_slider.value, rho_slider.value, this.value);
    ndataf = this.value;
    frameChanged();
};
function n_of_obs_LeftButton()
{
    n_of_obs_slider.value--;
    ndataf = n_of_obs_slider.value;
    textOutputChange(dxf_slider.value, rho_slider.value, n_of_obs_slider.value);
    frameChanged();
}
function n_of_obs_RightButton()
{
    n_of_obs_slider.value++;
    ndataf = n_of_obs_slider.value;
    textOutputChange(dxf_slider.value, rho_slider.value, n_of_obs_slider.value);
    frameChanged();
}
std_dev_slider.oninput = function ()
{
    textOutputChange(dxf_slider.value, rho_slider.value, n_of_obs_slider.value,
        this.value);
    stdf = stdFormat(this.value, true);
    frameChanged();
};
function std_LeftButton()
{
    std_dev_slider.value--;
    stdf = stdFormat(std_dev_slider.value, true);
    textOutputChange(dxf_slider.value, rho_slider.value, n_of_obs_slider.value, std_dev_slider.value);
    frameChanged();
}
function std_RightButton()
{
    std_dev_slider.value++;
    stdf = stdFormat(std_dev_slider.value, true);
    textOutputChange(dxf_slider.value, rho_slider.value, n_of_obs_slider.value, std_dev_slider.value);
    frameChanged();
}

// If the Boolean value "number_val" is set to true, then the following format
// functions will return float values instead of a string.
function dxfFormat(val, number_val=false)
{
    if(number_val)
        return ((val-1)*dDx+DxMin);
    return ((val-1)*dDx+DxMin).toFixed(2);
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
function textOutputChange(dxf_v = dxf_slider.value, rho_v = rho_slider.value,
                          n_of_obs_v = n_of_obs_slider.value, std_v = std_dev_slider.value)
{
    ctx.clearRect(X_OFFSET, label_list_y_loc-10, 130, 70);
    ctx.fillStyle = "#00DD00";
    ctx.rect( X_OFFSET, label_list_y_loc-10, 130, 70);
    ctx.fill();
    labels();
    displaySliderValues(dxf_v, rho_v, n_of_obs_v, std_v);
}

//Set slide-bars
function setSlideBars() {
    let s_value;

    //Set Station Spacing
    s_value = Math.trunc((dxf - DxMin) * (DxBarMax - DxBarMin) /
        (DxMax - DxMin) + DxBarMin + 0.5);
    dxf_slider.value = s_value;
    dxf_slider.min = DxBarMin;
    dxf_slider.max = DxBarMax;

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

function selectTunnel(event)
{
    let x = event.clientX;
    let y = event.clientY;
    let cx = C_WIDTH / 2 - Math.trunc(5 * rad * dscale / 2);
    let cy = getTY() - Math.trunc(5 * rad * dscale);
    let diff = Math.trunc(5 * rad * dscale);

    last_y = 0;
    if ((x >= cx) && (x <= cx + diff) && (y >= cy) && (y<=cy+diff))
        last_y = y;
}

ctx.addEventListener("mousedown", getPosition, false);

function moveTunnel(event)
{
    let x = event.clientX;
    let y = event.clientY;
    let dist = Math.abs(y - last_y);
    if( dist >= 5 && y > (P_HEIGHT+rad*dscale) && y < C_HEIGHT && last_y !== 0)
    {
        last_y = y;
        depth = ((y-P_HEIGHT)/dscale);
        setValues(dx, rho, rad, depth, std, ndata);
        ctx.clearRect(0,0, canvas.width, canvas.height);
        paint();
        displaySliderValues();

    }

}
function setValues(dx, rho, depth, std, ndata)
{
    dxf = dx;
    rhof = rho;
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

function frameChanged()
{
    rho = rhof;
    dx = dxf;
    ndata = ndataf;
    std = stdf;

    ctx.clearRect(0,0, canvas.width, canvas.height);
    r_ctx.clearRect(0,0, rad_canvas.width, rad_canvas.height);
    r_ctx.backgroundColor = "#e9e9e9";
    paint();
    displaySliderValues();
}

function getGravData()
{
    let data_entries = gravDataArea.innerHTML.split(" ");
    let col = gravDataArea.innerHTML;
    let results = [];
    for(let i =0; i<data_entries.length; i++)
    {

        results[i] = data_entries[i];
        alert(results[i]);
    }

}

