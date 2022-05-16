//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

//Deployed to Goerli at 0x4185ab3248e2c01619DA24ACdFE9e77849703142

import "hardhat/console.sol";

contract BuyMeACoffee {

    event NewMemo(
        address indexed from,
        uint256 timestamp,
        string name,
        string message
    );

    struct Memo {
        address from;
        uint256 timestamp;
        string name;
        string message;
    }

    address payable owner;

    Memo[] memos;

    constructor(){
        owner = payable(msg.sender);
    }

    function getMemos() public view returns (Memo[] memory) {
        return memos;
    }

    function buyCoffee(string memory _name, string memory _message) public payable {
        require(msg.value > 0, "Can't buy Coffee for Free");

        memos.push(Memo(msg.sender, block.timestamp, _name, _message));
        emit NewMemo(msg.sender, block.timestamp, _name, _message);
    }

    function withDrawTips() public {
        require(owner.send(address(this).balance));
    }
}