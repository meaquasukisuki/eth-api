import { BigNumber,ethers } from "ethers";
import { isContract,getSignatureFromInput,seprateTextSig,abiDecoder } from "../utils/utils.js";

class ExternalTxService {
    constructor(chain,provider) {
        this.chain = chain;
        this.provider = provider;
    }

    async getExternalTxData(txhash) {
        txhash = txhash.trim();
        const provider = this.provider;
        let data;
        const transaction = await provider.getTransaction(txhash);
        let {
            from:callerAddress,
            to:calleeContractAddress,
            gasPrice,
            gasLimit,
            hash,
            chainId,
            blockNumber
        } = transaction;

        const txReceipt = await provider.getTransactionReceipt(hash);
        let {gasUsed} = txReceipt;
        let gasCost;
        if (BigNumber.isBigNumber(gasUsed) && BigNumber.isBigNumber(gasPrice)) {
            gasCost = gasUsed.mul(gasPrice).toString();
            gasUsed = gasUsed.toString();
            gasPrice = gasPrice.toString();
        }

        const {
            miner,
            timestamp
        } = await provider.getBlock(blockNumber);

        let callerIsSmartContract = await isContract(
            callerAddress,
            provider
        );

        if (transaction.data !== "0x") {
            const sig = await getSignatureFromInput(transaction.data)
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

                    methodArgValues = abiDecoder.decode(methodArgTypes,ethers.utils.hexDataSlice(transaction.data,4))
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
                data = {
                    transactionHash:hash,
                    chainId,
                    callerAddress,
                    callerIsSmartContract,
                    methodName,
                    methodArgs,
                    calleeContractAddress,
                    gasPrice,
                    gasUsed,
                    gasCost,
                    isInternal: false,
                    blockNumber,
                    miner,
                    timestamp
                }
            }
        }
        //  don't have transaction input data.
        else {
            data = {
                transactionHash:hash,
                chainId,
                callerAddress,
                callerIsSmartContract,
                calleeContractAddress,
                gasPrice,
                gasUsed,
                gasCost,
                isInternal: false,
                blockNumber,
                miner,
                timestamp
            }
        }
        return data;
    }
}


export default ExternalTxService;
