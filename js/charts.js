// charts.js
// This file handles the Radar and Bar charts for phone comparisons.

let comparisonChart = null; 
let currentMetric = 'overview';

function initialiseChart() {
    console.log('Initialising chart system');
    updateChart(); 
    
    const metricSelect = document.getElementById('metricSelect');
    if (metricSelect) {
        metricSelect.addEventListener('change', handleMetricChange);
    }
}

function handleMetricChange(event) {
    currentMetric = event.target.value;
    updateChart();
}

function updateChart() {
    const canvas = document.getElementById('comparisonChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const phones = (typeof selectedPhones !== 'undefined') ? selectedPhones : [];
    const targetType = (currentMetric === 'overview') ? 'radar' : 'bar';

    // Update the explanation text on the page
    updateExplanationText(targetType);

    if (comparisonChart) {
        comparisonChart.destroy();
    }

    let config;
    if (targetType === 'radar') {
        config = getRadarConfig(phones);
    } else {
        config = getBarConfig(phones);
    }

    comparisonChart = new Chart(ctx, config);
}

// NEW FUNCTION: Explains the chart to the user
function updateExplanationText(type) {
    const infoBox = document.getElementById('chartInfoText');
    if (!infoBox) return;

    if (type === 'radar') {
        infoBox.innerHTML = `
            <strong>How to read this chart:</strong> We use <strong>Normalisation</strong> to compare different units (like £ vs mAh). 
            Each value is converted to a score out of 100 based on the best phone in the list. 
            A larger shape means a better all-round device.
        `;
    } else {
        infoBox.innerHTML = `
            <strong>How to read this chart:</strong> This bar chart shows the <strong>Actual Values</strong> for ${currentMetric}. 
            This allows you to see the exact technical differences between your selected phones.
        `;
    }
}

function getRadarConfig(phones) {
    // Find max values to keep the comparison fair (Normalisation)
    let maxRam = Math.max(...phones.map(p => p.ram_gb)) || 1;
    let maxStorage = Math.max(...phones.map(p => p.storage_gb)) || 1;
    let maxBattery = Math.max(...phones.map(p => p.battery_mah)) || 1;
    let maxDisplay = Math.max(...phones.map(p => p.display_inches)) || 1;
    let maxCamera = Math.max(...phones.map(p => p.camera_mp)) || 1;
    let maxPrice = Math.max(...phones.map(p => p.price)) || 1;

    return {
        type: 'radar',
        data: {
            labels: ['RAM', 'Storage', 'Battery', 'Display', 'Camera', 'Value (Price)'],
            datasets: phones.map((phone, index) => ({
                label: phone.brand + ' ' + phone.model,
                // These are the "Normalised" scores (out of 100)
                data: [
                    (phone.ram_gb / maxRam) * 100,
                    (phone.storage_gb / maxStorage) * 100,
                    (phone.battery_mah / maxBattery) * 100,
                    (phone.display_inches / maxDisplay) * 100,
                    (phone.camera_mp / maxCamera) * 100,
                    100 - (phone.price / maxPrice) * 100 // Lower price = higher value score
                ],
                // Store original values here so we can show them in the tooltip later
                originalValues: [
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
                tooltip: {
                    callbacks: {
                        // This makes the hover-box show: "Score: 80% (Actual: 8GB)"
                        label: function(context) {
                            const score = Math.round(context.raw);
                            const actual = context.dataset.originalValues[context.dataIndex];
                            return context.dataset.label + ': ' + score + '% (Actual: ' + actual + ')';
                        }
                    }
                }
            },
            scales: {
                r: {
                    beginAtZero: true,
                    max: 100,
                    ticks: { display: false }
                }
            }
        }
    };
}

// Bar chart configuration remains mostly the same
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
            scales: {
                y: { beginAtZero: true }
            }
        }
    };
}

function getPhoneColor(index) {
    const colors = [
        'rgb(99, 102, 241)',  
        'rgb(239, 68, 68)',  
        'rgb(16, 185, 129)',  
        'rgb(245, 158, 11)',  
        'rgb(139, 92, 246)'  
    ];
    return colors[index % colors.length];
}