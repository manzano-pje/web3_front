// Script de deploy usando Hardhat
const { ethers } = require("hardhat");

async function main() {
    console.log("Iniciando deploy dos contratos Web3 TODO...");
    
    // Obter o deployer
    const [deployer] = await ethers.getSigners();
    console.log("Fazendo deploy com a conta:", deployer.address);
    console.log("Saldo da conta:", (await deployer.getBalance()).toString());
    
    // Deploy do contrato principal Web3Todo
    console.log("\n1. Fazendo deploy do Web3Todo...");
    const Web3Todo = await ethers.getContractFactory("Web3Todo");
    const web3Todo = await Web3Todo.deploy();
    await web3Todo.deployed();
    console.log("Web3Todo deployed to:", web3Todo.address);
    
    // Deploy da Factory
    console.log("\n2. Fazendo deploy do Web3TodoFactory...");
    const Web3TodoFactory = await ethers.getContractFactory("Web3TodoFactory");
    const factory = await Web3TodoFactory.deploy();
    await factory.deployed();
    console.log("Web3TodoFactory deployed to:", factory.address);
    
    // Verificar se os contratos foram deployados corretamente
    console.log("\n3. Verificando contratos...");
    
    // Testar contrato principal
    const owner = await web3Todo.owner();
    console.log("Owner do Web3Todo:", owner);
    
    const factoryOwner = await factory.factoryOwner();
    console.log("Owner da Factory:", factoryOwner);
    
    const creationFee = await factory.creationFee();
    console.log("Taxa de criação da Factory:", ethers.utils.formatEther(creationFee), "ETH");
    
    console.log("\n✅ Deploy concluído com sucesso!");
    console.log("\n📋 Resumo dos contratos:");
    console.log("Web3Todo:", web3Todo.address);
    console.log("Web3TodoFactory:", factory.address);
    
    // Salvar endereços em arquivo para uso no frontend
    const fs = require('fs');
    const contractAddresses = {
        Web3Todo: web3Todo.address,
        Web3TodoFactory: factory.address,
        network: network.name,
        deployedAt: new Date().toISOString()
    };
    
    fs.writeFileSync(
        './src/contracts/addresses.json',
        JSON.stringify(contractAddresses, null, 2)
    );
    
    console.log("\n📁 Endereços salvos em src/contracts/addresses.json");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("Erro durante o deploy:", error);
        process.exit(1);
    });