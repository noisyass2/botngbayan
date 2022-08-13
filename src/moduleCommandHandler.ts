import { ChatClient } from '@twurple/chat';
import { getSOChannel } from './utils';


export async function handleMessage(user: string, message: string, channel: string, chatClient:ChatClient) {

    let soChannel = await getSOChannel(channel);
    
    if(soChannel) {
        //handle message
        
    }
}