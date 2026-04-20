export const validateRow = (row) => {
  const errors = [];

  if (!row.calculation_type || row.calculation_type.trim() === "") {
    errors.push("Type is required.");
  }

  if (!row.amount || row.amount.trim() === "") {
    errors.push("Amount is required.");
  } else if (isNaN(row.amount) || Number(row.amount) <= 0) {
    errors.push("Amount must be a valid positive number.");
  }

  if (!row.invoice_no || row.invoice_no.trim() === "") {
    errors.push("Invoice No is required.");
  } else if (row.invoice_no.length > 20) {
    errors.push("Invoice No must not exceed 20 characters.");
  } else if (!/^[a-zA-Z0-9-/]+$/.test(row.invoice_no)) {
    errors.push("Invoice No must be alphanumeric (letters, numbers, or hyphens only).");
  }

  if (row.vehicle_no && row.vehicle_no.trim() !== "") {
    if (row.vehicle_no.length > 15) {
      errors.push("Vehicle No must not exceed 15 characters.");
    } else if (!/^[a-zA-Z0-9-]+$/.test(row.vehicle_no)) {
      errors.push("Vehicle No must be alphanumeric (letters, numbers, or hyphens only).");
    }
  }

  return errors;
};