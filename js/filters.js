console.log("filters.js loaded"); //Testing the file for testing 

//global variables
let currentFilters = { //Creating an object for the different values 
    brand: "", //empty strings
    search: "",
    maxPrice: null, //empty values
    minRam: null,
    storage: [], // New array for storage selection
};


function initFilters() {
    console.log("Loading filters"); //Loading function

    //Search Input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        // Adding input event so it searches as you type
        searchInput.addEventListener('input', (e) => {
            currentFilters.search = e.target.value.toLowerCase().trim();
            applyFilters();
        });
    }
    
    //Different event listeners for the filters
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

    //Price Filter (Slider)
    const priceSlider = document.getElementById('priceSlider');
    if (priceSlider) {
        priceSlider.addEventListener('input', applyFilters); // Updates as slider moves
    }

    //RAM Filter (Radio Buttons)
    const ramInputs = document.querySelectorAll('input[name="ram"]');
    ramInputs.forEach(input => {
        input.addEventListener('change', applyFilters); // 
    });

    //Storage Filter (Checkboxes)
    const storageCheckboxes = document.querySelectorAll('input[name="storage"]');
    storageCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', applyFilters); // New listener for storage
    });

    //Clear Button
    const clearButton = document.getElementById('clearFilters');
    if (clearButton) {
        clearButton.addEventListener('click', clearAllFilters);
    }

    console.log("Event listeners for filters"); //Testing logs
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
    console.log("Applying filters", currentFilters);

    // Get current filter values from inputs
    const brandFilter = document.getElementById('brandFilter');
    const priceSlider = document.getElementById('priceSlider');
    const ramFilter = document.querySelector('input[name="ram"]:checked');
    const storageCheckboxes = document.querySelectorAll('input[name="storage"]:checked');
    
    // Update currentFilters  with latest values
    currentFilters.brand = brandFilter ? brandFilter.value : ""; //using ternary operator for if else short cut to say if brand there enter value if not false
    currentFilters.maxPrice = priceSlider ? parseInt(priceSlider.value) : null;
    currentFilters.minRam = (ramFilter && ramFilter.value) ? parseInt(ramFilter.value) : null;
    
    // Update storage array from checked boxes
    currentFilters.storage = Array.from(storageCheckboxes).map(cb => parseInt(cb.value));

    const filtered = allPhones.filter(phone => {
        // Search Check
        if (currentFilters.search) { // If there is a search 
            const searchTerm = currentFilters.search;
            const brand = (phone.brand || "").toLowerCase();
            const model = (phone.model || "").toLowerCase();
            const processor = (phone.processor || "").toLowerCase();
            const matchesSearch = brand.includes(searchTerm) ||  model.includes(searchTerm) || processor.includes(searchTerm); // Check if any field matches the search term
            
            if (!matchesSearch) {
                return false;
            }
        }

        //Brand Check
        if (currentFilters.brand) {
            if (phone.brand !== currentFilters.brand) {
                return false;
            }
        }

        //Price Check
        if (currentFilters.maxPrice) {
            if (parseFloat(phone.price) > currentFilters.maxPrice) {
                return false;
            }
        }

        //ram Check
        if (currentFilters.minRam) {
            if (parseInt(phone.ram_gb) < currentFilters.minRam) {
                return false;
            }
        }

        //Storage Check
        if (currentFilters.storage.length > 0) {
            if (!currentFilters.storage.includes(parseInt(phone.storage_gb))) {
                return false;
            }
        }

        return true;
    });

    // Sync selection: remove phones from comparison if they are filtered out
    if (typeof selectedPhones !== 'undefined') {
        selectedPhones = selectedPhones.filter(selected => 
            filtered.some(f => f.id === selected.id)
        );
    }

    console.log(`Filtered ${filtered.length} phones from ${allPhones.length} total`);

    // Render the filtered list
    if (typeof renderPhones === 'function') {
        renderPhones(filtered);
    } else {
        console.error("renderPhones function not found!");
    }
    
    // Update the chart and counts to match the new filtered state
    if (typeof updateChart === 'function') updateChart();
    if (typeof updateSelectedCount === 'function') updateSelectedCount();
    if (typeof updateSelectedPhonesList === 'function') updateSelectedPhonesList();
    
    const resultCountEl = document.getElementById('resultCount');
    if (resultCountEl) resultCountEl.textContent = filtered.length;
}



function clearAllFilters() {
    console.log("Clearing all filters...");
    
    // Reset state
    currentFilters = {
        brand: "",
        search: "",
        maxPrice: null,
        minRam: null,
        storage: [],
    };

    // Reset UI Inputs
    const searchInput = document.getElementById('searchInput');
    const brandFilter = document.getElementById('brandFilter');
    const priceSlider = document.getElementById('priceSlider');
    const ramAny = document.getElementById('ramAny');
    const storageCheckboxes = document.querySelectorAll('input[name="storage"]');

    if (searchInput) searchInput.value = ""; // Clear all inputs
    if (brandFilter) brandFilter.value = "";
    if (priceSlider) {
        priceSlider.value = 2000;
        document.getElementById('priceDisplay').innerText = '£2000';
    }
    if (ramAny) ramAny.checked = true;
    storageCheckboxes.forEach(cb => cb.checked = false);
    
    // Show all phones again
    if (typeof allPhones !== 'undefined' && allPhones) {
        renderPhones(allPhones);
        const resultCountEl = document.getElementById('resultCount');
        if (resultCountEl) resultCountEl.textContent = allPhones.length;
    }
    
    console.log("Filters cleared!");//test logs
}