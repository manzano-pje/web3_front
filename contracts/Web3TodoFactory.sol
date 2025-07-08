// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./Web3Todo.sol";

/**
 * @title Web3TodoFactory
 * @dev Factory contract para criar instâncias do Web3Todo para diferentes usuários/organizações
 */
contract Web3TodoFactory {
    
    struct TodoInstance {
        address contractAddress;
        address owner;
        string name;
        uint256 createdAt;
        bool isActive;
    }
    
    mapping(address => address[]) public userContracts;
    mapping(address => TodoInstance) public contractInfo;
    address[] public allContracts;
    
    uint256 public totalContracts;
    address public factoryOwner;
    uint256 public creationFee = 0.001 ether; // Taxa para criar novo contrato
    
    event TodoContractCreated(
        address indexed contractAddress,
        address indexed owner,
        string name,
        uint256 timestamp
    );
    
    modifier onlyFactoryOwner() {
        require(msg.sender == factoryOwner, "Apenas o proprietario da factory pode executar");
        _;
    }
    
    constructor() {
        factoryOwner = msg.sender;
    }
    
    /**
     * @dev Criar uma nova instância do Web3Todo
     * @param _name Nome da instância
     */
    function createTodoContract(string memory _name) external payable {
        require(msg.value >= creationFee, "Taxa de criacao insuficiente");
        require(bytes(_name).length > 0, "Nome nao pode estar vazio");
        
        Web3Todo newTodo = new Web3Todo();
        address contractAddress = address(newTodo);
        
        contractInfo[contractAddress] = TodoInstance({
            contractAddress: contractAddress,
            owner: msg.sender,
            name: _name,
            createdAt: block.timestamp,
            isActive: true
        });
        
        userContracts[msg.sender].push(contractAddress);
        allContracts.push(contractAddress);
        totalContracts++;
        
        emit TodoContractCreated(contractAddress, msg.sender, _name, block.timestamp);
    }
    
    /**
     * @dev Obter contratos de um usuário
     */
    function getUserContracts(address _user) external view returns (address[] memory) {
        return userContracts[_user];
    }
    
    /**
     * @dev Obter informações de um contrato
     */
    function getContractInfo(address _contract) external view returns (TodoInstance memory) {
        return contractInfo[_contract];
    }
    
    /**
     * @dev Definir taxa de criação
     */
    function setCreationFee(uint256 _fee) external onlyFactoryOwner {
        creationFee = _fee;
    }
    
    /**
     * @dev Retirar taxas coletadas
     */
    function withdrawFees() external onlyFactoryOwner {
        payable(factoryOwner).transfer(address(this).balance);
    }
}