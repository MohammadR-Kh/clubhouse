import { StreamClient } from "@stream-io/node-sdk";



const apiKey = "saw9s9xmvgnv"
const apiSecret = "k6uhh6njwrmz376myxn8keu5xnawsa72ff3rd7r66x49d56k4ay5mfwndypeyxf6"

export const client = new StreamClient(apiKey, apiSecret);