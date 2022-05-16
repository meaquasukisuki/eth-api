import providers from "../providers/providers.js";
import ExternalTxService from "../services/ExternalTxService.js";
import InternalTxService from '../services/InternalTxService.js';

export const externalTxController = async (req,res) => {
    const chain = req.params.chain;
    const provider = providers[chain]
    const txhash = req.params.txhash;
    let data;

    const service = new ExternalTxService(chain,provider)
    try {
        data = await service.getExternalTxData(txhash);
        res.json(data)
    } catch (error) {
        res.status(500).send(error.message)
    }
    
}

export const internalTxController = async (req,res) => {
    const chain = req.params.chain;
    const provider = providers[chain]
    const txhash = req.params.txhash;
    const archiveNodeRPCUrl = "http://localhost:8545"

    let data;
    const service = new InternalTxService(chain,archiveNodeRPCUrl)

    try {
        data = await service.getInnerTxData(txhash)
    
        res.send(data)
    } catch (error) {
        res.status(500).send(error.message)
    }

}