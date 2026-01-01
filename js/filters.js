
console.log("filters.js loaded");

//global variables
let currentFilters = {
    brand: "",
    search: "",
    maxPrice: null,
    minRam: null,
};


function initFilters() {
    console.log("Initializing filters...");

    //Search Input
    const searchInput = document.getElementById('searchInput');
    
    //Search Button 
    const searchButton = document.getElementById('searchButton'); 
    if (searchButton) {
    searchButton.addEventListener('click', handleSearchClick);
    }

    //Brand Filter
    const brandFilter = document.getElementById('brandFilter');
    if (brandFilter) {
        brandFilter.addEventListener('change', applyFilters); // 
    }

    //Price Filter
    const priceFilter = document.getElementById('priceFilter');
    if (priceFilter) {
        priceFilter.addEventListener('change', applyFilters); // 
    }

    //RAM Filter
    const ramFilter = document.getElementById('ramFilter');
    if (ramFilter) {
        ramFilter.addEventListener('change', applyFilters); // 
    }

    //Clear Button
    const clearButton = document.getElementById('clearFilters');
    if (clearButton) {
        clearButton.addEventListener('click', clearAllFilters);
    }

    console.log("Filters initialized successfully!");
}



//Handle search button click
function handleSearchClick() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        currentFilters.search = searchInput.value.toLowerCase().trim();
        applyFilters();
    }
}


//Applying fitlers
function applyFilters() {
    console.log("Applying filters...", currentFilters);
    
    

    // Get current filter values from inputs
    const brandFilter = document.getElementById('brandFilter');
    const priceFilter = document.getElementById('priceFilter');
    const ramFilter = document.getElementById('ramFilter');
    
    // Update currentFilters  with latest values
    currentFilters.brand = brandFilter ? brandFilter.value : "";
    currentFilters.maxPrice = priceFilter && priceFilter.value ? parseInt(priceFilter.value) : null;
    currentFilters.minRam = ramFilter && ramFilter.value ? parseInt(ramFilter.value) : null;

    const filtered = allPhones.filter(phone => {
        // Search Check
        if (currentFilters.search) {
            const searchTerm = currentFilters.search;
            const brand = (phone.brand || "").toLowerCase();
            const model = (phone.model || "").toLowerCase();
            const processor = (phone.processor || "").toLowerCase();

            const matchesSearch = brand.includes(searchTerm) || 
                                  model.includes(searchTerm) || 
                                  processor.includes(searchTerm);
            
            if (!matchesSearch) {
                console.log(`Phone filtered out by search: ${phone.brand} ${phone.model}`);
                return false;
            }
        }

        //Brand Check
        if (currentFilters.brand) {
            if (phone.brand !== currentFilters.brand) {
                console.log(`Phone filtered out by brand: ${phone.brand} !== ${currentFilters.brand}`);
                return false;
            }
        }

        //Price Check
        if (currentFilters.maxPrice) {
            if (parseFloat(phone.price) > currentFilters.maxPrice) {
                console.log(`Phone filtered out by price: ${phone.price} > ${currentFilters.maxPrice}`);
                return false;
            }
        }

        //RAM Check
        if (currentFilters.minRam) {
            if (parseInt(phone.ram_gb) < currentFilters.minRam) {
                console.log(`Phone filtered out by RAM: ${phone.ram_gb} < ${currentFilters.minRam}`);
                return false;
            }
        }

        return true;
    });

    console.log(`Filtered ${filtered.length} phones from ${allPhones.length} total`);

    // Render the filtered list
    if (typeof renderPhones === 'function') {
        renderPhones(filtered);
    } else {
        console.error("renderPhones function not found!");
    }
    
    // Update the "Showing X of Y phones" text
    const resultCountEl = document.getElementById('resultCount');
    if (resultCountEl) resultCountEl.textContent = filtered.length;
}

// --- Clear Filters ---

function clearAllFilters() {
    console.log("Clearing all filters...");
    
    // Reset state
    currentFilters = {
        brand: "",
        search: "",
        maxPrice: null,
        minRam: null,
    };

    // Reset UI Inputs
    const searchInput = document.getElementById('searchInput');
    const brandFilter = document.getElementById('brandFilter');
    const priceFilter = document.getElementById('priceFilter');
    const ramFilter = document.getElementById('ramFilter');

    if (searchInput) searchInput.value = ""; // Clear all inputs
    if (brandFilter) brandFilter.value = "";
    if (priceFilter) priceFilter.value = "";
    if (ramFilter) ramFilter.value = "";    
    
    // Show all phones again
    if (typeof allPhones !== 'undefined' && allPhones) {
        renderPhones(allPhones);
        const resultCountEl = document.getElementById('resultCount');
        if (resultCountEl) resultCountEl.textContent = allPhones.length;
    }
    
    console.log("Filters cleared!");//test logs
}