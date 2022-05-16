import axios from 'axios';
import tracer from '../utils/tracer/tracer.js';
import stringifyObject from 'stringify-object';
import { isContract,getSignatureFromInput,seprateTextSig,abiDecoder } from '../utils/utils.js';
import { getJsonPPCProvider } from '../providers/providers.js';
import { ethers,BigNumber } from 'ethers';

const tracerStr = stringifyObject(tracer)


class InternalTxService {
    constructor(chain,archiveNodeRPCUrl) {
        this.chain = chain;
        this.archiveNodeRPCUrl = archiveNodeRPCUrl;
        this.provider = getJsonPPCProvider(archiveNodeRPCUrl)
    }

    async getInnerTxData(txhash) {
        txhash = txhash.trim();
        const txRawData = await axios.post(this.archiveNodeRPCUrl, {
            method:"debug_traceTransaction",
            params: [
                txhash,
                {
                    tracer: tracerStr
                }
            ],
            id: 1,
            jsonrpc: "2.0"
        })
        let innerCalls;
        innerCalls = txRawData.data.result.calls;


        debugger
        const innerTxs = await Promise.all(innerCalls.map(async ({type,from,to,value,gasUsed,input,depth}) => {
            let callerIsSmartContract = await isContract(from,this.provider)
            
            if (input !== '0x' && gasUsed) {
                const sig = await getSignatureFromInput(input)
    
                if (sig) {
                    let {methodArgTypes,methodName} = seprateTextSig(sig)
                    
                    let methodArgValues;
                    if (methodArgTypes.length === 1 && methodArgTypes[0].trim() === "") {
                        methodArgTypes = [];
                    }
                    else {
                        for (let i = 0; i < methodArgTypes.length; i++) {
                            if (methodArgTypes[i] === "bytes") {
                                methodArgTypes[i] = "bytes32";
                            }
                        }
                        
                        methodArgValues = abiDecoder.decode(methodArgTypes,ethers.utils.hexDataSlice(input,4))
        
                    }
        
                    let methodArgs = [];
                    if (
                        methodArgTypes.length &&
                        methodArgValues.length &&
                        methodArgTypes.length === methodArgValues.length
                    ) {
                        for (let i = 0; i < methodArgTypes.length; i++) {
                            methodArgs.push({
                                methodArgType: String(methodArgTypes[i]),
                                methodArgValue: String(methodArgValues[i])
                            })
                        }
                    }
                    let item = {
                        parentTxhash: txhash,
                        opcode:type,
                        depth,
                        callerAddress:from,
                        callerIsSmartContract,
                        calleeAddress: to,
                        value: BigNumber.from(value).toString(),
                        gasUsed: BigNumber.from(gasUsed).toString(),
                        isInternal: true,
                        methodName,
                        methodArgs
                    }

                    return item;
                }
            }

        }))

        

        return innerTxs.filter((innerTx) => {
            return innerTx != null;
        })
    }
}

export default InternalTxService;