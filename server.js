const express = require('express');
const axios = require('axios');
const querystring = require('querystring');
const mongoose = require('mongoose');
const path = require('path');
const crypto = require('crypto');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

const zoomClientID = process.env.ZOOM_CLIENT_ID;
const zoomClientSecret = process.env.ZOOM_CLIENT_SECRET;
const redirectURI = 'http://localhost:3000/zoom/callback';

// Middleware
app.use(express.json()); // Body parser middleware
app.use(express.urlencoded({ extended: true })); // Middleware to parse URL-encoded data

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Utility function to generate Zoom signature
const generateSignature = (apiKey, apiSecret, meetingNumber, role) => {
    const timestamp = new Date().getTime() - 30000;
    const msg = Buffer.from(apiKey + meetingNumber + timestamp + role).toString('base64');
    const hash = crypto.createHmac('sha256', apiSecret).update(msg).digest('base64');
    const signature = Buffer.from(`${apiKey}.${meetingNumber}.${timestamp}.${role}.${hash}`).toString('base64');
    return signature;
};

// Route to start OAuth2 process
app.get('/zoom/auth', (req, res) => {
    const zoomAuthURL = `https://zoom.us/oauth/authorize?client_id=44AG2hvTmewLas86Qb0A&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fuserpage.html`;
    res.redirect(zoomAuthURL);
});

// Callback route
app.get('/zoom/callback', async (req, res) => {
    const code = req.query.code;
    try {
        const response = await axios.post('https://zoom.us/oauth/token', querystring.stringify({
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: redirectURI
        }), {
            headers: {
                'Authorization': `Basic ${Buffer.from(`${zoomClientID}:${zoomClientSecret}`).toString('base64')}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        const accessToken = response.data.access_token;
        res.redirect(`/zoom/success?token=${accessToken}`);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Route for successful Zoom authentication
app.get('/zoom/success', (req, res) => {
    const token = req.query.token;
    res.send(`Zoom authentication successful. Access token: ${token}`);
});

// Route to generate Zoom meeting signature
app.get('/zoom/generateSignature', (req, res) => {
    const apiKey = process.env.ZOOM_API_KEY;
    const apiSecret = process.env.ZOOM_API_SECRET;
    const { meetingNumber, role } = req.query;

    if (!meetingNumber || !role) {
        return res.status(400).json({ message: "Meeting number and role are required" });
    }

    try {
        const signature = generateSignature(apiKey, apiSecret, meetingNumber, role);
        res.json({ signature });
    } catch (error) {
        res.status(500).json({ message: "Error generating signature", error });
    }
});

// Routes for user management
app.use('/api/users', require('./routes/users'));

// Real-time chat with Socket.IO
io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });

    socket.on('chat message', (message) => {
        io.emit('chat message', { message, sent: false }); // Broadcast message to all connected clients
    });
});

// MongoDB Connection
mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Start server
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
