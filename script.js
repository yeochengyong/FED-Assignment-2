function navigateToCategory(categoryPage) {
    window.location.href = `/categories/${categoryPage}`;
}
// update log in with account page with sidebar
document.addEventListener('DOMContentLoaded', () => {
    // Check if a user is logged in (saved in localStorage)
    const loggedInUser = localStorage.getItem('loggedInUser');
    const headerAction = document.querySelector('.header-top-action');
  
    if (loggedInUser && headerAction) {
        // Parse the stored user data
        const user = JSON.parse(loggedInUser);
        
        // Replace the login link with an account icon
        headerAction.innerHTML = `<i class='bx bx-user' style="font-size: 24px;"></i>`;
        headerAction.removeAttribute('href');
        
        // When the account icon is clicked, toggle the sidebar
        headerAction.addEventListener('click', toggleSidebar);
    
        // Populate the sidebar with the user's info
        const userInfoDiv = document.getElementById('user-info');
        if (userInfoDiv) {
            userInfoDiv.innerHTML = `<p><strong>${user.name || 'User'}</strong></p>
                                    <p>${user.email}</p>`;
        }
    } else if (headerAction) {
        // If no user is logged in, ensure the header only shows "Login"
        headerAction.innerHTML = 'Login';
        headerAction.setAttribute('href', '/login/login-signup.html');
    }
  
    // Set up sidebar close button listener
    const closeSidebarBtn = document.getElementById('close-sidebar');
    if (closeSidebarBtn) {
        closeSidebarBtn.addEventListener('click', toggleSidebar);
    }
  
    // Set up log out button listener
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('loggedInUser');
            window.location.reload();
        });
    }
});

function toggleSidebar() {
const sidebar = document.getElementById('account-sidebar');
if (sidebar) {
    sidebar.classList.toggle('open');
}
}


// fetching listings for FEATURED from supabase
const SUPABASE_URL = "https://mtmrilvgybiwyjgqttqr.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10bXJpbHZneWJpd3lqZ3F0dHFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg4Mjg4OTEsImV4cCI6MjA1NDQwNDg5MX0.1nfCnZmh0jFR9xttubx5b8iaq7awEYPECXLZJNjpHPg";

// Initialize Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener("DOMContentLoaded", async function () {
    console.log("Supabase Initialized:", supabase);
    await loadFeaturedListings();
});

async function loadFeaturedListings() {
    const productContainer = document.querySelector(".grid");

    if (!productContainer) return;

    const categories = ["Shoes", "Clothing", "Watches", "Electronics"];

    let listings = [];

    for (let category of categories) {
        let { data, error } = await supabase
            .from("listings")
            .select("*")
            .eq("category", category)
            .limit(1);

        if (error) {
            console.error(`Error fetching ${category}:`, error);
            continue;
        }

        if (data.length > 0) {
            listings.push(data[0]); // Push first listing from the category
        }
    }

    productContainer.innerHTML = ""; // Clear existing listings

    listings.forEach(listing => {
        const listingHTML = `
            <div class="product-item">
                <div class="product-banner">
                    <a href="/product/product.html?id=${listing.id}" class="product-images">
                        <img src="${listing.image_url}" alt="${listing.title}" class="product-img default">
                    </a>
                </div>
                <div class="product-content">
                    <span class="product-category">${listing.category}</span>
                    <h3 class="product-title">${listing.title}</h3>
                    <div class="product-price flex">
                        <span class="new-price">$${listing.price}</span>
                    </div>
                </div>
            </div>
        `;

        productContainer.innerHTML += listingHTML;
    });
}
