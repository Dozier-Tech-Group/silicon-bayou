const { writeFileSync, mkdirSync, existsSync, readFileSync } = require("fs");
const { join } = require("path");
const hre = require("hardhat");

const DEPLOY_PATH = join(__dirname, "..", "deployments", "robinhood.json");
const EXPLORER = {
  robinhood: "https://robinhoodchain.blockscout.com",
  robinhoodTestnet: "https://explorer.testnet.chain.robinhood.com",
};

const GITHUB_METADATA =
  "https://raw.githubusercontent.com/Dozier-Tech-Group/silicon-bayou/master/metadata/swamp/";

function loadDeploy() {
  if (!existsSync(DEPLOY_PATH)) return {};
  return JSON.parse(readFileSync(DEPLOY_PATH, "utf8"));
}

// Pre-deploy handoff fields; must not survive into a deploy record, or the
// record claims "deployed" while its own next step instructs another deploy.
const STALE_KEYS = ["blockers", "next", "mintTo"];

function saveRecord(fields) {
  const prior = loadDeploy();
  for (const key of STALE_KEYS) delete prior[key];
  const record = { ...prior, ...fields };
  mkdirSync(join(__dirname, "..", "deployments"), { recursive: true });
  writeFileSync(DEPLOY_PATH, JSON.stringify(record, null, 2) + "\n");
  return record;
}

async function main() {
  if (process.env.GENESIS_ART_READY !== "1") {
    throw new Error(
      "HOLD: swamp-gator art is not marked ready. Set GENESIS_ART_READY=1 after art/swamp-222/1-198.png land."
    );
  }

  const prior = loadDeploy();
  if (prior.address && process.env.REDEPLOY !== "1") {
    throw new Error(
      `Refusing to deploy: deployments/robinhood.json already records contract ${prior.address}` +
        ` (status: ${prior.status || "unknown"}). A rerun would deploy a SECOND contract and mint duplicate tokens.` +
        " To finish a partial deploy use npm run mint:genesis / npm run freeze-uri (they read the recorded address)." +
        " Only set REDEPLOY=1 if you truly want a brand-new contract."
    );
  }

  const [deployer] = await hre.ethers.getSigners();
  if (!deployer) {
    throw new Error("No signer. Set PRIVATE_KEY in .env (never paste the key into chat).");
  }

  const baseURI = process.env.BASE_URI || GITHUB_METADATA;
  if (/generator[\\/]+out/i.test(baseURI)) {
      throw new Error("Refusing BASE_URI that points at generator/out — swamp gators only (art/swamp-222)");
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
  console.log("Art     : art/swamp-222/1-198.png. NOT generator/out.");

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

  // Persist the address the moment it exists, so a mid-run failure never
  // strands a live contract with no on-disk record (recovery scripts read it).
  saveRecord({
    network: hre.network.name,
    chainId: hre.network.config.chainId,
    status: "deployed_mint_pending",
    address,
    deployer: deployer.address,
    baseURI,
    deployTx: deployReceipt.hash,
    explorer: `${explorer}/address/${address}`,
    explorerDeployTx: `${explorer}/tx/${deployReceipt.hash}`,
  });

  const supply = Number(await nft.MAX_SUPPLY());
  const batchSize = Number(await nft.MAX_BATCH());
  const mintTxs = [];
  while (true) {
    const next = Number(await nft.nextTokenId());
    if (next > supply) break;
    const count = Math.min(batchSize, supply - next + 1);
    const mintTx = await nft.mintBatch(recipient, count);
    const mintReceipt = await mintTx.wait();
    mintTxs.push(mintReceipt.hash);
    console.log(`Minted ${count} tokens in tx:`, mintReceipt.hash);
  }
  console.log("Next token id:", (await nft.nextTokenId()).toString());
  console.log("tokenURI(1):", await nft.tokenURI(1));

  saveRecord({
    status: "minted_freeze_pending",
    mintedTo: recipient,
    tokenIds: Array.from({ length: supply }, (_, i) => i + 1),
    mintTx: mintTxs[0],
    mintTxs,
    explorerMintTx: `${explorer}/tx/${mintTxs[0]}`,
  });

  const freezeTx = await nft.freezeURI();
  const freezeReceipt = await freezeTx.wait();
  console.log("URI frozen in tx:", freezeReceipt.hash);

  saveRecord({
    status: "deployed",
    art: "art/swamp-222/1-198.png swamp gators. Excluded: generator/out.",
    freezeURITx: freezeReceipt.hash,
    uriFrozen: true,
    openseaCollection: `https://opensea.io/assets/robinhood/${address}`,
    openseaItem: `https://opensea.io/item/robinhood/${address}/1`,
    openseaChainBrowse: "https://opensea.io/collections/chain/robinhood",
    next: "2-step transferOwnership to a Gnosis Safe on chain 4663 (SECURITY.md). Do NOT run deploy:mainnet again.",
  });
  console.log("Wrote", DEPLOY_PATH);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
