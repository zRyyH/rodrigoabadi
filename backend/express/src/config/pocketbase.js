import PocketBase from 'pocketbase';
import config from "./index.js";
export const pb = new PocketBase(config.pocketbase.url);
pb.collection('_superusers').authWithPassword('zryyh.br@gmail.com', 'hs6tbi9sc4ssr2jmn3gwa69vas8n701u9canr20cj19ejcr3ok');