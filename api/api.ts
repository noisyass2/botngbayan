import express, { Express, Request, Response } from 'express';
import { reconnect } from "../src/index";
const router = express.Router()

// define the home page route
router.get('/', (req, res) => {
  res.send('API home page')
})
// define the about route
router.get('/about', (req, res) => {
  res.send('About ')
})

router.get('/reconnect', async (req,res) => {
  await reconnect();
  res.send('reconnected');
})

module.exports = router