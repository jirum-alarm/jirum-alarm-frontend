"use client";
import { atom } from "recoil";
import { User } from "../type/user";

export const userState = atom<User | null>({
  key: "userState",
  default: null,
});
