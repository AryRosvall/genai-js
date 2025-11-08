import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { createRetriever } from "./retriever";
import {
  RunnableSequence,
  RunnablePassthrough,
} from "@langchain/core/runnables";
import { formatDocumentsAsString } from "@langchain/classic/util/document";

import { chat, ChatHandler } from "../utils/chat";
import dotenv from "dotenv";

dotenv.config();

const prompt = ChatPromptTemplate.fromMessages([
  [
    "human",
    `You are an assistant for question-answering tasks. Use the following pieces of retrieved context to answer the question. If you don't know the answer, just say that you don't know. Use three sentences maximum and keep the answer concise.
Question: {question} 
Context: {context} 
Answer:`,
  ],
]);

const llm = new ChatOpenAI({
  model: "gpt-3.5-turbo",
  maxTokens: 500,
});

const outputParser = new StringOutputParser();

const retriever = await createRetriever();

const retrievalChain = RunnableSequence.from([
  (input) => input.question,
  retriever,
]);

const generationChain = RunnableSequence.from([
  {
    question: (input) => input.question,
    context: (input) => formatDocumentsAsString(input.context),
  },
  prompt,
  llm,
  outputParser,
]);

// let ragChainWithSource = RunnablePassthrough.assign({
//   context: retrievalChain,
// }).assign({
//   answer: generationChain,
// });

const chatHandler: ChatHandler = async (question: string) => {
  const context = await retrievalChain.invoke({ question });

  const sources = context.map((doc) => doc.metadata.source);

  const answer = generationChain.stream({
    question,
    context,
  });

  return {
    answer,
    sources,
  };
};

// const chatHandler: ChatHandler = async (question: string) => {
//   return {
//     // answer: ragChainWithSource.invoke({ question }),
//     answer: ragChainWithSource.stream({ question }),
//   };
// };

chat(chatHandler);
