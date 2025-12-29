//helpter Functions 


//Function to convert price to GBP format
function formatPrice(price) {
    return new Intl.NumberFormat('en-GB', { 
        style: 'currency', 
        currency: 'GBP'
    }).format(price);
}

// Format date to readable format
function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-GB', {
        year: 'numeric', 
        month: 'short',
        day: 'numeric'
    });
}

// Debounce function to limit rate of function calls for search function 
function debounce(func, wait) {
    let timeout;
    
    return function executedFunction(...args) {
        const context = this;
        
        clearTimeout(timeout);
        
        timeout = setTimeout(() => {
            func.apply(context, args);
        }, wait);
    };
}

// Show loading spinner in a container
function showLoading(containerId) {
    const container = document.getElementById(containerId);
    
    if (!container) {
        console.warn(`Container with ID "${containerId}" not found`);
        return;
    }
    
    //Loading spinner message 
    container.innerHTML = `
        <div class="text-center col-span-full py-8">
            <span class="loading loading-spinner loading-lg text-purple-600"></span>
            <p class="mt-4 text-base-content/60">Loading smartphones...</p>
        </div> 
    `;
} 

// Hide loading spinner from container
function hideLoading(containerId) {
    const container = document.getElementById(containerId);
    
    if (!container) {
        console.warn(`Container with ID "${containerId}" not found`);
        return;
    }
    
    container.innerHTML = '';//Clear the container 
}

// Show error message in a container
function showError(message, containerId) {
    const container = document.getElementById(containerId);
    
    if (!container) {
        console.warn(`Container with ID "${containerId}" not found`);
        return;
    }
    //Create the error message
    container.innerHTML = ` 
        <div role="alert" class="alert alert-error col-span-full">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>${message}</span>
        </div>
    `;
}