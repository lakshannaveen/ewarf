import { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

const useOtherCharges = () => {
  const [otherChargesRows, setOtherChargesRows] = useState([]);
  const [selectedRowIndex, setSelectedRowIndex] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [attachmentDescription, setAttachmentDescription] = useState([]);
  const [isEditDisabled, setIsEditDisabled] = useState(false);
  
  const storedVoucherNo = localStorage.getItem("selectedVoucherNo");
  const storedYear = localStorage.getItem("selectedYear");
  const [custominvoice, setCustominvoice] = useState("");

  // Enhanced validation function
  const validateRow = (row) => {
    if (!row) return ["Row data is missing"];
    
    const errors = [];
    
    if (!row.calculation_type || row.calculation_type.trim() === "") {
      errors.push("Type is required.");
    }
    
    if (!row.amount || row.amount.toString().trim() === "") {
      errors.push("Amount is required.");
    } else if (isNaN(row.amount) || Number(row.amount) <= 0) {
      errors.push("Amount must be a valid positive number.");
    }
    
    if (!row.invoice_no || row.invoice_no.trim() === "") {
      errors.push("Invoice No is required.");
    } else if (row.invoice_no.length > 20) {
      errors.push("Invoice No must not exceed 20 characters.");
    }

    return errors;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [attachmentsRes, descriptionRes, detailsRes] = await Promise.all([
          axios.get(`https://esystems.cdl.lk/backend-test/ewharf/ValueList/GetOtheChragesDetails?year=${storedYear}&voucherno=${storedVoucherNo}`),
          axios.get(`https://esystems.cdl.lk/backend-test/ewharf/ValueList/CalculationDescription`),
          axios.get(`https://esystems.cdl.lk/backend-test/ewharf/ValueList/GetSettlDetails?year=${storedYear}&vno=${storedVoucherNo}`)
        ]);

        if (attachmentsRes.data?.ResultSet) {
          setOtherChargesRows(
            attachmentsRes.data.ResultSet.map(row => ({
              ...row,
              attachmentUrl: row.attachmentUrl || "",
              attachmentName: row.attachmentName || "",
              invoice_date: row.invoice_date || "",
            })).reverse()
          );
        }

        if (descriptionRes.data?.ResultSet) {
          setAttachmentDescription(descriptionRes.data.ResultSet);
        }

        if (detailsRes.data?.ResultSet?.[0]) {
          const data = detailsRes.data.ResultSet[0];
          setIsEditDisabled(data.invoiceStatus === "V3" || data.isWebPerforationComplete);
          setCustominvoice(data.customerInvNo || "");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        Swal.fire("Error", "Failed to load data", "error");
      }
    };

    if (storedVoucherNo && storedYear) fetchData();
  }, [storedVoucherNo, storedYear]);

  const handleEditClick = (index) => {
    if (isEditDisabled) {
      Swal.fire({
        title: "Action Denied",
        text: "The Valuation or Preparation is Completed! You can't edit anything, only can read.",
        icon: "warning",
        confirmButtonText: "OK",
      });
    } else if (index >= 0 && index < otherChargesRows.length) {
      setSelectedRowIndex(index);
      setIsPopupOpen(true);
    }
  };

  const handleAddRow = () => {
    if (isEditDisabled) {
      Swal.fire({
        title: "Action Denied",
        text: "The Valuation or Preparation is Completed! You can't edit anything, only can read.",
        icon: "warning",
        confirmButtonText: "OK",
      });
    } else {
      setOtherChargesRows(prev => [
        {
          id: Date.now(),
          calculation_type: "",
          amount: "",
          invoice_no: "",
          invoice_date: "",
          vehicle_no: "",
          attachmentUrl: "",
          attachmentName: "",
          calTypeDescription: "",
        },
        ...prev,
      ]);
    }
  };

  const handleSaveEdit = async (editedRow, file) => {
    const validationErrors = validateRow(editedRow);
    
    if (validationErrors.length > 0) {
      Swal.fire({
        title: "Validation Error",
        text: validationErrors.join("\n"),
        icon: "error",
        confirmButtonText: "OK",
      });
      return;
    }

    try {
      setOtherChargesRows(prev => 
        prev.map((row, i) => (i === selectedRowIndex ? editedRow : row))
      );

      if (file) {
        setSelectedFiles(prev => {
          const newFiles = [...prev];
          newFiles[selectedRowIndex] = file;
          return newFiles;
        });
      }

      setIsPopupOpen(false);
      Swal.fire({
        title: "Success",
        text: "Changes saved successfully!",
        icon: "success",
        timer: 2000,
      });
    } catch (error) {
      console.error("Save error:", error);
      Swal.fire("Error", "Failed to save changes", "error");
    }
  };

  const handleSaveOtherCharges = async () => {
    if (isEditDisabled) {
      Swal.fire({
        title: "Action Denied",
        text: "The Valuation or Preparation is Completed! You can't edit anything, only can read.",
        icon: "warning",
        confirmButtonText: "OK",
      });
      return;
    }

    // Validate all rows
    const validationErrors = [];
    otherChargesRows.forEach((row, i) => {
      const errors = validateRow(row);
      if (errors.length > 0) {
        validationErrors.push(`Row ${i + 1}: ${errors.join(", ")}`);
      }
    });

    if (validationErrors.length > 0) {
      Swal.fire({
        title: "Validation Errors",
        text: validationErrors.join("\n"),
        icon: "error",
        confirmButtonText: "OK",
      });
      return;
    }

    try {
      // Save data logic here
      // ...

      Swal.fire({
        title: "Success",
        text: "All changes saved successfully!",
        icon: "success",
        timer: 2000,
      });
    } catch (error) {
      console.error("Save error:", error);
      Swal.fire("Error", "Failed to save changes", "error");
    }
  };

  const handlePreviewClick = (fileData, attachmentUrl) => {
    // Preview logic here
  };

  return {
    otherChargesRows,
    isEditDisabled,
    selectedFiles,
    handleEditClick,
    handleAddRow,
    handleSaveOtherCharges,
    handleSaveEdit,
    handlePreviewClick,
    selectedRowIndex,
    isPopupOpen,
    setIsPopupOpen,
    attachmentDescription,
    storedVoucherNo,
    storedYear,
    custominvoice
  };
};

export default useOtherCharges;