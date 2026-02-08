import cliProgress from "cli-progress";
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { Document } from "langchain";
import { crawlLangchainDocsUrls } from "./crawlDocuments";

const progressBar = new cliProgress.SingleBar({});

export async function loadDcuments(): Promise<Document[]> {
  const langchainDocsUrls = await crawlLangchainDocsUrls();

  console.log(
    `Starting document download ${langchainDocsUrls.length} total documents`,
  );

  progressBar.start(langchainDocsUrls.length, 0);

  const rawDocuments: Document[] = [];

  for (const url of langchainDocsUrls) {
    const loader = new CheerioWebBaseLoader(url);
    const docs = await loader.load();
    rawDocuments.push(...docs);

    progressBar.increment();
  }

  progressBar.stop();
  console.log("Document download completed.");

  return rawDocuments;
}

// const rawDocuments = await loadDcuments();
// console.log("Total documents loaded:", rawDocuments.slice(0, 4));
