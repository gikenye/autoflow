const hre = require("hardhat");

async function main() {
  console.log("deploying...");
  const MarketInteractions = await hre.ethers.getContractFactory(
    "MarketInteractions"
  );
  const marketInteractions = await MarketInteractions.deploy(
    "0x012bAC54348C0E635dCAc9D5FB99f06F24136C9A"
  );

  await marketInteractions.deployed();

  console.log(
    "MarketInteractions loan contract deployed: ",
    marketInteractions.address
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
