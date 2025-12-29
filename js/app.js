console.log('App.js loaded');

fetch('../php/api.php?brand=Apple', { cache: "no-store" })
    .then(response => {
        console.log('HTTP status:', response.status);
        return response.text(); // Read raw response first
    })
    .then(rawData => {
        console.log('RAW response:', rawData);
        try {
            const data = JSON.parse(rawData);
            console.log('Parsed JSON:', data);
        } catch (e) {
            console.error('JSON parse error:', e);
        }
    })
    .catch(error => console.error('Fetch error:', error));


console.log(formatPrice(999.99));
console.log(formatDate('2023-09-22'));

showLoading('testContainer');

setTimeout(() => {
    hideLoading('testContainer');
    showError('This is a test error message.', 'testContainer');
}, 1500);

const debouncedFunction = debounce(() => console.log('Debounced fired'), 500);
debouncedFunction();

console.log('Helper functions executed');