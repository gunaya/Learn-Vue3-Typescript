require("dotenv").config();

import express, { Request, Response } from "express";
import cors from "cors";
import { routes } from "./routes";
import { createConnection } from "typeorm";
import cookieParser from "cookie-parser";

createConnection().then((manager) => {
	const app = express();

	app.use(express.json());
	app.use(cookieParser());
	app.use(
		cors({
			origin: ["http://localhost:3000"],
			credentials: true,
		})
	);

	routes(app);

	app.listen(8002, () => {
		console.log("listening to port 8002");
	});
});
