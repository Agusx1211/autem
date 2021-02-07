import { ethers } from "ethers";
import { Proxy__factory } from "../contracts";
import { TrustInitialParameters } from "../services/Trusts";
import { FACTORY_ADDRESS, IMPLEMENTATION_ADDRESS } from "../services/Web3";

export function shortAddress(raw: string, chars: number = 4): string {
  try {
    const addr = ethers.utils.getAddress(raw)
    const cont = addr.split('0x')[1]
    return `0x${cont.slice(0, chars)}...${cont.slice(-chars)}`
  } catch {}

  return raw
}

export function addressOf(parameters: TrustInitialParameters): string {
  const salt = ethers.utils.keccak256(
    ethers.utils.defaultAbiCoder.encode(
      ['address', 'address', 'uint96', 'string'],
      [parameters.owner, parameters.beneficiary, parameters.window, parameters.metadata]
    )
  )

  const Proxy = new Proxy__factory()

  return ethers.utils.getAddress(
    ethers.utils.hexDataSlice(
      ethers.utils.keccak256(
        ethers.utils.solidityPack(
          ['bytes1', 'address', 'bytes32', 'bytes32'],
          ['0xff', FACTORY_ADDRESS, salt, ethers.utils.keccak256(
            ethers.utils.solidityPack(
              ['bytes', 'bytes32'],
              [Proxy.bytecode, ethers.utils.defaultAbiCoder.encode(['address'], [IMPLEMENTATION_ADDRESS])]
            )
          )]
        )
      ),
      12
    )
  )
}

export type SolvedAddressType = {
  address: string,
  ensName: string | undefined,
  isValid: boolean,
  isEns: boolean
}

export async function safeLookupAddress(address: string, provider: ethers.providers.Provider): Promise<string | undefined> {
  if (!address) return undefined
  try {
    return await provider.lookupAddress(address)
  } catch (e) {
    console.warn('Error lookup ens address', address, e)
  }
}

export async function safeResolveName(ens: string, provider: ethers.providers.Provider): Promise<string | undefined> {
  if (!ens) return undefined
  try {
    return await provider.resolveName(ens)
  } catch (e) {
    console.warn('Error lookup ens name', ens, e)
  }
}

export async function solveAddress(addressOrEns: string, provider: ethers.providers.Provider): Promise<SolvedAddressType> {
  if (ethers.utils.isAddress(addressOrEns)) return {
    address: ethers.utils.getAddress(addressOrEns),
    ensName: await safeLookupAddress(addressOrEns, provider),
    isValid: true,
    isEns: false
  }

  const ensAddr = await safeResolveName(addressOrEns, provider)
  if (ensAddr) return {
    address: ensAddr,
    ensName: addressOrEns,
    isValid: true,
    isEns: true
  }

  return {
    address: '',
    ensName: undefined,
    isValid: false,
    isEns: false
  }
}

export function getAddressHelper(input: string, solved?: SolvedAddressType): [boolean, string] {
  if (input === "") return [false, ""]
  if (!solved) return [false, "..."]
  if (solved && !solved.isValid) return [true, 'Invalid address']
  if (solved.isEns) return [false, solved.address]
  if (solved.ensName) return [false, solved.ensName]
  return [false, '']
}
