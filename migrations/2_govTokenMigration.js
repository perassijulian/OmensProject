const GovToken = artifacts.require("GovToken");

module.exports = function (deployer) {
  deployer.deploy(GovToken, web3.utils.toWei('100000'));
};