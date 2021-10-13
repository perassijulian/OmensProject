// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract OmensToken is ERC20, Ownable {

    uint256 public treasuryPercentage = 2; 
    address public treasuryAddress = 0xc52416eeED3942e7A1a6A9b4f3eCd437d3bC034F; // function changeTreasuryAddress?

    /// @notice An event thats emitted when the percentage that goes to treasury in every transaction changes
    event TreasuryPercentageChanged(uint previousPercentage, uint newPercentage);

    constructor (uint256 _initialSupply) ERC20("Omens", "OMN") {
        _mint(msg.sender, _initialSupply);
    }

    /**
     * @notice change the percentage that is going to be minted to Omens Treasury on each transfer
     * @param _newTreasuryPercentage new percentage
     */
    function changeTreasuryPercentaje(uint256 _newTreasuryPercentage) public onlyOwner {
        treasuryPercentage = _newTreasuryPercentage;

        emit TreasuryPercentageChanged(treasuryPercentage, _newTreasuryPercentage);
    }

    function _mintTreasury(uint256 _value) internal {
        _mint(treasuryAddress, _value * treasuryPercentage /100 );
    }

    function _transfer (address from, address to, uint256 value) internal override {
        _mintTreasury(value);
        super._transfer(from, to, value);
    }
}