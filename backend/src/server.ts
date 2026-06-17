import app from './app.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(`  FIFA World Cup 2026 Sweepstakes Server Running   `);
  console.log(`  Local URL: http://localhost:${PORT}             `);
  console.log(`===================================================`);
});
