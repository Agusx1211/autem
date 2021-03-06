/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import {
  ethers,
  EventFilter,
  Signer,
  BigNumber,
  BigNumberish,
  PopulatedTransaction,
} from "ethers";
import {
  Contract,
  ContractTransaction,
  Overrides,
  CallOverrides,
} from "@ethersproject/contracts";
import { BytesLike } from "@ethersproject/bytes";
import { Listener, Provider } from "@ethersproject/providers";
import { FunctionFragment, EventFragment, Result } from "@ethersproject/abi";

interface FactoryInterface extends ethers.utils.Interface {
  functions: {
    "create(address,address,uint96,string)": FunctionFragment;
    "implementation()": FunctionFragment;
  };

  encodeFunctionData(
    functionFragment: "create",
    values: [string, string, BigNumberish, string]
  ): string;
  encodeFunctionData(
    functionFragment: "implementation",
    values?: undefined
  ): string;

  decodeFunctionResult(functionFragment: "create", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "implementation",
    data: BytesLike
  ): Result;

  events: {};
}

export class Factory extends Contract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  on(event: EventFilter | string, listener: Listener): this;
  once(event: EventFilter | string, listener: Listener): this;
  addListener(eventName: EventFilter | string, listener: Listener): this;
  removeAllListeners(eventName: EventFilter | string): this;
  removeListener(eventName: any, listener: Listener): this;

  interface: FactoryInterface;

  functions: {
    create(
      _owner: string,
      _beneficiary: string,
      _window: BigNumberish,
      _metadata: string,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    "create(address,address,uint96,string)"(
      _owner: string,
      _beneficiary: string,
      _window: BigNumberish,
      _metadata: string,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    implementation(overrides?: CallOverrides): Promise<[string]>;

    "implementation()"(overrides?: CallOverrides): Promise<[string]>;
  };

  create(
    _owner: string,
    _beneficiary: string,
    _window: BigNumberish,
    _metadata: string,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  "create(address,address,uint96,string)"(
    _owner: string,
    _beneficiary: string,
    _window: BigNumberish,
    _metadata: string,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  implementation(overrides?: CallOverrides): Promise<string>;

  "implementation()"(overrides?: CallOverrides): Promise<string>;

  callStatic: {
    create(
      _owner: string,
      _beneficiary: string,
      _window: BigNumberish,
      _metadata: string,
      overrides?: CallOverrides
    ): Promise<void>;

    "create(address,address,uint96,string)"(
      _owner: string,
      _beneficiary: string,
      _window: BigNumberish,
      _metadata: string,
      overrides?: CallOverrides
    ): Promise<void>;

    implementation(overrides?: CallOverrides): Promise<string>;

    "implementation()"(overrides?: CallOverrides): Promise<string>;
  };

  filters: {};

  estimateGas: {
    create(
      _owner: string,
      _beneficiary: string,
      _window: BigNumberish,
      _metadata: string,
      overrides?: Overrides
    ): Promise<BigNumber>;

    "create(address,address,uint96,string)"(
      _owner: string,
      _beneficiary: string,
      _window: BigNumberish,
      _metadata: string,
      overrides?: Overrides
    ): Promise<BigNumber>;

    implementation(overrides?: CallOverrides): Promise<BigNumber>;

    "implementation()"(overrides?: CallOverrides): Promise<BigNumber>;
  };

  populateTransaction: {
    create(
      _owner: string,
      _beneficiary: string,
      _window: BigNumberish,
      _metadata: string,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    "create(address,address,uint96,string)"(
      _owner: string,
      _beneficiary: string,
      _window: BigNumberish,
      _metadata: string,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    implementation(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    "implementation()"(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;
  };
}
