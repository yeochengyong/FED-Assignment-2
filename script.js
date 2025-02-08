const SUPABASE_URL = 'https://mtmrilvgybiwyjgqttqr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10bXJpbHZneWJpd3lqZ3F0dHFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg4Mjg4OTEsImV4cCI6MjA1NDQwNDg5MX0.1nfCnZmh0jFR9xttubx5b8iaq7awEYPECXLZJNjpHPg';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener("DOMContentLoaded", function() {
    // Get references to the search input and the search icon
    const searchInput = document.querySelector(".header-search .form-input");
    const searchIcon = document.querySelector(".header-search i");
  
    // When the user presses Enter in the search input, perform the search
    searchInput.addEventListener("keypress", async function(e) {
      if (e.key === "Enter") {
        e.preventDefault();
        await performSearch(searchInput.value.trim());
      }
    });
  
    // When the search icon is clicked, perform the search
    searchIcon.addEventListener("click", async function() {
      await performSearch(searchInput.value.trim());
    });
  });
  
  async function performSearch(query) {
    if (!query) return; // If no query, do nothing
  
    // Query the "listings" table for a title that matches the query (case-insensitive)
    const { data, error } = await supabaseClient
      .from("listings")
      .select("*")
      .ilike("title", `%${query}%`)
      .limit(1); // Limit to one result
  
    if (error) {
      console.error("Error searching listings:", error);
      alert("Error searching for product.");
      return;
    }
  
    if (data && data.length > 0) {
      // Redirect to the product detail page for the first matching listing.
      window.location.href = `/product/product.html?id=${data[0].id}`;
    } else {
      alert("No matching product found.");
    }
}

// Debounce function to limit how frequently the search query is sent
function debounce(func, delay) {
    let timeout;
    return function(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), delay);
    }
}
  
  async function fetchSuggestions(query) {
    if (!query) {
      suggestionsContainer.innerHTML = "";
      suggestionsContainer.style.display = "none";
      return;
    }
    // Query the listings table for matching titles (case-insensitive)
    const { data, error } = await supabaseClient
      .from("listings")
      .select("id, title")
      .ilike("title", `%${query}%`)
      .limit(5);
    if (error) {
      console.error("Error fetching suggestions:", error);
      return;
    }
    suggestionsContainer.innerHTML = "";
    if (data && data.length > 0) {
      data.forEach(item => {
        const suggestionItem = document.createElement("div");
        suggestionItem.classList.add("suggestion-item");
        suggestionItem.textContent = item.title;
        suggestionItem.addEventListener("click", function() {
          // Redirect to the product detail page when a suggestion is clicked
          window.location.href = `/product/product.html?id=${item.id}`;
        });
        suggestionsContainer.appendChild(suggestionItem);
      });
      suggestionsContainer.style.display = "block";
    } else {
      suggestionsContainer.style.display = "none";
    }
}
  
  const debouncedFetchSuggestions = debounce(fetchSuggestions, 300);
  
  // Get references to the search input, icon, and suggestions container
  document.addEventListener("DOMContentLoaded", function() {
    const searchInput = document.getElementById("search-input");
    const searchIcon = document.getElementById("search-icon");
    window.suggestionsContainer = document.getElementById("search-suggestions");
    
    // When the user types, fetch suggestions
    searchInput.addEventListener("input", function() {
      const query = searchInput.value.trim();
      debouncedFetchSuggestions(query);
    });
    
    searchIcon.addEventListener("click", function() {
      // hide suggestions if visible.
      suggestionsContainer.innerHTML = "";
      suggestionsContainer.style.display = "none";
    });
});