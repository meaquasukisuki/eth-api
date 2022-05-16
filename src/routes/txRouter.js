import express from "express"
import { externalTxController, internalTxController } from "../controllers/txControllers.js";

const txRouter = express.Router();

const txGetRoutes = [
    {
        path: "/:chain/external/:txhash",
        controller: externalTxController
    },
    {
        path: "/:chain/internal/:txhash",
        controller: internalTxController
    }
]

/**
 *  register tx get routes
 */
for (const {path,controller} of txGetRoutes) {
    txRouter.get(path,controller)
}


export default txRouter;