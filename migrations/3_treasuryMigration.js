const Treasury = artifacts.require("Treasury");

module.exports = function (deployer) {
  deployer.deploy(Treasury, '0xFB6dcaF62D593F59953Cd0f9F87962Fe79D4841C');
};