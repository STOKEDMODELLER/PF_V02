export function validateTokenInputs({ name, symbol, supply }) {
  const errors = {};
  if (!name.trim()) errors.name = "Token name is required.";
  if (!symbol.trim()) errors.symbol = "Token symbol is required.";
  if (!supply || isNaN(supply) || Number(supply) <= 0) {
    errors.supply = "Supply must be a positive number.";
  }
  return errors;
}
