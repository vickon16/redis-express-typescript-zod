import { ravenInstance } from "./index.js";

// Helper to generate reference
export const generateReferenceNumber = () =>
  Math.floor(1000000000 + Math.random() * 9000000000);

export const getBanks = async () => {
  const response = await ravenInstance<BanksResponse>({
    method: "get",
    url: "/banks",
  });

  if (!response.data || response.data.status !== "success") {
    throw new Error("Failed to get banks");
  }

  return response.data.data;
};
