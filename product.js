document.addEventListener("DOMContentLoaded", function() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get("id");

    if (!productId) {
        document.body.innerHTML = "<h2>Product not found</h2>";
        return;
    }

    // Fetch product details from API
    fetch(`https://api.example.com/products/${productId}`) // Replace with actual API URL
        .then(response => response.json())
        .then(product => {
            document.getElementById("productTitle").textContent = product.title;
            document.getElementById("productDescription").textContent = product.description;
            document.getElementById("productPrice").textContent = `$${product.price}`;
            document.getElementById("mainImage").src = product.images[0];

            // Load thumbnails
            const thumbnailsContainer = document.getElementById("thumbnails");
            product.images.forEach(img => {
                const thumb = document.createElement("img");
                thumb.src = img;
                thumb.onclick = () => document.getElementById("mainImage").src = img;
                thumbnailsContainer.appendChild(thumb);
            });
        })
        .catch(error => {
            console.error("Error fetching product:", error);
            document.body.innerHTML = "<h2>Error loading product details</h2>";
        });
});
