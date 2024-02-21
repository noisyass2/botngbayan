import { RefreshingAuthProvider } from '@twurple/auth';
import { ChatClient } from '@twurple/chat';
import { promises as fs, rmSync } from 'fs';
import { SOInit, handleSOMessage, SOReinit } from "./sohandler";
import { init as CCInit, handleMessage as handleCustomMessage } from "./customCommandHandler";
import { init as ADInit,handleMessage as handleAdminMessage } from "./adminCommandHandler";
import { init as BCInit,handleMessage as handleBOTMessage } from "./botCommandHandler";

import * as dotenv from 'dotenv';
import express, { Express, Request, Response } from 'express';
const app: Express = express();
import { setupAPI } from "../api/index";
import * as fetch from "node-fetch";
import { log, removeBans } from './utils';

let chatClient: ChatClient;

async function main() {
	// let auth = JSON.parse(await fs.readFile('./auth.js', 'utf-8'));
	dotenv.config();
	setupAPI();

	let auth: IAuth = {
		clientID: process.env.CLIENT_ID ?? "",
		clientSecret: process.env.CLIENT_SECRET ?? "",
		accessToken: process.env.ACCESS_TOKEN ?? "",
		refreshToken: process.env.REFRESH_TOKEN ?? ""
	}

	// console.log(auth);
	// console.log(process.env)

	// let settings = JSON.parse(await fs.readFile('./settings.json', 'utf-8'));
	const clientId = auth.clientID;
	const clientSecret = auth.clientSecret;
	const accessToken = auth.accessToken;
	const refreshToken = auth.refreshToken;
	const tokenData = JSON.parse(await fs.readFile('./tokens.json', 'utf-8'));
	const authProvider = new RefreshingAuthProvider(
		{
			clientId,
			clientSecret
		}
	);
	authProvider.onRefresh(async (userId, newTokenData) => await fs.writeFile(`./tokens.${userId}.json`, JSON.stringify(newTokenData, null, 4)));
	
	await authProvider.addUserForToken({
        accessToken,
        refreshToken,
        expiresIn: null,
        obtainmentTimestamp: 0
    }, ['chat']);

	// let channels = [settings.channel]
	// let channels = ['itsgillibean','speeeedtv', 'itschachatv']
	// let channels = settings.map((p: any) => p.channel);
	// console.log(channels)
	// chatClient = new ChatClient({ authProvider, channels: channels });
	let getChannelsURL = process.env.APIURL + "/db/channels";
	
	chatClient = new ChatClient({ authProvider, channels: async () => { return await fetch.default(getChannelsURL).then((p) => { return p.json() }).then((p: Array<string>) => { return p }).catch((err) => { console.log(err); return ['speeeedtv']}) } });
	
	await SOInit(chatClient);
	await CCInit(chatClient);
	await ADInit();
	await BCInit();

	await chatClient.connect();

	chatClient.onMessage(async (channel, user, message, msg) => {		
		if(channel === 'bot_ng_bayan' || channel === 'speeeedtv'  || channel === 'fpvspeed')
		{
			handleBOTMessage(user, message, channel, chatClient);
		}
		// get channel settings
		let getChannelUrl = process.env.APIURL + "/db/channels/" + channel.replace("#", "");
		let channelSettings = await fetch.default(getChannelUrl).then((p) => { return p.json() }).then((p: any) => { return p }).catch((err) => { return {enabled: false, message: err}})
		// log(channelSettings);

		if (channelSettings.enabled) {

			if (process.env.ENV != 'LOCAL') {
				// handleSOMessage(user, message, channel, chatClient, channelSettings, msg);
			}
			handleSOMessage(user, message, channel, chatClient, channelSettings, msg);
			
			handleCustomMessage(user, message, channel, chatClient);
			
		} else {
			log("Bot is disabled in the channel.Skipping handler");
			chatClient.part(channel);
		}
		//handleAdminMessage(user, message, channel, chatClient, channelSettings, msg);
		// handshake
		if (message.startsWith("PING") && user !== 'bot_ng_bayan') {
			chatClient.say(channel, message.replace('PING', 'PONG'))
		}
	});

	chatClient.onSub((channel, user) => {
		if(channel === "#speeeedtv") {
			chatClient.say(channel, `Thanks to @${user} for subscribing to the channel!`);
		}
	});
	chatClient.onResub((channel, user, subInfo) => {
		if(channel === "#speeeedtv") {
			chatClient.say(channel, `Thanks to @${user} for subscribing to the channel for a total of ${subInfo.months} months!`);
		}
	});
	chatClient.onSubGift((channel, user, subInfo) => {
		if(channel === "#speeeedtv") {	
			chatClient.say(channel, `Thanks to ${subInfo.gifter} for gifting a subscription to ${user}!`);
		}
	});

	chatClient.onJoin(async (channel, user) => {
		log("joined " + channel, "prod");
		//reinit SOlist
		await SOReinit(channel);
	});

	chatClient.onJoinFailure((channel, reason) => {
		log("JOIN FAILED:" + channel + "(" + reason + ")", "prod");
		
	});
	// chatClient.onConnect(() => {
	// 	// log(e);
	// 	log("bot connected");
	// })

	// remove channels
	// await removeBans()
}

export async function reconnect() {
	let channels = await fetch.default(process.env.APIURL + "/db/channels").then((p) => { return p.json() }).then((p) => { return p })

	log(channels);
	await chatClient.reconnect();
}

export async function say(channel: string, msg: string) {
	chatClient.say(channel, msg);
	return;
}

export interface IAuth {
	clientID: string;
	clientSecret: string;
	accessToken: string;
	refreshToken: string;
}

main();