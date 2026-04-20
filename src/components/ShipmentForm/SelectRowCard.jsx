import React, { useState } from 'react';

const SelectRowCard = ({ 
  sidebardetails, 
  selectedRow, 
  handleRowSelect, 
  searchQuery, 
  setSearchQuery,
  isLoading,
  hasMore,
  loadMoreRows
}) => {
  const filteredData = sidebardetails.filter(
    (row) =>
      row.voucher_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.fileno.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
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
              Select Row
            </h2>
          </div>
          <div className="p-3 space-y-2">
            <input
              type="text"
              placeholder="Search FILE_NO or DATE..."
              className="w-full py-1 px-4 rounded-md text-black border-[0.5px] border-black text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <div className="bg-gray-50">
                <table className="w-full table-fixed border-collapse">
                  <colgroup>
                    <col style={{ width: "50px" }} />
                    <col style={{ width: "46%" }} />
                    <col style={{ width: "50%" }} />
                  </colgroup>
                  <thead>
                    <tr>
                      <th className="py-1 px-2 border border-gray-300 text-center text-xs">
                        ✔
                      </th>
                      <th className="py-1 px-2 border border-gray-300 text-left text-xs">
                        Year
                      </th>
                      <th className="py-1 px-2 border border-gray-300 text-left text-xs">
                        File No
                      </th>
                    </tr>
                  </thead>
                </table>
              </div>
              <div className="max-h-[440px] overflow-y-auto">
                <table className="w-full table-fixed border-collapse">
                  <colgroup>
                    <col style={{ width: "50px" }} />
                    <col style={{ width: "54%" }} />
                    <col style={{ width: "50%" }} />
                  </colgroup>
                  <tbody>
                    {filteredData.map((row, index) => (
                      <tr
                        key={index}
                        className={`cursor-pointer transition ${selectedRow === index
                          ? "bg-blue-500 text-white"
                          : "hover:bg-indigo-50"
                          }`}
                        onClick={() => handleRowSelect(index, row)}
                      >
                        <td className="py-1 px-2 border border-gray-200 text-center">
                          <input
                            type="checkbox"
                            checked={selectedRow === index}
                            onChange={() => handleRowSelect(index, row)}
                            className="h-3 w-3"
                          />
                        </td>
                        <td className="py-1 px-1 border border-gray-200 text-sm">
                          {row.msd_year}
                        </td>
                        <td className="py-1 px-1 border border-gray-200 text-sm">
                          {row.fileno}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {hasMore && (
              <div className="mt-2 text-center">
                <button
                  onClick={loadMoreRows}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1 rounded text-sm"
                  disabled={isLoading}
                >
                  {isLoading ? "Loading..." : "Load More"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectRowCard;