document.addEventListener("DOMContentLoaded", () => {
    const messageInput = document.getElementById("message-input");
    const sendMessageBtn = document.getElementById("send-message");
    const chatMessages = document.getElementById("chat-messages");
    let activeListing = null; // Tracks the selected listing

    sendMessageBtn.addEventListener("click", () => {
        if (messageInput.value.trim() !== "") {
            const message = messageInput.value;

            // Create a new message element
            const messageEl = document.createElement("p");
            messageEl.textContent = `You: ${message}`;
            chatMessages.appendChild(messageEl);

            // Scroll to the latest message
            chatMessages.scrollTop = chatMessages.scrollHeight;

            // Clear the input field
            messageInput.value = "";
        }
    });

    // Function to select a listing and update the chat
    document.querySelectorAll('.chat-listing').forEach(listing => {
        listing.addEventListener("click", () => {
            selectListing(listing);
        });
    });

    function selectListing(selected) {
        if (activeListing === selected) return; // Prevents reloading if already active

        // Remove 'active' class from all listings
        document.querySelectorAll('.chat-listing').forEach(listing => {
            listing.classList.remove('active');
        });

        // Add 'active' class to the clicked listing
        selected.classList.add('active');
        activeListing = selected;

        // Extract listing details
        const userName = selected.querySelector('.chat-details span').textContent;
        const listingTitle = selected.querySelector('.chat-details span:first-child').textContent;
        const listingImgSrc = selected.querySelector('.listing-img').src;

        // Update chat with selected listing details
        document.getElementById('user-name').textContent = userName;
        document.getElementById('listing-title').textContent = listingTitle;
        document.getElementById('listing-image').src = listingImgSrc;

        // Clear previous messages when switching chats
        chatMessages.innerHTML = `<p>Chat started with <strong>${userName}</strong></p>`;
    }
});
