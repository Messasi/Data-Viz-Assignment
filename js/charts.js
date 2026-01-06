//Globla variables
let comparisonChart = null; //object to hold chart instance
let currentMetric = 'overview';//default metric



function initialiseChart() {
    console.log('Initialising chart system'); //check if function runs 
    updateChart(); //display empty chart 
    
    
    const metricSelect = document.getElementById('metricSelect');
    if (metricSelect) {
        metricSelect.addEventListener('change', handleMetricChange);//when the metric is changed instantly update chart
    }
}



function handleMetricChange(event) {
    currentMetric = event.target.value;//update current metric
    updateChart();
}



function updateChart() {
    //Get Canvas
    const canvas = document.getElementById('comparisonChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d'); //get 2d  for chartjs

    //Check for data
    //If selectedPhones is not defined or empty create an empty chart to avoid errors
    const phones = (typeof selectedPhones !== 'undefined') ? selectedPhones : [];

    // if statement to see chart type
    const targetType = (currentMetric === 'overview') ? 'radar' : 'bar';

    //remove previous chart type if it is there
    if (comparisonChart) {
        comparisonChart.destroy();
    }

    //Generate Configuration
    let config;
    if (targetType === 'radar') {
        config = getRadarConfig(phones);
    } else {
        config = getBarConfig(phones);
    }

    //Create New Chart
    comparisonChart = new Chart(ctx, config);
    console.log("Chart updated and new chart created");
}



//Radar configuration and properties
function getRadarConfig(phones) {

    
    //Find the max values t keep the chart fair 
    let maxRam = Math.max(...phones.map(p => p.ram_gb)) || 100;
    let maxStorage = Math.max(...phones.map(p => p.storage_gb)) || 100;
    let maxBattery = Math.max(...phones.map(p => p.battery_mah)) || 100;
    let maxDisplay = Math.max(...phones.map(p => p.display_inches)) || 100;
    let maxCamera = Math.max(...phones.map(p => p.camera_mp)) || 100;
    let maxPrice = Math.max(...phones.map(p => p.price)) || 100;

    return {
        type: 'radar',
        data: {
            labels: ['RAM', 'Storage', 'Battery', 'Display', 'Camera', 'Value'],
            datasets: phones.map((phone, index) => ({
                label: phone.brand + ' ' + phone.model,
                data: [
                    (phone.ram_gb / maxRam) * 100, //make it to a percentage
                    (phone.storage_gb / maxStorage) * 100,
                    (phone.battery_mah / maxBattery) * 100,
                    (phone.display_inches / maxDisplay) * 100,
                    (phone.camera_mp / maxCamera) * 100,
                    
                    100 - (phone.price / maxPrice) * 100 //price is opposite 
                ],
                borderColor: getPhoneColor(index),
                backgroundColor: getPhoneColor(index).replace('rgb', 'rgba').replace(')', ', 0.2)'),//make it transparent
                pointBackgroundColor: getPhoneColor(index)
            }))
        },
        options: {
            responsive: true, //chaing to fit container
            maintainAspectRatio: false,
            scales: {
                r: {
                    beginAtZero: true,
                    max: 100,
                    ticks: { display: false } // Hide numbers on the web for cleaner look
                }
            }
        }
    };
}

//Bar chart cofiguration
function getBarConfig(phones) {
    let values = []; //lable array
    let label = '';

  
    //If statements for the different metrics and extract the data from the phones using the .map function
    if (currentMetric === 'ram') {
        values = phones.map(p => p.ram_gb);
        label = 'RAM (GB)';
    } else if (currentMetric === 'storage') {
        values = phones.map(p => p.storage_gb);
        label = 'Storage (GB)';
    } else if (currentMetric === 'battery') {
        values = phones.map(p => p.battery_mah);
        label = 'Battery (mAh)';
    } else if (currentMetric === 'display') {
        values = phones.map(p => p.display_inches);
        label = 'Display Size (Inches)';
    } else if (currentMetric === 'camera') {
        values = phones.map(p => p.camera_mp);
        label = 'Camera (MP)';
    } else if (currentMetric === 'price') {
        values = phones.map(p => p.price);
        label = 'Price ($)';
    }

    return {
        type: 'bar',
        data: {
            labels: phones.map(p => p.brand + ' ' + p.model),
            datasets: [{
                label: label,
                data: values,
                backgroundColor: phones.map((p, i) => getPhoneColor(i).replace('rgb', 'rgba').replace(')', ', 0.7)')),
                borderColor: phones.map((p, i) => getPhoneColor(i)), //solid color for border using the phone colour function 
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true }
            }
        }
    };
}

//Getting th ephone colour
function getPhoneColor(index) {
    const colors = [ //Keeping the colours consistent for each phone for both charts
        'rgb(99, 102, 241)',  
        'rgb(239, 68, 68)',  
        'rgb(16, 185, 129)',  
        'rgb(245, 158, 11)',  
        'rgb(139, 92, 246)'  
    ];
    return colors[index]; //outputting the colour 
}