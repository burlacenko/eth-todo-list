// extra remarks: to make it run, I changed Ganache network id to 1337 (instead of 5777)
// so now Metamask wallet is running in Brave at "acoount 2" for http://127.0.0.1:7545 chain Id 1337 network Id 1337 HardFork (changed to): Byzantium

App = {
  loading: false,
  contracts: {},

  // step 1
  load: async () => {
    console.log("app loading...")
    // loads web3 and configuration established by MetaMask itself:
    await App.loadWeb3()
    // await App.loadProvider()
    await App.loadAccount()
    await App.loadContract()
    await App.render()
  },
  // https://medium.com/metamask/https-medium-com-metamask-breaking-change-injecting-web3-7722797916a8
  // THIS "loadWeb3" LOADS the connection to the blockchain
  // NOTE: web3 is legacy and I only made it work because of a call to 
  // old legacy with following "script" in head:
  // <script src="https://unpkg.com/@metamask/legacy-web3@latest/dist/metamask.web3.min.js"></script>
  // as instructed in https://www.npmjs.com/package/@metamask/legacy-web3
  // but we should move to new "detect-provider" pack to be implemented at loadProvider()
  loadWeb3: async () => {
    // error here: Web3 is not defined
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider
      web3 = new Web3(web3.currentProvider)
    } else {
      window.alert("Please connect to Metamask.")
    }
    // Modern dapp browsers...
    if (window.ethereum) {
      window.web3 = new Web3(ethereum)
      try {
        // Request account access if needed
        await ethereum.enable()
        // Acccounts now exposed
        web3.eth.sendTransaction({/* ... */})
      } catch (error) {
        // User denied account access...
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      App.web3Provider = web3.currentProvider
      window.web3 = new Web3(web3.currentProvider)
      // Acccounts always exposed
      web3.eth.sendTransaction({/* ... */})
    }
    // Non-dapp browsers...
    else {
      console.log('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  },

  // but we should move to new "detect-provider" pack to be implemented at loadProvider()
  // check https://github.com/MetaMask/detect-provider
  loadProvider: async () => {
    const provider = await detectEthereumProvider()
    if (provider) {
      console.log('Ethereum successfully detected!')

      // From now on, this should always be true:
      // provider === window.ethereum
    
      // Access the decentralized web!
    
      // Legacy providers may only have ethereum.sendAsync
      const chainId = await provider.request({
        method: 'eth_chainId'
      })
    } else {
      // if the provider is not detected, detectEthereumProvider resolves to null
      console.error('Please install MetaMask!', error)
    }    
  },

  loadAccount: async () => {
    // Set the current blockchain account
    // window.web3
    // App.account = web3.eth.accounts[0]
    // window.ethereum
    const accounts = await ethereum.request({ method: 'eth_accounts' });
    App.account = accounts[0];
  },

  loadContract: async () => {
    // Create a JavaScript version of the smart contract
    const todoList = await $.getJSON('TodoList.json')
    App.contracts.TodoList = TruffleContract(todoList)
    App.contracts.TodoList.setProvider(App.web3Provider)

    // Hydrate the smart contract with values from the blockchain
    App.todoList = await App.contracts.TodoList.deployed()
  },

  render: async () => {
    // Prevent double render
    if (App.loading) {
      return
    }

    // Update app loading state
    App.setLoading(true)

    // Render Account
    $('#account').html(App.account)

    // Render Tasks
    await App.renderTasks()

    // Update loading state
    App.setLoading(false)
  },

  renderTasks: async () => {
    // Load the total task count from the blockchain
    const taskCount = await App.todoList.taskCount()
    const $taskTemplate = $('.taskTemplate')

    // Render out each task with a new task template
    for (var i = 1; i <= taskCount; i++) {
      // Fetch the task data from the blockchain
      const task = await App.todoList.tasks(i)
      const taskId = task[0].toNumber()
      const taskContent = task[1]
      const taskCompleted = task[2]

      // Create the html for the task
      const $newTaskTemplate = $taskTemplate.clone()
      $newTaskTemplate.find('.content').html(taskContent)
      $newTaskTemplate.find('input')
                      .prop('name', taskId)
                      .prop('checked', taskCompleted)
                      .on('click', App.toggleCompleted)

      // Put the task in the correct list
      if (taskCompleted) {
        $('#completedTaskList').append($newTaskTemplate)
      } else {
        $('#taskList').append($newTaskTemplate)
      }

      // Show the task
      $newTaskTemplate.show()
    }
  },

  createTask: async () => {
    App.setLoading(true)
    const content = $('#newTask').val()
    await App.todoList.createTask(content)
    window.location.reload()
  },

  toggleCompleted: async (e) => {
    App.setLoading(true)
    const taskId = e.target.name
    await App.todoList.toggleCompleted(taskId)
    window.location.reload()
  },

  setLoading: (boolean) => {
    App.loading = boolean
    const loader = $('#loader')
    const content = $('#content')
    if (boolean) {
      loader.show()
      content.hide()
    } else {
      loader.hide()
      content.show()
    }
  }
}

// step 2
$(() => {
  $(window).load(() => {
    App.load()
  })
})
