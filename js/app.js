//Global varaibles 
const apiUrl = 'php/api.php';

//Store all data from api   
let allPhones = [];

//store all selected phones for comparison
let selectedPhones = [];

//run app when page loads 

async function initApp() {
    await loadPhones(); //load phones from api
    renderPhones(allPhones); //render phones to UI
    initFilters();
    initialiseChart();
    console.log("App initialised");
    
}

//load phones 
async function loadPhones() { 
        try {
            showLoading('phoneContainer');
            const response = await fetch(apiUrl); //Fetch data from api
            if (!response.ok) { //if json repsonse is not ok
                throw new Error(`Failed to fetch phones: ${response.status} ${response.statusText}`);
            }
            const data = await response.json();//parse json data
            hideLoading('phoneContainer');//hide loading spinner
            allPhones = data //store data globally


            document.getElementById('totalCount').textContent = allPhones.length;//update total phones count

            return data; //return data
        } catch (error) {  
            console.error('Error loading phones:', error);
            showError('Failed to load phones. Please try again later.', 'phoneContainer');
            return [];

        }
}      


//render phones
function renderPhones(phones) {
    const container = document.getElementById('phoneContainer');

    if (!phones.length) {
        container.innerHTML = `
            <div class="col-span-full text-center py-8">
                <i class="fas fa-exclamation-circle text-4xl text-base-content/40 mb-4"></i>
                <p class="text-base-content/60">No phones found matching your criteria.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = phones.map(phone => {
        const isSelected = selectedPhones.find(p => p.id === phone.id);
        return `
    <div class="group relative bg-white rounded-2xl p-5 border-2 transition-all duration-300 
        ${isSelected ? 'border-purple-600 ring-4 ring-purple-50' : 'border-gray-100 hover:border-purple-200 hover:shadow-xl'}">
        
        <div class="flex justify-between items-start mb-4">
            <div>
                <h3 class="font-bold text-gray-800 text-lg tracking-tight">${phone.brand}</h3>
                <p class="text-sm text-gray-500 font-medium">${phone.model}</p>
            </div>
            <span class="px-3 py-1 bg-purple-600 text-white text-xs font-bold rounded-full shadow-sm">
                ${formatPrice(phone.price)}
            </span>
        </div>

        <div class="grid grid-cols-2 gap-y-3 gap-x-2 text-xs mb-6">
            <div class="flex items-center gap-2">
                <div class="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center">
                    <i class="fas fa-memory text-purple-600"></i>
                </div>
                <span class="text-gray-600"><strong>${phone.ram_gb}GB</strong> RAM</span>
            </div>
            <div class="flex items-center gap-2">
                <div class="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center">
                    <i class="fas fa-hdd text-purple-600"></i>
                </div>
                <span class="text-gray-600"><strong>${phone.storage_gb}GB</strong> Storage</span>
            </div>
            <div class="flex items-center gap-2">
                <div class="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center">
                    <i class="fas fa-battery-full text-purple-600"></i>
                </div>
                <span class="text-gray-600"><strong>${phone.battery_mah}</strong> mAh</span>
            </div>
            <div class="flex items-center gap-2">
                <div class="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center">
                    <i class="fas fa-mobile-alt text-purple-600"></i>
                </div>
                <span class="text-gray-600"><strong>${phone.display_inches}"</strong> Screen</span>
            </div>
        </div>

        <button onclick="toggleCompare(${phone.id})" 
            class="w-full py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2
            ${isSelected 
                ? 'bg-red-50 text-red-600 border border-red-100 hover:bg-red-100' 
                : 'bg-purple-600 text-white hover:bg-purple-600 '}">
            <i class="fas fa-${isSelected ? 'trash-alt' : 'plus'}"></i>
            ${isSelected ? 'Remove' : 'Compare Now'}
        </button>
    </div>
        `;
    }).join('');

    


    // Attach click listeners to all compare buttons
    container.querySelectorAll('.compare-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.getAttribute('data-id'));
            toggleCompare(id);
        });
    });

    // Update total count
    document.getElementById('resultCount').textContent = phones.length;
}


function toggleCompare(phoneId) {
    // Convert to string for safe comparison
    const targetId = String(phoneId);

    // Find if this phone is already selected 
    const index = selectedPhones.findIndex(p => String(p.id) === targetId);

    if (index > -1) {
        // Remove from selection
        selectedPhones.splice(index, 1);
        console.log(`Removed phone ${phoneId} from comparison`);
    } else {

        
        // Check if we already have 5 phones    
        if (selectedPhones.length >= 5) {
            alert("Maximum 5 phones can be compared");
            return;
        }

        // Find the full phone
        const phone = allPhones.find(p => String(p.id) === targetId);
        
        if (phone) {
            selectedPhones.push(phone);
            console.log(`Added phone ${phoneId} to comparison`);
        } else {
            console.error("Phone not found with ID:", phoneId); 
            return;
        }
    }

    // Reapply filters instead of showing all phones
    if (typeof applyFilters === 'function') {
        applyFilters(); //apply filters to upate
    } else {
        
        renderPhones(allPhones);
    }
    
    updateSelectedCount();
    updateSelectedPhonesList();
    updateChart();
}

function updateSelectedCount() { 
    const count = selectedPhones.length;

    //Update the Purple Counter
    const selectedCountEl = document.getElementById('selectedCount');
    if (selectedCountEl) {
        selectedCountEl.textContent = count;
    }

    //Get the grey counter element
    const chartCompareCountEl = document.getElementById('chartCompareCount');
    
    //Update the grey counter with dynamic colour stlying based on count
    if (chartCompareCountEl) {
        console.log("Updating grey counter to:", count); // Check the count value being set
        chartCompareCountEl.textContent = `Comparing ${count}/5 phones`;
        
        // Update the styling
        if (count === 5) {
            chartCompareCountEl.className = "inline-block bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg text-sm mb-4";
        } else if (count > 0) {
            chartCompareCountEl.className = "inline-block bg-purple-100 text-white-600 font-semibold py-2 px-4 rounded-lg text-sm mb-4";
        } else {
            chartCompareCountEl.className = "inline-block bg-gray-100 text-gray-600 font-semibold py-2 px-4 rounded-lg text-sm mb-4";
        }
    } else {
        console.warn("Could not find the element with ID: chartCompareCount");
    }
}




function updateSelectedPhonesList() {
    const container = document.getElementById('selectedPhonesList');
    
    if (selectedPhones.length === 0) {
        container.innerHTML = `
            <p class="text-sm text-base-content/60 text-center py-4">
                Select phones to start comparing
            </p>
        `;
        return;
    }
    
    container.innerHTML = selectedPhones.map((phone, index) => `
    <div class="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 transition-colors">
        <div class="flex items-center gap-3">
            <div class="w-3 h-3 rounded-full shadow-sm" 
                 style="background-color: ${getPhoneColor(index)}"></div>
            
            <div class="flex flex-col">
                <span class="text-xs font-bold text-gray-400 uppercase tracking-tight leading-none mb-1">${phone.brand}</span>
                <span class="text-sm font-semibold text-gray-700 leading-none">${phone.model}</span>
            </div>
        </div>
        
        <button class="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" 
                onclick="toggleCompare(${phone.id})"
                title="Remove from comparison">
            <i class="fas fa-times text-sm"></i>
        </button>
    </div>
`).join('');
}


function getPhoneColor(index) {
    const colors = ['#6366F1', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6'];
    return colors[index];
}
    
    //call initEventListeners
function initEventListeners() {
}

    


    
document.addEventListener('DOMContentLoaded', initApp);

