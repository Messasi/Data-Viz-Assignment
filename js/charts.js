// Global variables
let comparisonChart = null; // object to hold chart instance
let currentMetric = 'overview'; // default metric

function initialiseChart() {
    console.log('Initialising chart system'); // check if function runs 
    updateChart(); // display empty chart 
    
    const metricSelect = document.getElementById('metricSelect');
    if (metricSelect) { // check if the element exists before adding event listener
        metricSelect.addEventListener('change', handleMetricChange); // when the metric is changed instantly update chart through event listners of the select
    }

    const adjustCanvasHeight = () => {
        const canvas = document.getElementById('comparisonChart'); //get the element from the html
        if (!canvas) return; // if the element is not found, exit the function

        if (window.innerWidth < 768) {
            canvas.parentNode.style.height = '400px'; // Taller on mobile 
        } else {
            canvas.parentNode.style.height = '300px'; // Standard on desktop
        }
    };

    window.addEventListener('resize', adjustCanvasHeight); // Adjust height on window resize
    adjustCanvasHeight(); // Run on load
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

    // Update the text description above the chart
    updateChartDescription(targetType);

    // remove previous chart type if it is there
    if (comparisonChart) {
        comparisonChart.destroy();
    }

    let config;
    // logic to detect the Grouped Chart
    if (currentMetric === 'GroupedPricing') {
        updateChartDescription('bar'); // Use bar-style description
        config = getGroupedPriceConfig(phones);
    } else if (currentMetric === 'overview') {
        updateChartDescription('radar');
        config = getRadarConfig(phones);
    } else {
        updateChartDescription('bar');
        config = getBarConfig(phones);
    }

    comparisonChart = new Chart(ctx, config);
    console.log("Chart updated and new chart created");
}

function updateChartDescription(type) {
    const descriptionElement = document.getElementById('chartDescription');
    if (!descriptionElement) return;

    // Determine the win condition text for the legend
    const winCondition = (currentMetric === 'price') 
        ? 'the lowest price' 
        : 'the highest specification';

        

    if (type === 'radar') {
        descriptionElement.innerHTML = `
            <strong>Radar View:</strong> Showing normalised scores across all metrics for each phone. 
            This allows you to see the overall strengths and weaknesses of each device in one view.
            
        `;
    } else {
        const content = `
            <strong>Bar View:</strong> Showing actual values for <strong>${currentMetric.toUpperCase()}</strong>. 
            This allows for a direct side by side comparison of the data.
        `;

        // HTML Legend Key for the thick border only for the best value

        if (currentMetric === 'GroupedPricing') {
            descriptionElement.innerHTML = `
                <strong>Grouped Bar Chart:</strong> Comparing the original launch price of each phone against its current market value in 2026.
            `;
        } else {
        const legendKey = `
            <div style="margin-top: 15px; padding: 10px; border: 1px solid #ddd; border-radius: 8px; display: inline-flex; align-items: center; gap: 12px; background-color: #f9f9f9;">
                <div style="width: 30px; height: 15px; background: #eee; border: 3px solid #333; border-radius: 2px;"></div>
                <span style="font-size: 0.9em; color: #333;">
                    <strong>Best Result:</strong> The bar with the <strong>thick border</strong> represents the highest value for <strong>${currentMetric}</strong>.
                </span>
            </div>
        `;
        descriptionElement.innerHTML = content + legendKey;
        }
    }
}

