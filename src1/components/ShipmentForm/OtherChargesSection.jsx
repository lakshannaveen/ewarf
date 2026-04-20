import React from 'react';
import { formatNumberWithCommas, formatDateTime } from './utils/format';

const OtherChargesSection = ({
  otherChargesRows,
  isEditDisabled,
  handleEditClick,
  handleAddRow,
  handleSaveOtherCharges,
  selectedFiles,
  handlePreviewClick
}) => {
  return (
    <div className="order-0 lg:order-1 bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="bg-indigo-50 p-4 border-b">
        <h2 className="font-semibold text-indigo-700 flex items-center">
          <span className="inline-block mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07-.34-.433-.582a2.305 2.305 0 01-.567.267z" />
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
            </svg>
          </span>
          Other Charges
        </h2>
      </div>
      <div className="p-4">
        <div className="overflow-x-auto max-h-64">
          <table className="w-full border-collapse">
            <thead className="bg-indigo-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider md:hidden">Action</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Type</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Amount</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Invoice No</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Date</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Vehicle</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Attachment</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider hidden md:table-cell">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {otherChargesRows.map((row, index) => (
                <tr key={row.id || index} className="hover:bg-gray-50">
                  <td className="px-3 py-2 md:hidden">
                    <button
                      onClick={() => handleEditClick(index)}
                      className={`text-white px-2 py-1 rounded text-xs ${
                        isEditDisabled ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
                      }`}
                      disabled={isEditDisabled}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                  </td>
                  <td className="px-3 py-2">{row.calTypeDescription || ""}</td>
                  <td className="px-3 py-2">{formatNumberWithCommas(row.amount) || ""}</td>
                  <td className="px-3 py-2">{row.invoice_no || ""}</td>
                  <td className="px-3 py-2">{formatDateTime(row.invoice_date)}</td>
                  <td className="px-3 py-2">{row.vehicle_no || ""}</td>
                  <td className="px-3 py-2">
                    {selectedFiles[index] ? (
                      <button
                        onClick={() => handlePreviewClick(selectedFiles[index], null)}
                        className="text-blue-600 hover:underline cursor-pointer"
                      >
                        {selectedFiles[index].name}
                      </button>
                    ) : row.attachmentUrl ? (
                      <button
                        onClick={() => handlePreviewClick(null, row.attachmentUrl)}
                        className="text-blue-600 hover:underline cursor-pointer"
                      >
                        {row.attachmentName || "View Attachment"}
                      </button>
                    ) : row.image_path ? (
                      <button
                        onClick={() => handlePreviewClick(null, row.image_path)}
                        className="text-blue-600 hover:underline cursor-pointer"
                      >
                        {row.image_path.split("\\").pop()}
                      </button>
                    ) : (
                      "No Attachment"
                    )}
                  </td>
                  <td className="px-3 py-2 hidden md:table-cell">
                    <button
                      onClick={() => handleEditClick(index)}
                      className={`text-white px-2 py-1 rounded text-xs ${
                        isEditDisabled ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
                      }`}
                      disabled={isEditDisabled}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-between mt-4">
          <button
            onClick={handleAddRow}
            className={`text-white px-4 py-2 rounded text-sm flex items-center ${
              isEditDisabled ? "bg-gray-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
            }`}
            disabled={isEditDisabled}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add Row
          </button>
          <button
            onClick={handleSaveOtherCharges}
            className={`text-white px-4 py-2 rounded text-sm flex items-center ${
              isEditDisabled ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
            }`}
            disabled={isEditDisabled}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default OtherChargesSection;