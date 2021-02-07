import { ethers } from "ethers";

export function isBignumberish(val: any): val is ethers.BigNumberish {
  try {
    ethers.BigNumber.from(val)
    return true
  } catch {}

  return false
}

export enum AuthLevel {
  AUTHORIZED = 1,
  LOCKED = 0,
  UNAUTHORIZED = 2
}

export function canSend(args: { owner?: string, beneficiary?: string, unlocked: boolean, account: string}): AuthLevel {
  const account = args.account.toLowerCase()
  if (args.owner?.toLowerCase() === account) return AuthLevel.AUTHORIZED
  if (args.beneficiary?.toLowerCase() !== account) return AuthLevel.UNAUTHORIZED
  if (!args.unlocked) return AuthLevel.LOCKED
  return AuthLevel.AUTHORIZED
}

export function set<T>(arr: T[]): T[] {
  return arr.filter((v, i) => arr.indexOf(v) === i)
}
