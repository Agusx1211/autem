//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.1;

import "./Autem.sol";
import "./Proxy.sol";


contract Factory {
  Autem public immutable implementation;

  constructor() {
    implementation = new Autem();
  }

  function create(
    address _owner,
    address _beneficiary,
    uint96  _window,
    string calldata _metadata
  ) external {
    bytes32 salt = keccak256(
      abi.encode(
        _owner,
        _beneficiary,
        _window,
        _metadata
      )
    );

    Proxy proxy = new Proxy{ salt: salt }(address(implementation));
    assert(Autem(payable(proxy)).setup(_owner, _beneficiary, _window, _metadata));
  }
}
