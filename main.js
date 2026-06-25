import { createWeb3Modal, defaultWagmiConfig, walletConnectProvider, EIP6963Connector } from '@web3modal/wagmi'
import { prepareWriteContract, writeContract } from '@wagmi/core'
import { configureChains, createConfig } from '@wagmi/core'
import { sendTransaction, prepareSendTransaction } from '@wagmi/core'
import { disconnect } from '@wagmi/core'
import { watchAccount } from '@wagmi/core'
import { switchNetwork } from '@wagmi/core'
import { getNetwork } from '@wagmi/core'
import { parseEther } from 'viem'
import { waitForTransaction } from '@wagmi/core'
import { connect } from '@wagmi/core'
//import { abi, contractAddress } from "/constants.js"
import { mainnet, arbitrum, bsc, sepolia, bscTestnet } from 'viem/chains'
import { getAccount } from '@wagmi/core'
import { publicProvider } from '@wagmi/core/providers/public'
import { InjectedConnector } from '@wagmi/core'
import { CoinbaseWalletConnector } from '@wagmi/core/connectors/coinbaseWallet'
import { WalletConnectConnector } from '@wagmi/core/connectors/walletConnect'

import { ethers } from "/ethers-5.6.esm.min.js"
import { abi, contractAddress } from "/constants.js"
import { usdtContractAddress, usdtAbi } from "/constantstwo.js"

// 1. Define constants
const projectId = '91f3c79a170a4fd822c062bd880f8b6e'
const sepoliaProvider = new ethers.providers.JsonRpcProvider("https://bsc-dataseed1.binance.org/");
//const sepoliaProvider = new ethers.providers.JsonRpcProvider("https://eth-sepolia.g.alchemy.com/v2/XSV0EGVs2xyTDRH7ZRP5nQZXBoplWs0x");
// 2. Create wagmiConfig
const metadata = {
  name: 'Web3Modal',
  description: 'Web3Modal Example',
  url: 'https://web3modal.com',
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}

// const chains = [mainnet, arbitrum, bsc, sepolia, bscTestnet]
// const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata })
const { chains, publicClient } = configureChains([bsc], [
  walletConnectProvider({ projectId }),
  publicProvider()
])

const wagmiConfig = createConfig({
  autoConnect: false,
  connectors: [
    new WalletConnectConnector({ chains, options: { projectId, showQrModal: false, metadata } }),
    new EIP6963Connector({ chains }),
    new InjectedConnector({ chains, options: { shimDisconnect: true } }),
    new CoinbaseWalletConnector({ chains, options: { appName: metadata.name } })
  ],
  publicClient
})


// 3. Create modal
const modal = createWeb3Modal({ wagmiConfig, projectId, defaultChain: bsc,
  themeVariables: {
    '--w3m-z-index': 1000
  },
  themeMode: 'light'
})

const { open, selectedNetworkId } = modal.getState()

const connectButton = document.getElementById('open-connect-modal')
const showAccount = document.getElementById("account")
const showAccountTwo = document.getElementById("accountTwo")
const purchaseButton = document.getElementById('purchaseButton')
const purchaseButtonUSDT = document.getElementById('purchaseButtonUSDT')
const bnbInput = document.getElementById('bnbInput')
const novisInput = document.getElementById('novisInput')
const approveButton = document.getElementById('approveButton')
const ETHbutton = document.getElementById("ETHbutton")
const USDTbutton = document.getElementById("USDTbutton")
const getTokens = document.getElementById('claimTokens')
const connecClaimtButton = document.getElementById("connecClaimtButton")
//const walletAddress = document.getElementById("wallet-address")


connectButton.onclick = connectWallet
connecClaimtButton.onclick = connectWallet
//showAccount.onclick = openModal
approveButton.onclick = approve
getTokens.onclick = tokenClaim;

purchaseButton.onclick = function() {
  purchaseTokens()
}

purchaseButtonUSDT.onclick = function() {
   purchaseTokensUSDT()
  }

let userConnected = false;
let CurrencySelected = "ETH"
var usdtTrigger = false;
var webthreeaccount;
let enteredAmount = null;

ETHbutton.onclick = function() {
  toggleCryptoInfo("ETH");
};

