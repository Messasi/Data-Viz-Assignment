let tableData = []; //Creaitng an empty array to hold our phone data

//sorting method
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

    //Setup the  Headers for Sorting
    const headers = document.querySelectorAll('th[data-sort]');
    
    //Loop through each header and add a click listener
    headers.forEach(function(header) {
        header.addEventListener('click', function() {
            // Get the value of attribute
            const sortKey = header.getAttribute('data-sort');
            
            handleSort(sortKey);
        });
    });

    console.log("Table initialisation complete.");
}

async function loadTableData() {
    try {
        console.log("Fetching data from api");
        
        // Show the loading spinner
        const tableBody = document.getElementById('tableBody');
        const mobileContainer = document.getElementById('mobileCardContainer');
        
        if (tableBody) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="11" class="text-center py-10">
                        <span class="loading loading-spinner loading-lg text-purple-600"></span>
                        <p class="mt-4 text-gray-500">Loading specifications...</p>
                    </td>
                </tr>
            `;
        }

        const response = await fetch('php/api.php');
        if (!response.ok) throw new Error('Network response was not ok');
        
        const data = await response.json();
        tableData = data;
        
        console.log("Data loaded successfully:", tableData.length, "phones found");

        // Initial render
        renderTable(tableData);
        renderMobileCards(tableData);
        
        // Update counts
        const resultCount = document.getElementById('tableResultCount');
        const totalCount = document.getElementById('tableTotalCount');
        if (resultCount) resultCount.textContent = data.length;
        if (totalCount) totalCount.textContent = data.length;

    } catch (error) {
        console.error("Error loading table data:", error);
        const tableBody = document.getElementById('tableBody');
        if (tableBody) {
            tableBody.innerHTML = `<tr><td colspan="11" class="text-center py-10 text-error">Failed to load data.</td></tr>`;
        }
    }
}

function renderTable(data) {
    const tableBody = document.getElementById('tableBody');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    data.forEach(phone => {
        const row = document.createElement('tr');
        row.className = "hover:bg-base-200 transition-colors";
        row.innerHTML = `
            <td class="px-4 py-3 font-bold">${phone.brand}</td>
            <td class="px-4 py-3">${phone.model}</td>
            <td class="px-4 py-3 text-purple-600 font-bold">${formatPrice(phone.price)}</td>
            <td class="px-4 py-3">${phone.ram_gb}GB</td>
            <td class="px-4 py-3">${phone.storage_gb}GB</td>
            <td class="px-4 py-3">${phone.battery_mah}mAh</td>
            <td class="px-4 py-3">${phone.display_inches}"</td>
            <td class="px-4 py-3">${phone.camera_mp}MP</td>
            <td class="px-4 py-3 text-xs">${phone.processor}</td>
            <td class="px-4 py-3 text-xs">${phone.os}</td>
            <td class="px-4 py-3 text-xs">${formatDate(phone.release_date)}</td>
        `;
        tableBody.appendChild(row);
    });
}

function renderMobileCards(data) {
    const container = document.getElementById('mobileCardContainer');
    if (!container) return;

    container.innerHTML = '';

    data.forEach(phone => {
        const card = document.createElement('div');
        card.className = "card bg-base-100 shadow-md mb-4 border border-base-200";
        card.innerHTML = `
            <div class="card-body p-4">
                <div class="flex justify-between items-start mb-2">
                    <h3 class="font-bold text-lg">${phone.brand} ${phone.model}</h3>
                    <span class="text-purple-600 font-bold">${formatPrice(phone.price)}</span>
                </div>
                <div class="grid grid-cols-2 gap-y-2 text-sm">
                    <div><span class="opacity-60">RAM:</span> ${phone.ram_gb}GB</div>
                    <div><span class="opacity-60">Storage:</span> ${phone.storage_gb}GB</div>
                    <div><span class="opacity-60">Battery:</span> ${phone.battery_mah}mAh</div>
                    <div><span class="opacity-60">Display:</span> ${phone.display_inches}"</div>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

function handleTableSearch(event) {
    const searchTerm = event.target.value.toLowerCase();
    
    const filtered = tableData.filter(phone => {
        return phone.brand.toLowerCase().includes(searchTerm) || 
               phone.model.toLowerCase().includes(searchTerm) ||
               phone.processor.toLowerCase().includes(searchTerm);
    });

    renderTable(filtered);
    renderMobileCards(filtered);
    
    const resultCount = document.getElementById('tableResultCount');
    if (resultCount) resultCount.textContent = filtered.length;
}

function handleSort(sortKey) {
    // If clicking same key, toggle order
    if (tableSortConfig.key === sortKey) {
        tableSortConfig.order = tableSortConfig.order === 'asc' ? 'desc' : 'asc';
    } else {
        tableSortConfig.key = sortKey;
        tableSortConfig.order = 'asc';
    }

    console.log("Sorting by", sortKey, tableSortConfig.order);

    const sortedList = [...tableData].sort((a, b) => {
        let valueA = a[sortKey];
        let valueB = b[sortKey];

        // Handle numeric conversion for sorting
        if (!isNaN(valueA) && !isNaN(valueB)) {
            valueA = parseFloat(valueA);
            valueB = parseFloat(valueB);
        }

        if (tableSortConfig.order === 'asc') {
            return valueA > valueB ? 1 : -1;
        } else {
            return valueA < valueB ? 1 : -1;
        }
    });

    renderTable(sortedList);
    renderMobileCards(sortedList);
    updateSortVisuals(sortKey, tableSortConfig.order);
}

function updateSortVisuals(activeKey, order) {
    const allHeaders = document.querySelectorAll('th[data-sort]');
    allHeaders.forEach(header => {
        const icon = header.querySelector('i');
        if (icon) icon.className = 'fas fa-sort ml-2';
    });

    const activeHeader = document.querySelector(`th[data-sort="${activeKey}"]`);
    if (activeHeader) {
        const icon = activeHeader.querySelector('i');
        if (icon) {
            icon.className = order === 'asc' ? 'fas fa-sort-up ml-2' : 'fas fa-sort-down ml-2';
        }
    }
}