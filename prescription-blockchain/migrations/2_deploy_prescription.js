const Prescription = artifacts.require("Prescription");

module.exports = function(deployer) {
  deployer.deploy(Prescription);
};