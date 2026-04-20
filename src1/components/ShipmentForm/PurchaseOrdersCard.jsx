import React from 'react';

const formatNumberWithCommas = (number) => {
  if (!number || isNaN(number)) return "";
  return Number(number).toLocaleString("en-US");
};

const PurchaseOrdersCard = ({ podetails }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="bg-indigo-50 p-5 border-b">
        <h2 className="font-semibold text-indigo-700 flex items-center">
          <span className="inline-block mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5 2a2 2 0 00-2 2v14l3.5-2 3.5 2 3.5-2 3.5 2V4a2 2 0 00-2-2H5zm4.707 3.707a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L8.414 9H10a3 3 0 013 3v1a1 1 0 102 0v-1a5 5 0 00-5-5H8.414l1.293-1.293z" clipRule="evenodd" />
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
                {podetails.map((podetail, index) => (
                  <tr key={index}>
                    <td className="py-1 px-2 border border-gray-200 text-sm">
                      {podetail.po_no}
                    </td>
                    <td className="py-2 px-2 border border-gray-200 text-sm text-right">
                      {formatNumberWithCommas(podetail.totalamount)}
                    </td>
                  </tr>
                ))}
                {Array.from({
                  length: Math.max(0, 7 - podetails.length),
                }).map((_, index) => (
                  <tr key={`empty-${index}`} className="bg-white-50">
                    <td className="py-1 px-2 border border-gray-200 text-gray-400 text-center text-sm">
                      -
                    </td>
                    <td className="py-1 px-2 border border-gray-200 text-gray-400 text-center text-sm">
                      -
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseOrdersCard;