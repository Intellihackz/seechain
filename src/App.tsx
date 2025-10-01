import "./App.css";
import { useState } from "react";
import logoIcon from "./assets/icon.png";

interface TransactionResults {
  explanation: string;
  technical: {
    from: string;
    to: string;
    value: string;
    gas: string;
    gasUsed: string;
    status: string;
    blockNumber: number;
    timestamp: number;
  };
  raw: {
    transaction: any;
    receipt: any;
  };
}

function App() {
  const [transactionHash, setTransactionHash] = useState("");
  const [results, setResults] = useState<TransactionResults | null>(null);
  const [selectedNetwork, setSelectedNetwork] = useState("mainnet");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateAIExplanation = async (tx: any, txReceipt: any): Promise<string> => {
    const MISTRAL_API_KEY = "GRkx3gFJjVNeZoz4ogWjM16tyMxEFOWi"; // Replace with your actual API key
    
    try {
      const prompt = `You are a blockchain transaction explainer for VeChain network. Analyze this complete transaction data and provide a detailed, well-formatted explanation.

COMPLETE TRANSACTION DATA:
${JSON.stringify(tx, null, 2)}

COMPLETE TRANSACTION RECEIPT DATA:
${JSON.stringify(txReceipt, null, 2)}

NETWORK: ${selectedNetwork}

Instructions:
1. Analyze ALL the provided data thoroughly - don't miss any important details
2. Provide a detailed explanation in 2-4 sentences with proper formatting
3. Use **bold** for important terms like contract names, amounts, and addresses
4. Show COMPLETE addresses - never shorten them (e.g., use full 0x1234567890abcdef1234567890abcdef12345678, not 0x1234...5678)
5. Include specific amounts with full precision when available
6. Mention the exact function called if it's a contract interaction
7. Include gas costs, fees, and block information
8. Look at ALL events, transfers, and outputs for complete context
9. If multiple clauses exist, explain each one
10. Use proper formatting with line breaks and bullet points where helpful
11. Include technical details in parentheses for those who want them
12. Convert hex values to readable amounts where appropriate
13. Mention the exact block number and timestamp if available
14. Explain the purpose/type of contract if identifiable
15. Keep it informative but accessible

Format Guidelines:
- Use **bold** for addresses, amounts, contract names, block numbers
- Use *italics* for technical details or additional context
- Use line breaks to separate different aspects of the transaction
- Include exact gas used, gas limit, and fee calculations
- Show both hex and converted values where relevant

Example format:
This transaction successfully called the **VeChain Energy (VTHO) contract** at **0x0000000000000000000000000000456e65726779** to transfer **10,000 VTHO tokens** from **0x2d7c8293b20344223668ed3fd88301381dc35ce0** to **0x11e1b586dd371471d0b52046ee3d4309a6c29c6c**.

The transaction was confirmed in **block #12,345,678** and consumed **36,582 gas** out of the **90,000 gas limit**, costing approximately **0.0514 VET** in transaction fees. 

*Technical details: The transaction used the standard ERC20 transfer function (method signature 0xa9059cbb) and emitted a Transfer event. No VET was transferred directly - only VTHO tokens were moved between accounts.*`;

      const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${MISTRAL_API_KEY}`
        },
        body: JSON.stringify({
          model: 'mistral-large-latest',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 500,
          temperature: 0.2
        })
      });

      if (!response.ok) {
        throw new Error(`Mistral API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || 'Unable to generate explanation.';

    } catch (err) {
      console.error('AI explanation error:', err);
      return 'Unable to generate AI explanation. Using fallback analysis.';
    }
  };

  const fetchTransaction = async (txHash: string) => {
    if (!txHash.trim()) return;
    
    setIsLoading(true);
    setError(null);
    setResults(null); // Clear existing results
    
    try {
      // Use VeChain Thor API directly
      const networkUrl = selectedNetwork === 'mainnet' 
        ? 'https://mainnet.vechain.org' 
        : 'https://testnet.vechain.org';
      
      // Fetch transaction details and receipt using REST API
      const [txResponse, receiptResponse] = await Promise.all([
        fetch(`${networkUrl}/transactions/${txHash}`),
        fetch(`${networkUrl}/transactions/${txHash}/receipt`)
      ]);

      if (!txResponse.ok) {
        throw new Error('Transaction not found');
      }

      if (!receiptResponse.ok) {
        throw new Error('Transaction receipt not found');
      }

      const tx = await txResponse.json();
      const txReceipt = await receiptResponse.json();

      // Parse transaction data
      const clause = tx.clauses[0]; // Get first clause
      const fromAddress = tx.origin;
      const toAddress = clause?.to || 'Contract Creation';
      const value = clause?.value ? (parseInt(clause.value, 16) / 1e18).toFixed(4) + ' VET' : '0 VET';
      const gasLimit = tx.gas.toString();
      const gasUsed = txReceipt.gasUsed.toString();
      const status = txReceipt.reverted ? 'Failed' : 'Success';
      const blockNumber = txReceipt.meta.blockNumber;
      const timestamp = txReceipt.meta.blockTimestamp;

      // Generate AI explanation
      let explanation = '';
      try {
        explanation = await generateAIExplanation(tx, txReceipt);
      } catch (err) {
        // Fallback explanation if AI fails
        if (txReceipt.reverted) {
          explanation = `This transaction failed and was reverted. ${gasUsed} gas was consumed in the process.`;
        } else if (clause?.to === '0x0000000000000000000000000000456e65726779') {
          explanation = `This transaction interacted with the VeChain Energy (VTHO) contract, likely transferring VTHO tokens.`;
        } else if (value !== '0 VET') {
          explanation = `This transaction successfully transferred ${value} from ${fromAddress.slice(0, 6)}...${fromAddress.slice(-4)} to ${toAddress.slice(0, 6)}...${toAddress.slice(-4)}.`;
        } else {
          explanation = `This transaction executed a smart contract function. No VET was transferred, but ${gasUsed} gas was consumed.`;
        }
      }

      setResults({
        explanation,
        technical: {
          from: fromAddress,
          to: toAddress,
          value,
          gas: gasLimit,
          gasUsed,
          status,
          blockNumber,
          timestamp
        },
        raw: {
          transaction: tx,
          receipt: txReceipt
        }
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch transaction');
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-fetch when transaction hash changes (debounced)
  const handleHashChange = (hash: string) => {
    setTransactionHash(hash);
    if (hash.length === 66 && hash.startsWith('0x')) {
      // Valid transaction hash format
      const timeoutId = setTimeout(() => {
        fetchTransaction(hash);
      }, 500); // 500ms debounce
      return () => clearTimeout(timeoutId);
    }
  };

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Header */}
      <header className="border-b border-black bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between h-12">
            {/* Logo and Title */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden">
                <img 
                  src={logoIcon} 
                  alt="SeeChain Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <h1 className="text-2xl font-bold text-black">SeeChain</h1>
            </div>
            
            {/* Network Selector */}
            <div className="flex items-center">
              <label htmlFor="network" className="text-sm font-medium text-black mr-3">
                Network:
              </label>
              <select
                id="network"
                value={selectedNetwork}
                onChange={(e) => setSelectedNetwork(e.target.value)}
                className="px-3 py-2 bg-white border border-black text-black rounded-lg focus:border-black focus:outline-none"
              >
                <option value="mainnet">Mainnet</option>
                <option value="testnet">Testnet</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              VeChain Transaction Explainer
            </h2>
            <p className="text-black">
              Paste a VeChain transaction hash to get a plain English explanation
            </p>
          </div>

          {/* Transaction Input */}
          <div className="mb-8">
            <div className="space-y-4">
              <div>
                <label htmlFor="hash" className="block text-sm font-medium mb-2">
                  Transaction Hash
                </label>
                <input
                  id="hash"
                  type="text"
                  value={transactionHash}
                  onChange={(e) => handleHashChange(e.target.value)}
                  placeholder="0x..."
                  className="w-full px-4 py-3 bg-white border border-black text-black placeholder-gray-500 rounded-lg focus:border-black focus:outline-none"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-8">
              <div className="inline-block w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-2 text-black">Fetching transaction data...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-300 rounded-lg p-6">
              <h3 className="text-lg font-bold text-red-800 mb-2">Error</h3>
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Results */}
          {results && (
            <div className="w-full space-y-6">
              {/* Transaction Summary */}
              <div className="bg-white border border-black rounded-lg p-4 md:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
                  <h3 className="text-lg md:text-xl font-bold">Transaction Summary</h3>
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded w-fit border border-green-300">
                    {results.technical.status}
                  </span>
                </div>
                <div 
                  className="text-black text-sm md:text-base leading-relaxed max-w-none break-words"
                  dangerouslySetInnerHTML={{
                    __html: results.explanation
                      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-black">$1</strong>')
                      .replace(/\*(.*?)\*/g, '<em class="italic text-gray-700">$1</em>')
                      .replace(/#(\d+)/g, '<span class="font-mono text-sm px-1 rounded bg-gray-100 text-black">#$1</span>')
                      .replace(/0x[a-fA-F0-9]{40}/g, '<code class="font-mono text-xs px-1 rounded break-all bg-gray-100 text-black">$&</code>')
                      .replace(/\n\n/g, '</p><p class="mt-4">')
                      .replace(/\n/g, '<br>')
                      .replace(/^/, '<p>')
                      .replace(/$/, '</p>')
                  }}
                />
              </div>

              {/* Technical Details */}
              <div className="bg-white border border-black rounded-lg p-4 md:p-6">
                <h3 className="text-lg md:text-xl font-bold mb-4 md:mb-6">Technical Details</h3>
                <div className="grid grid-cols-1 gap-4 md:gap-6">
                  <div className="space-y-3 md:space-y-4">
                    <div className="border-b border-gray-300 pb-2 md:pb-3">
                      <div className="text-xs md:text-sm font-medium text-gray-600 mb-1">From Address</div>
                      <div className="font-mono text-xs md:text-sm text-black break-all">{results.technical.from}</div>
                    </div>
                    <div className="border-b border-gray-300 pb-2 md:pb-3">
                      <div className="text-xs md:text-sm font-medium text-gray-600 mb-1">To Address</div>
                      <div className="font-mono text-xs md:text-sm text-black break-all">{results.technical.to}</div>
                    </div>
                    <div className="border-b border-gray-300 pb-2 md:pb-3">
                      <div className="text-xs md:text-sm font-medium text-gray-600 mb-1">Value Transferred</div>
                      <div className="text-sm md:text-base text-black font-semibold">{results.technical.value}</div>
                    </div>
                    <div className="border-b border-gray-300 pb-2 md:pb-3">
                      <div className="text-xs md:text-sm font-medium text-gray-600 mb-1">Gas Limit / Used</div>
                      <div className="text-sm md:text-base text-black">{results.technical.gas} / {results.technical.gasUsed}</div>
                    </div>
                    <div className="border-b border-gray-300 pb-2 md:pb-3">
                      <div className="text-xs md:text-sm font-medium text-gray-600 mb-1">Block Number</div>
                      <div className="text-sm md:text-base text-black">{results.technical.blockNumber.toLocaleString()}</div>
                    </div>
                    <div className="border-b border-gray-300 pb-2 md:pb-3">
                      <div className="text-xs md:text-sm font-medium text-gray-600 mb-1">Timestamp</div>
                      <div className="text-sm md:text-base text-black">{new Date(results.technical.timestamp * 1000).toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Transaction Hash */}
              <div className="bg-white border border-black rounded-lg p-4 md:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 gap-2">
                  <h3 className="text-lg md:text-xl font-bold">Transaction Hash</h3>
                  <a
                    href={`https://vechainstats.com/transaction/${transactionHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 text-sm rounded bg-purple-600 hover:bg-purple-700 text-white inline-flex items-center gap-1 w-fit transition-colors duration-200"
                  >
                    🔗 VeChainStats
                  </a>
                </div>
                <div className="font-mono text-xs md:text-sm text-white break-all bg-black border border-gray-300 p-2 md:p-3 rounded overflow-hidden">
                  {transactionHash}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
