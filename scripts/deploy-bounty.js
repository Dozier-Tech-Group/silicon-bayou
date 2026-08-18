const { writeFileSync, mkdirSync, existsSync, readFileSync } = require("fs");
const { join } = require("path");
const hre = require("hardhat");

const LIVE_BAYOU = "0xA81aEd6f3a5Faea95197786ba162e706Fd938d20";
const CANONICAL_USDG = "0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168";
const DEFAULT_TREASURY = "0x29486Fc6B2E7184Dd4aF4d310D4f85F4262fD11d";
const RECORD_PATH = join(__dirname, "..", "deployments", "credits.json");

function loadRecord() {
  if (!existsSync(RECORD_PATH)) return {};
  return JSON.parse(readFileSync(RECORD_PATH, "utf8"));
}

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  if (!deployer) {
    throw new Error("No signer. Set PRIVATE_KEY in .env (never paste the key into chat).");
  }

  const prior = loadRecord();
  if (prior.credit && process.env.REDEPLOY !== "1") {
    throw new Error(
      `Refusing to deploy: deployments/credits.json already records MergedCredit ${prior.credit}. ` +
        "Set REDEPLOY=1 only if you truly want a second credit token.",
    );
  }

  const bayou = process.env.BAYOU_ADDRESS || LIVE_BAYOU;
  const usdg = process.env.USDG_ADDRESS || CANONICAL_USDG;
  const treasury = process.env.TREASURY || process.env.MINT_TO || DEFAULT_TREASURY;
  const takeBps = Number(process.env.ACCESS_TAKE_BPS || 3000);

  if (!hre.ethers.isAddress(bayou) || bayou === hre.ethers.ZeroAddress) {
    throw new Error("BAYOU_ADDRESS must be the live Silicon Bayou contract.");
  }
  if (hre.network.name === "robinhood" && usdg.toLowerCase() !== CANONICAL_USDG.toLowerCase()) {
    throw new Error(`Mainnet USDG must be canonical ${CANONICAL_USDG}`);
  }
  if (takeBps < 2000 || takeBps > 4000) {
    throw new Error("ACCESS_TAKE_BPS must be 2000–4000 (20–40%).");
  }

  console.log("Network :", hre.network.name);
  console.log("Deployer:", deployer.address);
  console.log("Bayou   :", bayou);
  console.log("USDG    :", usdg);
  console.log("Treasury:", treasury);
  console.log("Take    :", takeBps, "bps → community pool (not holder yield)");

  const creditFactory = await hre.ethers.getContractFactory("MergedCredit");
  const credit = await creditFactory.deploy();
  await credit.waitForDeployment();
  const creditAddress = await credit.getAddress();
  console.log("MergedCredit deployed:", creditAddress);

  const boardFactory = await hre.ethers.getContractFactory("BountyBoard");
  const board = await boardFactory.deploy(creditAddress, bayou);
  await board.waitForDeployment();
  const boardAddress = await board.getAddress();
  console.log("BountyBoard deployed:", boardAddress);

  const deskFactory = await hre.ethers.getContractFactory("AccessDesk");
  const desk = await deskFactory.deploy(usdg, creditAddress, treasury, takeBps);
  await desk.waitForDeployment();
  const deskAddress = await desk.getAddress();
  console.log("AccessDesk deployed:", deskAddress);

  const record = {
    network: hre.network.name,
    chainId: hre.network.config.chainId,
    bayou,
    usdg,
    treasury,
    takeBps,
    credit: creditAddress,
    bountyBoard: boardAddress,
    accessDesk: deskAddress,
    note: "MC + AccessDesk. USDG take 20–40% community pool; rest to treasury. Grants are discretionary — not APY, not a BAYOU entitlement.",
    deployedAt: new Date().toISOString(),
  };
  mkdirSync(join(__dirname, "..", "deployments"), { recursive: true });
  writeFileSync(RECORD_PATH, JSON.stringify(record, null, 2) + "\n");
  console.log("Wrote deployments/credits.json");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