// Radar configuration and properties
function getRadarConfig(phones) {
    // Find the max values to keep the chart fair (Normalisation)
    let maxRam = Math.max(...phones.map(p => p.ram_gb)) || 1; //uses an arrow function as a quicker way to find the max vlaue without crashing code 
    let maxStorage = Math.max(...phones.map(p => p.storage_gb)) || 1; // uses spread operator to fid max vlaue in arrray 
    let maxBattery = Math.max(...phones.map(p => p.battery_mah)) || 1; //uses map operator to create an array of the battery values and then finds the max value in that array
    let maxDisplay = Math.max(...phones.map(p => p.display_inches)) || 1;
    let maxCamera = Math.max(...phones.map(p => p.camera_mp)) || 1;
    let maxPrice = Math.max(...phones.map(p => p.price)) || 1;

    
    const textColor = '#666666';


    return {
        type: 'radar', 
        data: {
            labels: ['RAM', 'Storage', 'Battery', 'Display', 'Camera', 'Price'], // the metrics to be compared
            datasets: phones.map((phone, index) => ({
                label: phone.brand + ' ' + phone.model,
                data: [ // normalisation for the radar chart 
                    (phone.ram_gb / maxRam) * 100,
                    (phone.storage_gb / maxStorage) * 100,
                    (phone.battery_mah / maxBattery) * 100,
                    (phone.display_inches / maxDisplay) * 100,
                    (phone.camera_mp / maxCamera) * 100,
                    100 - (phone.price / maxPrice) * 100,
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
                backgroundColor: getPhoneColor(index).replace('rgb', 'rgba').replace(')', ', 0.05)'),
                pointBackgroundColor: getPhoneColor(index)
            }))
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: { 
                        color: textColor,
                        boxWidth: 0 // Removes the color rectangle
                    } // Legend text color
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
                    min: 0,
                    max: 100,
                    ticks: {
                        stepSize: 20,
                        showLabelBackdrop: false,
                        //Lables 
                        callback: (value) => value + '%'
                    },
                    pointLabels: {
                        font: { size: 12, weight: 'bold' }
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

    // Data selection logic
    if (currentMetric === 'ram') {
        values = phones.map(p => parseFloat(p.ram_gb));
        label = 'RAM (GB)';
    } else if (currentMetric === 'storage') {
        values = phones.map(p => parseFloat(p.storage_gb));
        label = 'Storage (GB)';
    } else if (currentMetric === 'battery') {
        values = phones.map(p => parseFloat(p.battery_mah));
        label = 'Battery (mAh)';
    } else if (currentMetric === 'display') {
        values = phones.map(p => parseFloat(p.display_inches));
        label = 'Display Size (Inches)';
    } else if (currentMetric === 'camera') {
        values = phones.map(p => parseFloat(p.camera_mp));
        label = 'Camera (MP)';
    } else if (currentMetric === 'price') {
        values = phones.map(p => parseFloat(p.price));
        label = 'Price (£)';
    }

    // Identify the Best Value (handling empty arrays with default)
    const bestValue = (currentMetric === 'price') 
        ? Math.min(...values) 
        : Math.max(...values);

     
    const borderThicknesses = values.map(val => {
    if (val === bestValue && val !== 0) {
        return 4; // Thickkness for winner
    } else {
        return 1; 
    }
});

    const textColor = '#666666';

    return {
        type: 'bar',
        data: {
            labels: phones.map(p => p.brand + ' ' + p.model),
            datasets: [{
                label: label,
                data: values,
                backgroundColor: phones.map((p, i) => getPhoneColor(i).replace('rgb', 'rgba').replace(')', ', 0.7)')),
                borderColor: phones.map((p, i) => borderThicknesses[i] > 1 ? '#0b0b0b' : getPhoneColor(i)), 
                //set the border color to a dark colour if it's the best value, otherwise use the phone colour
                borderWidth: borderThicknesses,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { 
                    labels: { 
                        color: textColor,
                        boxWidth: 0 // Removes the color rectangle
                    } 
                }
            },
            scales: {
                y: { 
                    beginAtZero: true,
                    ticks: { color: textColor },
                    grid: { color: 'rgba(0, 0, 0, 0.1)' }
                },
                x: {
                    ticks: { color: textColor }
                }
            }
        }
    };
}

//Grouped Bar Chart configuration for Price vs Market Value
function getGroupedPriceConfig(phones) {
    const textColor = '#666666';

    return {
        type: 'bar',
        data: {
            // Extracts only the year from the YYYY-MM-DD release_date string
            labels: phones.map(p => {
                const year = p.release_date ? p.release_date.split('-')[0] : 'N/A';
                return `${p.model} (${year})`;
            }),
            datasets: [
                {
                    label: 'Launch Price (£)',
                    data: phones.map(p => parseFloat(p.price) || 0),
                    backgroundColor: 'rgba(99, 102, 241, 0.7)',
                    borderColor: 'rgb(99, 102, 241)',
                    borderWidth: 1
                },
                {
                    label: 'Market Value (2026) (£)',
                    // Ensure 'MarketValue' matches your SQL column name exactly
                    data: phones.map(p => parseFloat(p.MarketValue) || 0),
                    backgroundColor: 'rgba(16, 185, 129, 0.7)',
                    borderColor: 'rgb(16, 185, 129)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    labels: { color: textColor, boxWidth: 20 }
                },
                tooltip: {
                    callbacks: {
                        footer: (items) => {
                            if (items.length < 2) return '';
                            const launch = items[0].raw;
                            const current = items[1].raw;
                            const loss = launch - current;
                            const percent = ((loss / launch) * 100).toFixed(1);
                            return `Value Lost: £${loss.toFixed(2)} (${percent}%)`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { 
                        color: textColor,
                        callback: (value) => '£' + value 
                    }
                },
                x: { ticks: { color: textColor } }
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
    
    return colors[index % colors.length]; 
}