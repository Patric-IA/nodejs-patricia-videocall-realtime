// SPDX-FileCopyrightText: 2024 LiveKit, Inc.
//
// SPDX-License-Identifier: Apache-2.0
import { type JobContext, WorkerOptions, cli, defineAgent, llm, multimodal } from '@livekit/agents';
import * as openai from '@livekit/agents-plugin-openai';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '../.env');
dotenv.config({ path: envPath });

export default defineAgent({
  entry: async (ctx: JobContext) => {
    await ctx.connect();
    console.log('waiting for participant');
    const participant = await ctx.waitForParticipant();
    console.log(`starting assistant example agent for ${participant.identity}`);

    const model = new openai.realtime.RealtimeModel({
      instructions:
      'You are an English teacher engaging with a student. Your task is to provide real-time grammar and pronunciation feedback on the student\'s sentences. Make the lesson engaging by incorporating topics that interest the student, such as *One Piece* and *Harry Potter*. Tailor your responses to help them practice English through these topics while ensuring they are learning effectively and having fun.',
    });

    const fncCtx: llm.FunctionContext = {
      conversation: {
        description: 'Generate questions or responses based on topics like anime, books, or general interests',
        parameters: z.object({
          topic: z.enum(['anime', 'books', 'general']).describe('The topic to base the conversation on'),
          input: z.string().describe('The user input or context to guide the response'),
        }),
        execute: async ({ topic, input }) => {
          console.debug(`Generating conversation for topic: ${topic} with input: "${input}"`);
          switch (topic) {
            case 'anime':
              return `Since we're talking about anime, here's a question for you: What do you think the One Piece treasure could be?`;
            case 'books':
              return `As a book lover, what do you think makes the Harry Potter series so magical?`;
            case 'general':
              return `Let's chat! Here's a thought: If you could teach Fredy Vega something new, what would it be?`;
            default:
              throw new Error(`Unknown topic: ${topic}`);
          }
        },
      },
    };    

    const agent = new multimodal.MultimodalAgent({ model, fncCtx });

    const session = await agent
      .start(ctx.room, participant)
      .then((session) => session as openai.realtime.RealtimeSession);

    session.conversation.item.create(
      llm.ChatMessage.create({
        role: llm.ChatRole.ASSISTANT,
        text: `
        [Switching to English]
        Hi! I'm Patricia from Platzi. I taught Freddy Vega how to learn English. I also know you love anime, especially *One Piece*, and enjoy reading the *Harry Potter* books.
        
        [Switching to English]
        Let's start practicing English with a fun question: What do you think the One Piece could be?
        `,
      }),
    );

    session.response.create();
  },
});

cli.runApp(new WorkerOptions({ agent: fileURLToPath(import.meta.url) }));
