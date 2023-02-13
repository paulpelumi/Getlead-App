import React, { useEffect, useState } from 'react';
import {
  ChakraProvider,
  Box,
  Text,
  VStack,
  Grid,
  theme,
  Button,
  HStack,
  Input,
  AlertIcon,
  AlertDescription,
  AlertTitle,
  Alert,
  useToast,
} from '@chakra-ui/react';
import { ColorModeSwitcher } from './ColorModeSwitcher';
import {
  connect,
  isMetaMaskInstalled,
  getProvider,
  getSigner,
} from './connection/metamask';
// import { ethers } from 'ethers';
import { formatEther, Contract, toBeHex, ethers } from 'ethers';
import teamlead from './abi/teamlead.json';

function App() {
  const [account, setAccount] = useState('');
  const [myBalance, setMyBalance] = useState('');
  const [leadName, setLeadName] = useState('');
  const [newLead, setNewLead] = useState('');
  const [chainError, setChainError] = useState(null);
  const toast = useToast();

  useEffect(() => {
    if (account) {
      getBalance(account);
      setChainError(null);
    }
    console.log(teamlead);
  }, [chainError, account]);

  const checkMetamask = async () => {
    if (isMetaMaskInstalled) {
      if (window.ethereum.chainId === '0x13881') {
        const userAccount = await connect();
        console.log(userAccount);
        setAccount(userAccount[0]);
      } else {
        setChainError('change to Mumbai Polygon');
        throw new Error('change to Mumbai Polygon');
      }
    } else {
      throw new Error('Install metamask');
    }
  };


  const getBalance = async myAccount => {
    const provider = getProvider();
    const balance = await provider.getBalance(myAccount);
    console.log(formatEther(balance));
    setMyBalance(formatEther(balance));
    return balance;
  };

  const teamleadContract = async () => {
    const abi = [
      'function getLead() view external returns (string memory)',
      'function setLead(string) returns (string)',
    ];
    const signer = await getSigner();
    // Create a contract
    const teamleadContract = new Contract(
      '0xB0b72FB76a9390943A869eD2e837D183Cd44F954',
      abi,
      signer
    );
    return teamleadContract;
  };

  // const checkEvents = async() => {
  //   let teamleadContract = new ethers.Contract {"0xB0b72FB76a9390943A869eD2e837D183Cd44F954", abi, signer} 

  //   teamleadContract.on  {"LeadSet"}
  // }
  // // const ethers = require("ethers");s
  // // const teamlead = require("")

  
  const getLead = async () => {
    try {
      const teamCon = await teamleadContract();
      console.log(teamCon);
      const currentLead = await teamCon.getLead();
      setLeadName(currentLead);
      console.log(currentLead);
    } catch (error) {
      console.log(error);
    }
  };

  const setLead = async () => {
    try {
      const teamCon = await teamleadContract();
      console.log(teamCon);
      const tx = await teamCon.setLead(newLead);
      const receipt = await tx.wait(1);
      if (receipt.status) {
        toast({
          position: 'bottom-left',
          render: () => (
            <Box color="white" p={3} bg="green.500">
              Transaction successful
            </Box>
          ),
        });
      }
      console.log(receipt);
    } catch (error) {
      console.log(error);
    }
  };

  const walletConnection = () => {
    try {
      checkMetamask();
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <ChakraProvider theme={theme}>
      <Box textAlign="center" fontSize="xl">
        <Grid minH="100vh" p={3}>
          <ColorModeSwitcher justifySelf="flex-end" />
          <VStack spacing={8}>
            {chainError && (
              <Alert status="error">
                <AlertIcon />
                <AlertTitle>Wrong Network!</AlertTitle>
                <AlertDescription>
                  Please change to Polygon Mumbai testnet
                </AlertDescription>
              </Alert>
            )}
            <Text>TeamLead app</Text>
            <Text>{account}</Text>
            <Text>{myBalance}</Text>
            <Button onClick={walletConnection} disabled={account}>
              {account ? 'Connected' : 'Connect Wallet'}
            </Button>
            <HStack spacing="24px">
              <Button onClick={getLead}>GetLead</Button>
              <Text>{leadName}</Text>
            </HStack>
            <HStack spacing="24px">
              <Input
                value={newLead}
                onChange={e => setNewLead(e.target.value)}
              ></Input>
              <Button onClick={setLead}>Set TeamLead</Button>
            </HStack>
          </VStack>
        </Grid>
      </Box>
    </ChakraProvider>
  );
}

export default App;
