import * as dotenv from "dotenv";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { userRouter } from "./apiRoutes/userRoutes";
import { authRouter } from "./apiRoutes/authRoutes";
import { APP_PORT } from "./appVariables";
 
const PORT: number = APP_PORT;
 
const app = express();

/** App Configuration */

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended : true}))

app.use('/', userRouter);
app.use('/', authRouter);

/** Server Activation */

app.listen(PORT, () => {
    console.log(`Listening on port == ${PORT}`);
  });