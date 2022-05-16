import { ethers } from "ethers";
import { rpcUrls } from "../configs/constants/index.js";

export const localProvider = new ethers.providers.JsonRpcProvider(rpcUrls.local)

export const getJsonPPCProvider = (rpcUrl) => {
    return new ethers.providers.JsonRpcProvider(rpcUrl)
}

const providers = {
    local: localProvider
}


export default providers;