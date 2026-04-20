// import React, { useState } from "react";
// import { Menu, X, LogOut, Home, Info, Settings, Mail } from "lucide-react";
// import { motion } from "framer-motion";

// const Header = () => {
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);

//   return (
//     <>
//       {/* HEADER BAR */}
//       <header className="fixed top-0 left-0 z-50 w-full p-3 transition-all bg-blue-500 shadow-lg backdrop-blur-lg">
//         <div className="relative flex items-center justify-between mx-auto max-w-10xl">
          
//           {/* Sidebar Toggle Button - Aligned to the Left Corner */}
//           <div className="absolute left-4">
//             <button
//               onClick={() => setIsSidebarOpen(true)}
//               className="p-2 text-white transition rounded-lg hover:bg-white/20"
//             >
//               <Menu size={28} className="text-white" />
//             </button>
//           </div>

//           {/* Logo - Centered */}
//           <motion.div 
//             initial={{ opacity: 0, y: -10 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.5 }}
//             className="mx-auto text-2xl font-bold tracking-wide text-white"
//           >
//             E - Wharf Clearance Portal
//           </motion.div>

//           {/* Profile Section - Right Side */}
// <motion.div 
//   initial={{ opacity: 0, x: 50 }}
//   animate={{ opacity: 1, x: 0 }}
//   transition={{ duration: 0.5 }}
//   className="flex items-center ml-auto space-x-4"
// >
//   {/* Profile Picture */}
//   <img 
//     src="https://via.placeholder.com/40" 
//     alt="Profile" 
//     className="w-10 h-10 border-2 border-white rounded-full shadow-md"
//   />
//   {/* Profile Name */}
//   <span className="font-semibold text-white">Randeer Withanage</span>

//   {/* Logout Button - Now Properly Right-Aligned */}
//   <div className="ml-auto">
//     <button className="flex items-center gap-2 px-3 py-2 text-white transition bg-red-500 rounded-lg shadow-md hover:bg-red-600">
//       <LogOut size={18} />
//       Logout
//     </button>
//   </div>
// </motion.div>

//         </div>
//       </header>

//       {/* SIDEBAR (Slide Menu) */}
//       <motion.div
//         initial={{ x: -300 }}
//         animate={isSidebarOpen ? { x: 0 } : { x: -300 }}
//         transition={{ type: "spring", stiffness: 120 }}
//         className={`fixed left-0 top-0 h-full w-64 bg-black/90 text-white shadow-xl p-5 z-50 ${isSidebarOpen ? 'block' : 'hidden'}`}
//       >
//         {/* Close Button */}
//         <button 
//           onClick={() => setIsSidebarOpen(false)}
//           className="absolute text-white transition top-3 right-3 hover:text-gray-400"
//         >
//           <X size={28} />
//         </button>

//         {/* Sidebar Links */}
//         <nav className="mt-8 space-y-6">
//           <a href="#home" className="flex items-center gap-3 text-lg font-medium transition hover:text-blue-400">
//             <Home size={22} /> Home
//           </a>
//           <a href="#about" className="flex items-center gap-3 text-lg font-medium transition hover:text-blue-400">
//             <Info size={22} /> About
//           </a>
//           <a href="#services" className="flex items-center gap-3 text-lg font-medium transition hover:text-blue-400">
//             <Settings size={22} /> Services
//           </a>
//           <a href="#contact" className="flex items-center gap-3 text-lg font-medium transition hover:text-blue-400">
//             <Mail size={22} /> Contact
//           </a>
//         </nav>
//       </motion.div>
//     </>
//   );
// };

// export default Header;

// import React, { useState } from "react";
// import { Menu, LogOut } from "lucide-react";
// import { motion } from "framer-motion";
// import Sidebar from "./Sidebar";


// const Header = () => {
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);

//   const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

//   return (
//     <>
//       {/* HEADER BAR */}
//       <header className="fixed top-0 left-0 z-50 w-full p-3 transition-all bg-blue-500 shadow-lg backdrop-blur-lg">
//         <div className="relative flex items-center justify-between mx-auto max-w-10xl">
          
