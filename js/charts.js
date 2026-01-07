// Global variables
let comparisonChart = null; // object to hold chart instance
let currentMetric = 'overview'; // default metric

function initialiseChart() {
    console.log('Initialising chart system'); // check if function runs 
    updateChart(); // display empty chart 
    
    const metricSelect = document.getElementById('metricSelect');
    if (metricSelect) {
        metricSelect.addEventListener('change', handleMetricChange); // when the metric is changed instantly update chart
    }
}

function handleMetricChange(event) {
    currentMetric = event.target.value; // update current metric
    updateChart();
}

function updateChart() {
    // Get Canvas
    const canvas = document.getElementById('comparisonChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d'); // get 2d context for chartjs

    // Check for data
    // If selectedPhones is not defined or empty create an empty chart to avoid errors
    const phones = (typeof selectedPhones !== 'undefined') ? selectedPhones : [];

    // if statement to see chart type
    const targetType = (currentMetric === 'overview') ? 'radar' : 'bar';

    // NEW: Update the text description above the chart
    updateChartDescription(targetType);

    // remove previous chart type if it is there
    if (comparisonChart) {
        comparisonChart.destroy();
    }

    // Generate Configuration
    let config;
    if (targetType === 'radar') {
        config = getRadarConfig(phones);
    } else {
        config = getBarConfig(phones);
    }

    // Create New Chart
    comparisonChart = new Chart(ctx, config);
    console.log("Chart updated and new chart created");
}


function updateChartDescription(type) {
    const descriptionElement = document.getElementById('chartDescription');
    if (!descriptionElement) return;

    if (type === 'radar') {
        descriptionElement.innerHTML = `
            <strong>Radar View:</strong> The metrics are based on a percentage to 100% to keep the comparison fair 
            For example, 100% RAM means that phone has the highest RAM in your selection. 
            <em>Value</em> is inverted: a cheaper price gives a higher score.
        `;
    } else {
        
        descriptionElement.innerHTML = `
            <strong>Bar View:</strong> Now showing actual values for <strong>${currentMetric.toUpperCase()}</strong>. 
            This allows for a direct side by side comparison of the data.
        `;
    }
}

// Radar configuration and properties
// Radar configuration and properties
function getRadarConfig(phones) {
    // Find the max values to keep the chart fair (Normalisation)
    let maxRam = Math.max(...phones.map(p => p.ram_gb)) || 1;
    let maxStorage = Math.max(...phones.map(p => p.storage_gb)) || 1;
    let maxBattery = Math.max(...phones.map(p => p.battery_mah)) || 1;
    let maxDisplay = Math.max(...phones.map(p => p.display_inches)) || 1;
    let maxCamera = Math.max(...phones.map(p => p.camera_mp)) || 1;
    let maxPrice = Math.max(...phones.map(p => p.price)) || 1;

    // Detect dark mode for contrast
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const textColor = isDark ? '#FFFFFF' : '#666666';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)';

    return {
        type: 'radar',
        data: {
            labels: ['RAM', 'Storage', 'Battery', 'Display', 'Camera', 'Value'],
            datasets: phones.map((phone, index) => ({
                label: phone.brand + ' ' + phone.model,
                data: [
                    (phone.ram_gb / maxRam) * 100,
                    (phone.storage_gb / maxStorage) * 100,
                    (phone.battery_mah / maxBattery) * 100,
                    (phone.display_inches / maxDisplay) * 100,
                    (phone.camera_mp / maxCamera) * 100,
                    100 - (phone.price / maxPrice) * 100 
                ],
                realWorldValues: [
                    phone.ram_gb + 'GB',
                    phone.storage_gb + 'GB',
                    phone.battery_mah + 'mAh',
                    phone.display_inches + '"',
                    phone.camera_mp + 'MP',
                    '£' + phone.price
                ],
                borderColor: getPhoneColor(index),
                backgroundColor: getPhoneColor(index).replace('rgb', 'rgba').replace(')', ', 0.2)'),
                pointBackgroundColor: getPhoneColor(index)
            }))
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: { color: textColor } // Legend text color
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            let score = Math.round(context.raw);
                            let actualValue = context.dataset.realWorldValues[context.dataIndex];
                            return label + ': ' + score + '% (Actual: ' + actualValue + ')';
                        }
                    }
                }
            },
            scales: {
                r: {
                    beginAtZero: true,
                    max: 100,
                    ticks: { display: false },
                    grid: { color: gridColor }, // Web lines color
                    angleLines: { color: gridColor }, // Diagonal lines color
                    pointLabels: {
                        color: textColor, // RAM, Storage, etc. text color
                        font: { family: 'Poppins', size: 12 }
                    }
                }
            }
        }
    };
}

// Bar chart configuration
function getBarConfig(phones) {
    let values = []; 
    let label = '';

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
        label = 'Price (£)';
    }

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const textColor = isDark ? '#FFFFFF' : '#666666';

    return {
        type: 'bar',
        data: {
            labels: phones.map(p => p.brand + ' ' + p.model),
            datasets: [{
                label: label,
                data: values,
                backgroundColor: phones.map((p, i) => getPhoneColor(i).replace('rgb', 'rgba').replace(')', ', 0.7)')),
                borderColor: phones.map((p, i) => getPhoneColor(i)),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: { color: textColor }
                }
            },
            scales: {
                y: { 
                    beginAtZero: true,
                    ticks: { color: textColor },
                    grid: { color: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }
                },
                x: {
                    ticks: { color: textColor }
                }
            }
        }
    };
}

// Getting the phone colour
function getPhoneColor(index) {
    const colors = [ // Keeping the colours consistent for each phone for both charts
        'rgb(99, 102, 241)',  
        'rgb(239, 68, 68)',  
        'rgb(16, 185, 129)',  
        'rgb(245, 158, 11)',  
        'rgb(139, 92, 246)'  
    ];
    
    return colors[index]; 
}