USDTbutton.onclick = function() {
  toggleCryptoInfo("USDT");
};

showAccount.addEventListener('click' , function() {
	if (userConnected == false) {
		connectWallet();
	} else {
		openModal();
	}

})

showAccountTwo.addEventListener('click' , function() {
	if (userConnected == false) {
		connectWallet();
	} else {
		openModal();
	}

})

function toggleCryptoInfo(crypto) {
  var logo = document.getElementById("change-logo");
 // var currencyText = document.getElementById("currencyText");
 

  if (crypto === 'ETH') {
      logo.innerHTML = '<img id="logo-currency" src="new-img/binance.png" alt="BNB">';
 //     currencyText.innerText = "BNB"
      CurrencySelected = "ETH"
      usdtTrigger = false
      hideApproveButton()
      if(userConnected === true) {
        ShowBuyButton()
        purchaseButtonUSDT.style.display = "none"
      }
      if(enteredAmount != null) {
        calculateNovisAmount(enteredAmount);
      }
  } else if (crypto === 'USDT') {
      logo.innerHTML = '<img id="logo-currency" src="new-img/usdt logo.png" alt="USDT">';
 //     currencyText.innerHTML = "USDT"
      CurrencySelected = "USDT"
      usdtTrigger = true
      if(userConnected === true) {
        hideBuyButton()
        showApproveButton()
      }
      if(enteredAmount != null) {
        calculateNovisAmount(enteredAmount);
      }
  }
  
}

async function calculateNovisAmount(bnbAmount) {
  try{
     //if(CurrencySelected == 'ETH'){
    //   const [ethRate, div, price] = await Promise.all([rate(), ethDivider(), tokenValue()]);
    // //  const ethRate = await rate(); // Call the rate() function asynchronously
    // //  const div = await ethDivider()
    // //  const price = await tokenValue()
    // // const novisAmount = bnbAmount * parseFloat(currentRate); // Multiply with the rate
    // const novisAmount = bnbAmount * parseFloat(ethRate) * parseFloat(div) / parseFloat(price);
    //  novisInput.value = novisAmount.toFixed(2);
 
    if (CurrencySelected === 'ETH') {
      const [ethRate, div, price] = await Promise.all([rate(), ethDivider(), tokenValue()]);
      const novisAmount = bnbAmount * parseFloat(ethRate) * parseFloat(div) / parseFloat(price);
      novisInput.value = novisAmount.toFixed(2);
      attachDebouncedUpdate();
    }

    if(CurrencySelected == 'USDT'){
      const currentRate = await usdtRate(); // Call the rate() function asynchronously
      const novisAmount = bnbAmount * parseFloat(currentRate); // Multiply with the rate
      novisInput.value = novisAmount.toFixed(2);
      }
  } catch (error) {
    console.error(error);
  }
}

function attachDebouncedUpdate() {
  const debouncedUpdate = debounce(async () => {
    if (CurrencySelected === 'ETH') {
      try {
        const [ethRate, div, price] = await Promise.all([rate(), ethDivider(), tokenValue()]);
        const novisAmount = bnbAmount * parseFloat(ethRate) * parseFloat(div) / parseFloat(price);
        novisInput.value = novisAmount.toFixed(2);
      } catch (error) {
        console.error('Error fetching values for debounced update:', error);
        // Handle error as needed
      }
    }
  }, 100); // Adjust the debounce delay as needed

  // Attach debouncedUpdate to your input event (e.g., onkeyup)
  novisInput.addEventListener('keyup', debouncedUpdate);
}

