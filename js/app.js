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

