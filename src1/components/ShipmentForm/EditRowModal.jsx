// import React, { useState, useRef, useCallback } from 'react';
// import { formatNumberWithCommas, formatDateTime } from './utils/format';
// import CameraModal from './CameraModal';

// const EditRowModal = ({
//   row = {
//     calculation_type: "",
//     amount: "",
//     invoice_no: "",
//     invoice_date: "",
//     vehicle_no: "",
//     attachmentUrl: "",
//     attachmentName: "",
//     calTypeDescription: ""
//   },
//   selectedFile,
//   onClose,
//   onSave,
//   attachmentDescription = [],
//   storedVoucherNo,
//   storedYear,
//   custominvoice
// }) => {
//   const [editedRow, setEditedRow] = useState(() => ({
//     calculation_type: row.calculation_type || "",
//     amount: row.amount || "",
//     invoice_no: row.invoice_no || "",
//     invoice_date: row.invoice_date || "",
//     vehicle_no: row.vehicle_no || "",
//     attachmentUrl: row.attachmentUrl || "",
//     attachmentName: row.attachmentName || "",
//     calTypeDescription: row.calTypeDescription || "",
//   }));
  
  
//   const [isDropdownOpen, setIsDropdownOpen] = useState(false);
//   const [dragActive, setDragActive] = useState(false);
//   const [isCameraOpen, setIsCameraOpen] = useState(false);
//   const [currentFile, setCurrentFile] = useState(selectedFile || null);

//   const fileInputRef = useRef(null);
//   const dropZoneRef = useRef(null);
//   const videoRef = useRef(null);
//   const canvasRef = useRef(null);

//   const MAX_FILE_SIZE = 5 * 1024 * 1024;

//   const handleInputChange = (field, value) => {
//     setEditedRow(prev => ({
//       ...prev,
//       [field]: field === "amount" ? value.replace(/,/g, "") : value
//     }));
//   };

//   const handleDrag = useCallback((e) => {
//     e.preventDefault();
//     e.stopPropagation();
//     if (e.type === "dragenter" || e.type === "dragover") {
//       setDragActive(true);
//     } else if (e.type === "dragleave") {
//       setDragActive(false);
//     }
//   }, []);

//   const handleDrop = useCallback((e) => {
//     e.preventDefault();
//     e.stopPropagation();
//     setDragActive(false);

//     const files = e.dataTransfer.files;
//     if (files && files[0]) {
//       handleFile(files[0]);
//     }
//   }, []);

//   const handleFileChange = (event) => {
//     const file = event.target.files[0];
//     if (file) {
//       if (file.size > MAX_FILE_SIZE) {
//         alert("File size exceeds 5MB limit.");
//         return;
//       }
//       handleFile(file);
//     }
//   };

//   const handleFile = (file) => {
//     const reader = new FileReader();
//     reader.onload = (e) => {
//       setCurrentFile({
//         file: file,
//         preview: e.target.result,
//         name: file.name,
//         size: file.size,
//       });
//     };
//     reader.readAsDataURL(file);
//   };

//   const startCamera = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({
//         video: { facingMode: "environment" }
//       });
//       if (videoRef.current) {
//         videoRef.current.srcObject = stream;
//       }
//       setIsCameraOpen(true);
//     } catch (error) {
//       console.error("Error accessing camera:", error);
//     }
//   };

//   const stopCamera = () => {
//     if (videoRef.current && videoRef.current.srcObject) {
//       const stream = videoRef.current.srcObject;
//       const tracks = stream.getTracks();
//       tracks.forEach(track => track.stop());
//       videoRef.current.srcObject = null;
//     }
//   };

//   const capturePhoto = () => {
//     if (videoRef.current && canvasRef.current) {
//       const video = videoRef.current;
//       const canvas = canvasRef.current;
//       canvas.width = video.videoWidth;
//       canvas.height = video.videoHeight;

//       const context = canvas.getContext("2d");
//       context.drawImage(video, 0, 0, canvas.width, canvas.height);

//       canvas.toBlob((blob) => {
//         const file = new File([blob], `capture_${Date.now()}.jpg`, {
//           type: "image/jpeg",
//         });
//         if (file.size > MAX_FILE_SIZE) {
//           alert("Captured image exceeds 5MB limit");
//           return;
//         }
//         handleFile(file);
//         stopCamera();
//         setIsCameraOpen(false);
//       }, "image/jpeg", 0.8);
//     }
//   };

//   const handleSave = () => {
//     onSave(editedRow, currentFile);
//   };

