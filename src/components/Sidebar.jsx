import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import axios from "axios";
const Sidebar = ({ isOpen, toggleSidebar }) => {
  const [sidebardetails, setSidebardetails] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPayee, setSelectedPayee] = useState(""); // New state for payee selection
  useEffect(() => {
    //1)Fetch the sidebar details
    const fetchSidebardetails = async () => {
      try {
        const user = localStorage.getItem("comid");

        const response = await axios.get(
          `https://esystems.cdl.lk/backend-test/ewharf/ValueList/GetSellleMenuDetails?suppliercode=${user}`
        );
        if (response.data && response.data.ResultSet) {
          setSidebardetails(response.data.ResultSet);
        }
      } catch (error) {
        console.error("Error fetching details", error);
      }
    };
    fetchSidebardetails();
  }, []);
  // Get unique payees from the data (assuming there's a payee field, if not adjust accordingly)
  const payees = [...new Set(sidebardetails.map(row => row.payee || "Unknown"))];
  // Filtered data based on search and payee
  const filteredData = sidebardetails.filter(
    (row) =>
      (selectedPayee === "" || row.payee === selectedPayee) &&
      (row.msd_year.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.fileno.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.voucher_no.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  const handleRowSelect = (index, row) => {
    setSelectedRow(index);

    //3)We store vouchger number and year in localstorage
    localStorage.setItem("selectedVoucherNo", row.voucher_no);
    localStorage.setItem("selectedYear", row.msd_year);
    console.log("Stored voucher_no:", row.voucher_no);
    console.log("Stored year:", row.msd_year);
    console.log("Voucher from localStorage:", localStorage.getItem("selectedVoucherNo"));
    console.log("Year from localStorage:", localStorage.getItem("selectedYear"));
    window.location.reload();
  };
  return (
    <motion.div
      initial={{ x: -500 }}
      animate={isOpen ? { x: 0 } : { x: -500 }}
      transition={{ type: "spring", stiffness: 120 }}
      className="fixed left-0 top-0 h-full w-64 bg-black/70 text-white shadow-xl p-2 z-50 overflow-hidden"
    >
      {/* Close Button */}
      <button
        onClick={toggleSidebar}
        className="absolute top-3 right-3 text-white hover:text-gray-400 transition"
      >
        <X size={28} />
      </button>
      {/* Payee Select and Search Section */}
      <div className="mt-16 space-y-4">
        {/* Payee Dropdown */}
        <select
          value={selectedPayee}
          onChange={(e) => setSelectedPayee(e.target.value)}
          className="w-56 p-2 rounded-md bg-gray-900 text-white border border-white/30"
        >
          <option value="">Select Payee</option>
          {payees.map((payee, index) => (
            <option key={index} value={payee}>
              {payee}
            </option>
          ))}
        </select>
        {/* Search Bar */}
        <input
          type="text"
          placeholder="Search FILE_NO or YEAR..."
          className="w-56 p-2 rounded-md bg-gray-900 text-white border border-white/30"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      {/* Table Section */}
      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-3">Select Row</h2>
        <div className="overflow-y-auto max-h-[550px] border border-white/30 w-60 rounded-md">
          <table className="w-full text-white">
            <thead>
              <tr className="bg-gray-800 text-white sticky top-0">
                <th className="p-2 border border-white/30 w-12">✔</th>
                {/* <th className="p-2 border border-white/30">REF_NO</th>
                <th className="p-2 border border-white/30">VOU_NO</th>
                <th className="p-2 border border-white/30">YEAR</th> */}
                <th className="p-2 border border-white/30 w-28">FILE NO</th>
                <th className="p-2 border border-white/30 ">YEAR</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map((row, index) => (

                  //2) We load details from the grid
                  <tr
                    key={index}
                    className={`cursor-pointer transition ${
                      selectedRow === index ? "bg-blue-500" : "hover:bg-gray-700"
                    }`}
                    onClick={() => handleRowSelect(index, row)}
                  >
                    <td className="p-2 border border-white/30 text-center">
                      <input
                        type="checkbox"
                        checked={selectedRow === index}
                        onChange={() => setSelectedRow(index)}
                      />
                    </td>
                    {/* <td className="p-2 border border-white/30">{row.refno}</td>
                    <td className="p-2 border border-white/30">{row.voucher_no}</td> */}
                    <td className="p-2 border border-white/30">{row.fileno}</td>
                    <td className="p-2 border border-white/30">{row.msd_year}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="p-4 text-center text-gray-400">
                    No matching records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};
export default Sidebar;





























// import React, { useEffect, useState } from "react";
// import { motion } from "framer-motion";
// import { X, Home, Info, Settings, Mail } from "lucide-react";
// import axios from "axios";

// const Sidebar = ({ isOpen, toggleSidebar }) => {
//   const [sidebardetails, setSidebardetails] = useState([]);



//   // Sample Data
//   // const tableData = [
//   //   { refNo: "REF001", acNo: "AC123", date: "2024-02-19" },
//   //   { refNo: "REF002", acNo: "AC456", date: "2024-02-18" },
//   //   { refNo: "REF003", acNo: "AC789", date: "2024-02-17" },
//   //   { refNo: "REF004", acNo: "AC234", date: "2024-02-16" },
//   //   { refNo: "REF005", acNo: "AC567", date: "2024-02-15" },
//   //   { refNo: "REF006", acNo: "AC890", date: "2024-02-14" },
//   //   { refNo: "REF007", acNo: "AC321", date: "2024-02-13" },
//   //   { refNo: "REF008", acNo: "AC654", date: "2024-02-12" },
//   //   { refNo: "REF009", acNo: "AC987", date: "2024-02-11" },
//   //   { refNo: "REF010", acNo: "AC432", date: "2024-02-10" },
//   //   { refNo: "REF005", acNo: "AC567", date: "2024-02-15" },
//   //   { refNo: "REF006", acNo: "AC890", date: "2024-02-14" },
//   //   { refNo: "REF007", acNo: "AC321", date: "2024-02-13" },
//   //   { refNo: "REF008", acNo: "AC654", date: "2024-02-12" },
//   //   { refNo: "REF009", acNo: "AC987", date: "2024-02-11" },
//   //   { refNo: "REF010", acNo: "AC432", date: "2024-02-10" },
//   // ];







//   useEffect(() => {

//     const fetchsidebardetails = async () => {


//       try {

//         const response = await axios.get(`https://esystems.cdl.lk/backend-test/ewharf/ValueList/GetSellleMenuDetails`);

//         if (response.data && response.data.ResultSet) {
//           setSidebardetails(response.data.ResultSet); // Access the ResultSet from the API response
//         }




//       }
//       catch (error) {


//         console.error("Error fetching details")








//       }



//     }

//     fetchsidebardetails();


//   },[]);

//   // State for search query
//   const [searchQuery, setSearchQuery] = useState("");

//   // State to track selected row
//   const [selectedRow, setSelectedRow] = useState(null);

//   // Filtered data based on search
//   const filteredData = sidebardetails.filter(
//     (row) =>
//       row.refno.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       row.voucher_no.toLowerCase().includes(searchQuery.toLowerCase()) // Assuming 'voucher_no' is similar to 'AC_NO'
//   );

//   return (
//     <motion.div
//       initial={{ x: -500 }}
//       animate={isOpen ? { x: 0 } : { x: -500 }}
//       transition={{ type: "spring", stiffness: 120 }}
//       className="fixed left-0 top-0 h-full w-84 bg-black/70 text-white shadow-xl p-2 z-50 overflow-hidden"
//     >
//       {/* Close Button */}
//       <button
//         onClick={toggleSidebar}
//         className="absolute top-3 right-3 text-white hover:text-gray-400 transition"
//       >
//         <X size={28} />
//       </button>

//       {/* Sidebar Links */}
//       <nav className="mt-8 space-y-6">
//         {/* <a href="#home" className="flex items-center gap-3 text-lg font-medium hover:text-blue-400 transition">
//           <Home size={22} /> Home
//         </a> */}
//         {/* <a href="#about" className="flex items-center gap-3 text-lg font-medium hover:text-blue-400 transition">
//           <Info size={22} /> About
//         </a>
//         <a href="#services" className="flex items-center gap-3 text-lg font-medium hover:text-blue-400 transition">
//           <Settings size={22} /> Services
//         </a>
//         <a href="#contact" className="flex items-center gap-3 text-lg font-medium hover:text-blue-400 transition">
//           <Mail size={22} /> Contact
//         </a> */}
//       </nav>

//       {/* Search Bar */}
//       <div className="mt-16">
//         <input
//           type="text"
//           placeholder="Search REF_NO or AC_NO..."
//           className="w-full p-2 rounded-md bg-gray-900 text-white border border-white/30"
//           value={searchQuery}
//           onChange={(e) => setSearchQuery(e.target.value)}
//         />
//       </div>

//       {/* Table Section */}
//       <div className="mt-10">
//         <h2 className="text-xl font-semibold mb-3">Select Row</h2>
//         <div className="overflow-y-auto max-h-96 border border-white/30 rounded-md">
//           <table className="w-full text-white">
//             <thead>
//               <tr className="bg-gray-800 text-white sticky top-0">
//                 <th className="p-2 border border-white/30 w-12">✔</th>
//                 <th className="p-2 border border-white/30">REF_NO</th>
//                 <th className="p-2 border border-white/30">VOU_NO</th>
//                 <th className="p-2 border border-white/30">DATE</th>
//               </tr>
//             </thead>
//             <tbody>
//   {filteredData.length > 0 ? (
//     filteredData.map((row, index) => (
//       <tr
//         key={index}
//         className={`cursor-pointer transition ${
//           selectedRow === index ? "bg-blue-500" : "hover:bg-gray-700"
//         }`}
//       >
//         <td className="p-2 border border-white/30 text-center">
//           <input
//             type="checkbox"
//             checked={selectedRow === index}
//             onChange={() => setSelectedRow(index)}
//           />
//         </td>
//         <td className="p-2 border border-white/30">{row.refno}</td> {/* Using API field */}
//         <td className="p-2 border border-white/30">{row.voucher_no}</td> {/* Using API field */}
//         <td className="p-2 border border-white/30">{row.msd_year}</td> {/* Assuming 'msd_year' is the date */}
//       </tr>
//     ))
//   ) : (
//     <tr>
//       <td colSpan="4" className="p-4 text-center text-gray-400">
//         No matching records found
//       </td>
//     </tr>
//   )}
// </tbody>

//           </table>
//         </div>
//       </div>
//     </motion.div>
//   );
// };

// export default Sidebar;


// import React, { useState, useEffect } from "react";
// import { motion } from "framer-motion";
// import { X } from "lucide-react";
// import axios from "axios";
// const Sidebar = ({ isOpen, toggleSidebar }) => {
//   const [sidebardetails, setSidebardetails] = useState([]);
//   const [selectedRow, setSelectedRow] = useState(null);
//   const [searchQuery, setSearchQuery] = useState("");
//   useEffect(() => {
//     const fetchSidebardetails = async () => {
//       try {
//         const response = await axios.get(
//           `https://esystems.cdl.lk/backend-test/ewharf/ValueList/GetSellleMenuDetails`
//         );
//         if (response.data && response.data.ResultSet) {
//           setSidebardetails(response.data.ResultSet);
//         }
//       } catch (error) {
//         console.error("Error fetching details", error);
//       }
//     };
//     fetchSidebardetails();
//   }, []);
//   // Filtered data based on search
//   const filteredData = sidebardetails.filter(
//     (row) =>
//       row.refno.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       row.voucher_no.toLowerCase().includes(searchQuery.toLowerCase())
//   );
//   const handleRowSelect = (index, row) => {
//     setSelectedRow(index);
//     // Store the selected voucher_no and year in localStorage
//     localStorage.setItem("selectedVoucherNo", row.voucher_no);
//     localStorage.setItem("selectedYear", row.msd_year);
//     // Log to check if the values are stored correctly
//     console.log("Stored voucher_no:", row.voucher_no);
//     console.log("Stored year:", row.msd_year);
//     // To further verify that values are in localStorage
//     console.log("Voucher from localStorage:", localStorage.getItem("selectedVoucherNo"));
//     console.log("Year from localStorage:", localStorage.getItem("selectedYear"));
//     // Reload the window after setting the localStorage values
//     window.location.reload();
// };
//   return (
//     <motion.div
//       initial={{ x: -500 }}
//       animate={isOpen ? { x: 0 } : { x: -500 }}
//       transition={{ type: "spring", stiffness: 120 }}
//       className="fixed left-0 top-0 h-full w-84 bg-black/70 text-white shadow-xl p-2 z-50 overflow-hidden"
//     >
//       {/* Close Button */}
//       <button
//         onClick={toggleSidebar}
//         className="absolute top-3 right-3 text-white hover:text-gray-400 transition"
//       >
//         <X size={28} />
//       </button>
//       {/* Search Bar */}
//       <div className="mt-16">
//         <input
//           type="text"
//           placeholder="Search REF_NO or AC_NO..."
//           className="w-full p-2 rounded-md bg-gray-900 text-white border border-white/30"
//           value={searchQuery}
//           onChange={(e) => setSearchQuery(e.target.value)}
//         />
//       </div>
//       {/* Table Section */}
//       <div className="mt-10">
//         <h2 className="text-xl font-semibold mb-3">Select Row</h2>
//         <div className="overflow-y-auto max-h-96 border border-white/30 rounded-md">
//           <table className="w-full text-white">
//             <thead>
//               <tr className="bg-gray-800 text-white sticky top-0">
//                 <th className="p-2 border border-white/30 w-12">✔</th>
//                 <th className="p-2 border border-white/30">REF_NO</th>
//                 <th className="p-2 border border-white/30">VOU_NO</th>
//                 <th className="p-2 border border-white/30">DATE</th>
//               </tr>
//             </thead>
//             <tbody>
//               {filteredData.length > 0 ? (
//                 filteredData.map((row, index) => (
//                   <tr
//                     key={index}
//                     className={`cursor-pointer transition ${
//                       selectedRow === index ? "bg-blue-500" : "hover:bg-gray-700"
//                     }`}
//                     onClick={() => handleRowSelect(index, row)} // Store the selected row
//                   >
//                     <td className="p-2 border border-white/30 text-center">
//                       <input
//                         type="checkbox"
//                         checked={selectedRow === index}
//                         onChange={() => setSelectedRow(index)}
//                       />
//                     </td>
//                     <td className="p-2 border border-white/30">{row.refno}</td>
//                     <td className="p-2 border border-white/30">{row.voucher_no}</td>
//                     <td className="p-2 border border-white/30">{row.msd_year}</td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan="4" className="p-4 text-center text-gray-400">
//                     No matching records found
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </motion.div>
//   );
// };
// export default Sidebar;

















































// import React, { useState, useEffect } from "react";
// import { motion } from "framer-motion";
// import { X } from "lucide-react";
// import axios from "axios";

// const Sidebar = ({ isOpen, toggleSidebar }) => {
//   const [sidebardetails, setSidebardetails] = useState([]);
//   const [selectedRow, setSelectedRow] = useState(null);
//   const [searchQuery, setSearchQuery] = useState("");

//   useEffect(() => {
//     const fetchSidebardetails = async () => {
//       try {
//         const response = await axios.get(
//           `https://esystems.cdl.lk/backend-test/ewharf/ValueList/GetSellleMenuDetails`
//         );
//         if (response.data && response.data.ResultSet) { 
//           setSidebardetails(response.data.ResultSet);
//         }
//       } catch (error) {
//         console.error("Error fetching details", error);
//       }
//     };

//     fetchSidebardetails();
//   }, []);

//   // Filtered data based on search
//   const filteredData = sidebardetails.filter(
//     (row) =>
//       row.msd_year.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       row.refno.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       row.voucher_no.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   const handleRowSelect = (index, row) => {
//     setSelectedRow(index);

//     // Store the selected voucher_no and year in localStorage
//     localStorage.setItem("selectedVoucherNo", row.voucher_no);
//     localStorage.setItem("selectedYear", row.msd_year);

//     // Log to check if the values are stored correctly
//     console.log("Stored voucher_no:", row.voucher_no);
//     console.log("Stored year:", row.msd_year);

//     // To further verify that values are in localStorage
//     console.log("Voucher from localStorage:", localStorage.getItem("selectedVoucherNo"));
//     console.log("Year from localStorage:", localStorage.getItem("selectedYear"));

//     // Reload the window after setting the localStorage values
//     window.location.reload();
// };


//   return (
//     <motion.div
//       initial={{ x: -500 }}
//       animate={isOpen ? { x: 0 } : { x: -500 }}
//       transition={{ type: "spring", stiffness: 120 }}
//       className="fixed left-0 top-0 h-full w-84 bg-black/70 text-white shadow-xl p-2 z-50 overflow-hidden"
//     >
//       {/* Close Button */}
//       <button
//         onClick={toggleSidebar}
//         className="absolute top-3 right-3 text-white hover:text-gray-400 transition"
//       >
//         <X size={28} />
//       </button>

//       {/* Search Bar */}
//       <div className="mt-16">
//         <input
//           type="text"
//           placeholder="Search REF_NO or AC_NO..."
//           className="w-full p-2 rounded-md bg-gray-900 text-white border border-white/30"
//           value={searchQuery}
//           onChange={(e) => setSearchQuery(e.target.value)}
//         />
//       </div>

//       {/* Table Section */}
//       <div className="mt-10">
//         <h2 className="text-xl font-semibold mb-3">Select Row</h2>
//         <div className="overflow-y-auto max-h-96 border border-white/30 rounded-md">
//           <table className="w-full text-white">
//             <thead>
//               <tr className="bg-gray-800 text-white sticky top-0">
//                 <th className="p-2 border border-white/30 w-12">✔</th>
//                 <th className="p-2 border border-white/30">REF_NO</th>
//                 <th className="p-2 border border-white/30">VOU_NO</th>
//                 <th className="p-2 border border-white/30">DATE / YEAR</th>
//                 {/* <th className="p-2 border border-white/30">DATE</th> */}
//               </tr>
//             </thead>
//             <tbody>
//               {filteredData.length > 0 ? (
//                 filteredData.map((row, index) => (
//                   <tr
//                     key={index}
//                     className={`cursor-pointer transition ${
//                       selectedRow === index ? "bg-blue-500" : "hover:bg-gray-700"
//                     }`}
//                     onClick={() => handleRowSelect(index, row)} // Store the selected row
//                   >
//                     <td className="p-2 border border-white/30 text-center">
//                       <input
//                         type="checkbox"
//                         checked={selectedRow === index}
//                         onChange={() => setSelectedRow(index)}
//                       />
//                     </td>
//                     <td className="p-2 border border-white/30">{row.refno}</td>
//                     <td className="p-2 border border-white/30">{row.voucher_no}</td>
//                     <td className="p-2 border border-white/30">{row.msd_year}</td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan="4" className="p-4 text-center text-gray-400">
//                     No matching records found
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </motion.div>
//   );
// };

// export default Sidebar;



