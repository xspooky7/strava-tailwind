import PocketBase from "pocketbase"

const pb = new PocketBase(process.env.PB_URL)
pb.autoCancellation(false)

export default pb
