
//-------------------------------------------------------------10/12/2025-------------------------------------------------------------//
import Swal from "sweetalert2";
import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { FiEdit, FiPlus, FiCamera, FiUpload, FiX, FiCheck, FiTrash2, FiChevronDown, FiVideo } from "react-icons/fi";

const OtherCharges = ({
  otherChargesRows,
  setOtherChargesRows,
  isEditDisabled,
  selectedFiles,
  setSelectedFiles,
  attachmentDescription,
  formatNumberWithCommas,
  formatDateTime,
  handleSaveOtherCharges,
  year,
  voucherno
}) => {
 
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedRowIndex, setSelectedRowIndex] = useState(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [selectedChargeType, setSelectedChargeType] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [existingAttachments, setExistingAttachments] = useState({});
  const [otherInvoicesRows, setOtherInvoicesRows] = useState([]);
  const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState(false);
  const [companySearch, setCompanySearch] = useState("");
  const [thirdPartyCompanySearch, setThirdPartyCompanySearch] = useState("");
  const [otherInvoiceCompanySearch, setOtherInvoiceCompanySearch] = useState("");
  
  // SEPARATE STATE FOR THIRD PARTY DATA
  const [thirdPartyRows, setThirdPartyRows] = useState([]);
  const [companyList, setCompanyList] = useState([]);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(false);

  // Separate file state for third party rows
  const [thirdPartySelectedFiles, setThirdPartySelectedFiles] = useState([]);
  const [otherInvoiceAttachments, setOtherInvoiceAttachments] = useState({});
  const [otherInvoiceSelectedFiles, setOtherInvoiceSelectedFiles] = useState([]);

  // When opening the add-popup for Other Invoices, prefill the company from localStorage.comname
  useEffect(() => {
    try {
      if (isPopupOpen && isAddingNew && selectedChargeType === 'otherInvoices' && selectedRowIndex !== null) {
        const storedCompanyName = localStorage.getItem('comname') || '';
        const storedCompanyId = localStorage.getItem('comid') || '';
        if (storedCompanyName) {
          setOtherInvoiceCompanySearch(storedCompanyName);

          // Also update the newly created row's Subcompany / company value so payload will include the company ID
          setOtherInvoicesRows(prev => {
            const rows = [...prev];
            if (rows[selectedRowIndex]) {
              rows[selectedRowIndex] = {
                ...rows[selectedRowIndex],
                thirdPartyDetails: {
                  ...rows[selectedRowIndex].thirdPartyDetails,
                  company: rows[selectedRowIndex].thirdPartyDetails?.company || storedCompanyId,
                  supplierCode: rows[selectedRowIndex].thirdPartyDetails?.supplierCode || ''
                }
              };
            }
            return rows;
          });
        }
      }
    } catch (e) {
      console.warn('Prefill company failed', e);
    }
  }, [isPopupOpen, isAddingNew, selectedChargeType, selectedRowIndex]);

  // Camera capture state
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [showPhotoPreview, setShowPhotoPreview] = useState(false);

  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const cameraStreamRef = useRef(null);

  const MAX_FILE_SIZE = 5 * 1024 * 1024;
  const errorSound = useMemo(() => new Audio("/error-sound.mp3"), []);

  const [currentThirdPartyRow, setCurrentThirdPartyRow] = useState({
    type: "",
    discount: "",
    percentage: "",
    vatAmount: "",
    amount: "",
    total: "",
    remarks: "",
    imageFile: null
  });

  // Track which tax types are already used for the currently open invoice/third-party row
  const [usedTypesForCurrentRow, setUsedTypesForCurrentRow] = useState([]);

  // Validation states
  const [validationErrors, setValidationErrors] = useState({});
  const [formErrors, setFormErrors] = useState({});

  // Custom format function for amount fields - only thousand separators, no decimals
  const formatAmountWithCommasOnly = (amount) => {
    if (amount === null || amount === undefined || amount === "") {
      return "0";
    }
    
    // Remove any existing commas
    const cleanAmount = amount.toString().replace(/,/g, '');
    
    // Check if it's a valid number
    const num = parseFloat(cleanAmount);
    
    if (isNaN(num)) {
      return "0";
    }
    
    // Format with thousand separators only (no decimals)
    return Math.round(num).toLocaleString("en-US");
  };

  // Parse formatted amount back to number (remove commas)
  const parseFormattedAmount = (formattedAmount) => {
    if (!formattedAmount) return "";
    return formattedAmount.toString().replace(/,/g, '');
  };

  // Update used tax types whenever current row data or selection changes
  useEffect(() => {
    try {
      const types = [];
      if (selectedChargeType === 'thirdParty') {
        const rows = thirdPartyRows[selectedRowIndex]?.thirdPartyDetails?.rows || [];
        rows.forEach(r => { if (r.type) types.push(r.type); });
      } else if (selectedChargeType === 'otherInvoices') {
        const rows = otherInvoicesRows[selectedRowIndex]?.thirdPartyDetails?.rows || [];
        rows.forEach(r => { if (r.type) types.push(r.type); });
      }
      setUsedTypesForCurrentRow(types);
    } catch (e) {
      console.error('Error computing used types', e);
    }
  }, [selectedChargeType, selectedRowIndex, thirdPartyRows, otherInvoicesRows]);

  // Load company list from API
  useEffect(() => {
    const loadCompanies = async () => {
      try {
        setIsLoadingCompanies(true);
        // Use provided API endpoint that returns company list
        const response = await fetch("https://esystems.cdl.lk/backend-test/ewharf/User/Companydetails");

        if (response.ok) {
          const data = await response.json();
          console.log("Loaded companies from Companydetails API:", data);

          // Data shape: { StatusCode: 200, Result: null, ResultSet: [ { Com_ID, Com_Name }, ... ] }
          if (data && data.ResultSet && Array.isArray(data.ResultSet)) {
            // normalize to expected keys if necessary
            const normalized = data.ResultSet.map((c) => ({
              Com_ID: c.Com_ID ?? c.ComId ?? c.id ?? c.idcompany ?? "",
              Com_Name: c.Com_Name ?? c.ComName ?? c.name ?? c.ComName
            }));
            setCompanyList(normalized);
          } else {
            console.warn("Unexpected API response format:", data);
            setCompanyList([]);
          }
        } else {
          console.error("Failed to load companies:", response.status);
          setCompanyList([]);
        }
      } catch (error) {
        console.error("Error loading companies:", error);
        setCompanyList([]);
      } finally {
        setIsLoadingCompanies(false);
      }
    };

    loadCompanies();
  }, [year, voucherno]);

  // MODIFIED: Load third party data (InvType = T)
  useEffect(() => {
    const loadThirdPartyData = async () => {
      try {
        if (!year || !voucherno) {
          console.log("Missing year or voucherno:", year, voucherno);
          return;
        }

        console.log("Loading third party data for:", year, voucherno);
        
        const response = await fetch(
          `https://esystems.cdl.lk/backend-test/ewharf/ValueList/GetPartyDetails?InvType=T&year=${year}&voucherno=${voucherno}`
        );

        if (!response.ok) {
          console.error("Failed to load third party data:", response.status);
          return;
        }

        const data = await response.json();
        console.log("Raw third party API response:", data);

        if (data && data.ResultSet && Array.isArray(data.ResultSet) && data.ResultSet.length > 0) {
          console.log("Processing third party data:", data.ResultSet);
          
          const processedThirdPartyRows = data.ResultSet.map((item, index) => {
            const totalAmount = item.items && Array.isArray(item.items) 
              ? item.items.reduce((sum, chargeItem) => sum + (parseFloat(chargeItem.TXTTAmount) || 0), 0)
              : (parseFloat(item.TotalAmount) || 0);

            const thirdPartyRow = {
              id: `thirdparty-${index}-${Date.now()}`,
              calculation_type: "T",
              amount: totalAmount.toString(),
              invoice_no: item.invno || "",
              invoice_date: item.InvDate
                ? (() => {
                  const [month, day, year] = item.InvDate.split(" ")[0].split("/"); 
                  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
                })()
                : "",
              vehicle_no: "",
              attachmentUrl: item.items?.[0]?.PATH || "",
              attachmentName: `ThirdParty_${item.invno || index}`,
              calTypeDescription: "Third Party Charges",
              isPartyClearance: false,
              isThirdParty: true,
              thirdPartyDetails: {
                type: "Third Party",
                company: item.CompanyCode || "",
                rows: item.items && Array.isArray(item.items) ? item.items.map((chargeItem, chargeIndex) => ({
                  id: `charge-${index}-${chargeIndex}`,
                  type: chargeItem.TAXType || "",
                  amount: chargeItem.TXTAmount || "0",
                  total: chargeItem.TXTTAmount || "0",
                  remarks: chargeItem.Remarks || "",
                  path: chargeItem.PATH || "",
                  itemId: chargeItem.ItemId || chargeItem.id || `item-${index}-${chargeIndex}`
                })) : [],
                total: totalAmount
              },
              serialNo: index + 1000,
              apiData: item,
              InvType: "T"
            };

            console.log(`Created third party row ${index}:`, thirdPartyRow);
            return thirdPartyRow;
          });

          console.log("All processed third party rows:", processedThirdPartyRows);
          setThirdPartyRows(processedThirdPartyRows);
        } else {
          console.log("No third party data found or empty ResultSet");
          setThirdPartyRows([]);
        }
      } catch (error) {
        console.error("Error loading third party data:", error);
        setThirdPartyRows([]);
      }
    };

    loadThirdPartyData();
  }, [year, voucherno]);

  // Load other invoices data (InvType = O)
  useEffect(() => {
    const loadOtherInvoicesData = async () => {
      try {
        if (!year || !voucherno) {
          console.log("Missing year or voucherno for other invoices:", year, voucherno);
          return;
        }

        console.log("Loading other invoices data for:", year, voucherno);
        
        const response = await fetch(
          `https://esystems.cdl.lk/backend-test/ewharf/ValueList/GetPartyDetails?InvType=O&year=${year}&voucherno=${voucherno}`
        );

        if (!response.ok) {
          console.error("Failed to load other invoices data:", response.status);
          return;
        }

        const data = await response.json();
        console.log("Raw other invoices API response:", data);

        if (data && data.ResultSet && Array.isArray(data.ResultSet) && data.ResultSet.length > 0) {
          console.log("Processing other invoices data:", data.ResultSet);
          
          const processedOtherInvoiceRows = data.ResultSet.map((item, index) => {
            const totalAmount = item.items && Array.isArray(item.items) 
              ? item.items.reduce((sum, chargeItem) => sum + (parseFloat(chargeItem.TXTTAmount) || 0), 0)
              : (parseFloat(item.TotalAmount) || 0);

            const otherInvoiceRow = {
              id: `otherinvoice-${index}-${Date.now()}`,
              calculation_type: "O",
              amount: totalAmount.toString(),
              invoice_no: item.invno || "",
              invoice_date: item.InvDate
                ? (() => {
                  const [month, day, year] = item.InvDate.split(" ")[0].split("/"); 
                  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
                })()
                : "",
              vehicle_no: "",
              attachmentUrl: item.items?.[0]?.PATH || "",
              attachmentName: `OtherInvoice_${item.invno || index}`,
              calTypeDescription: "Other Invoice",
              isPartyClearance: false,
              isThirdParty: false,
              isOtherInvoice: true,
              thirdPartyDetails: {
                type: "Other Invoice",
                company: item.CompanyCode || "",
                rows: item.items && Array.isArray(item.items) ? item.items.map((chargeItem, chargeIndex) => ({
                  id: `charge-${index}-${chargeIndex}`,
                  type: chargeItem.TAXType || "",
                  amount: chargeItem.TXTAmount || "0",
                  total: chargeItem.TXTTAmount || "0",
                  remarks: chargeItem.Remarks || "",
                  path: chargeItem.PATH || "",
                  itemId: chargeItem.ItemId || chargeItem.id || `item-${index}-${chargeIndex}`
                })) : [],
                total: totalAmount
              },
              serialNo: index + 2000,
              apiData: item,
              InvType: "O"
            };

            console.log(`Created other invoice row ${index}:`, otherInvoiceRow);
            return otherInvoiceRow;
          });

          console.log("All processed other invoice rows:", processedOtherInvoiceRows);
          setOtherInvoicesRows(processedOtherInvoiceRows);
        } else {
          console.log("No other invoices data found or empty ResultSet");
          setOtherInvoicesRows([]);
        }
      } catch (error) {
        console.error("Error loading other invoices data:", error);
        setOtherInvoicesRows([]);
      }
    };

    loadOtherInvoicesData();
  }, [year, voucherno]);

  // Load party clearance charges
  useEffect(() => {
    const loadExistingCharges = async () => {
      try {
        if (!year || !voucherno) return;

        console.log("Loading party clearance charges for:", year, voucherno);
        
        const response = await fetch(
          `https://esystems.cdl.lk/backend-test/ewharf/ValueList/GetOtheChragesDetails?year=${year}&voucherno=${voucherno}`
        );

        if (response.ok) {
          const data = await response.json();
          console.log("Raw party clearance API response:", data);

          if (data && data.ResultSet && Array.isArray(data.ResultSet) && data.ResultSet.length > 0) {
            const processedRows = data.ResultSet.map((item, index) => ({
              id: item.id || `partyclearance-${Date.now()}-${index}`,
              calculation_type: item.calculation_type || "",
              amount: item.amount || "",
              invoice_no: item.invoice_no || "",
              invoice_date: item.invoice_date || "",
              vehicle_no: item.vehicle_no || "",
              attachmentUrl: item.image_path || "",
              attachmentName: item.attachment_name || `Attachment_${index + 1}`,
              calTypeDescription: item.calTypeDescription || getTypeDescription(item.calculation_type),
              isPartyClearance: true,
              isThirdParty: false,
              isOtherInvoice: false,
              thirdPartyDetails: null,
              serialNo: item.Sno_path || item.serial_no || index + 1,
              Sno_path: item.Sno_path || item.serial_no || index + 1
            }));

            console.log("Processed party clearance rows:", processedRows);
            setOtherChargesRows(processedRows);

            // Load attachments for each row
            processedRows.forEach((row, index) => {
              const serialNo = row.serialNo || row.Sno_path;
              if (serialNo) {
                loadAttachmentFromAPI(serialNo, index, 'charges');
              }
            });
          } else {
            console.log("No party clearance data found");
            setOtherChargesRows([]);
          }
        } else {
          console.error("Failed to load party clearance data:", response.status);
        }
      } catch (error) {
        console.error("Error loading existing charges:", error);
      }
    };

    loadExistingCharges();
  }, [year, voucherno, setOtherChargesRows]);

  // Helper function to calculate total from items array
  const calculateTotalFromItems = useCallback((items) => {
    if (!items || !Array.isArray(items)) return 0;
    return items.reduce((sum, item) => {
      return sum + (parseFloat(item.TXTTAmount) || 0);
    }, 0);
  }, []);

  // Calculate totals for third party charges
  const calculateThirdPartyTotal = useCallback((rows) => {
    return rows?.reduce((sum, row) => sum + (parseFloat(row.total) || 0), 0) || 0;
  }, []);

  // Calculate total for party clearance charges
  const calculatePartyClearanceTotal = useCallback((rows) => {
    return rows?.reduce((sum, row) => sum + (parseFloat(row.amount) || 0), 0) || 0;
  }, []);

  // Calculate total for other invoices
  const calculateOtherInvoicesTotal = useCallback((rows) => {
    return rows?.reduce((sum, row) => {
      const rowTotal = row.thirdPartyDetails?.total || 
                      (row.thirdPartyDetails?.rows ? 
                       calculateThirdPartyTotal(row.thirdPartyDetails.rows) : 
                       (parseFloat(row.amount) || 0));
      return sum + rowTotal;
    }, 0);
  }, [calculateThirdPartyTotal]);

  // Load attachment from API using serial number
  const loadAttachmentFromAPI = useCallback(async (serialNo, rowIndex, type = 'charges') => {
    try {
      if (!serialNo || !year || !voucherno) return;

      const response = await fetch(
        `https://esystems.cdl.lk/backend-test/ewharf/ValueList/FilePreview?year=${year}&voucher_no=${voucherno}&serial_no=${serialNo}`
      );

      if (response.ok) {
        const blob = await response.blob();

        if (blob.type.startsWith('image/')) {
          const previewUrl = URL.createObjectURL(blob);

          if (type === 'charges') {
            setExistingAttachments(prev => ({
              ...prev,
              [rowIndex]: {
                preview: previewUrl,
                name: `Attachment_${serialNo}`,
                size: blob.size,
                isExisting: true,
                serialNo: serialNo
              }
            }));
          } else if (type === 'invoices') {
            setOtherInvoiceAttachments(prev => ({
              ...prev,
              [rowIndex]: {
                preview: previewUrl,
                name: `Invoice_Attachment_${serialNo}`,
                size: blob.size,
                isExisting: true,
                serialNo: serialNo
              }
            }));
          }
        } else {
          console.warn('Response is not an image:', blob.type);
        }
      }
    } catch (error) {
      console.error("Error loading attachment from API:", error);
    }
  }, [year, voucherno]);

  // Helper functions
  const playErrorSound = useCallback(() => {
    errorSound.play().catch((error) => {
      console.error("Error playing sound:", error);
    });
  }, [errorSound]);

  const getTaxTypeDescription = useCallback((type) => {
    const typeMap = {
      'V': 'VAT',
      'v': 'VAT',
      'S': 'SVT',
      'C': 'SSCL',
      'T': 'Third Party',
      'O': 'Other'
    };
    return typeMap[type] || type;
  }, []);

  const showErrorToast = useCallback((title, text) => {
    playErrorSound();
    Swal.fire({
      title,
      text,
      icon: "error",
      confirmButtonText: "OK",
    });
  }, [playErrorSound]);

  const showSuccessToast = useCallback((title, text) => {
    Swal.fire({
      title,
      text,
      icon: "success",
      timer: 2000,
      showConfirmButton: false,
    });
  }, []);

  const showValuationCompletedMessage = useCallback(() => {
    Swal.fire({
      title: "Action Denied",
      text: "The Valuation or Preparation is Completed! You can't edit anything, only can read.",
      icon: "warning",
      confirmButtonText: "OK",
    });
  }, []);

  // UPDATED: API call to insert party clearance charge with file upload using FormData
  const insertPartyClearanceCharge = useCallback(async (chargeData, imageFile) => {
    try {
      const formData = new FormData();

      // Add all charge data as form fields
      Object.keys(chargeData).forEach(key => {
        formData.append(key, chargeData[key]);
      });

      // Add image file if exists with key 'ImageFile'
      if (imageFile) {
        formData.append('ImageFile', imageFile);
      }

      const response = await fetch("https://esystems.cdl.lk/backend-test/ewharf/ValueList/SetSettlementChrages", {
        method: "POST",
        body: formData,
      });

      const text = await response.text();
      if (!response.ok) {
        throw new Error(text || `HTTP error! status: ${response.status}`);
      }

      console.log("Party Clearance API Response:", text);
      return text;
    } catch (error) {
      console.error("Error inserting party clearance charge:", error);
      throw error;
    }
  }, []);

  const insertThirdPartyCharge = useCallback(async (chargeData, mainImageFile) => {
    try {
      const formData = new FormData();

      // Add all basic charge data as form fields
      Object.keys(chargeData).forEach(key => {
        if (key === 'items' && Array.isArray(chargeData[key])) {
          // Handle items array separately - including files
          chargeData[key].forEach((item, index) => {
            Object.keys(item).forEach(itemKey => {
              if (itemKey === 'ImageFile' && item[itemKey] instanceof File) {
                // Add image file with proper field name
                formData.append(`items[${index}].ImageFile`, item[itemKey]);
              } else if (itemKey === 'ImageFile' && item[itemKey]?.file instanceof File) {
                // If it's an object with file property
                formData.append(`items[${index}].ImageFile`, item[itemKey].file);
              } else {
                formData.append(`items[${index}].${itemKey}`, item[itemKey] || '');
              }
            });
          });
        } else if (key !== 'ImageFile') {
          // Skip ImageFile at top level for now
          formData.append(key, chargeData[key] || '');
        }
      });

      // Add main image file if exists
      if (mainImageFile) {
        if (mainImageFile instanceof File) {
          formData.append('ImageFile', mainImageFile);
        } else if (mainImageFile.file instanceof File) {
          formData.append('ImageFile', mainImageFile.file);
        }
      }

      console.log("Sending Third Party FormData:");

      const response = await fetch("https://esystems.cdl.lk/backend-test/ewharf/ValueList/AddPartyDetails", {
        method: "POST",
        body: formData,
      });

      const text = await response.text();
      if (!response.ok) {
        throw new Error(text || `HTTP error! status: ${response.status}`);
      }

      console.log("Third Party API Response:", text);
      return text;
    } catch (error) {
      console.error("Error inserting third party charge:", error);
      throw error;
    }
  }, []);

  // API call to update third party charge
  const updateThirdPartyCharge = useCallback(async (chargeData, mainImageFile) => {
    try {
      const formData = new FormData();

      // Add all basic charge data as form fields
      Object.keys(chargeData).forEach(key => {
        if (key === 'items' && Array.isArray(chargeData[key])) {
          // Handle items array separately - including files
          chargeData[key].forEach((item, index) => {
            Object.keys(item).forEach(itemKey => {
              if (itemKey === 'ImageFile' && item[itemKey] instanceof File) {
                // Add image file with proper field name
                formData.append(`items[${index}].ImageFile`, item[itemKey]);
              } else if (itemKey === 'ImageFile' && item[itemKey]?.file instanceof File) {
                // If it's an object with file property
                formData.append(`items[${index}].ImageFile`, item[itemKey].file);
              } else {
                formData.append(`items[${index}].${itemKey}`, item[itemKey] || '');
              }
            });
          });
        } else if (key !== 'ImageFile') {
          // Skip ImageFile at top level for now
          formData.append(key, chargeData[key] || '');
        }
      });

      // Add main image file if exists
      if (mainImageFile) {
        if (mainImageFile instanceof File) {
          formData.append('ImageFile', mainImageFile);
        } else if (mainImageFile.file instanceof File) {
          formData.append('ImageFile', mainImageFile.file);
        }
      }

      console.log("Updating Third Party FormData:");

      const response = await fetch("https://esystems.cdl.lk/backend-test/ewharf/ValueList/UpdatePartyDetails", {
        method: "PUT",
        body: formData,
      });

      const text = await response.text();
      if (!response.ok) {
        throw new Error(text || `HTTP error! status: ${response.status}`);
      }

      console.log("Third Party Update API Response:", text);
      return text;
    } catch (error) {
      console.error("Error updating third party charge:", error);
      throw error;
    }
  }, []);

  // API call to insert other invoice
  const insertOtherInvoice = useCallback(async (invoiceData, mainImageFile) => {
    try {
      const formData = new FormData();

      // Add all basic invoice data as form fields
      Object.keys(invoiceData).forEach(key => {
        if (key === 'items' && Array.isArray(invoiceData[key])) {
          // Handle items array separately - including files
          invoiceData[key].forEach((item, index) => {
            Object.keys(item).forEach(itemKey => {
              if (itemKey === 'ImageFile' && item[itemKey] instanceof File) {
                // Add image file with proper field name
                formData.append(`items[${index}].ImageFile`, item[itemKey]);
              } else if (itemKey === 'ImageFile' && item[itemKey]?.file instanceof File) {
                // If it's an object with file property
                formData.append(`items[${index}].ImageFile`, item[itemKey].file);
              } else {
                formData.append(`items[${index}].${itemKey}`, item[itemKey] || '');
              }
            });
          });
        } else if (key !== 'ImageFile') {
          // Skip ImageFile at top level for now
          formData.append(key, invoiceData[key] || '');
        }
      });

      // Add main image file if exists
      if (mainImageFile) {
        if (mainImageFile instanceof File) {
          formData.append('ImageFile', mainImageFile);
        } else if (mainImageFile.file instanceof File) {
          formData.append('ImageFile', mainImageFile.file);
        }
      }

      console.log("Sending Other Invoice FormData:");

      const response = await fetch("https://esystems.cdl.lk/backend-test/ewharf/ValueList/AddPartyDetails", {
        method: "POST",
        body: formData,
      });

      const text = await response.text();
      if (!response.ok) {
        throw new Error(text || `HTTP error! status: ${response.status}`);
      }

      console.log("Other Invoice API Response:", text);
      return text;
    } catch (error) {
      console.error("Error inserting other invoice:", error);
      throw error;
    }
  }, []);

  // API call to update other invoice
  const updateOtherInvoice = useCallback(async (invoiceData, mainImageFile) => {
    try {
      const formData = new FormData();

      // Add all basic invoice data as form fields
      Object.keys(invoiceData).forEach(key => {
        if (key === 'items' && Array.isArray(invoiceData[key])) {
          // Handle items array separately - including files
          invoiceData[key].forEach((item, index) => {
            Object.keys(item).forEach(itemKey => {
              if (itemKey === 'ImageFile' && item[itemKey] instanceof File) {
                // Add image file with proper field name
                formData.append(`items[${index}].ImageFile`, item[itemKey]);
              } else if (itemKey === 'ImageFile' && item[itemKey]?.file instanceof File) {
                // If it's an object with file property
                formData.append(`items[${index}].ImageFile`, item[itemKey].file);
              } else {
                formData.append(`items[${index}].${itemKey}`, item[itemKey] || '');
              }
            });
          });
        } else if (key !== 'ImageFile') {
          // Skip ImageFile at top level for now
          formData.append(key, invoiceData[key] || '');
        }
      });

      // Add main image file if exists
      if (mainImageFile) {
        if (mainImageFile instanceof File) {
          formData.append('ImageFile', mainImageFile);
        } else if (mainImageFile.file instanceof File) {
          formData.append('ImageFile', mainImageFile.file);
        }
      }

      console.log("Updating Other Invoice FormData:");

      const response = await fetch("https://esystems.cdl.lk/backend-test/ewharf/ValueList/UpdatePartyDetails", {
        method: "PUT",
        body: formData,
      });

      const text = await response.text();
      if (!response.ok) {
        throw new Error(text || `HTTP error! status: ${response.status}`);
      }

      console.log("Other Invoice Update API Response:", text);
      return text;
    } catch (error) {
      console.error("Error updating other invoice:", error);
      throw error;
    }
  }, []);

  const prepareSettlementDetails = useCallback((row) => {
    const baseParams = {
      cusinvo_no: "I/CSA/7859/2021/A",
      year: year || "2021",
      voucherno: voucherno || "4662",
      ctype: row.calculation_type || "",
      amount: parseFloat(row.amount) || 0,
      est_amount: parseFloat(row.amount) || 0,
      invno: row.invoice_no || "",
      invdate: row.invoice_date || new Date().toISOString().split('T')[0],
      vehno: row.vehicle_no || "",
      insurno: "1111",
      cucurencycode: "LKR",
      rate: "1.00"
    };

    return baseParams;
  }, [year, voucherno]);

  const handlePreviewChargeImage = useCallback((imageFile) => {
    if (!imageFile) return;

    let imageUrl = "";

    if (imageFile.preview) {
      imageUrl = imageFile.preview;
    } else if (imageFile instanceof File) {
      imageUrl = URL.createObjectURL(imageFile);
    }

    if (imageUrl) {
      Swal.fire({
        imageUrl,
        imageAlt: "Charge Attachment",
        showConfirmButton: false,
        showCloseButton: true,
        customClass: { popup: "max-w-3xl" },
      });
    } else {
      Swal.fire("Error", "Unable to load the image.", "error");
    }
  }, []);

  // Prepare third party details for API (INSERT)
  const prepareThirdPartyDetails = useCallback((row) => {
    const companyCodeFromStorage = localStorage.getItem('comid') || '';
    const baseParams = {
      year: year || "2021",
      fileno: row.fileno || row.apiData?.fileno || row.thirdPartyDetails?.fileno || "2021-1397",
      voucherno: voucherno || "4662",
      invno: row.invoice_no || "2822",
      invdatetxt: row.invoice_date || "2024-11-15",
      CompanyCode: companyCodeFromStorage || row.thirdPartyDetails?.company || "D0119",
      SubcompanyCode: row.thirdPartyDetails?.company || "",
      SuplierCode: row.thirdPartyDetails?.supplierCode || "M1682",
      InvType: "T",
      InvDate: row.invoice_date || "2024-11-15"
    };

    // Add third party charges as items array
    if (row.thirdPartyDetails?.rows && row.thirdPartyDetails.rows.length > 0) {
      baseParams.items = row.thirdPartyDetails.rows.map((charge, index) => ({
        TAXType: charge.type,
        TxTAmount: parseFormattedAmount(charge.amount) || charge.amount || 0,
        TxTTAmount: parseFormattedAmount(charge.total) || charge.total || 0,
        ImageFile: charge.imageFile ? charge.imageFile.file || charge.imageFile : null,
        Remarks: charge.remarks || ""
      }));
    }

    return baseParams;
  }, [year, voucherno]);

  // Prepare third party details for UPDATE API
  const prepareThirdPartyUpdateDetails = useCallback((row) => {
    const companyCodeFromStorage = localStorage.getItem('comid') || '';
    const baseParams = {
      year: year || "2021",
      fileno: row.fileno || row.apiData?.fileno || row.thirdPartyDetails?.fileno || "2021-1397",
      voucherno: voucherno || "4662",
      invno: row.invoice_no || row.apiData?.invno || "",
      CompanyCode: companyCodeFromStorage || row.thirdPartyDetails?.company || row.apiData?.CompanyCode || "",
      SubcompanyCode: row.thirdPartyDetails?.company || row.apiData?.SubcompanyCode || "",
      InvType: "T"
    };

    // Add third party charges as items array
    if (row.thirdPartyDetails?.rows && row.thirdPartyDetails.rows.length > 0) {
      baseParams.items = row.thirdPartyDetails.rows.map((charge, index) => ({
        TAXType: charge.type,
        TxTAmount: parseFormattedAmount(charge.amount) || charge.amount || 0,
        TxTTAmount: parseFormattedAmount(charge.total) || charge.total || 0,
        ImageFile: charge.imageFile ? charge.imageFile.file || charge.imageFile : null,
        Remarks: charge.remarks || "",
        ItemId: charge.itemId || ""
      }));
    }

    return baseParams;
  }, [year, voucherno]);

  // Prepare other invoice details for API (INSERT)
  const prepareOtherInvoiceDetails = useCallback((row) => {
    const companyCodeFromStorage = localStorage.getItem('comid') || '';
    const baseParams = {
      year: year || "2021",
      fileno: row.fileno || row.apiData?.fileno || row.thirdPartyDetails?.fileno || "2021-1397",
      voucherno: voucherno || "4662",
      invno: row.invoice_no || "",
      invdatetxt: row.invoice_date || new Date().toISOString().split('T')[0],
      CompanyCode: companyCodeFromStorage || row.thirdPartyDetails?.company || "",
      SubcompanyCode: row.thirdPartyDetails?.company || "",
      SuplierCode: row.thirdPartyDetails?.supplierCode || "M1682",
      InvType: "F",
      InvDate: row.invoice_date || new Date().toISOString().split('T')[0]
    };

    // Add invoice items as items array
    if (row.thirdPartyDetails?.rows && row.thirdPartyDetails.rows.length > 0) {
      baseParams.items = row.thirdPartyDetails.rows.map((charge, index) => ({
        TAXType: charge.type,
        TxTAmount: parseFormattedAmount(charge.amount) || charge.amount || 0,
        TxTTAmount: parseFormattedAmount(charge.total) || charge.total || 0,
        ImageFile: charge.imageFile ? charge.imageFile.file || charge.imageFile : null,
        Remarks: charge.remarks || ""
      }));
    }

    return baseParams;
  }, [year, voucherno]);

  // Prepare other invoice details for UPDATE API
  const prepareOtherInvoiceUpdateDetails = useCallback((row) => {
    const companyCodeFromStorage = localStorage.getItem('comid') || '';
    const baseParams = {
      year: year || "2021",
      fileno: row.fileno || row.apiData?.fileno || row.thirdPartyDetails?.fileno || "2021-1397",
      voucherno: voucherno || "4662",
      invno: row.invoice_no || row.apiData?.invno || "",
      CompanyCode: companyCodeFromStorage || row.thirdPartyDetails?.company || row.apiData?.CompanyCode || "",
      SubcompanyCode: row.thirdPartyDetails?.company || row.apiData?.SubcompanyCode || "",
      InvType: "F"
    };

    // Add invoice items as items array
    if (row.thirdPartyDetails?.rows && row.thirdPartyDetails.rows.length > 0) {
      baseParams.items = row.thirdPartyDetails.rows.map((charge, index) => ({
        TAXType: charge.type,
        TxTAmount: parseFormattedAmount(charge.amount) || charge.amount || 0,
        TxTTAmount: parseFormattedAmount(charge.total) || charge.total || 0,
        ImageFile: charge.imageFile ? charge.imageFile.file || charge.imageFile : null,
        Remarks: charge.remarks || "",
        ItemId: charge.itemId || ""
      }));
    }

    return baseParams;
  }, [year, voucherno]);

  // Helper function to refresh charges data after save
  const refreshChargesData = useCallback(async () => {
    if (!year || !voucherno) return;

    try {
      // Refresh party clearance data
      const response = await fetch(
        `https://esystems.cdl.lk/backend-test/ewharf/ValueList/GetOtheChragesDetails?year=${year}&voucherno=${voucherno}`
      );

      if (response.ok) {
        const data = await response.json();
        if (data && data.ResultSet && data.ResultSet.length > 0) {
          const processedRows = data.ResultSet.map((item, index) => ({
            id: item.id || Date.now() + index,
            calculation_type: item.calculation_type || "",
            amount: item.amount || "",
            invoice_no: item.invoice_no || "",
            invoice_date: item.invoice_date || "",
            vehicle_no: item.vehicle_no || "",
            attachmentUrl: item.image_path || "",
            attachmentName: item.attachment_name || "",
            calTypeDescription: item.cal_type_description || "",
            isPartyClearance: true,
            isThirdParty: false,
            thirdPartyDetails: null,
            serialNo: item.Sno_path || item.serial_no || index + 1,
            Sno_path: item.Sno_path || item.serial_no || index + 1
          }));
          setOtherChargesRows(processedRows);

          // Reload attachments
          processedRows.forEach((row, index) => {
            const serialNo = row.serialNo || row.Sno_path;
            if (serialNo) {
              loadAttachmentFromAPI(serialNo, index, 'charges');
            }
          });
        }
      }
      
      // Refresh third party data
      const thirdPartyResponse = await fetch(
        `https://esystems.cdl.lk/backend-test/ewharf/ValueList/GetPartyDetails?InvType=T&year=${year}&voucherno=${voucherno}`
      );
      
      if (thirdPartyResponse.ok) {
        const thirdPartyData = await thirdPartyResponse.json();
        if (thirdPartyData && thirdPartyData.ResultSet && thirdPartyData.ResultSet.length > 0) {
          const processedThirdPartyRows = thirdPartyData.ResultSet.map((item, index) => {
            const totalAmount = item.items && Array.isArray(item.items) 
              ? item.items.reduce((sum, chargeItem) => sum + (parseFloat(chargeItem.TXTTAmount) || 0), 0)
              : (parseFloat(item.TotalAmount) || 0);

            return {
              id: `thirdparty-${index}-${Date.now()}`,
              calculation_type: "T",
              amount: totalAmount.toString(),
              invoice_no: item.invno || "",
              invoice_date: item.InvDate ? new Date(item.InvDate).toISOString().split('T')[0] : "",
              vehicle_no: "",
              attachmentUrl: item.items?.[0]?.PATH || "",
              attachmentName: `ThirdParty_${item.invno || index}`,
              calTypeDescription: "Third Party Charges",
              isPartyClearance: false,
              isThirdParty: true,
              thirdPartyDetails: {
                type: "Third Party",
                company: item.CompanyCode || "",
                rows: item.items && Array.isArray(item.items) ? item.items.map((chargeItem, chargeIndex) => ({
                  id: `charge-${index}-${chargeIndex}`,
                  type: chargeItem.TAXType || "",
                  amount: chargeItem.TXTAmount || "0",
                  total: chargeItem.TXTTAmount || "0",
                  remarks: chargeItem.Remarks || "",
                  path: chargeItem.PATH || "",
                  itemId: chargeItem.ItemId || chargeItem.id || `item-${index}-${chargeIndex}`
                })) : [],
                total: totalAmount
              },
              serialNo: index + 1000,
              apiData: item,
              InvType: "T"
            };
          });
          setThirdPartyRows(processedThirdPartyRows);
        }
      }
      
      // Refresh other invoices data
      const otherInvoicesResponse = await fetch(
        `https://esystems.cdl.lk/backend-test/ewharf/ValueList/GetPartyDetails?InvType=O&year=${year}&voucherno=${voucherno}`
      );
      
      if (otherInvoicesResponse.ok) {
        const otherInvoicesData = await otherInvoicesResponse.json();
        if (otherInvoicesData && otherInvoicesData.ResultSet && otherInvoicesData.ResultSet.length > 0) {
          const processedOtherInvoiceRows = otherInvoicesData.ResultSet.map((item, index) => {
            const totalAmount = item.items && Array.isArray(item.items) 
              ? item.items.reduce((sum, chargeItem) => sum + (parseFloat(chargeItem.TXTTAmount) || 0), 0)
              : (parseFloat(item.TotalAmount) || 0);

            return {
              id: `otherinvoice-${index}-${Date.now()}`,
              calculation_type: "O",
              amount: totalAmount.toString(),
              invoice_no: item.invno || "",
              invoice_date: item.invdatetxt,
              vehicle_no: "",
              attachmentUrl: item.items?.[0]?.PATH || "",
              attachmentName: `OtherInvoice_${item.invno || index}`,
              calTypeDescription: "Other Invoice",
              isPartyClearance: false,
              isThirdParty: false,
              isOtherInvoice: true,
              thirdPartyDetails: {
                type: "Other Invoice",
                company: item.CompanyCode || "",
                rows: item.items && Array.isArray(item.items) ? item.items.map((chargeItem, chargeIndex) => ({
                  id: `charge-${index}-${chargeIndex}`,
                  type: chargeItem.TAXType || "",
                  amount: chargeItem.TXTAmount || "0",
                  total: chargeItem.TXTTAmount || "0",
                  remarks: chargeItem.Remarks || "",
                  path: chargeItem.PATH || "",
                  itemId: chargeItem.ItemId || chargeItem.id || `item-${index}-${chargeIndex}`
                })) : [],
                total: totalAmount
              },
              serialNo: index + 2000,
              apiData: item,
              InvType: "O"
            };
          });
          setOtherInvoicesRows(processedOtherInvoiceRows);
        }
      }
    } catch (error) {
      console.error("Error refreshing charges data:", error);
    }
  }, [year, voucherno, setOtherChargesRows, loadAttachmentFromAPI]);

  // Create new empty row based on type
  const createNewRow = useCallback((type) => {
    if (type === 'otherInvoices') {
      return {
        id: Date.now(),
        calculation_type: "O",
        amount: "",
        invoice_no: "",
        invoice_date: "",
        vehicle_no: "",
        attachmentUrl: "",
        attachmentName: "",
        calTypeDescription: "Other Invoice",
        isOtherInvoice: true,
        isThirdParty: false,
        thirdPartyDetails: {
          type: "Other Invoice",
          company: "",
          rows: []
        }
      };
    }

    if (type === 'thirdParty') {
      return {
        id: Date.now(),
        calculation_type: "T",
        amount: "",
        invoice_no: "",
        invoice_date: "",
        vehicle_no: "",
        attachmentUrl: "",
        attachmentName: "",
        calTypeDescription: "Third Party Charges",
        isPartyClearance: false,
        isThirdParty: true,
        thirdPartyDetails: {
          type: "Third Party",
          company: "",
          rows: []
        }
      };
    }

    return {
      id: Date.now(),
      calculation_type: "",
      amount: "",
      invoice_no: "",
      invoice_date: "",
      vehicle_no: "",
      attachmentUrl: "",
      attachmentName: "",
      calTypeDescription: "",
      isPartyClearance: true,
      isThirdParty: false,
      thirdPartyDetails: null
    };
  }, []);

  // VALIDATION FUNCTIONS
  const validatePartyClearanceForm = useCallback((row) => {
    const errors = {};

    if (!row.calculation_type?.trim()) {
      errors.calculation_type = "Type is required";
    }

    if (!row.amount || parseFloat(row.amount) <= 0) {
      errors.amount = "Amount must be greater than 0";
    }

    if (!row.invoice_no?.trim()) {
      errors.invoice_no = "Invoice No is required";
    } else if (row.invoice_no.length > 20) {
      errors.invoice_no = "Invoice No must not exceed 20 characters";
    } else if (!/^[a-zA-Z0-9-/]+$/.test(row.invoice_no)) {
      errors.invoice_no = "Invoice No must be alphanumeric (letters, numbers, or hyphens only)";
    }

    if (row.vehicle_no && row.vehicle_no.length > 15) {
      errors.vehicle_no = "Vehicle No must not exceed 15 characters";
    } else if (row.vehicle_no && !/^[a-zA-Z0-9-]+$/.test(row.vehicle_no)) {
      errors.vehicle_no = "Vehicle No must be alphanumeric (letters, numbers, or hyphens only)";
    }

    return errors;
  }, []);

  const validateThirdPartyForm = useCallback((row) => {
    const errors = {};

    if (!row.thirdPartyDetails?.company?.trim()) {
      errors.company = "Company is required";
    }

    if (!row.invoice_no?.trim()) {
      errors.invoice_no = "Invoice No is required";
    }

    if (!row.invoice_date?.trim()) {
      errors.invoice_date = "Date is required";
    }

    if (!row.thirdPartyDetails?.rows || row.thirdPartyDetails.rows.length === 0) {
      errors.charges = "At least one charge is required";
    }

    // Validate individual charges
    if (row.thirdPartyDetails?.rows) {
      row.thirdPartyDetails.rows.forEach((charge, index) => {
        if (!charge.type) {
          errors[`charge_${index}_type`] = "Charge type is required";
        }
        if (!charge.amount || parseFloat(charge.amount) <= 0) {
          errors[`charge_${index}_amount`] = "Amount must be greater than 0";
        }
        if (!charge.total || parseFloat(charge.total) <= 0) {
          errors[`charge_${index}_total`] = "Total must be greater than 0";
        }
      });
    }

    return errors;
  }, []);

  const validateOtherInvoicesForm = useCallback((row) => {
    const errors = {};

    if (!row.invoice_no?.trim()) {
      errors.invoice_no = "Invoice No is required";
    }

    if (!row.invoice_date?.trim()) {
      errors.invoice_date = "Date is required";
    }

    if (!row.thirdPartyDetails?.rows || row.thirdPartyDetails.rows.length === 0) {
      errors.charges = "At least one charge is required";
    }

    // Validate individual charges
    if (row.thirdPartyDetails?.rows) {
      row.thirdPartyDetails.rows.forEach((charge, index) => {
        if (!charge.type) {
          errors[`charge_${index}_type`] = "Charge type is required";
        }
        if (!charge.amount || parseFloat(charge.amount) <= 0) {
          errors[`charge_${index}_amount`] = "Amount must be greater than 0";
        }
        if (!charge.total || parseFloat(charge.total) <= 0) {
          errors[`charge_${index}_total`] = "Total must be greater than 0";
        }
      });
    }

    return errors;
  }, []);

  // Show charge type selection popup
  const showChargeTypeSelection = useCallback(() => {
    if (isEditDisabled) {
      showValuationCompletedMessage();
      return;
    }

    Swal.fire({
      title: 'Select Charge Type',
      html: `
        <div class="space-y-4 mt-4">
          <div class="charge-type-option p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-indigo-400 transition-colors" data-type="partyClearance">
            <div class="flex items-center">
              <div class="h-5 w-5 rounded-full border-2 border-gray-300 mr-3 flex items-center justify-center">
                <div class="h-3 w-3 rounded-full bg-indigo-600 hidden"></div>
              </div>
              <div>
                <div class="font-semibold text-gray-800">Party Clearance Charge</div>
                <div class="text-sm text-gray-600 mt-1">Standard charge handled by our party</div>
              </div>
            </div>
          </div>
          <div class="charge-type-option p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-indigo-400 transition-colors" data-type="thirdParty">
            <div class="flex items-center">
              <div class="h-5 w-5 rounded-full border-2 border-gray-300 mr-3 flex items-center justify-center">
                <div class="h-3 w-3 rounded-full bg-indigo-600 hidden"></div>
              </div>
              <div>
                <div class="font-semibold text-gray-800">Third Party Charge</div>
                <div class="text-sm text-gray-600 mt-1">Charge handled by external party</div>
              </div>
            </div>
          </div>
          <div class="charge-type-option p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-indigo-400 transition-colors" data-type="otherInvoices">
            <div class="flex items-center">
              <div class="h-5 w-5 rounded-full border-2 border-gray-300 mr-3 flex items-center justify-center">
                <div class="h-3 w-3 rounded-full bg-indigo-600 hidden"></div>
              </div>
              <div>
                <div class="font-semibold text-gray-800">Other Invoices</div>
                <div class="text-sm text-gray-600 mt-1">Additional invoices and charges</div>
              </div>
            </div>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Continue',
      cancelButtonText: 'Cancel',
      preConfirm: () => {
        const selectedOption = document.querySelector('.charge-type-option.selected');
        if (!selectedOption) {
          Swal.showValidationMessage('Please select a charge type');
          return false;
        }
        return selectedOption.dataset.type;
      },
      didOpen: () => {
        const options = document.querySelectorAll('.charge-type-option');
        options.forEach(option => {
          option.addEventListener('click', function () {
            options.forEach(opt => {
              opt.classList.remove('selected', 'border-indigo-500', 'bg-indigo-50');
              opt.querySelector('.bg-indigo-600').classList.add('hidden');
            });
            this.classList.add('selected', 'border-indigo-500', 'bg-indigo-50');
            this.querySelector('.bg-indigo-600').classList.remove('hidden');
          });
        });
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        const newRow = createNewRow(result.value);

        if (result.value === 'otherInvoices') {
          setOtherInvoicesRows((prevRows) => [...prevRows, newRow]);
          setSelectedRowIndex(otherInvoicesRows.length);
        } else if (result.value === 'thirdParty') {
          setThirdPartyRows((prevRows) => [...prevRows, newRow]);
          setSelectedRowIndex(thirdPartyRows.length);
        } else {
          setOtherChargesRows((prevRows) => [...prevRows, newRow]);
          setSelectedRowIndex(otherChargesRows.length);
        }

        setSelectedChargeType(result.value);
        setIsAddingNew(true);
        setFormErrors({});
        setIsPopupOpen(true);
      }
    });
  }, [isEditDisabled, showValuationCompletedMessage, createNewRow, setOtherChargesRows, otherChargesRows.length, otherInvoicesRows.length, thirdPartyRows.length]);

  // Edit button handler
  const handleEditClick = useCallback((index, type = 'charges') => {
    console.log("Edit clicked for index:", index, "type:", type);
    if (isEditDisabled) {
      showValuationCompletedMessage();
    } else {
      setSelectedRowIndex(index);
      setIsAddingNew(false);
      setSelectedChargeType(type);
      setFormErrors({});
      setIsPopupOpen(true);
    }
  }, [isEditDisabled, showValuationCompletedMessage]);

  const handleInputChange = useCallback((index, field, value, type = 'charges') => {
    if (!isEditDisabled) {
      // Clear validation error for this field
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });

      if (type === 'charges') {
        setOtherChargesRows((prevRows) =>
          prevRows.map((row, i) =>
            i === index
              ? {
                ...row,
                [field]: field === "amount" ? value.replace(/,/g, "") : value,
                ...(field === "calculation_type" && {
                  calTypeDescription: attachmentDescription.find(item => item.CalculationType === value)?.Description || ""
                })
              }
              : row
          )
        );
      } else if (type === 'invoices') {
        setOtherInvoicesRows((prevRows) =>
          prevRows.map((row, i) =>
            i === index
              ? {
                ...row,
                [field]: field === "amount" ? value.replace(/,/g, "") : value,
                ...(field === "calculation_type" && {
                  calTypeDescription: attachmentDescription.find(item => item.CalculationType === value)?.Description || ""
                })
              }
              : row
          )
        );
      } else if (type === 'thirdParty') {
        setThirdPartyRows((prevRows) =>
          prevRows.map((row, i) =>
            i === index
              ? {
                ...row,
                [field]: field === "amount" ? value.replace(/,/g, "") : value,
                ...(field === "calculation_type" && {
                  calTypeDescription: attachmentDescription.find(item => item.CalculationType === value)?.Description || ""
                })
              }
              : row
          )
        );
      }
    }
  }, [isEditDisabled, setOtherChargesRows, setOtherInvoicesRows, setThirdPartyRows, attachmentDescription]);

  // File handling for charges
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) {
      handleFile(e.dataTransfer.files[0], 'charges');
    }
  }, []);

  const handleFileChange = useCallback((event, type = 'charges') => {
    const file = event.target.files[0];
    if (file && file.size <= MAX_FILE_SIZE) {
      const fileObject = {
        name: file.name,
        size: file.size,
        type: file.type,
        preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
        file: file,
      };

      if (type === 'charges') {
        setSelectedFiles((prev) => {
          const newFiles = [...prev];
          newFiles[selectedRowIndex] = fileObject;
          return newFiles;
        });
      } 
      else if (type === 'invoices') {
        setOtherInvoiceSelectedFiles((prev) => {
          const newFiles = [...prev];
          newFiles[selectedRowIndex] = fileObject;
          return newFiles;
        });
      }
      else if (type === 'thirdParty') {
        setThirdPartySelectedFiles((prev) => {
          const newFiles = [...prev];
          newFiles[selectedRowIndex] = fileObject;
          return newFiles;
        });
      }
    } else if (file?.size > MAX_FILE_SIZE) {
      showErrorToast("Error", "File size exceeds 5MB limit");
    }
  }, [selectedRowIndex, setSelectedFiles, setOtherInvoiceSelectedFiles, setThirdPartySelectedFiles, showErrorToast]);

  const handleFile = useCallback((file, type = 'charges') => {
    if (file.size > MAX_FILE_SIZE) {
      showErrorToast("Error", "File size exceeds 5MB limit");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (type === 'charges') {
        setSelectedFiles((prev) => {
          const newFiles = [...prev];
          newFiles[selectedRowIndex] = {
            file: file,
            preview: e.target.result,
            name: file.name,
            size: file.size,
          };
          return newFiles;
        });
      } else if (type === 'invoices') {
        setOtherInvoiceSelectedFiles((prev) => {
          const newFiles = [...prev];
          newFiles[selectedRowIndex] = {
            file: file,
            preview: e.target.result,
            name: file.name,
            size: file.size,
          };
          return newFiles;
        });
      } else if (type === 'thirdParty') {
        setThirdPartySelectedFiles((prev) => {
          const newFiles = [...prev];
          newFiles[selectedRowIndex] = {
            file: file,
            preview: e.target.result,
            name: file.name,
            size: file.size,
          };
          return newFiles;
        });
      }

      Swal.fire({
        title: "File Selected",
        text: `Selected: ${file.name}`,
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    };
    reader.readAsDataURL(file);
  }, [selectedRowIndex, setSelectedFiles, setOtherInvoiceSelectedFiles, setThirdPartySelectedFiles, showErrorToast]);

  // UPDATED CAMERA FUNCTIONS WITH AUTO-START
  const startCamera = useCallback(async () => {
    try {
      // Stop any existing stream
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach(track => track.stop());
      }

      const constraints = {
        video: {
          facingMode: "environment", // Use back camera by default
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      cameraStreamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      
      return true;
    } catch (error) {
      console.error("Error accessing camera:", error);
      showErrorToast("Camera Error", 
        error.name === 'NotAllowedError' 
          ? "Camera access denied. Please allow camera permissions."
          : "Unable to access camera. Please check if camera is available."
      );
      return false;
    }
  }, [showErrorToast]);

  const stopCamera = useCallback(() => {
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      cameraStreamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const capturePhoto = useCallback((type = 'charges') => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob((blob) => {
        if (!blob) {
          showErrorToast("Error", "Failed to capture photo");
          return;
        }

        const file = new File([blob], `capture_${Date.now()}.jpg`, { 
          type: "image/jpeg",
          lastModified: Date.now()
        });

        if (file.size > MAX_FILE_SIZE) {
          showErrorToast("Error", "Captured image exceeds 5MB limit");
          return;
        }

        // Create preview URL
        const previewUrl = URL.createObjectURL(blob);
        
        // Stop camera and close camera modal
        stopCamera();
        setIsCameraOpen(false);
        
        // Show captured photo preview
        setCapturedPhoto({
          file: file,
          preview: previewUrl,
          name: file.name,
          size: file.size,
          type: file.type
        });
        
        // Show preview modal
        setShowPhotoPreview(true);
      }, "image/jpeg", 0.9);
    } else {
      showErrorToast("Error", "Camera not ready");
    }
  }, [showErrorToast, stopCamera]);

  // Handle photo preview actions
  const handlePhotoPreviewAction = useCallback((action, type = 'charges') => {
    if (action === 'use' && capturedPhoto) {
      const fileObject = {
        file: capturedPhoto.file,
        preview: capturedPhoto.preview,
        name: capturedPhoto.name,
        size: capturedPhoto.size,
        type: capturedPhoto.type
      };

      if (type === 'charges') {
        setSelectedFiles((prev) => {
          const newFiles = [...prev];
          newFiles[selectedRowIndex] = fileObject;
          return newFiles;
        });
      } else if (type === 'invoices') {
        setOtherInvoiceSelectedFiles((prev) => {
          const newFiles = [...prev];
          newFiles[selectedRowIndex] = fileObject;
          return newFiles;
        });
      } else if (type === 'thirdParty') {
        setThirdPartySelectedFiles((prev) => {
          const newFiles = [...prev];
          newFiles[selectedRowIndex] = fileObject;
          return newFiles;
        });
      }

      showSuccessToast("Success", "Photo added successfully!");
    } else if (action === 'retake') {
      // Cleanup captured photo
      if (capturedPhoto?.preview) {
        URL.revokeObjectURL(capturedPhoto.preview);
      }
      setCapturedPhoto(null);
      setShowPhotoPreview(false);
      
      // Restart camera
      setTimeout(() => {
        startCamera();
        setIsCameraOpen(true);
      }, 300);
      return;
    }

    // Cleanup and close preview
    if (capturedPhoto?.preview && action !== 'retake') {
      URL.revokeObjectURL(capturedPhoto.preview);
    }
    setCapturedPhoto(null);
    setShowPhotoPreview(false);
  }, [capturedPhoto, selectedRowIndex, setSelectedFiles, setOtherInvoiceSelectedFiles, setThirdPartySelectedFiles, showSuccessToast, startCamera]);

  // OPEN CAMERA MODAL FUNCTION - Updated to auto-start camera
  const openCameraModal = useCallback(async () => {
    try {
      setIsCameraOpen(true);
      // Small delay to ensure modal is rendered
      setTimeout(async () => {
        const success = await startCamera();
        if (!success) {
          setIsCameraOpen(false);
        }
      }, 100);
    } catch (error) {
      console.error("Failed to open camera:", error);
      setIsCameraOpen(false);
    }
  }, [startCamera]);

  // Third party functions
  const handleAddThirdPartyCharge = useCallback(() => {
    const errors = {};
    
    if (!currentThirdPartyRow.type) {
      errors.type = "Type is required";
    }
    
    if (!currentThirdPartyRow.amount || parseFloat(currentThirdPartyRow.amount) <= 0) {
      errors.amount = "Amount must be greater than 0";
    }
    
    if (!currentThirdPartyRow.total || parseFloat(currentThirdPartyRow.total) <= 0) {
      errors.total = "Total must be greater than 0";
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      showErrorToast("Validation Error", "Please fill all required fields correctly");
      return;
    }

    setThirdPartyRows(prevRows => {
      const newRows = [...prevRows];
      const currentRow = newRows[selectedRowIndex];

      const updatedThirdPartyRows = [
        ...(currentRow.thirdPartyDetails?.rows || []),
        {
          ...currentThirdPartyRow,
          id: `charge-${Date.now()}`
        }
      ];

      newRows[selectedRowIndex] = {
        ...currentRow,
        thirdPartyDetails: {
          ...currentRow.thirdPartyDetails,
          rows: updatedThirdPartyRows
        }
      };

      return newRows;
    });

    // Reset form including image
    setCurrentThirdPartyRow({
      type: "",
      discount: "",
      percentage: "",
      vatAmount: "",
      amount: "",
      total: "",
      remarks: "",
      imageFile: null
    });
    setValidationErrors({});
  }, [currentThirdPartyRow, selectedRowIndex, setThirdPartyRows, showErrorToast]);

  const handleRemoveThirdPartyCharge = useCallback((index) => {
    setThirdPartyRows(prevRows => {
      const newRows = [...prevRows];
      const currentRow = newRows[selectedRowIndex];

      const chargeToRemove = currentRow.thirdPartyDetails?.rows?.[index];

      // Clean up image URL if exists
      if (chargeToRemove?.imageFile?.preview?.startsWith('blob:')) {
        URL.revokeObjectURL(chargeToRemove.imageFile.preview);
      }

      const updatedThirdPartyRows = [
        ...(currentRow.thirdPartyDetails?.rows || [])
      ];
      updatedThirdPartyRows.splice(index, 1);

      newRows[selectedRowIndex] = {
        ...currentRow,
        thirdPartyDetails: {
          ...currentRow.thirdPartyDetails,
          rows: updatedThirdPartyRows
        }
      };

      return newRows;
    });
  }, [selectedRowIndex, setThirdPartyRows]);

  const handleThirdPartyDetailChange = useCallback((field, value) => {
    // Clear validation error for this field
    setFormErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });

    setThirdPartyRows(prevRows => {
      const newRows = [...prevRows];
      const currentRow = newRows[selectedRowIndex];

      newRows[selectedRowIndex] = {
        ...currentRow,
        thirdPartyDetails: {
          ...currentRow.thirdPartyDetails,
          [field]: value
        }
      };

      return newRows;
    });
  }, [selectedRowIndex, setThirdPartyRows]);

  const handleInsertCharge = useCallback(async (row, type = 'charges', customFile = null) => {
    if (isEditDisabled) return;

    let validationErrors = {};
    
    // Validate based on form type
    if (type === 'charges' && row.isPartyClearance) {
      validationErrors = validatePartyClearanceForm(row);
    } else if (type === 'thirdParty' && row.isThirdParty) {
      validationErrors = validateThirdPartyForm(row);
    } else if (type === 'otherInvoices' && row.isOtherInvoice) {
      validationErrors = validateOtherInvoicesForm(row);
    }

    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      showErrorToast("Validation Error", "Please fill all required fields correctly");
      return false;
    }

    // Client-side duplicate invoice check and subcompany length validation
    try {
      const invoiceValue = (row.invoice_no || row.apiData?.invno || "").toString().trim();
      if (invoiceValue) {
        const allInvoices = [
          ...(otherInvoicesRows || []).map(r => ({...r, _type: 'other'})),
          ...(thirdPartyRows || []).map(r => ({...r, _type: 'third'}))
        ];

        const duplicate = allInvoices.some(r => {
          const inv = (r.invoice_no || r.apiData?.invno || "").toString().trim().toLowerCase();
          if (!inv) return false;
          // If it's the same row instance (same id), ignore
          if (r.id === row.id) return false;
          return inv === invoiceValue.toLowerCase();
        });

        if (duplicate) {
          Swal.fire({
            title: 'Duplicate Invoice',
            text: 'Invoice number already exists for this voucher/year. Please use a different invoice number or edit the existing invoice.',
            icon: 'warning',
            confirmButtonText: 'OK'
          });
          return false;
        }
      }

      // Validate SubcompanyCode length to avoid ORA-12899
      const subcompany = (row.thirdPartyDetails?.company || "").toString();
      if (subcompany && subcompany.length > 10) {
        Swal.fire({
          title: 'Invalid Company',
          text: `Selected company code is too long (${subcompany.length}). Subcompany ID must be 10 characters or fewer.`,
          icon: 'error',
          confirmButtonText: 'OK'
        });
        return false;
      }
    } catch (e) {
      console.warn('Invoice/subcompany validation failed', e);
    }

    try {
      setIsSaving(true);

      // Get the current file for upload
      const currentFile = customFile || 
                       (type === 'thirdParty' ? thirdPartySelectedFiles[selectedRowIndex]?.file : 
                        type === 'otherInvoices' ? otherInvoiceSelectedFiles[selectedRowIndex]?.file :
                        selectedFiles[selectedRowIndex]?.file);

      if (type === 'charges' && row.isPartyClearance) {
        // Party Clearance API call
        const apiData = prepareSettlementDetails(row);
        console.log("Sending Party Clearance data to API:", apiData);
        console.log("File to upload:", currentFile);

        const result = await insertPartyClearanceCharge(apiData, currentFile);

        if (result) {
          showSuccessToast(
            "Success",
            isAddingNew ? "Charge added successfully!" : "Charge updated successfully!"
          );
          await refreshChargesData();
          return true;
        }
      }
      else if (type === 'thirdParty' && row.isThirdParty) {
        // Check if this is an existing row (has apiData) for update
        const isExistingRow = !isAddingNew && row.apiData;
        
        let result;
        if (isExistingRow) {
          // UPDATE existing third party charge
          console.log("Updating existing third party charge...");
          const apiData = prepareThirdPartyUpdateDetails(row);
          console.log("Update API Data:", apiData);
          result = await updateThirdPartyCharge(apiData, currentFile);
        } else {
          // INSERT new third party charge
          console.log("Adding new third party charge...");
          const apiData = prepareThirdPartyDetails(row);
          console.log("Insert API Data:", apiData);
          result = await insertThirdPartyCharge(apiData, currentFile);
        }

        if (result) {
          // The API may return a JSON string like {StatusCode:200, Result: "Data already exists", ResultSet: null}
          // or a plain string. Detect duplicate-data responses and show an error instead of success.
          let parsedResult = null;
          try {
            parsedResult = JSON.parse(result);
          } catch (e) {
            parsedResult = null;
          }

          const apiMessage = (parsedResult && (parsedResult.Result || parsedResult.Message)) || (typeof result === 'string' ? result : '');

          if (apiMessage && apiMessage.toString().toLowerCase().includes('data already')) {
            showErrorToast('Error', apiMessage.toString());
            return false;
          }

          showSuccessToast(
            "Success",
            isAddingNew ? "Third Party charge added successfully!" : "Third Party charge updated successfully!"
          );
          await refreshChargesData();
          return true;
        }
      }
      else if (type === 'otherInvoices' && row.isOtherInvoice) {
        // Check if this is an existing row (has apiData) for update
        const isExistingRow = !isAddingNew && row.apiData;
        
        let result;
        if (isExistingRow) {
          // UPDATE existing other invoice
          console.log("Updating existing other invoice...");
          const apiData = prepareOtherInvoiceUpdateDetails(row);
          console.log("Update API Data:", apiData);
          result = await updateOtherInvoice(apiData, currentFile);
        } else {
          // INSERT new other invoice
          console.log("Adding new other invoice...");
          const apiData = prepareOtherInvoiceDetails(row);
          console.log("Insert API Data:", apiData);
          result = await insertOtherInvoice(apiData, currentFile);
        }

        if (result) {
          showSuccessToast(
            "Success",
            isAddingNew ? "Other invoice added successfully!" : "Other invoice updated successfully!"
          );
          await refreshChargesData();
          return true;
        }
      }

      showErrorToast("Error", "Failed to save charge. Please try again.");
      return false;
    } catch (error) {
      console.error("Error inserting charge:", error);
      const errMsg = (error && (error.message || error.toString())) || 'Unknown error';
      let friendly = 'Failed to save charge. Please try again.';
      if (/ORA-12899|value too large/i.test(errMsg)) {
        friendly = 'Server error: selected Subcompany ID/value is too long. Please choose a different company or contact admin.';
      } else if (/ORA-00001|unique|already exists|duplicate/i.test(errMsg)) {
        friendly = 'Invoice number already exists for this voucher/year. Enter a different invoice number or edit the existing invoice.';
      } else if (/MWI_SUBCOMPANY_ID/i.test(errMsg)) {
        friendly = 'Server error: Subcompany ID is invalid or exceeds allowed length. Please select a valid subcompany.';
      }

      Swal.fire({
        title: 'Save Failed',
        text: friendly,
        icon: 'error',
        footer: `<div style="max-height:120px;overflow:auto;white-space:pre-wrap;font-size:12px;color:#444">${errMsg}</div>`,
        confirmButtonText: 'OK'
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [
    isEditDisabled,
    showErrorToast,
    showSuccessToast,
    year,
    voucherno,
    prepareSettlementDetails,
    insertPartyClearanceCharge,
    isAddingNew,
    selectedFiles,
    thirdPartySelectedFiles,
    otherInvoiceSelectedFiles,
    selectedRowIndex,
    refreshChargesData,
    prepareThirdPartyDetails,
    insertThirdPartyCharge,
    prepareThirdPartyUpdateDetails,
    updateThirdPartyCharge,
    prepareOtherInvoiceDetails,
    insertOtherInvoice,
    prepareOtherInvoiceUpdateDetails,
    updateOtherInvoice,
    validatePartyClearanceForm,
    validateThirdPartyForm,
    validateOtherInvoicesForm
  ]);

  // Handle save/edit for individual charge
  const handleSaveEdit = useCallback(async () => {
    if (isEditDisabled) return;

    let success = false;

    if (selectedChargeType === 'otherInvoices') {
      const rowToSave = otherInvoicesRows[selectedRowIndex];
      // Get the correct file for other invoice
      const currentFile = otherInvoiceSelectedFiles[selectedRowIndex]?.file || selectedFiles[selectedRowIndex]?.file;
      success = await handleInsertCharge(rowToSave, 'otherInvoices', currentFile);
    } else if (selectedChargeType === 'thirdParty') {
      const rowToSave = thirdPartyRows[selectedRowIndex];
      // Get the correct file for third party
      const currentFile = thirdPartySelectedFiles[selectedRowIndex]?.file || selectedFiles[selectedRowIndex]?.file;
      success = await handleInsertCharge(rowToSave, 'thirdParty', currentFile);
    } else if (selectedChargeType === 'partyClearance') {
      const rowToSave = otherChargesRows[selectedRowIndex];
      success = await handleInsertCharge(rowToSave, 'charges');
    }

    if (success) {
      setIsPopupOpen(false);
      setIsAddingNew(false);
      setSelectedChargeType(null);
      setFormErrors({});
      setValidationErrors({});
    }
  }, [
    isEditDisabled,
    selectedChargeType,
    otherChargesRows,
    otherInvoicesRows,
    thirdPartyRows,
    otherInvoiceSelectedFiles,
    thirdPartySelectedFiles,
    selectedFiles,
    selectedRowIndex,
    handleInsertCharge
  ]);

  const handleCancelEdit = useCallback(() => {
    if (isAddingNew) {
      if (selectedChargeType === 'otherInvoices') {
        setOtherInvoicesRows((prevRows) =>
          prevRows.filter((_, index) => index !== selectedRowIndex)
        );
      } else if (selectedChargeType === 'thirdParty') {
        setThirdPartyRows((prevRows) =>
          prevRows.filter((_, index) => index !== selectedRowIndex)
        );
      } else {
        setOtherChargesRows((prevRows) =>
          prevRows.filter((_, index) => index !== selectedRowIndex)
        );
      }
    }
    setIsPopupOpen(false);
    setIsAddingNew(false);
    setSelectedChargeType(null);
    setIsDropdownOpen(false);
    setFormErrors({});
    setValidationErrors({});
  }, [isAddingNew, selectedChargeType, selectedRowIndex, setOtherChargesRows, setOtherInvoicesRows, setThirdPartyRows]);

  // Helper function to get serial number from row data
  const getSerialNumber = useCallback((row) => {
    return row.serialNo || row.Sno_path;
  }, []);

  const handlePreviewClick = useCallback((fileData, attachmentUrl, serialNo) => {
    let imageUrl = "";

    // Priority 1: Use existing file data with preview
    if (fileData?.preview) {
      imageUrl = fileData.preview;
    } 
    // Priority 2: Use API endpoint with serial number
    else if (serialNo && year && voucherno) {
      imageUrl = `https://esystems.cdl.lk/backend-test/ewharf/ValueList/FilePreview?year=${year}&voucher_no=${voucherno}&serial_no=${serialNo}`;
    }
    // Priority 3: Use direct attachment URL from API response
    else if (attachmentUrl) {
      // If it's a file path, try to convert it to a proper URL
      if (attachmentUrl.startsWith('D:\\') || attachmentUrl.includes('\\')) {
        // Extract filename from path and create API URL
        const fileName = attachmentUrl.split('\\').pop();
        imageUrl = `https://esystems.cdl.lk/backend-test/ewharf/ValueList/FilePreview?year=${year}&voucher_no=${voucherno}&filename=${fileName}`;
      } else {
        imageUrl = attachmentUrl;
      }
    }

    console.log("Previewing image URL:", imageUrl);

    if (imageUrl) {
      Swal.fire({
        imageUrl,
        imageAlt: "Charge Attachment",
        showConfirmButton: false,
        showCloseButton: true,
        customClass: { popup: "max-w-3xl" },
        // Add error handling for failed image loads
        didOpen: () => {
          const img = document.querySelector('.swal2-image');
          if (img) {
            img.onerror = () => {
              Swal.update({
                title: "Error Loading Image",
                text: "Unable to load the attachment. The file may be corrupted or unavailable.",
                icon: "error",
                showConfirmButton: true,
                showCloseButton: true
              });
            };
            img.onload = () => {
              console.log("Image loaded successfully");
            };
          }
        }
      });
    } else {
      Swal.fire("Error", "Unable to load the image. No valid image source found.", "error");
    }
  }, [year, voucherno]);

  // Get current attachment for display
  const getCurrentAttachment = useCallback((rowIndex, rowData, type = 'charges') => {
    if (type === 'charges') {
      if (selectedFiles[rowIndex]) {
        return {
          ...selectedFiles[rowIndex],
          serialNo: getSerialNumber(rowData)
        };
      }
      else if (existingAttachments[rowIndex]) {
        return existingAttachments[rowIndex];
      }
      else if (getSerialNumber(rowData)) {
        const serialNo = getSerialNumber(rowData);
        return {
          preview: `https://esystems.cdl.lk/backend-test/ewharf/ValueList/FilePreview?year=${year}&voucher_no=${voucherno}&serial_no=${serialNo}`,
          name: `Attachment_${serialNo}`,
          isExisting: true,
          serialNo: serialNo
        };
      }
    } else if (type === 'invoices') {
      if (otherInvoiceSelectedFiles[rowIndex]) {
        return otherInvoiceSelectedFiles[rowIndex];
      }
      else if (otherInvoiceAttachments[rowIndex]) {
        return otherInvoiceAttachments[rowIndex];
      }
      else if (getSerialNumber(rowData)) {
        const serialNo = getSerialNumber(rowData);
        return {
          preview: `https://esystems.cdl.lk/backend-test/ewharf/ValueList/FilePreview?year=${year}&voucher_no=${voucherno}&serial_no=${serialNo}`,
          name: `OtherInvoice_Attachment_${serialNo}`,
          isExisting: true,
          serialNo: serialNo
        };
      }
    } else if (type === 'thirdParty') {
      if (thirdPartySelectedFiles[rowIndex]) {
        return thirdPartySelectedFiles[rowIndex];
      }
      // Check for existing attachments from API
      else if (getSerialNumber(rowData)) {
        const serialNo = getSerialNumber(rowData);
        return {
          preview: `https://esystems.cdl.lk/backend-test/ewharf/ValueList/FilePreview?year=${year}&voucher_no=${voucherno}&serial_no=${serialNo}`,
          name: `ThirdParty_Attachment_${serialNo}`,
          isExisting: true,
          serialNo: serialNo
        };
      }
    }
    return null;
  }, [selectedFiles, existingAttachments, otherInvoiceSelectedFiles, otherInvoiceAttachments, thirdPartySelectedFiles, year, voucherno, getSerialNumber]);

  // Get description for calculation type
  const getTypeDescription = useCallback((calculationType) => {
    if (!calculationType) return "-";
    const description = attachmentDescription.find(item => item.CalculationType === calculationType);
    return description?.Description || calculationType;
  }, [attachmentDescription]);

  // Get current row data based on selected type
  const getCurrentRowData = useCallback(() => {
    if (selectedChargeType === 'otherInvoices') {
      return otherInvoicesRows[selectedRowIndex];
    } else if (selectedChargeType === 'thirdParty') {
      return thirdPartyRows[selectedRowIndex];
    } else {
      return otherChargesRows[selectedRowIndex];
    }
  }, [selectedChargeType, selectedRowIndex, otherChargesRows, otherInvoicesRows, thirdPartyRows]);

  // Calculate totals for display
  const partyClearanceTotal = useMemo(() => {
    return calculatePartyClearanceTotal(otherChargesRows);
  }, [otherChargesRows, calculatePartyClearanceTotal]);

  const thirdPartyTotal = useMemo(() => {
    return thirdPartyRows.reduce((sum, row) => {
      const rowTotal = row.thirdPartyDetails?.total || 
                      (row.thirdPartyDetails?.rows ? 
                       calculateThirdPartyTotal(row.thirdPartyDetails.rows) : 
                       (parseFloat(row.amount) || 0));
      return sum + rowTotal;
    }, 0);
  }, [thirdPartyRows, calculateThirdPartyTotal]);

  const otherInvoicesTotal = useMemo(() => {
    return calculateOtherInvoicesTotal(otherInvoicesRows);
  }, [otherInvoicesRows, calculateOtherInvoicesTotal]);

  const grandTotal = useMemo(() => {
    return partyClearanceTotal + thirdPartyTotal + otherInvoicesTotal;
  }, [partyClearanceTotal, thirdPartyTotal, otherInvoicesTotal]);

  // Cleanup file preview URLs
  const cleanupFilePreview = useCallback((fileData) => {
    if (fileData?.preview && fileData.preview.startsWith('blob:')) {
      URL.revokeObjectURL(fileData.preview);
    }
  }, []);

  // Clean up camera stream on unmount and when modal closes
  useEffect(() => {
    return () => {
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach(track => track.stop());
      }
      // Cleanup captured photo preview
      if (capturedPhoto?.preview) {
        URL.revokeObjectURL(capturedPhoto.preview);
      }
    };
  }, [capturedPhoto]);

  // Auto-start camera when modal opens
  useEffect(() => {
    if (isCameraOpen) {
      const initCamera = async () => {
        const success = await startCamera();
        if (!success) {
          setIsCameraOpen(false);
        }
      };
      initCamera();
    }

    // Cleanup camera when modal closes
    return () => {
      if (!isCameraOpen && cameraStreamRef.current) {
        stopCamera();
      }
    };
  }, [isCameraOpen, startCamera, stopCamera]);

  // Debug logging
  useEffect(() => {
    console.log("=== CURRENT STATE ===");
    console.log("Party Clearance Rows:", otherChargesRows);
    console.log("Third Party Rows:", thirdPartyRows);
    console.log("Other Invoices Rows:", otherInvoicesRows);
    console.log("Party Clearance Total:", partyClearanceTotal);
    console.log("Third Party Total:", thirdPartyTotal);
    console.log("Other Invoices Total:", otherInvoicesTotal);
    console.log("Grand Total:", grandTotal);
  }, [otherChargesRows, thirdPartyRows, otherInvoicesRows, partyClearanceTotal, thirdPartyTotal, otherInvoicesTotal, grandTotal]);

  return (
    <div className="w-full bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-indigo-50 p-4 border-b">
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-indigo-700 flex items-center text-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07-.34-.433-.582a2.305 2.305 0 01-.567.267z" />
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
                clipRule="evenodd"
              />
            </svg>
            Other Charges
          </h2>
          <button
            onClick={showChargeTypeSelection}
            className={`text-white px-4 py-2 rounded-md text-sm flex items-center ${isEditDisabled ? "bg-gray-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
              }`}
            disabled={isEditDisabled}
          >
            <FiPlus className="mr-2" />
            Add Charge
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="p-4">
        {/*---------------------------------------------------------------- Party Clearance Section----------------------------------------------------------- */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-md font-semibold text-gray-800 flex items-center">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mr-2">
                Party Clearance
              </span>
              Charges
              {otherChargesRows.length > 0 && (
                <span className="ml-2 text-xs text-gray-500">
                  ({otherChargesRows.length} records)
                </span>
              )}
            </h3>
            <div className="text-sm font-medium text-gray-700">
              Total: <span className="text-green-600">{formatNumberWithCommas(partyClearanceTotal.toString())}</span>
            </div>
          </div>

          <div className="overflow-x-auto max-h-64 mb-4 border rounded-lg">
            <table className="w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice No</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attachment</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {otherChargesRows.length > 0 ? (
                  otherChargesRows.map((row, index) => {
                    const currentAttachment = getCurrentAttachment(index, row, 'charges');
                    const serialNo = getSerialNumber(row);
                    return (
                      <tr key={row.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">
                          {row.calTypeDescription || getTypeDescription(row.calculation_type) || "-"}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800 font-medium text-right">
                          {formatAmountWithCommasOnly(row.amount) || "0"}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800 text-right">
                          {row.invoice_no || "-"}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800 text-right">
                          {formatDateTime(row.invoice_date) || "-"}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800 text-right">
                          {row.vehicle_no || "-"}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          {currentAttachment ? (
                            <button
                              onClick={() => handlePreviewClick(currentAttachment, row.attachmentUrl, serialNo)}
                              className="text-indigo-600 hover:underline cursor-pointer flex items-center"
                            >
                              <FiUpload className="mr-1 h-3 w-3" />
                              {currentAttachment.name}
                            </button>
                          ) : (
                            <span className="text-gray-400">None</span>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          <button
                            onClick={() => handleEditClick(index, 'partyClearance')}
                            className={`text-white p-1.5 rounded-md ${isEditDisabled ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
                              }`}
                            disabled={isEditDisabled}
                          >
                            <FiEdit className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" className="px-4 py-4 text-center text-sm text-gray-500">
                      No party clearance charges added
                    </td>
                  </tr>
                )}
              </tbody>
              {otherChargesRows.length > 0 && (
                <tfoot className="bg-gray-50 border-t">
                  <tr>
                    <td className="px-4 py-3 text-right text-sm font-medium text-gray-700" colSpan="1">
                      Sub Total:
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-green-700 text-right">
                      {formatNumberWithCommas(partyClearanceTotal.toString())}
                    </td>
                    <td colSpan="5"></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>

        {/* Third Party Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-md font-semibold text-gray-800 flex items-center">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2">
                Third Party
              </span>
              Charges
              {thirdPartyRows.length > 0 && (
                <span className="ml-2 text-xs text-gray-500">
                  ({thirdPartyRows.length} records)
                </span>
              )}
            </h3>
            <div className="text-sm font-medium text-gray-700">
              Total: <span className="text-blue-600">{formatNumberWithCommas(thirdPartyTotal.toString())}</span>
            </div>
          </div>

          <div className="overflow-x-auto max-h-64 mb-4 border rounded-lg">
            <table className="w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice No</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Charges</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attachment</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {thirdPartyRows.length > 0 ? (
                  thirdPartyRows.map((row, index) => {
                    const total = row.thirdPartyDetails?.total || 
                                 (row.thirdPartyDetails?.rows ? 
                                  calculateThirdPartyTotal(row.thirdPartyDetails.rows) : 
                                  (parseFloat(row.amount) || 0));

                    const currentAttachment = getCurrentAttachment(index, row, 'thirdParty');
                    const serialNo = getSerialNumber(row);

                    return (
                      <tr key={row.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-800 font-medium text-right">
                          {row.invoice_no || row.apiData?.invno || "-"}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-800 text-right">
                          {formatDateTime(row.invoice_date) || formatDateTime(row.apiData?.InvDate) || "-"}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-800">
                          {row.thirdPartyDetails?.company || row.apiData?.CompanyCode || "-"}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-800">
                          {row.thirdPartyDetails?.rows?.length > 0 ? (
                            <div className="space-y-1">
                              {row.thirdPartyDetails.rows.slice(0, 2).map((charge, chargeIndex) => (
                                <div key={chargeIndex} className="text-xs text-right">
                                  {getTaxTypeDescription(charge.type)}: {formatAmountWithCommasOnly(charge.amount)}
                                </div>
                              ))}
                              {row.thirdPartyDetails.rows.length > 2 && (
                                <div className="text-xs text-gray-500">
                                  +{row.thirdPartyDetails.rows.length - 2} more charges
                                </div>
                              )}
                            </div>
                          ) : row.apiData?.items?.length > 0 ? (
                            <div className="space-y-1">
                              {row.apiData.items.slice(0, 2).map((charge, chargeIndex) => (
                                <div key={chargeIndex} className="text-xs text-right">
                                  {getTaxTypeDescription(charge.TAXType)}: {formatAmountWithCommasOnly(charge.TXTAmount)}
                                </div>
                              ))}
                              {row.apiData.items.length > 2 && (
                                <div className="text-xs text-gray-500">
                                  +{row.apiData.items.length - 2} more charges
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400">No charges</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-800 font-medium text-right">
                          {formatAmountWithCommasOnly(total.toString())}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {currentAttachment ? (
                            <button
                              onClick={() => handlePreviewClick(currentAttachment, row.attachmentUrl, serialNo)}
                              className="text-indigo-600 hover:underline cursor-pointer flex items-center"
                            >
                              <FiUpload className="mr-1 h-3 w-3" />
                              {currentAttachment.name}
                            </button>
                          ) : row.thirdPartyDetails?.rows?.[0]?.path ? (
                            <button
                              onClick={() => handlePreviewClick(
                                { preview: row.thirdPartyDetails.rows[0].path },
                                row.thirdPartyDetails.rows[0].path
                              )}
                              className="text-indigo-600 hover:underline cursor-pointer flex items-center"
                            >
                              <FiUpload className="mr-1 h-3 w-3" />
                              View Attachment
                            </button>
                          ) : row.apiData?.items?.[0]?.PATH ? (
                            <button
                              onClick={() => handlePreviewClick(
                                { preview: row.apiData.items[0].PATH },
                                row.apiData.items[0].PATH
                              )}
                              className="text-indigo-600 hover:underline cursor-pointer flex items-center"
                            >
                              <FiUpload className="mr-1 h-3 w-3" />
                              View Attachment
                            </button>
                          ) : (
                            <span className="text-gray-400">None</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <button
                            onClick={() => handleEditClick(index, 'thirdParty')}
                            className={`text-white p-1.5 rounded-md ${isEditDisabled ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
                              }`}
                            disabled={isEditDisabled}
                          >
                            <FiEdit className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" className="px-4 py-4 text-center text-sm text-gray-500">
                      No third party charges found
                    </td>
                  </tr>
                )}
              </tbody>
              {thirdPartyRows.length > 0 && (
                <tfoot className="bg-gray-50 border-t">
                  <tr>
                    <td className="px-4 py-3 text-right text-sm font-medium text-gray-700" colSpan="4">
                      Sub Total:
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-blue-700 text-right">
                      {formatNumberWithCommas(thirdPartyTotal.toString())}
                    </td>
                    <td colSpan="2"></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>

        {/* ------------------------------------------------------------Other Invoices Section---------------------------------------------------------------------- */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-md font-semibold text-gray-800 flex items-center">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 mr-2">
                Other Invoices
              </span>
              Additional Charges
              {otherInvoicesRows.length > 0 && (
                <span className="ml-2 text-xs text-gray-500">
                  ({otherInvoicesRows.length} records)
                </span>
              )}
            </h3>
            <div className="text-sm font-medium text-gray-700">
              Total: <span className="text-purple-600">{formatNumberWithCommas(otherInvoicesTotal.toString())}</span>
            </div>
          </div>

          <div className="overflow-x-auto max-h-64 mb-4 border rounded-lg">
            <table className="w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice No</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Charges</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attachment</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {otherInvoicesRows.length > 0 ? (
                  otherInvoicesRows.map((row, index) => {
                    const total = row.thirdPartyDetails?.total || 
                                 (row.thirdPartyDetails?.rows ? 
                                  calculateThirdPartyTotal(row.thirdPartyDetails.rows) : 
                                  (parseFloat(row.amount) || 0));
                    
                    const currentAttachment = getCurrentAttachment(index, row, 'invoices');
                    const serialNo = getSerialNumber(row);

                    return (
                      <tr key={row.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-800 font-medium text-right">
                          {row.invoice_no || "-"}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-800 text-right">
                          {row.invoice_date}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-800">
                          {row.thirdPartyDetails?.company || "-"}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-800">
                          {row.thirdPartyDetails?.rows?.length > 0 ? (
                            <div className="space-y-1">
                              {row.thirdPartyDetails.rows.slice(0, 2).map((charge, chargeIndex) => (
                                <div key={chargeIndex} className="text-xs text-right">
                                  {getTaxTypeDescription(charge.type)}: {formatAmountWithCommasOnly(charge.amount)}
                                </div>
                              ))}
                              {row.thirdPartyDetails.rows.length > 2 && (
                                <div className="text-xs text-gray-500">
                                  +{row.thirdPartyDetails.rows.length - 2} more charges
                                </div>
                              )}
                            </div>
                          ) : row.apiData?.items?.length > 0 ? (
                            <div className="space-y-1">
                              {row.apiData.items.slice(0, 2).map((charge, chargeIndex) => (
                                <div key={chargeIndex} className="text-xs text-right">
                                  {getTaxTypeDescription(charge.TAXType)}: {formatAmountWithCommasOnly(charge.TXTAmount)}
                                </div>
                              ))}
                              {row.apiData.items.length > 2 && (
                                <div className="text-xs text-gray-500">
                                  +{row.apiData.items.length - 2} more charges
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400">No charges</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-800 font-medium text-right">
                          {formatAmountWithCommasOnly(total.toString())}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {currentAttachment ? (
                            <button
                              onClick={() => handlePreviewClick(currentAttachment, row.attachmentUrl, serialNo)}
                              className="text-indigo-600 hover:underline cursor-pointer flex items-center"
                            >
                              <FiUpload className="mr-1 h-3 w-3" />
                              {currentAttachment.name}
                            </button>
                          ) : row.thirdPartyDetails?.rows?.[0]?.path ? (
                            <button
                              onClick={() => handlePreviewClick(
                                { preview: row.thirdPartyDetails.rows[0].path },
                                row.thirdPartyDetails.rows[0].path
                              )}
                              className="text-indigo-600 hover:underline cursor-pointer flex items-center"
                            >
                              <FiUpload className="mr-1 h-3 w-3" />
                              View Attachment
                            </button>
                          ) : row.apiData?.items?.[0]?.PATH ? (
                            <button
                              onClick={() => handlePreviewClick(
                                { preview: row.apiData.items[0].PATH },
                                row.apiData.items[0].PATH
                              )}
                              className="text-indigo-600 hover:underline cursor-pointer flex items-center"
                            >
                              <FiUpload className="mr-1 h-3 w-3" />
                              View Attachment
                            </button>
                          ) : (
                            <span className="text-gray-400">None</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <button
                            onClick={() => handleEditClick(index, 'otherInvoices')}
                            className={`text-white p-1.5 rounded-md ${isEditDisabled ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
                              }`}
                            disabled={isEditDisabled}
                          >
                            <FiEdit className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" className="px-4 py-4 text-center text-sm text-gray-500">
                      No other invoices added
                    </td>
                  </tr>
                )}
              </tbody>
              {otherInvoicesRows.length > 0 && (
                <tfoot className="bg-gray-50 border-t">
                  <tr>
                    <td className="px-4 py-3 text-right text-sm font-medium text-gray-700" colSpan="4">
                      Sub Total:
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-purple-700 text-right">
                      {formatNumberWithCommas(otherInvoicesTotal.toString())}
                    </td>
                    <td colSpan="2"></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>

        {/* Grand Total Section */}
        <div className="bg-gray-100 rounded-lg p-4 mb-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-800">Grand Total</h3>
            <div className="text-xl font-bold text-indigo-700">
              {formatNumberWithCommas(grandTotal.toString())}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-2 text-sm text-gray-600">
            <div>Party Clearance: {formatNumberWithCommas(partyClearanceTotal.toString())}</div>
            <div>Third Party: {formatNumberWithCommas(thirdPartyTotal.toString())}</div>
            <div>Other Invoices: {formatNumberWithCommas(otherInvoicesTotal.toString())}</div>
          </div>
        </div>
      </div>

      {/* Edit/Add Popup */}
      {isPopupOpen && selectedRowIndex !== null && !isEditDisabled && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-7xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                {isAddingNew ? "Add New Charge" : "Edit Charge"} -{" "}
                {selectedChargeType === 'partyClearance' ? 'Party Clearance' :
                  selectedChargeType === 'thirdParty' ? 'Third Party' :
                    'Other Invoices'}
              </h3>
              <button
                onClick={handleCancelEdit}
                className="text-gray-400 hover:text-gray-500"
              >
                <FiX className="h-6 w-6" />
              </button>
            </div>

            {/* Party Clearance Form */}
            {selectedChargeType === 'partyClearance' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type <span className="text-red-500">*</span>
                      {formErrors.calculation_type && (
                        <span className="ml-2 text-red-500 text-xs">{formErrors.calculation_type}</span>
                      )}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        className={`w-full border rounded-md p-2 pl-3 pr-8 text-sm focus:ring-indigo-500 focus:border-indigo-500 ${formErrors.calculation_type ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="Search or select type..."
                        value={getCurrentRowData()?.calTypeDescription || ""}
                        onChange={(e) => handleInputChange(selectedRowIndex, "calTypeDescription", e.target.value, 'charges')}
                        onFocus={() => setIsDropdownOpen(true)}
                      />
                      <button
                        className="absolute inset-y-0 right-0 flex items-center pr-2"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      >
                        <FiChevronDown className="h-5 w-5 text-gray-400" />
                      </button>
                    </div>
                    {isDropdownOpen && (
                      <div className="absolute z-10 mt-1 w-full max-w-md bg-white shadow-lg max-h-60 rounded-md py-1 text-sm border border-gray-200 overflow-auto">
                        {attachmentDescription
                          .filter((item) =>
                            item.Description.toLowerCase().includes(
                              (getCurrentRowData()?.calTypeDescription || "").toLowerCase()
                            )
                          )
                          .map((item, index) => (
                            <div
                              key={index}
                              className={`px-3 py-2 cursor-pointer hover:bg-indigo-50 ${getCurrentRowData()?.calculation_type === item.CalculationType
                                ? "bg-indigo-100 text-indigo-800"
                                : ""
                                }`}
                              onClick={() => {
                                handleInputChange(selectedRowIndex, "calculation_type", item.CalculationType, 'charges');
                                handleInputChange(selectedRowIndex, "calTypeDescription", item.Description, 'charges');
                                setIsDropdownOpen(false);
                              }}
                            >
                              {item.Description}
                            </div>
                          ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Amount <span className="text-red-500">*</span>
                      {formErrors.amount && (
                        <span className="ml-2 text-red-500 text-xs">{formErrors.amount}</span>
                      )}
                    </label>
                    <input
                      type="text"
                      className={`w-full border rounded-md p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500 ${formErrors.amount ? 'border-red-500' : 'border-gray-300'}`}
                      value={formatAmountWithCommasOnly(getCurrentRowData()?.amount)}
                      onChange={(e) => {
                        const rawValue = e.target.value.replace(/,/g, '');
                        // Allow only numbers
                        if (rawValue === '' || /^\d*$/.test(rawValue)) {
                          handleInputChange(selectedRowIndex, "amount", rawValue, 'charges');
                        }
                      }}
                      onBlur={(e) => {
                        // Format with commas on blur
                        const rawValue = e.target.value.replace(/,/g, '');
                        if (rawValue === '') {
                          handleInputChange(selectedRowIndex, "amount", "0", 'charges');
                        }
                      }}
                    />
                   
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Invoice No <span className="text-red-500">*</span>
                      {formErrors.invoice_no && (
                        <span className="ml-2 text-red-500 text-xs">{formErrors.invoice_no}</span>
                      )}
                    </label>
                    <input
                      type="text"
                      className={`w-full border rounded-md p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500 ${formErrors.invoice_no ? 'border-red-500' : 'border-gray-300'}`}
                      value={getCurrentRowData()?.invoice_no || ""}
                      onChange={(e) => handleInputChange(selectedRowIndex, "invoice_no", e.target.value, 'charges')}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                      value={
                        getCurrentRowData()?.invoice_date
                          ? new Date(getCurrentRowData().invoice_date).toISOString().split('T')[0]
                          : ""
                      }
                      onChange={(e) => handleInputChange(selectedRowIndex, "invoice_date", e.target.value, 'charges')}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Vehicle No
                      {formErrors.vehicle_no && (
                        <span className="ml-2 text-red-500 text-xs">{formErrors.vehicle_no}</span>
                      )}
                    </label>
                    <input
                      type="text"
                      className={`w-full border rounded-md p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500 ${formErrors.vehicle_no ? 'border-red-500' : 'border-gray-300'}`}
                      value={getCurrentRowData()?.vehicle_no || ""}
                      onChange={(e) => handleInputChange(selectedRowIndex, "vehicle_no", e.target.value, 'charges')}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Attachment
                  </label>
                  <div
                    ref={dropZoneRef}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setDragActive(false);
                      if (e.dataTransfer.files?.[0]) {
                        handleFile(e.dataTransfer.files[0], 'charges');
                      }
                    }}
                    className={`border-2 border-dashed rounded-md p-4 text-center ${dragActive ? "border-indigo-600 bg-indigo-50" : "border-gray-300"
                      }`}
                  >
                    {!getCurrentAttachment(selectedRowIndex, getCurrentRowData(), 'charges') ? (
                      <div className="space-y-2">
                        <div className="flex justify-center">
                          <FiUpload className="h-10 w-10 text-gray-400" />
                        </div>
                        <p className="text-sm text-gray-600">
                          Drag and drop files here or{" "}
                          <label
                            htmlFor="file-upload"
                            className="text-indigo-600 hover:text-indigo-800 cursor-pointer font-medium"
                          >
                            browse
                          </label>
                        </p>
                        {/* <div className="flex justify-center">
                          <button
                            onClick={openCameraModal}
                            className="mt-2 inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                          >
                            <FiCamera className="mr-2 h-4 w-4" />
                            Capture Photo
                          </button>
                        </div> */}
                        <p className="text-xs text-gray-500">(Max file size: 5MB)</p>
                        <input
                          id="file-upload"
                          type="file"
                          className="hidden"
                          ref={fileInputRef}
                          onChange={(e) => handleFileChange(e, 'charges')}
                          accept="image/*,application/pdf"
                        />
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            {getCurrentAttachment(selectedRowIndex, getCurrentRowData(), 'charges').preview && (
                              <img
                                src={getCurrentAttachment(selectedRowIndex, getCurrentRowData(), 'charges').preview}
                                alt="Preview"
                                className="h-12 w-12 object-cover rounded"
                              />
                            )}
                            <div className="text-left">
                              <p className="text-sm font-medium text-gray-900 truncate max-w-xs">
                                {getCurrentAttachment(selectedRowIndex, getCurrentRowData(), 'charges').name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {getCurrentAttachment(selectedRowIndex, getCurrentRowData(), 'charges').size ?
                                  `${(getCurrentAttachment(selectedRowIndex, getCurrentRowData(), 'charges').size / 1024).toFixed(2)} KB` :
                                  "Existing attachment"}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              if (getCurrentAttachment(selectedRowIndex, getCurrentRowData(), 'charges')?.preview?.startsWith('blob:')) {
                                cleanupFilePreview(getCurrentAttachment(selectedRowIndex, getCurrentRowData(), 'charges'));
                              }
                              setSelectedFiles((prev) => {
                                const newFiles = [...prev];
                                newFiles[selectedRowIndex] = null;
                                return newFiles;
                              });
                              setExistingAttachments(prev => {
                                const newAttachments = { ...prev };
                                delete newAttachments[selectedRowIndex];
                                return newAttachments;
                              });
                            }}
                            className="text-red-600 hover:text-red-800 p-1"
                          >
                            <FiTrash2 className="h-5 w-5" />
                          </button>
                        </div>
                        <button
                          onClick={() => handlePreviewClick(
                            getCurrentAttachment(selectedRowIndex, getCurrentRowData(), 'charges'),
                            null,
                            getCurrentRowData()?.serialNo
                          )}
                          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-1.5 rounded-md text-sm"
                        >
                          Preview
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Third Party Form */}
            {selectedChargeType === 'thirdParty' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2 company-dropdown-container">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Third Party company <span className="text-red-500">*</span>
                      {formErrors.company && (
                        <span className="ml-2 text-red-500 text-xs">{formErrors.company}</span>
                      )}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        className={`w-full border rounded-md p-2 pl-3 pr-8 text-sm focus:ring-indigo-500 focus:border-indigo-500 ${formErrors.company ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder={isLoadingCompanies ? "Loading companies..." : "Search or select company..."}
                        value={thirdPartyCompanySearch}
                        onChange={(e) => setThirdPartyCompanySearch(e.target.value)}
                        onFocus={() => !isLoadingCompanies && setIsCompanyDropdownOpen(true)}
                        disabled={isLoadingCompanies}
                      />
                      <button
                        className="absolute inset-y-0 right-0 flex items-center pr-2"
                        onClick={() => !isLoadingCompanies && setIsCompanyDropdownOpen(!isCompanyDropdownOpen)}
                        disabled={isLoadingCompanies}
                        type="button"
                      >
                        <FiChevronDown className={`h-5 w-5 ${isLoadingCompanies ? 'text-gray-300' : 'text-gray-400'} transition-transform ${isCompanyDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>
                    </div>
                    
                    {isCompanyDropdownOpen && !isLoadingCompanies && (
                      <div className="absolute z-50 mt-1 w-full max-w-md bg-white shadow-lg max-h-60 rounded-md py-1 text-sm border border-gray-200 overflow-auto">
                        {companyList
                          .filter((company) => {
                            if (!thirdPartyCompanySearch.trim()) {
                              return true;
                            }
                            return company.Com_Name.toLowerCase().includes(thirdPartyCompanySearch.toLowerCase());
                          })
                          .map((company) => {
                            const mainCompanyCode = (localStorage.getItem('comid') || '').toString();
                            const companyIdStr = company.Com_ID?.toString() || '';
                            const isMainCompany = mainCompanyCode !== '' && companyIdStr === mainCompanyCode;
                            const isSelected = getCurrentRowData()?.thirdPartyDetails?.company?.toString() === companyIdStr;

                            return (
                              <div
                                key={company.Com_ID}
                                className={`px-3 py-2 ${isMainCompany ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-indigo-50'} ${isSelected ? 'bg-indigo-100 text-indigo-800' : ''}`}
                                onClick={() => {
                                  if (isMainCompany) return; // disable selection for main company in Third Party form
                                  handleThirdPartyDetailChange("company", company.Com_ID);
                                  setThirdPartyCompanySearch(company.Com_Name);
                                  setIsCompanyDropdownOpen(false);
                                }}
                                title={isMainCompany ? 'Main company cannot be selected here' : company.Com_Name}
                              >
                                {company.Com_Name}{isMainCompany ? ' (Main company)' : ''}
                              </div>
                            );
                          })}

                        {companyList.filter((company) => {
                          if (!thirdPartyCompanySearch.trim()) return false;
                          return company.Com_Name.toLowerCase().includes(thirdPartyCompanySearch.toLowerCase());
                        }).length === 0 && thirdPartyCompanySearch.trim() !== "" && (
                          <div className="px-3 py-2 text-gray-500 text-center">
                            No companies found
                          </div>
                        )}
                      </div>
                    )}
                    
                    {getCurrentRowData()?.thirdPartyDetails?.company && !isCompanyDropdownOpen && (
                      <p className="text-xs text-green-600 mt-1 flex items-center">
                        <span className="mr-1">✓</span>
                        Selected: {companyList.find(c => c.Com_ID === getCurrentRowData()?.thirdPartyDetails?.company)?.Com_Name || getCurrentRowData()?.thirdPartyDetails?.company}
                      </p>
                    )}
                    
                    {isLoadingCompanies && (
                      <div className="flex items-center mt-1">
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-indigo-600 mr-2"></div>
                        <p className="text-xs text-gray-500">Loading company list...</p>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Invoice No <span className="text-red-500">*</span>
                      {formErrors.invoice_no && (
                        <span className="ml-2 text-red-500 text-xs">{formErrors.invoice_no}</span>
                      )}
                    </label>
                    <input
                      type="text"
                      className={`w-full border rounded-md p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500 ${formErrors.invoice_no ? 'border-red-500' : 'border-gray-300'}`}
                      value={getCurrentRowData()?.invoice_no || ""}
                      onChange={(e) => handleInputChange(selectedRowIndex, "invoice_no", e.target.value, 'thirdParty')}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date <span className="text-red-500">*</span>
                      {formErrors.invoice_date && (
                        <span className="ml-2 text-red-500 text-xs">{formErrors.invoice_date}</span>
                      )}
                    </label>
                    <input
                      type="date"
                      className={`w-full border rounded-md p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500 ${formErrors.invoice_date ? 'border-red-500' : 'border-gray-300'}`}
                      value={
                        getCurrentRowData()?.invoice_date
                          ? new Date(getCurrentRowData().invoice_date).toISOString().split('T')[0]
                          : ""
                      }
                      onChange={(e) => handleInputChange(selectedRowIndex, "invoice_date", e.target.value, 'thirdParty')}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Charges <span className="text-red-500">*</span>
                      {formErrors.charges && (
                        <span className="ml-2 text-red-500 text-xs">{formErrors.charges}</span>
                      )}
                    </label>
                    <span className="text-sm font-medium">
                      Total: {formatAmountWithCommasOnly(calculateThirdPartyTotal(getCurrentRowData()?.thirdPartyDetails?.rows).toString())}
                    </span>
                  </div>

                  <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
                    <table className="min-w-full divide-y divide-gray-300">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" style={{width: '12%'}} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                          <th scope="col" style={{width: '12%'}} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                          <th scope="col" style={{width: '14%'}} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{getTaxTypeDescription(currentThirdPartyRow.type) ? `${getTaxTypeDescription(currentThirdPartyRow.type)} PERCENTAGE` : 'Percentage'}</th>
                          <th scope="col" style={{width: '12%'}} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{getTaxTypeDescription(currentThirdPartyRow.type) ? `${getTaxTypeDescription(currentThirdPartyRow.type)} Amount` : 'Tax Amount'}</th>
                          <th scope="col" style={{width: '12%'}} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                          <th scope="col" style={{width: '24%'}} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remarks</th>
                          <th scope="col" style={{width: '8%'}} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                          <th scope="col" style={{width: '8%'}} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {getCurrentRowData()?.thirdPartyDetails?.rows?.map((row, index) => (
                          <tr key={row.id || index}>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-800">{getTaxTypeDescription(row.type)}</td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-800">{formatAmountWithCommasOnly(row.amount)}</td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-800">{formatAmountWithCommasOnly(row.discount || "0")}</td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-800">{formatAmountWithCommasOnly(row.total)}</td>
                            
                            <td className="px-3 py-2 text-sm text-gray-800">
                              {row.remarks || "-"}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                              {row.imageFile ? (
                                <div className="flex items-center space-x-2">
                                  <img
                                    src={row.imageFile.preview || URL.createObjectURL(row.imageFile)}
                                    alt="Charge attachment"
                                    className="h-8 w-8 object-cover rounded"
                                  />
                                  <button
                                    onClick={() => handlePreviewChargeImage(row.imageFile)}
                                    className="text-indigo-600 hover:text-indigo-800 text-xs"
                                  >
                                    View
                                  </button>
                                </div>
                              ) : (
                                <span className="text-gray-400">No image</span>
                              )}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                              <button
                                onClick={() => handleRemoveThirdPartyCharge(index)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <FiTrash2 className="h-5 w-5" />
                              </button>
                            </td>
                          </tr>
                        ))}

                        {/* Add New Charge Row */}
                        <tr className="bg-gray-50">
                          <td className="px-3 py-2">
                            <select
                              value={currentThirdPartyRow.type}
                              onChange={(e) => setCurrentThirdPartyRow({ ...currentThirdPartyRow, type: e.target.value })}
                              className={`w-40 rounded-md border shadow-sm px-2 py-2 bg-white placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${validationErrors.type ? 'border-red-500' : 'border-gray-300'}`}
                            >
                              <option value="">Select Type</option>
                              <option value="V" disabled={usedTypesForCurrentRow.includes('V')}>VAT</option>
                              <option value="S" disabled={usedTypesForCurrentRow.includes('S')}>SVT</option>
                              <option value="C" disabled={usedTypesForCurrentRow.includes('C')}>SSCL</option>
                            </select>
                            {validationErrors.type && (
                              <span className="text-red-500 text-xs">{validationErrors.type}</span>
                            )}
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="text"
                              value={formatAmountWithCommasOnly(currentThirdPartyRow.amount)}
                              onChange={(e) => {
                                const rawValue = e.target.value.replace(/,/g, '');
                                if (rawValue === '' || /^\d*$/.test(rawValue)) {
                                  const pct = parseFloat(currentThirdPartyRow.percentage || 0) || 0;
                                  const amountNum = parseFloat(rawValue || 0) || 0;
                                  const vatAmt = Math.max(0, (amountNum * (pct / 100)));
                                  const newTotal = amountNum + vatAmt;
                                  setCurrentThirdPartyRow({ ...currentThirdPartyRow, amount: rawValue, vatAmount: vatAmt.toString(), total: newTotal.toString() });
                                  setValidationErrors(prev => {
                                    const newErrors = { ...prev };
                                    delete newErrors.amount;
                                    return newErrors;
                                  });
                                }
                              }}
                              className={`w-40 rounded-md border shadow-sm px-2 py-2 text-right bg-white placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${validationErrors.amount ? 'border-red-500' : 'border-gray-300'}`}
                              placeholder="Amount"
                            />
                            {validationErrors.amount && (
                              <span className="text-red-500 text-xs">{validationErrors.amount}</span>
                            )}
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="text"
                              value={currentThirdPartyRow.percentage}
                              onChange={(e) => {
                                const rawValue = e.target.value.replace(/,/g, '');
                                if (rawValue === '' || /^\d*\.?\d*$/.test(rawValue)) {
                                  const amountNum = parseFloat(currentThirdPartyRow.amount || 0) || 0;
                                  const pct = parseFloat(rawValue || 0) || 0;
                                  const vatAmt = Math.max(0, (amountNum * (pct / 100)));
                                  const newTotal = amountNum + vatAmt;
                                  setCurrentThirdPartyRow({ ...currentThirdPartyRow, percentage: rawValue, vatAmount: vatAmt.toString(), total: newTotal.toString() });
                                  setValidationErrors(prev => {
                                    const newErrors = { ...prev };
                                    delete newErrors.percentage;
                                    return newErrors;
                                  });
                                }
                              }}
                              className={`w-28 rounded-md border shadow-sm px-2 py-2 text-right bg-white placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${validationErrors.percentage ? 'border-red-500' : 'border-gray-300'}`}
                              placeholder={getTaxTypeDescription(currentThirdPartyRow.type) ? `${getTaxTypeDescription(currentThirdPartyRow.type)} %` : 'Percentage'}
                            />
                            {validationErrors.percentage && (
                              <span className="text-red-500 text-xs">{validationErrors.percentage}</span>
                            )}
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="text"
                              value={formatAmountWithCommasOnly(currentThirdPartyRow.vatAmount || '0')}
                              readOnly
                              className={`w-36 rounded-md border shadow-sm px-2 py-2 text-right bg-white placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${validationErrors.vatAmount ? 'border-red-500' : 'border-gray-300'}`}
                              placeholder="Tax Amount"
                            />
                            {validationErrors.vatAmount && (
                              <span className="text-red-500 text-xs">{validationErrors.vatAmount}</span>
                            )}
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="text"
                              value={formatAmountWithCommasOnly(currentThirdPartyRow.total)}
                              readOnly
                              className={`w-36 rounded-md border shadow-sm px-2 py-2 text-right bg-white placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${validationErrors.total ? 'border-red-500' : 'border-gray-300'}`}
                              placeholder="Total"
                            />
                            {validationErrors.total && (
                              <span className="text-red-500 text-xs">{validationErrors.total}</span>
                            )}
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="text"
                              value={currentThirdPartyRow.remarks}
                              onChange={(e) => setCurrentThirdPartyRow({ ...currentThirdPartyRow, remarks: e.target.value })}
                              className="block w-full rounded-md border-gray-300 shadow-sm px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white placeholder-gray-400"
                              placeholder="Remarks"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <div className="flex flex-col space-y-2">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files[0];
                                  if (file) {
                                    if (file.size > MAX_FILE_SIZE) {
                                      showErrorToast("Error", "File size exceeds 5MB limit");
                                      return;
                                    }
                                    // Create proper file object with preview
                                    const fileWithPreview = {
                                      file: file,
                                      preview: URL.createObjectURL(file),
                                      name: file.name,
                                      size: file.size
                                    };
                                    setCurrentThirdPartyRow({ ...currentThirdPartyRow, imageFile: fileWithPreview });
                                  }
                                }}
                                className="block w-full text-xs text-gray-500 file:mr-4 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                              />
                              {currentThirdPartyRow.imageFile && (
                                <div className="flex items-center space-x-2">
                                  <img
                                    src={currentThirdPartyRow.imageFile.preview}
                                    alt="Preview"
                                    className="h-6 w-6 object-cover rounded"
                                  />
                                  <span className="text-xs text-gray-600 truncate max-w-20">
                                    {currentThirdPartyRow.imageFile.name}
                                  </span>
                                  <button
                                    onClick={() => setCurrentThirdPartyRow({ ...currentThirdPartyRow, imageFile: null })}
                                    className="text-red-500 hover:text-red-700"
                                  >
                                    <FiX className="h-3 w-3" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-3 py-2">
                            <button
                              onClick={handleAddThirdPartyCharge}
                              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                              Add
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Other Invoices Form */}
            {selectedChargeType === 'otherInvoices' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company (Optional)
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded-md p-2 pl-3 pr-8 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder={isLoadingCompanies ? "Loading companies..." : "Search or select company..."}
                        value={otherInvoiceCompanySearch}
                        onChange={(e) => setOtherInvoiceCompanySearch(e.target.value)}
                        onFocus={() => !isLoadingCompanies && setIsCompanyDropdownOpen(true)}
                        disabled={isLoadingCompanies}
                      />
                      <button
                        className="absolute inset-y-0 right-0 flex items-center pr-2"
                        onClick={() => !isLoadingCompanies && setIsCompanyDropdownOpen(!isCompanyDropdownOpen)}
                        disabled={isLoadingCompanies}
                        type="button"
                      >
                        <FiChevronDown className={`h-5 w-5 ${isLoadingCompanies ? 'text-gray-300' : 'text-gray-400'} transition-transform ${isCompanyDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>
                    </div>
                    
                    {isCompanyDropdownOpen && !isLoadingCompanies && (
                      <div className="absolute z-10 mt-1 w-full max-w-md bg-white shadow-lg max-h-60 rounded-md py-1 text-sm border border-gray-200 overflow-auto">
                        {companyList
                          .filter((company) => {
                            if (!otherInvoiceCompanySearch.trim()) {
                              return true;
                            }
                            const searchTerm = otherInvoiceCompanySearch.toLowerCase();
                            return (
                              company.Com_Name.toLowerCase().includes(searchTerm) ||
                              company.Com_ID.toString().toLowerCase().includes(searchTerm)
                            );
                          })
                          .map((company) => (
                            <div
                              key={company.Com_ID}
                              className={`px-3 py-2 cursor-pointer hover:bg-indigo-50 ${
                                getCurrentRowData()?.thirdPartyDetails?.company === company.Com_ID
                                  ? "bg-indigo-100 text-indigo-800"
                                  : ""
                              }`}
                              onClick={() => {
                                setOtherInvoicesRows(prevRows => {
                                  const newRows = [...prevRows];
                                  if (newRows[selectedRowIndex]) {
                                    newRows[selectedRowIndex] = {
                                      ...newRows[selectedRowIndex],
                                      thirdPartyDetails: {
                                        ...newRows[selectedRowIndex].thirdPartyDetails,
                                        company: company.Com_ID
                                      }
                                    };
                                  }
                                    return newRows;
                                  });
                                  setOtherInvoiceCompanySearch(company.Com_Name);
                                  setIsCompanyDropdownOpen(false);
                                }}
                              >
                                {company.Com_Name} ({company.Com_ID})
                              </div>
                            ))}
                        
                        {companyList.filter((company) => {
                          if (!otherInvoiceCompanySearch.trim()) return false;
                          const searchTerm = otherInvoiceCompanySearch.toLowerCase();
                          return (
                            company.Com_Name.toLowerCase().includes(searchTerm) ||
                            company.Com_ID.toString().toLowerCase().includes(searchTerm)
                          );
                        }).length === 0 && otherInvoiceCompanySearch.trim() !== "" && (
                          <div className="px-3 py-2 text-gray-500 text-center">
                            No companies found
                          </div>
                        )}
                      </div>
                    )}
                    
                    {getCurrentRowData()?.thirdPartyDetails?.company && (
                      <p className="text-xs text-green-600 mt-1">
                        Selected: {companyList.find(c => c.Com_ID === getCurrentRowData()?.thirdPartyDetails?.company)?.Com_Name || getCurrentRowData()?.thirdPartyDetails?.company}
                      </p>
                    )}
                    
                    {isLoadingCompanies && (
                      <div className="flex items-center mt-1">
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-indigo-600 mr-2"></div>
                        <p className="text-xs text-gray-500">Loading company list...</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Invoice No <span className="text-red-500">*</span>
                      {formErrors.invoice_no && (
                        <span className="ml-2 text-red-500 text-xs">{formErrors.invoice_no}</span>
                      )}
                    </label>
                    <input
                      type="text"
                      className={`w-full border rounded-md p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500 ${formErrors.invoice_no ? 'border-red-500' : 'border-gray-300'}`}
                      value={getCurrentRowData()?.invoice_no || ""}
                      onChange={(e) => {
                        const newValue = e.target.value;
                        setOtherInvoicesRows((prevRows) => {
                          const newRows = [...prevRows];
                          if (newRows[selectedRowIndex]) {
                            newRows[selectedRowIndex] = {
                              ...newRows[selectedRowIndex],
                              invoice_no: newValue
                            };
                          }
                          return newRows;
                        });
                        // Clear validation error
                        setFormErrors(prev => {
                          const newErrors = { ...prev };
                          delete newErrors.invoice_no;
                          return newErrors;
                        });
                      }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date <span className="text-red-500">*</span>
                      {formErrors.invoice_date && (
                        <span className="ml-2 text-red-500 text-xs">{formErrors.invoice_date}</span>
                      )}
                    </label>
                    <input
                      type="date"
                      className={`w-full border rounded-md p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500 ${formErrors.invoice_date ? 'border-red-500' : 'border-gray-300'}`}
                      value={
                        getCurrentRowData()?.invoice_date
                          ? new Date(getCurrentRowData().invoice_date).toISOString().split('T')[0]
                          : ""
                      }
                      onChange={(e) => {
                        const newValue = e.target.value;
                        setOtherInvoicesRows((prevRows) => {
                          const newRows = [...prevRows];
                          if (newRows[selectedRowIndex]) {
                            newRows[selectedRowIndex] = {
                              ...newRows[selectedRowIndex],
                              invoice_date: newValue
                            };
                          }
                          return newRows;
                        });
                        // Clear validation error
                        setFormErrors(prev => {
                          const newErrors = { ...prev };
                          delete newErrors.invoice_date;
                          return newErrors;
                        });
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Charges <span className="text-red-500">*</span>
                      {formErrors.charges && (
                        <span className="ml-2 text-red-500 text-xs">{formErrors.charges}</span>
                      )}
                    </label>
                    <span className="text-sm font-medium">
                      Total: {formatAmountWithCommasOnly(calculateThirdPartyTotal(getCurrentRowData()?.thirdPartyDetails?.rows).toString())}
                    </span>
                  </div>

                  <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
                    <table className="min-w-full divide-y divide-gray-300 table-fixed">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" style={{width: '12%'}} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                          <th scope="col" style={{width: '12%'}} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                          <th scope="col" style={{width: '12%'}} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{getTaxTypeDescription(currentThirdPartyRow.type) ? `${getTaxTypeDescription(currentThirdPartyRow.type)} PERCENTAGE` : 'Percentage'}</th>
                          <th scope="col" style={{width: '12%'}} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{getTaxTypeDescription(currentThirdPartyRow.type) ? `${getTaxTypeDescription(currentThirdPartyRow.type)} AMOUNT` : 'Tax Amount'}</th>
                          <th scope="col" style={{width: '12%'}} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                          <th scope="col" style={{width: '28%'}} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remarks</th>
                          <th scope="col" style={{width: '12%'}} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                          <th scope="col" style={{width: '12%'}} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {getCurrentRowData()?.thirdPartyDetails?.rows?.map((row, index) => (
                          <tr key={row.id || index}>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-800">{getTaxTypeDescription(row.type)}</td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-800">{formatAmountWithCommasOnly(row.amount)}</td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-800">{row.percentage ?? row.discount ?? ""}</td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-800">{formatAmountWithCommasOnly(row.vatAmount ?? ((parseFloat(row.total||0) - parseFloat(row.amount||0)).toString()))}</td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-800">{formatAmountWithCommasOnly(row.total)}</td>
                            <td className="px-3 py-2 text-sm text-gray-800">{row.remarks || "-"}</td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                              {row.imageFile ? (
                                <div className="flex items-center space-x-2">
                                  <img
                                    src={row.imageFile.preview || URL.createObjectURL(row.imageFile)}
                                    alt="Charge attachment"
                                    className="h-8 w-8 object-cover rounded"
                                  />
                                  <button
                                    onClick={() => handlePreviewChargeImage(row.imageFile)}
                                    className="text-indigo-600 hover:text-indigo-800 text-xs"
                                  >
                                    View
                                  </button>
                                </div>
                              ) : (
                                <span className="text-gray-400">No image</span>
                              )}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                              <button
                                onClick={() => {
                                  setOtherInvoicesRows(prevRows => {
                                    const newRows = [...prevRows];
                                    const currentRow = newRows[selectedRowIndex];
                                    const updatedThirdPartyRows = [ ...(currentRow.thirdPartyDetails?.rows || []) ];
                                    updatedThirdPartyRows.splice(index, 1);
                                    newRows[selectedRowIndex] = {
                                      ...currentRow,
                                      thirdPartyDetails: {
                                        ...currentRow.thirdPartyDetails,
                                        rows: updatedThirdPartyRows
                                      }
                                    };
                                    return newRows;
                                  });
                                }}
                                className="text-red-600 hover:text-red-800"
                              >
                                <FiTrash2 className="h-5 w-5" />
                              </button>
                            </td>
                          </tr>
                        ))}

                        {/* Add New Charge Row */}
                        <tr className="bg-gray-50">
                          <td className="px-3 py-2">
                            <select
                              value={currentThirdPartyRow.type}
                              onChange={(e) => setCurrentThirdPartyRow({ ...currentThirdPartyRow, type: e.target.value })}
                              className={`w-40 rounded-md border shadow-sm px-2 py-2 bg-white placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${validationErrors.type ? 'border-red-500' : 'border-gray-300'}`}
                            >
                              <option value="">Select Type</option>
                              <option value="V" disabled={usedTypesForCurrentRow.includes('V')}>VAT</option>
                              <option value="S" disabled={usedTypesForCurrentRow.includes('S')}>SVT</option>
                              <option value="C" disabled={usedTypesForCurrentRow.includes('C')}>SSCL</option>
                              <option value="O" disabled={usedTypesForCurrentRow.includes('O')}>Other</option>
                            </select>
                            {validationErrors.type && (
                              <span className="text-red-500 text-xs">{validationErrors.type}</span>
                            )}
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="text"
                              value={formatAmountWithCommasOnly(currentThirdPartyRow.amount)}
                              onChange={(e) => {
                                const rawValue = e.target.value.replace(/,/g, '');
                                if (rawValue === '' || /^\d*$/.test(rawValue)) {
                                  const pct = parseFloat(currentThirdPartyRow.percentage || 0) || 0;
                                  const amountNum = parseFloat(rawValue || 0) || 0;
                                  const vatAmt = Math.max(0, (amountNum * (pct / 100)));
                                  const newTotal = amountNum + vatAmt;
                                  setCurrentThirdPartyRow({ ...currentThirdPartyRow, amount: rawValue, vatAmount: vatAmt.toString(), total: newTotal.toString() });
                                  setValidationErrors(prev => {
                                    const newErrors = { ...prev };
                                    delete newErrors.amount;
                                    return newErrors;
                                  });
                                }
                              }}
                              className={`w-40 rounded-md border shadow-sm px-2 py-2 text-right bg-white placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${validationErrors.amount ? 'border-red-500' : 'border-gray-300'}`}
                              placeholder="Amount"
                            />
                            {validationErrors.amount && (
                              <span className="text-red-500 text-xs">{validationErrors.amount}</span>
                            )}
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="text"
                              value={currentThirdPartyRow.percentage}
                              onChange={(e) => {
                                const rawValue = e.target.value.replace(/,/g, '');
                                if (rawValue === '' || /^\d*\.?\d*$/.test(rawValue)) {
                                  const amountNum = parseFloat(currentThirdPartyRow.amount || 0) || 0;
                                  const pct = parseFloat(rawValue || 0) || 0;
                                  const vatAmt = Math.max(0, (amountNum * (pct / 100)));
                                  const newTotal = amountNum + vatAmt;
                                  setCurrentThirdPartyRow({ ...currentThirdPartyRow, percentage: rawValue, vatAmount: vatAmt.toString(), total: newTotal.toString() });
                                  setValidationErrors(prev => {
                                    const newErrors = { ...prev };
                                    delete newErrors.percentage;
                                    return newErrors;
                                  });
                                }
                              }}
                              className={`w-28 rounded-md border shadow-sm px-2 py-2 text-right bg-white placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${validationErrors.percentage ? 'border-red-500' : 'border-gray-300'}`}
                              placeholder={getTaxTypeDescription(currentThirdPartyRow.type) ? `${getTaxTypeDescription(currentThirdPartyRow.type)} %` : 'Percentage'}
                            />
                            {validationErrors.percentage && (
                              <span className="text-red-500 text-xs">{validationErrors.percentage}</span>
                            )}
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="text"
                              value={formatAmountWithCommasOnly(currentThirdPartyRow.vatAmount || '0')}
                              readOnly
                              className={`w-36 rounded-md border shadow-sm px-2 py-2 text-right bg-white placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${validationErrors.vatAmount ? 'border-red-500' : 'border-gray-300'}`}
                              placeholder="Tax Amount"
                            />
                            {validationErrors.vatAmount && (
                              <span className="text-red-500 text-xs">{validationErrors.vatAmount}</span>
                            )}
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="text"
                              value={formatAmountWithCommasOnly(currentThirdPartyRow.total)}
                              readOnly
                              className={`w-36 rounded-md border shadow-sm px-2 py-2 text-right bg-white placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${validationErrors.total ? 'border-red-500' : 'border-gray-300'}`}
                              placeholder="Total"
                            />
                            {validationErrors.total && (
                              <span className="text-red-500 text-xs">{validationErrors.total}</span>
                            )}
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="text"
                              value={currentThirdPartyRow.remarks}
                              onChange={(e) => setCurrentThirdPartyRow({ ...currentThirdPartyRow, remarks: e.target.value })}
                              className="block w-full rounded-md border-gray-300 shadow-sm px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white placeholder-gray-400"
                              placeholder="Remarks"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <div className="flex flex-col space-y-2">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files[0];
                                  if (file) {
                                    if (file.size > MAX_FILE_SIZE) {
                                      showErrorToast("Error", "File size exceeds 5MB limit");
                                      return;
                                    }
                                    // Create proper file object with preview
                                    const fileWithPreview = {
                                      file: file,
                                      preview: URL.createObjectURL(file),
                                      name: file.name,
                                      size: file.size
                                    };
                                    setCurrentThirdPartyRow({ ...currentThirdPartyRow, imageFile: fileWithPreview });
                                  }
                                }}
                                className="block w-full text-xs text-gray-500 file:mr-4 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                              />
                              {currentThirdPartyRow.imageFile && (
                                <div className="flex items-center space-x-2">
                                  <img
                                    src={currentThirdPartyRow.imageFile.preview}
                                    alt="Preview"
                                    className="h-6 w-6 object-cover rounded"
                                  />
                                  <span className="text-xs text-gray-600 truncate max-w-20">
                                    {currentThirdPartyRow.imageFile.name}
                                  </span>
                                  <button
                                    onClick={() => setCurrentThirdPartyRow({ ...currentThirdPartyRow, imageFile: null })}
                                    className="text-red-500 hover:text-red-700"
                                  >
                                    <FiX className="h-3 w-3" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-3 py-2">
                            <button
                              onClick={() => {
                                if (!currentThirdPartyRow.type || !currentThirdPartyRow.amount || !currentThirdPartyRow.total) {
                                  setValidationErrors({
                                    type: !currentThirdPartyRow.type ? "Type is required" : null,
                                    amount: !currentThirdPartyRow.amount ? "Amount is required" : null,
                                    total: !currentThirdPartyRow.total ? "Total is required" : null
                                  });
                                  showErrorToast("Validation Error", "Please fill all required fields correctly");
                                  return;
                                }

                                setOtherInvoicesRows(prevRows => {
                                  const newRows = [...prevRows];
                                  const currentRow = newRows[selectedRowIndex];

                                  const updatedThirdPartyRows = [
                                    ...(currentRow.thirdPartyDetails?.rows || []),
                                    {
                                      ...currentThirdPartyRow,
                                      id: `charge-${Date.now()}`
                                    }
                                  ];

                                  newRows[selectedRowIndex] = {
                                    ...currentRow,
                                    thirdPartyDetails: {
                                      ...currentRow.thirdPartyDetails,
                                      rows: updatedThirdPartyRows
                                    }
                                  };

                                  return newRows;
                                });

                                // Reset form including image (include discount)
                                setCurrentThirdPartyRow({
                                  type: "",
                                  discount: "",
                                  percentage: "",
                                  vatAmount: "",
                                  amount: "",
                                  total: "",
                                  remarks: "",
                                  imageFile: null
                                });
                                setValidationErrors({});
                              }}
                              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                              Add
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleCancelEdit}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={isSaving}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? "Saving..." : (isAddingNew ? "Add Charge" : "Save Changes")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Updated Camera Modal - Auto-starts camera */}
      {isCameraOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
          <div className="bg-black rounded-lg overflow-hidden w-full max-w-2xl mx-4">
            <div className="p-4 bg-gray-900 border-b border-gray-800 flex justify-between items-center">
              <h3 className="text-white font-medium">Capture Photo</h3>
              <button
                onClick={() => {
                  stopCamera();
                  setIsCameraOpen(false);
                }}
                className="text-gray-300 hover:text-white"
              >
                <FiX className="h-6 w-6" />
              </button>
            </div>
            
            <div className="relative">
              <div className="aspect-video bg-black relative overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-contain"
                />
                {!cameraStreamRef.current && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-white text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                      <p>Starting camera...</p>
                    </div>
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="border-2 border-white border-opacity-50 rounded-lg w-64 h-64"></div>
                </div>
              </div>
              
              <canvas ref={canvasRef} className="hidden" />
              
              <div className="p-4 bg-gray-900 border-t border-gray-800">
                <div className="flex justify-center items-center space-x-4">
                  <button
                    onClick={() => {
                      stopCamera();
                      setIsCameraOpen(false);
                    }}
                    className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => capturePhoto(selectedChargeType === 'otherInvoices' ? 'invoices' : selectedChargeType === 'thirdParty' ? 'thirdParty' : 'charges')}
                    disabled={!cameraStreamRef.current}
                    className="px-6 py-3 bg-white text-black rounded-full hover:bg-gray-200 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiCamera className="mr-2 h-5 w-5" />
                    Capture
                  </button>
                  <button
                    onClick={async () => {
                      stopCamera();
                      await startCamera();
                    }}
                    className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center"
                  >
                    <FiVideo className="mr-2 h-5 w-5" />
                    Retry Camera
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Photo Preview Modal */}
      {showPhotoPreview && capturedPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg overflow-hidden w-full max-w-2xl mx-4">
            <div className="p-4 bg-gray-900 border-b border-gray-800 flex justify-between items-center">
              <h3 className="text-white font-medium">Photo Preview</h3>
              <button
                onClick={() => {
                  if (capturedPhoto?.preview) {
                    URL.revokeObjectURL(capturedPhoto.preview);
                  }
                  setCapturedPhoto(null);
                  setShowPhotoPreview(false);
                }}
                className="text-gray-300 hover:text-white"
              >
                <FiX className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-4">
              <div className="aspect-video bg-black rounded-lg overflow-hidden mb-4">
                <img
                  src={capturedPhoto.preview}
                  alt="Captured Preview"
                  className="w-full h-full object-contain"
                />
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg mb-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{capturedPhoto.name}</p>
                    <p className="text-xs text-gray-500">
                      Size: {(capturedPhoto.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                  <div className="text-sm text-gray-600">
                    {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => handlePhotoPreviewAction('retake')}
                  className="px-6 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  Retake
                </button>
                <button
                  onClick={() => handlePhotoPreviewAction('use', selectedChargeType === 'otherInvoices' ? 'invoices' : selectedChargeType === 'thirdParty' ? 'thirdParty' : 'charges')}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                >
                  Use This Photo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OtherCharges;