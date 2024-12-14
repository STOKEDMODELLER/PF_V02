import { useEffect, useState, useRef } from "react";

export default function TokenCreationForm({ onPreview, isLoading }) {
  const [formData, setFormData] = useState({
    name: "",
    symbol: "",
    description: "",
    image: null,
    supply: "",
    mintAddress: "",
  });

  const [isFormValid, setIsFormValid] = useState(false);
  const fileInputRef = useRef(null);

  const generateRandomMintAddress = () => {
    return Array(44)
      .fill(0)
      .map(() => Math.random().toString(36)[2])
      .join("");
  };

  useEffect(() => {
    setFormData((prev) => ({ ...prev, mintAddress: generateRandomMintAddress() }));
  }, []);

  useEffect(() => {
    const isValid =
      formData.name.trim().length > 0 &&
      formData.symbol.trim().length > 0 &&
      formData.supply.trim().length > 0 &&
      Number(formData.supply) > 0 &&
      formData.image !== null;
    setIsFormValid(isValid);
  }, [formData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRandomiseMintAddress = () => {
    const newMintAddress = generateRandomMintAddress();
    setFormData((prev) => ({ ...prev, mintAddress: newMintAddress }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image: URL.createObjectURL(file) }));
    }
  };

  const handleImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handlePreviewClick = (e) => {
    e.preventDefault();
    if (!isFormValid) return;
    onPreview(formData);
  };

  return (
    <form className="space-y-6 flex flex-col" onSubmit={(e) => e.preventDefault()}>
      <div className="w-full flex flex-col gap-y-3">
        <label className="flex items-center text-slate-50 font-medium">
          Token Name
        </label>
        <input
          type="text"
          name="name"
          placeholder="e.g., Orca"
          value={formData.name}
          onChange={handleInputChange}
          className="h-12 px-4 bg-gray-900 text-white rounded-md border border-transparent focus:ring focus:ring-blue-500 shadow-md"
          disabled={isLoading}
          required
        />
      </div>

      <div className="w-full flex flex-col gap-y-3">
        <label className="flex items-center text-slate-50 font-medium">
          Symbol
        </label>
        <input
          type="text"
          name="symbol"
          placeholder="e.g., ORCA"
          value={formData.symbol}
          onChange={handleInputChange}
          className="h-12 px-4 bg-gray-900 text-white rounded-md border border-transparent focus:ring focus:ring-blue-500 shadow-md"
          disabled={isLoading}
          required
        />
      </div>

      <div className="w-full flex flex-col gap-y-3">
        <label className="flex items-center text-slate-50 font-medium">
          Token Mint Address
        </label>
        <div className="flex items-center justify-between bg-gray-800 text-gray-300 rounded-md px-4 py-2 shadow-md">
          <span className="truncate">{formData.mintAddress}</span>
          <button
            type="button"
            onClick={handleRandomiseMintAddress}
            className="ml-3 px-3 py-1 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 disabled:bg-gray-500"
            disabled={isLoading}
          >
            Randomise
          </button>
        </div>
      </div>

      <div className="w-full flex flex-col gap-y-3">
        <label className="flex items-center text-slate-50 font-medium">
          Description (Optional)
        </label>
        <textarea
          name="description"
          placeholder="Describe your token's purpose, story, or vision."
          value={formData.description}
          onChange={handleInputChange}
          className="h-20 px-4 py-2 bg-gray-900 text-white rounded-md resize-none border border-transparent focus:ring focus:ring-blue-500 shadow-md"
          disabled={isLoading}
        />
      </div>

      <div className="w-full flex flex-col gap-y-3">
        <label className="flex items-center text-slate-50 font-medium">
          Token Image
        </label>
        <div
          className="flex flex-col items-center justify-center h-28 bg-gray-800 text-gray-400 rounded-md cursor-pointer border-dashed border-2 border-gray-500 shadow-md"
          onClick={handleImageClick}
        >
          {formData.image ? (
            <img src={formData.image} alt="Token" className="h-16 w-16 rounded-full object-cover" />
          ) : (
            <span>Click to upload image</span>
          )}
          <input
            type="file"
            accept="image/png, image/jpeg"
            ref={fileInputRef}
            className="hidden"
            onChange={handleImageUpload}
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="w-full flex flex-col gap-y-3">
        <label className="flex items-center text-slate-50 font-medium">
          Token Supply
        </label>
        <input
          type="number"
          name="supply"
          placeholder="e.g., 100,000,000"
          value={formData.supply}
          onChange={handleInputChange}
          className="h-12 px-4 bg-gray-900 text-white rounded-md border border-transparent focus:ring focus:ring-blue-500 shadow-md"
          disabled={isLoading}
          required
        />
      </div>

      <button
        type="button"
        onClick={handlePreviewClick}
        className={`mt-6 w-full py-3 font-semibold rounded-md shadow-md ${
          isFormValid
            ? "bg-blue-600 text-white hover:bg-blue-700"
            : "bg-gray-500 text-gray-300 cursor-not-allowed"
        }`}
        disabled={!isFormValid || isLoading}
      >
        {isLoading ? "Processing..." : "Preview Token"}
      </button>
    </form>
  );
}
