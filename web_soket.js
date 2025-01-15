const WebSocket = require('ws');
const faker = require('faker'); // Import faker

// Create a WebSocket server
const wss = new WebSocket.Server({ port: 8080 });

// Store connected clients
const clients = new Set();

// Function to get the current timestamp
function getCurrentTimestamp() {
    const now = new Date();
    return `${now.toLocaleTimeString()}`;
}

function getCurrentDatestamp() {
    const now = new Date();
    return `${now.toLocaleDateString()}`;
}

// Function to generate a random message using faker
function generateRandomMessage() {
    // return `${faker.name.findName()} says: "${faker.lorem.sentence()}"`;
    return `${faker.lorem.sentence()}`;
}

wss.on('connection', (ws) => {
    console.log('New client connected');
    clients.add(ws);

    // Handle incoming messages from the client
    ws.on('message', (message) => {
        const timestamp = getCurrentTimestamp();
        const datestamp = getCurrentDatestamp();
        console.log(`Server received: ${message} at Timestamp ${datestamp} ${timestamp}`);
        const messageString = message instanceof Buffer ? message.toString() : message;

        // Send back the message with timestamp (serialize as JSON)
        const response = {
            sender: "User",
            type: "receive",
            msg: messageString,
            time: timestamp,
            date: datestamp
        };
        ws.send(JSON.stringify(response));  // Convert to JSON string
    });

    // Handle client disconnection
    ws.on('close', () => {
        console.log('Client disconnected');
        clients.delete(ws);
    });
});

// Send a randomly generated message to all connected clients every 7 seconds
setInterval(() => {
    const message = generateRandomMessage();  // Generate a random message using faker
    const timestamp = getCurrentTimestamp();
    const datestamp = getCurrentDatestamp();

    console.log(`Server Sending: ${message} at Timestamp ${datestamp} ${timestamp}`);  // Log the message being sent

    // Send the message to all connected clients with timestamp (serialize as JSON)
    clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            const response = {
                sender: "Server",
                type: "send",
                msg: message,
                time: timestamp,
                date: datestamp
            };
            client.send(JSON.stringify(response));  // Convert to JSON string
        }
    });
}, 7000);

console.log('WebSocket server is running on ws://localhost:8080');
