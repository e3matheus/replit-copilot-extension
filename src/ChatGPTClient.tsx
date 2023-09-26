import { OpenAIApi, Configuration, CreateChatCompletionRequest, ChatCompletionRequestMessage } from 'openai';
import Client from "@replit/database";
const db = new Client();

async function getSecret(secretName: string): Promise<string> {
  const result = await db.get(secretName);
  return String(result);
}

export class ChatGPTClient {
    private openAI!: OpenAIApi;
    private apiKey!: string;

    async initialize() {
        this.apiKey = (await getSecret('OPENAI_API_KEY') || '');
        const configuration = new Configuration({
            apiKey: this.apiKey,
        });
        this.openAI = new OpenAIApi(configuration);
    }
  
    constructor() {
        this.initialize();
    }

    async respond(chatGPTMessages: Array<ChatCompletionRequestMessage>) {
        try {
            if (!chatGPTMessages) {
                return {
                    text: 'No chatGPTMessages',
                };
            }

            const request: CreateChatCompletionRequest = {
                messages: chatGPTMessages,
                model: 'gpt-3.5-turbo',
            };

            const response = await this.openAI.createChatCompletion(request);

            if (!response.data || !response.data.choices) {
                return {
                    text: "The bot didn't respond. Please try again later.",
                };
            }

            return {
                text: response.data.choices[0].message?.content,
                messageId: response.data.id,
            };
        } catch (error) {
            console.log('E: ', error);
            //throw new Error(error);
        }
    }
}
