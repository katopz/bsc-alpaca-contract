import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers, upgrades } from "hardhat";
import {
  SingleAssetWorkerConfig,
  SingleAssetWorkerConfig__factory,
  Timelock__factory,
  WorkerConfig__factory,
} from "../../../../typechain";
import { getConfig } from "../../../entities/config";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const config = getConfig();
  /*
  ░██╗░░░░░░░██╗░█████╗░██████╗░███╗░░██╗██╗███╗░░██╗░██████╗░
  ░██║░░██╗░░██║██╔══██╗██╔══██╗████╗░██║██║████╗░██║██╔════╝░
  ░╚██╗████╗██╔╝███████║██████╔╝██╔██╗██║██║██╔██╗██║██║░░██╗░
  ░░████╔═████║░██╔══██║██╔══██╗██║╚████║██║██║╚████║██║░░╚██╗
  ░░╚██╔╝░╚██╔╝░██║░░██║██║░░██║██║░╚███║██║██║░╚███║╚██████╔╝
  ░░░╚═╝░░░╚═╝░░╚═╝░░╚═╝╚═╝░░╚═╝╚═╝░░╚══╝╚═╝╚═╝░░╚══╝░╚═════╝░
  Check all variables below before execute the deployment script
  */
  const TO_BE_UPGRADE_WORKER_CONFIG = config.SharedConfig.PancakeswapSingleAssetWorkerConfig;
  const EXACT_ETA = "1629549000";

  /*




  
  */

  const timelock = Timelock__factory.connect(config.Timelock, (await ethers.getSigners())[0]);

  console.log(`>> Upgrading Worker at ${TO_BE_UPGRADE_WORKER_CONFIG} through Timelock + ProxyAdmin`);
  const NewSingleAssetWorkerConfig = (await ethers.getContractFactory(
    "SingleAssetWorkerConfig"
  )) as SingleAssetWorkerConfig__factory;
  const preparedNewSingleAssetWorkerConfig = await upgrades.prepareUpgrade(
    TO_BE_UPGRADE_WORKER_CONFIG,
    NewSingleAssetWorkerConfig
  );
  console.log(`>> New implementation deployed at: ${preparedNewSingleAssetWorkerConfig}`);
  console.log("✅ Done");

  console.log(`>> Queue tx on Timelock to upgrade the implementation`);
  await timelock.queueTransaction(
    config.ProxyAdmin,
    "0",
    "upgrade(address,address)",
    ethers.utils.defaultAbiCoder.encode(
      ["address", "address"],
      [TO_BE_UPGRADE_WORKER_CONFIG, preparedNewSingleAssetWorkerConfig]
    ),
    EXACT_ETA,
    { gasPrice: 100000000000 }
  );
  console.log("✅ Done");

  console.log(`>> Generate executeTransaction:`);
  console.log(
    `await timelock.executeTransaction('${config.ProxyAdmin}', '0', 'upgrade(address,address)', ethers.utils.defaultAbiCoder.encode(['address','address'], ['${TO_BE_UPGRADE_WORKER_CONFIG}','${preparedNewSingleAssetWorkerConfig}']), ${EXACT_ETA})`
  );
  console.log("✅ Done");
};

export default func;
func.tags = ["UpgradeSingleAssetWorkerConfig"];
