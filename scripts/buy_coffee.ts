// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import {
  ethers,
  waffle
} from 'hardhat';

import {
  BuyMeACoffee,
  BuyMeACoffee__factory
} from '../typechain';

async function getBalance(address: string) {
  const balanceInBigInt = await waffle.provider.getBalance(address);
  return ethers.utils.formatEther(balanceInBigInt);
}

async function printBalances(addresses: string[]) {
  let idx = 0;
  for (const address of addresses) {
    console.log(`Address ${idx++} balance`, await getBalance(address));
  }
}

//TODO: find way to refrence struct directly, so it could be used as type
async function printMemos(memos: any) {
  for (const memo of memos) {
    const timestamp = memo.timestamp;
    const tipper = memo.name;
    const tipperAddress = memo.from;
    const message = memo.message;

    console.log(`At ${timestamp}, ${tipper} ${tipperAddress} said ${message}`);
  }
}

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  //Get accounts
  const [owner, tipper, tipper1, tipper2] = await ethers.getSigners();

  // We get the contract to deploy
  const BuyMeACoffeeFactory: BuyMeACoffee__factory =
    await ethers.getContractFactory("BuyMeACoffee");
  const buyMeACoffee: BuyMeACoffee = await BuyMeACoffeeFactory.deploy();

  await buyMeACoffee.deployed();

  console.log("BuyMeACoffee deployed to:", buyMeACoffee.address);

  // Check balances before the coffee purchase.
  const addresses = [
    owner.address,
    tipper.address,
    tipper1.address,
    tipper2.address,
    buyMeACoffee.address,
  ];
  console.log("===start===");
  await printBalances(addresses);

  // Buy the owner a few coffees.
  const tip = { value: ethers.utils.parseEther("1") };
  await buyMeACoffee
    .connect(tipper)
    .buyCoffee("Carolina", "You are the best", tip);
  await buyMeACoffee.connect(tipper1).buyCoffee("Vitto", "Best teacher", tip);
  await buyMeACoffee
    .connect(tipper2)
    .buyCoffee("Kay", "I love my Proof of Knowledge", tip);

  // Check balances after the coffee purchase.
  console.log("===bought coffee===");
  await printBalances(addresses);

  // Withdraw.
  await buyMeACoffee.connect(owner).withDrawTips();

  // Check balances after withdrawal.
  console.log("== withdrawTips ==");
  await printBalances(addresses);

  // Check out the memos.
  console.log("== memos ==");
  const memos = await buyMeACoffee.getMemos();
  await printMemos(memos);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
