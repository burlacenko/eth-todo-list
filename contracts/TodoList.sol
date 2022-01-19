pragma solidity ^0.5.0;
// steps:
// 1 => #1 - where: TodoList.sol
// 2 => #2 list tasks - where: create App.js
// 3 => #3 create tasks [1h06min] - where: TodoList.sol
// 4 => $4 complete tasks [1h16min]

//step 1.1
contract TodoList {
  // solidity is a TYPED language

  // step 1.2
  // we define "taskCount" as a special kind of variable called "STATE variable" which is written to the blockchain:
  // scope is like "global" to all app 
  // "public" is like a built in read function for this variable
  // VERY IMPORTANT: we need to create this counter because SOLIDITY does not implement any "counter" or "length" function to keep the lenght of an array!
  // so that the array we will create will be "measured" by this count
  uint public taskCount = 0; 

  // step 1.3
  // struct is like we define a new object
  struct Task {
    uint id;
    string content;
    bool completed;
  }

  // step 1.4
  // mapping creates and associative array
  // stores key,value pairs
  // in this case, the "key" will be a "uint" and the "value" will be one Task, a type we created above
  // will form a "database" (which is the blockchain!)
  // "public" is like a built in read function for this variabl
  mapping(uint => Task) public tasks;

  
  // step 3.1:  this is how to create an event in solidity
  // which, in this case, will be call by "emit" inside function "createTask"
  event TaskCreated(
    uint id,
    string content,
    bool completed
  );

  // step 4.2
  event TaskCompleted(
    uint id,
    bool completed
  );

  // step 1.6 set the Constructor itself
  // and already create our first "default" Task
  constructor() public {
    // notice it is calling the createTask function!
    createTask("Check out dappuniversity.com");
  }

  // step 1.5
  // important step is to make a function to be used by the "Constructor" for the "tasks"
  // it take a single parameter which will be the "string" for "content"
  function createTask(string memory _content) public {
    // using our "taskCount" as a counter = id to the mapping array
    taskCount ++;
    // now we accually set the new Task content!
    tasks[taskCount] = Task(taskCount, _content, false);
    // "emit" is not in step 5:
    // it was created long after, at 1:06:00
    // "emit" is how to trigger events inside solidity:
    emit TaskCreated(taskCount, _content, false);
  }

  // step 4.1
  function toggleCompleted(uint _id) public {
    // "_" is just a convention for local variable
    Task memory _task = tasks[_id];
    // invert the boolean:
    _task.completed = !_task.completed;
    // save new state
    tasks[_id] = _task;
    // step 4.3: trigger the new event "TaskCompleted"
    emit TaskCompleted(_id, _task.completed);
  }
}
