
let tableData = [];

//configuration for the detault sorting method 
let tableSortConfig = {
    key: 'price',
    order: 'asc'
};




document.addEventListener('DOMContentLoaded', function() {
    initialiseTable();
});
 //making the table functional
async function initialiseTable() {
    console.log("Starting up the table system");

    //Get the data from the database
    await loadTableData();

    //Setup the Search Bar
    const searchInput = document.getElementById('tableSearch');
    
    //check if it exists to avoid errors 
    if (searchInput) {
        searchInput.addEventListener('input', handleTableSearch);
        console.log("Search bar is ready");
    }

    //Setup the Clickable Headers for Sorting
    const headers = document.querySelectorAll('th[data-sort]');
    
    //Loop through each header and add a click listener
    headers.forEach(function(header) {
        header.addEventListener('click', function() {
            // Get the value of attribute
            const sortKey = header.getAttribute('data-sort');
            
            handleSort(sortKey);
        });
    });

    // 4. Setup the Export to CSV Button
    const exportButton = document.getElementById('exportCSV');
    if (exportButton) {
        exportButton.addEventListener('click', exportToCSV);
    }

    console.log("Table initialisation complete.");
}



async function loadTableData() {
    try {
        console.log("Fetching data from api");
        
        // Show the loading spinner
        if (typeof showLoading === 'function') showLoading('tableBody');

      
        const response = await fetch('php/api.php');

        //check response 
        if (!response.ok) {
            console.error("Server returned an error");
            return;
        }

       
        const data = await response.json();
        
        // Save this data into our global variable
        tableData = data;
        console.log("Loaded " + tableData.length + " phones.");

        // Draw the table and the mobile cards for the first time
        renderTable(tableData);
        renderMobileCards(tableData);
        updateTableCount(tableData.length, tableData.length);

        // Hide the loading spinner
        if (typeof hideLoading === 'function') hideLoading('tableBody');

    } catch (error) {
       
        console.error("Error loading data:", error);
    }
}



