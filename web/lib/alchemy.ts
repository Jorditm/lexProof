import { Network, Alchemy } from "alchemy-sdk";
// Optional Config object, but defaults to demo api-key and eth-mainnet.
const settings = {
  apiKey: "kESIFKBhxWRrmPQ7tpj98U4OlUt54pPA", // Replace with your Alchemy API Key.
  network: Network.ETH_SEPOLIA, // Replace with your network.
};
const alchemy = new Alchemy(settings);

export const getEmailNfts = async (address: `0x${string})`) => {
  const nftsForOwner = await alchemy.nft.getNftsForOwner(address, {
    contractAddresses: ["0xeab42b3a285165c11fb3bb7c12a3043b78615fac"],
  });
  return nftsForOwner;
};
