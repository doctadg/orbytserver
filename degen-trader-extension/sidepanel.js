let port = chrome.runtime.connect({ name: 'sidepanel' });

// Load username and profile picture from storage
chrome.storage.local.get(['username', 'profilePicture'], (result) => {
  if (result.username) {
    document.getElementById('username').textContent = result.username;
  }
  if (result.profilePicture) {
    document.getElementById('profile-picture').src = result.profilePicture;
  }
});

document.getElementById('sendButton').addEventListener('click', () => {
  const message = document.getElementById('messageInput').value;
  // Send message to background script
  port.postMessage({type: 'sendMessage', message: message});
  document.getElementById('messageInput').value = ''; // Clear input
});

document.getElementById('scrapeButton').addEventListener('click', () => {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.scripting.executeScript({
            target: {tabId: tabs[0].id},
            function: scrapeDataFromPage,
        }, (results) => {
            if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError);
                return;
            }
            if (results && results[0] && results[0].result) {
                displayScrapedData(results[0].result);
            }

        });
    });
});

function displayScrapedData(data) {
    const container = document.getElementById('scrapedData');
    container.innerHTML = ''; //clear previous data

    if (typeof data === 'object') {
        for (const key in data) {
            const p = document.createElement('p');
            p.textContent = `${key}: ${data[key]}`;
            container.appendChild(p);
        }
    } else {
        const p = document.createElement('p');
        p.textContent = data;
        container.appendChild(p);
    }
}

// Placeholder function - actual implementation in content.js
function scrapeDataFromPage() {
  // This function will be injected into the active tab
}

// Listen for messages from the background script (for chat)
port.onMessage.addListener((message) => {
  if (message.type === 'newMessage') {
    const messageElement = document.createElement('p');
    const date = new Date(message.message.timestamp);
    messageElement.textContent = `[${date.toLocaleTimeString()}] ${message.message.text}`;
    document.getElementById('messages').appendChild(messageElement);
  }
});


document.getElementById('account-info').addEventListener('click', () => {
  const newUsername = prompt('Enter new username:');
  if (newUsername) {
    document.getElementById('username').textContent = newUsername;
    // Save username to storage
    chrome.storage.local.set({ username: newUsername });
  }

  const newProfilePicture = prompt('Enter new profile picture URL:');
  if (newProfilePicture) {
    document.getElementById('profile-picture').src = newProfilePicture;
    // Save profile picture URL to storage
    chrome.storage.local.set({ profilePicture: newProfilePicture });
  }
});
