// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title Web3Todo
 * @dev Smart contract para gerenciamento de tarefas com stake em Wei
 * @author Web3 TODO Team
 */
contract Web3Todo {
    
    // Estrutura para representar uma tarefa
    struct Task {
        uint256 id;
        string name;
        string description;
        address owner;
        uint256 weiValue;
        bool isCompleted;
        uint256 createdAt;
        uint256 completedAt;
        bool exists;
    }
    
    // Mapeamentos para armazenar dados
    mapping(uint256 => Task) public tasks;
    mapping(address => uint256[]) public userTasks;
    mapping(address => uint256) public userTotalStaked;
    mapping(address => uint256) public userTotalEarned;
    
    // Variáveis de estado
    uint256 private nextTaskId = 1;
    uint256 public totalTasksCreated;
    uint256 public totalWeiStaked;
    uint256 public totalTasksCompleted;
    
    // Taxa do contrato (2% sobre valores completados)
    uint256 public constant CONTRACT_FEE_PERCENT = 2;
    address public owner;
    uint256 public contractBalance;
    
    // Eventos
    event TaskCreated(
        uint256 indexed taskId,
        address indexed owner,
        string name,
        uint256 weiValue,
        uint256 timestamp
    );
    
    event TaskCompleted(
        uint256 indexed taskId,
        address indexed owner,
        uint256 weiValue,
        uint256 timestamp
    );
    
    event StakeWithdrawn(
        address indexed user,
        uint256 amount,
        uint256 timestamp
    );
    
    event ContractFeeCollected(
        uint256 amount,
        uint256 timestamp
    );
    
    // Modificadores
    modifier onlyOwner() {
        require(msg.sender == owner, "Apenas o proprietario pode executar esta funcao");
        _;
    }
    
    modifier taskExists(uint256 _taskId) {
        require(tasks[_taskId].exists, "Tarefa nao existe");
        _;
    }
    
    modifier onlyTaskOwner(uint256 _taskId) {
        require(tasks[_taskId].owner == msg.sender, "Apenas o proprietario da tarefa pode executar esta acao");
        _;
    }
    
    modifier taskNotCompleted(uint256 _taskId) {
        require(!tasks[_taskId].isCompleted, "Tarefa ja foi completada");
        _;
    }
    
    // Constructor
    constructor() {
        owner = msg.sender;
    }
    
    /**
     * @dev Criar uma nova tarefa com stake em Wei
     * @param _name Nome da tarefa
     * @param _description Descrição da tarefa
     */
    function createTask(
        string memory _name,
        string memory _description
    ) external payable {
        require(bytes(_name).length > 0, "Nome da tarefa nao pode estar vazio");
        require(bytes(_description).length > 0, "Descricao da tarefa nao pode estar vazia");
        require(msg.value > 0, "Valor em Wei deve ser maior que zero");
        
        uint256 taskId = nextTaskId++;
        
        tasks[taskId] = Task({
            id: taskId,
            name: _name,
            description: _description,
            owner: msg.sender,
            weiValue: msg.value,
            isCompleted: false,
            createdAt: block.timestamp,
            completedAt: 0,
            exists: true
        });
        
        userTasks[msg.sender].push(taskId);
        userTotalStaked[msg.sender] += msg.value;
        totalTasksCreated++;
        totalWeiStaked += msg.value;
        
        emit TaskCreated(taskId, msg.sender, _name, msg.value, block.timestamp);
    }
    
    /**
     * @dev Completar uma tarefa e liberar o stake
     * @param _taskId ID da tarefa a ser completada
     */
    function completeTask(uint256 _taskId) 
        external 
        taskExists(_taskId) 
        onlyTaskOwner(_taskId) 
        taskNotCompleted(_taskId) 
    {
        Task storage task = tasks[_taskId];
        task.isCompleted = true;
        task.completedAt = block.timestamp;
        
        uint256 weiValue = task.weiValue;
        uint256 contractFee = (weiValue * CONTRACT_FEE_PERCENT) / 100;
        uint256 userReward = weiValue - contractFee;
        
        // Atualizar estatísticas
        userTotalEarned[msg.sender] += userReward;
        userTotalStaked[msg.sender] -= weiValue;
        totalTasksCompleted++;
        totalWeiStaked -= weiValue;
        contractBalance += contractFee;
        
        // Transferir recompensa para o usuário
        payable(msg.sender).transfer(userReward);
        
        emit TaskCompleted(_taskId, msg.sender, userReward, block.timestamp);
    }
    
    /**
     * @dev Cancelar uma tarefa e recuperar o stake (com penalidade)
     * @param _taskId ID da tarefa a ser cancelada
     */
    function cancelTask(uint256 _taskId) 
        external 
        taskExists(_taskId) 
        onlyTaskOwner(_taskId) 
        taskNotCompleted(_taskId) 
    {
        Task storage task = tasks[_taskId];
        uint256 weiValue = task.weiValue;
        
        // Penalidade de 10% por cancelamento
        uint256 penalty = (weiValue * 10) / 100;
        uint256 refundAmount = weiValue - penalty;
        
        // Remover tarefa
        task.exists = false;
        
        // Atualizar estatísticas
        userTotalStaked[msg.sender] -= weiValue;
        totalWeiStaked -= weiValue;
        contractBalance += penalty;
        
        // Refundar valor com penalidade
        payable(msg.sender).transfer(refundAmount);
        
        emit StakeWithdrawn(msg.sender, refundAmount, block.timestamp);
    }
    
    /**
     * @dev Obter informações de uma tarefa específica
     * @param _taskId ID da tarefa
     * @return Task struct com todas as informações
     */
    function getTask(uint256 _taskId) 
        external 
        view 
        taskExists(_taskId) 
        returns (Task memory) 
    {
        return tasks[_taskId];
    }
    
    /**
     * @dev Obter todas as tarefas de um usuário
     * @param _user Endereço do usuário
     * @return Array com IDs das tarefas do usuário
     */
    function getUserTasks(address _user) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return userTasks[_user];
    }
    
    /**
     * @dev Obter estatísticas de um usuário
     * @param _user Endereço do usuário
     * @return totalTasks Total de tarefas criadas
     * @return completedTasks Total de tarefas completadas
     * @return pendingTasks Total de tarefas pendentes
     * @return totalStaked Total em Wei em stake
     * @return totalEarned Total em Wei ganho
     */
    function getUserStats(address _user) 
        external 
        view 
        returns (
            uint256 totalTasks,
            uint256 completedTasks,
            uint256 pendingTasks,
            uint256 totalStaked,
            uint256 totalEarned
        ) 
    {
        uint256[] memory userTaskIds = userTasks[_user];
        totalTasks = userTaskIds.length;
        
        for (uint256 i = 0; i < userTaskIds.length; i++) {
            if (tasks[userTaskIds[i]].exists) {
                if (tasks[userTaskIds[i]].isCompleted) {
                    completedTasks++;
                } else {
                    pendingTasks++;
                }
            }
        }
        
        totalStaked = userTotalStaked[_user];
        totalEarned = userTotalEarned[_user];
    }
    
    /**
     * @dev Obter estatísticas globais do contrato
     * @return _totalTasksCreated Total de tarefas criadas
     * @return _totalTasksCompleted Total de tarefas completadas
     * @return _totalWeiStaked Total de Wei em stake
     * @return _contractBalance Saldo do contrato
     */
    function getGlobalStats() 
        external 
        view 
        returns (
            uint256 _totalTasksCreated,
            uint256 _totalTasksCompleted,
            uint256 _totalWeiStaked,
            uint256 _contractBalance
        ) 
    {
        return (
            totalTasksCreated,
            totalTasksCompleted,
            totalWeiStaked,
            contractBalance
        );
    }
    
    /**
     * @dev Obter tarefas paginadas de um usuário
     * @param _user Endereço do usuário
     * @param _offset Offset para paginação
     * @param _limit Limite de tarefas por página
     * @return Array de Tasks
     */
    function getUserTasksPaginated(
        address _user, 
        uint256 _offset, 
        uint256 _limit
    ) 
        external 
        view 
        returns (Task[] memory) 
    {
        uint256[] memory userTaskIds = userTasks[_user];
        require(_offset < userTaskIds.length, "Offset invalido");
        
        uint256 end = _offset + _limit;
        if (end > userTaskIds.length) {
            end = userTaskIds.length;
        }
        
        Task[] memory result = new Task[](end - _offset);
        
        for (uint256 i = _offset; i < end; i++) {
            result[i - _offset] = tasks[userTaskIds[i]];
        }
        
        return result;
    }
    
    /**
     * @dev Coletar taxas do contrato (apenas owner)
     */
    function collectFees() external onlyOwner {
        require(contractBalance > 0, "Nao ha taxas para coletar");
        
        uint256 amount = contractBalance;
        contractBalance = 0;
        
        payable(owner).transfer(amount);
        
        emit ContractFeeCollected(amount, block.timestamp);
    }
    
    /**
     * @dev Função de emergência para pausar o contrato
     */
    bool public paused = false;
    
    modifier whenNotPaused() {
        require(!paused, "Contrato pausado");
        _;
    }
    
    function pause() external onlyOwner {
        paused = true;
    }
    
    function unpause() external onlyOwner {
        paused = false;
    }
    
    /**
     * @dev Função para receber Ether diretamente
     */
    receive() external payable {
        contractBalance += msg.value;
    }
    
    /**
     * @dev Função fallback
     */
    fallback() external payable {
        contractBalance += msg.value;
    }
}