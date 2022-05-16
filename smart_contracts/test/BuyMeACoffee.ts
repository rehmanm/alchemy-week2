import { expect } from 'chai';
import { ethers } from 'hardhat';

import {
  BuyMeACoffee,
  BuyMeACoffee__factory
} from '../typechain';

describe("BuyMeACoffee", function () {
  let BuyMeACoffeeFactory: BuyMeACoffee__factory;
  let buyMeACoffee: BuyMeACoffee;
  beforeEach(async function () {
    BuyMeACoffeeFactory = await ethers.getContractFactory("BuyMeACoffee");
    buyMeACoffee = await BuyMeACoffeeFactory.deploy();
    await buyMeACoffee.deployed();
  });
  it("Should buy the coffee", async function () {
    const setGreetingTx = await buyMeACoffee.buyCoffee("test", "my message", {
      value: ethers.utils.parseEther("1"),
    });
    await setGreetingTx.wait();
    expect((await buyMeACoffee.getMemos()).length).to.equal(1);
  });

  it("Should'nt buy the coffee", async function () {
    await expect(
      buyMeACoffee.buyCoffee("test", "my message")
    ).to.be.revertedWith("Can't buy Coffee for Free");
    expect((await buyMeACoffee.getMemos()).length).to.equal(0);
  });
});
