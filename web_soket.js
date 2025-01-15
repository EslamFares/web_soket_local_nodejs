const WebSocket = require('ws');

// Create a WebSocket server
const wss = new WebSocket.Server({ port: 8080 });

// List of messages to send every 7 seconds
const messages = [
    "Hello, this is message 1!",
    "How's it going? This is message 2.",
    "Did you know? This is message 3.",
    "Here's a fun fact! This is message 4.",
    "Thanks for staying connected! This is message 5."
];

// Store connected clients
const clients = new Set();

// Counter to track the current message
let messageIndex = 0;

// Function to get the current timestamp
function getCurrentTimestamp() {
    const now = new Date();
    return `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;
}

wss.on('connection', (ws) => {
    console.log('New client connected');
    clients.add(ws);

    // Handle incoming messages from the client
    ws.on('message', (message) => {
        const timestamp = getCurrentTimestamp();
        console.log(`Server received: ${message} at ${timestamp}`);
        // Send back the message with timestamp
        ws.send(`Server received: ${message} at ${timestamp}`);
    });

    // Handle client disconnection
    ws.on('close', () => {
        console.log('Client disconnected');
        clients.delete(ws);
    });
});

// Send a different message to all connected clients every 7 seconds
setInterval(() => {
    const message = messages[messageIndex];
    const timestamp = getCurrentTimestamp();
    console.log(`Server Sending: ${message} at ${timestamp}`);  // Log the message being sent

    // Send the message to all connected clients with timestamp
    clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(`Server Sending:${message} at ${timestamp}`);
        }
    });

    // Update the message index, loop back to the start if necessary
    messageIndex = (messageIndex + 1) % messages.length;
}, 3000);

console.log('WebSocket server is running on ws://localhost:8080');