//           {/* Sidebar Toggle Button - Aligned to the Left Corner */}
//           <div className="absolute left-4">
//             <button
//               onClick={toggleSidebar}
//               className="p-2 text-white transition rounded-lg hover:bg-white/20"
//             >
//               <Menu size={28} className="text-white" />
//             </button>
//           </div>

//           {/* Logo - Centered */}
//           <motion.div 
//             initial={{ opacity: 0, y: -10 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.5 }}
//             className="mx-auto text-2xl font-bold tracking-wide text-white"
//           >
//             E - Wharf Clearance Portal
//           </motion.div>

//           {/* Profile Section - Right Side */}
//           <motion.div 
//             initial={{ opacity: 0, x: 50 }}
//             animate={{ opacity: 1, x: 0 }}
//             transition={{ duration: 0.5 }}
//             className="flex items-center ml-auto space-x-4"
//           >
//             {/* Profile Picture */}
//             <img 
//               src="https://via.placeholder.com/40" 
//               alt="Profile" 
//               className="w-10 h-10 border-2 border-white rounded-full shadow-md"
//             />
//             {/* Profile Name */}
//             <span className="font-semibold text-white">Randeer Withanage</span>

//             {/* Logout Button - Now Properly Right-Aligned */}
//             <div className="ml-auto">
//               <button className="flex items-center gap-2 px-3 py-2 text-white transition bg-red-500 rounded-lg shadow-md hover:bg-red-600">
//                 <LogOut size={18} />
//                 Logout
//               </button>
//             </div>
//           </motion.div>
//         </div>
//       </header>

//       {/* Include Sidebar Component */}
//       <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
//     </>
//   );
// };

// export default Header;










// import React, { useState, useEffect } from "react";
// import { Menu, LogOut, Settings, User, Shield } from "lucide-react";
// import { motion } from "framer-motion";
// import Swal from "sweetalert2";
// import { useNavigate } from "react-router-dom";
// import logo from "../images/New Project223.png";
// import Sidebar from "./Sidebar";

// const Header = () => {
//   const navigate = useNavigate();
//   const [userName, setUserName] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);
//   const [showProfileMenu, setShowProfileMenu] = useState(false);
//   const [userType, setUserType] = useState("");
//   const [showAdminButton, setShowAdminButton] = useState(false);

//   const name = localStorage.getItem("username_store");

//   useEffect(() => {
//     const fetchUserName = async () => {
//       try {
//         const response = await fetch(
//           "https://esystems.cdl.lk/backend/PerformanceEvaluationNew/Login/GetUserDetails"
//         );
//         const data = await response.json();
//         if (data.StatusCode === 200 && data.ResultSet) {
//           setUserName(data.ResultSet.ReportName);
//         }
//       } catch (error) {
//         console.error("Error fetching user details:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     // Check user type and admin access
//     const storedUserType = localStorage.getItem("userType");
//     const storedRole = localStorage.getItem("role_store");
    
//     if (storedUserType === "A" && storedRole !== "Admin") {
//       setShowAdminButton(true);
//       setUserType(storedUserType);
//     }

//     fetchUserName();
//   }, []);

//   // Close profile menu when clicking outside
//   useEffect(() => {
//     const handleClickOutside = () => {
//       setShowProfileMenu(false);
//     };

//     document.addEventListener('click', handleClickOutside);
//     return () => {
//       document.removeEventListener('click', handleClickOutside);
//     };
//   }, []);

//   const handleLogoutConfirmation = () => {
//     Swal.fire({
//       title: "Are you sure?",
//       text: "You will be logged out!",
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonColor: "#3085D6",
//       cancelButtonColor: "#d33",
//       confirmButtonText: "Yes, logout!",
//     }).then((result) => {
//       if (result.isConfirmed) {
//         localStorage.clear();
//         navigate("/");
//         Swal.fire("Logged out!", "You have been successfully logged out.", "success");
//       }
//     });
//     setShowProfileMenu(false);
//   };

