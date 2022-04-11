import { Request, Response } from "express";
import { verify } from "jsonwebtoken";
import { getManager } from "typeorm";
import { User } from "../entity/user.entity";

export const AuthMiddleware = async (
	req: Request,
	res: Response,
	next: Function
) => {
	try {
		const jwt = req.cookies["jwt"];

		const payload: any = verify(jwt, process.env.SECRET_KEY);

		if (!payload) {
			return res.status(400).send({ message: "Unauthenticated" });
		}

		const user_repository = getManager().getRepository(User);

		const { password, ...user } = await user_repository.findOne({
			where: {
				id: payload.id,
			},
		});

		req["user"] = user;

		next();
	} catch (error) {
		return res.status(400).send({ message: "Unauthenticated" });
	}
};