function renderTable(phones) {
    const tbody = document.getElementById('tableBody');

    
    if (!tbody) return;

    // Clear whatever is currently in the table
    tbody.innerHTML = '';

    // If the list is empty show a message
    if (phones.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="11" class="text-center py-8">
                    <p>No phones found matching your search.</p>
                </td>
            </tr>
        `;
        return;
    }

    // Loop through every phone and create a table row 
    let htmlContent = '';
    
    for (let i = 0; i < phones.length; i++) {
        const phone = phones[i]; // Get the current phone
        
        // Add a new row to our using the phone object
        htmlContent += `
            <tr class="hover:bg-base-200">
                <td class="font-medium">${phone.brand}</td>
                <td>${phone.model}</td>
                <td class="font-bold text-purple-600">$${phone.price}</td>
                <td>${phone.ram_gb} GB</td>
                <td>${phone.storage_gb} GB</td>
                <td>${phone.battery_mah} mAh</td>
                <td>${phone.display_inches}"</td>
                <td>${phone.camera_mp} MP</td>
                <td class="text-sm">${phone.processor}</td>
                <td>${phone.os}</td>
                <td>${phone.release_date}</td>
            </tr>
        `;
    }

    tbody.innerHTML = htmlContent;
}


//different view for mobile phones
function renderMobileCards(phones) {
    const container = document.getElementById('mobileCardContainer');
    
    
    if (!container) return;

    // Clear current cards
    container.innerHTML = '';

    if (phones.length === 0) { //if there are no phones display error message
        container.innerHTML = '<div class="text-center p-4">No phones found.</div>';
        return;
    }

    // Create HTML for cards using the map function
    const cardsHtml = phones.map(function(phone) {
        return `
            <div class="card bg-base-100 shadow-lg border border-base-300 mb-4">
                <div class="card-body p-4">
                    <div class="flex justify-between items-start mb-3">
                        <div>
                            <h3 class="font-bold text-lg">${phone.brand}</h3>
                            <p class="text-sm opacity-70">${phone.model}</p>
                        </div>
                        <span class="badge badge-primary badge-lg">$${phone.price}</span>
                    </div>
                    
                    <div class="grid grid-cols-2 gap-2 text-sm">
                        <div><strong>RAM:</strong> ${phone.ram_gb} GB</div>
                        <div><strong>Storage:</strong> ${phone.storage_gb} GB</div>
                        <div><strong>Battery:</strong> ${phone.battery_mah} mAh</div>
                        <div><strong>Display:</strong> ${phone.display_inches}"</div>
                        <div><strong>Camera:</strong> ${phone.camera_mp} MP</div>
                        <div class="truncate"><strong>CPU:</strong> ${phone.processor}</div>
                    </div>
                </div>
            </div>
        `;
    }).join(''); // Join all the strings together

    container.innerHTML = cardsHtml;
}




function handleTableSearch(event) {
    // Get what the user typed and make it lower
    const searchTerm = event.target.value.toLowerCase().trim();
    
    console.log("Searching for: " + searchTerm);

    // If search is empty show all phones
    if (searchTerm === "") {
        renderTable(tableData);
        renderMobileCards(tableData);
        updateTableCount(tableData.length, tableData.length);
        return;
    }

    // Filter the list
    const filteredList = tableData.filter(function(phone) {
        // Check Brand
        const brandMatch = phone.brand.toLowerCase().includes(searchTerm);
        // Check Model
        const modelMatch = phone.model.toLowerCase().includes(searchTerm);
        
        // Return true if either matches
        return brandMatch || modelMatch;
    });

    // Update the screen with the new short list
    renderTable(filteredList);
    renderMobileCards(filteredList);
    updateTableCount(filteredList.length, tableData.length);
}

function updateTableCount(showing, total) {
    // Update table resutls counter 
    const resultCountEl = document.getElementById('tableResultCount');
    const totalCountEl = document.getElementById('tableTotalCount');
    
    if (resultCountEl) resultCountEl.textContent = showing;
    if (totalCountEl) totalCountEl.textContent = total;
}




function handleSort(sortKey) {
    console.log("User clicked sort header: " + sortKey);

    // Check if we are clicking the same column we are already sorting by
    if (tableSortConfig.key === sortKey) {
        //flip the order 
        if (tableSortConfig.order === 'asc') {
            tableSortConfig.order = 'desc';
        } else {
            tableSortConfig.order = 'asc';
        }
    } else {
        // If it's a new column start with Ascending 
        tableSortConfig.key = sortKey;
        tableSortConfig.order = 'asc';
    }

    // Perform the sort
    // We create a copy ([...tableData]) so we don't break the original list order permanently
    const sortedList = [...tableData];
    
    sortedList.sort(function(a, b) {
        let valueA = a[sortKey];
        let valueB = b[sortKey];

        // If sorting by text (like Brand), use localeCompare for proper alphabetising
        if (typeof valueA === 'string') {
            valueA = valueA.toLowerCase();
            valueB = valueB.toLowerCase();
            
            if (tableSortConfig.order === 'asc') {
                return valueA.localeCompare(valueB);
            } else {
                return valueB.localeCompare(valueA);
            }
        }

        // If sorting by numbers (like Price or RAM)
        if (tableSortConfig.order === 'asc') {
            return valueA - valueB; // Low to High
        } else {
            return valueB - valueA; // High to Low
        }
    });

    // Re-draw the table with the sorted list
    renderTable(sortedList);
    renderMobileCards(sortedList);
    
    // Update the arrows in the headers
    updateSortVisuals(sortKey, tableSortConfig.order);
}

function updateSortVisuals(activeKey, order) {
    // 1. Reset all headers to show the default sort icon
    const allHeaders = document.querySelectorAll('th[data-sort]');
    
    allHeaders.forEach(function(header) {
        // Remove the data-order attribute
        header.removeAttribute('data-order');
        
        // Find the icon inside the header and make it the default double arrow
        const icon = header.querySelector('i');
        if (icon) {
            icon.className = 'fas fa-sort ml-2';
        }
    });

    // 2. Set the active header's icon
    const activeHeader = document.querySelector(`th[data-sort="${activeKey}"]`);
    if (activeHeader) {
        activeHeader.setAttribute('data-order', order);
        
        const icon = activeHeader.querySelector('i');
        if (icon) {
            if (order === 'asc') {
                icon.className = 'fas fa-sort-up ml-2'; // Arrow pointing up
            } else {
                icon.className = 'fas fa-sort-down ml-2'; // Arrow pointing down
            }
        }
    }
}


// ==========================================
// 7. EXPORT TO CSV
// ==========================================

function exportToCSV() {
    console.log("Generating CSV file...");

    if (tableData.length === 0) {
        alert("No data available to export!");
        return;
    }

    // 1. Create the Header Row
    const headers = [
        "Brand", "Model", "Price", "RAM (GB)", "Storage (GB)", 
        "Battery (mAh)", "Display", "Camera", "Processor", "OS", "Date"
    ];
    
    // 2. Create the Data Rows
    // We map over each phone and turn it into a comma-separated string
    const rows = tableData.map(function(phone) {
        return [
            phone.brand,
            phone.model,
            phone.price,
            phone.ram_gb,
            phone.storage_gb,
            phone.battery_mah,
            phone.display_inches,
            phone.camera_mp,
            phone.processor, 
            phone.os,
            phone.release_date
        ].join(",");
    });

    // 3. Combine Header and Rows with "New Line" characters (\n)
    const csvContent = [headers.join(","), ...rows].join("\n");

    // 4. Create a "Blob" (a virtual file object in memory)
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // 5. Create a fake download link and click it automatically
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'mobile_matrix_data.csv');
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    document.body.removeChild(link);
}