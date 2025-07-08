const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Web3Todo", function () {
    let Web3Todo;
    let web3Todo;
    let owner;
    let user1;
    let user2;
    
    beforeEach(async function () {
        [owner, user1, user2] = await ethers.getSigners();
        
        Web3Todo = await ethers.getContractFactory("Web3Todo");
        web3Todo = await Web3Todo.deploy();
        await web3Todo.deployed();
    });
    
    describe("Deployment", function () {
        it("Should set the right owner", async function () {
            expect(await web3Todo.owner()).to.equal(owner.address);
        });
        
        it("Should initialize with zero tasks", async function () {
            expect(await web3Todo.totalTasksCreated()).to.equal(0);
            expect(await web3Todo.totalTasksCompleted()).to.equal(0);
            expect(await web3Todo.totalWeiStaked()).to.equal(0);
        });
    });
    
    describe("Task Creation", function () {
        it("Should create a task with stake", async function () {
            const taskName = "Test Task";
            const taskDescription = "This is a test task";
            const stakeAmount = ethers.utils.parseEther("0.1");
            
            await expect(
                web3Todo.connect(user1).createTask(taskName, taskDescription, {
                    value: stakeAmount
                })
            ).to.emit(web3Todo, "TaskCreated")
             .withArgs(1, user1.address, taskName, stakeAmount, await getBlockTimestamp());
            
            const task = await web3Todo.getTask(1);
            expect(task.name).to.equal(taskName);
            expect(task.description).to.equal(taskDescription);
            expect(task.owner).to.equal(user1.address);
            expect(task.weiValue).to.equal(stakeAmount);
            expect(task.isCompleted).to.be.false;
        });
        
        it("Should fail to create task without stake", async function () {
            await expect(
                web3Todo.connect(user1).createTask("Test", "Description", {
                    value: 0
                })
            ).to.be.revertedWith("Valor em Wei deve ser maior que zero");
        });
        
        it("Should fail to create task with empty name", async function () {
            await expect(
                web3Todo.connect(user1).createTask("", "Description", {
                    value: ethers.utils.parseEther("0.1")
                })
            ).to.be.revertedWith("Nome da tarefa nao pode estar vazio");
        });
    });
    
    describe("Task Completion", function () {
        beforeEach(async function () {
            await web3Todo.connect(user1).createTask("Test Task", "Description", {
                value: ethers.utils.parseEther("0.1")
            });
        });
        
        it("Should complete a task and transfer reward", async function () {
            const initialBalance = await user1.getBalance();
            
            const tx = await web3Todo.connect(user1).completeTask(1);
            const receipt = await tx.wait();
            const gasUsed = receipt.gasUsed.mul(receipt.effectiveGasPrice);
            
            const finalBalance = await user1.getBalance();
            const expectedReward = ethers.utils.parseEther("0.098"); // 0.1 - 2% fee
            
            expect(finalBalance.add(gasUsed).sub(initialBalance)).to.be.closeTo(
                expectedReward,
                ethers.utils.parseEther("0.001")
            );
            
            const task = await web3Todo.getTask(1);
            expect(task.isCompleted).to.be.true;
        });
        
        it("Should fail to complete task twice", async function () {
            await web3Todo.connect(user1).completeTask(1);
            
            await expect(
                web3Todo.connect(user1).completeTask(1)
            ).to.be.revertedWith("Tarefa ja foi completada");
        });
        
        it("Should fail to complete task by non-owner", async function () {
            await expect(
                web3Todo.connect(user2).completeTask(1)
            ).to.be.revertedWith("Apenas o proprietario da tarefa pode executar esta acao");
        });
    });
    
    describe("Task Cancellation", function () {
        beforeEach(async function () {
            await web3Todo.connect(user1).createTask("Test Task", "Description", {
                value: ethers.utils.parseEther("0.1")
            });
        });
        
        it("Should cancel task with penalty", async function () {
            const initialBalance = await user1.getBalance();
            
            const tx = await web3Todo.connect(user1).cancelTask(1);
            const receipt = await tx.wait();
            const gasUsed = receipt.gasUsed.mul(receipt.effectiveGasPrice);
            
            const finalBalance = await user1.getBalance();
            const expectedRefund = ethers.utils.parseEther("0.09"); // 0.1 - 10% penalty
            
            expect(finalBalance.add(gasUsed).sub(initialBalance)).to.be.closeTo(
                expectedRefund,
                ethers.utils.parseEther("0.001")
            );
        });
    });
    
    describe("User Statistics", function () {
        beforeEach(async function () {
            // Criar algumas tarefas
            await web3Todo.connect(user1).createTask("Task 1", "Description 1", {
                value: ethers.utils.parseEther("0.1")
            });
            await web3Todo.connect(user1).createTask("Task 2", "Description 2", {
                value: ethers.utils.parseEther("0.2")
            });
            
            // Completar uma tarefa
            await web3Todo.connect(user1).completeTask(1);
        });
        
        it("Should return correct user statistics", async function () {
            const stats = await web3Todo.getUserStats(user1.address);
            
            expect(stats.totalTasks).to.equal(2);
            expect(stats.completedTasks).to.equal(1);
            expect(stats.pendingTasks).to.equal(1);
            expect(stats.totalStaked).to.equal(ethers.utils.parseEther("0.2"));
            expect(stats.totalEarned).to.equal(ethers.utils.parseEther("0.098"));
        });
    });
    
    describe("Global Statistics", function () {
        beforeEach(async function () {
            await web3Todo.connect(user1).createTask("Task 1", "Description 1", {
                value: ethers.utils.parseEther("0.1")
            });
            await web3Todo.connect(user2).createTask("Task 2", "Description 2", {
                value: ethers.utils.parseEther("0.2")
            });
            
            await web3Todo.connect(user1).completeTask(1);
        });
        
        it("Should return correct global statistics", async function () {
            const stats = await web3Todo.getGlobalStats();
            
            expect(stats._totalTasksCreated).to.equal(2);
            expect(stats._totalTasksCompleted).to.equal(1);
            expect(stats._totalWeiStaked).to.equal(ethers.utils.parseEther("0.2"));
            expect(stats._contractBalance).to.equal(ethers.utils.parseEther("0.002"));
        });
    });
    
    async function getBlockTimestamp() {
        const blockNumber = await ethers.provider.getBlockNumber();
        const block = await ethers.provider.getBlock(blockNumber);
        return block.timestamp;
    }
});