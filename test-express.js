import express from 'express';
const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('Hello from Express!');
});

app.listen(port, '127.0.0.1', () => {
  console.log(`Express server listening at http://127.0.0.1:${port}`);
});