const express = require("express");
const router = express.Router();
const otpdata = require("../model/Otp");
const { generateOTP, sendOTP } = require("../util/otp");
const User = require('../model/Users');
const Merchant = require('../model/Merchant');

const ethers = require('ethers');

const contractAddress = "0x8B41E466D0fc096e75B5aaDE8F8418FF1a7CCC3e"

const providers = new ethers.JsonRpcProvider(process.env.RPC_URL);
const abi = [
  { "type": "constructor", "inputs": [], "stateMutability": "nonpayable" },
  {
    "type": "function",
    "name": "acceptFirewallAdmin",
    "inputs": [],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "firewallAdmin",
    "inputs": [],
    "outputs": [{ "name": "", "type": "address", "internalType": "address" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "registerMerchant",
    "inputs": [
      {
        "name": "_merchantAddress",
        "type": "address",
        "internalType": "address"
      },
      { "name": "_merchantId", "type": "uint256", "internalType": "uint256" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "registerUser",
    "inputs": [
      {
        "name": "_worldcoinHash",
        "type": "bytes32",
        "internalType": "bytes32"
      },
      {
        "name": "_debitCardHash",
        "type": "bytes32",
        "internalType": "bytes32"
      },
      { "name": "_pkpEOA", "type": "address", "internalType": "address" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "s_balances",
    "inputs": [{ "name": "", "type": "address", "internalType": "address" }],
    "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "s_merchants",
    "inputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
    "outputs": [{ "name": "", "type": "address", "internalType": "address" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "s_userPKP",
    "inputs": [{ "name": "", "type": "bytes32", "internalType": "bytes32" }],
    "outputs": [{ "name": "", "type": "address", "internalType": "address" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "s_users",
    "inputs": [{ "name": "", "type": "bytes32", "internalType": "bytes32" }],
    "outputs": [{ "name": "", "type": "bool", "internalType": "bool" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "safeFunctionCall",
    "inputs": [
      {
        "name": "userNativeFee",
        "type": "uint256",
        "internalType": "uint256"
      },
      { "name": "proxyPayload", "type": "bytes", "internalType": "bytes" },
      { "name": "data", "type": "bytes", "internalType": "bytes" }
    ],
    "outputs": [],
    "stateMutability": "payable"
  },
  {
    "type": "function",
    "name": "setAttestationCenterProxy",
    "inputs": [
      {
        "name": "attestationCenterProxy",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "setFirewall",
    "inputs": [
      { "name": "_firewall", "type": "address", "internalType": "address" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "setFirewallAdmin",
    "inputs": [
      {
        "name": "_firewallAdmin",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "spendMoney",
    "inputs": [
      {
        "name": "_pkpEOASpender",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "_mercahntEOA",
        "type": "address",
        "internalType": "address"
      },
      { "name": "amount", "type": "uint256", "internalType": "uint256" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "event",
    "name": "FirewallAdminUpdated",
    "inputs": [
      {
        "name": "newAdmin",
        "type": "address",
        "indexed": false,
        "internalType": "address"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "FirewallUpdated",
    "inputs": [
      {
        "name": "newFirewall",
        "type": "address",
        "indexed": false,
        "internalType": "address"
      }
    ],
    "anonymous": false
  },
  {
    "type": "error",
    "name": "AddressEmptyCode",
    "inputs": [
      { "name": "target", "type": "address", "internalType": "address" }
    ]
  },
  { "type": "error", "name": "FailedCall", "inputs": [] }
]
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, providers)
const contract = new ethers.Contract(contractAddress, abi, wallet);

router.post("/generate-otp", async (req, res) => {

  const { email } = req.body;


  try {
    console.log(email)
    const currentTime = new Date();
    const OTP = generateOTP();

    const otpData = new otpdata();

    otpData.otp = OTP;
    otpData.timestamp = currentTime;
    otpData.email = email;

    await otpData.save();

    sendOTP(email, OTP);

    res.status(200).send(OTP);

  } catch (err) {
    console.log(err);
    res.status(500).send("Server error");
  }
});





router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    console.log(email)
    console.log(otp)
    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required.' });
    }

    // Check if the OTP exists and matches
    const otpRecord = await otpdata.findOne({ email, otp });

    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid or expired OTP.' });
    }

    // OTP is valid, proceed with verification
    await otpRecord.deleteOne({ email, otp });
    res.status(200).json({ message: 'OTP verified successfully!' });

    // Optionally delete the OTP record after successful verification
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while verifying OTP.' });
  }
});



router.post("/register-user", async (req, res) => {

  const { email, worldIdHash, debitCardHash, pkpPublicKey, userEOA, dataSinged, v, r, s } = req.body;

  if (!email) {
    return res.status(400).json({ error: "User email is required!" });
  }

  try {


    const tx = await contract.registerUser(
      worldIdHash,
      debitCardHash,
      userEOA,
      // dataSinged,
      // r,
      // s,
      // v
    );
    console.log('Transaction sent:', tx);

    await tx.wait();
    const newUser = new User({ email, worldIdHash, debitCardHash, pkpPublicKey, userEOA });
    await newUser.save();

    res.status(200).json({ message: 'User registered successfully' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while registering user.' });
  }
})

router.post("/registerMerchant", async (req, res) => {

  const { email, merchantId, pkpPublicKey, merchantEOA } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Merchant's email is required!" });
  }

  try {
    console.log(contractAddress)

    const tx = await contract.registerMerchant(
      merchantEOA,
      merchantId
    );
    console.log('Transaction sent:', tx);
    const receipt = await tx.wait();
    console.log("receipt")
    console.log(receipt)


    const newMerchant = new Merchant({ email, merchantId, pkpPublicKey, merchantEOA });
    await newMerchant.save();

    res.status(200).json({ message: 'Merchant registerd successfully' });


  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while registering merchant.' });
  }
})


router.post("/tx", async (req, res) => {
  try {
    const {
      // dataSinged,
      // v,
      // r,
      // s,
      amount,
      merchantEOA,
      userEOA
    } = req.body
    // const userData = User.findOne({ debitCardHash })
    // if (!userData) {
    //   return res.status(400).json({ message: 'invalid tx' });
    // }
    console.log(amount)
    console.log(userEOA)
    console.log(merchantEOA)

    let tx = await contract.spendMoney(
      userEOA, merchantEOA, amount,
    );
    console.log('Transaction sent:', tx);

    res.status(200).json({ message: 'tx hash created', transactionHash:tx});
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while making tx' });
  }
})

router.post("/monitorTx", async (req, res) => {
  try {
    const { txHash } = req.body
    // wait for tx to be successful and wait for 4 blocks
    await providers.waitForTransaction(txHash, 4);
    res.status(200).json({ message: 'tx successful' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'failed to monitor the tx' });
  }
})



module.exports = router;
