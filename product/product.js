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

function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  }
  
  document.addEventListener("DOMContentLoaded", () => {
    const chatButton = document.getElementById("chat-button");
    if (!chatButton) return;
  
    chatButton.addEventListener("click", async function () {
      // Get product ID from URL
      const productId = getQueryParam("id");
      if (!productId) {
        alert("Product not found.");
        return;
      }
  
      // Get product details from the page.
      const productTitleElem = document.getElementById("product-title");
      const productTitle = productTitleElem ? productTitleElem.innerText : "Product";
      const productPriceElem = document.getElementById("product-price");
      const productPrice = productPriceElem ? productPriceElem.innerText : "";
      const productImageElem = document.getElementById("main-product-image");
      const productImageURL = productImageElem ? productImageElem.src : "";
  
      // Get current logged-in user from localStorage.
      const storedUser = localStorage.getItem("loggedInUser");
      const currentUser = storedUser ? JSON.parse(storedUser) : null;
  
      // Generate a unique chat ID (for example: "chat-<productId>-<timestamp>")
      const newChatId = "chat-" + productId + "-" + Date.now();
  
      // Create an initial message with extra listing details.
      const initialMessage = {
        chat_id: newChatId,
        sender: currentUser ? currentUser.name : "Anonymous",
        content: "Hi, I have a question about " + productTitle,
        listing_title: productTitle,
        listing_price: productPrice,
        listing_image_url: productImageURL
      };
  
      // Insert the initial message into the "messages" table.
      const { data, error } = await supabase
        .from("messages")
        .insert([initialMessage]);
  
      if (error) {
        console.error("Error initiating chat:", error);
        alert("Error initiating chat.");
        return;
      }
  
      // Redirect to chats.html with the new chat id.
      window.location.href = "/chats.html?chatId=" + encodeURIComponent(newChatId);
    });
});

// Load the product details when the page loads
document.addEventListener("DOMContentLoaded", fetchProductDetails);
