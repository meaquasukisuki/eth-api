import axios from "axios";
import { ethers } from "ethers";
export const isContract = async (address,provider) => {
    const code = await provider.getCode(address)
    if (code > "0x") {
        return true;
    }
    else if (code == "0x") {
        return false;
    }
}

export const getSignatureFromInput = async (input) =>  {
    const baseUrl = "https://www.4byte.directory/api/v1/signatures/"
    const eventSigBaseUrl = "https://www.4byte.directory/api/v1/event-signatures/"
    const sig = input.slice(0,10)
    const res = await axios.get(baseUrl,{
        params: {
            hex_signature:sig
        }
    })
    
    if (res.status === 200 && res.data?.results?.length) {
        const text = res.data.results[0].text_signature
        return text
    }
    else if (res.data.count === 0) {
        const res = await axios.get(eventSigBaseUrl,{
            params: {
                hex_signature:input
            }
        })
        if (res.status === 200 && res.data?.results?.length) {
            const text = res.data?.results[0].text_signature
            return text
        }
    }
    else {
        throw new Error("cannot find text signature")
    }
}

export const seprateTextSig = (textSig) => {
    const splittedArray = textSig.split("(")
    const methodName = splittedArray[0]
    let methodArgTypes = [];
    if (splittedArray[1].charAt(splittedArray[1].length - 1) === ")") {
        methodArgTypes = splittedArray[1].slice(0,splittedArray[1].length-1).split(',')
    }
    return {
        methodName,
        methodArgTypes
    }
}

export const abiDecoder = ethers.utils.defaultAbiCoder