let connections = {}; // Keep track of connected ports
let socket;

function connectToChatServer() {
    socket = new WebSocket('ws://localhost:8080');

    socket.onopen = () => {
        console.log('Connected to chat server');
    };

    socket.onmessage = (event) => {
        // Relay messages from the server to all sidepanels
        for (const tabId in connections) {
            connections[tabId].postMessage({ type: 'newMessage', message: event.data });
        }
    };

    socket.onclose = () => {
        console.log('Disconnected from chat server');
        // Attempt to reconnect after a delay
        setTimeout(connectToChatServer, 5000);
    };

    socket.onerror = (error) => {
        console.error('WebSocket error:', error);
    };
}
connectToChatServer();

chrome.runtime.onConnect.addListener((port) => {
    if (port.name === 'sidepanel') {
        const extensionListener = (message, sender, sendResponse) => {
            // Handle messages from the sidepanel
            if (message.type === 'sendMessage') {
                // Send the message to the chat server
                if (socket && socket.readyState === WebSocket.OPEN) {
                    socket.send(message.message);
                } else {
                    console.warn("Not connected to chat server. Message not sent.");
                }
            }
        };

        // Listen for messages from the sidepanel
        port.onMessage.addListener(extensionListener);

        // Store the port for later use
        connections[port.sender.tab.id] = port;

        // Remove the port when the sidepanel disconnects
        port.onDisconnect.addListener(() => {
            delete connections[port.sender.tab.id];
        });
    }
});
