import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Document } from "langchain";
import { loadDcuments } from "./loadDocuments";

export async function splitDocuments(
  rawDocuments: Document[],
): Promise<Document[]> {
  const splitter = RecursiveCharacterTextSplitter.fromLanguage("html", {
    chunkSize: 500,
    chunkOverlap: 100,
  });

  console.log("Splitting documents...");
  const documentChunks = await splitter.splitDocuments(rawDocuments);

  console.log(
    `${rawDocuments.length} documents split into ${documentChunks.length} chunks`,
  );

  return documentChunks;
}

// const rawDocuments = await loadDcuments();

// await splitDocuments(rawDocuments);
