/** @format */

import fs from 'node:fs/promises';

import dotenv from 'dotenv';

/**
 * Install the following dependencies:
 *  npm install dotenv
    npm install @types/node --save-dev
  for openai api key
 */

// Load environment variables from .env file
dotenv.config();

// import {
//   Document,
//   MetadataMode,
//   NodeWithScore,
//   VectorStoreIndex,
// } from 'llamaindex';

import * as llamaIndex from 'llamaindex';




async function manual_rag() {
  // this is the same as the main function below,
  // but we are manually creating the query engine
  // and the retriever
  // and the response builder
  // and the synthesizer
  // and the service context
  // and the llm to show how it is done manually
  // we are also customizing the prompt to show that you can do this easily with llamaIndex
  const documents = await new llamaIndex.SimpleDirectoryReader().loadData({
    directoryPath: './data',
  });

  const index = await llamaIndex.VectorStoreIndex.fromDocuments(documents);

  let customLLM = new llamaIndex.OpenAI();
  let customEmbedding = new llamaIndex.OpenAIEmbedding();

  let customServiceContext = llamaIndex.serviceContextFromDefaults({
    llm: customLLM,
    embedModel: customEmbedding,
  });

  let customQaPrompt = function ({ context = '', query = '' }) {
    return `Context information is below.
        ---------------------
        ${context}
        ---------------------
        Given the context information, answer the query.
        Include a random fact about lions and elephants in Africa in your answer.\
        The whale lions and elephants can come from your training data.
        Query: ${query}
        Answer:`;
  };

  // const res = await responseSynthesizer.synthesize({
  //   query: "What age am I?",
  //   nodesWithScore,
  // });
  // console.log(res);

  // let customResponseBuilder = new llamaIndex.buil(
  //   customServiceContext,
  //   customQaPrompt
  // );

  // let customSynthesizer = getResponseSynthesizer({
  //   responseBuilder: customResponseBuilder,
  //   serviceContext: customServiceContext,
  // });

  let customRetriever = new llamaIndex.VectorIndexRetriever({
    index,
  });

  let customQueryEngine = new llamaIndex.RetrieverQueryEngine(
    customRetriever,
    // customSynthesizer
  );

  let response = await customQueryEngine.query({
    query: 'what is the article about?',
  });

  console.log(response.toString());
}
async function main() {
  const documents = await new llamaIndex.SimpleDirectoryReader().loadData({
    directoryPath: './data',
  });

  const index = await llamaIndex.VectorStoreIndex.fromDocuments(documents);

  // create a query engine
  // retriever, postprocessing,syntehsizer
  const queryEngine = index.asQueryEngine();

  // query the index
  const resp = await queryEngine.query({
    query: 'what is this article about?',
  });
  console.log(resp);
}

manual_rag().catch(console.error);
// let customLLM = new llamaIndex.OpenAI();
// let customEmbedding = new llamaIndex.OpenAIEmbedding();

// put llm and embedding model into a ServiceContext object

