let page = 1;
const perPage = 10;
let searchName = null;

function loadListingsData() {
    let url = `http://localhost:8080/api/listings?page=${page}&perPage=${perPage}`;
    if (searchName) url += `&name=${encodeURIComponent(searchName)}`;

    console.log("Fetching Data from:", url); 

    fetch(url)
        .then(res => {
            if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
            return res.json();
        })
        .then(data => {
            console.log("Fetched Data:", data); 

            const tableBody = document.querySelector("#listingsTable tbody");
            tableBody.innerHTML = ""; 

            if (data.length === 0) {
                tableBody.innerHTML = `<tr><td colspan="4" class="text-center text-danger"><strong>No data available</strong></td></tr>`;
                if (page > 1) page--; 
                return;
            }

           
            data.forEach(listing => {
                const row = document.createElement("tr");
                row.setAttribute("data-id", listing._id);
                row.innerHTML = `
                    <td><strong>${listing.name || "N/A"}</strong></td>
                    <td>${listing.room_type || "N/A"}</td>
                    <td>${listing.address?.street || "N/A"}, ${listing.address?.city || "N/A"}, ${listing.address?.country || "N/A"}</td>
                    <td>
                        ${listing.summary || "No summary available."}
                        <br><br>
                        <strong>Accommodates:</strong> ${listing.accommodates || "N/A"}<br>
                        <strong>Rating:</strong> ${listing.review_scores?.review_scores_rating || "N/A"} 
                        (${listing.number_of_reviews || 0} Reviews)
                    </td>
                `;

                row.addEventListener("click", () => loadListingDetails(listing._id));
                tableBody.appendChild(row);
            });

            document.getElementById("current-page").textContent = page;
        })
        .catch(err => {
            console.error("Fetch Error:", err);
            document.querySelector("#listingsTable tbody").innerHTML = 
                `<tr><td colspan="4" class="text-center text-danger"><strong>Error loading data. Check Console (F12) for details.</strong></td></tr>`;
        });
}

function loadListingDetails(id) {
    let url = `http://localhost:8080/api/listings/${id}`;
    console.log("Fetching Details from:", url); 

    fetch(url)
        .then(res => res.ok ? res.json() : Promise.reject(res.status))
        .then(data => {
            console.log("Fetched Details:", data); 

            document.querySelector(".modal-title").textContent = data.name || "No Name Available";
            document.querySelector(".modal-body").innerHTML = `
                <img class="img-fluid w-100" 
                     onerror="this.onerror=null;this.src='https://placehold.co/600x400?text=Photo+Not+Available'"
                     src="${data.images?.picture_url || 'https://placehold.co/600x400?text=Photo+Not+Available'}">
                <br><br>
                <p>${data.neighborhood_overview || "No overview available."}</p>
                <strong>Price:</strong> $${data.price ? data.price.toFixed(2) : "N/A"}<br>
                <strong>Room Type:</strong> ${data.room_type || "N/A"}<br>
                <strong>Bed Type:</strong> ${data.bed_type || "N/A"} (${data.beds || "N/A"})<br>
                <strong>Accommodates:</strong> ${data.accommodates || "N/A"}<br>
                <strong>Reviews:</strong> ${data.number_of_reviews || 0}<br>
            `;

            new bootstrap.Modal(document.getElementById("detailsModal")).show();
        })
        .catch(err => {
            console.error("Error fetching listing details:", err);
            document.querySelector(".modal-body").innerHTML = "<p class='text-danger'>Error loading listing details.</p>";
        });
}

document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM Loaded - Initializing Event Listeners"); 

    document.getElementById("previous-page").addEventListener("click", () => { 
        if (page > 1) { 
            page--; 
            loadListingsData(); 
        }
    });

    document.getElementById("next-page").addEventListener("click", () => { 
        page++; 
        loadListingsData(); 
    });

    document.getElementById("searchForm").addEventListener("submit", (e) => { 
        e.preventDefault(); 
        searchName = document.getElementById("name").value.trim() || null; 
        page = 1; 
        loadListingsData(); 
    });

    document.getElementById("clearForm").addEventListener("click", () => { 
        document.getElementById("name").value = ""; 
        searchName = null; 
        loadListingsData(); 
    });

    loadListingsData();
});