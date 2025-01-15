const WebSocket = require('ws');
const faker = require('faker'); // Import faker

// Create a WebSocket server
const wss = new WebSocket.Server({
    host: '192.168.2.1', // Use your local network IP or localhost if running locally
    port: 8080
});

// Store connected clients
const clients = new Set();

// To store user names for clients
let userCount = 0; // Variable to keep track of the user number

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
    return `${faker.lorem.sentence()}`;
}

wss.on('connection', (ws) => {
    console.log('New client connected');
    userCount += 1; // Increment user count each time a new user connects
    const userName = `User${userCount}`; // Assign a unique name like User1, User2, etc.
    ws.userName = userName; // Store the userName in the WebSocket object

    clients.add(ws);

    // Handle incoming messages from the client
    ws.on('message', (message) => {
        const timestamp = getCurrentTimestamp();
        const datestamp = getCurrentDatestamp();
        console.log(`Server received: ${message} at Timestamp ${datestamp} ${timestamp}`);
        const messageString = message instanceof Buffer ? message.toString() : message;

        // Create a response object to send back to all clients
        const response = {
            sender: ws.userName, // Sender is the unique user name assigned to each client
            type: "receive",
            msg: messageString,
            time: timestamp,
            date: datestamp,
            usename: ""
        };
        //send only for one client
        // ws.send(JSON.stringify(response));  // Convert to JSON string

        // Broadcast the received message to all connected clients
        clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                //ws.userName
                response.usename = client.userName, // Add recipient's user name
                    client.send(JSON.stringify(response)); // Send the message in JSON format
            }
        });
    });

    // Handle client disconnection
    ws.on('close', () => {
        console.log(`${ws.userName} disconnected`);
        clients.delete(ws);
    });
});

// Send a randomly generated message to all connected clients every 7 seconds
setInterval(() => {
    const message = generateRandomMessage(); // Generate a random message using faker
    const timestamp = getCurrentTimestamp();
    const datestamp = getCurrentDatestamp();

    console.log(`Server Sending: ${message} at Timestamp ${datestamp} ${timestamp}`);  // Log the message being sent

    // Send the message to all connected clients with timestamp (serialize as JSON)
    clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            const response = {
                sender: "Server",  // Sender is always "Server" for random messages
                type: "send",
                msg: message,
                time: timestamp,
                date: datestamp,
                usename: "Server"
            };
            client.send(JSON.stringify(response)); // Send to each client
        }
    });
}, 7000);

console.log(`WebSocket server is running on ws://localhost:8080`);
