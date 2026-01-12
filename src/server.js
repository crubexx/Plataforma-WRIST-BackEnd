import express from 'express';

const app = express();

app.get('/', (req, res) => {
  res.send('Produlab Backend is running');
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
