// Import from the polygon-mcp package
import { mcp_polygon_deploy_property_nft, mcp_polygon_call_contract } from 'polygon-mcp';

// Store deployed NFT contract address
let PROPERTY_NFT_ADDRESS: string | null = null;

// NFT Contract ABI (simplified version)
const NFT_ABI = [
    {
        "inputs": [
            {"name": "discordId", "type": "string"},
            {"name": "location", "type": "string"},
            {"name": "latitude", "type": "string"},
            {"name": "longitude", "type": "string"},
            {"name": "propertyType", "type": "string"}
        ],
        "name": "mint",
        "outputs": [{"name": "tokenId", "type": "uint256"}],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];

export interface RegistrationResult {
    contractAddress: string;
    tokenId: string;
    transactionHash: string;
}

export async function handleRegistration(
    discordId: string,
    location: string,
    latitude: number,
    longitude: number,
    propertyType: string
): Promise<RegistrationResult> {
    try {
        // Deploy NFT contract if not already deployed
        if (!PROPERTY_NFT_ADDRESS) {
            const deployResult = await mcp_polygon_deploy_property_nft({
                random_string: "init"
            });
            if (!deployResult.contractAddress) {
                throw new Error('Failed to deploy NFT contract');
            }
            PROPERTY_NFT_ADDRESS = deployResult.contractAddress;
            console.log(`Deployed PropertyNFT contract at: ${PROPERTY_NFT_ADDRESS}`);
        }

        if (!PROPERTY_NFT_ADDRESS) {
            throw new Error('NFT contract address not available');
        }

        // Mint NFT
        const mintResult = await mcp_polygon_call_contract({
            contractAddress: PROPERTY_NFT_ADDRESS,
            functionName: "mint",
            abi: JSON.stringify(NFT_ABI),
            functionArgs: [
                discordId,
                location,
                latitude.toString(),
                longitude.toString(),
                propertyType
            ]
        });

        return {
            contractAddress: PROPERTY_NFT_ADDRESS,
            tokenId: mintResult.tokenId,
            transactionHash: mintResult.transactionHash
        };
    } catch (error: any) {
        console.error('Registration error:', error);
        throw new Error(`Failed to register property: ${error.message}`);
    }
} 