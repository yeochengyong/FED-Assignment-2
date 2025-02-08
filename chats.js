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
  const messageElem = document.createElement('div');
  messageElem.classList.add('message');

  // Style the message based on whether it was sent by the current user.
  if (currentUser && message.sender === currentUser.name) {
    messageElem.classList.add('my-message');
  } else {
    messageElem.classList.add('other-message');
  }

  const senderElem = document.createElement('div');
  senderElem.classList.add('sender');
  senderElem.textContent = message.sender;

  const contentElem = document.createElement('div');
  contentElem.classList.add('content');
  contentElem.textContent = message.content;

  messageElem.appendChild(senderElem);
  messageElem.appendChild(contentElem);
  chatMessagesContainer.appendChild(messageElem);
  chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
}

// Load all messages for a given chat conversation.
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
  const chatMessagesContainer = document.querySelector('.chat-messages');
  chatMessagesContainer.innerHTML = '';
  data.forEach(message => appendMessage(message));
}

// Subscribe to realtime updates for a given chat.
function subscribeToMessages(chatId) {
  if (messageSubscription) {
    messageSubscription.unsubscribe();
    messageSubscription = null;
  }
  messageSubscription = supabaseClient.channel('realtime-messages-' + chatId);
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

// Retrieve the logged-in user info from localStorage.
function getLoggedInUser() {
  const storedUser = localStorage.getItem('loggedInUser');
  return storedUser ? JSON.parse(storedUser) : null;
}

// Set default chat header and listing info (before a chat is selected).
function setDefaultChatInfo() {
  const defaultSellerImg = '/images/default-seller.png';
  const defaultSellerName = 'Select a Chat';
  document.querySelector('.chat-header .user-info img').src = defaultSellerImg;
  document.querySelector('.chat-header .user-info span').textContent = defaultSellerName;

  const defaultProductImg = '/images/default-product.png';
  const defaultListingTitle = 'No Listing Selected';
  document.querySelector('.listing-details img').src = defaultProductImg;
  document.querySelector('.listing-title').textContent = defaultListingTitle;
}

// ------------------------------
// Dynamic Chat Listings Functions
// ------------------------------

// Fetch dynamic chat listings for the current user.
// Here we query the messages table for messages sent by the current user and deduplicate by chat_id.
async function fetchChatListings() {
  if (!currentUser) return [];
  const { data, error } = await supabaseClient
    .from('messages')
    .select('*')
    .eq('sender', currentUser.name);
  if (error) {
    console.error("Error fetching chat listings:", error);
    return [];
  }
  // Deduplicate by chat_id: keep the latest message for each chat.
  const chatMap = {};
  data.forEach(msg => {
    if (!chatMap[msg.chat_id] || new Date(msg.created_at) > new Date(chatMap[msg.chat_id].created_at)) {
      chatMap[msg.chat_id] = msg;
    }
  });
  return Object.values(chatMap);
}

// Display dynamic chat listings in the inbox.
function displayChatListings(chats) {
  const chatListingsContainer = document.getElementById('chat-listings');
  chatListingsContainer.innerHTML = "";
  if (!chats || chats.length === 0) {
     chatListingsContainer.innerHTML = "";
     return;
  }
  chats.forEach(chat => {
    const listingElem = document.createElement("div");
    listingElem.classList.add("chat-listing");
    listingElem.dataset.chatId = chat.chat_id;
    listingElem.innerHTML = `
      <img src="${chat.listing_image_url || '/images/default-seller.png'}" alt="Listing" />
      <div class="chat-details">
        <span>${chat.listing_title || 'Product'}</span>
        <span class="price">${chat.listing_price ? '$' + chat.listing_price : ''} - ${chat.sender}</span>
      </div>
    `;
    // When a chat listing is clicked, update the chat box.
    listingElem.addEventListener("click", async () => {
      document.querySelectorAll('.chat-listing').forEach(item => item.classList.remove('active'));
      listingElem.classList.add("active");
      currentChatId = chat.chat_id;

      // Update chat header with dynamic info.
      const headerImgSrc = chat.listing_image_url || '/images/default-seller.png';
      document.querySelector('.chat-header .user-info img').src = headerImgSrc;
      document.querySelector('.chat-header .user-info span').textContent = chat.sender;

      // Update listing info.
      const listingImgSrc = chat.listing_image_url || '/images/default-product.png';
      document.querySelector('.listing-details img').src = listingImgSrc;
      const titleText = chat.listing_title || 'Product';
      const priceText = chat.listing_price ? ' - $' + chat.listing_price : '';
      document.querySelector('.listing-title').textContent = titleText + priceText;

      // Load messages for the selected chat and subscribe to realtime updates.
      await loadMessages(chat.chat_id);
      subscribeToMessages(chat.chat_id);
    });
    chatListingsContainer.appendChild(listingElem);
  });
}

// Message Sending
async function sendMessage() {
  const input = document.getElementById('message-input');
  const messageText = input.value.trim();
  if (!messageText || !currentChatId) return;
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
  input.value = '';
}

document.getElementById('send-message').addEventListener('click', sendMessage);
document.getElementById('message-input').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    sendMessage();
  }
});

// Initialization
async function init() {
  // Get current logged-in user
  currentUser = getLoggedInUser();
  setDefaultChatInfo();

  // Always fetch and display chat listings in the sidebar.
  const chats = await fetchChatListings();
  displayChatListings(chats);

  // Get chat ID from URL (if any)
  const urlParams = new URLSearchParams(window.location.search);
  const chatIdParam = urlParams.get("chatId");

  if (chatIdParam) {
    currentChatId = chatIdParam;
    
    // Load messages and subscribe for the preselected chat.
    await loadMessages(chatIdParam);
    subscribeToMessages(chatIdParam);

    // Fetch chat info from one message (to update the chat header/listing info)
    const { data: chatInfo, error } = await supabaseClient
      .from("messages")
      .select("*")
      .eq("chat_id", chatIdParam)
      .order("created_at", { ascending: true })
      .limit(1)
      .single();

    if (error) {
      console.error("Error fetching chat info:", error);
    } else {
      // Update chat header with dynamic info.
      document.querySelector('.chat-header .user-info img').src =
        chatInfo.listing_image_url || '/images/default-seller.png';
      document.querySelector('.chat-header .user-info span').textContent =
        chatInfo.sender;

      // Update listing info.
      document.querySelector('.listing-details img').src =
        chatInfo.listing_image_url || '/images/default-product.png';
      document.querySelector('.listing-title').textContent =
        chatInfo.listing_title + (chatInfo.listing_price ? " - $" + chatInfo.listing_price : "");
    }

    // Highlight the current chat in the inbox (if it exists)
    const activeListing = document.querySelector(`.chat-listing[data-chat-id="${chatIdParam}"]`);
    if (activeListing) {
      activeListing.classList.add("active");
    }
  }
}

document.addEventListener('DOMContentLoaded', init);
