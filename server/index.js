require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { clerkMiddleware } = require('@clerk/express');

const identifyRouter = require('./routes/identify');
const historyRouter = require('./routes/history');
const streamRouter = require('./routes/stream');

const app = express();

app.use(clerkMiddleware());
app.use(cors());
app.use(express.json());

app.use('/api/identify', identifyRouter);
app.use('/api/history', historyRouter);
app.use('/api/stream', streamRouter);

if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../client/dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
