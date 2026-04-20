import React from 'react';

const StatusPaymentCard = ({ 
  details, 
  isValuationCompleted, 
  isWebPerforationComplete, 
  handleStatusChange 
}) => {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="bg-indigo-50 p-4 border-b">
        <h2 className="font-semibold text-indigo-700 flex items-center">
          <span className="inline-block mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
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
              value={details.status || ""}
              readOnly
            />
          </div>

          <div className="mb-2">
            <label className="block text-gray-600 text-xs mb-1">Payee</label>
            <div className="flex gap-2">
              <input
                type="text"
                className="border border-gray-300 rounded w-1/3 py-1 px-2 text-sm bg-gray-50"
                value={details.supplier_code || ""}
                readOnly
              />
              <input
                type="text"
                className="border border-gray-300 rounded flex-1 py-1 px-2 text-sm bg-gray-50"
                value={details.v_supplier || ""}
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
                value={details.customerInvNo || ""}
                readOnly
              />
              <input
                type="text"
                className={`border border-gray-300 rounded w-3/5 py-1 px-2 text-sm ${
                  details.invoiceStatus === "Valuation Completed" ? "bg-red-100" : "bg-blue-100"
                }`}
                value={details.invoiceStatus || ""}
                readOnly
              />
            </div>
          </div>

          <div className="mb-2">
            <label className="block text-gray-600 text-xs mb-1">Web Preparation Status</label>
            <select
              className={`border border-gray-300 rounded w-2/3 py-1 px-2 text-sm ${
                isValuationCompleted ? "bg-gray-200 cursor-not-allowed" : ""
              } ${
                isWebPerforationComplete ? "bg-green-100" : "bg-red-100"
              }`}
              value={isWebPerforationComplete ? "Preparation Complete" : "Un Complete"}
              onChange={handleStatusChange}
              disabled={isValuationCompleted || isWebPerforationComplete}
            >
              <option value="Un Complete">In Complete</option>
              <option value="Preparation Complete">Web Preparation Complete</option>
            </select>
            <input
              type="text"
              className={`border border-gray-300 rounded w-3/5 py-1 px-2 text-sm ${
                details.invoiceStatus === "Valuation Completed" ? "bg-red-100" : "bg-blue-100"
              }`}
              value={details.MSD_STATUS || ""}
              readOnly
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusPaymentCard;