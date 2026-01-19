import PocketBase from 'pocketbase';
import config from "./index.js";
export const pb = new PocketBase(config.pocketbase.url);
pb.collection('_superusers').authWithPassword(config.pocketbase.email, config.pocketbase.password);