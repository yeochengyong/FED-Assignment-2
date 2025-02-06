// carousel category swiper
document.addEventListener("DOMContentLoaded", function () {
    var swiperCategories = new Swiper(".categories-container", {
        slidesPerView: "auto", // Ensure slides retain their size
        spaceBetween: 10, // Reduce spacing without affecting border size
        centeredSlides: false, // Prevent excessive spacing
        loop: false, // Ensure natural positioning
        navigation: {
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev",
        },
        pagination: {
            el: ".swiper-pagination",
            clickable: false,
        },
        breakpoints: {
            768: {
                slidesPerView: "auto",
                spaceBetween: 10, // Less space between each item
            },
            1024: {
                slidesPerView: "auto",
                spaceBetween: 10, // Adjust spacing for medium screens
            },
            1440: {
                slidesPerView: 5, // Ensure exactly 5 items are visible
                spaceBetween: 10, // Keep spacing minimal
            }
        }
    });
});

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
