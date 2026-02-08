import { VectorStoreRetriever } from "@langchain/core/vectorstores";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { PineconeStore } from "@langchain/pinecone";
import { Pinecone } from "@pinecone-database/pinecone";
import dotenv from "dotenv";

dotenv.config();

export async function createRetriever(): Promise<VectorStoreRetriever> {
  const embeddingLLM = new GoogleGenerativeAIEmbeddings({
    model: "gemini-embedding-001",
  });

  const pinecone = new Pinecone();
  const pineconeIndex = pinecone.index("langchain-docs-gemini");
  const vectorStore = await PineconeStore.fromExistingIndex(embeddingLLM, {
    pineconeIndex,
  });

  return vectorStore.asRetriever();
}

// const retriever = await createRetriever();
// const context = await retriever.invoke("What is LangChain?");
// console.log("Retrieved context:", context);
