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
    console.log("App initialized");
    
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
        <div class="phone-card ${isSelected ? 'selected' : ''}" data-id="${phone.id}">
            <div class="flex justify-between items-start mb-3">
                <div>
                    <h3 class="font-semibold text-lg">${phone.brand}</h3>
                    <p class="text-sm text-base-content/70">${phone.model}</p>
                </div>
                <span class="badge badge-primary text-white">${formatPrice(phone.price)}</span>
            </div>
            <div class="grid grid-cols-2 gap-2 text-sm mb-4">
                <div><i class="fas fa-memory text-purple-600 mr-1"></i><span class="text-base-content/70">RAM:</span> <strong>${phone.ram_gb}GB</strong></div>
                <div><i class="fas fa-hdd text-purple-600 mr-1"></i><span class="text-base-content/70">Storage:</span> <strong>${phone.storage_gb}GB</strong></div>
                <div><i class="fas fa-battery-full text-purple-600 mr-1"></i><span class="text-base-content/70">Battery:</span> <strong>${phone.battery_mah}mAh</strong></div>
                <div><i class="fas fa-mobile-alt text-purple-600 mr-1"></i><span class="text-base-content/70">Display:</span> <strong>${phone.display_inches}"</strong></div>
            </div>
            <button class="compare-btn btn btn-sm btn-primary w-full text-white" data-id="${phone.id}">
                <i class="fas fa-${isSelected ? 'check' : 'plus'} mr-2"></i>
                ${isSelected ? 'Selected' : 'Compare'}
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
        // Add new phone
        
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

    // Re-apply filters instead of showing all phones
    if (typeof applyFilters === 'function') {
        applyFilters(); //apply filters to upate
    } else {
        
        renderPhones(allPhones);
    }
    
    updateSelectedCount();
    updateSelectedPhonesList();
}

function updateSelectedCount() { 
    async function initApp() {
    const data = await loadPhones(); //load phones from api
    renderPhones(data); //render phones to UI
}document.getElementById('selectedCount').textContent = selectedPhones.length; }

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
        <div class="flex items-center justify-between p-2 bg-base-200 rounded-lg">
            <div class="flex items-center gap-2">
                <div class="w-3 h-3 rounded-full" 
                     style="background-color: ${getPhoneColor(index)}"></div>
                <span class="text-sm font-medium">${phone.brand} ${phone.model}</span>
            </div>
            <button class="btn btn-ghost btn-xs" onclick="toggleCompare(${phone.id})">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `).join('');
}

function getPhoneColor(index) {
    const colors = ['#6366F1', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6'];
    return colors[index % colors.length];
}
    
    //call initEventListeners
function initEventListeners() {
}

    


    
document.addEventListener('DOMContentLoaded', initApp);