//   const handleSwitchToAdmin = () => {
//     localStorage.setItem("role_store", "Admin");
//     navigate("/admin");
//     setShowProfileMenu(false);
//   };

//   const toggleSidebar = () => {
//     setIsSidebarOpen(!isSidebarOpen);
//   };

//   const handleProfileClick = (e) => {
//     e.stopPropagation();
//     setShowProfileMenu(!showProfileMenu);
//   };

//   return (
//     <>
//       <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
//       <header
//         className="fixed top-0 left-0 w-full p-0 shadow-md transition-all duration-800 z-40"
//         style={{
//           backgroundColor: "#EEF2FF",
//           borderRadius: "20px",
//         }}
//       >
//         <div className="flex items-center justify-between max-w-10xl mx-auto px-4">
//           {/* Sidebar Toggle Button */}
//           <button
//             onClick={toggleSidebar}
//             className="p-2 text-blue-600 transition rounded-lg hover:bg-blue-100 border-0 border-blue-600"
//           >
//             <Menu size={24} />
//           </button>

//           {/* Logo - Centered */}
//           <motion.div 
//             initial={{ opacity: 0, y: -10 }} 
//             animate={{ opacity: 1, y: 0 }} 
//             transition={{ duration: 0.5 }}
//           >
//             <img src={logo} alt="CDPLC Logo" className="h-20 p-0" />
//           </motion.div>

//           {/* Profile Section */}
//           <motion.div 
//             initial={{ opacity: 0, x: 50 }} 
//             animate={{ opacity: 1, x: 0 }} 
//             transition={{ duration: 0.5 }} 
//             className="flex items-center space-x-3"
//           >
//             {loading ? (
//               <span className="text-lg font-bold text-blue-600">Loading...</span>
//             ) : (
//               <div className="flex items-center space-x-3">
//                 <span className="text-lg font-bold text-blue-600">
//                   Hello, {name}
//                 </span>
                
//                 {/* Profile Dropdown Trigger */}
//                 <div className="relative">
//                   <button
//                     onClick={handleProfileClick}
//                     className="flex items-center gap-2 px-3 py-2 text-white transition bg-blue-600 rounded-lg hover:bg-blue-700 shadow-md"
//                   >
//                     <User size={18} />
//                     <span className="text-sm">Profile</span>
//                   </button>

//                   {/* Profile Dropdown Menu */}
//                   {showProfileMenu && (
//                     <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
//                       {/* User Info */}
//                       <div className="px-4 py-3 border-b border-gray-100">
//                         <div className="font-medium text-gray-900 text-sm">{name}</div>
//                         <div className="text-gray-500 text-xs mt-1">
//                           {userName && `${userName} • `}User
//                         </div>
//                       </div>

//                       {/* Switch to Admin Button - Only for admin users */}
//                       {showAdminButton && (
//                         <button
//                           onClick={handleSwitchToAdmin}
//                           className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors border-b border-gray-100"
//                         >
//                           <Shield className="w-4 h-4 mr-3 text-purple-600" />
//                           <div className="text-left">
//                             <div className="font-medium">Switch to Admin</div>
//                             <div className="text-xs text-gray-500">Access admin panel</div>
//                           </div>
//                         </button>
//                       )}

//                       {/* Logout Button */}
//                       <button
//                         onClick={handleLogoutConfirmation}
//                         className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
//                       >
//                         <LogOut className="w-4 h-4 mr-3 text-red-500" />
//                         <div className="text-left">
//                           <div className="font-medium">Logout</div>
//                           <div className="text-xs text-gray-500">Sign out of your account</div>
//                         </div>
//                       </button>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             )}
//           </motion.div>
//         </div>
//       </header>

//       {/* Backdrop for mobile */}
//       {showProfileMenu && (
//         <div 
//           className="fixed inset-0 bg-black bg-opacity-10 z-30"
//           onClick={() => setShowProfileMenu(false)}
//         />
//       )}
//     </>
//   );
// };

