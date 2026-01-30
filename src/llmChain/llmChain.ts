import { LLMChain } from "@langchain/classic/chains";
import dotenv from "dotenv";
import { PromptTemplate } from "@langchain/core/prompts";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";

dotenv.config();

async function personalisedPitch(
  course: string,
  role: string,
  wordLimit: Number,
) {
  const promptTemplate = new PromptTemplate({
    template:
      "Describe the importance of learning {course} for {role} in {wordLimit} words.",
    inputVariables: ["course", "role", "wordLimit"],
  });

  const formattedPrompt = await promptTemplate.format({
    course,
    role,
    wordLimit,
  });

  console.log(formattedPrompt);

  const llm = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash",
    // temperature: 1,
    topP: 0,
  });
  const outputParser = new StringOutputParser();

  // Option 1 - Langchain legacy chain

  // const llmLegacyChain = new LLMChain({
  //   prompt: promptTemplate,
  //   llm,
  //   outputParser,
  // });

  // const answer = await llmLegacyChain.invoke({
  //   course,
  //   role,
  //   wordLimit,
  // });

  // console.log("Answer from legacy LLMChain:", answer);

  // Option 2 - LCEL chain

  //const lcelChain = promptTemplate.pipe(llm).pipe(outputParser);

  const lcelChain = RunnableSequence.from([promptTemplate, llm, outputParser]);

  const answerLcel = await lcelChain.invoke({
    course,
    role,
    wordLimit,
  });

  console.log("Answer from LCEL chain:", answerLcel);
}

await personalisedPitch("Generative AI", "Junior Developer", 40);
