import { Request, Response } from "express";
import { getManager } from "typeorm";
import { User } from "../entity/user.entity";
import { RegisterValidation } from "../validation/register.validation";
import bcryptjs from "bcryptjs";
import { sign, verify } from "jsonwebtoken";

export const Register = async (req: Request, res: Response) => {
	const body = req.body;

	const { error } = RegisterValidation.validate(body);
	if (error) {
		return res.status(400).send(error.details);
	}

	if (body.password !== body.password_confirm) {
		return res.status(400).send({
			message: "Password do not match",
		});
	}

	const user_repository = getManager().getRepository(User);

	const { password, ...user } = await user_repository.save({
		first_name: body.first_name,
		last_name: body.last_name,
		email: body.email,
		password: await bcryptjs.hash(body.password, 10),
	});

	res.send(user);
};

export const Login = async (req: Request, res: Response) => {
	const body = req.body;
	const user_repository = getManager().getRepository(User);

	const user = await user_repository.findOne({
		where: {
			email: body.email,
		},
	});

	if (!user || !(await bcryptjs.compare(body.password, user.password))) {
		return res.status(400).send({ message: "Invalid credential" });
	}

	const token = sign({ id: user.id }, process.env.SECRET_KEY);

	res.cookie("jwt", token, {
		httpOnly: true,
		maxAge: 24 * 60 * 60 * 1000,
	});

	res.send({ message: "Login success" });
};

export const AuthenticatedUser = async (req: Request, res: Response) => {
	res.send(req["user"]);
};

export const Logout = async (req: Request, res: Response) => {
	res.cookie("jwt", "", { maxAge: 0 });

	res.send({ message: "Logout success" });
};

export const UpdateInfo = async (req: Request, res: Response) => {
	const user = req["user"];
	const user_repository = getManager().getRepository(User);

	await user_repository.update(user.id, req.body);

	const { password, ...data } = await user_repository.findOne({
		where: { id: user.id },
	});

	res.send(data);
};

export const UpdatePassword = async (req: Request, res: Response) => {
	const user = req["user"];

	if (req.body.password !== req.body.password_confirm) {
		return res.status(400).send({
			message: "Password do not match",
		});
	}

	const user_repository = getManager().getRepository(User);

	await user_repository.update(user.id, {
		password: await bcryptjs.hash(req.body.password, 10),
	});

	res.send({ message: "Password changed" });
};
