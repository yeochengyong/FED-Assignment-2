// Supabase Setup
const SUPABASE_URL = "https://mtmrilvgybiwyjgqttqr.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10bXJpbHZneWJpd3lqZ3F0dHFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg4Mjg4OTEsImV4cCI6MjA1NDQwNDg5MX0.1nfCnZmh0jFR9xttubx5b8iaq7awEYPECXLZJNjpHPg";
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);


// Function to get query parameter from URL
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// Fetch product details
async function fetchProductDetails() {
    const productId = getQueryParam("id"); // Get product ID from URL

    if (!productId) {
        document.getElementById("product-title").innerText = "Product Not Found";
        return;
    }

    // Query Supabase to get product details
    let { data: product, error } = await supabase
        .from("listings") // Change this if your table name is different
        .select("*")
        .eq("id", productId)
        .single();

    if (error || !product) {
        console.error("Error fetching product:", error);
        document.getElementById("product-title").innerText = "Product Not Found";
        return;
    }

    // Update the page with product data
    document.getElementById("product-title").innerText = product.title;  // Ensure correct field name
    document.getElementById("product-description").innerText = product.description || "No description available";
    document.getElementById("product-category").innerText = product.category;
    document.getElementById("product-price").innerText = `$${product.price}`;

    // Set main product image
    document.getElementById("main-product-image").src = product.image_url;

    // Display extra images if available
    const extraImagesContainer = document.getElementById("extra-images");
    extraImagesContainer.innerHTML = ""; // Clear existing images first
    if (product.extra_images && product.extra_images.length > 0) {
        product.extra_images.forEach(imgUrl => {
            let imgElement = document.createElement("img");
            imgElement.src = imgUrl;
            imgElement.classList.add("extra-product-image");
            extraImagesContainer.appendChild(imgElement);
        });
    }
}

// Load the product details when the page loads
document.addEventListener("DOMContentLoaded", fetchProductDetails);