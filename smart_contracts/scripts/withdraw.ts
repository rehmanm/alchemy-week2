// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { Provider } from '@ethersproject/abstract-provider';

import { Wallet } from 'ethers';
import {
  BytesLike,
  isBytesLike,
  SigningKey
} from 'ethers/lib/utils';
import { ethers } from 'hardhat';

import abi from '../artifacts/contracts/BuyMeACoffee.sol/BuyMeACoffee.json';
import {
  BuyMeACoffee,
  BuyMeACoffee__factory
} from '../typechain';

async function getBalance(provider: Provider, address: string) {
  const balanceBigInt = await provider.getBalance(address);
  return ethers.utils.formatEther(balanceBigInt);
}

async function main() {
  const contractAddress = "0x4185ab3248e2c01619DA24ACdFE9e77849703142";
  const contractABI = abi.abi;

  const provider: Provider = new ethers.providers.AlchemyProvider(
    "goerli",
    process.env.GOERLI_API_KEY
  );
  const bytesLike = process.env.PRIVATE_KEY ?? "";
  const signer: Wallet = new ethers.Wallet(bytesLike, provider);

  const buyMeACoffee = new ethers.Contract(
    contractAddress,
    contractABI,
    signer
  );

  console.log(
    "current balance of owner",
    await getBalance(provider, signer.address)
  );
  const contractBalance = await getBalance(provider, buyMeACoffee.address);
  console.log("Current Balance of Contract", contractBalance);

  // Withdraw funds if there are funds to withdraw.
  if (contractBalance !== "0.0") {
    console.log("withdrawing funds..");
    const withdrawTxn = await buyMeACoffee.withDrawTips();
    await withdrawTxn.wait();
  } else {
    console.log("no funds to withdraw!");
  }

  // Check ending balance.
  console.log(
    "current balance of owner: ",
    await getBalance(provider, signer.address),
    "ETH"
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
