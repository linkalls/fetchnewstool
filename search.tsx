import {
  DictionaryResult,
  OrganicResult,
  search
} from "google-sr";
import { CLIENT_RENEG_LIMIT } from "tls";

const result = await search({
  query: "おちんこ",
  // Specify the result types explicitly ([OrganicResult] is the default, but it is recommended to always specify the result type)
  resultTypes: [OrganicResult, DictionaryResult],
 
  // Optional: Customize the request using AxiosRequestConfig (e.g., enabling safe search)
});

console.log(result.forEach(item=>{
  if(item.type === "ORGANIC") {
    console.log(`Title: ${item.title}`);
    console.log(`URL: ${item.link}`);
    console.log(`Description: ${item.description}`);
  }
}));