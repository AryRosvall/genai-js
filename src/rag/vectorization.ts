import dotenv from "dotenv";
import { loadDcuments } from "./loadDocuments";
import { splitDocuments } from "./splitDocuments";
import { Pinecone } from "@pinecone-database/pinecone";
import { PineconeStore } from "@langchain/pinecone";
import cliProgress from "cli-progress";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

dotenv.config();

const rawDocuments = await loadDcuments();
const chunkedDocuments = await splitDocuments(rawDocuments);

const embeddingLLM = new GoogleGenerativeAIEmbeddings({
  model: "gemini-embedding-001",
});

const pinecone = new Pinecone();
const pineconeIndex = pinecone.index("langchain-docs-gemini");

console.log("Starting Vectorization...");
const progressBar = new cliProgress.SingleBar({});
progressBar.start(chunkedDocuments.length, 0);

for (let i = 0; i < chunkedDocuments.length; i++) {
  const batch = chunkedDocuments.slice(i, i + 100);
  await PineconeStore.fromDocuments(batch, embeddingLLM, {
    pineconeIndex,
  });

  progressBar.increment(batch.length);
}

progressBar.stop();
console.log("Chunked documents stored in pinecone.");
