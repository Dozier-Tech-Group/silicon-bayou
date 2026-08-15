const { writeFileSync, mkdirSync, existsSync, readFileSync } = require("fs");
const { join } = require("path");
const hre = require("hardhat");

const DEPLOY_PATH = join(__dirname, "..", "deployments", "robinhood.json");
const EXPLORER = {
  robinhood: "https://robinhoodchain.blockscout.com",
  robinhoodTestnet: "https://explorer.testnet.chain.robinhood.com",
};

const GITHUB_METADATA =
  "https://raw.githubusercontent.com/Dozier-Tech-Group/silicon-bayou/master/metadata/";

function loadDeploy() {
  if (!existsSync(DEPLOY_PATH)) return {};
  return JSON.parse(readFileSync(DEPLOY_PATH, "utf8"));
}

async function main() {
  if (process.env.GENESIS_ART_READY !== "1") {
    throw new Error(
      "HOLD: hybrid genesis art is not marked ready. Do not deploy-mint photoreal gators or generator/out pixels. Set GENESIS_ART_READY=1 only after the new art/gators/*.png land."
    );
  }

  const [deployer] = await hre.ethers.getSigners();
  if (!deployer) {
    throw new Error("No signer. Set PRIVATE_KEY in .env (never paste the key into chat).");
  }

  const baseURI = process.env.BASE_URI || GITHUB_METADATA;
  if (/generator[\\/]+out/i.test(baseURI)) {
    throw new Error("Refusing BASE_URI that points at generator/out — HD portraits only (metadata/images/1-4)");
  }
  if (!baseURI.endsWith("/")) {
    throw new Error("BASE_URI must end with /");
  }

  const recipient = process.env.MINT_TO || deployer.address;
  const explorer = EXPLORER[hre.network.name] || EXPLORER.robinhood;
  const balance = await hre.ethers.provider.getBalance(deployer.address);

  console.log("Network :", hre.network.name);
  console.log("Chain ID:", hre.network.config.chainId);
  console.log("Deployer:", deployer.address);
  console.log("Balance :", hre.ethers.formatEther(balance), "ETH");
  console.log("Mint to :", recipient);
  console.log("Base URI:", baseURI);
  console.log("Art     : metadata/images/1-4.png (HD heroes). NOT generator/out.");

  if (balance === 0n) {
    throw new Error(
      "Deployer wallet has 0 ETH on this network. Bridge ETH to Robinhood Chain, then rerun npm run deploy:mainnet."
    );
  }

  const factory = await hre.ethers.getContractFactory("SiliconBayou");
  const nft = await factory.deploy(baseURI);
  const deployTx = nft.deploymentTransaction();
  await nft.waitForDeployment();
  const address = await nft.getAddress();
  const deployReceipt = await deployTx.wait();

  console.log("SiliconBayou deployed:", address);
  console.log("Deploy tx:", deployReceipt.hash);

  const mintTx = await nft.mintBatch(recipient, 4);
  const mintReceipt = await mintTx.wait();
  console.log("Minted tokens 1-4 in tx:", mintReceipt.hash);
  console.log("Next token id:", (await nft.nextTokenId()).toString());
  console.log("tokenURI(1):", await nft.tokenURI(1));

  const record = {
    ...loadDeploy(),
    network: hre.network.name,
    chainId: hre.network.config.chainId,
    status: "deployed",
    address,
    deployer: deployer.address,
    mintedTo: recipient,
    tokenIds: [1, 2, 3, 4],
    baseURI,
    art: "metadata/images/1-4.png (HD hero portraits). Excluded: generator/out.",
    deployTx: deployReceipt.hash,
    mintTx: mintReceipt.hash,
    explorer: `${explorer}/address/${address}`,
    explorerDeployTx: `${explorer}/tx/${deployReceipt.hash}`,
    explorerMintTx: `${explorer}/tx/${mintReceipt.hash}`,
    openseaCollection: `https://opensea.io/assets/robinhood/${address}`,
    openseaItem: `https://opensea.io/item/robinhood/${address}/1`,
    openseaChainBrowse: "https://opensea.io/collections/chain/robinhood",
  };

  mkdirSync(join(__dirname, "..", "deployments"), { recursive: true });
  writeFileSync(DEPLOY_PATH, JSON.stringify(record, null, 2) + "\n");
  console.log("Wrote", DEPLOY_PATH);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
