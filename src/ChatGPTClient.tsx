import { OpenAIApi, Configuration, CreateChatCompletionRequest, ChatCompletionRequestMessage } from 'openai';

export class ChatGPTClient {
    private openAI: OpenAIApi;

    constructor() {
        const configuration = new Configuration({
            apiKey: ' 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',
        });
        this.openAI = new OpenAIApi(configuration);
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
