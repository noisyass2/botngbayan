import express, { Express, Request, Response } from 'express';
import { reconnect, say } from "../src/index";
import { soList, soReset, soResetAll } from '../src/sohandler';
import { getDebug, getLogs, setDebug } from '../src/utils';
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

router.get('/soreset/:channel',(req, res) => {
  soReset(req.params.channel)
  res.send('Channel SO List Reset! ')
})

router.get('/soreset/all',(req, res) => {
  soResetAll()
  res.send('All Channel SO List Reset! ')
})

router.get('/solist/:channel',(req, res) => {
  
  res.send(soList(req.params.channel))
})

// router.get('/subs/:channel',(req,res) => {
//   getSubs(req.params.channel);

//   res.send("done");
// })

// router.get('/user/:userid/follows/:channel', (req,res) => {
//   getUserFollowsChannel(req.params.userid, req.params.channel);

//   res.send("done");
// })

router.get('/say/:channel/:msg', (req,res) => {
  let {channel, msg} = req.params;
  say(channel,msg);

  res.send("Sent");
})

router.get('/logs', async (req,res) => {
  let logs = await getLogs()
  res.json(logs);
})

router.get('/debug/:flag', (req,res) => {
  let {flag} = req.params;

  setDebug(flag);

  res.send("" + getDebug());
})

module.exports = router