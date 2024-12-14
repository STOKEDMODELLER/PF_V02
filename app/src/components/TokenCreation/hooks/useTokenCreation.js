import { useState } from "react";
import { createUserToken } from "../services/tokenService";
import { useAnchorProvider } from "../../../utils/anchorProvider";
import { validateTokenInputs } from "../validations/tokenValidation";

export function useTokenCreation() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const provider = useAnchorProvider();

  const createToken = async (data) => {
    setError(null);
    const errors = validateTokenInputs(data);

    if (Object.keys(errors).length > 0) {
      setError(errors);
      console.error("Validation errors in token inputs:", errors);
      return null;
    }

    setIsLoading(true);

    try {
      const createdToken = await createUserToken({
        provider,
        name: data.name,
        symbol: data.symbol,
        supply: Number(data.supply),
      });
      console.log("Token created successfully:", createdToken);
      return createdToken;
    } catch (error) {
      console.error("Error creating token:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    createToken,
  };
}