//   return (
//     <>
//       <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 px-2">
//         <div className="bg-white rounded-lg shadow-lg p-4 w-full max-w-lg max-h-[90vh] overflow-y-auto">
//           <h3 className="text-md font-semibold mb-2">Edit Row</h3>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
//             <div className="relative">
//               <label className="block text-xs font-medium text-gray-700 mb-1">
//                 Type <span className="text-red-500">*</span>
//               </label>
//               <div className="relative">
//                 <div className="mt-1">
//                   <div className="relative">
//                     <input
//                       type="text"
//                       className="w-full border border-gray-300 rounded-md p-1 pl-2 pr-8 text-sm focus:ring-indigo-500 focus:border-indigo-500"
//                       placeholder="Search or select type..."
//                       value={editedRow.calTypeDescription || ""}
//                       onChange={(e) => {
//                         handleInputChange("calTypeDescription", e.target.value);
//                       }}
//                       onFocus={() => setIsDropdownOpen(true)}
//                     />
//                     <button
//                       className="absolute inset-y-0 right-0 flex items-center pr-2"
//                       onClick={() => setIsDropdownOpen(!isDropdownOpen)}
//                     >
//                       <svg
//                         className={`h-4 w-4 text-gray-400 transform ${
//                           isDropdownOpen ? "rotate-180" : ""
//                         }`}
//                         fill="none"
//                         viewBox="0 0 24 24"
//                         stroke="currentColor"
//                       >
//                         <path
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           strokeWidth={2}
//                           d="M19 9l-7 7-7-7"
//                         />
//                       </svg>
//                     </button>
//                   </div>
//                   {isDropdownOpen && (
//                     <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-sm border border-gray-200 overflow-auto">
//                       {attachmentDescription
//                         .filter((item) =>
//                           item.Description.toLowerCase().includes(
//                             (editedRow.calTypeDescription || "").toLowerCase()
//                           )
//                         )
//                         .map((item, index) => (
//                           <div
//                             key={index}
//                             className={`px-3 py-2 cursor-pointer hover:bg-indigo-50 ${
//                               editedRow.calculation_type === item.CalculationType
//                                 ? "bg-indigo-100 text-indigo-800"
//                                 : ""
//                             }`}
//                             onClick={() => {
//                               handleInputChange("calculation_type", item.CalculationType);
//                               handleInputChange("calTypeDescription", item.Description);
//                               setIsDropdownOpen(false);
//                             }}
//                           >
//                             {item.Description}
//                           </div>
//                         ))}
//                       {attachmentDescription.filter((item) =>
//                         item.Description.toLowerCase().includes(
//                           (editedRow.calTypeDescription || "").toLowerCase()
//                         )
//                       ).length === 0 && (
//                         <div className="px-3 py-2 text-gray-500 text-center">
//                           No matching types found
//                         </div>
//                       )}
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//             <div>
//               <label className="block text-xs font-medium text-gray-700">
//                 Amount <span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="text"
//                 className="mt-1 w-full border border-gray-300 rounded-md p-1 text-sm"
//                 value={formatNumberWithCommas(editedRow.amount) || ""}
//                 onChange={(e) => handleInputChange("amount", e.target.value)}
//               />
//             </div>
//             <div>
//               <label className="block text-xs font-medium text-gray-700">
//                 Invoice No <span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="text"
//                 className="mt-1 w-full border border-gray-300 rounded-md p-1 text-sm"
//                 value={editedRow.invoice_no || ""}
//                 onChange={(e) => handleInputChange("invoice_no", e.target.value)}
//               />
//             </div>
//             <div>
//               <label className="block text-xs font-medium text-gray-700">
//                 Date
//               </label>
//               <input
//                 type="date"
//                 className="mt-1 w-full border border-gray-300 rounded-md p-1 text-sm"
//                 value={
//                   editedRow.invoice_date
//                     ? formatDateTime(editedRow.invoice_date).replace(/\//g, "-")
//                     : ""
//                 }
//                 onChange={(e) => handleInputChange("invoice_date", e.target.value)}
//               />
//             </div>
//             <div>
//               <label className="block text-xs font-medium text-gray-700">
//                 Vehicle No
//               </label>
//               <input
//                 type="text"
//                 className="mt-1 w-full border border-gray-300 rounded-md p-1 text-sm"
//                 value={editedRow.vehicle_no || ""}
//                 onChange={(e) => handleInputChange("vehicle_no", e.target.value)}
//               />
//             </div>
//             <div className="md:col-span-2">
//               <label className="block text-xs font-medium text-gray-700 mb-1">
//                 Attachment
//               </label>
//               <div
//                 ref={dropZoneRef}
//                 onDragEnter={handleDrag}
//                 onDragLeave={handleDrag}
//                 onDragOver={handleDrag}
//                 onDrop={handleDrop}
//                 className={`border-2 border-dashed rounded-md p-4 text-center ${
//                   dragActive ? "border-indigo-600 bg-indigo-50" : "border-gray-300"
//                 }`}
//               >
//                 {!currentFile ? (
//                   <div>
//                     <svg
//                       className="mx-auto h-12 w-12 text-gray-400"
//                       fill="none"
//                       viewBox="0 0 24 24"
//                       stroke="currentColor"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         strokeWidth={2}
//                         d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
//                       />
//                     </svg>
//                     <p className="mt-1 text-sm text-gray-600">
//                       Drag and drop files here or{" "}
//                       <label
//                         htmlFor="file-upload"
//                         className="text-indigo-600 hover:text-indigo-800 cursor-pointer"
//                       >
//                         browse
//                       </label>
//                       {" or "}
//                       <button
//                         onClick={startCamera}
//                         className="text-indigo-600 hover:text-indigo-800"
//                       >
//                         capture
//                       </button>
//                     </p>
//                     <p className="text-xs text-gray-500">(Max file size: 5MB)</p>
//                     <input
//                       id="file-upload"
//                       type="file"
//                       className="hidden"
//                       onChange={handleFileChange}
//                       accept="image/*,application/pdf"
//                     />
//                   </div>
//                 ) : (
//                   <div className="space-y-2">
//                     <div className="flex items-center justify-between">
//                       <div className="flex items-center space-x-2">
//                         {currentFile.preview && (
//                           <img
//                             src={currentFile.preview}
//                             alt="Preview"
//                             className="h-16 w-16 object-cover rounded"
//                           />
//                         )}
//                         <div>
//                           <p className="text-sm font-medium text-gray-900">
//                             {currentFile.name}
//                           </p>
//                           <p className="text-xs text-gray-500">
//                             {(currentFile.size / 1024).toFixed(2)} KB
//                           </p>
//                         </div>
//                       </div>
//                       <button
//                         onClick={() => setCurrentFile(null)}
//                         className="text-red-600 hover:text-red-800"
//                       >
//                         <svg
//                           className="h-5 w-5"
//                           fill="none"
//                           viewBox="0 0 24 24"
//                           stroke="currentColor"
//                         >
//                           <path
//                             strokeLinecap="round"
//                             strokeLinejoin="round"
//                             strokeWidth={2}
//                             d="M6 18L18 6M6 6l12 12"
//                           />
//                         </svg>
//                       </button>
//                     </div>
//                   </div>
//                 )}
//               </div>
//               {editedRow.attachmentUrl && !currentFile && (
//                 <div className="mt-2 text-sm text-gray-600">
//                   Current Attachment:{" "}
//                   <a
//                     href={editedRow.attachmentUrl}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className="text-blue-600 hover:underline"
//                   >
//                     {editedRow.attachmentName}
//                   </a>
//                 </div>
//               )}
//             </div>
//           </div>
//           <div className="mt-3 flex justify-end space-x-2">
//             <button
//               onClick={onClose}
//               className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm"
//             >
//               Cancel
//             </button>
//             <button
//               onClick={handleSave}
//               className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded text-sm"
//             >
//               Save
//             </button>
//           </div>
//         </div>
//       </div>

