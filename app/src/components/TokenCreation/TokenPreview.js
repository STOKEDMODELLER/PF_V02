import { createElement, useEffect, useState } from "react";

export default function TokenPreview({ tokenData, onCreateToken, onClose }) {
  const SOL_ADDRESS = "So11111111111111111111111111111111111111112";
  const NETWORK_FEE_USD = 1.27; // Fixed network fee in USD
  const [solPrice, setSolPrice] = useState(null);
  const [solEquivalent, setSolEquivalent] = useState(null);

  const fetchSolPrice = async () => {
    try {
      const response = await fetch(`https://api.jup.ag/price/v2?ids=${SOL_ADDRESS}`);
      const data = await response.json();
      const price = data?.data[SOL_ADDRESS]?.price || null;
      setSolPrice(price);
      if (price) {
        setSolEquivalent((NETWORK_FEE_USD / price).toFixed(4));
      }
    } catch (error) {
      console.error("Error fetching SOL price:", error);
      setSolPrice(null);
      setSolEquivalent(null);
    }
  };

  useEffect(() => {
    fetchSolPrice();
  }, []);

  return createElement(
    "div",
    {
      className: `
        fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-0 transition-opacity duration-300 animate-backdropFadeIn
      `,
      role: "dialog",
      "aria-labelledby": "token-preview",
    },
    createElement(
      "div",
      {
        className: `
          relative max-w-md w-full transform bg-gradient-to-b from-[#1B1D36] to-[#121427] text-white rounded-xl shadow-xl p-6 space-y-6 transition-transform duration-300 animate-modalSlideUp
        `,
        style: { animationTimingFunction: "ease-in-out" },
      },
      createElement(
        "button",
        {
          onClick: onClose,
          className: `
            absolute top-4 right-4 text-gray-400 hover:text-gray-200 focus:ring focus:ring-blue-500 rounded-full text-lg
          `,
          "aria-label": "Close modal",
        },
        "✕"
      ),
      createElement(
        "h3",
        { className: "text-xl font-medium text-center" },
        "Preview Token"
      ),
      createElement(
        "div",
        { className: "flex flex-col items-center gap-4" },
        createElement("img", {
          src: tokenData?.image || "/placeholder.png",
          alt: "Token Preview",
          className: "h-28 w-28 rounded-full object-cover shadow-lg",
        }),
        createElement(
          "div",
          {
            className:
              "text-xl font-medium text-center bg-gradient-to-r from-blue-500 to-green-400 text-transparent bg-clip-text",
          },
          tokenData.name || "preview"
        ),
        createElement(
          "div",
          { className: "text-lg font-light text-gray-300" },
          tokenData.symbol || "N/A"
        )
      ),
      createElement(
        "div",
        { className: "space-y-2 text-sm text-left border-t border-gray-700 pt-4" },
        createElement(
          "p",
          null,
          createElement("span", { className: "font-semibold" }, "Token Mint Address: "),
          createElement(
            "span",
            { className: "font-mono break-all text-gray-400" },
            tokenData.mintAddress || "ALLt...rjkr"
          )
        ),
        createElement(
          "p",
          null,
          createElement("span", { className: "font-semibold" }, "Supply: "),
          tokenData.supply || "100,000,000"
        ),
        createElement(
          "p",
          null,
          createElement("span", { className: "font-semibold" }, "Network: "),
          "solana"
        ),
        createElement(
          "p",
          null,
          createElement("span", { className: "font-semibold" }, "Network fee: "),
          solPrice !== null
            ? `$${NETWORK_FEE_USD} ≈ ${solEquivalent} SOL`
            : "Loading SOL price..."
        )
      ),
      createElement(
        "div",
        { className: "space-y-4 mt-4" },
        createElement(
          "button",
          {
            className: `
              w-full py-3 text-lg font-semibold bg-gradient-to-b from-[#F7D16E] to-[#F6C955] text-gray-900 rounded-md shadow-lg hover:brightness-110 transition-all duration-200
            `,
            onClick: onCreateToken,
          },
          "Create Token"
        ),
        createElement(
          "p",
          { className: "text-xs text-gray-400 text-center" },
          "By selecting ‘Create Token’ above, you certify that you are not a “U.S. person” as defined in 17 CFR 230.902(k), acting on behalf of a U.S. person, or creating this token with the intent to sell it to a U.S. person."
        ),
        createElement(
          "button",
          {
            className: `
              w-full py-3 text-lg font-semibold bg-gradient-to-b from-gray-700 to-gray-800 text-gray-300 rounded-md shadow-lg hover:brightness-110 transition-all duration-200
            `,
            onClick: onClose,
          },
          "Cancel"
        )
      )
    )
  );
}
