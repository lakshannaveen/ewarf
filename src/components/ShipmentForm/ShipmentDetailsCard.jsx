import React from 'react';

const ShipmentDetailsCard = ({ details }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
      <div className="bg-indigo-50 p-4 border-b">
        <h2 className="font-semibold text-indigo-700 flex items-center">
          <span className="inline-block mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 2a1 1 0 00-1 1v1H6a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V6a2 2 0 00-2-2h-3V3a1 1 0 00-1-1zm-1 8a1 1 0 112 0v3a1 1 0 11-2 0v-3z" clipRule="evenodd" />
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
                  value={details[item.key] || ""}
                  readOnly
                />
              ) : (
                <input
                  type="text"
                  className="border border-gray-300 rounded w-full py-1 px-2 text-sm bg-gray-50"
                  value={details[item.key] || ""}
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
                value={details[item.key] || ""}
                readOnly
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ShipmentDetailsCard;