import { randomBytes, createHmac } from "node:crypto";
import { db, eq } from "@repo/database";
import { usersTable } from "@repo/database/models/user";

import {
  type CreateUserWithEmailAndPasswordInputType,
  createUserWithEmailAndPasswordInput,
} from "./model";

class UserService {
  public async getUserByEmail(email: string) {
    const result = await db.select().from(usersTable).where(eq(usersTable.email, email));
    if (!result || result.length === 0) return null;
    return result[0];
  }

  public async createUserWithEmailAndPassword(payload: CreateUserWithEmailAndPasswordInputType) {
    //bussiness logic
    //sabse pehle parsing krlete hain
    //if validation success il get email password
    const { fullName, email, password } =
      await createUserWithEmailAndPasswordInput.parseAsync(payload);

    //check if user already exist or not
    const existingUserWithEmail = await this.getUserByEmail(email);
    if (existingUserWithEmail) throw new Error(`user with email ${email} already exists`);

    const salt = randomBytes(16).toString("hex");
    const hash = createHmac("sha256", salt).update(password).digest("hex");

    // Create the user in the db
    const userInsertResult = await db
      .insert(usersTable)
      .values({
        fullName,
        email,
        salt,
        password: hash,
      })
      .returning({
        id: usersTable.id,
      });

    // const createdUser = userInsertResult[0];
    //if (!createdUser) throw new Error(`something went wrong while creating a user`);

    if (!userInsertResult || userInsertResult.length === 0 || !userInsertResult[0]?.id)
      throw new Error(`something went wrong while creating a user`);
    return {
      id: userInsertResult[0].id,
    };
  }
}

export default UserService;
