const breedSearch = document.getElementById("breedSearch");
const searchBreedBtn = document.getElementById("searchBreedBtn");
const randomBreedBtn = document.getElementById("randomBreedBtn");
const resultsGrid = document.getElementById("resultsGrid");
const favoritesGrid = document.getElementById("favoritesGrid");
const API_KEY = "live_CUqm6dJUPZqkYcphRmxB00cXTaJaKZyUis0YcqZ9DoCZeDwEZa0dF1yri0zRhmiu"; 

let favorites = []; // Array to store favorite breeds

document.addEventListener("DOMContentLoaded", initialLoad);

async function initialLoad() {
    const res = await fetch("https://api.thedogapi.com/v1/breeds", {
        headers: { "x-api-key": API_KEY },
    });
    const data = await res.json();
    window.breedsData = data; 
}

searchBreedBtn.addEventListener("click", searchDogBreeds);
randomBreedBtn.addEventListener("click", showRandomDogBreed);

async function searchDogBreeds() {
    const searchTerm = breedSearch.value.toLowerCase().trim();
    
    // Filter breeds based on search term
    const filteredBreeds = window.breedsData.filter(breed =>
        breed.name.toLowerCase().includes(searchTerm)
    );

    // Clear previous results
    resultsGrid.innerHTML = "";

    if (filteredBreeds.length > 0) {
        for (const breed of filteredBreeds) {
            const res = await axios.get(`https://api.thedogapi.com/v1/images/search?limit=5&breed_ids=${breed.id}`);
            const images = res.data;

            // Create a section for the breed
            const breedSection = document.createElement("div");
            breedSection.classList.add("col-md-4", "mb-4");

            // Show breed details and images
            breedSection.innerHTML = `
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">${breed.name}</h5>
                        <p class="card-text">Group: ${breed.breed_group || "Unknown"}</p>
                        <p class="card-text">Weight: ${breed.weight.imperial} lbs</p>
                        <p class="card-text">Height: ${breed.height.imperial} inches</p>
                        <p class="card-text">Life Span: ${breed.life_span}</p>
                        <p class="card-text">Temperament: ${breed.temperament || "Not specified"}</p>
                        <button class="btn btn-success favorite-btn" data-breed='${JSON.stringify(breed)}'>Favorite</button>
                    </div>
                    <div class="card-img-bottom row">
                        ${images.map(image => `<div class="col-6"><img src="${image.url}" alt="${breed.name}" class="img-fluid rounded" /></div>`).join('')}
                    </div>
                </div>
            `;
            resultsGrid.appendChild(breedSection);
        }

        // Add event listeners for favorite buttons
        document.querySelectorAll(".favorite-btn").forEach(btn => {
            btn.addEventListener("click", addToFavorites);
        });
    } else {
        resultsGrid.innerHTML = `<p>No breeds found for "${searchTerm}".</p>`;
    }
}

async function showRandomDogBreed() {
    const res = await axios.get("https://api.thedogapi.com/v1/images/search", {
        headers: { "x-api-key": API_KEY },
    });
    const randomDog = res.data[0];

    const randomBreedSection = document.createElement("div");
    randomBreedSection.classList.add("text-center", "mt-4");
    randomBreedSection.innerHTML = `
        <h4>Random Dog Breed</h4>
        <img src="${randomDog.url}" alt="Random Dog" class="img-fluid rounded" style="max-width: 300px;" />
    `;
    resultsGrid.innerHTML = ""; // Clear previous results
    resultsGrid.appendChild(randomBreedSection);
}

function addToFavorites(event) {
    const breed = JSON.parse(event.target.getAttribute("data-breed"));
    if (!favorites.some(fav => fav.id === breed.id)) {
        favorites.push(breed);
        renderFavorites();
    }
}

function renderFavorites() {
    favoritesGrid.innerHTML = ""; // Clear previous favorites

    favorites.forEach(breed => {
        const favSection = document.createElement("div");
        favSection.classList.add("col-md-4", "mb-4");
        favSection.innerHTML = `
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">${breed.name}</h5>
                    <p class="card-text">Group: ${breed.breed_group || "Unknown"}</p>
                    <p class="card-text">Weight: ${breed.weight.imperial} lbs</p>
                    <p class="card-text">Height: ${breed.height.imperial} inches</p>
                    <p class="card-text">Life Span: ${breed.life_span}</p>
                    <p class="card-text">Temperament: ${breed.temperament || "Not specified"}</p>
                    <button class="btn btn-danger remove-btn" data-breed='${JSON.stringify(breed)}'>Remove</button>
                </div>
                <img src="${breed.image?.url || ""}" alt="${breed.name}" class="img-fluid rounded" />
            </div>
        `;
        favoritesGrid.appendChild(favSection);
    });

    // Add event listeners for remove buttons
    document.querySelectorAll(".remove-btn").forEach(btn => {
        btn.addEventListener("click", removeFromFavorites);
    });
}

function removeFromFavorites(event) {
    const breed = JSON.parse(event.target.getAttribute("data-breed"));
    favorites = favorites.filter(fav => fav.id !== breed.id);
    renderFavorites();
}
