import React, { useEffect, useState } from "react";
import styles from "./metamask-auth.module.css";
import Web3 from "web3";
import axios from "axios";
const apiExplorerEndpoint = "http://localhost:3002";

function isMobileDevice() {
  return "ontouchstart" in window || "onmsgesturechange" in window;
}

async function connect(onConnected) {
  if (!window.ethereum) {
    alert("Get MetaMask!");
    return;
  }

  const accounts = await window.ethereum.request({
    method: "eth_requestAccounts",
  });

  onConnected(accounts[0]);
}

async function checkIfWalletIsConnected(onConnected) {
  if (window.ethereum) {
    const accounts = await window.ethereum.request({
      method: "eth_accounts",
    });

    if (accounts.length > 0) {
      const account = accounts[0];
      onConnected(account);
      return;
    }

    if (isMobileDevice()) {
      await connect(onConnected);
    }
  }
}

export default function MetaMaskAuth({ onAddressChanged }) {
  let web3;
  const [userAddress, setUserAddress] = useState("");

  useEffect(() => {
    checkIfWalletIsConnected(setUserAddress);
    // initWeb3();
  }, []);

  useEffect(() => {
    onAddressChanged(userAddress);
    if (userAddress) {
      getNonceAndSignature(userAddress);
    }
  }, [userAddress]);

  // const initWeb3 = async () => {
  //   if (!web3) {
  //     try {
  //       // Request account access if needed
  //       await window.ethereum.enable();

  //       // We don't know window.web3 version, so we use our own instance of Web3
  //       // with the injected provider given by MetaMask
  //       web3 = new Web3(window.ethereum);
  //     } catch (error) {
  //       window.alert("You need to allow MetaMask.");
  //       return;
  //     }
  //   }
  // };

  const handleSignMessage = async ({ PublicAddress, Nonce }) => {
    let message = `Welcome!
      Click “Sign” to sign in. No password needed!

      Wallet address:
      ${PublicAddress}
      
      Nonce:
      ${Nonce}`

    //MetaMask Pop is opened
    if (!web3) {
      try {
        // Request account access if needed
        await window.ethereum.enable();

        // We don't know window.web3 version, so we use our own instance of Web3
        // with the injected provider given by MetaMask
        web3 = new Web3(window.ethereum);
      } catch (error) {
        window.alert("You need to allow MetaMask.");
        return;
      }
    }

    console.log("message", message);
    console.log("web3", web3);
    console.log("web3.eth.personal", web3.eth.personal);

    const signature = await web3.eth.personal.sign(message, PublicAddress);
    console.log("signature", signature);

    const resp = await axios.post(
      `${apiExplorerEndpoint}/api/v2/verifySignature`,
      {
        publicAddress: PublicAddress,
        appId: "7f75bf5c-d56c-4f3d-8bdb-454b04f92861",
        signature,
      }
    );

    console.log("resp sign",resp);

    return { PublicAddress, signature };
  };

  const getNonceAndSignature = async (publicAddress) => {
    const resp = await axios.post(`${apiExplorerEndpoint}/api/v2/getNonce`, {
      publicAddress,
      appId: "7f75bf5c-d56c-4f3d-8bdb-454b04f92861",
    });

    console.log("resp", resp);
    await handleSignMessage(resp.data);
  };

  return userAddress ? (
    <div>
      Connected with <Address userAddress={userAddress} />
    </div>
  ) : (
    <Connect setUserAddress={setUserAddress} />
  );
}

function Connect({ setUserAddress }) {
  if (isMobileDevice()) {
    const dappUrl = "metamask-auth.ilamanov.repl.co"; // TODO enter your dapp URL. For example: https://uniswap.exchange. (don't enter the "https://")
    const metamaskAppDeepLink = "https://metamask.app.link/dapp/" + dappUrl;
    return (
      <a href={metamaskAppDeepLink}>
        <button className={styles.button}>Connect to MetaMask</button>
      </a>
    );
  }

  return (
    <button className={styles.button} onClick={() => connect(setUserAddress)}>
      Connect to MetaMask
    </button>
  );
}

function Address({ userAddress }) {
  return (
    <span className={styles.address}>
      {userAddress.substring(0, 5)}…
      {userAddress.substring(userAddress.length - 4)}
    </span>
  );
}