function debounce(func, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

document.addEventListener("DOMContentLoaded", async () => {
  await progress();

  const unwatch = watchAccount((account) => {
    console.log("Account changed:", account);

    // Check if the user is trying to change their account
    if (userConnected && account.address !== webthreeaccount) {
      const latestAccount = account.address
      console.log("User is trying to change their account!");
      // Your code to handle the account change event
      // For example, you can call connectWallet to reconnect the wallet
      const smallAccount = `${latestAccount.substring(0, 5)}...${latestAccount.slice(-3)}`;
      showAccount.innerHTML = smallAccount
      showAccountTwo.innerHTML = smallAccount
      webthreeaccount = account.address
      tokenInfo()
    }
  });
});

bnbInput.addEventListener('input', (event) => {
  const bnbAmount = parseFloat(event.target.value);
  if (isNaN(bnbAmount)) {
    novisInput.value = '';
    enteredAmount = null;
  } else {
    enteredAmount = bnbAmount;
    calculateNovisAmount(bnbAmount); // Call the async function to calculate novis amount
  }
});

function hideBuyButton() {
  var Buybutton = document.getElementById('purchaseButton');
  Buybutton.style.display = 'none';
}

function ShowBuyButton() {
  var Buybutton = document.getElementById('purchaseButton');
  Buybutton.style.display = 'block';
}

function hideApproveButton() {
  var Approvebutton = document.getElementById('approveButton');
  Approvebutton.style.display = 'none';
}

function showApproveButton() {
  var button = document.getElementById('approveButton');
  button.style.display = 'block'; // Reset to its original display value (block, inline-block, etc.)
}

async function connectWallet() {

  await disconnect()
  
  await modal.open()
  
  while (modal.getState().open) {
    // Wait for a short duration before checking again
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  const account = getAccount()
  console.log(account.address)
  
  if(account.isConnected ==false) {
    alert("please connect wallet")
    return
  }

  const watch = getNetwork()

  console.log(watch.chain.id)

 

  const newNetwork = watch.chain.id
  
  if(newNetwork != 56) {
    alert("connect to BSC")
    const network = await switchNetwork({
      chainId: 56,
    })
  }
  
  

  await tokenInfo()
  userConnected = true
  connectButton.innerHTML = "Connecting..."
  connecClaimtButton.innerHTML = "Connecting..."
  connectButton.innerHTML = "Connected"
  connectButton.style.display = 'none'
  connecClaimtButton.innerHTML = "Connected"
  connecClaimtButton.style.display = 'none'
  getTokens.style.display = "block"

  if (usdtTrigger == true)
  {
    showApproveButton();
  }

  if(usdtTrigger == false)
        {
   purchaseButton.style.display = "block"
        }

  const accountAddress = account.address
  webthreeaccount = accountAddress
  const truncatedAccount = `${accountAddress.substring(0, 5)}...${accountAddress.slice(-3)}`;
  showAccount.innerHTML = truncatedAccount
  showAccountTwo.innerHTML = truncatedAccount
//  walletAddress.innerHTML = accountAddress

  
  }

  async function openModal() {
    if(userConnected === false) {
      return
    }
    await modal.open()
  
    while (modal.getState().open) {
      // Wait for a short duration before checking again
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const account = getAccount()
    console.log(account)

    if(!account.address) {
      console.log("Disconnected")
      connectButton.style.display = 'block'
      connecClaimtButton.style.display = 'block'
      connectButton.innerHTML = "Connect"
      connecClaimtButton.innerHTML = "See Your Claimable Tokens"
      getTokens.style.display = "none"
      hideBuyButton()
      hideApproveButton()
  showAccount.innerHTML = "Connect"
  showAccountTwo.innerHTML = "Connect"
 // walletAddress.innerHTML = "-"

    }




  }

  async function progress() {
    // if (typeof window.ethereum !== "undefined") {
    //   const provider = new ethers.providers.Web3Provider(window.ethereum)
     //  const signer = provider.getSigner()
    // const sepoliaProvider = new ethers.providers.JsonRpcProvider("https://bsc-dataseed1.binance.org/");
       const contract = new ethers.Contract(contractAddress, abi, sepoliaProvider)
       try {
         const BNBearned = await contract.progressBNB()
         const progressDiv = document.getElementById('progress');
         const firstTotal = ethers.utils.formatUnits(BNBearned);
         const bnbratenew = await contract.getBNBPriceInUSD()
         const BnbUSD = parseFloat(firstTotal) * parseFloat(bnbratenew)
         console.log(BnbUSD)
         const USDTEarned = await contract.progressUSDT()
         const formatUsdt = parseFloat(USDTEarned) / 10 ** 18;
         console.log(formatUsdt)
         const totalEarned = parseFloat(BnbUSD) + parseFloat(formatUsdt) 
         const newSold = parseFloat(totalEarned).toFixed(2)
         progressDiv.innerHTML = parseFloat(newSold).toLocaleString()
        // const final = document.getElementById('usdRaised')
        // const finalAmount = totalEarned
       //  final.innerHTML = finalAmount.toLocaleString()
         console.log(newSold)
         updateProgressBar(newSold);
       } catch (error) {
         console.log(error)
         alert(error.message)
       }
    // } else {
   //    purchaseButton.innerHTML = "Please install MetaMask"
   //  } 
   }
   
   async function updateProgressBar(newSold) {
     const progressBarRect = document.getElementById('progressBarRect');
     const progressBarContainer = document.querySelector('.section2__progressBarContainer');
     const progressBarWidth = progressBarContainer.offsetWidth - 4;
     //const progressDiv = document.getElementById('progress');
     const BNBearned = parseFloat(newSold.replace(',', ''));
     const BNBstart = 0;
     const BNBend = 1000000;
     const progress = Math.max(0, Math.min((BNBearned - BNBstart) / (BNBend - BNBstart), 1));
     progressBarRect.style.width = progress * progressBarWidth + 'px';
   }
   
   async function tokensSold() {
     if (typeof window.ethereum !== "undefined") {
       const provider = new ethers.providers.Web3Provider(window.ethereum)
       const signer = provider.getSigner()
       const contract = new ethers.Contract(contractAddress, abi, signer)
       try {
         const totalSold = await contract.soldTokens()
        // const tokensSoldDiv = document.getElementById('tokens-sold');
        // tokensSoldDiv.innerText = ethers.utils.formatUnits(totalSold);
       } catch (error) {
         console.log(error)
         alert(error.message)
       }
     } else {
       const provider = new ethers.providers.JsonRpcProvider("https://rinkeby.infura.io/v3/your-project-id")
       const contract = new ethers.Contract(contractAddress, abi, provider)
       const totalSold = await contract.soldTokens()
      // const tokensSoldDiv = document.getElementById('tokens-sold');
      // tokensSoldDiv.innerText = ethers.utils.formatUnits(totalSold);
     }
   }
   
   async function rate() {
    //if (typeof window.ethereum !== "undefined") {
    //  const provider = new ethers.providers.Web3Provider(window.ethereum)
     // const signer = provider.getSigner()
    // const sepoliaProvider = new ethers.providers.JsonRpcProvider("https://eth-mainnet.g.alchemy.com/v2/uADNUYxUrYOsPEWhgrpagu5RpFHPSCii"); //https://bsc-dataseed1.binance.org/
      const contract = new ethers.Contract(contractAddress, abi, sepoliaProvider)
      try {
        const Ethrate = await contract.getBNBPriceInUSD();

        return Ethrate
      } catch (error) {
        throw new Error(error.message);
      }
    //} else {
    //  throw new Error("Please install MetaMask");
    //} 
  }

  async function tokenValue() {
    //if (typeof window.ethereum !== "undefined") {
    //  const provider = new ethers.providers.Web3Provider(window.ethereum)
     // const signer = provider.getSigner()
   //  const sepoliaProvider = new ethers.providers.JsonRpcProvider("https://eth-mainnet.g.alchemy.com/v2/uADNUYxUrYOsPEWhgrpagu5RpFHPSCii"); //https://bsc-dataseed1.binance.org/
      const contract = new ethers.Contract(contractAddress, abi, sepoliaProvider)
      try {
        const tokenPrice = await contract.getTokenUsdPrice();

     //  const newRate = bnbAmount * parseFloat(Ethrate) * parseFloat(divider) / parseFloat(divider);



        return tokenPrice
      } catch (error) {
        throw new Error(error.message);
      }
    //} else {
    //  throw new Error("Please install MetaMask");
    //} 
  }

  async function ethDivider() {
    //if (typeof window.ethereum !== "undefined") {
    //  const provider = new ethers.providers.Web3Provider(window.ethereum)
     // const signer = provider.getSigner()
    // const sepoliaProvider = new ethers.providers.JsonRpcProvider("https://eth-mainnet.g.alchemy.com/v2/uADNUYxUrYOsPEWhgrpagu5RpFHPSCii"); //https://bsc-dataseed1.binance.org/
      const contract = new ethers.Contract(contractAddress, abi, sepoliaProvider)
      try {
        const divider = await contract.getDivider();

     //  const newRate = bnbAmount * parseFloat(Ethrate) * parseFloat(divider) / parseFloat(divider);



        return divider
      } catch (error) {
        throw new Error(error.message);
      }
    //} else {
    //  throw new Error("Please install MetaMask");
    //} 
  }
   
   async function usdtRate() {
    // if (typeof window.ethereum !== "undefined") {
    //   const provider = new ethers.providers.Web3Provider(window.ethereum)
    //   const signer = provider.getSigner()
   // const sepoliaProvider = new ethers.providers.JsonRpcProvider("https://bsc-dataseed1.binance.org/");
       const contract = new ethers.Contract(contractAddress, abi, sepoliaProvider)
       try {
         const rate = await contract.getUsdtRate();
         const newRate = rate.toString()
         return newRate
       } catch (error) {
         throw new Error(error.message);
       }
   //  } else {
   //    throw new Error("Please install MetaMask");
   //  } 
   }

   async function purchaseTokens() {
    console.log("running...")
    const amount = document.getElementById("bnbInput").value
    if (amount >= 0.001) {
      console.log(`Funding with ${amount}...`)
      console.log('Buying with ETH')
      alert("Please wait for wallet confirmation. (Remember to confirm transaction inside your wallet)")
       // const provider = new ethers.providers.Web3Provider(window.ethereum)
     //  const provider = new ethers.providers.JsonRpcProvider("https://bsc-dataseed1.binance.org/");
      //  const signer = provider.getSigner()
        const contract = new ethers.Contract(contractAddress, abi, sepoliaProvider)
        try {
          // const hasPresaleStarted = await contract.checkPresaleStatus()
          // if (hasPresaleStarted == true){
  
          const hasPresaleEnded = await contract.checkPresaleEnd();
          if(hasPresaleEnded == true) {
            alert("Presale has ended");
            return
          }
           
          const account = getAccount()
          const currentAccount = account.address
            const balanceWei = await sepoliaProvider.getBalance(currentAccount);
            const balanceEth = ethers.utils.formatEther(balanceWei);
            if(balanceEth >= amount) {
          const availibleTokens = await contract.getClaimableTokens()
          const avlTokens = ethers.utils.formatUnits(availibleTokens)


          const [Ethratenew, dividernew, tokennewprice] = await Promise.all([rate(), ethDivider(), tokenValue()]);
          const totalBuy = amount * parseFloat(Ethratenew) * parseFloat(dividernew) / parseFloat(tokennewprice);

          console.log(avlTokens)
          if(avlTokens >= totalBuy) {
          // const transactionResponse = await contract.buyTokens({
          //   value: ethers.utils.parseEther(amount),
          //   gasLimit: 500000,
          // })

          const { hash } = await writeContract({
            address: contractAddress,
            abi: abi,
            functionName: 'buyTokens',
            value: parseEther(amount)
          })

          const data = await waitForTransaction({
            confirmations: 2,
            hash,
          })

          console.log(data)
          // const data = await waitForTransaction({
          //   confirmations: 1,
          //   transactionResponse,
          // })
        //  await listenForTransactionMine(hash, provider)
          console.log("Done")
          alert("Tokens Bought! Kindly wait for claim period to start. (You may refresh page to see your updated claimable tokens)")
        }
        else {
          alert("not enought tokens availible to be sold at this moment")
        } 
      } else{
        alert("you do not have enough BNB")
      }
        // } else{
        //   alert("Presale has not started")
        // }
        } catch (error) {
          console.log(error)
        }
    } else {
      alert("Please enter amount more than 0.001 BNB")
    }
  }

  async function approve() {
    const amount = document.getElementById("bnbInput").value
   // const newAmount = ethers.BigNumber.from(amount).mul(ethers.BigNumber.from(10).pow(18));
   const newAmount = ethers.utils.parseUnits(amount);
    if (amount >= 1) {
      alert("Approving... (Remember to confirm transaction inside your wallet)")
      console.log("approving...")
      //const provider = new ethers.providers.Web3Provider(window.ethereum)
     // const provider = new ethers.providers.JsonRpcProvider("https://bsc-dataseed1.binance.org/");
     // const signer = provider.getSigner()
      const contract = new ethers.Contract(usdtContractAddress, usdtAbi, sepoliaProvider)
      const presaleContract = new ethers.Contract(contractAddress, abi, sepoliaProvider)
      try {
  
      // const hasPresaleStarted = await presaleContract.checkPresaleStatus()
      //   if (hasPresaleStarted == false){
      //     alert("Presale has not started");
      //     return
      // }
      const hasPresaleEnded = await presaleContract.checkPresaleEnd();
      if(hasPresaleEnded == true) {
        alert("Presale has ended");
        return
      }
  
          const availibleTokens = await presaleContract.getClaimableTokens()
          const avlTokens = ethers.utils.formatUnits(availibleTokens)
          const ethereumRate = await presaleContract.getUsdtRate()
          const totalBuy = parseFloat(amount) * parseFloat(ethereumRate)
          console.log(avlTokens);
          console.log(totalBuy)
          if(avlTokens >= totalBuy) {
  
        const account = getAccount()
        const currentAccount = account.address;
        const userBalance = await contract.balanceOf(currentAccount)
        const formatBalance = ethers.utils.formatUnits(userBalance)
        const newFormatBalance = parseFloat(formatBalance)
        console.log(newFormatBalance)
        console.log(amount)
        if(newFormatBalance >= amount) {
        const currentAllowance = await contract.allowance(currentAccount, contractAddress);
          if (currentAllowance.lt(newAmount)) {
      //  const transactionResponse = await contract.approve(contractAddress, newAmount, { gasLimit: 200000 })
      const { hash } = await writeContract({
        address: usdtContractAddress,
        abi: usdtAbi,
        functionName: 'approve',
        args: [contractAddress, newAmount]
      })

        alert("approving...")
        approveButton.innerHTML = "Approving.."
        
        const data = await waitForTransaction({
          confirmations: 3,
          hash,
        })

        console.log(data)

        console.log("Done")
          }
        purchaseButtonUSDT.style.display = "block"
        approveButton.innerHTML = "Approved"
        approveButton.style.backgroundColor = "#00FF00"
        approveButton.style.color = "#000000"
        alert("Approved!")
        }
        else{
          alert('You dont not have enough balance')
        }
          } else {
            alert("Not Enough tokens availaible at the moment")
          }
      } catch (error) {
        console.log(error)
        alert(error.message)
        return;
     //purchaseButton.style.display = "block"
    }
  } else{
    alert("Please enter amount more than 1 USDT")
  }
  }

  async function purchaseTokensUSDT() {
    const amount = document.getElementById("bnbInput").value
   // const newAmount = ethers.BigNumber.from(amount).mul(ethers.BigNumber.from(10).pow(18));
   const newAmount = ethers.utils.parseUnits(amount);
  
    if (amount >= 1) {
      console.log(`Funding with ${amount}...`)
      console.log('Buying with USDT')
      alert("Please wait for wallet confirmation. (Remember to confirm transaction inside your wallet)")
      //  const provider = new ethers.providers.Web3Provider(window.ethereum)
      //  const signer = provider.getSigner()
     // const provider = new ethers.providers.JsonRpcProvider("https://bsc-dataseed1.binance.org/");
        const contract = new ethers.Contract(contractAddress, abi, sepoliaProvider)
        try {
          // const hasPresaleStarted = await contract.checkPresaleStatus()
          // if (hasPresaleStarted == true){
  
            const hasPresaleEnded = await contract.checkPresaleEnd();
            if(hasPresaleEnded == true) {
              alert("Presale has ended");
              return
            }
  
          const availibleTokens = await contract.getClaimableTokens()
          const avlTokens = ethers.utils.formatUnits(availibleTokens)
          const ethereumRate = await contract.getUsdtRate()
          const totalBuy = parseFloat(amount) * parseFloat(ethereumRate)
          console.log(avlTokens)
          console.log(totalBuy)
          if(avlTokens >= totalBuy) {


       //   const transactionResponse = await contract.buyTokensWithUSDT(newAmount, { gasLimit: 200000 })
         // await listenForTransactionMine(transactionResponse, provider)

         const { hash } = await writeContract({
          address: contractAddress,
          abi: abi,
          functionName: 'buyTokensWithUSDT',
          args: [newAmount]
        })

        const data = await waitForTransaction({
          confirmations: 3,
          hash,
        })

        console.log(data)

          console.log("Done")
          alert("Tokens Bought! Kindly wait for claim period to start. (You may refresh page to see your updated claimable tokens)")
  
          purchaseButtonUSDT.style.display = "none"
          approveButton.style.backgroundColor = "#f4c20f"
          approveButton.innerHTML = "Approve"
          approveButton.style.color = "#f7f7f7"
          
  
  
        }
        else {
          alert("not enought tokens availible to be sold at this moment")
        }
        // } else{
        //   alert("Presale has not started")
        // }
        } catch (error) {
          console.log(error)
        }
    } else {
      alert("Please enter amount more than 1 USDT!")
    }
  
  }

  async function tokenClaim() {
    console.log('claiming Tokens')
     // const provider = new ethers.providers.Web3Provider(window.ethereum)
     // const signer = provider.getSigner()
    // const provider = new ethers.providers.JsonRpcProvider("https://bsc-dataseed1.binance.org/");
      const contract = new ethers.Contract(contractAddress, abi, sepoliaProvider)
      try {
          const checkStatus = await contract.checkPresaleStatus()
          if(checkStatus == true){

            const hasPresaleEnded = await contract.checkPresaleEnd();
          if (hasPresaleEnded == true){
         // const accounts = await window.ethereum.request({ method: 'eth_accounts' })
          const account = getAccount()
          const currentAccount = account.address
          const users = await contract.Customer(currentAccount.toString())
          const tokenAmount = users

          if(tokenAmount == 0 ){
            alert("No tokens left to be claimed")
            return
          }
        alert("Please wait for wallet confirmation")
      //  const transactionResponse = await contract.claimTokens()
      //  await listenForTransactionMine(transactionResponse, provider)

      const { hash } = await writeContract({
        address: contractAddress,
        abi: abi,
        functionName: 'claimTokens',
        gas: 1_000_000n,
      })

      const data = await waitForTransaction({
        confirmations: 1,
        hash,
      })

        console.log(data)
        alert("Tokens claimed. Please import address 0x91bbD68B0AAd4B8e1df6E1c7b0e121C68135eF71 into your wallet")
        const tokensLeft = users
        const tokensForClaim = document.getElementById('tokens-claim')
        tokensForClaim.innerText = ethers.utils.formatUnits(tokensLeft)
          } else{
            alert("Presale has not ended")
          }
          }
          else {
            alert("Presale has not started")
          }

        
      } catch (error) {
        console.log(error)
      }
  } 

  async function tokenInfo() {
     // const provider = new ethers.providers.Web3Provider(window.ethereum);
     // const signer = provider.getSigner();
    // const provider = new ethers.providers.JsonRpcProvider("https://bsc-dataseed1.binance.org/");
      const contract = new ethers.Contract(
        contractAddress,
        abi,
        sepoliaProvider
      );
      try {
    
    const account = getAccount()
    const currentAccount = account.address
		const users = await contract.Customer(currentAccount.toString())
    const tokensToBeClaimed = document.getElementById('tokens-claim')
    const tokenSCclaim = users
    const finalTokenAmount = ethers.utils.formatUnits(tokenSCclaim)
    tokensToBeClaimed.innerText = parseFloat(finalTokenAmount).toFixed(2)
   // const claimStatus = document.getElementById('claimTime')
    /*const presalePeriod = await contract.getPresalePeriod()
    if(presalePeriod > 0){
    let unixTimestamp = parseInt(presalePeriod)
    let date = new Date(unixTimestamp * 1000)
    const humanDateFormat = date.toLocaleString()*/
    // const hasPresaleEnded = await contract.checkPresaleEnd();
    //     if(hasPresaleEnded == true) {
    //       claimStatus.innerText = "Positive"
    //       claimStatus.style.color = "green"
    //       return
    //     }  else{
    //   claimStatus.innerText = "Negative"
    //   claimStatus.style.color = "red"
    // }

  } catch (error){
		console.log(error)
	  }
    
  }
  
    
  //  async function listenForTransactionMine(transactionResponse, provider) {
  //    const receipt = await provider.waitForTransaction(transactionResponse.hash)
  //    console.log(receipt)
  //    return receipt
  //  }
   
   
   //new 1