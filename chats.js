const SUPABASE_URL = 'https://mtmrilvgybiwyjgqttqr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10bXJpbHZneWJpd3lqZ3F0dHFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg4Mjg4OTEsImV4cCI6MjA1NDQwNDg5MX0.1nfCnZmh0jFR9xttubx5b8iaq7awEYPECXLZJNjpHPg';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Global variables
let currentChatId = null; // The chat that is currently open
let messageSubscription = null;
let currentUser = null;


//Append a message to the chat messages container.

function appendMessage(message) {
    const chatMessagesContainer = document.querySelector('.chat-messages');
    const messageElem = document.createElement('div'); // container for a message
    messageElem.classList.add('message');
  
    // Use the logged-in user's name to determine message alignment and style.
    if (currentUser && message.sender === currentUser.name) {
      messageElem.classList.add('my-message'); // Style for messages from you
    } else {
      messageElem.classList.add('other-message'); // Style for messages from others
    }
  
    // Create a sender element
    const senderElem = document.createElement('div');
    senderElem.classList.add('sender');
    senderElem.textContent = message.sender;
  
    // Create a content element for the message text
    const contentElem = document.createElement('div');
    contentElem.classList.add('content');
    contentElem.textContent = message.content;
  
    // Append sender and content to the message container
    messageElem.appendChild(senderElem);
    messageElem.appendChild(contentElem);
  
    // Append the styled message container to the chat messages container
    chatMessagesContainer.appendChild(messageElem);
  
    // Automatically scroll to the bottom
    chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
}

//Load all messages for a given chat/conversation.
async function loadMessages(chatId) {
  const { data, error } = await supabaseClient
    .from('messages')
    .select('*')
    .eq('chat_id', chatId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error loading messages:', error);
    return;
  }

  // Clear the container and render each message
  const chatMessagesContainer = document.querySelector('.chat-messages');
  chatMessagesContainer.innerHTML = '';
  data.forEach(message => appendMessage(message));
}

//Subscribe to realtime message updates for the active chat.

function subscribeToMessages(chatId) {
  // If there's an existing subscription, unsubscribe first.
  if (messageSubscription) {
    messageSubscription.unsubscribe();
    messageSubscription = null;
  }

  // Create a new channel for this chat.
  messageSubscription = supabaseClient.channel('realtime-messages-' + chatId);

  // Listen for new INSERT events on the "messages" table for the specified chat_id.
  messageSubscription.on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `chat_id=eq.${chatId}`
    },
    (payload) => {
      appendMessage(payload.new);
    }
  ).subscribe();
}

//Set up event listeners for each chat listing.
function setupChatListings() {
    const chatListings = document.querySelectorAll('.chat-listing');
  
    chatListings.forEach((listing, index) => {
        // Ensure each listing has a unique data-chat-id.
        if (!listing.dataset.chatId) {
            listing.dataset.chatId = 'chat_' + index;
        }
  
      listing.addEventListener('click', async () => {
            // Mark the clicked listing as active.
            document.querySelectorAll('.chat-listing').forEach(item =>
            item.classList.remove('active')
            );
            listing.classList.add('active');
    
            const chatId = listing.dataset.chatId;
            currentChatId = chatId;
    
            // --- Update Chat Header (Seller Info) ---
            // Use the first image as the seller's image.
            const sellerImgSrc = listing.querySelector('img').src;
    
            // Get the combined price and seller info text.
            const priceElement = listing.querySelector('.chat-details .price');
            let sellerName = 'Seller';
            let productPrice = '';
            if (priceElement) {
            const priceText = priceElement.textContent;
            // Expecting format like "$50 - john_doe"
            if (priceText.indexOf(' - ') !== -1) {
                const parts = priceText.split(' - ');
                productPrice = parts[0].trim();
                sellerName = parts[1].trim();
            }
            }
    
            // Update chat header with the seller's info.
            document.querySelector('.chat-header .user-info img').src = sellerImgSrc;
            document.querySelector('.chat-header .user-info span').textContent = sellerName;
    
            // --- Update Listing Info (Product Info) ---
            // Assume the first span in .chat-details holds the product name.
            const detailsSpans = listing.querySelectorAll('.chat-details span');
            let productName = 'Product';
            if (detailsSpans.length > 0) {
            productName = detailsSpans[0].textContent.trim();
            }
    
            // For product image, use the image with class "listing-img" if available.
            const listingImgElem = listing.querySelector('.listing-img');
            const productImgSrc = listingImgElem ? listingImgElem.src : sellerImgSrc;
    
            // Update the listing info in the chat-box.
            document.querySelector('.listing-details img').src = productImgSrc;
            // Display product name and price (if available).
            document.querySelector('.listing-title').textContent = productName + (productPrice ? ' - ' + productPrice : '');
    
            // --- Load Chat Messages & Setup Realtime Subscription ---
            await loadMessages(chatId);
            subscribeToMessages(chatId);
        });
    });
}

//Handler for sending a message.

async function sendMessage() {
    const input = document.getElementById('message-input');
    const messageText = input.value.trim();
    if (!messageText || !currentChatId) return;
  
    // Use the logged-in user's email as the sender (or default to "Anonymous")
    const sender = currentUser ? currentUser.name : 'Anonymous';

    const messagePayload = {
      chat_id: currentChatId,
      sender: sender,
      content: messageText,
    };
  
    const { error } = await supabaseClient
      .from('messages')
      .insert([messagePayload]);
  
    if (error) {
      console.error('Error sending message:', error);
    }
    input.value = ''; // Clear the input field
  }

//Retrieve the logged-in user info from localStorage.
function getLoggedInUser() {
  const storedUser = localStorage.getItem('loggedInUser');
  return storedUser ? JSON.parse(storedUser) : null;
}

function setDefaultChatInfo() {
    // Set default seller info (chat header)
    const defaultSellerImg = '/images/default-seller.png';
    const defaultSellerName = 'Select a Chat';
  
    document.querySelector('.chat-header .user-info img').src = defaultSellerImg;
    document.querySelector('.chat-header .user-info span').textContent = defaultSellerName;
    
    // Set default listing info (listing details)
    const defaultProductImg = '/images/default-product.png';
    const defaultListingTitle = 'No Listing Selected';
  
    document.querySelector('.listing-details img').src = defaultProductImg;
    document.querySelector('.listing-title').textContent = defaultListingTitle;
}

async function init() {
    // Retrieve current user (from localStorage or Supabase)
    const storedUser = localStorage.getItem('loggedInUser');
    if (storedUser) {
      currentUser = JSON.parse(storedUser);
    } else {
      const { data: { user } } = await supabaseClient.auth.getUser();
      currentUser = user;
    }
  
    // Set default chat info before any listing is selected.
    setDefaultChatInfo();
  
    // Setup chat listings event listeners.
    setupChatListings();
}

// Chat event listeners
document.getElementById('send-message').addEventListener('click', sendMessage);
document.getElementById('message-input').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    sendMessage();
  }
});

// Start the app once the DOM is fully loaded.
document.addEventListener('DOMContentLoaded', init);
