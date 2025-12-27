import dotenv from 'dotenv';

import app from './app';

dotenv.config();

const port = process.env.PORT;

if (!process.env.JWT_SECRET || !process.env.MONGO_URI || !port) {
  throw new Error('Environment variables are not defined.');
}

app.listen(port, () => {
  console.log(`Listening on port ${port}.`);
});
