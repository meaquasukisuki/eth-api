import txRouter from "./txRouter.js";

const routers = [
    {
        name:"txRouter",
        path: "/api/txdata",
        router: txRouter
    }
]

export default routers;