import { useAccount, useConnect, useDisconnect, useBlockNumber, useReadContract,
			useWriteContract, usePrepareContractWrite} from 'wagmi';
import numberStorageJson from "./abi/NumberStorage.json";
import { myLocalChain, fujiC, config } from "./wagmi";
import { useState } from "react";
// import "dotenv/config";

const NUM_STORAGE_ADDRESS = import.meta.env.VITE_GET_NUM_FUJI as `0x${string}`;
const abi = numberStorageJson.abi;


function App() {
  const [newNum, setNewNum] = useState(0);
  const account = useAccount()
  const { connectors, connect, status, error } = useConnect()
  const { disconnect } = useDisconnect()
  const blockResult = useBlockNumber({
	  chainId: fujiC.id,
	  watch: true,
  });
  const readNum = useReadContract({
	  abi,
	  address: NUM_STORAGE_ADDRESS,
	  functionName: "getNum",
	  chainId: fujiC.id,
	  config,
  })

  const {writeContract} = useWriteContract();
  console.log(blockResult.error, " here here\n\n\n" , readNum.error);


  

  return (
    <>
      <div>
        <h2>Account</h2>
        {(account.status === 'connected' || account.status === 'reconnecting') && (
          <button type="button" onClick={() => disconnect()}>
            Disconnect
          </button>
        )}
		<div>
		<input name="number" placeholder="number" value={newNum} 
			onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
				let savedNum: number = Number(e.target.value);
				if (!isNaN(savedNum))
					setNewNum(savedNum);
			}}
		/>
		<button 
			onClick={() =>
			  writeContract({
				  abi,
				  address: NUM_STORAGE_ADDRESS,
				  functionName: "setNum",
				  args: [newNum]
			  })
			}
		>change number</button>


		</div>

        <div>
          status: {account.status}
          <br />
          addresses: {JSON.stringify(account.addresses)}
          <br />
          chainId: {account.chainId}
		  <br />
		  current number: {readNum.data?.toString()}
		  <br />
		  getnum addr: {NUM_STORAGE_ADDRESS}
		  <br />
		  blockNr: {blockResult.data?.toString()}
		  <br />
		  abi: {JSON.stringify(abi)}
        </div>

      </div>

      <div>
        <h2>Connect</h2>
        {connectors.map((connector) => (
          <button
            key={connector.uid}
            onClick={() => connect({ connector })}
            type="button"
          >
            {connector.name}
          </button>
        ))}
        <div>{status}</div>
        <div>{error?.message}</div>
      </div>
    </>
  )
}

export default App
