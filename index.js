
const API_KEY = "live_qyGfJvEdNdIsjX1nQo0DIlEmBUwV1OST8KaBCMAuyHgxFL4qir6eBzB9AQ5pFr1a";
const API_URL_BREEDS = "https://api.thecatapi.com/v1/breeds";
const API_URL_SEARCH = "https://api.thecatapi.com/v1/images/search";
const breedSelect = document.getElementById('breed-select');
const dataContainer = document.getElementById('data-container');
const actionBtn = document.querySelector('.action-btn');

async function fetchAllBreeds() {
    try {
        const response = await fetch(API_URL_BREEDS, {
            headers: { 'x-api-key': API_KEY }
        });

        if (!response.ok) throw new Error("Failed to fetch breeds list.");

        const breeds = await response.json();
        
        breeds.forEach(breed => {
            const option = document.createElement('option');
            option.value = breed.id;
            option.textContent = breed.name;
            breedSelect.appendChild(option);
        });

        console.log("✅ Successfully loaded", breeds.length, "breeds.");
    } catch (error) {
        console.error("❌ Error fetching breeds:", error.message);
        dataContainer.innerHTML = `<p style="color: red;">Could not load breeds. Check the console.</p>`;
    }
}

async function fetchBreedDetails() {
    const breedId = breedSelect.value;
    
    if (!breedId) {
        alert("Please select a breed first!");
        return;
    }

    dataContainer.innerHTML = `<div class="static-placeholder">Fetching kitty data...</div>`;

    try {
      
        const response = await fetch(`${API_URL_SEARCH}?breed_ids=${breedId}`, {
            headers: { 'x-api-key': API_KEY }
        });

        if (!response.ok) throw new Error("Could not retrieve cat details.");

        const data = await response.json();
        
        if (data.length > 0) {
            displayData(data[0]);
        } else {
            dataContainer.innerHTML = `<p>No data found for this breed.</p>`;
        }

    } catch (error) {
        console.error("❌ API Call Failed:", error.message);
        dataContainer.innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
    }
}


function displayData(catObj) {
    const breedInfo = catObj.breeds[0];
    

    dataContainer.innerHTML = `
        <div class="breed-card-dynamic" style="display: flex; gap: 20px; background: white; padding: 20px; border-radius: 20px; width: 100%;">
            <img src="${catObj.url}" alt="${breedInfo.name}" style="width: 300px; border-radius: 15px; object-fit: cover;">
            <div class="info">
                <h2 style="color: var(--warm-orange);">${breedInfo.name}</h2>
                <p><strong>Temperament:</strong> ${breedInfo.temperament}</p>
                <p>${breedInfo.description}</p>
                <p><strong>Origin:</strong> ${breedInfo.origin}</p>
            </div>
        </div>
    `;
    console.log("✨ Displayed info for:", breedInfo.name);
}

actionBtn.addEventListener('click', fetchBreedDetails);


fetchAllBreeds();