//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.1;


contract Proxy {
  address public immutable implementation;

  constructor(address _implementation) {
    implementation = _implementation;
  }

  fallback () external payable {
    address _impl = implementation;

    assembly {
      let ptr := mload(0x40)
      calldatacopy(ptr, 0, calldatasize())
      let result := delegatecall(gas(), _impl, ptr, calldatasize(), 0, 0)
      let size := returndatasize()
      returndatacopy(ptr, 0, size)

      switch result
      case 0 { revert(ptr, size) }
      default { return(ptr, size) }
    }
  }

  receive () external payable { }
}
