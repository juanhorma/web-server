import bcrypt from "bcrypt";
import { Ok, Err } from "../result.js";
import * as usersRepository from "../repositories/usersRepository.js";
import { toUserDto } from "../dtos/userDto.js";

export const signup = async ({ email, password }) => {
  const trimmedEmail = (email || "").trim().toLowerCase();
  if (!trimmedEmail || !password) {
    return Err({ status: 400, message: "email and password are required" });
  }

  const existing = await usersRepository.findByEmail(trimmedEmail);
  if (existing)
    return Err({ status: 409, message: "that email is already registered" });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await usersRepository.create({
    email: trimmedEmail,
    passwordHash,
  });
  return Ok(toUserDto(user));
};

export const login = async ({ email, password }) => {
  const user = await usersRepository.findByEmail(
    (email || "").trim().toLowerCase(),
  );
  if (!user)
    return Err({ status: 401, message: "incorrect email or password" });

  const matches = await bcrypt.compare(password || "", user.passwordHash);
  if (!matches)
    return Err({ status: 401, message: "incorrect email or password" });

  return Ok(user);
};

export const getUser = async (id) => {
  const user = await usersRepository.findById(id);

  if (!user) {
    return Err({ status: 401, message: "non-existent user" });
  }

  return Ok(toUserDto(user));
};
