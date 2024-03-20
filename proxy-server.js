const { createProxyMiddleware } = require('http-proxy-middleware');

const express = require('express');
const app = express();

const PORT = 3000; // Choose any available port

// Define the proxy middleware for the token endpoint
const tokenProxy = createProxyMiddleware('/oauth/token', {
    target: 'https://app.assignr.com',
    changeOrigin: true,
    pathRewrite: {
        '^/oauth/token': '/oauth/token'
    },
    onProxyRes: function(proxyRes, req, res) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    }
});

// Define the proxy middleware for the games endpoint
const gamesProxy = createProxyMiddleware('/api/v2/sites/18601/games', {
    target: 'https://api.assignr.com',
    changeOrigin: true,
    pathRewrite: {
        '^/api/v2/sites/18601/games': '/api/v2/sites/18601/games'
    },
    onProxyRes: function(proxyRes, req, res) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    }
});

// Use the proxy middleware
app.use(tokenProxy);
app.use(gamesProxy);

// Allow OPTIONS requests for both endpoints
app.options('*', (req, res) => {
    res.sendStatus(200);
});

// Start the server
app.listen(PORT, () => {
    console.log(`Proxy server is running on port ${PORT}`);
});

