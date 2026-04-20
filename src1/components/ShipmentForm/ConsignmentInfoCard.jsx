import React from 'react';

const ConsignmentInfoCard = ({ 
  details, 
  container20, 
  container40, 
  container45 
}) => {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="bg-indigo-50 p-4 border-b">
        <h2 className="font-semibold text-indigo-700 flex items-center">
          <span className="inline-block mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z" />
            </svg>
          </span>
          Consignment Information
        </h2>
      </div>
      <div className="p-3">
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div>
            <label className="block text-gray-600 text-xs mb-1">Consignment Type</label>
            <input
              type="text"
              className="border border-gray-300 rounded w-full py-1 px-2 text-sm bg-gray-50"
              value={details.consignment_type || ""}
              readOnly
            />
          </div>
          <div>
            <label className="block text-gray-600 text-xs mb-1">Quantity</label>
            <input
              type="text"
              className="border border-gray-300 rounded w-full py-1 px-2 text-sm bg-gray-50"
              value={details.quantity || ""}
              readOnly
            />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <h3 className="text-gray-600 text-xs font-semibold mb-2">Container Type</h3>
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
            <h3 className="text-gray-600 text-xs font-semibold mb-2">Quantity</h3>
            <div className="space-y-1">
              <input
                type="number"
                className="border rounded py-0 px-2 w-16 text-sm"
                value={details.container_20_qty || ""}
                readOnly
              />
              <input
                type="number"
                className="border rounded py-0 px-2 w-16 text-sm block mt-1"
                value={details.container_40_qty || ""}
                readOnly
              />
              <input
                type="number"
                className="border rounded py-0 px-2 w-16 text-sm block mt-1"
                value={details.container_45_qty || ""}
                readOnly
              />
            </div>
          </div>
          <div>
            <h3 className="text-gray-600 text-xs font-semibold mb-2">Company Information</h3>
            <input
              type="text"
              value={details.foreignSupplierCode}
              className="border border-gray-300 rounded text-sm py-1 px-2 w-3/5 mb-2"
              readOnly
            />
            <input
              type="text"
              value={details.foreignSupplierName}
              className="border border-gray-300 rounded text-xs py-2 px-1 w-full"
              readOnly
            />
          </div>
        </div>
        <div>
          <label className="block text-gray-600 text-xs mb-1">Valuation Completed Date</label>
          <input
            type="text"
            value={details.valcompleted_date}
            className="border border-gray-300 rounded w-36 py-1 px-2 text-sm bg-gray-50"
            readOnly
          />
        </div>
      </div>
    </div>
  );
};

export default ConsignmentInfoCard;