// export default Header;












import React, { useState, useEffect } from "react";
import { Menu, LogOut, User, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import logo from "../images/New Project223.png";
import Sidebar from "./Sidebar";

const Header = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const name = localStorage.getItem("username_store") || "";
  
  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const response = await fetch(
          "https://esystems.cdl.lk/backend/PerformanceEvaluationNew/Login/GetUserDetails"
        );
        const data = await response.json();
        if (data.StatusCode === 200 && data.ResultSet) {
          setUserName(data.ResultSet.ReportName);
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserName();
  }, []);

  const handleLogoutConfirmation = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You will be logged out!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085D6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, logout!",
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.clear();
        navigate("/");
        Swal.fire("Logged out!", "You have been successfully logged out.", "success");
      }
    });
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Format the name properly
  const displayName = name || userName;
  const formattedName = displayName 
    ? displayName.split(',').map(part => part.trim()).filter(part => part).join(', ')
    : "User";

  return (
    <>
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <header
        className="fixed top-0 left-0 w-full p-0 shadow-md transition-all duration-800 z-50"
        style={{
          backgroundColor: "#EEF2FF",
          borderRadius: "20px",
        }}
      >
        <div className="flex items-center justify-between max-w-10xl mx-auto">
          {/* Sidebar Toggle Button */}
          <button
            onClick={toggleSidebar}
            className="p-2 text-blue-600 transition rounded-lg hover:bg-blue-100 border-0 border-blue-600"
          >
            <Menu size={24} />
          </button>

          {/* Logo - Centered */}
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5 }}
          >
            <img src={logo} alt="CDPLC Logo" className="h-20 p-0" />
          </motion.div>

          {/* User Profile & Logout - Right Aligned */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ duration: 0.5 }} 
            className="flex items-center space-x-3 pr-2"
          >
            {/* User Profile Section */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-blue-100 hover:border-blue-300 hover:shadow-sm transition-all duration-200"
              >
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                  <User size={14} />
                </div>
                
                <div className="flex flex-col items-start">
                  {loading ? (
                    <div className="h-3 w-20 bg-gray-200 rounded animate-pulse"></div>
                  ) : (
                    <>
                      <span className="text-xs font-medium text-gray-800 leading-tight">
                        Welcome,
                      </span>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-600 truncate max-w-[100px]">
                          {formattedName}
                        </span>
                        <ChevronDown 
                          size={12} 
                          className={`text-gray-500 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`}
                        />
                      </div>
                    </>
                  )}
                </div>
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-1 w-56 bg-white rounded-lg shadow-md border border-gray-200 py-1 z-50">
                  <div className="px-3 py-2 border-b border-gray-100">
                    <p className="text-xs font-medium text-gray-900">User Profile</p>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">{formattedName}</p>
                  </div>
                  
                  {/* Logout Button in Dropdown */}
                  <button
                    onClick={handleLogoutConfirmation}
                    className="w-full flex items-center justify-between px-3 py-2 text-left text-red-600 hover:bg-red-50 transition-colors duration-200"
                  >
                    <div className="flex items-center gap-2">
                      <div className="p-1 bg-red-100 rounded-md">
                        <LogOut size={14} className="text-red-600" />
                      </div>
                      <div>
                        <p className="text-xs font-medium">Logout</p>
                        <p className="text-xs text-gray-500">Sign out from account</p>
                      </div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Standalone Logout Button (small version) */}
            {/* <button
              onClick={handleLogoutConfirmation}
              className="flex items-center justify-center gap-1 px-2 py-2 text-red-600 bg-white rounded-lg border border-red-300 hover:bg-red-50 hover:border-red-500 hover:text-red-700 transition-all duration-200 shadow-sm hover:shadow"
              title="Logout"
            >
              <LogOut size={18} />
              <span className="text-sm font-medium">Logout</span>
            </button> */}
          </motion.div>
        </div>
      </header>
      
      {/* Click outside to close dropdown */}
      {showUserMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </>
  );
};

export default Header;






