require("@nomicfoundation/hardhat-ethers");
require("@nomicfoundation/hardhat-verify");
require("dotenv").config();

const accounts = process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [];

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      // cancun: required by OZ 5.6+ (Bytes.sol uses mcopy). Robinhood Chain
      // 4663 verified Cancun-capable 2026-08-19 via an eth_call
      // state-override mcopy probe. Live contracts are unaffected — this
      // governs future compiles only.
      evmVersion: "cancun",
      optimizer: { enabled: true, runs: 200 },
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    robinhood: {
      url:
        process.env.RH_RPC_URL ||
        process.env.RPC_URL ||
        "https://rpc.mainnet.chain.robinhood.com",
      chainId: 4663,
      accounts,
    },
    robinhoodTestnet: {
      url:
        process.env.RH_TESTNET_RPC_URL ||
        "https://rpc.testnet.chain.robinhood.com",
      chainId: 46630,
      accounts,
    },
  },
  etherscan: {
    apiKey: {
      robinhood: "blockscout",
      robinhoodTestnet: "blockscout",
    },
    customChains: [
      {
        network: "robinhood",
        chainId: 4663,
        urls: {
          apiURL: "https://robinhoodchain.blockscout.com/api",
          browserURL: "https://robinhoodchain.blockscout.com",
        },
      },
      {
        network: "robinhoodTestnet",
        chainId: 46630,
        urls: {
          apiURL: "https://explorer.testnet.chain.robinhood.com/api",
          browserURL: "https://explorer.testnet.chain.robinhood.com",
        },
      },
    ],
  },
  sourcify: { enabled: false },
  paths: {
    tests: "./test/contracts",
  },
};
