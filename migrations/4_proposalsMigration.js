const Proposals = artifacts.require("Proposals");

module.exports = function (deployer) {
  deployer.deploy(Proposals, '0xFB6dcaF62D593F59953Cd0f9F87962Fe79D4841C', '0xFB6dcaF62D593F59953Cd0f9F87962Fe79D4841C');
};