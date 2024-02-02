import express from "express";

import { createUser, getUserByEmail } from "../db/users";
import { random, authentication } from "../helpers";

// login control section
export const login = async (req: express.Request, res: express.Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.sendStatus(400);
    }

    //check User with Email
    const user = await getUserByEmail(email).select(
      "+authentication.salt +authentication.password"
    ); // for import & access authentication and salt

    if (!user) {
      return res.sendStatus(400);
    }

    //authenticate our user without knowing their password
    // using hash comparison
    const expectedHash = authentication(user.authentication.salt, password);

    if (user.authentication.password != expectedHash) {
      return res.sendStatus(403);
    }

    // update section token
    const salt = random();
    user.authentication.sessionToken = authentication(
      salt,
      user._id.toString()
    );

    await user.save();

    //set the cookie
    res.cookie("KAEM-AUTH", user.authentication.sessionToken, {
      domain: "localhost",
      path: "/",
    });

    return res.status(200).json(user).end();
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
};

// register control section
export const register = async (req: express.Request, res: express.Response) => {
  try {
    const { email, password, username } = req.body; // define in users.ts

    if (!email || !password || !username) {
      return res.sendStatus(400);
    }

    //check User is existing
    const existingUser = await getUserByEmail(email);

    if (existingUser) {
      return res.sendStatus(400);
    }

    const salt = random();
    const user = await createUser({
      email,
      username,
      authentication: {
        salt,
        password: authentication(salt, password),
      },
    });

    return res.status(200).json(user).end();
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
};
