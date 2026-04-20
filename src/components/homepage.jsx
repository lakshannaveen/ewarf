import Swal from "sweetalert2";
import React, { useState, useEffect } from "react";
import Header from "./Header";
import axios from "axios";
import OtherCharges from "../components/OtherChages";

const errorSound = new Audio("/error-sound.mp3");

const ShipmentForm = () => {
  const [otherChargesRows, setOtherChargesRows] = useState([]);
  const [container20, setContainer20] = useState(false);
  const [container40, setContainer40] = useState(false);
  const [container45, setContainer45] = useState(false);
  const [details, setDetails] = useState({});
  const [selectedRow, setSelectedRow] = useState(null);
  const [selectedRowData, setSelectedRowData] = useState(null);
  const [sidebardetails, setSidebardetails] = useState([]);
  const [podetails, setPodetails] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPayee, setSelectedPayee] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [attachmentDescription, setAttachmentDescription] = useState([]);
  const [custominvoice, setCustominvoice] = useState("");
  const [isWebPerforationComplete, setIsWebPerforationComplete] = useState(false);

  // History modal state
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const rowsPerPage = 10;
  const storedVoucherNo = localStorage.getItem("selectedVoucherNo");
  const storedYear = localStorage.getItem("selectedYear");

  // Helper function to format empty values as "N/A"
  const formatValue = (value) => {
    if (value === null || value === undefined || value === "") {
      return "N/A";
    }
    return value;
  };

  // Get unique payees from the data
  const payees = [...new Set(sidebardetails.map(row => row.payee || "Unknown"))];

  // Filtered data based on search and payee
  const filteredData = sidebardetails.filter(
    (row) =>
      (selectedPayee === "" || row.payee === selectedPayee) &&
      (row.msd_year.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.fileno.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.voucher_no.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const isValuationCompleted = details.invoiceStatus === "Valuation Completed";
  const isWebPrepCompleted = details.status === "Web Preparation Completed";
  const isEditDisabled = isValuationCompleted || isWebPerforationComplete || isWebPrepCompleted;

  // Keep main company name in localStorage for other components to use
  useEffect(() => {
    try {
      const mainCompany = details?.v_supplier || details?.company || "";
      if (mainCompany) localStorage.setItem('comname', mainCompany);
    } catch (e) {
      console.warn('Unable to sync comname to localStorage', e);
    }
  }, [details]);

  const playErrorSound = () => {
    errorSound.play().catch((error) => {
      console.error("Error playing sound:", error);
    });
  };

  const showErrorToast = (title, text) => {
    playErrorSound();
    Swal.fire({
      title,
      text,
      icon: "error",
      confirmButtonText: "OK",
    });
  };

  const showValuationCompletedMessage = () => {
    Swal.fire({
      title: "Action Denied",
      text: "The Valuation or Preparation is Completed! You can't edit anything, only can read.",
      icon: "warning",
      confirmButtonText: "OK",
    });
  };

  const showValuationCompletedPopup = () => {
    Swal.fire({
      title: "Valuation Completed",
      text: "Valuation is Completed, you don't have any access to edit or add data (For more details please contact Wharf Department)",
      icon: "success",
      confirmButtonText: "OK",
      position: "center",
    });
  };

  const showWebPreparationCompletedPopup = () => {
    Swal.fire({
      title: "Web Preparation Completed",
      text: "Web preparation is already completed for this shipment. Editing is disabled.",
      icon: "warning",
      confirmButtonText: "OK",
    });
  };

  const formatNumberWithCommas = (number) => {
    if (!number || isNaN(number)) return "N/A";
    
    // Convert to number and format with 2 decimal places
    const num = Number(number);
    
    // Format with thousands separators and 2 decimal places
    return num.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date)) return "N/A";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleRowSelect = (index, row) => {
    setSelectedRow(index);
    setSelectedRowData(row);
    localStorage.setItem("selectedVoucherNo", row.voucher_no);
    localStorage.setItem("selectedYear", row.msd_year);

    const fetchDetailsAndCheck = async () => {
      try {
        const response = await axios.get(
          `https://esystems.cdl.lk/backend-test/ewharf/ValueList/GetSettlDetails?year=${row.msd_year}&vno=${row.voucher_no}`,
          { timeout: 10000 }
        );
        if (response.data && response.data.ResultSet.length > 0) {
          const data = response.data.ResultSet[0];

          if (data.invoiceStatus === "") {
            data.invoiceStatus = "Pending";
          } else if (data.invoiceStatus === "V0") {
            data.invoiceStatus = "Not Completed";
          } else if (data.invoiceStatus === "V1") {
            data.invoiceStatus = "Invoice Registered";
          } else if (data.invoiceStatus === "V3") {
            data.invoiceStatus = "Valuation Completed";
          }

          setCustominvoice(data.customerInvNo);
          setContainer20(!!data.container_20);
          setContainer40(!!data.container_40);
          setContainer45(!!data.container_44 && !!data.container_45);
          setIsWebPerforationComplete(data.isWebPerforationComplete || false);
          setDetails(data);

          // Store main company name in localStorage so child components can prefill company fields
          try {
            const mainCompanyName = data.v_supplier || data.company || "";
            if (mainCompanyName) {
              localStorage.setItem('comname', mainCompanyName);
            }
          } catch (e) {
            console.warn('Unable to store company name in localStorage', e);
          }

          if (data.invoiceStatus === "Valuation Completed") {
            showValuationCompletedPopup();
          }
          
          if (data.status === "Web Preparation Completed") {
            showWebPreparationCompletedPopup();
          }
        }
      } catch (error) {
        console.error("Error checking valuation status:", error.message);
        showErrorToast("Error", "Failed to check valuation status");
      }
    };

    fetchDetailsAndCheck();
  };

  // Load Other Charges Data
  const loadOtherChargesData = async (year, voucherNo) => {
    try {
      const response = await axios.get(
        `https://esystems.cdl.lk/backend-test/ewharf/ValueList/GetOtheChragesDetails?year=${year}&voucherno=${voucherNo}`,
        { timeout: 10000 }
      );
      if (response.data && response.data.ResultSet) {
        const updatedData = response.data.ResultSet.map((row) => ({
          ...row,
          attachmentUrl: row.image_path || "",
          attachmentName: row.attachment_name || "",
          invoice_date: row.invoice_date || "",
          calTypeDescription: row.cal_type_description || "",
          isPartyClearance: !row.is_third_party,
          isThirdParty: row.is_third_party || false,
          thirdPartyDetails: row.is_third_party ? {
            type: row.third_party_type || "",
            company: row.company || "",
            rows: row.third_party_charges || []
          } : null
        }));
        setOtherChargesRows(updatedData);
      }
    } catch (error) {
      console.error("Error loading other charges:", error.message);
    }
  };

  // Load Attachment Description - UPDATED API with parameters
  const loadAttachmentDescription = async (year, voucherNo) => {
    try {
      const response = await axios.get(
        `https://esystems.cdl.lk/backend-test/ewharf/ValueList/OtherCalculationtype?year=${year}&vno=${voucherNo}`
      );
      const data = response.data?.ResultSet || [];
      setAttachmentDescription(data);
    } catch (error) {
      console.error("Error loading attachment description:", error.message);
    }
  };

  // Updated fetchSidebardetails function using sidebar logic
  const fetchSidebardetails = async () => {
    setIsLoading(true);
    try {
      const user = localStorage.getItem("comid");
      const response = await axios.get(
        `https://esystems.cdl.lk/backend-test/ewharf/ValueList/GetSellleMenuDetails?suppliercode=${user}`
      );
      if (response.data && response.data.ResultSet) {
        setSidebardetails(response.data.ResultSet);
      }
    } catch (error) {
      console.error("Error fetching sidebar details:", error.message);
      showErrorToast("Error", "Failed to load sidebar details");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSidebardetails();
    // Initial load without parameters (will load when row is selected)
    // setAttachmentDescription([]); // Clear initial data
  }, []);

  useEffect(() => {
    if (!storedVoucherNo || !storedYear) {
      return;
    }

    const fetchDetails = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(
          `https://esystems.cdl.lk/backend-test/ewharf/ValueList/GetSettlDetails?year=${storedYear}&vno=${storedVoucherNo}`,
          { timeout: 10000 }
        );
        if (response.data && response.data.ResultSet.length > 0) {
          const data = response.data.ResultSet[0];

          if (data.invoiceStatus === "") {
            data.invoiceStatus = "Pending";
          } else if (data.invoiceStatus === "V0") {
            data.invoiceStatus = "Not Completed";
          } else if (data.invoiceStatus === "V1") {
            data.invoiceStatus = "Invoice Registered";
          } else if (data.invoiceStatus === "V3") {
            data.invoiceStatus = "Valuation Completed";
          }

          setCustominvoice(data.customerInvNo);
          setContainer20(!!data.container_20);
          setContainer40(!!data.container_40);
          setContainer45(!!data.container_44 && !!data.container_45);
          setIsWebPerforationComplete(data.isWebPerforationComplete || false);
          setDetails(data);

          if (data.status === "Web Preparation Completed") {
            showWebPreparationCompletedPopup();
          }
        }
      } catch (error) {
        console.error("Error fetching details:", error.message);
        showErrorToast("Error", "Failed to load shipment details");
      } finally {
        setIsLoading(false);
      }
    };

    const fetchpodetails = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(
          `https://esystems.cdl.lk/backend-test/ewharf/ValueList/GetPODetails?year=${storedYear}&vno=${storedVoucherNo}`,
          { timeout: 10000 }
        );
        if (response.data && response.data.ResultSet) {
          setPodetails(response.data.ResultSet);
        }
      } catch (error) {
        console.error("Error fetching PO details:", error.message);
        showErrorToast("Error", "Failed to load PO details");
      } finally {
        setIsLoading(false);
      }
    };

    // Load other charges data and attachment description with parameters
    loadOtherChargesData(storedYear, storedVoucherNo);
    loadAttachmentDescription(storedYear, storedVoucherNo);
    fetchpodetails();
    fetchDetails();
  }, [storedVoucherNo, storedYear]);

  // Update handleRowSelect to load attachment description when a row is selected
  const handleRowSelectUpdated = (index, row) => {
    setSelectedRow(index);
    setSelectedRowData(row);
    localStorage.setItem("selectedVoucherNo", row.voucher_no);
    localStorage.setItem("selectedYear", row.msd_year);

    const fetchDetailsAndCheck = async () => {
      try {
        const response = await axios.get(
          `https://esystems.cdl.lk/backend-test/ewharf/ValueList/GetSettlDetails?year=${row.msd_year}&vno=${row.voucher_no}`,
          { timeout: 10000 }
        );
        if (response.data && response.data.ResultSet.length > 0) {
          const data = response.data.ResultSet[0];

          if (data.invoiceStatus === "") {
            data.invoiceStatus = "Pending";
          } else if (data.invoiceStatus === "V0") {
            data.invoiceStatus = "Not Completed";
          } else if (data.invoiceStatus === "V1") {
            data.invoiceStatus = "Invoice Registered";
          } else if (data.invoiceStatus === "V3") {
            data.invoiceStatus = "Valuation Completed";
          }

          setCustominvoice(data.customerInvNo);
          setContainer20(!!data.container_20);
          setContainer40(!!data.container_40);
          setContainer45(!!data.container_44 && !!data.container_45);
          setIsWebPerforationComplete(data.isWebPerforationComplete || false);
          setDetails(data);

          // Load attachment description with parameters when row is selected
          loadAttachmentDescription(row.msd_year, row.voucher_no);

          if (data.invoiceStatus === "Valuation Completed") {
            showValuationCompletedPopup();
          }
          
          if (data.status === "Web Preparation Completed") {
            showWebPreparationCompletedPopup();
          }
        }
      } catch (error) {
        console.error("Error checking valuation status:", error.message);
        showErrorToast("Error", "Failed to check valuation status");
      }
    };

    fetchDetailsAndCheck();
  };

  const validateRow = (row) => {
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

  const handleSaveOtherCharges = async () => {
    if (isEditDisabled) {
      showValuationCompletedMessage();
      return;
    }

    try {
      const validationErrors = [];
      otherChargesRows.forEach((row, index) => {
        const errors = validateRow(row);
        if (errors.length > 0) {
          validationErrors.push(`Row ${index + 1}: ${errors.join(", ")}`);
        }
      });

      if (validationErrors.length > 0) {
        showErrorToast("Validation Error", validationErrors.join("\n"));
        return;
      }

      const settlementData = otherChargesRows.map((row) => ({
        vehno: row.vehicle_no || "",
        invdate: row.invoice_date || "",
        amount: row.amount || "",
        invno: row.invoice_no || "",
        lrate: "",
        ctype: row.calculation_type || "",
        rate: row.rate || "",
      }));

      await axios.post(
        `https://esystems.cdl.lk/backend-test/ewharf/ValueList/SetSettlementChrages`,
        {
          settlementDetails: settlementData,
          user: "2203579",
          year: storedYear,
          voucherno: storedVoucherNo,
        },
        { headers: { "Content-Type": "application/json" }, timeout: 10000 }
      );

      const filesToUpload = Object.entries(selectedFiles)
        .filter(([index]) => otherChargesRows[Number(index)])
        .map(([index, fileData]) => ({
          index: Number(index),
          file: fileData?.file,
          cal_type: otherChargesRows[Number(index)].calculation_type,
        }));

      if (filesToUpload.length > 0) {
        const formData = new FormData();
        filesToUpload.forEach(({ index, file, cal_type }, i) => {
          if (file) {
            formData.append(`FileUploadModels[${i}].ImageFile`, file);
            formData.append(`FileUploadModels[${i}].index`, index.toString());
            formData.append(`FileUploadModels[${i}].voucher_no`, storedVoucherNo);
            formData.append(`FileUploadModels[${i}].year`, storedYear);
            formData.append(`FileUploadModels[${i}].status`, "A");
            formData.append(`FileUploadModels[${i}].cal_type`, cal_type);
          }
        });

        const uploadResponse = await axios.post(
          `https://esystems.cdl.lk/backend-test/ewharf/ValueList/UploadFiles1?CusInvoNo=${custominvoice || ""}`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
            timeout: 30000,
          }
        );

        if (uploadResponse.data && uploadResponse.data.ResultSet) {
          const uploadedFiles = uploadResponse.data.ResultSet;
          setOtherChargesRows((prevRows) =>
            prevRows.map((row, idx) => {
              const uploadedFile = uploadedFiles.find((f) => f.index === idx);
              return uploadedFile
                ? {
                    ...row,
                    attachmentUrl: uploadedFile.fileUrl || "",
                    attachmentName: uploadedFile.fileName || row.attachmentName,
                  }
                : row;
            })
          );
        }
      }

      setSelectedFiles([]);

      Swal.fire({
        title: "Success",
        text: "Data and files saved successfully!",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });

      // Refresh data after save
      await loadOtherChargesData(storedYear, storedVoucherNo);
    } catch (error) {
      console.error("Save Error:", error);
      Swal.fire({
        title: "Error",
        text: error.response?.data?.message || error.message || "Failed to save data",
        icon: "error",
      });
    }
  };

  const handleWebPerforationComplete = async () => {
    setIsLoading(true);
    try {
      await axios.post(
        `https://esystems.cdl.lk/backend-test/ewharf/ValueList/updatepreparationcomplete?year=${storedYear}&vno=${storedVoucherNo}`,
        {},
        { timeout: 10000 }
      );

      setIsWebPerforationComplete(true);
      Swal.fire({
        title: "Web Preparation Completed",
        text: "Web preparation has been successfully completed. You can't edit anything in Other Charges section now.",
        icon: "success",
        confirmButtonText: "OK",
        position: "center",
      });
    } catch (error) {
      console.error("Error updating web preparation:", error.message);
      Swal.fire({
        title: "Error",
        text: error.response?.data?.message || "Failed to complete web preparation.",
        icon: "error",
        confirmButtonText: "OK",
        position: "center",
      });
      setIsWebPerforationComplete(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = (e) => {
    const selectedValue = e.target.value;
    if (selectedValue === "Preparation Complete" && !isWebPerforationComplete) {
      Swal.fire({
        title: "Confirm Web Preparation Completion",
        text: "Are you sure you want to mark this as Preparation Complete? This action cannot be undone.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, Complete",
        cancelButtonText: "No, Cancel",
      }).then((result) => {
        if (result.isConfirmed) {
          handleWebPerforationComplete();
        } else {
          e.target.value = "Un Complete";
        }
      });
    }
  };

  useEffect(() => {
    return () => {
      selectedFiles.forEach((file) => {
        if (file?.preview) URL.revokeObjectURL(file.preview);
      });
    };
  }, [selectedFiles]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header />
      {isLoading ? (
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <>
          <div className="bg-transparent p-6 border-gray-200">
            <div className="container mx-auto flex justify-between items-center">
              <h1 className="text-xl font-semibold text-indigo-700">
                {formatValue(details.clerkName)}
              </h1>
              <button className="hover:bg-indigo-50 text-white px-4 py-2 rounded-md text-sm"></button>
            </div>
          </div>

          {/* Mobile View - Other Charges at the top */}
          <div className="lg:hidden container mx-auto px-2 py-5 pb-0">
            <OtherCharges
              otherChargesRows={otherChargesRows}
              setOtherChargesRows={setOtherChargesRows}
              isEditDisabled={isEditDisabled}
              selectedFiles={selectedFiles}
              setSelectedFiles={setSelectedFiles}
              attachmentDescription={attachmentDescription}
              formatNumberWithCommas={formatNumberWithCommas}
              formatDateTime={formatDateTime}
              handleSaveOtherCharges={handleSaveOtherCharges}
              year={storedYear}
              voucherno={storedVoucherNo}
            />
          </div>

          <div className="container mx-auto px-2 py-2">
            <div className="flex flex-col space-y-6">
              <div className="order-1 lg:order-0 grid lg:grid-cols-[360px,1fr] gap-6">
                {/* Left Column: Select Row */}
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                  <div className="hidden lg:block h-[460px]">
                    <div className="bg-white rounded-lg overflow-hidden">
                      <div className="bg-indigo-50 p-4 border-b">
                        <h2 className="font-semibold text-indigo-700 flex items-center">
                          <span className="inline-block mr-2">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.518 4.674a1 1 0 00.95.69h4.91c.969 0 1.372 1.24.588 1.81l-3.974 2.89a1 1 0 00-.364 1.118l1.518 4.674c.3.921-.755 1.688-1.54 1.118l-3.974-2.89a1 1 0 00-1.176 0l-3.974 2.89c-.785.57-1.84-.197-1.54-1.118l1.518-4.674a1 1 0 00-.364-1.118l-3.974-2.89c-.784-.57-.38-1.81.588-1.81h4.91a1 1 0 00.95-.69l1.518-4.674z" />
                            </svg>
                          </span>
                          Select Row(S1,S2)
                        </h2>
                      </div>
                      <div className="p-3 space-y-2">
                        {/* Search Bar and History */}
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Search FILE_NO, YEAR or VOUCHER_NO..."
                            className="w-full py-1 px-4 rounded-md text-black border-[0.5px] border-black text-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                          <button
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded text-sm"
                            onClick={async () => {
                              // fetch history and open modal
                              const supplier = details.supplier_code || "";
                              setShowHistoryModal(true);
                              setHistoryLoading(true);
                              try {
                                const url = `http://localhost:51976/ValueList/GetSettleS8MenuDetails?suppliercode=${encodeURIComponent(
                                  supplier || "D1531"
                                )}`;
                                const resp = await axios.get(url);
                                setHistoryData(resp.data?.ResultSet || resp.data || []);
                              } catch (err) {
                                console.error(err);
                                setHistoryData([]);
                              } finally {
                                setHistoryLoading(false);
                              }
                            }}
                          >
                            History(S8)
                          </button>
                        </div>

                        <div className="border border-gray-300 rounded-lg overflow-hidden">
                          <div className="bg-gray-50">
                            <table className="w-full table-fixed border-collapse">
                              <colgroup>
                                <col style={{ width: "50px" }} />
                                <col style={{ width: "45%" }} />
                                <col style={{ width: "30%" }} />
                                <col style={{ width: "25%" }} />
                              </colgroup>
                              <thead>
                                <tr>
                                  <th className="py-1 px-2 border border-gray-300 text-center text-xs">
                                    ✔
                                  </th>
                                  <th className="py-1 px-2 border border-gray-300 text-left text-xs">
                                    File No
                                  </th>
                                  <th className="py-1 px-2 border border-gray-300 text-left text-xs">
                                    Voucher No
                                  </th>
                                  <th className="py-1 px-2 border border-gray-300 text-left text-xs">
                                    Year
                                  </th>
                                </tr>
                              </thead>
                            </table>
                          </div>
                          <div className="max-h-[440px] overflow-y-auto">
                            <table className="w-full table-fixed border-collapse">
                              <colgroup>
                                <col style={{ width: "50px" }} />
                                <col style={{ width: "45%" }} />
                                <col style={{ width: "30%" }} />
                                <col style={{ width: "25%" }} />
                              </colgroup>
                              <tbody>
                                {filteredData.length > 0 ? (
                                  filteredData.map((row, index) => (
                                    <tr
                                      key={index}
                                      className={`cursor-pointer transition ${
                                        selectedRow === index
                                          ? "bg-blue-500 text-white"
                                          : "hover:bg-indigo-50"
                                      }`}
                                      onClick={() => handleRowSelectUpdated(index, row)}
                                    >
                                      <td className="py-1 px-2 border border-gray-200 text-center">
                                        <input
                                          type="checkbox"
                                          checked={selectedRow === index}
                                          onChange={() => handleRowSelectUpdated(index, row)}
                                          className="h-3 w-3"
                                        />
                                      </td>
                                      <td className="py-1 px-1 border border-gray-200 text-sm">
                                        {formatValue(row.fileno)}
                                      </td>
                                      <td className="py-1 px-1 border border-gray-200 text-sm">
                                        {formatValue(row.voucher_no || row.voucher_no_text || row.voucherNo)}
                                      </td>
                                      <td className="py-1 px-1 border border-gray-200 text-sm">
                                        {formatValue(row.msd_year)}
                                      </td>
                                    </tr>
                                  ))
                                ) : (
                                  <tr>
                                    <td colSpan="4" className="py-2 px-2 border border-gray-200 text-center text-sm text-gray-500">
                                      No matching records found
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* History Modal (renders above the page) */}
                {showHistoryModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                    <div className="bg-white rounded-lg shadow-lg w-3/4 max-w-3xl">
                      <div className="flex justify-between items-center p-4 border-b">
                        <h3 className="text-lg font-semibold">History</h3>
                        <button
                          className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded"
                          onClick={() => setShowHistoryModal(false)}
                        >
                          Close
                        </button>
                      </div>
                      <div className="p-4">
                        <div className="border border-gray-200 rounded overflow-hidden">
                          <table className="w-full table-fixed border-collapse">
                            <colgroup>
                              <col style={{ width: "50px" }} />
                              <col />
                              <col />
                              <col style={{ width: "90px" }} />
                            </colgroup>
                            <thead>
                              <tr>
                                <th className="py-2 px-2 border border-gray-300 text-center text-xs">✔</th>
                                <th className="py-2 px-2 border border-gray-300 text-left text-xs">File No</th>
                                <th className="py-2 px-2 border border-gray-300 text-left text-xs">Voucher No</th>
                                <th className="py-2 px-2 border border-gray-300 text-left text-xs">Year</th>
                              </tr>
                            </thead>
                            <tbody>
                              {historyLoading ? (
                                <tr>
                                  <td colSpan="4" className="py-3 text-center">Loading...</td>
                                </tr>
                              ) : historyData && historyData.length > 0 ? (
                                historyData.map((r, i) => {
                                  const fileno = r.fileno || r.FileNo || r.file_no || "";
                                  const vno = r.voucher_no || r.voucherNo || r.VoucherNo || "";
                                  const year = r.msd_year || r.Year || r.year || "";
                                  const isChecked = selectedRowData && (selectedRowData.voucher_no === vno || selectedRowData.voucherNo === vno) && (selectedRowData.msd_year === year || selectedRowData.Year === year);
                                  return (
                                    <tr key={i} className={`cursor-pointer odd:bg-white even:bg-gray-50 ${isChecked ? "bg-blue-500 text-white" : ""}`} onClick={() => {
                                      // select this history row
                                      const foundIndex = sidebardetails.findIndex(sd => (sd.voucher_no === vno || sd.voucherNo === vno) && (sd.msd_year === year || sd.Year === year));
                                      const indexToUse = foundIndex >= 0 ? foundIndex : i;
                                      handleRowSelectUpdated(indexToUse, { fileno, voucher_no: vno, msd_year: year });
                                      setShowHistoryModal(false);
                                    }}>
                                      <td className="py-2 px-2 border border-gray-200 text-center">
                                        <input type="checkbox" checked={!!isChecked} onChange={(e) => {
                                          e.stopPropagation();
                                          const foundIndex = sidebardetails.findIndex(sd => (sd.voucher_no === vno || sd.voucherNo === vno) && (sd.msd_year === year || sd.Year === year));
                                          const indexToUse = foundIndex >= 0 ? foundIndex : i;
                                          handleRowSelectUpdated(indexToUse, { fileno, voucher_no: vno, msd_year: year });
                                          setShowHistoryModal(false);
                                        }} />
                                      </td>
                                      <td className="py-2 px-2 border border-gray-200 text-sm">{fileno}</td>
                                      <td className="py-2 px-2 border border-gray-200 text-sm">{vno}</td>
                                      <td className="py-2 px-2 border border-gray-200 text-sm">{year}</td>
                                    </tr>
                                  );
                                })
                              ) : (
                                <tr>
                                  <td colSpan="4" className="py-3 text-center text-sm text-gray-500">No records</td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Right Column: Shipment Details, Status & Payment, Consignment Information, Purchase Orders */}
                <div>
                  {/* Shipment Details Card */}
                  <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
                    <div className="bg-indigo-50 p-4 border-b">
                      <h2 className="font-semibold text-indigo-700 flex items-center">
                        <span className="inline-block mr-2">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 2a1 1 0 00-1 1v1H6a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V6a2 2 0 00-2-2h-3V3a1 1 0 00-1-1zm-1 8a1 1 0 112 0v3a1 1 0 11-2 0v-3z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </span>
                        Shipment Details
                      </h2>
                    </div>
                    <div className="p-3">
                      <div className="grid grid-cols-1 md:grid-cols-6 gap-2 text-sm">
                        {[
                          { label: "Date", key: "msd_date" },
                          { label: "Name", key: "clerkName" },
                          { label: "Operator", key: "clerk" },
                          { label: "Transport Type", key: "transport_type" },
                          { label: "Vessel Name/Flight No", key: "transport_mode" },
                          { label: "Consignment Details", key: "consignment_details" },
                        ].map((item, index) => (
                          <div key={index} className="mb-2">
                            <label className="block text-gray-600 text-xs mb-1">{item.label}</label>
                            {item.key === "consignment_details" ? (
                              <textarea
                                className="border border-gray-300 rounded w-full py-1 px-2 text-sm bg-gray-50 resize-none h-[40px]"
                                value={formatValue(details[item.key])}
                                readOnly
                              />
                            ) : (
                              <input
                                type="text"
                                className="border border-gray-300 rounded w-full py-1 px-2 text-sm bg-gray-50"
                                value={formatValue(details[item.key])}
                                readOnly
                              />
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 grid grid-cols-1 md:grid-cols-6 gap-2 text-sm">
                        {[
                          { label: "Vessel/Flight Arrival", key: "vesselflight_arrivaldate" },
                          { label: "Voucher Details", key: "voucher_no" },
                          { label: "Invoice Details", key: "customerInvNo" },
                          { label: "B.L/AWB No", key: "blawb_no" },
                          { label: "Delivery Location", key: "deliverylocation" },
                        ].map((item, index) => (
                          <div key={index} className="mb-2">
                            <label className="block text-gray-600 text-xs mb-1">{item.label}</label>
                            <input
                              type="text"
                              className="border border-gray-300 rounded w-full py-1 px-2 text-sm bg-gray-50"
                              value={formatValue(details[item.key])}
                              readOnly
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Status & Payment, Consignment Information, and Purchase Orders in the Same Row */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-0">
                    {/* Status & Payment Card */}
                    {details.status && (
                      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                        <div className="bg-indigo-50 p-4 border-b">
                          <h2 className="font-semibold text-indigo-700 flex items-center">
                            <span className="inline-block mr-2">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </span>
                            Status & Payment
                          </h2>
                        </div>
                        <div className="p-3">
                          <div className="grid grid-cols-1 md:grid-cols-1 gap-2 text-sm">
                            <div className="mb-2">
                              <label className="block text-gray-600 text-xs mb-1">Status</label>
                              <input
                                type="text"
                                className="border border-gray-300 rounded w-2/3 py-1 px-2 text-sm bg-gray-50"
                                value={formatValue(details.status)}
                                readOnly
                              />
                            </div>
                            <div className="mb-2">
                              <label className="block text-gray-600 text-xs mb-1">Payee</label>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  className="border border-gray-300 rounded w-1/3 py-1 px-2 text-sm bg-gray-50"
                                  value={formatValue(details.supplier_code)}
                                  readOnly
                                />
                                <input
                                  type="text"
                                  className="border border-gray-300 rounded flex-1 py-1 px-2 text-sm bg-gray-50"
                                  value={formatValue(details.v_supplier)}
                                  readOnly
                                />
                              </div>
                            </div>
                            <div className="mb-2">
                              <label className="block text-gray-600 text-xs mb-1">Foreign Invoice</label>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  className="border border-gray-300 rounded w-2/5 py-1 px-2 text-sm bg-gray-50"
                                  value={formatValue(details.customerInvNo)}
                                  readOnly
                                />
                                <input
                                  type="text"
                                  className={`border border-gray-300 rounded w-3/5 py-1 px-2 text-sm ${
                                    details.invoiceStatus === "Valuation Completed"
                                      ? "bg-red-100"
                                      : "bg-blue-100"
                                  }`}
                                  value={formatValue(details.invoiceStatus)}
                                  readOnly
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              {details.status === "Web Preparation Completed" ? (
                                <div>
                                  <label className="block text-gray-600 text-xs mb-1">
                                    Web Preparation Status
                                  </label>
                                  <input
                                    type="text"
                                    className="border border-gray-300 rounded w-full py-1 px-2 text-sm bg-red-100"
                                    value="Web Preparation Completed"
                                    readOnly
                                  />
                                </div>
                              ) : (
                                <div>
                                  <label className="block text-gray-600 text-xs mb-1">
                                    Web Preparation Status
                                  </label>
                                  <select
                                    className={`border border-gray-300 rounded w-full py-1 px-2 text-sm ${
                                      isValuationCompleted ? "bg-gray-200 cursor-not-allowed" : ""
                                    } ${isWebPerforationComplete ? "bg-green-100" : "bg-red-100"}`}
                                    value={isWebPerforationComplete ? "Preparation Complete" : "Un Complete"}
                                    onChange={handleStatusChange}
                                    disabled={isValuationCompleted || isWebPerforationComplete}
                                  >
                                    <option value="Un Complete">In Complete</option>
                                    <option value="Preparation Complete">Web Preparation Complete</option>
                                  </select>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Consignment Information Card */}
                    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                      <div className="bg-indigo-50 p-4 border-b">
                        <h2 className="font-semibold text-indigo-700 flex items-center">
                          <span className="inline-block mr-2">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z" />
                            </svg>
                          </span>
                          Consignment Information
                        </h2>
                      </div>
                      <div className="p-3">
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <div>
                            <label className="block text-gray-600 text-xs mb-1">
                              Consignment Type
                            </label>
                            <input
                              type="text"
                              className="border border-gray-300 rounded w-full py-1 px-2 text-sm bg-gray-50"
                              value={formatValue(details.consignment_type)}
                              readOnly
                            />
                          </div>
                          <div>
                            <label className="block text-gray-600 text-xs mb-1">
                              Quantity
                            </label>
                            <input
                              type="text"
                              className="border border-gray-300 rounded w-24 py-1 px-2 text-sm bg-gray-50"
                              value={formatValue(details.quantity)}
                              readOnly
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-0 mb-4">
                          <div>
                            <h3 className="text-gray-600 text-xs font-semibold mb-2">
                              Container Type
                            </h3>
                            <div className="space-y-2">
                              <div className="flex items-center">
                                <span className="w-16 text-sm">20FT</span>
                                <input
                                  type="checkbox"
                                  checked={container20}
                                  readOnly
                                  className="h-4 w-4 text-indigo-600"
                                />
                              </div>
                              <div className="flex items-center">
                                <span className="w-16 text-sm">40FT</span>
                                <input
                                  type="checkbox"
                                  checked={container40}
                                  readOnly
                                  className="h-4 w-4 text-indigo-600"
                                />
                              </div>
                              <div className="flex items-center">
                                <span className="w-16 text-sm">45FT</span>
                                <input
                                  type="checkbox"
                                  checked={container45}
                                  readOnly
                                  className="h-4 w-4 text-indigo-600"
                                />
                              </div>
                            </div>
                          </div>
                          <div>
                            <h3 className="text-gray-600 text-xs font-semibold mb-2">
                              Quantity
                            </h3>
                            <div className="space-y-1">
                              <input
                                type="text"
                                className="border rounded py-0 px-2 w-16 text-sm bg-gray-50"
                                value={formatValue(details.container_20_qty)}
                                readOnly
                              />
                              <input
                                type="text"
                                className="border rounded py-0 px-2 w-16 text-sm bg-gray-50 block mt-1"
                                value={formatValue(details.container_40_qty)}
                                readOnly
                              />
                              <input
                                type="text"
                                className="border rounded py-0 px-2 w-16 text-sm bg-gray-50 block mt-1"
                                value={formatValue(details.container_45_qty)}
                                readOnly
                              />
                            </div>
                          </div>
                          <div>
                            <h3 className="text-gray-600 text-xs font-semibold mb-2">
                              Company Information
                            </h3>
                            <input
                              type="text"
                              value={formatValue(details.foreignSupplierName)}
                              className="border border-gray-300 rounded text-xs py-2 px-1 w-44 bg-gray-50"
                              readOnly
                            />
                          </div>
                          
                          <div>
                            <label className="block text-gray-600 text-xs mb-2 px-">
                              Valuation Completed Date
                            </label>
                            <input
                              type="text"
                              value={formatValue(details.valcompleted_date)}
                              className="border border-gray-300 rounded py-1 px-1 w-24 text-sm bg-gray-50"
                              readOnly
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Purchase Orders Card */}
                    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                      <div className="bg-indigo-50 p-5 border-b">
                        <h2 className="font-semibold text-indigo-700 flex items-center">
                          <span className="inline-block mr-2">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M5 2a2 2 0 00-2 2v14l3.5-2 3.5 2 3.5-2 3.5 2V4a2 2 0 00-2-2H5zm4.707 3.707a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L8.414 9H10a3 3 0 013 3v1a1 1 0 102 0v-1a5 5 0 00-5-5H8.414l1.293-1.293z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </span>
                          Purchase Orders
                        </h2>
                      </div>
                      <div className="p-3">
                        <div className="border border-gray-300 rounded-lg overflow-hidden">
                          <div className="bg-gray-50">
                            <table className="w-full table-fixed border-collapse">
                              <thead>
                                <tr>
                                  <th className="py-2 px-2 border border-gray-300 text-center text-sm font-medium text-gray-600">
                                    PO NO/Job NO
                                  </th>
                                  <th className="py-1 px-2 border border-gray-300 text-center text-sm font-medium text-gray-600">
                                    Total Amount
                                  </th>
                                </tr>
                              </thead>
                            </table>
                          </div>
                          <div className="max-h-[200px] overflow-y-auto">
                            <table className="w-full table-fixed border-collapse">
                              <tbody>
                                {podetails.length > 0 ? (
                                  podetails.map((podetail, index) => (
                                    <tr key={index}>
                                      <td className="py-1 px-2 border border-gray-200 text-sm">
                                        {formatValue(podetail.po_no)}
                                      </td>
                                      <td className="py-2 px-2 border border-gray-200 text-sm text-right">
                                        {formatNumberWithCommas(podetail.totalamount)}
                                      </td>
                                    </tr>
                                  ))
                                ) : (
                                  <tr>
                                    <td colSpan="2" className="py-4 px-2 border border-gray-200 text-gray-500 text-center text-sm">
                                      No purchase orders available
                                    </td>
                                  </tr>
                                )}
                                {Array.from({
                                  length: Math.max(0, 7 - podetails.length),
                                }).map((_, index) => (
                                  <tr key={`empty-${index}`} className="bg-white-50">
                                    <td className="py-1 px-2 border border-gray-200 text-gray-400 text-center text-sm">
                                      N/A
                                    </td>
                                    <td className="py-1 px-2 border border-gray-200 text-gray-400 text-center text-sm">
                                      N/A
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Other Charges Component */}
            <div className="hidden lg:block">
              <OtherCharges
                otherChargesRows={otherChargesRows}
                setOtherChargesRows={setOtherChargesRows}
                isEditDisabled={isEditDisabled}
                selectedFiles={selectedFiles}
                setSelectedFiles={setSelectedFiles}
                attachmentDescription={attachmentDescription}
                formatNumberWithCommas={formatNumberWithCommas}
                formatDateTime={formatDateTime}
                handleSaveOtherCharges={handleSaveOtherCharges}
                year={storedYear}
                voucherno={storedVoucherNo}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ShipmentForm;





// import Swal from "sweetalert2";
// import React, { useState, useEffect } from "react";
// import Header from "./Header";
// import axios from "axios";
// import OtherCharges from "../components/OtherChages";

// const errorSound = new Audio("/error-sound.mp3");

// const ShipmentForm = () => {
//   const [otherChargesRows, setOtherChargesRows] = useState([]);
//   const [container20, setContainer20] = useState(false);
//   const [container40, setContainer40] = useState(false);
//   const [container45, setContainer45] = useState(false);
//   const [details, setDetails] = useState({});
//   const [selectedRow, setSelectedRow] = useState(null);
//   const [selectedRowData, setSelectedRowData] = useState(null);
//   const [sidebardetails, setSidebardetails] = useState([]);
//   const [podetails, setPodetails] = useState([]);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [selectedPayee, setSelectedPayee] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const [page, setPage] = useState(1);
//   const [hasMore, setHasMore] = useState(true);
//   const [selectedFiles, setSelectedFiles] = useState([]);
//   const [attachmentDescription, setAttachmentDescription] = useState([]);
//   const [custominvoice, setCustominvoice] = useState("");
//   const [isWebPerforationComplete, setIsWebPerforationComplete] = useState(false);

//   const rowsPerPage = 10;
//   const storedVoucherNo = localStorage.getItem("selectedVoucherNo");
//   const storedYear = localStorage.getItem("selectedYear");

//   // Get unique payees from the data
//   const payees = [...new Set(sidebardetails.map(row => row.payee || "Unknown"))];

//   // Filtered data based on search and payee
//   const filteredData = sidebardetails.filter(
//     (row) =>
//       (selectedPayee === "" || row.payee === selectedPayee) &&
//       (row.msd_year.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       row.fileno.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       row.voucher_no.toLowerCase().includes(searchQuery.toLowerCase()))
//   );

//   const isValuationCompleted = details.invoiceStatus === "Valuation Completed";
//   const isWebPrepCompleted = details.status === "Web Preparation Completed";
//   const isEditDisabled = isValuationCompleted || isWebPerforationComplete || isWebPrepCompleted;

//   const playErrorSound = () => {
//     errorSound.play().catch((error) => {
//       console.error("Error playing sound:", error);
//     });
//   };

//   const showErrorToast = (title, text) => {
//     playErrorSound();
//     Swal.fire({
//       title,
//       text,
//       icon: "error",
//       confirmButtonText: "OK",
//     });
//   };

//   const showValuationCompletedMessage = () => {
//     Swal.fire({
//       title: "Action Denied",
//       text: "The Valuation or Preparation is Completed! You can't edit anything, only can read.",
//       icon: "warning",
//       confirmButtonText: "OK",
//     });
//   };

//   const showValuationCompletedPopup = () => {
//     Swal.fire({
//       title: "Valuation Completed",
//       text: "Valuation is Completed, you don't have any access to edit or add data (For more details please contact Wharf Department)",
//       icon: "success",
//       confirmButtonText: "OK",
//       position: "center",
//     });
//   };

//   const showWebPreparationCompletedPopup = () => {
//     Swal.fire({
//       title: "Web Preparation Completed",
//       text: "Web preparation is already completed for this shipment. Editing is disabled.",
//       icon: "warning",
//       confirmButtonText: "OK",
//     });
//   };

//   const formatNumberWithCommas = (number) => {
//     if (!number || isNaN(number)) return "";
    
//     // Convert to number and format with 2 decimal places
//     const num = Number(number);
    
//     // Format with thousands separators and 2 decimal places
//     return num.toLocaleString("en-US", {
//       minimumFractionDigits: 2,
//       maximumFractionDigits: 2
//     });
//   };

//   const formatDateTime = (dateString) => {
//     if (!dateString) return "";
//     const date = new Date(dateString);
//     if (isNaN(date)) return dateString;
//     const year = date.getFullYear();
//     const month = String(date.getMonth() + 1).padStart(2, "0");
//     const day = String(date.getDate()).padStart(2, "0");
//     return `${year}-${month}-${day}`;
//   };

//   const handleRowSelect = (index, row) => {
//     setSelectedRow(index);
//     setSelectedRowData(row);
//     localStorage.setItem("selectedVoucherNo", row.voucher_no);
//     localStorage.setItem("selectedYear", row.msd_year);

//     const fetchDetailsAndCheck = async () => {
//       try {
//         const response = await axios.get(
//           `https://esystems.cdl.lk/backend-test/ewharf/ValueList/GetSettlDetails?year=${row.msd_year}&vno=${row.voucher_no}`,
//           { timeout: 10000 }
//         );
//         if (response.data && response.data.ResultSet.length > 0) {
//           const data = response.data.ResultSet[0];

//           if (data.invoiceStatus === "") {
//             data.invoiceStatus = "Pending";
//           } else if (data.invoiceStatus === "V0") {
//             data.invoiceStatus = "Not Completed";
//           } else if (data.invoiceStatus === "V1") {
//             data.invoiceStatus = "Invoice Registered";
//           } else if (data.invoiceStatus === "V3") {
//             data.invoiceStatus = "Valuation Completed";
//           }

//           setCustominvoice(data.customerInvNo);
//           setContainer20(!!data.container_20);
//           setContainer40(!!data.container_40);
//           setContainer45(!!data.container_44 && !!data.container_45);
//           setIsWebPerforationComplete(data.isWebPerforationComplete || false);
//           setDetails(data);

//           if (data.invoiceStatus === "Valuation Completed") {
//             showValuationCompletedPopup();
//           }
          
//           if (data.status === "Web Preparation Completed") {
//             showWebPreparationCompletedPopup();
//           }
//         }
//       } catch (error) {
//         console.error("Error checking valuation status:", error.message);
//         showErrorToast("Error", "Failed to check valuation status");
//       }
//     };

//     fetchDetailsAndCheck();
//   };

//   // Updated fetchSidebardetails function using sidebar logic
//   const fetchSidebardetails = async () => {
//     setIsLoading(true);
//     try {
//       const user = localStorage.getItem("comid");
//       const response = await axios.get(
//         `https://esystems.cdl.lk/backend-test/ewharf/ValueList/GetSellleMenuDetails?suppliercode=${user}`
//       );
//       if (response.data && response.data.ResultSet) {
//         setSidebardetails(response.data.ResultSet);
//       }
//     } catch (error) {
//       console.error("Error fetching sidebar details:", error.message);
//       showErrorToast("Error", "Failed to load sidebar details");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchSidebardetails();
//   }, []);

//   useEffect(() => {
//     if (!storedVoucherNo || !storedYear) {
//       return;
//     }

//     const fetchDetails = async () => {
//       setIsLoading(true);
//       try {
//         const response = await axios.get(
//           `https://esystems.cdl.lk/backend-test/ewharf/ValueList/GetSettlDetails?year=${storedYear}&vno=${storedVoucherNo}`,
//           { timeout: 10000 }
//         );
//         if (response.data && response.data.ResultSet.length > 0) {
//           const data = response.data.ResultSet[0];

//           if (data.invoiceStatus === "") {
//             data.invoiceStatus = "Pending";
//           } else if (data.invoiceStatus === "V0") {
//             data.invoiceStatus = "Not Completed";
//           } else if (data.invoiceStatus === "V1") {
//             data.invoiceStatus = "Invoice Registered";
//           } else if (data.invoiceStatus === "V3") {
//             data.invoiceStatus = "Valuation Completed";
//           }

//           setCustominvoice(data.customerInvNo);
//           setContainer20(!!data.container_20);
//           setContainer40(!!data.container_40);
//           setContainer45(!!data.container_44 && !!data.container_45);
//           setIsWebPerforationComplete(data.isWebPerforationComplete || false);
//           setDetails(data);

//           if (data.status === "Web Preparation Completed") {
//             showWebPreparationCompletedPopup();
//           }
//         }
//       } catch (error) {
//         console.error("Error fetching details:", error.message);
//         showErrorToast("Error", "Failed to load shipment details");
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     const fetchpodetails = async () => {
//       setIsLoading(true);
//       try {
//         const response = await axios.get(
//           `https://esystems.cdl.lk/backend-test/ewharf/ValueList/GetPODetails?year=${storedYear}&vno=${storedVoucherNo}`,
//           { timeout: 10000 }
//         );
//         if (response.data && response.data.ResultSet) {
//           setPodetails(response.data.ResultSet);
//         }
//       } catch (error) {
//         console.error("Error fetching PO details:", error.message);
//         showErrorToast("Error", "Failed to load PO details");
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     const fetchAttachments = async () => {
//       setIsLoading(true);
//       try {
//         const response = await axios.get(
//           `https://esystems.cdl.lk/backend-test/ewharf/ValueList/GetOtheChragesDetails?year=${storedYear}&voucherno=${storedVoucherNo}`,
//           { timeout: 10000 }
//         );
//         if (response.data && response.data.ResultSet) {
//           const updatedData = response.data.ResultSet.map((row) => ({
//             ...row,
//             attachmentUrl: row.attachmentUrl || "",
//             attachmentName: row.attachmentName || "",
//             invoice_date: row.invoice_date || "",
//           })).reverse();
//           setOtherChargesRows(updatedData);
//         }
//       } catch (error) {
//         console.error("Error fetching attachments:", error.message);
//         showErrorToast("Error", "Failed to load attachments");
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     const fetchSettlementDescription = async () => {
//       try {
//         const response = await axios.get(
//           `https://esystems.cdl.lk/backend-test/ewharf/ValueList/CalculationDescription`
//         );
//         const data = response.data?.ResultSet || [];
//         setAttachmentDescription(data);
//       } catch (error) {
//         console.error(
//           "Error fetching details:",
//           error.response ? error.response.data : error.message
//         );
//         showErrorToast("Error", "Failed to load settlement description");
//       }
//     };

//     fetchAttachments();
//     fetchSettlementDescription();
//     fetchpodetails();
//     fetchDetails();
//   }, [storedVoucherNo, storedYear]);

//   const validateRow = (row) => {
//     const errors = [];

//     if (!row.calculation_type || row.calculation_type.trim() === "") {
//       errors.push("Type is required.");
//     }

//     if (!row.amount || row.amount.trim() === "") {
//       errors.push("Amount is required.");
//     } else if (isNaN(row.amount) || Number(row.amount) <= 0) {
//       errors.push("Amount must be a valid positive number.");
//     }

//     if (!row.invoice_no || row.invoice_no.trim() === "") {
//       errors.push("Invoice No is required.");
//     } else if (row.invoice_no.length > 20) {
//       errors.push("Invoice No must not exceed 20 characters.");
//     } else if (!/^[a-zA-Z0-9-/]+$/.test(row.invoice_no)) {
//       errors.push("Invoice No must be alphanumeric (letters, numbers, or hyphens only).");
//     }

//     if (row.vehicle_no && row.vehicle_no.trim() !== "") {
//       if (row.vehicle_no.length > 15) {
//         errors.push("Vehicle No must not exceed 15 characters.");
//       } else if (!/^[a-zA-Z0-9-]+$/.test(row.vehicle_no)) {
//         errors.push("Vehicle No must be alphanumeric (letters, numbers, or hyphens only).");
//       }
//     }

//     return errors;
//   };

//   const handleSaveOtherCharges = async () => {
//     if (isEditDisabled) {
//       showValuationCompletedMessage();
//       return;
//     }

//     try {
//       const validationErrors = [];
//       otherChargesRows.forEach((row, index) => {
//         const errors = validateRow(row);
//         if (errors.length > 0) {
//           validationErrors.push(`Row ${index + 1}: ${errors.join(", ")}`);
//         }
//       });

//       if (validationErrors.length > 0) {
//         showErrorToast("Validation Error", validationErrors.join("\n"));
//         return;
//       }

//       const settlementData = otherChargesRows.map((row) => ({
//         vehno: row.vehicle_no || "",
//         invdate: row.invoice_date || "",
//         amount: row.amount || "",
//         invno: row.invoice_no || "",
//         lrate: "",
//         ctype: row.calculation_type || "",
//         rate: row.rate || "",
//       }));

//       await axios.post(
//         `https://esystems.cdl.lk/backend-test/ewharf/ValueList/SetSettlementChrages`,
//         {
//           settlementDetails: settlementData,
//           user: "2203579",
//           year: storedYear,
//           voucherno: storedVoucherNo,
//         },
//         { headers: { "Content-Type": "application/json" }, timeout: 10000 }
//       );

//       const filesToUpload = Object.entries(selectedFiles)
//         .filter(([index]) => otherChargesRows[Number(index)])
//         .map(([index, fileData]) => ({
//           index: Number(index),
//           file: fileData?.file,
//           cal_type: otherChargesRows[Number(index)].calculation_type,
//         }));

//       if (filesToUpload.length > 0) {
//         const formData = new FormData();
//         filesToUpload.forEach(({ index, file, cal_type }, i) => {
//           if (file) {
//             formData.append(`FileUploadModels[${i}].ImageFile`, file);
//             formData.append(`FileUploadModels[${i}].index`, index.toString());
//             formData.append(`FileUploadModels[${i}].voucher_no`, storedVoucherNo);
//             formData.append(`FileUploadModels[${i}].year`, storedYear);
//             formData.append(`FileUploadModels[${i}].status`, "A");
//             formData.append(`FileUploadModels[${i}].cal_type`, cal_type);
//           }
//         });

//         const uploadResponse = await axios.post(
//           `https://esystems.cdl.lk/backend-test/ewharf/ValueList/UploadFiles1?CusInvoNo=${custominvoice || ""}`,
//           formData,
//           {
//             headers: { "Content-Type": "multipart/form-data" },
//             timeout: 30000,
//           }
//         );

//         if (uploadResponse.data && uploadResponse.data.ResultSet) {
//           const uploadedFiles = uploadResponse.data.ResultSet;
//           setOtherChargesRows((prevRows) =>
//             prevRows.map((row, idx) => {
//               const uploadedFile = uploadedFiles.find((f) => f.index === idx);
//               return uploadedFile
//                 ? {
//                     ...row,
//                     attachmentUrl: uploadedFile.fileUrl || "",
//                     attachmentName: uploadedFile.fileName || row.attachmentName,
//                   }
//                 : row;
//             })
//           );
//         }
//       }

//       setSelectedFiles([]);

//       Swal.fire({
//         title: "Success",
//         text: "Data and files saved successfully!",
//         icon: "success",
//         timer: 2000,
//         showConfirmButton: false,
//       });

//       const refreshResponse = await axios.get(
//         `https://esystems.cdl.lk/backend-test/ewharf/ValueList/GetOtheChragesDetails?year=${storedYear}&voucherno=${storedVoucherNo}`,
//         { timeout: 10000 }
//       );
//       if (refreshResponse.data && refreshResponse.data.ResultSet) {
//         const updatedData = refreshResponse.data.ResultSet.map((row) => ({
//           ...row,
//           attachmentUrl: row.attachmentUrl || "",
//           attachmentName: row.attachmentName || "",
//           invoice_date: row.invoice_date || "",
//         })).reverse();
//         setOtherChargesRows(updatedData);
//       }
//     } catch (error) {
//       console.error("Save Error:", error);
//       Swal.fire({
//         title: "Error",
//         text: error.response?.data?.message || error.message || "Failed to save data",
//         icon: "error",
//       });
//     }
//   };

//   const handleWebPerforationComplete = async () => {
//     setIsLoading(true);
//     try {
//       await axios.post(
//         `https://esystems.cdl.lk/backend-test/ewharf/ValueList/updatepreparationcomplete?year=${storedYear}&vno=${storedVoucherNo}`,
//         {},
//         { timeout: 10000 }
//       );

//       setIsWebPerforationComplete(true);
//       Swal.fire({
//         title: "Web Preparation Completed",
//         text: "Web preparation has been successfully completed. You can't edit anything in Other Charges section now.",
//         icon: "success",
//         confirmButtonText: "OK",
//         position: "center",
//       });
//     } catch (error) {
//       console.error("Error updating web preparation:", error.message);
//       Swal.fire({
//         title: "Error",
//         text: error.response?.data?.message || "Failed to complete web preparation.",
//         icon: "error",
//         confirmButtonText: "OK",
//         position: "center",
//       });
//       setIsWebPerforationComplete(false);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleStatusChange = (e) => {
//     const selectedValue = e.target.value;
//     if (selectedValue === "Preparation Complete" && !isWebPerforationComplete) {
//       Swal.fire({
//         title: "Confirm Web Preparation Completion",
//         text: "Are you sure you want to mark this as Preparation Complete? This action cannot be undone.",
//         icon: "warning",
//         showCancelButton: true,
//         confirmButtonText: "Yes, Complete",
//         cancelButtonText: "No, Cancel",
//       }).then((result) => {
//         if (result.isConfirmed) {
//           handleWebPerforationComplete();
//         } else {
//           e.target.value = "Un Complete";
//         }
//       });
//     }
//   };

//   useEffect(() => {
//     return () => {
//       selectedFiles.forEach((file) => {
//         if (file?.preview) URL.revokeObjectURL(file.preview);
//       });
//     };
//   }, [selectedFiles]);

//   return (
//     <div className="flex flex-col min-h-screen bg-gray-100">
//       <Header />
//       {isLoading ? (
//         <div className="flex justify-center items-center h-screen">
//           <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
//         </div>
//       ) : (
//         <>
//           <div className="bg-transparent p-6 border-gray-200">
//             <div className="container mx-auto flex justify-between items-center">
//               <h1 className="text-xl font-semibold text-indigo-700">
//                 {details.clerkName || ""}
//               </h1>
//               <button className="hover:bg-indigo-50 text-white px-4 py-2 rounded-md text-sm"></button>
//             </div>
//           </div>

//           {/* Mobile View - Other Charges at the top */}
//           <div className="lg:hidden container mx-auto px-2 py-5 pb-0">
//             <OtherCharges
//               otherChargesRows={otherChargesRows}
//               setOtherChargesRows={setOtherChargesRows}
//               isEditDisabled={isEditDisabled}
//               selectedFiles={selectedFiles}
//               setSelectedFiles={setSelectedFiles}
//               attachmentDescription={attachmentDescription}
//               custominvoice={custominvoice}
//               storedYear={storedYear}
//               storedVoucherNo={storedVoucherNo}
//               formatNumberWithCommas={formatNumberWithCommas}
//               formatDateTime={formatDateTime}
//               handleSaveOtherCharges={handleSaveOtherCharges}
//             />
//           </div>

//           <div className="container mx-auto px-2 py-2">
//             <div className="flex flex-col space-y-6">
//               <div className="order-1 lg:order-0 grid lg:grid-cols-[1fr,5fr] gap-6">
//                 {/* Left Column: Select Row */}
//                 <div className="bg-white rounded-lg shadow-lg overflow-hidden">
//                   <div className="hidden lg:block h-[460px]">
//                     <div className="bg-white rounded-lg overflow-hidden">
//                       <div className="bg-indigo-50 p-4 border-b">
//                         <h2 className="font-semibold text-indigo-700 flex items-center">
//                           <span className="inline-block mr-2">
//                             <svg
//                               xmlns="http://www.w3.org/2000/svg"
//                               className="h-5 w-5"
//                               viewBox="0 0 20 20"
//                               fill="currentColor"
//                             >
//                               <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.518 4.674a1 1 0 00.95.69h4.91c.969 0 1.372 1.24.588 1.81l-3.974 2.89a1 1 0 00-.364 1.118l1.518 4.674c.3.921-.755 1.688-1.54 1.118l-3.974-2.89a1 1 0 00-1.176 0l-3.974 2.89c-.785.57-1.84-.197-1.54-1.118l1.518-4.674a1 1 0 00-.364-1.118l-3.974-2.89c-.784-.57-.38-1.81.588-1.81h4.91a1 1 0 00.95-.69l1.518-4.674z" />
//                             </svg>
//                           </span>
//                           Select Row
//                         </h2>
//                       </div>
//                       <div className="p-3 space-y-2">
//                         {/* Payee Dropdown */}
//                         {/* <select
//                           value={selectedPayee}
//                           onChange={(e) => setSelectedPayee(e.target.value)}
//                           className="w-full py-1 px-4 rounded-md text-black border-[0.5px] border-black text-sm"
//                         >
//                           <option value="">Select Payee</option>
//                           {payees.map((payee, index) => (
//                             <option key={index} value={payee}>
//                               {payee}
//                             </option>
//                           ))}
//                         </select> */}

//                         {/* Search Bar */}
//                         <input
//                           type="text"
//                           placeholder="Search FILE_NO, YEAR or VOUCHER_NO..."
//                           className="w-full py-1 px-4 rounded-md text-black border-[0.5px] border-black text-sm"
//                           value={searchQuery}
//                           onChange={(e) => setSearchQuery(e.target.value)}
//                         />

//                         <div className="border border-gray-300 rounded-lg overflow-hidden">
//                           <div className="bg-gray-50">
//                             <table className="w-full table-fixed border-collapse">
//                               <colgroup>
//                                 <col style={{ width: "50px" }} />
//                                 <col style={{ width: "46%" }} />
//                                 <col style={{ width: "50%" }} />
//                               </colgroup>
//                               <thead>
//                                 <tr>
//                                   <th className="py-1 px-2 border border-gray-300 text-center text-xs">
//                                     ✔
//                                   </th>
//                                   <th className="py-1 px-2 border border-gray-300 text-left text-xs">
//                                     File No
//                                   </th>
//                                   <th className="py-1 px-2 border border-gray-300 text-left text-xs">
//                                     Year
//                                   </th>
//                                 </tr>
//                               </thead>
//                             </table>
//                           </div>
//                           <div className="max-h-[440px] overflow-y-auto">
//                             <table className="w-full table-fixed border-collapse">
//                               <colgroup>
//                                 <col style={{ width: "50px" }} />
//                                 <col style={{ width: "54%" }} />
//                                 <col style={{ width: "50%" }} />
//                               </colgroup>
//                               <tbody>
//                                 {filteredData.length > 0 ? (
//                                   filteredData.map((row, index) => (
//                                     <tr
//                                       key={index}
//                                       className={`cursor-pointer transition ${
//                                         selectedRow === index
//                                           ? "bg-blue-500 text-white"
//                                           : "hover:bg-indigo-50"
//                                       }`}
//                                       onClick={() => handleRowSelect(index, row)}
//                                     >
//                                       <td className="py-1 px-2 border border-gray-200 text-center">
//                                         <input
//                                           type="checkbox"
//                                           checked={selectedRow === index}
//                                           onChange={() => handleRowSelect(index, row)}
//                                           className="h-3 w-3"
//                                         />
//                                       </td>
//                                       <td className="py-1 px-1 border border-gray-200 text-sm">
//                                         {row.fileno}
//                                       </td>
//                                       <td className="py-1 px-1 border border-gray-200 text-sm">
//                                         {row.msd_year}
//                                       </td>
//                                     </tr>
//                                   ))
//                                 ) : (
//                                   <tr>
//                                     <td colSpan="3" className="py-2 px-2 border border-gray-200 text-center text-sm text-gray-500">
//                                       No matching records found
//                                     </td>
//                                   </tr>
//                                 )}
//                               </tbody>
//                             </table>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Right Column: Shipment Details, Status & Payment, Consignment Information, Purchase Orders */}
//                 <div>
//                   {/* Shipment Details Card */}
//                   <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
//                     <div className="bg-indigo-50 p-4 border-b">
//                       <h2 className="font-semibold text-indigo-700 flex items-center">
//                         <span className="inline-block mr-2">
//                           <svg
//                             xmlns="http://www.w3.org/2000/svg"
//                             className="h-5 w-5"
//                             viewBox="0 0 20 20"
//                             fill="currentColor"
//                           >
//                             <path
//                               fillRule="evenodd"
//                               d="M10 2a1 1 0 00-1 1v1H6a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V6a2 2 0 00-2-2h-3V3a1 1 0 00-1-1zm-1 8a1 1 0 112 0v3a1 1 0 11-2 0v-3z"
//                               clipRule="evenodd"
//                             />
//                           </svg>
//                         </span>
//                         Shipment Details
//                       </h2>
//                     </div>
//                     <div className="p-3">
//                       <div className="grid grid-cols-1 md:grid-cols-6 gap-2 text-sm">
//                         {[
//                           { label: "Date", key: "msd_date" },
//                           { label: "Name", key: "clerkName" },
//                           { label: "Operator", key: "clerk" },
//                           { label: "Transport Type", key: "transport_type" },
//                           { label: "Vessel Name/Flight No", key: "transport_mode" },
//                           { label: "Consignment Details", key: "consignment_details" },
//                         ].map((item, index) => (
//                           <div key={index} className="mb-2">
//                             <label className="block text-gray-600 text-xs mb-1">{item.label}</label>
//                             {item.key === "consignment_details" ? (
//                               <textarea
//                                 className="border border-gray-300 rounded w-full py-1 px-2 text-sm bg-gray-50 resize-none h-[40px]"
//                                 value={details[item.key] || ""}
//                                 readOnly
//                               />
//                             ) : (
//                               <input
//                                 type="text"
//                                 className="border border-gray-300 rounded w-full py-1 px-2 text-sm bg-gray-50"
//                                 value={details[item.key] || ""}
//                                 readOnly
//                               />
//                             )}
//                           </div>
//                         ))}
//                       </div>
//                       <div className="mt-3 grid grid-cols-1 md:grid-cols-6 gap-2 text-sm">
//                         {[
//                           { label: "Vessel/Flight Arrival", key: "vesselflight_arrivaldate" },
//                           { label: "Voucher Details", key: "voucher_no" },
//                           { label: "Invoice Details", key: "customerInvNo" },
//                           { label: "B.L/AWB No", key: "blawb_no" },
//                           { label: "Delivery Location", key: "deliverylocation" },
//                         ].map((item, index) => (
//                           <div key={index} className="mb-2">
//                             <label className="block text-gray-600 text-xs mb-1">{item.label}</label>
//                             <input
//                               type="text"
//                               className="border border-gray-300 rounded w-full py-1 px-2 text-sm bg-gray-50"
//                               value={details[item.key] || ""}
//                               readOnly
//                             />
//                           </div>
//                         ))}
//                       </div>
//                     </div>
//                   </div>

//                   {/* Status & Payment, Consignment Information, and Purchase Orders in the Same Row */}
//                   <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-0">
//                     {/* Status & Payment Card */}
//                     {details.status && (
//                       <div className="bg-white rounded-lg shadow-lg overflow-hidden">
//                         <div className="bg-indigo-50 p-4 border-b">
//                           <h2 className="font-semibold text-indigo-700 flex items-center">
//                             <span className="inline-block mr-2">
//                               <svg
//                                 xmlns="http://www.w3.org/2000/svg"
//                                 className="h-5 w-5"
//                                 viewBox="0 0 20 20"
//                                 fill="currentColor"
//                               >
//                                 <path
//                                   fillRule="evenodd"
//                                   d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
//                                   clipRule="evenodd"
//                                 />
//                               </svg>
//                             </span>
//                             Status & Payment
//                           </h2>
//                         </div>
//                         <div className="p-3">
//                           <div className="grid grid-cols-1 md:grid-cols-1 gap-2 text-sm">
//                             <div className="mb-2">
//                               <label className="block text-gray-600 text-xs mb-1">Status</label>
//                               <input
//                                 type="text"
//                                 className="border border-gray-300 rounded w-2/3 py-1 px-2 text-sm bg-gray-50"
//                                 value={details.status || ""}
//                                 readOnly
//                               />
//                             </div>
//                             <div className="mb-2">
//                               <label className="block text-gray-600 text-xs mb-1">Payee</label>
//                               <div className="flex gap-2">
//                                 <input
//                                   type="text"
//                                   className="border border-gray-300 rounded w-1/3 py-1 px-2 text-sm bg-gray-50"
//                                   value={details.supplier_code || ""}
//                                   readOnly
//                                 />
//                                 <input
//                                   type="text"
//                                   className="border border-gray-300 rounded flex-1 py-1 px-2 text-sm bg-gray-50"
//                                   value={details.v_supplier || ""}
//                                   readOnly
//                                 />
//                               </div>
//                             </div>
//                             <div className="mb-2">
//                               <label className="block text-gray-600 text-xs mb-1">Foreign Invoice</label>
//                               <div className="flex gap-2">
//                                 <input
//                                   type="text"
//                                   className="border border-gray-300 rounded w-2/5 py-1 px-2 text-sm bg-gray-50"
//                                   value={details.customerInvNo || ""}
//                                   readOnly
//                                 />
//                                 <input
//                                   type="text"
//                                   className={`border border-gray-300 rounded w-3/5 py-1 px-2 text-sm ${
//                                     details.invoiceStatus === "Valuation Completed"
//                                       ? "bg-red-100"
//                                       : "bg-blue-100"
//                                   }`}
//                                   value={details.invoiceStatus || ""}
//                                   readOnly
//                                 />
//                               </div>
//                             </div>
//                             <div className="grid grid-cols-2 gap-2">
//                               {details.status === "Web Preparation Completed" ? (
//                                 <div>
//                                   <label className="block text-gray-600 text-xs mb-1">
//                                     Web Preparation Status
//                                   </label>
//                                   <input
//                                     type="text"
//                                     className="border border-gray-300 rounded w-full py-1 px-2 text-sm bg-red-100"
//                                     value="Web Preparation Completed"
//                                     readOnly
//                                   />
//                                 </div>
//                               ) : (
//                                 <div>
//                                   <label className="block text-gray-600 text-xs mb-1">
//                                     Web Preparation Status
//                                   </label>
//                                   <select
//                                     className={`border border-gray-300 rounded w-full py-1 px-2 text-sm ${
//                                       isValuationCompleted ? "bg-gray-200 cursor-not-allowed" : ""
//                                     } ${isWebPerforationComplete ? "bg-green-100" : "bg-red-100"}`}
//                                     value={isWebPerforationComplete ? "Preparation Complete" : "Un Complete"}
//                                     onChange={handleStatusChange}
//                                     disabled={isValuationCompleted || isWebPerforationComplete}
//                                   >
//                                     <option value="Un Complete">In Complete</option>
//                                     <option value="Preparation Complete">Web Preparation Complete</option>
//                                   </select>
//                                 </div>
//                               )}
//                             </div>
//                           </div>
//                         </div>
//                       </div>
//                     )}

//                     {/* Consignment Information Card */}
//                     <div className="bg-white rounded-lg shadow-lg overflow-hidden">
//                       <div className="bg-indigo-50 p-4 border-b">
//                         <h2 className="font-semibold text-indigo-700 flex items-center">
//                           <span className="inline-block mr-2">
//                             <svg
//                               xmlns="http://www.w3.org/2000/svg"
//                               className="h-5 w-5"
//                               viewBox="0 0 20 20"
//                               fill="currentColor"
//                             >
//                               <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z" />
//                             </svg>
//                           </span>
//                           Consignment Information
//                         </h2>
//                       </div>
//                       <div className="p-3">
//                         <div className="grid grid-cols-2 gap-3 mb-4">
//                           <div>
//                             <label className="block text-gray-600 text-xs mb-1">
//                               Consignment Type
//                             </label>
//                             <input
//                               type="text"
//                               className="border border-gray-300 rounded w-full py-1 px-2 text-sm bg-gray-50"
//                               value={details.consignment_type || ""}
//                               readOnly
//                             />
//                           </div>
//                           <div>
//                             <label className="block text-gray-600 text-xs mb-1">
//                               Quantity
//                             </label>
//                             <input
//                               type="text"
//                               className="border border-gray-300 rounded w-24 py-1 px-2 text-sm bg-gray-50"
//                               value={details.quantity || ""}
//                               readOnly
//                             />
//                           </div>
//                         </div>
//                         <div className="grid grid-cols-2 gap-0 mb-4">
//                           <div>
//                             <h3 className="text-gray-600 text-xs font-semibold mb-2">
//                               Container Type
//                             </h3>
//                             <div className="space-y-2">
//                               <div className="flex items-center">
//                                 <span className="w-16 text-sm">20FT</span>
//                                 <input
//                                   type="checkbox"
//                                   checked={container20}
//                                   readOnly
//                                   className="h-4 w-4 text-indigo-600"
//                                 />
//                               </div>
//                               <div className="flex items-center">
//                                 <span className="w-16 text-sm">40FT</span>
//                                 <input
//                                   type="checkbox"
//                                   checked={container40}
//                                   readOnly
//                                   className="h-4 w-4 text-indigo-600"
//                                 />
//                               </div>
//                               <div className="flex items-center">
//                                 <span className="w-16 text-sm">45FT</span>
//                                 <input
//                                   type="checkbox"
//                                   checked={container45}
//                                   readOnly
//                                   className="h-4 w-4 text-indigo-600"
//                                 />
//                               </div>
//                             </div>
//                           </div>
//                           <div>
//                             <h3 className="text-gray-600 text-xs font-semibold mb-2">
//                               Quantity
//                             </h3>
//                             <div className="space-y-1">
//                               <input
//                                 type="number"
//                                 className="border rounded py-0 px-2 w-16 text-sm"
//                                 value={details.container_20_qty || ""}
//                                 readOnly
//                               />
//                               <input
//                                 type="number"
//                                 className="border rounded py-0 px-2 w-16 text-sm block mt-1"
//                                 value={details.container_40_qty || ""}
//                                 readOnly
//                               />
//                               <input
//                                 type="number"
//                                 className="border rounded py-0 px-2 w-16 text-sm block mt-1"
//                                 value={details.container_45_qty || ""}
//                                 readOnly
//                               />
//                             </div>
//                           </div>
//                           <div>
//                             <h3 className="text-gray-600 text-xs font-semibold mb-2">
//                               Company Information
//                             </h3>
//                             <input
//                               type="text"
//                               value={details.foreignSupplierName}
//                               className="border border-gray-300 rounded text-xs py-2 px-1 w-44"
//                               readOnly
//                             />
//                           </div>
                          
//                           <div>
//                             <label className="block text-gray-600 text-xs mb-2 px-">
//                               Valuation Completed Date
//                             </label>
//                             <input
//                               type="text"
//                               value={details.valcompleted_date}
//                               className="border border-gray-300 rounded py-1 px-1 w-24 text-sm bg-gray-50"
//                               readOnly
//                             />
//                           </div>
//                         </div>
//                       </div>
//                     </div>

//                     {/* Purchase Orders Card */}
//                     <div className="bg-white rounded-lg shadow-lg overflow-hidden">
//                       <div className="bg-indigo-50 p-5 border-b">
//                         <h2 className="font-semibold text-indigo-700 flex items-center">
//                           <span className="inline-block mr-2">
//                             <svg
//                               xmlns="http://www.w3.org/2000/svg"
//                               className="h-5 w-5"
//                               viewBox="0 0 20 20"
//                               fill="currentColor"
//                             >
//                               <path
//                                 fillRule="evenodd"
//                                 d="M5 2a2 2 0 00-2 2v14l3.5-2 3.5 2 3.5-2 3.5 2V4a2 2 0 00-2-2H5zm4.707 3.707a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L8.414 9H10a3 3 0 013 3v1a1 1 0 102 0v-1a5 5 0 00-5-5H8.414l1.293-1.293z"
//                                 clipRule="evenodd"
//                               />
//                             </svg>
//                           </span>
//                           Purchase Orders
//                         </h2>
//                       </div>
//                       <div className="p-3">
//                         <div className="border border-gray-300 rounded-lg overflow-hidden">
//                           <div className="bg-gray-50">
//                             <table className="w-full table-fixed border-collapse">
//                               <thead>
//                                 <tr>
//                                   <th className="py-2 px-2 border border-gray-300 text-center text-sm font-medium text-gray-600">
//                                     PO NO/Job NO
//                                   </th>
//                                   <th className="py-1 px-2 border border-gray-300 text-center text-sm font-medium text-gray-600">
//                                     Total Amount
//                                   </th>
//                                 </tr>
//                               </thead>
//                             </table>
//                           </div>
//                           <div className="max-h-[200px] overflow-y-auto">
//                             <table className="w-full table-fixed border-collapse">
//                               <tbody>
//                                 {podetails.map((podetail, index) => (
//                                   <tr key={index}>
//                                     <td className="py-1 px-2 border border-gray-200 text-sm">
//                                       {podetail.po_no}
//                                     </td>
//                                     <td className="py-2 px-2 border border-gray-200 text-sm text-right">
//                                       {formatNumberWithCommas(podetail.totalamount)}
//                                     </td>
//                                   </tr>
//                                 ))}
//                                 {Array.from({
//                                   length: Math.max(0, 7 - podetails.length),
//                                 }).map((_, index) => (
//                                   <tr key={`empty-${index}`} className="bg-white-50">
//                                     <td className="py-1 px-2 border border-gray-200 text-gray-400 text-center text-sm">
//                                       -
//                                     </td>
//                                     <td className="py-1 px-2 border border-gray-200 text-gray-400 text-center text-sm">
//                                       -
//                                     </td>
//                                   </tr>
//                                 ))}
//                               </tbody>
//                             </table>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//             {/* Other Charges Component */}
//             <div className="hidden lg:block">
//               <OtherCharges
//                 otherChargesRows={otherChargesRows}
//                 setOtherChargesRows={setOtherChargesRows}
//                 isEditDisabled={isEditDisabled}
//                 selectedFiles={selectedFiles}
//                 setSelectedFiles={setSelectedFiles}
//                 attachmentDescription={attachmentDescription}
//                 custominvoice={custominvoice}
//                 storedYear={storedYear}
//                 storedVoucherNo={storedVoucherNo}
//                 formatNumberWithCommas={formatNumberWithCommas}
//                 formatDateTime={formatDateTime}
//                 handleSaveOtherCharges={handleSaveOtherCharges}
//               />
//             </div>
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default ShipmentForm;












// import Swal from "sweetalert2";
// import React, { useState, useEffect } from "react";
// import Header from "./Header";
// import axios from "axios";
// import OtherCharges from "../components/OtherChages";

// const errorSound = new Audio("/error-sound.mp3");

// const ShipmentForm = () => {
//   const [otherChargesRows, setOtherChargesRows] = useState([]);
//   const [container20, setContainer20] = useState(false);
//   const [container40, setContainer40] = useState(false);
//   const [container45, setContainer45] = useState(false);
//   const [details, setDetails] = useState({});
//   const [selectedRow, setSelectedRow] = useState(null);
//   const [selectedRowData, setSelectedRowData] = useState(null);
//   const [sidebardetails, setSidebardetails] = useState([]);
//   const [podetails, setPodetails] = useState([]);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const [page, setPage] = useState(1);
//   const [hasMore, setHasMore] = useState(true);
//   const [selectedFiles, setSelectedFiles] = useState([]);
//   const [attachmentDescription, setAttachmentDescription] = useState([]);
//   const [custominvoice, setCustominvoice] = useState("");
//   const [isWebPerforationComplete, setIsWebPerforationComplete] = useState(false);

//   const rowsPerPage = 10;
//   const storedVoucherNo = localStorage.getItem("selectedVoucherNo");
//   const storedYear = localStorage.getItem("selectedYear");

//   const filteredData = sidebardetails.filter(
//     (row) =>
//       row.voucher_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       row.fileno.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   const isValuationCompleted = details.invoiceStatus === "Valuation Completed";
//   const isWebPrepCompleted = details.status === "Web Preparation Completed";
//   const isEditDisabled = isValuationCompleted || isWebPerforationComplete || isWebPrepCompleted;

//   const playErrorSound = () => {
//     errorSound.play().catch((error) => {
//       console.error("Error playing sound:", error);
//     });
//   };

//   const showErrorToast = (title, text) => {
//     playErrorSound();
//     Swal.fire({
//       title,
//       text,
//       icon: "error",
//       confirmButtonText: "OK",
//     });
//   };

//   const showValuationCompletedMessage = () => {
//     Swal.fire({
//       title: "Action Denied",
//       text: "The Valuation or Preparation is Completed! You can't edit anything, only can read.",
//       icon: "warning",
//       confirmButtonText: "OK",
//     });
//   };

//   const showValuationCompletedPopup = () => {
//     Swal.fire({
//       title: "Valuation Completed",
//       text: "Valuation is Completed, you don't have any access to edit or add data (For more details please contact Wharf Department)",
//       icon: "success",
//       confirmButtonText: "OK",
//       position: "center",
//     });
//   };

//   const showWebPreparationCompletedPopup = () => {
//     Swal.fire({
//       title: "Web Preparation Completed",
//       text: "Web preparation is already completed for this shipment. Editing is disabled.",
//       icon: "warning",
//       confirmButtonText: "OK",
//     });
//   };

//   const formatNumberWithCommas = (number) => {
//     if (!number || isNaN(number)) return "";
    
//     // Convert to number and format with 2 decimal places
//     const num = Number(number);
    
//     // Format with thousands separators and 2 decimal places
//     return num.toLocaleString("en-US", {
//       minimumFractionDigits: 2,
//       maximumFractionDigits: 2
//     });
//   };

//   const formatDateTime = (dateString) => {
//     if (!dateString) return "";
//     const date = new Date(dateString);
//     if (isNaN(date)) return dateString;
//     const year = date.getFullYear();
//     const month = String(date.getMonth() + 1).padStart(2, "0");
//     const day = String(date.getDate()).padStart(2, "0");
//     return `${year}-${month}-${day}`;
//   };

//   const handleRowSelect = (index, row) => {
//     setSelectedRow(index);
//     setSelectedRowData(row);
//     localStorage.setItem("selectedVoucherNo", row.voucher_no);
//     localStorage.setItem("selectedYear", row.msd_year);

//     const fetchDetailsAndCheck = async () => {
//       try {
//         const response = await axios.get(
//           `https://esystems.cdl.lk/backend-test/ewharf/ValueList/GetSettlDetails?year=${row.msd_year}&vno=${row.voucher_no}`,
//           { timeout: 10000 }
//         );
//         if (response.data && response.data.ResultSet.length > 0) {
//           const data = response.data.ResultSet[0];

//           if (data.invoiceStatus === "") {
//             data.invoiceStatus = "Pending";
//           } else if (data.invoiceStatus === "V0") {
//             data.invoiceStatus = "Not Completed";
//           } else if (data.invoiceStatus === "V1") {
//             data.invoiceStatus = "Invoice Registered";
//           } else if (data.invoiceStatus === "V3") {
//             data.invoiceStatus = "Valuation Completed";
//           }

//           setCustominvoice(data.customerInvNo);
//           setContainer20(!!data.container_20);
//           setContainer40(!!data.container_40);
//           setContainer45(!!data.container_44 && !!data.container_45);
//           setIsWebPerforationComplete(data.isWebPerforationComplete || false);
//           setDetails(data);

//           if (data.invoiceStatus === "Valuation Completed") {
//             showValuationCompletedPopup();
//           }
          
//           if (data.status === "Web Preparation Completed") {
//             showWebPreparationCompletedPopup();
//           }
//         }
//       } catch (error) {
//         console.error("Error checking valuation status:", error.message);
//         showErrorToast("Error", "Failed to check valuation status");
//       }
//     };

//     fetchDetailsAndCheck();
//   };

//   const fetchSidebardetails = async (pageNum = 1, append = false) => {
//     setIsLoading(true);
//     try {
//       const response = await axios.get(
//         `https://esystems.cdl.lk/backend-test/ewharf/ValueList/GetSellleMenuDetails?page=${pageNum}&pageSize=${rowsPerPage}`,
//         { timeout: 10000 }
//       );
//       if (response.data && response.data.ResultSet) {
//         const newData = response.data.ResultSet;
//         setSidebardetails((prev) => (append ? [...prev, ...newData] : newData));
//         setHasMore(newData.length === rowsPerPage);
//       }
//     } catch (error) {
//       console.error("Error fetching sidebar details:", error.message);
//       showErrorToast("Error", "Failed to load sidebar details");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchSidebardetails(1);
//   }, []);

//   const loadMoreRows = () => {
//     const nextPage = page + 1;
//     setPage(nextPage);
//     fetchSidebardetails(nextPage, true);
//   };

//   useEffect(() => {
//     if (!storedVoucherNo || !storedYear) {
//       return;
//     }

//     const fetchDetails = async () => {
//       setIsLoading(true);
//       try {
//         const response = await axios.get(
//           `https://esystems.cdl.lk/backend-test/ewharf/ValueList/GetSettlDetails?year=${storedYear}&vno=${storedVoucherNo}`,
//           { timeout: 10000 }
//         );
//         if (response.data && response.data.ResultSet.length > 0) {
//           const data = response.data.ResultSet[0];

//           if (data.invoiceStatus === "") {
//             data.invoiceStatus = "Pending";
//           } else if (data.invoiceStatus === "V0") {
//             data.invoiceStatus = "Not Completed";
//           } else if (data.invoiceStatus === "V1") {
//             data.invoiceStatus = "Invoice Registered";
//           } else if (data.invoiceStatus === "V3") {
//             data.invoiceStatus = "Valuation Completed";
//           }

//           setCustominvoice(data.customerInvNo);
//           setContainer20(!!data.container_20);
//           setContainer40(!!data.container_40);
//           setContainer45(!!data.container_44 && !!data.container_45);
//           setIsWebPerforationComplete(data.isWebPerforationComplete || false);
//           setDetails(data);

//           if (data.status === "Web Preparation Completed") {
//             showWebPreparationCompletedPopup();
//           }
//         }
//       } catch (error) {
//         console.error("Error fetching details:", error.message);
//         showErrorToast("Error", "Failed to load shipment details");
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     const fetchpodetails = async () => {
//       setIsLoading(true);
//       try {
//         const response = await axios.get(
//           `https://esystems.cdl.lk/backend-test/ewharf/ValueList/GetPODetails?year=${storedYear}&vno=${storedVoucherNo}`,
//           { timeout: 10000 }
//         );
//         if (response.data && response.data.ResultSet) {
//           setPodetails(response.data.ResultSet);
//         }
//       } catch (error) {
//         console.error("Error fetching PO details:", error.message);
//         showErrorToast("Error", "Failed to load PO details");
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     const fetchAttachments = async () => {
//       setIsLoading(true);
//       try {
//         const response = await axios.get(
//           `https://esystems.cdl.lk/backend-test/ewharf/ValueList/GetOtheChragesDetails?year=${storedYear}&voucherno=${storedVoucherNo}`,
//           { timeout: 10000 }
//         );
//         if (response.data && response.data.ResultSet) {
//           const updatedData = response.data.ResultSet.map((row) => ({
//             ...row,
//             attachmentUrl: row.attachmentUrl || "",
//             attachmentName: row.attachmentName || "",
//             invoice_date: row.invoice_date || "",
//           })).reverse();
//           setOtherChargesRows(updatedData);
//         }
//       } catch (error) {
//         console.error("Error fetching attachments:", error.message);
//         showErrorToast("Error", "Failed to load attachments");
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     const fetchSettlementDescription = async () => {
//       try {
//         const response = await axios.get(
//           `https://esystems.cdl.lk/backend-test/ewharf/ValueList/CalculationDescription`
//         );
//         const data = response.data?.ResultSet || [];
//         setAttachmentDescription(data);
//       } catch (error) {
//         console.error(
//           "Error fetching details:",
//           error.response ? error.response.data : error.message
//         );
//         showErrorToast("Error", "Failed to load settlement description");
//       }
//     };

//     fetchAttachments();
//     fetchSettlementDescription();
//     fetchpodetails();
//     fetchDetails();
//   }, [storedVoucherNo, storedYear]);

//   const validateRow = (row) => {
//     const errors = [];

//     if (!row.calculation_type || row.calculation_type.trim() === "") {
//       errors.push("Type is required.");
//     }

//     if (!row.amount || row.amount.trim() === "") {
//       errors.push("Amount is required.");
//     } else if (isNaN(row.amount) || Number(row.amount) <= 0) {
//       errors.push("Amount must be a valid positive number.");
//     }

//     if (!row.invoice_no || row.invoice_no.trim() === "") {
//       errors.push("Invoice No is required.");
//     } else if (row.invoice_no.length > 20) {
//       errors.push("Invoice No must not exceed 20 characters.");
//     } else if (!/^[a-zA-Z0-9-/]+$/.test(row.invoice_no)) {
//       errors.push("Invoice No must be alphanumeric (letters, numbers, or hyphens only).");
//     }

//     if (row.vehicle_no && row.vehicle_no.trim() !== "") {
//       if (row.vehicle_no.length > 15) {
//         errors.push("Vehicle No must not exceed 15 characters.");
//       } else if (!/^[a-zA-Z0-9-]+$/.test(row.vehicle_no)) {
//         errors.push("Vehicle No must be alphanumeric (letters, numbers, or hyphens only).");
//       }
//     }

//     return errors;
//   };

//   const handleSaveOtherCharges = async () => {
//     if (isEditDisabled) {
//       showValuationCompletedMessage();
//       return;
//     }

//     try {
//       const validationErrors = [];
//       otherChargesRows.forEach((row, index) => {
//         const errors = validateRow(row);
//         if (errors.length > 0) {
//           validationErrors.push(`Row ${index + 1}: ${errors.join(", ")}`);
//         }
//       });

//       if (validationErrors.length > 0) {
//         showErrorToast("Validation Error", validationErrors.join("\n"));
//         return;
//       }

//       const settlementData = otherChargesRows.map((row) => ({
//         vehno: row.vehicle_no || "",
//         invdate: row.invoice_date || "",
//         amount: row.amount || "",
//         invno: row.invoice_no || "",
//         lrate: "",
//         ctype: row.calculation_type || "",
//         rate: row.rate || "",
//       }));

//       await axios.post(
//         `https://esystems.cdl.lk/backend-test/ewharf/ValueList/SetSettlementChrages`,
//         {
//           settlementDetails: settlementData,
//           user: "2203579",
//           year: storedYear,
//           voucherno: storedVoucherNo,
//         },
//         { headers: { "Content-Type": "application/json" }, timeout: 10000 }
//       );

//       const filesToUpload = Object.entries(selectedFiles)
//         .filter(([index]) => otherChargesRows[Number(index)])
//         .map(([index, fileData]) => ({
//           index: Number(index),
//           file: fileData?.file,
//           cal_type: otherChargesRows[Number(index)].calculation_type,
//         }));

//       if (filesToUpload.length > 0) {
//         const formData = new FormData();
//         filesToUpload.forEach(({ index, file, cal_type }, i) => {
//           if (file) {
//             formData.append(`FileUploadModels[${i}].ImageFile`, file);
//             formData.append(`FileUploadModels[${i}].index`, index.toString());
//             formData.append(`FileUploadModels[${i}].voucher_no`, storedVoucherNo);
//             formData.append(`FileUploadModels[${i}].year`, storedYear);
//             formData.append(`FileUploadModels[${i}].status`, "A");
//             formData.append(`FileUploadModels[${i}].cal_type`, cal_type);
//           }
//         });

//         const uploadResponse = await axios.post(
//           `https://esystems.cdl.lk/backend-test/ewharf/ValueList/UploadFiles1?CusInvoNo=${custominvoice || ""}`,
//           formData,
//           {
//             headers: { "Content-Type": "multipart/form-data" },
//             timeout: 30000,
//           }
//         );

//         if (uploadResponse.data && uploadResponse.data.ResultSet) {
//           const uploadedFiles = uploadResponse.data.ResultSet;
//           setOtherChargesRows((prevRows) =>
//             prevRows.map((row, idx) => {
//               const uploadedFile = uploadedFiles.find((f) => f.index === idx);
//               return uploadedFile
//                 ? {
//                     ...row,
//                     attachmentUrl: uploadedFile.fileUrl || "",
//                     attachmentName: uploadedFile.fileName || row.attachmentName,
//                   }
//                 : row;
//             })
//           );
//         }
//       }

//       setSelectedFiles([]);

//       Swal.fire({
//         title: "Success",
//         text: "Data and files saved successfully!",
//         icon: "success",
//         timer: 2000,
//         showConfirmButton: false,
//       });

//       const refreshResponse = await axios.get(
//         `https://esystems.cdl.lk/backend-test/ewharf/ValueList/GetOtheChragesDetails?year=${storedYear}&voucherno=${storedVoucherNo}`,
//         { timeout: 10000 }
//       );
//       if (refreshResponse.data && refreshResponse.data.ResultSet) {
//         const updatedData = refreshResponse.data.ResultSet.map((row) => ({
//           ...row,
//           attachmentUrl: row.attachmentUrl || "",
//           attachmentName: row.attachmentName || "",
//           invoice_date: row.invoice_date || "",
//         })).reverse();
//         setOtherChargesRows(updatedData);
//       }
//     } catch (error) {
//       console.error("Save Error:", error);
//       Swal.fire({
//         title: "Error",
//         text: error.response?.data?.message || error.message || "Failed to save data",
//         icon: "error",
//       });
//     }
//   };

//   const handleWebPerforationComplete = async () => {
//     setIsLoading(true);
//     try {
//       await axios.post(
//         `https://esystems.cdl.lk/backend-test/ewharf/ValueList/updatepreparationcomplete?year=${storedYear}&vno=${storedVoucherNo}`,
//         {},
//         { timeout: 10000 }
//       );

//       setIsWebPerforationComplete(true);
//       Swal.fire({
//         title: "Web Preparation Completed",
//         text: "Web preparation has been successfully completed. You can't edit anything in Other Charges section now.",
//         icon: "success",
//         confirmButtonText: "OK",
//         position: "center",
//       });
//     } catch (error) {
//       console.error("Error updating web preparation:", error.message);
//       Swal.fire({
//         title: "Error",
//         text: error.response?.data?.message || "Failed to complete web preparation.",
//         icon: "error",
//         confirmButtonText: "OK",
//         position: "center",
//       });
//       setIsWebPerforationComplete(false);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleStatusChange = (e) => {
//     const selectedValue = e.target.value;
//     if (selectedValue === "Preparation Complete" && !isWebPerforationComplete) {
//       Swal.fire({
//         title: "Confirm Web Preparation Completion",
//         text: "Are you sure you want to mark this as Preparation Complete? This action cannot be undone.",
//         icon: "warning",
//         showCancelButton: true,
//         confirmButtonText: "Yes, Complete",
//         cancelButtonText: "No, Cancel",
//       }).then((result) => {
//         if (result.isConfirmed) {
//           handleWebPerforationComplete();
//         } else {
//           e.target.value = "Un Complete";
//         }
//       });
//     }
//   };

//   useEffect(() => {
//     return () => {
//       selectedFiles.forEach((file) => {
//         if (file?.preview) URL.revokeObjectURL(file.preview);
//       });
//     };
//   }, [selectedFiles]);

//   return (
//     <div className="flex flex-col min-h-screen bg-gray-100">
//       <Header />
//       {isLoading ? (
//         <div className="flex justify-center items-center h-screen">
//           <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
//         </div>
//       ) : (
//         <>
//           <div className="bg-transparent p-6 border-gray-200">
//             <div className="container mx-auto flex justify-between items-center">
//               <h1 className="text-xl font-semibold text-indigo-700">
//                 {details.clerkName || ""}
//               </h1>
//               <button className="hover:bg-indigo-50 text-white px-4 py-2 rounded-md text-sm"></button>
//             </div>
//           </div>

//           {/* Mobile View - Other Charges at the top */}
//           <div className="lg:hidden container mx-auto px-2 py-5 pb-0">
//             <OtherCharges
//               otherChargesRows={otherChargesRows}
//               setOtherChargesRows={setOtherChargesRows}
//               isEditDisabled={isEditDisabled}
//               selectedFiles={selectedFiles}
//               setSelectedFiles={setSelectedFiles}
//               attachmentDescription={attachmentDescription}
//               custominvoice={custominvoice}
//               storedYear={storedYear}
//               storedVoucherNo={storedVoucherNo}
//               formatNumberWithCommas={formatNumberWithCommas}
//               formatDateTime={formatDateTime}
//               handleSaveOtherCharges={handleSaveOtherCharges}
//             />
//           </div>

//           <div className="container mx-auto px-2 py-2">
//             <div className="flex flex-col space-y-6">
//               <div className="order-1 lg:order-0 grid lg:grid-cols-[1fr,5fr] gap-6">
//                 {/* Left Column: Select Row */}
//                 <div className="bg-white rounded-lg shadow-lg overflow-hidden">
//                   <div className="hidden lg:block h-[460px]">
//                     <div className="bg-white rounded-lg overflow-hidden">
//                       <div className="bg-indigo-50 p-4 border-b">
//                         <h2 className="font-semibold text-indigo-700 flex items-center">
//                           <span className="inline-block mr-2">
//                             <svg
//                               xmlns="http://www.w3.org/2000/svg"
//                               className="h-5 w-5"
//                               viewBox="0 0 20 20"
//                               fill="currentColor"
//                             >
//                               <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.518 4.674a1 1 0 00.95.69h4.91c.969 0 1.372 1.24.588 1.81l-3.974 2.89a1 1 0 00-.364 1.118l1.518 4.674c.3.921-.755 1.688-1.54 1.118l-3.974-2.89a1 1 0 00-1.176 0l-3.974 2.89c-.785.57-1.84-.197-1.54-1.118l1.518-4.674a1 1 0 00-.364-1.118l-3.974-2.89c-.784-.57-.38-1.81.588-1.81h4.91a1 1 0 00.95-.69l1.518-4.674z" />
//                             </svg>
//                           </span>
//                           Select Row
//                         </h2>
//                       </div>
//                       <div className="p-3 space-y-2">
//                         <input
//                           type="text"
//                           placeholder="Search FILE_NO or DATE..."
//                           className="w-full py-1 px-4 rounded-md text-black border-[0.5px] border-black text-sm"
//                           value={searchQuery}
//                           onChange={(e) => setSearchQuery(e.target.value)}
//                         />
//                         <div className="border border-gray-300 rounded-lg overflow-hidden">
//                           <div className="bg-gray-50">
//                             <table className="w-full table-fixed border-collapse">
//                               <colgroup>
//                                 <col style={{ width: "50px" }} />
//                                 <col style={{ width: "46%" }} />
//                                 <col style={{ width: "50%" }} />
//                               </colgroup>
//                               <thead>
//                                 <tr>
//                                   <th className="py-1 px-2 border border-gray-300 text-center text-xs">
//                                     ✔
//                                   </th>
//                                   <th className="py-1 px-2 border border-gray-300 text-left text-xs">
//                                     Year
//                                   </th>
//                                   <th className="py-1 px-2 border border-gray-300 text-left text-xs">
//                                     File No
//                                   </th>
//                                 </tr>
//                               </thead>
//                             </table>
//                           </div>
//                           <div className="max-h-[440px] overflow-y-auto">
//                             <table className="w-full table-fixed border-collapse">
//                               <colgroup>
//                                 <col style={{ width: "50px" }} />
//                                 <col style={{ width: "54%" }} />
//                                 <col style={{ width: "50%" }} />
//                               </colgroup>
//                               <tbody>
//                                 {filteredData.map((row, index) => (
//                                   <tr
//                                     key={index}
//                                     className={`cursor-pointer transition ${
//                                       selectedRow === index
//                                         ? "bg-blue-500 text-white"
//                                         : "hover:bg-indigo-50"
//                                     }`}
//                                     onClick={() => handleRowSelect(index, row)}
//                                   >
//                                     <td className="py-1 px-2 border border-gray-200 text-center">
//                                       <input
//                                         type="checkbox"
//                                         checked={selectedRow === index}
//                                         onChange={() => handleRowSelect(index, row)}
//                                         className="h-3 w-3"
//                                       />
//                                     </td>
//                                     <td className="py-1 px-1 border border-gray-200 text-sm">
//                                       {row.msd_year}
//                                     </td>
//                                     <td className="py-1 px-1 border border-gray-200 text-sm">
//                                       {row.fileno}
//                                     </td>
//                                   </tr>
//                                 ))}
//                               </tbody>
//                             </table>
//                           </div>
//                         </div>

//                         {hasMore && (
//                           <div className="mt-2 text-center">
//                             <button
//                               onClick={loadMoreRows}
//                               className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1 rounded text-sm"
//                               disabled={isLoading}
//                             >
//                               {isLoading ? "Loading..." : "Load More"}
//                             </button>
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Right Column: Shipment Details, Status & Payment, Consignment Information, Purchase Orders */}
//                 <div>
//                   {/* Shipment Details Card */}
//                   <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
//                     <div className="bg-indigo-50 p-4 border-b">
//                       <h2 className="font-semibold text-indigo-700 flex items-center">
//                         <span className="inline-block mr-2">
//                           <svg
//                             xmlns="http://www.w3.org/2000/svg"
//                             className="h-5 w-5"
//                             viewBox="0 0 20 20"
//                             fill="currentColor"
//                           >
//                             <path
//                               fillRule="evenodd"
//                               d="M10 2a1 1 0 00-1 1v1H6a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V6a2 2 0 00-2-2h-3V3a1 1 0 00-1-1zm-1 8a1 1 0 112 0v3a1 1 0 11-2 0v-3z"
//                               clipRule="evenodd"
//                             />
//                           </svg>
//                         </span>
//                         Shipment Details
//                       </h2>
//                     </div>
//                     <div className="p-3">
//                       <div className="grid grid-cols-1 md:grid-cols-6 gap-2 text-sm">
//                         {[
//                           { label: "Date", key: "msd_date" },
//                           { label: "Name", key: "clerkName" },
//                           { label: "Operator", key: "clerk" },
//                           { label: "Transport Type", key: "transport_type" },
//                           { label: "Vessel Name/Flight No", key: "transport_mode" },
//                           { label: "Consignment Details", key: "consignment_details" },
//                         ].map((item, index) => (
//                           <div key={index} className="mb-2">
//                             <label className="block text-gray-600 text-xs mb-1">{item.label}</label>
//                             {item.key === "consignment_details" ? (
//                               <textarea
//                                 className="border border-gray-300 rounded w-full py-1 px-2 text-sm bg-gray-50 resize-none h-[40px]"
//                                 value={details[item.key] || ""}
//                                 readOnly
//                               />
//                             ) : (
//                               <input
//                                 type="text"
//                                 className="border border-gray-300 rounded w-full py-1 px-2 text-sm bg-gray-50"
//                                 value={details[item.key] || ""}
//                                 readOnly
//                               />
//                             )}
//                           </div>
//                         ))}
//                       </div>
//                       <div className="mt-3 grid grid-cols-1 md:grid-cols-6 gap-2 text-sm">
//                         {[
//                           { label: "Vessel/Flight Arrival", key: "vesselflight_arrivaldate" },
//                           { label: "Voucher Details", key: "voucher_no" },
//                           { label: "Invoice Details", key: "customerInvNo" },
//                           { label: "B.L/AWB No", key: "blawb_no" },
//                           { label: "Delivery Location", key: "deliverylocation" },
//                         ].map((item, index) => (
//                           <div key={index} className="mb-2">
//                             <label className="block text-gray-600 text-xs mb-1">{item.label}</label>
//                             <input
//                               type="text"
//                               className="border border-gray-300 rounded w-full py-1 px-2 text-sm bg-gray-50"
//                               value={details[item.key] || ""}
//                               readOnly
//                             />
//                           </div>
//                         ))}
//                       </div>
//                     </div>
//                   </div>

//                   {/* Status & Payment, Consignment Information, and Purchase Orders in the Same Row */}
//                   <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-0">
//                     {/* Status & Payment Card */}
//                     {details.status && (
//                       <div className="bg-white rounded-lg shadow-lg overflow-hidden">
//                         <div className="bg-indigo-50 p-4 border-b">
//                           <h2 className="font-semibold text-indigo-700 flex items-center">
//                             <span className="inline-block mr-2">
//                               <svg
//                                 xmlns="http://www.w3.org/2000/svg"
//                                 className="h-5 w-5"
//                                 viewBox="0 0 20 20"
//                                 fill="currentColor"
//                               >
//                                 <path
//                                   fillRule="evenodd"
//                                   d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
//                                   clipRule="evenodd"
//                                 />
//                               </svg>
//                             </span>
//                             Status & Payment
//                           </h2>
//                         </div>
//                         <div className="p-3">
//                           <div className="grid grid-cols-1 md:grid-cols-1 gap-2 text-sm">
//                             <div className="mb-2">
//                               <label className="block text-gray-600 text-xs mb-1">Status</label>
//                               <input
//                                 type="text"
//                                 className="border border-gray-300 rounded w-2/3 py-1 px-2 text-sm bg-gray-50"
//                                 value={details.status || ""}
//                                 readOnly
//                               />
//                             </div>
//                             <div className="mb-2">
//                               <label className="block text-gray-600 text-xs mb-1">Payee</label>
//                               <div className="flex gap-2">
//                                 <input
//                                   type="text"
//                                   className="border border-gray-300 rounded w-1/3 py-1 px-2 text-sm bg-gray-50"
//                                   value={details.supplier_code || ""}
//                                   readOnly
//                                 />
//                                 <input
//                                   type="text"
//                                   className="border border-gray-300 rounded flex-1 py-1 px-2 text-sm bg-gray-50"
//                                   value={details.v_supplier || ""}
//                                   readOnly
//                                 />
//                               </div>
//                             </div>
//                             <div className="mb-2">
//                               <label className="block text-gray-600 text-xs mb-1">Foreign Invoice</label>
//                               <div className="flex gap-2">
//                                 <input
//                                   type="text"
//                                   className="border border-gray-300 rounded w-2/5 py-1 px-2 text-sm bg-gray-50"
//                                   value={details.customerInvNo || ""}
//                                   readOnly
//                                 />
//                                 <input
//                                   type="text"
//                                   className={`border border-gray-300 rounded w-3/5 py-1 px-2 text-sm ${
//                                     details.invoiceStatus === "Valuation Completed"
//                                       ? "bg-red-100"
//                                       : "bg-blue-100"
//                                   }`}
//                                   value={details.invoiceStatus || ""}
//                                   readOnly
//                                 />
//                               </div>
//                             </div>
//                             <div className="grid grid-cols-2 gap-2">
//                               {details.status === "Web Preparation Completed" ? (
//                                 <div>
//                                   <label className="block text-gray-600 text-xs mb-1">
//                                     Web Preparation Status
//                                   </label>
//                                   <input
//                                     type="text"
//                                     className="border border-gray-300 rounded w-full py-1 px-2 text-sm bg-red-100"
//                                     value="Web Preparation Completed"
//                                     readOnly
//                                   />
//                                 </div>
//                               ) : (
//                                 <div>
//                                   <label className="block text-gray-600 text-xs mb-1">
//                                     Web Preparation Status
//                                   </label>
//                                   <select
//                                     className={`border border-gray-300 rounded w-full py-1 px-2 text-sm ${
//                                       isValuationCompleted ? "bg-gray-200 cursor-not-allowed" : ""
//                                     } ${isWebPerforationComplete ? "bg-green-100" : "bg-red-100"}`}
//                                     value={isWebPerforationComplete ? "Preparation Complete" : "Un Complete"}
//                                     onChange={handleStatusChange}
//                                     disabled={isValuationCompleted || isWebPerforationComplete}
//                                   >
//                                     <option value="Un Complete">In Complete</option>
//                                     <option value="Preparation Complete">Web Preparation Complete</option>
//                                   </select>
//                                 </div>
//                               )}
//                             </div>
//                           </div>
//                         </div>
//                       </div>
//                     )}

//                     {/* Consignment Information Card */}
//                     <div className="bg-white rounded-lg shadow-lg overflow-hidden">
//                       <div className="bg-indigo-50 p-4 border-b">
//                         <h2 className="font-semibold text-indigo-700 flex items-center">
//                           <span className="inline-block mr-2">
//                             <svg
//                               xmlns="http://www.w3.org/2000/svg"
//                               className="h-5 w-5"
//                               viewBox="0 0 20 20"
//                               fill="currentColor"
//                             >
//                               <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z" />
//                             </svg>
//                           </span>
//                           Consignment Information
//                         </h2>
//                       </div>
//                       <div className="p-3">
//                         <div className="grid grid-cols-2 gap-3 mb-4">
//                           <div>
//                             <label className="block text-gray-600 text-xs mb-1">
//                               Consignment Type
//                             </label>
//                             <input
//                               type="text"
//                               className="border border-gray-300 rounded w-full py-1 px-2 text-sm bg-gray-50"
//                               value={details.consignment_type || ""}
//                               readOnly
//                             />
//                           </div>
//                           <div>
//                             <label className="block text-gray-600 text-xs mb-1">
//                               Quantity
//                             </label>
//                             <input
//                               type="text"
//                               className="border border-gray-300 rounded w-24 py-1 px-2 text-sm bg-gray-50"
//                               value={details.quantity || ""}
//                               readOnly
//                             />
//                           </div>
//                         </div>
//                         <div className="grid grid-cols-2 gap-0 mb-4">
//                           <div>
//                             <h3 className="text-gray-600 text-xs font-semibold mb-2">
//                               Container Type
//                             </h3>
//                             <div className="space-y-2">
//                               <div className="flex items-center">
//                                 <span className="w-16 text-sm">20FT</span>
//                                 <input
//                                   type="checkbox"
//                                   checked={container20}
//                                   readOnly
//                                   className="h-4 w-4 text-indigo-600"
//                                 />
//                               </div>
//                               <div className="flex items-center">
//                                 <span className="w-16 text-sm">40FT</span>
//                                 <input
//                                   type="checkbox"
//                                   checked={container40}
//                                   readOnly
//                                   className="h-4 w-4 text-indigo-600"
//                                 />
//                               </div>
//                               <div className="flex items-center">
//                                 <span className="w-16 text-sm">45FT</span>
//                                 <input
//                                   type="checkbox"
//                                   checked={container45}
//                                   readOnly
//                                   className="h-4 w-4 text-indigo-600"
//                                 />
//                               </div>
//                             </div>
//                           </div>
//                           <div>
//                             <h3 className="text-gray-600 text-xs font-semibold mb-2">
//                               Quantity
//                             </h3>
//                             <div className="space-y-1">
//                               <input
//                                 type="number"
//                                 className="border rounded py-0 px-2 w-16 text-sm"
//                                 value={details.container_20_qty || ""}
//                                 readOnly
//                               />
//                               <input
//                                 type="number"
//                                 className="border rounded py-0 px-2 w-16 text-sm block mt-1"
//                                 value={details.container_40_qty || ""}
//                                 readOnly
//                               />
//                               <input
//                                 type="number"
//                                 className="border rounded py-0 px-2 w-16 text-sm block mt-1"
//                                 value={details.container_45_qty || ""}
//                                 readOnly
//                               />
//                             </div>
//                           </div>
//                           <div>
//                             <h3 className="text-gray-600 text-xs font-semibold mb-2">
//                               Company Information
//                             </h3>
//                             <input
//                               type="text"
//                               value={details.foreignSupplierName}
//                               className="border border-gray-300 rounded text-xs py-2 px-1 w-44"
//                               readOnly
//                             />
//                           </div>
                          
//                           <div>
//                             <label className="block text-gray-600 text-xs mb-2 px-">
//                               Valuation Completed Date
//                             </label>
//                             <input
//                               type="text"
//                               value={details.valcompleted_date}
//                               className="border border-gray-300 rounded py-1 px-1 w-24 text-sm bg-gray-50"
//                               readOnly
//                             />
//                           </div>
//                         </div>
//                       </div>
//                     </div>

//                     {/* Purchase Orders Card */}
//                     <div className="bg-white rounded-lg shadow-lg overflow-hidden">
//                       <div className="bg-indigo-50 p-5 border-b">
//                         <h2 className="font-semibold text-indigo-700 flex items-center">
//                           <span className="inline-block mr-2">
//                             <svg
//                               xmlns="http://www.w3.org/2000/svg"
//                               className="h-5 w-5"
//                               viewBox="0 0 20 20"
//                               fill="currentColor"
//                             >
//                               <path
//                                 fillRule="evenodd"
//                                 d="M5 2a2 2 0 00-2 2v14l3.5-2 3.5 2 3.5-2 3.5 2V4a2 2 0 00-2-2H5zm4.707 3.707a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L8.414 9H10a3 3 0 013 3v1a1 1 0 102 0v-1a5 5 0 00-5-5H8.414l1.293-1.293z"
//                                 clipRule="evenodd"
//                               />
//                             </svg>
//                           </span>
//                           Purchase Orders
//                         </h2>
//                       </div>
//                       <div className="p-3">
//                         <div className="border border-gray-300 rounded-lg overflow-hidden">
//                           <div className="bg-gray-50">
//                             <table className="w-full table-fixed border-collapse">
//                               <thead>
//                                 <tr>
//                                   <th className="py-2 px-2 border border-gray-300 text-center text-sm font-medium text-gray-600">
//                                     PO NO/Job NO
//                                   </th>
//                                   <th className="py-1 px-2 border border-gray-300 text-center text-sm font-medium text-gray-600">
//                                     Total Amount
//                                   </th>
//                                 </tr>
//                               </thead>
//                             </table>
//                           </div>
//                           <div className="max-h-[200px] overflow-y-auto">
//                             <table className="w-full table-fixed border-collapse">
//                               <tbody>
//                                 {podetails.map((podetail, index) => (
//                                   <tr key={index}>
//                                     <td className="py-1 px-2 border border-gray-200 text-sm">
//                                       {podetail.po_no}
//                                     </td>
//                                     <td className="py-2 px-2 border border-gray-200 text-sm text-right">
//                                       {formatNumberWithCommas(podetail.totalamount)}
//                                     </td>
//                                   </tr>
//                                 ))}
//                                 {Array.from({
//                                   length: Math.max(0, 7 - podetails.length),
//                                 }).map((_, index) => (
//                                   <tr key={`empty-${index}`} className="bg-white-50">
//                                     <td className="py-1 px-2 border border-gray-200 text-gray-400 text-center text-sm">
//                                       -
//                                     </td>
//                                     <td className="py-1 px-2 border border-gray-200 text-gray-400 text-center text-sm">
//                                       -
//                                     </td>
//                                   </tr>
//                                 ))}
//                               </tbody>
//                             </table>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//             {/* Other Charges Component */}
//             <div className="hidden lg:block">
//               <OtherCharges
//                 otherChargesRows={otherChargesRows}
//                 setOtherChargesRows={setOtherChargesRows}
//                 isEditDisabled={isEditDisabled}
//                 selectedFiles={selectedFiles}
//                 setSelectedFiles={setSelectedFiles}
//                 attachmentDescription={attachmentDescription}
//                 custominvoice={custominvoice}
//                 storedYear={storedYear}
//                 storedVoucherNo={storedVoucherNo}
//                 formatNumberWithCommas={formatNumberWithCommas}
//                 formatDateTime={formatDateTime}
//                 handleSaveOtherCharges={handleSaveOtherCharges}
//               />
//             </div>
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default ShipmentForm;


















// import Swal from "sweetalert2";
// import React, { useState, useEffect } from "react";
// import Header from "./Header";
// import axios from "axios";
// import OtherCharges from "../components/OtherChages";

// const errorSound = new Audio("/error-sound.mp3");

// const ShipmentForm = () => {
//   const [otherChargesRows, setOtherChargesRows] = useState([]);
//   const [container20, setContainer20] = useState(false);
//   const [container40, setContainer40] = useState(false);
//   const [container45, setContainer45] = useState(false);
//   const [details, setDetails] = useState({});
//   const [selectedRow, setSelectedRow] = useState(null);
//   const [selectedRowData, setSelectedRowData] = useState(null);
//   const [sidebardetails, setSidebardetails] = useState([]);
//   const [podetails, setPodetails] = useState([]);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const [page, setPage] = useState(1);
//   const [hasMore, setHasMore] = useState(true);
//   const [selectedFiles, setSelectedFiles] = useState([]);
//   const [attachmentDescription, setAttachmentDescription] = useState([]);
//   const [custominvoice, setCustominvoice] = useState("");
//   const [isWebPerforationComplete, setIsWebPerforationComplete] = useState(false);

//   const rowsPerPage = 10;
//   const storedVoucherNo = localStorage.getItem("selectedVoucherNo");
//   const storedYear = localStorage.getItem("selectedYear");

//   const filteredData = sidebardetails.filter(
//     (row) =>
//       row.voucher_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       row.fileno.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   const isValuationCompleted = details.invoiceStatus === "Valuation Completed";
//   const isWebPrepCompleted = details.status === "Web Preparation Completed";
//   const isEditDisabled = isValuationCompleted || isWebPerforationComplete || isWebPrepCompleted;

//   const playErrorSound = () => {
//     errorSound.play().catch((error) => {
//       console.error("Error playing sound:", error);
//     });
//   };

//   const showErrorToast = (title, text) => {
//     playErrorSound();
//     Swal.fire({
//       title,
//       text,
//       icon: "error",
//       confirmButtonText: "OK",
//     });
//   };

//   const showValuationCompletedMessage = () => {
//     Swal.fire({
//       title: "Action Denied",
//       text: "The Valuation or Preparation is Completed! You can't edit anything, only can read.",
//       icon: "warning",
//       confirmButtonText: "OK",
//     });
//   };

//   const showValuationCompletedPopup = () => {
//     Swal.fire({
//       title: "Valuation Completed",
//       text: "Valuation is Completed, you don't have any access to edit or add data (For more details please contact Wharf Department)",
//       icon: "success",
//       confirmButtonText: "OK",
//       position: "center",
//     });
//   };

//   const showWebPreparationCompletedPopup = () => {
//     Swal.fire({
//       title: "Web Preparation Completed",
//       text: "Web preparation is already completed for this shipment. Editing is disabled.",
//       icon: "warning",
//       confirmButtonText: "OK",
//     });
//   };

//   const formatNumberWithCommas = (number) => {
//     if (!number || isNaN(number)) return "";
//     return Number(number).toLocaleString("en-US");
//   };

//   const formatDateTime = (dateString) => {
//     if (!dateString) return "";
//     const date = new Date(dateString);
//     if (isNaN(date)) return dateString;
//     const year = date.getFullYear();
//     const month = String(date.getMonth() + 1).padStart(2, "0");
//     const day = String(date.getDate()).padStart(2, "0");
//     return `${year}-${month}-${day}`;
//   };

//   const handleRowSelect = (index, row) => {
//     setSelectedRow(index);
//     setSelectedRowData(row);
//     localStorage.setItem("selectedVoucherNo", row.voucher_no);
//     localStorage.setItem("selectedYear", row.msd_year);

//     const fetchDetailsAndCheck = async () => {
//       try {
//         const response = await axios.get(
//           `https://esystems.cdl.lk/backend-test/ewharf/ValueList/GetSettlDetails?year=${row.msd_year}&vno=${row.voucher_no}`,
//           { timeout: 10000 }
//         );
//         if (response.data && response.data.ResultSet.length > 0) {
//           const data = response.data.ResultSet[0];

//           if (data.invoiceStatus === "") {
//             data.invoiceStatus = "Pending";
//           } else if (data.invoiceStatus === "V0") {
//             data.invoiceStatus = "Not Completed";
//           } else if (data.invoiceStatus === "V1") {
//             data.invoiceStatus = "Invoice Registered";
//           } else if (data.invoiceStatus === "V3") {
//             data.invoiceStatus = "Valuation Completed";
//           }

//           setCustominvoice(data.customerInvNo);
//           setContainer20(!!data.container_20);
//           setContainer40(!!data.container_40);
//           setContainer45(!!data.container_44 && !!data.container_45);
//           setIsWebPerforationComplete(data.isWebPerforationComplete || false);
//           setDetails(data);

//           if (data.invoiceStatus === "Valuation Completed") {
//             showValuationCompletedPopup();
//           }
          
//           if (data.status === "Web Preparation Completed") {
//             showWebPreparationCompletedPopup();
//           }
//         }
//       } catch (error) {
//         console.error("Error checking valuation status:", error.message);
//         showErrorToast("Error", "Failed to check valuation status");
//       }
//     };

//     fetchDetailsAndCheck();
//   };

//   const fetchSidebardetails = async (pageNum = 1, append = false) => {
//     setIsLoading(true);
//     try {
//       const response = await axios.get(
//         `https://esystems.cdl.lk/backend-test/ewharf/ValueList/GetSellleMenuDetails?page=${pageNum}&pageSize=${rowsPerPage}`,
//         { timeout: 10000 }
//       );
//       if (response.data && response.data.ResultSet) {
//         const newData = response.data.ResultSet;
//         setSidebardetails((prev) => (append ? [...prev, ...newData] : newData));
//         setHasMore(newData.length === rowsPerPage);
//       }
//     } catch (error) {
//       console.error("Error fetching sidebar details:", error.message);
//       showErrorToast("Error", "Failed to load sidebar details");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchSidebardetails(1);
//   }, []);

//   const loadMoreRows = () => {
//     const nextPage = page + 1;
//     setPage(nextPage);
//     fetchSidebardetails(nextPage, true);
//   };

//   useEffect(() => {
//     if (!storedVoucherNo || !storedYear) {
//       return;
//     }

//     const fetchDetails = async () => {
//       setIsLoading(true);
//       try {
//         const response = await axios.get(
//           `https://esystems.cdl.lk/backend-test/ewharf/ValueList/GetSettlDetails?year=${storedYear}&vno=${storedVoucherNo}`,
//           { timeout: 10000 }
//         );
//         if (response.data && response.data.ResultSet.length > 0) {
//           const data = response.data.ResultSet[0];

//           if (data.invoiceStatus === "") {
//             data.invoiceStatus = "Pending";
//           } else if (data.invoiceStatus === "V0") {
//             data.invoiceStatus = "Not Completed";
//           } else if (data.invoiceStatus === "V1") {
//             data.invoiceStatus = "Invoice Registered";
//           } else if (data.invoiceStatus === "V3") {
//             data.invoiceStatus = "Valuation Completed";
//           }

//           setCustominvoice(data.customerInvNo);
//           setContainer20(!!data.container_20);
//           setContainer40(!!data.container_40);
//           setContainer45(!!data.container_44 && !!data.container_45);
//           setIsWebPerforationComplete(data.isWebPerforationComplete || false);
//           setDetails(data);

//           if (data.status === "Web Preparation Completed") {
//             showWebPreparationCompletedPopup();
//           }
//         }
//       } catch (error) {
//         console.error("Error fetching details:", error.message);
//         showErrorToast("Error", "Failed to load shipment details");
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     const fetchpodetails = async () => {
//       setIsLoading(true);
//       try {
//         const response = await axios.get(
//           `https://esystems.cdl.lk/backend-test/ewharf/ValueList/GetPODetails?year=${storedYear}&vno=${storedVoucherNo}`,
//           { timeout: 10000 }
//         );
//         if (response.data && response.data.ResultSet) {
//           setPodetails(response.data.ResultSet);
//         }
//       } catch (error) {
//         console.error("Error fetching PO details:", error.message);
//         showErrorToast("Error", "Failed to load PO details");
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     const fetchAttachments = async () => {
//       setIsLoading(true);
//       try {
//         const response = await axios.get(
//           `https://esystems.cdl.lk/backend-test/ewharf/ValueList/GetOtheChragesDetails?year=${storedYear}&voucherno=${storedVoucherNo}`,
//           { timeout: 10000 }
//         );
//         if (response.data && response.data.ResultSet) {
//           const updatedData = response.data.ResultSet.map((row) => ({
//             ...row,
//             attachmentUrl: row.attachmentUrl || "",
//             attachmentName: row.attachmentName || "",
//             invoice_date: row.invoice_date || "",
//           })).reverse();
//           setOtherChargesRows(updatedData);
//         }
//       } catch (error) {
//         console.error("Error fetching attachments:", error.message);
//         showErrorToast("Error", "Failed to load attachments");
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     const fetchSettlementDescription = async () => {
//       try {
//         const response = await axios.get(
//           `https://esystems.cdl.lk/backend-test/ewharf/ValueList/CalculationDescription`
//         );
//         const data = response.data?.ResultSet || [];
//         setAttachmentDescription(data);
//       } catch (error) {
//         console.error(
//           "Error fetching details:",
//           error.response ? error.response.data : error.message
//         );
//         showErrorToast("Error", "Failed to load settlement description");
//       }
//     };

//     fetchAttachments();
//     fetchSettlementDescription();
//     fetchpodetails();
//     fetchDetails();
//   }, [storedVoucherNo, storedYear]);

//   const validateRow = (row) => {
//     const errors = [];

//     if (!row.calculation_type || row.calculation_type.trim() === "") {
//       errors.push("Type is required.");
//     }

//     if (!row.amount || row.amount.trim() === "") {
//       errors.push("Amount is required.");
//     } else if (isNaN(row.amount) || Number(row.amount) <= 0) {
//       errors.push("Amount must be a valid positive number.");
//     }

//     if (!row.invoice_no || row.invoice_no.trim() === "") {
//       errors.push("Invoice No is required.");
//     } else if (row.invoice_no.length > 20) {
//       errors.push("Invoice No must not exceed 20 characters.");
//     } else if (!/^[a-zA-Z0-9-/]+$/.test(row.invoice_no)) {
//       errors.push("Invoice No must be alphanumeric (letters, numbers, or hyphens only).");
//     }

//     if (row.vehicle_no && row.vehicle_no.trim() !== "") {
//       if (row.vehicle_no.length > 15) {
//         errors.push("Vehicle No must not exceed 15 characters.");
//       } else if (!/^[a-zA-Z0-9-]+$/.test(row.vehicle_no)) {
//         errors.push("Vehicle No must be alphanumeric (letters, numbers, or hyphens only).");
//       }
//     }

//     return errors;
//   };

//   const handleSaveOtherCharges = async () => {
//     if (isEditDisabled) {
//       showValuationCompletedMessage();
//       return;
//     }

//     try {
//       const validationErrors = [];
//       otherChargesRows.forEach((row, index) => {
//         const errors = validateRow(row);
//         if (errors.length > 0) {
//           validationErrors.push(`Row ${index + 1}: ${errors.join(", ")}`);
//         }
//       });

//       if (validationErrors.length > 0) {
//         showErrorToast("Validation Error", validationErrors.join("\n"));
//         return;
//       }

//       const settlementData = otherChargesRows.map((row) => ({
//         vehno: row.vehicle_no || "",
//         invdate: row.invoice_date || "",
//         amount: row.amount || "",
//         invno: row.invoice_no || "",
//         lrate: "",
//         ctype: row.calculation_type || "",
//         rate: row.rate || "",
//       }));

//       await axios.post(
//         `https://esystems.cdl.lk/backend-test/ewharf/ValueList/SetSettlementChrages`,
//         {
//           settlementDetails: settlementData,
//           user: "2203579",
//           year: storedYear,
//           voucherno: storedVoucherNo,
//         },
//         { headers: { "Content-Type": "application/json" }, timeout: 10000 }
//       );

//       const filesToUpload = Object.entries(selectedFiles)
//         .filter(([index]) => otherChargesRows[Number(index)])
//         .map(([index, fileData]) => ({
//           index: Number(index),
//           file: fileData?.file,
//           cal_type: otherChargesRows[Number(index)].calculation_type,
//         }));

//       if (filesToUpload.length > 0) {
//         const formData = new FormData();
//         filesToUpload.forEach(({ index, file, cal_type }, i) => {
//           if (file) {
//             formData.append(`FileUploadModels[${i}].ImageFile`, file);
//             formData.append(`FileUploadModels[${i}].index`, index.toString());
//             formData.append(`FileUploadModels[${i}].voucher_no`, storedVoucherNo);
//             formData.append(`FileUploadModels[${i}].year`, storedYear);
//             formData.append(`FileUploadModels[${i}].status`, "A");
//             formData.append(`FileUploadModels[${i}].cal_type`, cal_type);
//           }
//         });

//         const uploadResponse = await axios.post(
//           `https://esystems.cdl.lk/backend-test/ewharf/ValueList/UploadFiles1?CusInvoNo=${custominvoice || ""}`,
//           formData,
//           {
//             headers: { "Content-Type": "multipart/form-data" },
//             timeout: 30000,
//           }
//         );

//         if (uploadResponse.data && uploadResponse.data.ResultSet) {
//           const uploadedFiles = uploadResponse.data.ResultSet;
//           setOtherChargesRows((prevRows) =>
//             prevRows.map((row, idx) => {
//               const uploadedFile = uploadedFiles.find((f) => f.index === idx);
//               return uploadedFile
//                 ? {
//                     ...row,
//                     attachmentUrl: uploadedFile.fileUrl || "",
//                     attachmentName: uploadedFile.fileName || row.attachmentName,
//                   }
//                 : row;
//             })
//           );
//         }
//       }

//       setSelectedFiles([]);

//       Swal.fire({
//         title: "Success",
//         text: "Data and files saved successfully!",
//         icon: "success",
//         timer: 2000,
//         showConfirmButton: false,
//       });

//       const refreshResponse = await axios.get(
//         `https://esystems.cdl.lk/backend-test/ewharf/ValueList/GetOtheChragesDetails?year=${storedYear}&voucherno=${storedVoucherNo}`,
//         { timeout: 10000 }
//       );
//       if (refreshResponse.data && refreshResponse.data.ResultSet) {
//         const updatedData = refreshResponse.data.ResultSet.map((row) => ({
//           ...row,
//           attachmentUrl: row.attachmentUrl || "",
//           attachmentName: row.attachmentName || "",
//           invoice_date: row.invoice_date || "",
//         })).reverse();
//         setOtherChargesRows(updatedData);
//       }
//     } catch (error) {
//       console.error("Save Error:", error);
//       Swal.fire({
//         title: "Error",
//         text: error.response?.data?.message || error.message || "Failed to save data",
//         icon: "error",
//       });
//     }
//   };

//   const handleWebPerforationComplete = async () => {
//     setIsLoading(true);
//     try {
//       await axios.post(
//         `https://esystems.cdl.lk/backend-test/ewharf/ValueList/updatepreparationcomplete?year=${storedYear}&vno=${storedVoucherNo}`,
//         {},
//         { timeout: 10000 }
//       );

//       setIsWebPerforationComplete(true);
//       Swal.fire({
//         title: "Web Preparation Completed",
//         text: "Web preparation has been successfully completed. You can't edit anything in Other Charges section now.",
//         icon: "success",
//         confirmButtonText: "OK",
//         position: "center",
//       });
//     } catch (error) {
//       console.error("Error updating web preparation:", error.message);
//       Swal.fire({
//         title: "Error",
//         text: error.response?.data?.message || "Failed to complete web preparation.",
//         icon: "error",
//         confirmButtonText: "OK",
//         position: "center",
//       });
//       setIsWebPerforationComplete(false);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleStatusChange = (e) => {
//     const selectedValue = e.target.value;
//     if (selectedValue === "Preparation Complete" && !isWebPerforationComplete) {
//       Swal.fire({
//         title: "Confirm Web Preparation Completion",
//         text: "Are you sure you want to mark this as Preparation Complete? This action cannot be undone.",
//         icon: "warning",
//         showCancelButton: true,
//         confirmButtonText: "Yes, Complete",
//         cancelButtonText: "No, Cancel",
//       }).then((result) => {
//         if (result.isConfirmed) {
//           handleWebPerforationComplete();
//         } else {
//           e.target.value = "Un Complete";
//         }
//       });
//     }
//   };

//   useEffect(() => {
//     return () => {
//       selectedFiles.forEach((file) => {
//         if (file?.preview) URL.revokeObjectURL(file.preview);
//       });
//     };
//   }, [selectedFiles]);

//   return (
//     <div className="flex flex-col min-h-screen bg-gray-100">
//       <Header />
//       {isLoading ? (
//         <div className="flex justify-center items-center h-screen">
//           <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
//         </div>
//       ) : (
//         <>
//           <div className="bg-transparent p-6 border-gray-200">
//             <div className="container mx-auto flex justify-between items-center">
//               <h1 className="text-xl font-semibold text-indigo-700">
//                 {details.clerkName || ""}
//               </h1>
//               <button className="hover:bg-indigo-50 text-white px-4 py-2 rounded-md text-sm"></button>
//             </div>
//           </div>

//           {/* Mobile View - Other Charges at the top */}
//           <div className="lg:hidden container mx-auto px-2 py-5 pb-0">
//             <OtherCharges
//               otherChargesRows={otherChargesRows}
//               setOtherChargesRows={setOtherChargesRows}
//               isEditDisabled={isEditDisabled}
//               selectedFiles={selectedFiles}
//               setSelectedFiles={setSelectedFiles}
//               attachmentDescription={attachmentDescription}
//               custominvoice={custominvoice}
//               storedYear={storedYear}
//               storedVoucherNo={storedVoucherNo}
//               formatNumberWithCommas={formatNumberWithCommas}
//               formatDateTime={formatDateTime}
//               handleSaveOtherCharges={handleSaveOtherCharges}
//             />
//           </div>

//           <div className="container mx-auto px-2 py-2">
//             <div className="flex flex-col space-y-6">
//               <div className="order-1 lg:order-0 grid lg:grid-cols-[1fr,5fr] gap-6">
//                 {/* Left Column: Select Row */}
//                 <div className="bg-white rounded-lg shadow-lg overflow-hidden">
//                   <div className="hidden lg:block h-[460px]">
//                     <div className="bg-white rounded-lg overflow-hidden">
//                       <div className="bg-indigo-50 p-4 border-b">
//                         <h2 className="font-semibold text-indigo-700 flex items-center">
//                           <span className="inline-block mr-2">
//                             <svg
//                               xmlns="http://www.w3.org/2000/svg"
//                               className="h-5 w-5"
//                               viewBox="0 0 20 20"
//                               fill="currentColor"
//                             >
//                               <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.518 4.674a1 1 0 00.95.69h4.91c.969 0 1.372 1.24.588 1.81l-3.974 2.89a1 1 0 00-.364 1.118l1.518 4.674c.3.921-.755 1.688-1.54 1.118l-3.974-2.89a1 1 0 00-1.176 0l-3.974 2.89c-.785.57-1.84-.197-1.54-1.118l1.518-4.674a1 1 0 00-.364-1.118l-3.974-2.89c-.784-.57-.38-1.81.588-1.81h4.91a1 1 0 00.95-.69l1.518-4.674z" />
//                             </svg>
//                           </span>
//                           Select Row
//                         </h2>
//                       </div>
//                       <div className="p-3 space-y-2">
//                         <input
//                           type="text"
//                           placeholder="Search FILE_NO or DATE..."
//                           className="w-full py-1 px-4 rounded-md text-black border-[0.5px] border-black text-sm"
//                           value={searchQuery}
//                           onChange={(e) => setSearchQuery(e.target.value)}
//                         />
//                         <div className="border border-gray-300 rounded-lg overflow-hidden">
//                           <div className="bg-gray-50">
//                             <table className="w-full table-fixed border-collapse">
//                               <colgroup>
//                                 <col style={{ width: "50px" }} />
//                                 <col style={{ width: "46%" }} />
//                                 <col style={{ width: "50%" }} />
//                               </colgroup>
//                               <thead>
//                                 <tr>
//                                   <th className="py-1 px-2 border border-gray-300 text-center text-xs">
//                                     ✔
//                                   </th>
//                                   <th className="py-1 px-2 border border-gray-300 text-left text-xs">
//                                     Year
//                                   </th>
//                                   <th className="py-1 px-2 border border-gray-300 text-left text-xs">
//                                     File No
//                                   </th>
//                                 </tr>
//                               </thead>
//                             </table>
//                           </div>
//                           <div className="max-h-[440px] overflow-y-auto">
//                             <table className="w-full table-fixed border-collapse">
//                               <colgroup>
//                                 <col style={{ width: "50px" }} />
//                                 <col style={{ width: "54%" }} />
//                                 <col style={{ width: "50%" }} />
//                               </colgroup>
//                               <tbody>
//                                 {filteredData.map((row, index) => (
//                                   <tr
//                                     key={index}
//                                     className={`cursor-pointer transition ${
//                                       selectedRow === index
//                                         ? "bg-blue-500 text-white"
//                                         : "hover:bg-indigo-50"
//                                     }`}
//                                     onClick={() => handleRowSelect(index, row)}
//                                   >
//                                     <td className="py-1 px-2 border border-gray-200 text-center">
//                                       <input
//                                         type="checkbox"
//                                         checked={selectedRow === index}
//                                         onChange={() => handleRowSelect(index, row)}
//                                         className="h-3 w-3"
//                                       />
//                                     </td>
//                                     <td className="py-1 px-1 border border-gray-200 text-sm">
//                                       {row.msd_year}
//                                     </td>
//                                     <td className="py-1 px-1 border border-gray-200 text-sm">
//                                       {row.fileno}
//                                     </td>
//                                   </tr>
//                                 ))}
//                               </tbody>
//                             </table>
//                           </div>
//                         </div>

//                         {hasMore && (
//                           <div className="mt-2 text-center">
//                             <button
//                               onClick={loadMoreRows}
//                               className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1 rounded text-sm"
//                               disabled={isLoading}
//                             >
//                               {isLoading ? "Loading..." : "Load More"}
//                             </button>
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Right Column: Shipment Details, Status & Payment, Consignment Information, Purchase Orders */}
//                 <div>
//                   {/* Shipment Details Card */}
//                   <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
//                     <div className="bg-indigo-50 p-4 border-b">
//                       <h2 className="font-semibold text-indigo-700 flex items-center">
//                         <span className="inline-block mr-2">
//                           <svg
//                             xmlns="http://www.w3.org/2000/svg"
//                             className="h-5 w-5"
//                             viewBox="0 0 20 20"
//                             fill="currentColor"
//                           >
//                             <path
//                               fillRule="evenodd"
//                               d="M10 2a1 1 0 00-1 1v1H6a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V6a2 2 0 00-2-2h-3V3a1 1 0 00-1-1zm-1 8a1 1 0 112 0v3a1 1 0 11-2 0v-3z"
//                               clipRule="evenodd"
//                             />
//                           </svg>
//                         </span>
//                         Shipment Details
//                       </h2>
//                     </div>
//                     <div className="p-3">
//                       <div className="grid grid-cols-1 md:grid-cols-6 gap-2 text-sm">
//                         {[
//                           { label: "Date", key: "msd_date" },
//                           { label: "Name", key: "clerkName" },
//                           { label: "Operator", key: "clerk" },
//                           { label: "Transport Type", key: "transport_type" },
//                           { label: "Vessel Name/Flight No", key: "transport_mode" },
//                           { label: "Consignment Details", key: "consignment_details" },
//                         ].map((item, index) => (
//                           <div key={index} className="mb-2">
//                             <label className="block text-gray-600 text-xs mb-1">{item.label}</label>
//                             {item.key === "consignment_details" ? (
//                               <textarea
//                                 className="border border-gray-300 rounded w-full py-1 px-2 text-sm bg-gray-50 resize-none h-[40px]"
//                                 value={details[item.key] || ""}
//                                 readOnly
//                               />
//                             ) : (
//                               <input
//                                 type="text"
//                                 className="border border-gray-300 rounded w-full py-1 px-2 text-sm bg-gray-50"
//                                 value={details[item.key] || ""}
//                                 readOnly
//                               />
//                             )}
//                           </div>
//                         ))}
//                       </div>
//                       <div className="mt-3 grid grid-cols-1 md:grid-cols-6 gap-2 text-sm">
//                         {[
//                           { label: "Vessel/Flight Arrival", key: "vesselflight_arrivaldate" },
//                           { label: "Voucher Details", key: "voucher_no" },
//                           { label: "Invoice Details", key: "customerInvNo" },
//                           { label: "B.L/AWB No", key: "blawb_no" },
//                           { label: "Delivery Location", key: "deliverylocation" },
//                         ].map((item, index) => (
//                           <div key={index} className="mb-2">
//                             <label className="block text-gray-600 text-xs mb-1">{item.label}</label>
//                             <input
//                               type="text"
//                               className="border border-gray-300 rounded w-full py-1 px-2 text-sm bg-gray-50"
//                               value={details[item.key] || ""}
//                               readOnly
//                             />
//                           </div>
//                         ))}
//                       </div>
//                     </div>
//                   </div>

//                   {/* Status & Payment, Consignment Information, and Purchase Orders in the Same Row */}
//                   <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-0">
//                     {/* Status & Payment Card */}
//                     {details.status && (
//                       <div className="bg-white rounded-lg shadow-lg overflow-hidden">
//                         <div className="bg-indigo-50 p-4 border-b">
//                           <h2 className="font-semibold text-indigo-700 flex items-center">
//                             <span className="inline-block mr-2">
//                               <svg
//                                 xmlns="http://www.w3.org/2000/svg"
//                                 className="h-5 w-5"
//                                 viewBox="0 0 20 20"
//                                 fill="currentColor"
//                               >
//                                 <path
//                                   fillRule="evenodd"
//                                   d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
//                                   clipRule="evenodd"
//                                 />
//                               </svg>
//                             </span>
//                             Status & Payment
//                           </h2>
//                         </div>
//                         <div className="p-3">
//                           <div className="grid grid-cols-1 md:grid-cols-1 gap-2 text-sm">
//                             <div className="mb-2">
//                               <label className="block text-gray-600 text-xs mb-1">Status</label>
//                               <input
//                                 type="text"
//                                 className="border border-gray-300 rounded w-2/3 py-1 px-2 text-sm bg-gray-50"
//                                 value={details.status || ""}
//                                 readOnly
//                               />
//                             </div>
//                             <div className="mb-2">
//                               <label className="block text-gray-600 text-xs mb-1">Payee</label>
//                               <div className="flex gap-2">
//                                 <input
//                                   type="text"
//                                   className="border border-gray-300 rounded w-1/3 py-1 px-2 text-sm bg-gray-50"
//                                   value={details.supplier_code || ""}
//                                   readOnly
//                                 />
//                                 <input
//                                   type="text"
//                                   className="border border-gray-300 rounded flex-1 py-1 px-2 text-sm bg-gray-50"
//                                   value={details.v_supplier || ""}
//                                   readOnly
//                                 />
//                               </div>
//                             </div>
//                             <div className="mb-2">
//                               <label className="block text-gray-600 text-xs mb-1">Foreign Invoice</label>
//                               <div className="flex gap-2">
//                                 <input
//                                   type="text"
//                                   className="border border-gray-300 rounded w-2/5 py-1 px-2 text-sm bg-gray-50"
//                                   value={details.customerInvNo || ""}
//                                   readOnly
//                                 />
//                                 <input
//                                   type="text"
//                                   className={`border border-gray-300 rounded w-3/5 py-1 px-2 text-sm ${
//                                     details.invoiceStatus === "Valuation Completed"
//                                       ? "bg-red-100"
//                                       : "bg-blue-100"
//                                   }`}
//                                   value={details.invoiceStatus || ""}
//                                   readOnly
//                                 />
//                               </div>
//                             </div>
//                             <div className="grid grid-cols-2 gap-2">
//                               {details.status === "Web Preparation Completed" ? (
//                                 <div>
//                                   <label className="block text-gray-600 text-xs mb-1">
//                                     Web Preparation Status
//                                   </label>
//                                   <input
//                                     type="text"
//                                     className="border border-gray-300 rounded w-full py-1 px-2 text-sm bg-red-100"
//                                     value="Web Preparation Completed"
//                                     readOnly
//                                   />
//                                 </div>
//                               ) : (
//                                 <div>
//                                   <label className="block text-gray-600 text-xs mb-1">
//                                     Web Preparation Status
//                                   </label>
//                                   <select
//                                     className={`border border-gray-300 rounded w-full py-1 px-2 text-sm ${
//                                       isValuationCompleted ? "bg-gray-200 cursor-not-allowed" : ""
//                                     } ${isWebPerforationComplete ? "bg-green-100" : "bg-red-100"}`}
//                                     value={isWebPerforationComplete ? "Preparation Complete" : "Un Complete"}
//                                     onChange={handleStatusChange}
//                                     disabled={isValuationCompleted || isWebPerforationComplete}
//                                   >
//                                     <option value="Un Complete">In Complete</option>
//                                     <option value="Preparation Complete">Web Preparation Complete</option>
//                                   </select>
//                                 </div>
//                               )}
                              
//                               {/* {details.status === "Web Preparation Completed" && (
//                                 <div>
//                                   <label className="block text-gray-600 text-xs mb-1">
//                                     Foreign Invoice Status
//                                   </label>
//                                   <input
//                                     type="text"
//                                     className="border border-gray-300 rounded w-full py-1 px-2 text-sm bg-red-100"
//                                     value="Web Preparation Completed"
//                                     readOnly
//                                   />
//                                 </div>
//                               )} */}
//                             </div>
//                           </div>
//                         </div>
//                       </div>
//                     )}

//                     {/* Consignment Information Card */}
//                     <div className="bg-white rounded-lg shadow-lg overflow-hidden">
//                       <div className="bg-indigo-50 p-4 border-b">
//                         <h2 className="font-semibold text-indigo-700 flex items-center">
//                           <span className="inline-block mr-2">
//                             <svg
//                               xmlns="http://www.w3.org/2000/svg"
//                               className="h-5 w-5"
//                               viewBox="0 0 20 20"
//                               fill="currentColor"
//                             >
//                               <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z" />
//                             </svg>
//                           </span>
//                           Consignment Information
//                         </h2>
//                       </div>
//                       <div className="p-3">
//                         <div className="grid grid-cols-2 gap-3 mb-4">
//                           <div>
//                             <label className="block text-gray-600 text-xs mb-1">
//                               Consignment Type
//                             </label>
//                             <input
//                               type="text"
//                               className="border border-gray-300 rounded w-full py-1 px-2 text-sm bg-gray-50"
//                               value={details.consignment_type || ""}
//                               readOnly
//                             />
//                           </div>
//                           <div>
//                             <label className="block text-gray-600 text-xs mb-1">
//                               Quantity
//                             </label>
//                             <input
//                               type="text"
//                               className="border border-gray-300 rounded w-24 py-1 px-2 text-sm bg-gray-50"
//                               value={details.quantity || ""}
//                               readOnly
//                             />
//                           </div>
//                         </div>
//                         <div className="grid grid-cols-2 gap-0 mb-4">
//                           <div>
//                             <h3 className="text-gray-600 text-xs font-semibold mb-2">
//                               Container Type
//                             </h3>
//                             <div className="space-y-2">
//                               <div className="flex items-center">
//                                 <span className="w-16 text-sm">20FT</span>
//                                 <input
//                                   type="checkbox"
//                                   checked={container20}
//                                   readOnly
//                                   className="h-4 w-4 text-indigo-600"
//                                 />
//                               </div>
//                               <div className="flex items-center">
//                                 <span className="w-16 text-sm">40FT</span>
//                                 <input
//                                   type="checkbox"
//                                   checked={container40}
//                                   readOnly
//                                   className="h-4 w-4 text-indigo-600"
//                                 />
//                               </div>
//                               <div className="flex items-center">
//                                 <span className="w-16 text-sm">45FT</span>
//                                 <input
//                                   type="checkbox"
//                                   checked={container45}
//                                   readOnly
//                                   className="h-4 w-4 text-indigo-600"
//                                 />
//                               </div>
//                             </div>
//                           </div>
//                           <div>
//                             <h3 className="text-gray-600 text-xs font-semibold mb-2">
//                               Quantity
//                             </h3>
//                             <div className="space-y-1">
//                               <input
//                                 type="number"
//                                 className="border rounded py-0 px-2 w-16 text-sm"
//                                 value={details.container_20_qty || ""}
//                                 readOnly
//                               />
//                               <input
//                                 type="number"
//                                 className="border rounded py-0 px-2 w-16 text-sm block mt-1"
//                                 value={details.container_40_qty || ""}
//                                 readOnly
//                               />
//                               <input
//                                 type="number"
//                                 className="border rounded py-0 px-2 w-16 text-sm block mt-1"
//                                 value={details.container_45_qty || ""}
//                                 readOnly
//                               />
//                             </div>
//                           </div>
//                           <div>
//                             <h3 className="text-gray-600 text-xs font-semibold mb-2">
//                               Company Information
//                             </h3>
//                             <input
//                               type="text"
//                               value={details.foreignSupplierName}
//                               className="border border-gray-300 rounded text-xs py-2 px-1 w-44"
//                               readOnly
//                             />
//                           </div>
                          
//                           <div>
//                             <label className="block text-gray-600 text-xs mb-2 px-">
//                               Valuation Completed Date
//                             </label>
//                             <input
//                               type="text"
//                               value={details.valcompleted_date}
//                               className="border border-gray-300 rounded py-1 px-1 w-24 text-sm bg-gray-50"
//                               readOnly
//                             />
//                           </div>
//                         </div>
//                       </div>
//                     </div>

//                     {/* Purchase Orders Card */}
//                     <div className="bg-white rounded-lg shadow-lg overflow-hidden">
//                       <div className="bg-indigo-50 p-5 border-b">
//                         <h2 className="font-semibold text-indigo-700 flex items-center">
//                           <span className="inline-block mr-2">
//                             <svg
//                               xmlns="http://www.w3.org/2000/svg"
//                               className="h-5 w-5"
//                               viewBox="0 0 20 20"
//                               fill="currentColor"
//                             >
//                               <path
//                                 fillRule="evenodd"
//                                 d="M5 2a2 2 0 00-2 2v14l3.5-2 3.5 2 3.5-2 3.5 2V4a2 2 0 00-2-2H5zm4.707 3.707a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L8.414 9H10a3 3 0 013 3v1a1 1 0 102 0v-1a5 5 0 00-5-5H8.414l1.293-1.293z"
//                                 clipRule="evenodd"
//                               />
//                             </svg>
//                           </span>
//                           Purchase Orders
//                         </h2>
//                       </div>
//                       <div className="p-3">
//                         <div className="border border-gray-300 rounded-lg overflow-hidden">
//                           <div className="bg-gray-50">
//                             <table className="w-full table-fixed border-collapse">
//                               <thead>
//                                 <tr>
//                                   <th className="py-2 px-2 border border-gray-300 text-center text-sm font-medium text-gray-600">
//                                     PO NO/Job NO
//                                   </th>
//                                   <th className="py-1 px-2 border border-gray-300 text-center text-sm font-medium text-gray-600">
//                                     Total Amount
//                                   </th>
//                                 </tr>
//                               </thead>
//                             </table>
//                           </div>
//                           <div className="max-h-[200px] overflow-y-auto">
//                             <table className="w-full table-fixed border-collapse">
//                               <tbody>
//                                 {podetails.map((podetail, index) => (
//                                   <tr key={index}>
//                                     <td className="py-1 px-2 border border-gray-200 text-sm">
//                                       {podetail.po_no}
//                                     </td>
//                                     <td className="py-2 px-2 border border-gray-200 text-sm text-right">
//                                       {formatNumberWithCommas(podetail.totalamount)}
//                                     </td>
//                                   </tr>
//                                 ))}
//                                 {Array.from({
//                                   length: Math.max(0, 7 - podetails.length),
//                                 }).map((_, index) => (
//                                   <tr key={`empty-${index}`} className="bg-white-50">
//                                     <td className="py-1 px-2 border border-gray-200 text-gray-400 text-center text-sm">
//                                       -
//                                     </td>
//                                     <td className="py-1 px-2 border border-gray-200 text-gray-400 text-center text-sm">
//                                       -
//                                     </td>
//                                   </tr>
//                                 ))}
//                               </tbody>
//                             </table>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//             {/* Other Charges Component */}
//             <div className="hidden lg:block">
//               <OtherCharges
//                 otherChargesRows={otherChargesRows}
//                 setOtherChargesRows={setOtherChargesRows}
//                 isEditDisabled={isEditDisabled}
//                 selectedFiles={selectedFiles}
//                 setSelectedFiles={setSelectedFiles}
//                 attachmentDescription={attachmentDescription}
//                 custominvoice={custominvoice}
//                 storedYear={storedYear}
//                 storedVoucherNo={storedVoucherNo}
//                 formatNumberWithCommas={formatNumberWithCommas}
//                 formatDateTime={formatDateTime}
//                 handleSaveOtherCharges={handleSaveOtherCharges}
//               />
//             </div>
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default ShipmentForm;






// import Swal from "sweetalert2";
// import React, { useState, useEffect, useMemo, useCallback } from "react";
// import Header from "./Header";
// import axios from "axios";
// import OtherCharges from "../components/OtherChages";

// const errorSound = new Audio("/error-sound.mp3");
// const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "https://esystems.cdl.lk/backend-test/ewharf";
// const rowsPerPage = 10;

// const ShipmentForm = () => {
//   // Consolidated state
//   const [state, setState] = useState({
//     otherChargesRows: [],
//     container20: false,
//     container40: false,
//     container45: false,
//     details: {},
//     selectedRow: null,
//     selectedRowData: null,
//     sidebardetails: [],
//     podetails: [],
//     searchQuery: "",
//     isLoading: false,
//     page: 1,
//     hasMore: true,
//     selectedFiles: [],
//     attachmentDescription: [],
//     custominvoice: "",
//     isWebPerforationComplete: false
//   });

//   // Destructure state
//   const {
//     otherChargesRows,
//     container20,
//     container40,
//     container45,
//     details,
//     selectedRow,
//     selectedRowData,
//     sidebardetails,
//     podetails,
//     searchQuery,
//     isLoading,
//     page,
//     hasMore,
//     selectedFiles,
//     attachmentDescription,
//     custominvoice,
//     isWebPerforationComplete
//   } = state;

//   const storedVoucherNo = localStorage.getItem("selectedVoucherNo");
//   const storedYear = localStorage.getItem("selectedYear");

//   // Memoized values
//   const filteredData = useMemo(() => 
//     sidebardetails.filter(row => 
//       row.voucher_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       row.fileno.toLowerCase().includes(searchQuery.toLowerCase())
//     ),
//     [sidebardetails, searchQuery]
//   );

//   const isValuationCompleted = details.invoiceStatus === "Valuation Completed";
//   const isWebPrepCompleted = details.status === "Web Preparation Completed";
//   const isEditDisabled = isValuationCompleted || isWebPerforationComplete || isWebPrepCompleted;

//   // Helper functions
//   const playErrorSound = useCallback(() => {
//     errorSound.play().catch(console.error);
//   }, []);

//   const showAlert = useCallback((title, text, icon) => {
//     if (icon === "error") playErrorSound();
//     Swal.fire({ title, text, icon, confirmButtonText: "OK" });
//   }, [playErrorSound]);

//   const formatNumberWithCommas = useCallback((number) => 
//     !number || isNaN(number) ? "" : Number(number).toLocaleString("en-US"),
//     []
//   );

//   const formatDateTime = useCallback((dateString) => {
//     if (!dateString) return "";
//     const date = new Date(dateString);
//     if (isNaN(date)) return dateString;
//     return date.toISOString().split('T')[0]; // YYYY-MM-DD format
//   }, []);

//   // API functions
//   const fetchSidebardetails = useCallback(async (pageNum = 1, append = false) => {
//     setState(prev => ({ ...prev, isLoading: true }));
//     try {
//       const response = await axios.get(
//         `${API_BASE_URL}/ValueList/GetSellleMenuDetails?page=${pageNum}&pageSize=${rowsPerPage}`,
//         { timeout: 10000 }
//       );
//       if (response.data?.ResultSet) {
//         setState(prev => ({
//           ...prev,
//           sidebardetails: append ? [...prev.sidebardetails, ...response.data.ResultSet] : response.data.ResultSet,
//           hasMore: response.data.ResultSet.length === rowsPerPage,
//           isLoading: false
//         }));
//       }
//     } catch (error) {
//       showAlert("Error", "Failed to load sidebar details", "error");
//       setState(prev => ({ ...prev, isLoading: false }));
//     }
//   }, [showAlert]);

//   const handleRowSelect = useCallback(async (index, row) => {
//     setState(prev => ({
//       ...prev,
//       selectedRow: index,
//       selectedRowData: row,
//       isLoading: true
//     }));
    
//     localStorage.setItem("selectedVoucherNo", row.voucher_no);
//     localStorage.setItem("selectedYear", row.msd_year);

//     try {
//       const [detailsRes, poRes, chargesRes, descRes] = await Promise.all([
//         axios.get(`${API_BASE_URL}/ValueList/GetSettlDetails?year=${row.msd_year}&vno=${row.voucher_no}`, { timeout: 10000 }),
//         axios.get(`${API_BASE_URL}/ValueList/GetPODetails?year=${row.msd_year}&vno=${row.voucher_no}`, { timeout: 10000 }),
//         axios.get(`${API_BASE_URL}/ValueList/GetOtheChragesDetails?year=${row.msd_year}&voucherno=${row.voucher_no}`, { timeout: 10000 }),
//         axios.get(`${API_BASE_URL}/ValueList/CalculationDescription`, { timeout: 10000 })
//       ]);

//       // Process details
//       if (detailsRes.data?.ResultSet?.[0]) {
//         const data = detailsRes.data.ResultSet[0];
//         const statusMap = {
//           "": "Pending",
//           "V0": "Not Completed",
//           "V1": "Invoice Registered",
//           "V3": "Valuation Completed"
//         };
        
//         setState(prev => ({
//           ...prev,
//           details: {
//             ...data,
//             invoiceStatus: statusMap[data.invoiceStatus] || data.invoiceStatus
//           },
//           container20: !!data.container_20,
//           container40: !!data.container_40,
//           container45: !!data.container_44 && !!data.container_45,
//           isWebPerforationComplete: data.isWebPerforationComplete || false,
//           custominvoice: data.customerInvNo
//         }));

//         if (data.invoiceStatus === "V3") {
//           showAlert("Valuation Completed", "Valuation is completed, editing disabled", "success");
//         }
//         if (data.status === "Web Preparation Completed") {
//           showAlert("Web Preparation Completed", "Editing is disabled", "warning");
//         }
//       }

//       // Process other data
//       setState(prev => ({
//         ...prev,
//         podetails: poRes.data?.ResultSet || [],
//         otherChargesRows: (chargesRes.data?.ResultSet || []).map(row => ({
//           ...row,
//           attachmentUrl: row.attachmentUrl || "",
//           attachmentName: row.attachmentName || "",
//           invoice_date: row.invoice_date || ""
//         })).reverse(),
//         attachmentDescription: descRes.data?.ResultSet || [],
//         isLoading: false
//       }));

//     } catch (error) {
//       showAlert("Error", "Failed to load shipment details", "error");
//       setState(prev => ({ ...prev, isLoading: false }));
//     }
//   }, [showAlert, API_BASE_URL]);

//   // Event handlers
//   const handleSaveOtherCharges = async () => {
//     if (isEditDisabled) {
//       showAlert("Action Denied", "Editing is disabled", "warning");
//       return;
//     }

//     try {
//       // Validation and saving logic...
//       // (Keep your existing validation and save logic here)
      
//       showAlert("Success", "Data saved successfully", "success");
//     } catch (error) {
//       showAlert("Error", error.response?.data?.message || "Failed to save data", "error");
//     }
//   };

//   const handleWebPerforationComplete = async () => {
//     setState(prev => ({ ...prev, isLoading: true }));
//     try {
//       await axios.post(
//         `${API_BASE_URL}/ValueList/updatepreparationcomplete?year=${storedYear}&vno=${storedVoucherNo}`,
//         {},
//         { timeout: 10000 }
//       );
//       setState(prev => ({
//         ...prev,
//         isWebPerforationComplete: true,
//         details: { ...prev.details, status: "Web Preparation Completed" }
//       }));
//       showAlert("Success", "Web preparation completed", "success");
//     } catch (error) {
//       showAlert("Error", "Failed to complete web preparation", "error");
//     } finally {
//       setState(prev => ({ ...prev, isLoading: false }));
//     }
//   };

//   // Effects
//   useEffect(() => {
//     fetchSidebardetails(1);
//   }, [fetchSidebardetails]);

//   useEffect(() => {
//     if (storedVoucherNo && storedYear) {
//       handleRowSelect(null, { voucher_no: storedVoucherNo, msd_year: storedYear });
//     }
//   }, [storedVoucherNo, storedYear, handleRowSelect]);

//   // Components
//   const StatusPaymentCard = () => (
//     <div className="bg-white rounded-lg shadow-lg overflow-hidden">
//       <div className="bg-indigo-50 p-4 border-b">
//         <h2 className="font-semibold text-indigo-700 flex items-center">
//           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
//             <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
//           </svg>
//           Status & Payment
//         </h2>
//       </div>
//       <div className="p-3">
//         {details?.status ? (
//           <>
//             <div className="mb-2">
//               <label className="block text-gray-600 text-xs mb-1">Status</label>
//               <input
//                 type="text"
//                 className="border border-gray-300 rounded w-full py-1 px-2 text-sm bg-gray-50"
//                 value={details.status}
//                 readOnly
//               />
//             </div>
//             <div className="mb-2">
//               <label className="block text-gray-600 text-xs mb-1">Payee</label>
//               <div className="flex gap-2">
//                 <input
//                   type="text"
//                   className="border border-gray-300 rounded w-1/3 py-1 px-2 text-sm bg-gray-50"
//                   value={details.supplier_code || ""}
//                   readOnly
//                 />
//                 <input
//                   type="text"
//                   className="border border-gray-300 rounded flex-1 py-1 px-2 text-sm bg-gray-50"
//                   value={details.v_supplier || ""}
//                   readOnly
//                 />
//               </div>
//             </div>
//             <div className="mb-2">
//               <label className="block text-gray-600 text-xs mb-1">Foreign Invoice</label>
//               <div className="flex gap-2">
//                 <input
//                   type="text"
//                   className="border border-gray-300 rounded w-2/5 py-1 px-2 text-sm bg-gray-50"
//                   value={details.customerInvNo || ""}
//                   readOnly
//                 />
//                 <input
//                   type="text"
//                   className={`border border-gray-300 rounded w-3/5 py-1 px-2 text-sm ${
//                     details.invoiceStatus === "Valuation Completed" ? "bg-red-100" : "bg-blue-100"
//                   }`}
//                   value={details.invoiceStatus || ""}
//                   readOnly
//                 />
//               </div>
//             </div>
//             <div className="grid grid-cols-2 gap-2">
//               <div>
//                 <label className="block text-gray-600 text-xs mb-1">Web Preparation</label>
//                 <select
//                   className={`border rounded w-full py-1 px-2 text-sm ${
//                     isWebPerforationComplete ? "bg-green-100" : "bg-red-100"
//                   } ${isEditDisabled ? "cursor-not-allowed" : ""}`}
//                   value={isWebPerforationComplete ? "Complete" : "Incomplete"}
//                   onChange={(e) => {
//                     if (e.target.value === "Complete" && !isWebPerforationComplete) {
//                       Swal.fire({
//                         title: "Confirm Completion",
//                         text: "Are you sure you want to mark this as complete?",
//                         icon: "warning",
//                         showCancelButton: true
//                       }).then((result) => {
//                         if (result.isConfirmed) handleWebPerforationComplete();
//                       });
//                     }
//                   }}
//                   disabled={isEditDisabled}
//                 >
//                   <option value="Incomplete">Incomplete</option>
//                   <option value="Complete">Complete</option>
//                 </select>
//               </div>
//             </div>
//           </>
//         ) : (
//           <div className="text-gray-500 italic p-2">Loading status information...</div>
//         )}
//       </div>
//     </div>
//   );

//   return (
//     <div className="flex flex-col min-h-screen bg-gray-100">
//       <Header />
//       {isLoading ? (
//         <div className="flex justify-center items-center h-screen">
//           <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
//         </div>
//       ) : (
//         <>
//           <div className="bg-transparent p-6 border-gray-200">
//             <div className="container mx-auto flex justify-between items-center">
//               <h1 className="text-xl font-semibold text-indigo-700">
//                 {details.clerkName || "Shipment Details"}
//               </h1>
//             </div>
//           </div>

//           {/* Mobile View - Other Charges at the top */}
//           <div className="lg:hidden container mx-auto px-2 py-5 pb-0">
//             <OtherCharges
//               otherChargesRows={otherChargesRows}
//               setOtherChargesRows={(rows) => setState(prev => ({ ...prev, otherChargesRows: rows }))}
//               isEditDisabled={isEditDisabled}
//               selectedFiles={selectedFiles}
//               setSelectedFiles={(files) => setState(prev => ({ ...prev, selectedFiles: files }))}
//               attachmentDescription={attachmentDescription}
//               custominvoice={custominvoice}
//               storedYear={storedYear}
//               storedVoucherNo={storedVoucherNo}
//               formatNumberWithCommas={formatNumberWithCommas}
//               formatDateTime={formatDateTime}
//               handleSaveOtherCharges={handleSaveOtherCharges}
//             />
//           </div>

//           <div className="container mx-auto px-2 py-2">
//             <div className="flex flex-col space-y-6">
//               <div className="order-1 lg:order-0 grid lg:grid-cols-[1fr,5fr] gap-6">
//                 {/* Left Column: Select Row */}
//                 <div className="bg-white rounded-lg shadow-lg overflow-hidden">
//                   <div className="hidden lg:block h-[460px]">
//                     <div className="bg-white rounded-lg overflow-hidden">
//                       <div className="bg-indigo-50 p-4 border-b">
//                         <h2 className="font-semibold text-indigo-700 flex items-center">
//                           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
//                             <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.518 4.674a1 1 0 00.95.69h4.91c.969 0 1.372 1.24.588 1.81l-3.974 2.89a1 1 0 00-.364 1.118l1.518 4.674c.3.921-.755 1.688-1.54 1.118l-3.974-2.89a1 1 0 00-1.176 0l-3.974 2.89c-.785.57-1.84-.197-1.54-1.118l1.518-4.674a1 1 0 00-.364-1.118l-3.974-2.89c-.784-.57-.38-1.81.588-1.81h4.91a1 1 0 00.95-.69l1.518-4.674z" />
//                           </svg>
//                           Select Row
//                         </h2>
//                       </div>
//                       <div className="p-3 space-y-2">
//                         <input
//                           type="text"
//                           placeholder="Search FILE_NO or DATE..."
//                           className="w-full py-1 px-4 rounded-md text-black border-[0.5px] border-black text-sm"
//                           value={searchQuery}
//                           onChange={(e) => setState(prev => ({ ...prev, searchQuery: e.target.value }))}
//                         />
//                         <div className="border border-gray-300 rounded-lg overflow-hidden">
//                           <div className="bg-gray-50">
//                             <table className="w-full table-fixed border-collapse">
//                               <colgroup>
//                                 <col style={{ width: "50px" }} />
//                                 <col style={{ width: "46%" }} />
//                                 <col style={{ width: "50%" }} />
//                               </colgroup>
//                               <thead>
//                                 <tr>
//                                   <th className="py-1 px-2 border border-gray-300 text-center text-xs">✔</th>
//                                   <th className="py-1 px-2 border border-gray-300 text-left text-xs">Year</th>
//                                   <th className="py-1 px-2 border border-gray-300 text-left text-xs">File No</th>
//                                 </tr>
//                               </thead>
//                             </table>
//                           </div>
//                           <div className="max-h-[440px] overflow-y-auto">
//                             <table className="w-full table-fixed border-collapse">
//                               <colgroup>
//                                 <col style={{ width: "50px" }} />
//                                 <col style={{ width: "54%" }} />
//                                 <col style={{ width: "50%" }} />
//                               </colgroup>
//                               <tbody>
//                                 {filteredData.map((row, index) => (
//                                   <tr
//                                     key={index}
//                                     className={`cursor-pointer transition ${
//                                       selectedRow === index ? "bg-blue-500 text-white" : "hover:bg-indigo-50"
//                                     }`}
//                                     onClick={() => handleRowSelect(index, row)}
//                                   >
//                                     <td className="py-1 px-2 border border-gray-200 text-center">
//                                       <input
//                                         type="checkbox"
//                                         checked={selectedRow === index}
//                                         onChange={() => handleRowSelect(index, row)}
//                                         className="h-3 w-3"
//                                       />
//                                     </td>
//                                     <td className="py-1 px-1 border border-gray-200 text-sm">{row.msd_year}</td>
//                                     <td className="py-1 px-1 border border-gray-200 text-sm">{row.fileno}</td>
//                                   </tr>
//                                 ))}
//                               </tbody>
//                             </table>
//                           </div>
//                         </div>
//                         {hasMore && (
//                           <div className="mt-2 text-center">
//                             <button
//                               onClick={() => fetchSidebardetails(page + 1, true)}
//                               className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1 rounded text-sm"
//                               disabled={isLoading}
//                             >
//                               {isLoading ? "Loading..." : "Load More"}
//                             </button>
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Right Column: Details Cards */}
//                 <div>
//                   {/* Shipment Details Card */}
//                   <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
//                     <div className="bg-indigo-50 p-4 border-b">
//                       <h2 className="font-semibold text-indigo-700 flex items-center">
//                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
//                           <path fillRule="evenodd" d="M10 2a1 1 0 00-1 1v1H6a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V6a2 2 0 00-2-2h-3V3a1 1 0 00-1-1zm-1 8a1 1 0 112 0v3a1 1 0 11-2 0v-3z" clipRule="evenodd" />
//                         </svg>
//                         Shipment Details
//                       </h2>
//                     </div>
//                     <div className="p-3">
//                       <div className="grid grid-cols-1 md:grid-cols-6 gap-2 text-sm">
//                         {[
//                           { label: "Date", key: "msd_date" },
//                           { label: "Name", key: "clerkName" },
//                           { label: "Operator", key: "clerk" },
//                           { label: "Transport Type", key: "transport_type" },
//                           { label: "Vessel Name/Flight No", key: "transport_mode" },
//                           { label: "Consignment Details", key: "consignment_details" },
//                         ].map((item, index) => (
//                           <div key={index} className="mb-2">
//                             <label className="block text-gray-600 text-xs mb-1">{item.label}</label>
//                             {item.key === "consignment_details" ? (
//                               <textarea
//                                 className="border border-gray-300 rounded w-full py-1 px-2 text-sm bg-gray-50 resize-none h-[40px]"
//                                 value={details[item.key] || ""}
//                                 readOnly
//                               />
//                             ) : (
//                               <input
//                                 type="text"
//                                 className="border border-gray-300 rounded w-full py-1 px-2 text-sm bg-gray-50"
//                                 value={details[item.key] || ""}
//                                 readOnly
//                               />
//                             )}
//                           </div>
//                         ))}
//                       </div>
//                       <div className="mt-3 grid grid-cols-1 md:grid-cols-6 gap-2 text-sm">
//                         {[
//                           { label: "Vessel/Flight Arrival", key: "vesselflight_arrivaldate" },
//                           { label: "Voucher Details", key: "voucher_no" },
//                           { label: "Invoice Details", key: "customerInvNo" },
//                           { label: "B.L/AWB No", key: "blawb_no" },
//                           { label: "Delivery Location", key: "deliverylocation" },
//                         ].map((item, index) => (
//                           <div key={index} className="mb-2">
//                             <label className="block text-gray-600 text-xs mb-1">{item.label}</label>
//                             <input
//                               type="text"
//                               className="border border-gray-300 rounded w-full py-1 px-2 text-sm bg-gray-50"
//                               value={details[item.key] || ""}
//                               readOnly
//                             />
//                           </div>
//                         ))}
//                       </div>
//                     </div>
//                   </div>

//                   {/* Status & Payment, Consignment Information, and Purchase Orders */}
//                   <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-0">
//                     <StatusPaymentCard />
                    
//                     {/* Consignment Information Card */}
//                     <div className="bg-white rounded-lg shadow-lg overflow-hidden">
//                       <div className="bg-indigo-50 p-4 border-b">
//                         <h2 className="font-semibold text-indigo-700 flex items-center">
//                           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
//                             <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z" />
//                           </svg>
//                           Consignment Information
//                         </h2>
//                       </div>
//                       <div className="p-3">
//                         <div className="grid grid-cols-2 gap-3 mb-4">
//                           <div>
//                             <label className="block text-gray-600 text-xs mb-1">Consignment Type</label>
//                             <input
//                               type="text"
//                               className="border border-gray-300 rounded w-full py-1 px-2 text-sm bg-gray-50"
//                               value={details.consignment_type || ""}
//                               readOnly
//                             />
//                           </div>
//                           <div>
//                             <label className="block text-gray-600 text-xs mb-1">Quantity</label>
//                             <input
//                               type="text"
//                               className="border border-gray-300 rounded w-24 py-1 px-2 text-sm bg-gray-50"
//                               value={details.quantity || ""}
//                               readOnly
//                             />
//                           </div>
//                         </div>
//                         <div className="grid grid-cols-2 gap-0 mb-4">
//                           <div>
//                             <h3 className="text-gray-600 text-xs font-semibold mb-2">Container Type</h3>
//                             <div className="space-y-2">
//                               <div className="flex items-center">
//                                 <span className="w-16 text-sm">20FT</span>
//                                 <input
//                                   type="checkbox"
//                                   checked={container20}
//                                   readOnly
//                                   className="h-4 w-4 text-indigo-600"
//                                 />
//                               </div>
//                               <div className="flex items-center">
//                                 <span className="w-16 text-sm">40FT</span>
//                                 <input
//                                   type="checkbox"
//                                   checked={container40}
//                                   readOnly
//                                   className="h-4 w-4 text-indigo-600"
//                                 />
//                               </div>
//                               <div className="flex items-center">
//                                 <span className="w-16 text-sm">45FT</span>
//                                 <input
//                                   type="checkbox"
//                                   checked={container45}
//                                   readOnly
//                                   className="h-4 w-4 text-indigo-600"
//                                 />
//                               </div>
//                             </div>
//                           </div>
//                           <div>
//                             <h3 className="text-gray-600 text-xs font-semibold mb-2">Quantity</h3>
//                             <div className="space-y-1">
//                               <input
//                                 type="number"
//                                 className="border rounded py-0 px-2 w-16 text-sm"
//                                 value={details.container_20_qty || ""}
//                                 readOnly
//                               />
//                               <input
//                                 type="number"
//                                 className="border rounded py-0 px-2 w-16 text-sm block mt-1"
//                                 value={details.container_40_qty || ""}
//                                 readOnly
//                               />
//                               <input
//                                 type="number"
//                                 className="border rounded py-0 px-2 w-16 text-sm block mt-1"
//                                 value={details.container_45_qty || ""}
//                                 readOnly
//                               />
//                             </div>
//                           </div>
//                           <div>
//                             <h3 className="text-gray-600 text-xs font-semibold mb-2">Company Information</h3>
//                             <input
//                               type="text"
//                               value={details.foreignSupplierName || ""}
//                               className="border border-gray-300 rounded text-xs py-2 px-1 w-44"
//                               readOnly
//                             />
//                           </div>
//                           <div>
//                             <label className="block text-gray-600 text-xs mb-2 px-">Valuation Completed Date</label>
//                             <input
//                               type="text"
//                               value={details.valcompleted_date || ""}
//                               className="border border-gray-300 rounded py-1 px-1 w-24 text-sm bg-gray-50"
//                               readOnly
//                             />
//                           </div>
//                         </div>
//                       </div>
//                     </div>

//                     {/* Purchase Orders Card */}
//                     <div className="bg-white rounded-lg shadow-lg overflow-hidden">
//                       <div className="bg-indigo-50 p-5 border-b">
//                         <h2 className="font-semibold text-indigo-700 flex items-center">
//                           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
//                             <path fillRule="evenodd" d="M5 2a2 2 0 00-2 2v14l3.5-2 3.5 2 3.5-2 3.5 2V4a2 2 0 00-2-2H5zm4.707 3.707a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L8.414 9H10a3 3 0 013 3v1a1 1 0 102 0v-1a5 5 0 00-5-5H8.414l1.293-1.293z" clipRule="evenodd" />
//                           </svg>
//                           Purchase Orders
//                         </h2>
//                       </div>
//                       <div className="p-3">
//                         <div className="border border-gray-300 rounded-lg overflow-hidden">
//                           <div className="bg-gray-50">
//                             <table className="w-full table-fixed border-collapse">
//                               <thead>
//                                 <tr>
//                                   <th className="py-2 px-2 border border-gray-300 text-center text-sm font-medium text-gray-600">PO NO/Job NO</th>
//                                   <th className="py-1 px-2 border border-gray-300 text-center text-sm font-medium text-gray-600">Total Amount</th>
//                                 </tr>
//                               </thead>
//                             </table>
//                           </div>
//                           <div className="max-h-[200px] overflow-y-auto">
//                             <table className="w-full table-fixed border-collapse">
//                               <tbody>
//                                 {podetails.map((podetail, index) => (
//                                   <tr key={index}>
//                                     <td className="py-1 px-2 border border-gray-200 text-sm">{podetail.po_no}</td>
//                                     <td className="py-2 px-2 border border-gray-200 text-sm text-right">{formatNumberWithCommas(podetail.totalamount)}</td>
//                                   </tr>
//                                 ))}
//                                 {Array.from({ length: Math.max(0, 7 - podetails.length) }).map((_, index) => (
//                                   <tr key={`empty-${index}`} className="bg-white-50">
//                                     <td className="py-1 px-2 border border-gray-200 text-gray-400 text-center text-sm">-</td>
//                                     <td className="py-1 px-2 border border-gray-200 text-gray-400 text-center text-sm">-</td>
//                                   </tr>
//                                 ))}
//                               </tbody>
//                             </table>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
            
//             {/* Other Charges Component (Desktop) */}
//             <div className="hidden lg:block">
//               <OtherCharges
//                 otherChargesRows={otherChargesRows}
//                 setOtherChargesRows={(rows) => setState(prev => ({ ...prev, otherChargesRows: rows }))}
//                 isEditDisabled={isEditDisabled}
//                 selectedFiles={selectedFiles}
//                 setSelectedFiles={(files) => setState(prev => ({ ...prev, selectedFiles: files }))}
//                 attachmentDescription={attachmentDescription}
//                 custominvoice={custominvoice}
//                 storedYear={storedYear}
//                 storedVoucherNo={storedVoucherNo}
//                 formatNumberWithCommas={formatNumberWithCommas}
//                 formatDateTime={formatDateTime}
//                 handleSaveOtherCharges={handleSaveOtherCharges}
//               />
//             </div>
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default ShipmentForm;