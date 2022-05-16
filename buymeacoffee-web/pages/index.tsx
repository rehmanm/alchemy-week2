import { ethers } from 'ethers';
import Head from 'next/head';
import Image from 'next/image';
import {
  useEffect,
  useState
} from 'react';

import { Memo } from '../models/memo';
import styles from '../styles/Home.module.css';
import abi from '../utils/BuyMeACoffee.json';

import type { NextPage } from "next";
const Home: NextPage = () => {
  const contractAddress = "0x4185ab3248e2c01619DA24ACdFE9e77849703142";
  const contractABI = abi.abi;

  const [currentAccount, setCurrentAccount] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [memos, setMemos] = useState<Memo[]>([]);
  const [loading, setLoading] = useState(false);

  const OnNameChange = (event: any) => {
    setName(event.target.value);
  };

  const OnMessageChange = (event: any) => {
    setMessage(event.target.value);
  };

  const isWalletConnected = async () => {
    try {
      const { ethereum } = window;
      const accounts = await ethereum.request({ method: "eth_accounts" });
      console.log(accounts);
    } catch (error) {
      console.log(error);
    }
  };

  const connectWallet = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        console.log("Please install MetaMask");
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  const buyCoffee = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        setLoading(true);
        const provider = new ethers.providers.Web3Provider(ethereum, "any");
        const signer = provider.getSigner();
        const buyMeACoffee = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        console.log("buying Coffee");

        const coffeeTxn = await buyMeACoffee.buyCoffee(
          name ? name : "anon",
          message ? message : "Enjoy your coffee",
          { value: ethers.utils.parseEther("0.001") }
        );

        await coffeeTxn.wait();

        console.log("mined", coffeeTxn.hash);
        console.log("coffee purchased");

        setName("");
        setMessage("");
        setLoading(false);
      } else {
        console.log("Metamask is not connected");
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  // Function to fetch all memos stored on-chain.
  const getMemos = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const buyMeACoffee = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        console.log("fetching memos from the blockchain..");
        const memos = await buyMeACoffee.getMemos();
        console.log("fetched!");
        setMemos(memos);
      } else {
        console.log("Metamask is not connected");
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    console.log("Firing Effect");
    let buyMeACoffee: any;
    isWalletConnected();
    getMemos();

    // Create an event handler function for when someone sends
    // us a new memo.
    const onNewMemo = (
      from: any,
      timestamp: number,
      name: any,
      message: any
    ) => {
      let memo: Memo = {
        from,
        timestamp,
        name,
        message,
      };
      console.log("Memo received: ", from, timestamp, name, message);
      setMemos((prevState: Memo[]) => [...prevState, memo]);
    };

    const { ethereum } = window;

    // Listen for new memo events.
    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum, "any");
      const signer = provider.getSigner();
      buyMeACoffee = new ethers.Contract(contractAddress, contractABI, signer);

      buyMeACoffee.on("NewMemo", onNewMemo);
    }

    return () => {
      if (buyMeACoffee) {
        buyMeACoffee.off("NewMemo", onNewMemo);
      }
    };
  }, []);

  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <h1 className={styles.title}>Buy Me A Coffee</h1>
        {currentAccount ? (
          <div>
            <form>
              <div className="formgroup">
                <label>Name</label>
                <br />
                <input
                  id="name"
                  type="text"
                  placeholder="anon"
                  onChange={OnNameChange}
                  required
                  value={name}
                />
              </div>
              <div className="formgroup">
                <label>Send Me a Message</label>
                <br />
                <textarea
                  id="message"
                  placeholder="Enjoy your coffee"
                  onChange={OnMessageChange}
                  rows={3}
                  required
                  value={message}
                ></textarea>
              </div>
              <button type="button" onClick={buyCoffee}>
                Send 1 coffee for 0.001 ETH
              </button>
              {loading && (
                <div className="spinner">
                  <div className="loader"></div>
                </div>
              )}
            </form>
          </div>
        ) : (
          <button onClick={connectWallet}> Connect your wallet </button>
        )}

        {currentAccount && <h1>Memos Received</h1>}

        {currentAccount &&
          memos.map((memo, idx) => {
            return (
              <div
                key={idx}
                style={{
                  border: "2px solid",
                  borderRadius: "5px",
                  padding: "5px",
                  margin: "5px",
                }}
              >
                <p style={{ fontWeight: "bold" }}>&quot;{memo.message}&quot;</p>
                <p>
                  From: {memo.name} at{" "}
                  {new Date(memo.timestamp * 1000).toString()}
                </p>
              </div>
            );
          })}
      </main>

      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{" "}
          <span className={styles.logo}>
            <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
          </span>
        </a>
      </footer>
    </div>
  );
};

export default Home;