//       {isCameraOpen && (
//         <CameraModal
//           onClose={() => {
//             stopCamera();
//             setIsCameraOpen(false);
//           }}
//           onCapture={capturePhoto}
//           videoRef={videoRef}
//           canvasRef={canvasRef}
//         />
//       )}
//     </>
//   );
// };

// export default EditRowModal;


import React, { useState, useRef, useCallback } from "react";
import { formatNumberWithCommas, formatDateTime } from "./utils/format";
import CameraModal from "./CameraModal";

const EditRowModal = ({
  row = {
    calculation_type: "",
    amount: "",
    invoice_no: "",
    invoice_date: "",
    vehicle_no: "",
    attachmentUrl: "",
    attachmentName: "",
    calTypeDescription: "",
  },
  selectedFile,
  onClose,
  onSave,
  attachmentDescription = [],
}) => {
  const [editedRow, setEditedRow] = useState(() => ({
    calculation_type: row.calculation_type || "",
    amount: row.amount || "",
    invoice_no: row.invoice_no || "",
    invoice_date: row.invoice_date || "",
    vehicle_no: row.vehicle_no || "",
    attachmentUrl: row.attachmentUrl || "",
    attachmentName: row.attachmentName || "",
    calTypeDescription: row.calTypeDescription || "",
  }));

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [currentFile, setCurrentFile] = useState(selectedFile || null);

  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const MAX_FILE_SIZE = 5 * 1024 * 1024;

  const handleInputChange = (field, value) => {
    setEditedRow((prev) => ({
      ...prev,
      [field]: field === "amount" ? value.replace(/,/g, "") : value,
    }));
  };

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  }, []);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        alert("File size exceeds 5MB limit.");
        return;
      }
      handleFile(file);
    }
  };

  const handleFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setCurrentFile({
        file,
        preview: e.target.result,
        name: file.name,
        size: file.size,
      });
    };
    reader.readAsDataURL(file);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraOpen(true);
    } catch (error) {
      console.error("Error accessing camera:", error);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const context = canvas.getContext("2d");
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(
        (blob) => {
          const file = new File([blob], `capture_${Date.now()}.jpg`, {
            type: "image/jpeg",
          });
          if (file.size > MAX_FILE_SIZE) {
            alert("Captured image exceeds 5MB limit");
            return;
          }
          handleFile(file);
          stopCamera();
          setIsCameraOpen(false);
        },
        "image/jpeg",
        0.8
      );
    }
  };

  const handleSave = () => {
    if (!editedRow?.calculation_type) {
      alert("Calculation type is required.");
      return;
    }
    onSave(editedRow, currentFile);
  };

  return (
    <>
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 px-2">
        <div className="bg-white rounded-lg shadow-lg p-4 w-full max-w-lg max-h-[90vh] overflow-y-auto">
          <h3 className="text-md font-semibold mb-2">Edit Row</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {/* Type Dropdown */}
            <div className="relative">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Type <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-md p-1 pl-2 pr-8 text-sm"
                  placeholder="Search or select type..."
                  value={editedRow.calTypeDescription || ""}
                  onChange={(e) =>
                    handleInputChange("calTypeDescription", e.target.value)
                  }
                  onFocus={() => setIsDropdownOpen(true)}
                />
                <button
                  className="absolute inset-y-0 right-0 flex items-center pr-2"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <svg
                    className={`h-4 w-4 text-gray-400 transform ${
                      isDropdownOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {isDropdownOpen && (
                  <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-sm border border-gray-200 overflow-auto">
                    {attachmentDescription
                      .filter((item) =>
                        item.Description.toLowerCase().includes(
                          (editedRow.calTypeDescription || "").toLowerCase()
                        )
                      )
                      .map((item, index) => (
                        <div
                          key={index}
                          className={`px-3 py-2 cursor-pointer hover:bg-indigo-50 ${
                            editedRow.calculation_type === item.CalculationType
                              ? "bg-indigo-100 text-indigo-800"
                              : ""
                          }`}
                          onClick={() => {
                            handleInputChange(
                              "calculation_type",
                              item.CalculationType
                            );
                            handleInputChange("calTypeDescription", item.Description);
                            setIsDropdownOpen(false);
                          }}
                        >
                          {item.Description}
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-xs font-medium text-gray-700">
                Amount <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="mt-1 w-full border border-gray-300 rounded-md p-1 text-sm"
                value={formatNumberWithCommas(editedRow.amount) || ""}
                onChange={(e) => handleInputChange("amount", e.target.value)}
              />
            </div>

            {/* Other fields ... */}
            <div>
              <label className="block text-xs font-medium text-gray-700">
                Invoice No
              </label>
              <input
                type="text"
                className="mt-1 w-full border border-gray-300 rounded-md p-1 text-sm"
                value={editedRow.invoice_no || ""}
                onChange={(e) => handleInputChange("invoice_no", e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700">
                Date
              </label>
              <input
                type="date"
                className="mt-1 w-full border border-gray-300 rounded-md p-1 text-sm"
                value={
                  editedRow.invoice_date
                    ? formatDateTime(editedRow.invoice_date).replace(/\//g, "-")
                    : ""
                }
                onChange={(e) => handleInputChange("invoice_date", e.target.value)}
              />
            </div>

            {/* Vehicle No */}
            <div>
              <label className="block text-xs font-medium text-gray-700">
                Vehicle No
              </label>
              <input
                type="text"
                className="mt-1 w-full border border-gray-300 rounded-md p-1 text-sm"
                value={editedRow.vehicle_no || ""}
                onChange={(e) => handleInputChange("vehicle_no", e.target.value)}
              />
            </div>

            {/* Attachment upload section here (omitted for brevity, keep yours) */}

          </div>

          {/* Buttons */}
          <div className="mt-3 flex justify-end space-x-2">
            <button
              onClick={onClose}
              className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded text-sm"
            >
              Save
            </button>
          </div>
        </div>
      </div>

      {isCameraOpen && (
        <CameraModal
          onClose={() => {
            stopCamera();
            setIsCameraOpen(false);
          }}
          onCapture={capturePhoto}
          videoRef={videoRef}
          canvasRef={canvasRef}
        />
      )}
    </>
  );
};

export default EditRowModal;
