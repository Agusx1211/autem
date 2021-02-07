/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { Contract, ContractFactory, Overrides } from "@ethersproject/contracts";

import type { Proxy } from "../Proxy";

export class Proxy__factory extends ContractFactory {
  constructor(signer?: Signer) {
    super(_abi, _bytecode, signer);
  }

  deploy(_implementation: string, overrides?: Overrides): Promise<Proxy> {
    return super.deploy(_implementation, overrides || {}) as Promise<Proxy>;
  }
  getDeployTransaction(
    _implementation: string,
    overrides?: Overrides
  ): TransactionRequest {
    return super.getDeployTransaction(_implementation, overrides || {});
  }
  attach(address: string): Proxy {
    return super.attach(address) as Proxy;
  }
  connect(signer: Signer): Proxy__factory {
    return super.connect(signer) as Proxy__factory;
  }
  static connect(address: string, signerOrProvider: Signer | Provider): Proxy {
    return new Contract(address, _abi, signerOrProvider) as Proxy;
  }
}

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_implementation",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    stateMutability: "payable",
    type: "fallback",
  },
  {
    inputs: [],
    name: "implementation",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    stateMutability: "payable",
    type: "receive",
  },
];

const _bytecode =
  "0x60a060405234801561001057600080fd5b5060405161019238038061019283398101604081905261002f91610044565b60601b6001600160601b031916608052610072565b600060208284031215610055578081fd5b81516001600160a01b038116811461006b578182fd5b9392505050565b60805160601c60ff61009360003960008181602a01526093015260ff6000f3fe608060405260043610601f5760003560e01c80635c60da1b14606b576025565b36602557005b6040517f00000000000000000000000000000000000000000000000000000000000000009036600082376000803683855af43d806000843e8180156067578184f35b8184fd5b348015607657600080fd5b50607d6091565b6040516088919060b5565b60405180910390f35b7f000000000000000000000000000000000000000000000000000000000000000081565b6001600160a01b039190911681526020019056fea2646970667358221220ddaea2eaa1781740bac90ac9e08409bcbaa52598ae7608eb6e94208e9250c3bf64736f6c63430008010033";
