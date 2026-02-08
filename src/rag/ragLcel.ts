import { formatDocumentsAsString } from "@langchain/classic/util/document";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { createRetriever } from "./retriever";
import { RunnableSequence } from "@langchain/core/runnables";
import { chat, ChatHandler } from "../utils/chat";

const prompt = ChatPromptTemplate.fromMessages([
  [
    "human",
    `You are an assistant for question-answering tasks. Use the following pieces of retrieved context to answer the question. If you don't know the answer, just say that you don't know. Use three sentences maximum and keep the answer concise.
    Question: {question} 
    Context: {context} 
    Answer:`,
  ],
]);

// Google chat LLM
const llm = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash", // if this model is not available anymore then please check another available model from google gemini api documentation

  // Important Note: There is a problem with maxOutputTokens parameters in google langchain package, it causes error
  // Don't use it for now, I will update the code in future if langchain team fixes this issue
  maxOutputTokens: 500,
});

const outputParser = new StringOutputParser();

const retriever = await createRetriever();

const retrievalChain = RunnableSequence.from([
  (input) => input.question,
  retriever,
  formatDocumentsAsString,
]);

const generationChain = RunnableSequence.from([
  {
    question: (input) => input.question,
    context: retrievalChain,
  },
  prompt,
  llm,
  outputParser,
]);

const chatHandler: ChatHandler = async (question: string) => {
  return {
    answer: generationChain.stream({ question }),
  };
};

chat(chatHandler);
