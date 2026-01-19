import 'dotenv/config';
import app from './app.js';

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`WRIST Backend Server running on port ${PORT}`);
});
