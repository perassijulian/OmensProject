const OmensToken = artifacts.require("OmensToken");

module.exports = function (deployer) {
  deployer.deploy(OmensToken, web3.utils.toWei('1'));
};