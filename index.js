const API_KEY = "live_nQyM3snl9IaMOBHRRqTreeSKjHCIjOyBkznjIApxR7ci4Ojhi4fOL2GCYPWCxK8r";
const breedSelect = document.getElementById('breed-select');
const dataContainer = document.getElementById('data-container');
const actionBtn = document.querySelector('.action-btn');
const loginModal = document.getElementById('login-modal');
const favSection = document.getElementById('favorites-section');
const favGrid = document.getElementById('favorites-grid');

let currentUser = localStorage.getItem('currentCatUser') || null;

function updateUIForUser() {
    const greeting = document.getElementById('user-greeting');
    const loginBtn = document.querySelector('.login-btn');
    const logoutBtn = document.getElementById('logout-btn');

    if (currentUser) {
        greeting.textContent = `Hello, ${currentUser}! 🐾`;
        loginBtn.style.display = 'none';
        logoutBtn.style.display = 'inline-block';
        favSection.classList.add('active');
        renderFavorites();
    } else {
        greeting.textContent = "";
        loginBtn.style.display = 'inline-block';
        logoutBtn.style.display = 'none';
        favSection.classList.remove('active');
    }
}

function saveFavorite(name, url) {
    if (!currentUser) return alert("Log in to save favorites!");
    let key = `favs_${currentUser}`;
    let favs = JSON.parse(localStorage.getItem(key)) || [];
    if (favs.some(c => c.name === name)) return alert("Already saved!");
    favs.push({ name, url });
    localStorage.setItem(key, JSON.stringify(favs));
    renderFavorites();
}

function renderFavorites() {
    let key = `favs_${currentUser}`;
    let favs = JSON.parse(localStorage.getItem(key)) || [];
    favGrid.innerHTML = favs.map(cat => `
        <div class="fav-card">
            <img src="${cat.url}">
            <h3>${cat.name}</h3>
            <button onclick="removeFavorite('${cat.name}')">Remove</button>
        </div>
    `).join('');
}

function removeFavorite(name) {
    let key = `favs_${currentUser}`;
    let favs = JSON.parse(localStorage.getItem(key)) || [];
    favs = favs.filter(c => c.name !== name);
    localStorage.setItem(key, JSON.stringify(favs));
    renderFavorites();
}

// --- API & DATA DISPLAY ---
async function fetchAllBreeds() {
    const res = await fetch("https://api.thecatapi.com/v1/breeds", { headers: { 'x-api-key': API_KEY } });
    const breeds = await res.json();
    breeds.forEach(b => {
        const opt = document.createElement('option');
        opt.value = b.id; opt.textContent = b.name;
        breedSelect.appendChild(opt);
    });
}

function displayData(catObj) {
    const breed = catObj.breeds[0];
    if (!breed) return;

    dataContainer.innerHTML = `
        <div class="breed-card-dynamic">
            <img src="${catObj.url}" style="width:100%; border-radius:15px;">
            <div class="info">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <h2>${breed.name}</h2>
                    <button id="heart-btn">❤️</button>
                </div>
                <p><strong>Origin:</strong> ${breed.origin}</p>
                <p>${breed.description}</p>
                
                <div class="stat-container">
                    ${createStatRow("Affection", breed.affection_level)}
                    ${createStatRow("Energy", breed.energy_level)}
                    ${createStatRow("Intelligence", breed.intelligence)}
                </div>
            </div>
        </div>
    `;
    setTimeout(() => {
        document.querySelectorAll('.stat-bar-fill').forEach(bar => {
            bar.style.width = bar.getAttribute('data-level') + '%';
        });
    }, 100);

    document.getElementById('heart-btn').onclick = () => saveFavorite(breed.name, catObj.url);
}

function createStatRow(label, level) {
    const percentage = level * 20; // 5 stars = 100%
    return `
        <div class="stat-row">
            <span class="stat-label">${label} Level</span>
            <div class="stat-bar-bg">
                <div class="stat-bar-fill" data-level="${percentage}"></div>
            </div>
        </div>
    `;
}

async function getDetails() {
    const id = breedSelect.value;
    if (!id) return;
    const res = await fetch(`https://api.thecatapi.com/v1/images/search?breed_ids=${id}`, { headers: { 'x-api-key': API_KEY } });
    const data = await res.json();
    displayData(data[0]);
}

actionBtn.onclick = getDetails;
document.getElementById('random-btn').onclick = async () => {
    const res = await fetch(`https://api.thecatapi.com/v1/images/search?has_breeds=1`, { headers: { 'x-api-key': API_KEY } });
    const data = await res.json();
    displayData(data[0]);
};

document.querySelector('.login-btn').onclick = () => loginModal.classList.add('active');
document.getElementById('logout-btn').onclick = () => { currentUser = null; localStorage.removeItem('currentCatUser'); updateUIForUser(); };
document.getElementById('confirm-login').onclick = () => {
    const val = document.getElementById('username-input').value;
    if (val) { currentUser = val; localStorage.setItem('currentCatUser', val); updateUIForUser(); loginModal.classList.remove('active'); }
};

window.onload = () => { fetchAllBreeds(); 
updateUIForUser(); 
};