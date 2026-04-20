import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FiMenu, 
  FiLogOut, 
  FiUser, 
  FiCheck, 
  FiX, 
  FiChevronLeft, 
  FiChevronRight,
  FiHome,
  FiList,
  FiUsers,
  FiSettings,
  FiSearch,
  FiRefreshCw,
  FiShield,
  FiBarChart2
} from "react-icons/fi";
import { useMediaQuery } from "react-responsive";

export default function AdminManagement() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("pending");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [adminName, setAdminName] = useState("Admin User");
  const [companyName, setCompanyName] = useState("Admin Management");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const isMobile = useMediaQuery({ maxWidth: 768 });

  // Sample data
  const [users, setUsers] = useState({ pending: [], approved: [] });

  // Get admin name and company name from localStorage on component mount
  useEffect(() => {
    const storedUsername = localStorage.getItem("username_store");
    if (storedUsername) {
      setAdminName(storedUsername);
    }
  }, []);

  const fetchPendingUsers = async () => {
    const user = localStorage.getItem("comid");
    try {
      const response = await fetch(`https://esystems.cdl.lk/backend-test/ewharf/User/PRegisteredList?comid=${user}`);
       
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.StatusCode === 200 && data.ResultSet) {
        // Transform API data to match our component structure
        const pendingUsers = data.ResultSet
          .filter(user => user.Emp_Status === "Pending")
          .map(user => ({
            sampleCode: user.Emp_Id,
            userName: user.Emp_Name, // Changed from Emp_ComId to Emp_Name
            email: user.Emp_Email,
            mobile: user.Emp_TelNo,
            address: user.Emp_Address,
            status: user.Emp_Status
          }));
        
        return pendingUsers;
      } else {
        setError("Invalid API response format for pending users");
        return [];
      }
    } catch (err) {
      setError(err.message);
      console.error("Error fetching pending users:", err);
      return [];
    }
  };

  const fetchApprovedUsers = async () => {
    const user = localStorage.getItem("comid");
    try {
      const response = await fetch(`https://esystems.cdl.lk/backend-test/ewharf/User/ActiveUserList?comid=${user}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.StatusCode === 200 && data.ResultSet) {
        // Transform API data to match our component structure
        const approvedUsers = data.ResultSet.map(user => ({
          sampleCode: user.Us_Id,
          userName: user.Us_Name, // Keep Us_Name for approved users
          email: user.Us_Email,
          mobile: user.Us_TelNo,
          address: user.Us_Address,
          status: "Approved"
        }));
        
        // Set company name from the first user's company name if available
        if (data.ResultSet.length > 0 && data.ResultSet[0].Us_ComName) {
          setCompanyName(data.ResultSet[0].Us_ComName);
        }
        
        return approvedUsers;
      } else {
        setError("Invalid API response format for approved users");
        return [];
      }
    } catch (err) {
      setError(err.message);
      console.error("Error fetching approved users:", err);
      return [];
    }
  };

  const fetchAllUsers = async () => {
    try {
      setLoading(true);
      const [pending, approved] = await Promise.all([
        fetchPendingUsers(),
        fetchApprovedUsers()
      ]);
      
      setUsers({
        pending: pending,
        approved: approved
      });
    } catch (err) {
      console.error("Error in fetchAllUsers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllUsers();
  }, []);

  const handleRefresh = () => {
    fetchAllUsers();
  };

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowProfileMenu(false);
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  // Auto-close sidebar on mobile when clicking outside
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  }, [isMobile]);

  // Filter users based on search query
  const filteredUsers = {
    pending: users.pending.filter(user =>
      Object.values(user).some(
        value => value && value.toString().toLowerCase().includes(searchQuery.toLowerCase())
      )
    ),
    approved: users.approved.filter(user =>
      Object.values(user).some(
        value => value && value.toString().toLowerCase().includes(searchQuery.toLowerCase())
      )
    ),
  };

  const handleApprove = async (sampleCode) => {
    try {
      setActionLoading(sampleCode);
      
      const response = await fetch('https://esystems.cdl.lk/backend-test/ewharf/User/ActiveUser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          Emp_Id: sampleCode
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.StatusCode === 200) {
        setSuccess("User approved successfully!");
        setTimeout(() => setSuccess(null), 3000);
        // Refresh the data
        fetchAllUsers();
      } else {
        setError("Failed to approve user: " + (data.Message || "Unknown error"));
      }
    } catch (err) {
      console.error("Error approving user:", err);
      setError("Failed to approve user: " + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (sampleCode, listType) => {
    try {
      setActionLoading(sampleCode);
      
      const response = await fetch('https://esystems.cdl.lk/backend-test/ewharf/User/DeleteSupplier', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          Emp_Id: sampleCode
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.StatusCode === 200) {
        setSuccess("User deleted successfully!");
        setTimeout(() => setSuccess(null), 3000);
        // Refresh the data
        fetchAllUsers();
      } else {
        setError("Failed to delete user: " + (data.Message || "Unknown error"));
      }
    } catch (err) {
      console.error("Error deleting user:", err);
      setError("Failed to delete user: " + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("username_store");
    localStorage.removeItem("role_store");
    navigate("/");
  };

  const handleSwitchToUser = () => {
    localStorage.setItem("role_store", "User");
    navigate("/home");
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => 
      prev === filteredUsers[activeTab].length - 1 ? 0 : prev + 1
    );
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => 
      prev === 0 ? filteredUsers[activeTab].length - 1 : prev - 1
    );
  };

  const handleProfileClick = (e) => {
    e.stopPropagation();
    setShowProfileMenu(!showProfileMenu);
  };

  const handleEWARFInterface = () => {
    // Navigate to E-WARF Interface or open in new tab
    window.open('/home', '_blank');
  };

  return (
    <div className="flex h-screen bg-gray-100 relative">
      {/* Sidebar - Desktop */}
      <div
        className={`${sidebarOpen ? "w-64" : "w-20"} bg-blue-800 text-white transition-all duration-300 ease-in-out hidden md:block`}
      >
        <div className="p-4 flex items-center justify-between">
          {sidebarOpen ? (
            <h1 className="text-xl font-bold">Admin Panel</h1>
          ) : (
            <div className="w-8 h-8 bg-blue-700 rounded-full"></div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 rounded-lg hover:bg-blue-700"
          >
            <FiMenu size={20} />
          </button>
        </div>

        <div className="mt-8">
          <div
            className={`flex items-center p-4 ${activeTab === "pending" ? "bg-blue-700" : "hover:bg-blue-700"} cursor-pointer`}
            onClick={() => setActiveTab("pending")}
          >
            <FiUser className="mr-3" size={20} />
            {sidebarOpen && <span>Pending Users</span>}
          </div>
          <div
            className={`flex items-center p-4 ${activeTab === "approved" ? "bg-blue-700" : "hover:bg-blue-700"} cursor-pointer`}
            onClick={() => setActiveTab("approved")}
          >
            <FiCheck className="mr-3" size={20} />
            {sidebarOpen && <span>Approved Users</span>}
          </div>
          <div
            className={`flex items-center p-4 hover:bg-blue-700 cursor-pointer`}
            onClick={handleEWARFInterface}
          >
            <FiBarChart2 className="mr-3" size={20} />
            {sidebarOpen && <span>E-WARF Interface</span>}
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Mobile Sidebar */}
      <div
        className={`${sidebarOpen && isMobile ? "translate-x-0" : "-translate-x-full"} fixed inset-y-0 left-0 w-64 bg-blue-800 text-white transition-transform duration-300 ease-in-out z-30 md:hidden`}
      >
        <div className="p-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">Admin Panel</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1 rounded-lg hover:bg-blue-700"
          >
            <FiX size={20} />
          </button>
        </div>

        <div className="mt-8">
          <div
            className={`flex items-center p-4 ${activeTab === "pending" ? "bg-blue-700" : "hover:bg-blue-700"} cursor-pointer`}
            onClick={() => {
              setActiveTab("pending");
              setSidebarOpen(false);
            }}
          >
            <FiUser className="mr-3" size={20} />
            <span>Pending Users</span>
          </div>
          <div
            className={`flex items-center p-4 ${activeTab === "approved" ? "bg-blue-700" : "hover:bg-blue-700"} cursor-pointer`}
            onClick={() => {
              setActiveTab("approved");
              setSidebarOpen(false);
            }}
          >
            <FiCheck className="mr-3" size={20} />
            <span>Approved Users</span>
          </div>
          <div
            className={`flex items-center p-4 hover:bg-blue-700 cursor-pointer`}
            onClick={() => {
              handleEWARFInterface();
              setSidebarOpen(false);
            }}
          >
            <FiBarChart2 className="mr-3" size={20} />
            <span>E-WARF Interface</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <header className="bg-white shadow-sm z-10">
          <div className="flex items-center justify-between px-4 py-3 md:px-6 md:py-4">
            <div className="flex items-center">
              {isMobile && (
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="p-2 mr-2 text-gray-500 rounded-lg hover:bg-gray-100"
                >
                  <FiMenu size={20} />
                </button>
              )}
              <h2 className="text-lg md:text-xl font-semibold text-gray-800">
                {companyName} {/* Changed from "Admin Management" to dynamic company name */}
              </h2>
            </div>
            <div className="flex items-center space-x-3 md:space-x-4">
              <button
                onClick={handleSwitchToUser}
                className="hidden md:flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <FiUser className="mr-2" size={16} />
                Switch to User
              </button>
              <div className="relative">
                <div 
                  className="flex items-center cursor-pointer"
                  onClick={handleProfileClick}
                >
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                    <FiShield className="text-blue-600" />
                  </div>
                  <span className="text-sm font-medium hidden sm:inline">{adminName}</span>
                  {isMobile && (
                    <span className="text-sm font-medium sm:hidden ml-1">{adminName}</span>
                  )}
                </div>
                
                {/* Profile Dropdown Menu */}
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                      <div className="font-medium">{adminName}</div>
                      <div className="text-gray-500 text-xs">Administrator</div>
                    </div>
                    <button
                      onClick={handleSwitchToUser}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 md:hidden"
                    >
                      <FiUser className="mr-2" size={16} />
                      Switch to User
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <FiLogOut className="mr-2" size={16} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
              {!isMobile && (
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-500 rounded-full hover:bg-gray-100"
                  title="Logout"
                >
                  <FiLogOut size={18} />
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Success/Error Messages */}
        {success && (
          <div className="mx-4 mt-4 md:mx-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            {success}
          </div>
        )}
        {error && (
          <div className="mx-4 mt-4 md:mx-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50 pb-20 md:pb-6">
          {/* Search Bar and Refresh Button */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 space-y-2 md:space-y-0">
            <div className="relative flex-1 md:max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search users..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button
              onClick={handleRefresh}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FiRefreshCw className="mr-2" />
              Refresh
            </button>
          </div>

          {/* Mobile Tabs */}
          {isMobile && !loading && (
            <div className="flex mb-4 bg-white rounded-lg shadow p-1">
              <button
                onClick={() => setActiveTab("pending")}
                className={`flex-1 py-2 text-sm font-medium rounded-md ${activeTab === "pending" ? "bg-blue-100 text-blue-700" : "text-gray-600"}`}
              >
                Pending
              </button>
              <button
                onClick={() => setActiveTab("approved")}
                className={`flex-1 py-2 text-sm font-medium rounded-md ${activeTab === "approved" ? "bg-blue-100 text-blue-700" : "text-gray-600"}`}
              >
                Approved
              </button>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          )}

          {/* Mobile Slider View */}
          {!loading && (
            <div className="md:hidden mb-6">
              <div className="relative bg-white rounded-xl shadow-md p-6">
                {filteredUsers[activeTab].length > 0 ? (
                  <>
                    <div className="relative h-64 overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <p className="text-sm text-gray-500">Sample Code</p>
                          <p className="text-lg font-medium mb-4">
                            {filteredUsers[activeTab][currentSlide].sampleCode}
                          </p>

                          <p className="text-sm text-gray-500">User Name</p>
                          <p className="text-lg font-medium mb-4">
                            {filteredUsers[activeTab][currentSlide].userName}
                          </p>

                          <p className="text-sm text-gray-500">Email</p>
                          <p className="text-lg font-medium mb-4">
                            {filteredUsers[activeTab][currentSlide].email}
                          </p>

                          <p className="text-sm text-gray-500">Mobile</p>
                          <p className="text-lg font-medium mb-4">
                            {filteredUsers[activeTab][currentSlide].mobile}
                          </p>

                          <p className="text-sm text-gray-500">Address</p>
                          <p className="text-lg font-medium">
                            {filteredUsers[activeTab][currentSlide].address}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between mt-4">
                      <button
                        onClick={prevSlide}
                        className="p-2 rounded-full bg-gray-200 hover:bg-gray-300"
                      >
                        <FiChevronLeft />
                      </button>
                      <div className="flex items-center">
                        {filteredUsers[activeTab].map((_, index) => (
                          <div
                            key={index}
                            className={`w-2 h-2 mx-1 rounded-full ${currentSlide === index ? "bg-blue-600" : "bg-gray-300"}`}
                          ></div>
                        ))}
                      </div>
                      <button
                        onClick={nextSlide}
                        className="p-2 rounded-full bg-gray-200 hover:bg-gray-300"
                      >
                        <FiChevronRight />
                      </button>
                    </div>
                    <div className="flex justify-center mt-4 space-x-4">
                      {activeTab === "pending" && (
                        <button
                          onClick={() => handleApprove(filteredUsers[activeTab][currentSlide].sampleCode)}
                          disabled={actionLoading === filteredUsers[activeTab][currentSlide].sampleCode}
                          className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
                        >
                          {actionLoading === filteredUsers[activeTab][currentSlide].sampleCode ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                          ) : (
                            <FiCheck className="mr-2" />
                          )}
                          Approve
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(filteredUsers[activeTab][currentSlide].sampleCode, activeTab)}
                        disabled={actionLoading === filteredUsers[activeTab][currentSlide].sampleCode}
                        className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
                      >
                        {actionLoading === filteredUsers[activeTab][currentSlide].sampleCode ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                        ) : (
                          <FiX className="mr-2" />
                        )}
                        Delete
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-10 text-gray-500">
                    No {activeTab} users found
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Desktop Table View */}
          {!loading && (
            <div className="hidden md:block bg-white shadow rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sample Code
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Mobile
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Address
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers[activeTab].length > 0 ? (
                      filteredUsers[activeTab].map((user) => (
                        <tr key={user.sampleCode} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.sampleCode}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {user.userName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.mobile}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {user.address}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              {activeTab === "pending" && (
                                <button
                                  onClick={() => handleApprove(user.sampleCode)}
                                  disabled={actionLoading === user.sampleCode}
                                  className="flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 disabled:opacity-50"
                                >
                                  {actionLoading === user.sampleCode ? (
                                    <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-green-700 mr-1"></div>
                                  ) : (
                                    <FiCheck className="mr-1" />
                                  )}
                                  Approve
                                </button>
                              )}
                              <button
                                onClick={() => handleDelete(user.sampleCode, activeTab)}
                                disabled={actionLoading === user.sampleCode}
                                className="flex items-center px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 disabled:opacity-50"
                              >
                                {actionLoading === user.sampleCode ? (
                                  <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-red-700 mr-1"></div>
                                ) : (
                                  <FiX className="mr-1" />
                                )}
                                Delete
                              </button> 
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                          No {activeTab} users found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg z-10 border-t border-gray-200">
          <div className="flex justify-around items-center h-16">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex flex-col items-center justify-center p-2 text-gray-600 hover:text-blue-600"
            >
              <FiHome size={20} />
              <span className="text-xs mt-1">Home</span>
            </button>
            <button
              onClick={() => setActiveTab("pending")}
              className={`flex flex-col items-center justify-center p-2 ${activeTab === "pending" ? "text-blue-600" : "text-gray-600"}`}
            >
              <FiList size={20} />
              <span className="text-xs mt-1">Pending</span>
            </button>
            <button
              onClick={() => setActiveTab("approved")}
              className={`flex flex-col items-center justify-center p-2 ${activeTab === "approved" ? "text-blue-600" : "text-gray-600"}`}
            >
              <FiUsers size={20} />
              <span className="text-xs mt-1">Approved</span>
            </button>
            <button
              onClick={handleEWARFInterface}
              className="flex flex-col items-center justify-center p-2 text-gray-600 hover:text-blue-600"
            >
              <FiBarChart2 size={20} />
              <span className="text-xs mt-1">E-WARF</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}







// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { 
//   FiMenu, 
//   FiLogOut, 
//   FiUser, 
//   FiCheck, 
//   FiX, 
//   FiChevronLeft, 
//   FiChevronRight,
//   FiHome,
//   FiList,
//   FiUsers,
//   FiSettings,
//   FiSearch,
//   FiRefreshCw,
//   FiShield,
//   FiBarChart2
// } from "react-icons/fi";
// import { useMediaQuery } from "react-responsive";

// export default function AdminManagement() {
//   const navigate = useNavigate();
//   const [activeTab, setActiveTab] = useState("pending");
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [currentSlide, setCurrentSlide] = useState(0);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [success, setSuccess] = useState(null);
//   const [actionLoading, setActionLoading] = useState(null);
//   const [adminName, setAdminName] = useState("Admin User");
//   const [companyName, setCompanyName] = useState("Admin Management");
//   const [showProfileMenu, setShowProfileMenu] = useState(false);
//   const isMobile = useMediaQuery({ maxWidth: 768 });

//   // Sample data
//   const [users, setUsers] = useState({ pending: [], approved: [] });

//   // Get admin name and company name from localStorage on component mount
//   useEffect(() => {
//     const storedUsername = localStorage.getItem("username_store");
//     if (storedUsername) {
//       setAdminName(storedUsername);
//     }
//   }, []);

//   const fetchPendingUsers = async () => {
//     const user = localStorage.getItem("comid");
//     try {
//       const response = await fetch(`https://esystems.cdl.lk/backend-test/ewharf/User/PRegisteredList?comid=${user}`);
       
      
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }
      
//       const data = await response.json();
      
//       if (data.StatusCode === 200 && data.ResultSet) {
//         // Transform API data to match our component structure
//         const pendingUsers = data.ResultSet
//           .filter(user => user.Emp_Status === "Pending")
//           .map(user => ({
//             sampleCode: user.Emp_Id,
//             userName: user.Emp_Name, // Changed from Emp_ComId to Emp_Name
//             email: user.Emp_Email,
//             mobile: user.Emp_TelNo,
//             address: user.Emp_Address,
//             status: user.Emp_Status,
//             companyId: user.Emp_ComId // Store company ID for company name
//           }));
        
//         // Set company name from the first pending user if available
//         if (pendingUsers.length > 0 && pendingUsers[0].companyId) {
//           setCompanyName(pendingUsers[0].companyId);
//         }
        
//         return pendingUsers;
//       } else {
//         setError("Invalid API response format for pending users");
//         return [];
//       }
//     } catch (err) {
//       setError(err.message);
//       console.error("Error fetching pending users:", err);
//       return [];
//     }
//   };

//   const fetchApprovedUsers = async () => {
//     const user = localStorage.getItem("comid");
//     try {
//       const response = await fetch(` https://esystems.cdl.lk/backend-test/ewharf/User/ActiveUserList?comid=${user}`);
      
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }
      
//       const data = await response.json();
      
//       if (data.StatusCode === 200 && data.ResultSet) {
//         // Transform API data to match our component structure
//         const approvedUsers = data.ResultSet.map(user => ({
//           sampleCode: user.Us_Id,
//           userName: user.Us_Name, // Using Us_Name for user name
//           email: user.Us_Email,
//           mobile: user.Us_TelNo,
//           address: user.Us_Address,
//           status: "Approved",
//           companyId: user.Us_ComId // Store company ID
//         }));
        
//         return approvedUsers;
//       } else {
//         setError("Invalid API response format for approved users");
//         return [];
//       }
//     } catch (err) {
//       setError(err.message);
//       console.error("Error fetching approved users:", err);
//       return [];
//     }
//   };

//   const fetchAllUsers = async () => {
//     try {
//       setLoading(true);
//       const [pending, approved] = await Promise.all([
//         fetchPendingUsers(),
//         fetchApprovedUsers()
//       ]);
      
//       setUsers({
//         pending: pending,
//         approved: approved
//       });
//     } catch (err) {
//       console.error("Error in fetchAllUsers:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchAllUsers();
//   }, []);

//   const handleRefresh = () => {
//     fetchAllUsers();
//   };

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

//   // Auto-close sidebar on mobile when clicking outside
//   useEffect(() => {
//     if (isMobile) {
//       setSidebarOpen(false);
//     } else {
//       setSidebarOpen(true);
//     }
//   }, [isMobile]);

//   // Filter users based on search query
//   const filteredUsers = {
//     pending: users.pending.filter(user =>
//       Object.values(user).some(
//         value => value && value.toString().toLowerCase().includes(searchQuery.toLowerCase())
//       )
//     ),
//     approved: users.approved.filter(user =>
//       Object.values(user).some(
//         value => value && value.toString().toLowerCase().includes(searchQuery.toLowerCase())
//       )
//     ),
//   };

//   const handleApprove = async (sampleCode) => {
//     try {
//       setActionLoading(sampleCode);
      
//       const response = await fetch('https://esystems.cdl.lk/backend-test/ewharf/User/ActiveUser', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           Emp_Id: sampleCode
//         })
//       });
      
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }
      
//       const data = await response.json();
      
//       if (data.StatusCode === 200) {
//         setSuccess("User approved successfully!");
//         setTimeout(() => setSuccess(null), 3000);
//         // Refresh the data
//         fetchAllUsers();
//       } else {
//         setError("Failed to approve user: " + (data.Message || "Unknown error"));
//       }
//     } catch (err) {
//       console.error("Error approving user:", err);
//       setError("Failed to approve user: " + err.message);
//     } finally {
//       setActionLoading(null);
//     }
//   };

//   const handleDelete = async (sampleCode, listType) => {
//     try {
//       setActionLoading(sampleCode);
      
//       const response = await fetch('https://esystems.cdl.lk/backend-test/ewharf/User/DeleteSupplier', {
//         method: 'DELETE',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           Emp_Id: sampleCode
//         })
//       });
      
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }
      
//       const data = await response.json();
      
//       if (data.StatusCode === 200) {
//         setSuccess("User deleted successfully!");
//         setTimeout(() => setSuccess(null), 3000);
//         // Refresh the data
//         fetchAllUsers();
//       } else {
//         setError("Failed to delete user: " + (data.Message || "Unknown error"));
//       }
//     } catch (err) {
//       console.error("Error deleting user:", err);
//       setError("Failed to delete user: " + err.message);
//     } finally {
//       setActionLoading(null);
//     }
//   };

//   const handleLogout = () => {
//     localStorage.removeItem("username_store");
//     localStorage.removeItem("role_store");
//     navigate("/");
//   };

//   const handleSwitchToUser = () => {
//     localStorage.setItem("role_store", "User");
//     navigate("/home");
//   };

//   const nextSlide = () => {
//     setCurrentSlide((prev) => 
//       prev === filteredUsers[activeTab].length - 1 ? 0 : prev + 1
//     );
//   };

//   const prevSlide = () => {
//     setCurrentSlide((prev) => 
//       prev === 0 ? filteredUsers[activeTab].length - 1 : prev - 1
//     );
//   };

//   const handleProfileClick = (e) => {
//     e.stopPropagation();
//     setShowProfileMenu(!showProfileMenu);
//   };

//   const handleEWARFInterface = () => {
//     // Navigate to E-WARF Interface or open in new tab
//     window.open('/home', '_blank');
//   };

//   return (
//     <div className="flex h-screen bg-gray-100 relative">
//       {/* Sidebar - Desktop */}
//       <div
//         className={`${sidebarOpen ? "w-64" : "w-20"} bg-blue-800 text-white transition-all duration-300 ease-in-out hidden md:block`}
//       >
//         <div className="p-4 flex items-center justify-between">
//           {sidebarOpen ? (
//             <h1 className="text-xl font-bold">Admin Panel</h1>
//           ) : (
//             <div className="w-8 h-8 bg-blue-700 rounded-full"></div>
//           )}
//           <button
//             onClick={() => setSidebarOpen(!sidebarOpen)}
//             className="p-1 rounded-lg hover:bg-blue-700"
//           >
//             <FiMenu size={20} />
//           </button>
//         </div>

//         <div className="mt-8">
//           <div
//             className={`flex items-center p-4 ${activeTab === "pending" ? "bg-blue-700" : "hover:bg-blue-700"} cursor-pointer`}
//             onClick={() => setActiveTab("pending")}
//           >
//             <FiUser className="mr-3" size={20} />
//             {sidebarOpen && <span>Pending Users</span>}
//           </div>
//           <div
//             className={`flex items-center p-4 ${activeTab === "approved" ? "bg-blue-700" : "hover:bg-blue-700"} cursor-pointer`}
//             onClick={() => setActiveTab("approved")}
//           >
//             <FiCheck className="mr-3" size={20} />
//             {sidebarOpen && <span>Approved Users</span>}
//           </div>
//           <div
//             className={`flex items-center p-4 hover:bg-blue-700 cursor-pointer`}
//             onClick={handleEWARFInterface}
//           >
//             <FiBarChart2 className="mr-3" size={20} />
//             {sidebarOpen && <span>E-WARF Interface</span>}
//           </div>
//         </div>
//       </div>

//       {/* Mobile Sidebar Overlay */}
//       {sidebarOpen && isMobile && (
//         <div 
//           className="fixed inset-0 bg-black bg-opacity-50 z-20"
//           onClick={() => setSidebarOpen(false)}
//         ></div>
//       )}

//       {/* Mobile Sidebar */}
//       <div
//         className={`${sidebarOpen && isMobile ? "translate-x-0" : "-translate-x-full"} fixed inset-y-0 left-0 w-64 bg-blue-800 text-white transition-transform duration-300 ease-in-out z-30 md:hidden`}
//       >
//         <div className="p-4 flex items-center justify-between">
//           <h1 className="text-xl font-bold">Admin Panel</h1>
//           <button
//             onClick={() => setSidebarOpen(false)}
//             className="p-1 rounded-lg hover:bg-blue-700"
//           >
//             <FiX size={20} />
//           </button>
//         </div>

//         <div className="mt-8">
//           <div
//             className={`flex items-center p-4 ${activeTab === "pending" ? "bg-blue-700" : "hover:bg-blue-700"} cursor-pointer`}
//             onClick={() => {
//               setActiveTab("pending");
//               setSidebarOpen(false);
//             }}
//           >
//             <FiUser className="mr-3" size={20} />
//             <span>Pending Users</span>
//           </div>
//           <div
//             className={`flex items-center p-4 ${activeTab === "approved" ? "bg-blue-700" : "hover:bg-blue-700"} cursor-pointer`}
//             onClick={() => {
//               setActiveTab("approved");
//               setSidebarOpen(false);
//             }}
//           >
//             <FiCheck className="mr-3" size={20} />
//             <span>Approved Users</span>
//           </div>
//           <div
//             className={`flex items-center p-4 hover:bg-blue-700 cursor-pointer`}
//             onClick={() => {
//               handleEWARFInterface();
//               setSidebarOpen(false);
//             }}
//           >
//             <FiBarChart2 className="mr-3" size={20} />
//             <span>E-WARF Interface</span>
//           </div>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="flex-1 flex flex-col overflow-hidden">
//         {/* Top Navigation */}
//         <header className="bg-white shadow-sm z-10">
//           <div className="flex items-center justify-between px-4 py-3 md:px-6 md:py-4">
//             <div className="flex items-center">
//               {isMobile && (
//                 <button
//                   onClick={() => setSidebarOpen(!sidebarOpen)}
//                   className="p-2 mr-2 text-gray-500 rounded-lg hover:bg-gray-100"
//                 >
//                   <FiMenu size={20} />
//                 </button>
//               )}
//               <h2 className="text-lg md:text-xl font-semibold text-gray-800">
//                 {companyName} {/* Changed from "Admin Management" to dynamic company name */}
//               </h2>
//             </div>
//             <div className="flex items-center space-x-3 md:space-x-4">
//               <button
//                 onClick={handleSwitchToUser}
//                 className="hidden md:flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
//               >
//                 <FiUser className="mr-2" size={16} />
//                 Switch to User
//               </button>
//               <div className="relative">
//                 <div 
//                   className="flex items-center cursor-pointer"
//                   onClick={handleProfileClick}
//                 >
//                   <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2">
//                     <FiShield className="text-blue-600" />
//                   </div>
//                   <span className="text-sm font-medium hidden sm:inline">{adminName}</span>
//                   {isMobile && (
//                     <span className="text-sm font-medium sm:hidden ml-1">{adminName}</span>
//                   )}
//                 </div>
                
//                 {/* Profile Dropdown Menu */}
//                 {showProfileMenu && (
//                   <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
//                     <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
//                       <div className="font-medium">{adminName}</div>
//                       <div className="text-gray-500 text-xs">Administrator</div>
//                     </div>
//                     <button
//                       onClick={handleSwitchToUser}
//                       className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 md:hidden"
//                     >
//                       <FiUser className="mr-2" size={16} />
//                       Switch to User
//                     </button>
//                     <button
//                       onClick={handleLogout}
//                       className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//                     >
//                       <FiLogOut className="mr-2" size={16} />
//                       Logout
//                     </button>
//                   </div>
//                 )}
//               </div>
//               {!isMobile && (
//                 <button
//                   onClick={handleLogout}
//                   className="p-2 text-gray-500 rounded-full hover:bg-gray-100"
//                   title="Logout"
//                 >
//                   <FiLogOut size={18} />
//                 </button>
//               )}
//             </div>
//           </div>
//         </header>

//         {/* Success/Error Messages */}
//         {success && (
//           <div className="mx-4 mt-4 md:mx-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
//             {success}
//           </div>
//         )}
//         {error && (
//           <div className="mx-4 mt-4 md:mx-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
//             {error}
//           </div>
//         )}

//         {/* Main Content Area */}
//         <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50 pb-20 md:pb-6">
//           {/* Search Bar and Refresh Button */}
//           <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 space-y-2 md:space-y-0">
//             <div className="relative flex-1 md:max-w-md">
//               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                 <FiSearch className="text-gray-400" />
//               </div>
//               <input
//                 type="text"
//                 placeholder="Search users..."
//                 className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//               />
//             </div>
//             <button
//               onClick={handleRefresh}
//               className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//             >
//               <FiRefreshCw className="mr-2" />
//               Refresh
//             </button>
//           </div>

//           {/* Mobile Tabs */}
//           {isMobile && !loading && (
//             <div className="flex mb-4 bg-white rounded-lg shadow p-1">
//               <button
//                 onClick={() => setActiveTab("pending")}
//                 className={`flex-1 py-2 text-sm font-medium rounded-md ${activeTab === "pending" ? "bg-blue-100 text-blue-700" : "text-gray-600"}`}
//               >
//                 Pending
//               </button>
//               <button
//                 onClick={() => setActiveTab("approved")}
//                 className={`flex-1 py-2 text-sm font-medium rounded-md ${activeTab === "approved" ? "bg-blue-100 text-blue-700" : "text-gray-600"}`}
//               >
//                 Approved
//               </button>
//             </div>
//           )}

//           {/* Loading State */}
//           {loading && (
//             <div className="flex justify-center items-center py-12">
//               <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
//             </div>
//           )}

//           {/* Mobile Slider View */}
//           {!loading && (
//             <div className="md:hidden mb-6">
//               <div className="relative bg-white rounded-xl shadow-md p-6">
//                 {filteredUsers[activeTab].length > 0 ? (
//                   <>
//                     <div className="relative h-64 overflow-hidden">
//                       <div className="absolute inset-0 flex items-center justify-center">
//                         <div className="text-center">
//                           <p className="text-sm text-gray-500">Sample Code</p>
//                           <p className="text-lg font-medium mb-4">
//                             {filteredUsers[activeTab][currentSlide].sampleCode}
//                           </p>

//                           <p className="text-sm text-gray-500">User Name</p>
//                           <p className="text-lg font-medium mb-4">
//                             {filteredUsers[activeTab][currentSlide].userName}
//                           </p>

//                           <p className="text-sm text-gray-500">Email</p>
//                           <p className="text-lg font-medium mb-4">
//                             {filteredUsers[activeTab][currentSlide].email}
//                           </p>

//                           <p className="text-sm text-gray-500">Mobile</p>
//                           <p className="text-lg font-medium mb-4">
//                             {filteredUsers[activeTab][currentSlide].mobile}
//                           </p>

//                           <p className="text-sm text-gray-500">Address</p>
//                           <p className="text-lg font-medium">
//                             {filteredUsers[activeTab][currentSlide].address}
//                           </p>
//                         </div>
//                       </div>
//                     </div>
//                     <div className="flex justify-between mt-4">
//                       <button
//                         onClick={prevSlide}
//                         className="p-2 rounded-full bg-gray-200 hover:bg-gray-300"
//                       >
//                         <FiChevronLeft />
//                       </button>
//                       <div className="flex items-center">
//                         {filteredUsers[activeTab].map((_, index) => (
//                           <div
//                             key={index}
//                             className={`w-2 h-2 mx-1 rounded-full ${currentSlide === index ? "bg-blue-600" : "bg-gray-300"}`}
//                           ></div>
//                         ))}
//                       </div>
//                       <button
//                         onClick={nextSlide}
//                         className="p-2 rounded-full bg-gray-200 hover:bg-gray-300"
//                       >
//                         <FiChevronRight />
//                       </button>
//                     </div>
//                     <div className="flex justify-center mt-4 space-x-4">
//                       {activeTab === "pending" && (
//                         <button
//                           onClick={() => handleApprove(filteredUsers[activeTab][currentSlide].sampleCode)}
//                           disabled={actionLoading === filteredUsers[activeTab][currentSlide].sampleCode}
//                           className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
//                         >
//                           {actionLoading === filteredUsers[activeTab][currentSlide].sampleCode ? (
//                             <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
//                           ) : (
//                             <FiCheck className="mr-2" />
//                           )}
//                           Approve
//                         </button>
//                       )}
//                       <button
//                         onClick={() => handleDelete(filteredUsers[activeTab][currentSlide].sampleCode, activeTab)}
//                         disabled={actionLoading === filteredUsers[activeTab][currentSlide].sampleCode}
//                         className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
//                       >
//                         {actionLoading === filteredUsers[activeTab][currentSlide].sampleCode ? (
//                           <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
//                         ) : (
//                           <FiX className="mr-2" />
//                         )}
//                         Delete
//                       </button>
//                     </div>
//                   </>
//                 ) : (
//                   <div className="text-center py-10 text-gray-500">
//                     No {activeTab} users found
//                   </div>
//                 )}
//               </div>
//             </div>
//           )}

//           {/* Desktop Table View */}
//           {!loading && (
//             <div className="hidden md:block bg-white shadow rounded-lg overflow-hidden">
//               <div className="overflow-x-auto">
//                 <table className="min-w-full divide-y divide-gray-200">
//                   <thead className="bg-gray-50">
//                     <tr>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         Sample Code
//                       </th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         User Name
//                       </th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         Email
//                       </th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         Mobile
//                       </th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         Address
//                       </th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         Actions
//                       </th>
//                     </tr>
//                   </thead>
//                   <tbody className="bg-white divide-y divide-gray-200">
//                     {filteredUsers[activeTab].length > 0 ? (
//                       filteredUsers[activeTab].map((user) => (
//                         <tr key={user.sampleCode} className="hover:bg-gray-50">
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                             {user.sampleCode}
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
//                             {user.userName}
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                             {user.email}
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                             {user.mobile}
//                           </td>
//                           <td className="px-6 py-4 text-sm text-gray-500">
//                             {user.address}
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                             <div className="flex space-x-2">
//                               {activeTab === "pending" && (
//                                 <button
//                                   onClick={() => handleApprove(user.sampleCode)}
//                                   disabled={actionLoading === user.sampleCode}
//                                   className="flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 disabled:opacity-50"
//                                 >
//                                   {actionLoading === user.sampleCode ? (
//                                     <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-green-700 mr-1"></div>
//                                   ) : (
//                                     <FiCheck className="mr-1" />
//                                   )}
//                                   Approve
//                                 </button>
//                               )}
//                               <button
//                                 onClick={() => handleDelete(user.sampleCode, activeTab)}
//                                 disabled={actionLoading === user.sampleCode}
//                                 className="flex items-center px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 disabled:opacity-50"
//                               >
//                                 {actionLoading === user.sampleCode ? (
//                                   <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-red-700 mr-1"></div>
//                                 ) : (
//                                   <FiX className="mr-1" />
//                                 )}
//                                 Delete
//                               </button> 
//                             </div>
//                           </td>
//                         </tr>
//                       ))
//                     ) : (
//                       <tr>
//                         <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
//                           No {activeTab} users found
//                         </td>
//                       </tr>
//                     )}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           )}
//         </main>
//       </div>

//       {/* Mobile Bottom Navigation */}
//       {isMobile && (
//         <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg z-10 border-t border-gray-200">
//           <div className="flex justify-around items-center h-16">
//             <button
//               onClick={() => navigate('/dashboard')}
//               className="flex flex-col items-center justify-center p-2 text-gray-600 hover:text-blue-600"
//             >
//               <FiHome size={20} />
//               <span className="text-xs mt-1">Home</span>
//             </button>
//             <button
//               onClick={() => setActiveTab("pending")}
//               className={`flex flex-col items-center justify-center p-2 ${activeTab === "pending" ? "text-blue-600" : "text-gray-600"}`}
//             >
//               <FiList size={20} />
//               <span className="text-xs mt-1">Pending</span>
//             </button>
//             <button
//               onClick={() => setActiveTab("approved")}
//               className={`flex flex-col items-center justify-center p-2 ${activeTab === "approved" ? "text-blue-600" : "text-gray-600"}`}
//             >
//               <FiUsers size={20} />
//               <span className="text-xs mt-1">Approved</span>
//             </button>
//             <button
//               onClick={handleEWARFInterface}
//               className="flex flex-col items-center justify-center p-2 text-gray-600 hover:text-blue-600"
//             >
//               <FiBarChart2 size={20} />
//               <span className="text-xs mt-1">E-WARF</span>
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
















// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { 
//   FiMenu, 
//   FiLogOut, 
//   FiUser, 
//   FiCheck, 
//   FiX, 
//   FiChevronLeft, 
//   FiChevronRight,
//   FiHome,
//   FiList,
//   FiUsers,
//   FiSettings,
//   FiSearch,
//   FiRefreshCw,
//   FiShield,
//   FiBarChart2
// } from "react-icons/fi";
// import { useMediaQuery } from "react-responsive";

// export default function AdminManagement() {
//   const navigate = useNavigate();
//   const [activeTab, setActiveTab] = useState("pending");
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [currentSlide, setCurrentSlide] = useState(0);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [success, setSuccess] = useState(null);
//   const [actionLoading, setActionLoading] = useState(null);
//   const [adminName, setAdminName] = useState("Admin User");
//   const [showProfileMenu, setShowProfileMenu] = useState(false);
//   const isMobile = useMediaQuery({ maxWidth: 768 });

//   // Sample data
//   const [users, setUsers] = useState({ pending: [], approved: [] });

//   // Get admin name from localStorage on component mount
//   useEffect(() => {
//     const storedUsername = localStorage.getItem("username_store");
//     if (storedUsername) {
//       setAdminName(storedUsername);
//     }
//   }, []);

  
 
//   const fetchPendingUsers = async () => {
//     const user = localStorage.getItem("comid");
//     try {
//       const response = await fetch(`https://esystems.cdl.lk/backend-test/ewharf/User/PRegisteredList?comid=${user}`);
       
      
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }
      
//       const data = await response.json();
      
//       if (data.StatusCode === 200 && data.ResultSet) {
//         // Transform API data to match our component structure
//         const pendingUsers = data.ResultSet
//           .filter(user => user.Emp_Status === "Pending")
//           .map(user => ({
//             sampleCode: user.Emp_Id,
//             userName: user.Emp_ComId,
//             email: user.Emp_Email,
//             mobile: user.Emp_TelNo,
//             userCategory: "Ration Items", // Default category as API doesn't provide
//             address: user.Emp_Address,
//             status: user.Emp_Status
//           }));
        
//         return pendingUsers;
//       } else {
//         setError("Invalid API response format for pending users");
//         return [];
//       }
//     } catch (err) {
//       setError(err.message);
//       console.error("Error fetching pending users:", err);
//       return [];
//     }
//   };

//   const fetchApprovedUsers = async () => {
//     const user = localStorage.getItem("comid");
//     try {
//       const response = await fetch(` https://esystems.cdl.lk/backend-test/ewharf/User/ActiveUserList?comid=${user}`);
      
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }
      
//       const data = await response.json();
      
//       if (data.StatusCode === 200 && data.ResultSet) {
//         // Transform API data to match our component structure
//         const approvedUsers = data.ResultSet.map(user => ({
//           sampleCode: user.Us_Id,
//           userName: user.Us_Name,
//           email: user.Us_Email,
//           mobile: user.Us_TelNo,
//           userCategory: "Ration Items", // Default category as API doesn't provide
//           address: user.Us_Address,
//           status: "Approved"
//         }));
        
//         return approvedUsers;
//       } else {
//         setError("Invalid API response format for approved users");
//         return [];
//       }
//     } catch (err) {
//       setError(err.message);
//       console.error("Error fetching approved users:", err);
//       return [];
//     }
//   };

//   const fetchAllUsers = async () => {
//     try {
//       setLoading(true);
//       const [pending, approved] = await Promise.all([
//         fetchPendingUsers(),
//         fetchApprovedUsers()
//       ]);
      
//       setUsers({
//         pending: pending,
//         approved: approved
//       });
//     } catch (err) {
//       console.error("Error in fetchAllUsers:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchAllUsers();
//   }, []);

//   const handleRefresh = () => {
//     fetchAllUsers();
//   };

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

//   // Auto-close sidebar on mobile when clicking outside
//   useEffect(() => {
//     if (isMobile) {
//       setSidebarOpen(false);
//     } else {
//       setSidebarOpen(true);
//     }
//   }, [isMobile]);

//   // Filter users based on search query
//   const filteredUsers = {
//     pending: users.pending.filter(user =>
//       Object.values(user).some(
//         value => value && value.toString().toLowerCase().includes(searchQuery.toLowerCase())
//       )
//     ),
//     approved: users.approved.filter(user =>
//       Object.values(user).some(
//         value => value && value.toString().toLowerCase().includes(searchQuery.toLowerCase())
//       )
//     ),
//   };

//   const handleApprove = async (sampleCode) => {
//     try {
//       setActionLoading(sampleCode);
      
//       const response = await fetch('https://esystems.cdl.lk/backend-test/ewharf/User/ActiveUser', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           Emp_Id: sampleCode
//         })
//       });
      
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }
      
//       const data = await response.json();
      
//       if (data.StatusCode === 200) {
//         setSuccess("User approved successfully!");
//         setTimeout(() => setSuccess(null), 3000);
//         // Refresh the data
//         fetchAllUsers();
//       } else {
//         setError("Failed to approve user: " + (data.Message || "Unknown error"));
//       }
//     } catch (err) {
//       console.error("Error approving user:", err);
//       setError("Failed to approve user: " + err.message);
//     } finally {
//       setActionLoading(null);
//     }
//   };

//   const handleDelete = async (sampleCode, listType) => {
//     try {
//       setActionLoading(sampleCode);
      
//       const response = await fetch('https://esystems.cdl.lk/backend-test/ewharf/User/DeleteSupplier', {
//         method: 'DELETE',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           Emp_Id: sampleCode
//         })
//       });
      
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }
      
//       const data = await response.json();
      
//       if (data.StatusCode === 200) {
//         setSuccess("User deleted successfully!");
//         setTimeout(() => setSuccess(null), 3000);
//         // Refresh the data
//         fetchAllUsers();
//       } else {
//         setError("Failed to delete user: " + (data.Message || "Unknown error"));
//       }
//     } catch (err) {
//       console.error("Error deleting user:", err);
//       setError("Failed to delete user: " + err.message);
//     } finally {
//       setActionLoading(null);
//     }
//   };

//   const handleLogout = () => {
//     localStorage.removeItem("username_store");
//     localStorage.removeItem("role_store");
//     navigate("/");
//   };

//   const handleSwitchToUser = () => {
//     localStorage.setItem("role_store", "User");
//     navigate("/home");
//   };

//   const nextSlide = () => {
//     setCurrentSlide((prev) => 
//       prev === filteredUsers[activeTab].length - 1 ? 0 : prev + 1
//     );
//   };

//   const prevSlide = () => {
//     setCurrentSlide((prev) => 
//       prev === 0 ? filteredUsers[activeTab].length - 1 : prev - 1
//     );
//   };

//   const handleProfileClick = (e) => {
//     e.stopPropagation();
//     setShowProfileMenu(!showProfileMenu);
//   };

//   const handleEWARFInterface = () => {
//     // Navigate to E-WARF Interface or open in new tab
//     window.open('/home', '_blank');
//   };

//   return (
//     <div className="flex h-screen bg-gray-100 relative">
//       {/* Sidebar - Desktop */}
//       <div
//         className={`${sidebarOpen ? "w-64" : "w-20"} bg-blue-800 text-white transition-all duration-300 ease-in-out hidden md:block`}
//       >
//         <div className="p-4 flex items-center justify-between">
//           {sidebarOpen ? (
//             <h1 className="text-xl font-bold">Admin Panel</h1>
//           ) : (
//             <div className="w-8 h-8 bg-blue-700 rounded-full"></div>
//           )}
//           <button
//             onClick={() => setSidebarOpen(!sidebarOpen)}
//             className="p-1 rounded-lg hover:bg-blue-700"
//           >
//             <FiMenu size={20} />
//           </button>
//         </div>

//         <div className="mt-8">
//           <div
//             className={`flex items-center p-4 ${activeTab === "pending" ? "bg-blue-700" : "hover:bg-blue-700"} cursor-pointer`}
//             onClick={() => setActiveTab("pending")}
//           >
//             <FiUser className="mr-3" size={20} />
//             {sidebarOpen && <span>Pending Users</span>}
//           </div>
//           <div
//             className={`flex items-center p-4 ${activeTab === "approved" ? "bg-blue-700" : "hover:bg-blue-700"} cursor-pointer`}
//             onClick={() => setActiveTab("approved")}
//           >
//             <FiCheck className="mr-3" size={20} />
//             {sidebarOpen && <span>Approved Users</span>}
//           </div>
//           <div
//             className={`flex items-center p-4 hover:bg-blue-700 cursor-pointer`}
//             onClick={handleEWARFInterface}
//           >
//             <FiBarChart2 className="mr-3" size={20} />
//             {sidebarOpen && <span>E-WARF Interface</span>}
//           </div>
//         </div>
//       </div>

//       {/* Mobile Sidebar Overlay */}
//       {sidebarOpen && isMobile && (
//         <div 
//           className="fixed inset-0 bg-black bg-opacity-50 z-20"
//           onClick={() => setSidebarOpen(false)}
//         ></div>
//       )}

//       {/* Mobile Sidebar */}
//       <div
//         className={`${sidebarOpen && isMobile ? "translate-x-0" : "-translate-x-full"} fixed inset-y-0 left-0 w-64 bg-blue-800 text-white transition-transform duration-300 ease-in-out z-30 md:hidden`}
//       >
//         <div className="p-4 flex items-center justify-between">
//           <h1 className="text-xl font-bold">Admin Panel</h1>
//           <button
//             onClick={() => setSidebarOpen(false)}
//             className="p-1 rounded-lg hover:bg-blue-700"
//           >
//             <FiX size={20} />
//           </button>
//         </div>

//         <div className="mt-8">
//           <div
//             className={`flex items-center p-4 ${activeTab === "pending" ? "bg-blue-700" : "hover:bg-blue-700"} cursor-pointer`}
//             onClick={() => {
//               setActiveTab("pending");
//               setSidebarOpen(false);
//             }}
//           >
//             <FiUser className="mr-3" size={20} />
//             <span>Pending Users</span>
//           </div>
//           <div
//             className={`flex items-center p-4 ${activeTab === "approved" ? "bg-blue-700" : "hover:bg-blue-700"} cursor-pointer`}
//             onClick={() => {
//               setActiveTab("approved");
//               setSidebarOpen(false);
//             }}
//           >
//             <FiCheck className="mr-3" size={20} />
//             <span>Approved Users</span>
//           </div>
//           <div
//             className={`flex items-center p-4 hover:bg-blue-700 cursor-pointer`}
//             onClick={() => {
//               handleEWARFInterface();
//               setSidebarOpen(false);
//             }}
//           >
//             <FiBarChart2 className="mr-3" size={20} />
//             <span>E-WARF Interface</span>
//           </div>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="flex-1 flex flex-col overflow-hidden">
//         {/* Top Navigation */}
//         <header className="bg-white shadow-sm z-10">
//           <div className="flex items-center justify-between px-4 py-3 md:px-6 md:py-4">
//             <div className="flex items-center">
//               {isMobile && (
//                 <button
//                   onClick={() => setSidebarOpen(!sidebarOpen)}
//                   className="p-2 mr-2 text-gray-500 rounded-lg hover:bg-gray-100"
//                 >
//                   <FiMenu size={20} />
//                 </button>
//               )}
//               <h2 className="text-lg md:text-xl font-semibold text-gray-800">
//                 Admin Management
//               </h2>
//             </div>
//             <div className="flex items-center space-x-3 md:space-x-4">
//               <button
//                 onClick={handleSwitchToUser}
//                 className="hidden md:flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
//               >
//                 <FiUser className="mr-2" size={16} />
//                 Switch to User
//               </button>
//               <div className="relative">
//                 <div 
//                   className="flex items-center cursor-pointer"
//                   onClick={handleProfileClick}
//                 >
//                   <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2">
//                     <FiShield className="text-blue-600" />
//                   </div>
//                   <span className="text-sm font-medium hidden sm:inline">{adminName}</span>
//                   {isMobile && (
//                     <span className="text-sm font-medium sm:hidden ml-1">{adminName}</span>
//                   )}
//                 </div>
                
//                 {/* Profile Dropdown Menu */}
//                 {showProfileMenu && (
//                   <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
//                     <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
//                       <div className="font-medium">{adminName}</div>
//                       <div className="text-gray-500 text-xs">Administrator</div>
//                     </div>
//                     <button
//                       onClick={handleSwitchToUser}
//                       className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 md:hidden"
//                     >
//                       <FiUser className="mr-2" size={16} />
//                       Switch to User
//                     </button>
//                     <button
//                       onClick={handleLogout}
//                       className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//                     >
//                       <FiLogOut className="mr-2" size={16} />
//                       Logout
//                     </button>
//                   </div>
//                 )}
//               </div>
//               {!isMobile && (
//                 <button
//                   onClick={handleLogout}
//                   className="p-2 text-gray-500 rounded-full hover:bg-gray-100"
//                   title="Logout"
//                 >
//                   <FiLogOut size={18} />
//                 </button>
//               )}
//             </div>
//           </div>
//         </header>

//         {/* Success/Error Messages */}
//         {success && (
//           <div className="mx-4 mt-4 md:mx-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
//             {success}
//           </div>
//         )}
//         {error && (
//           <div className="mx-4 mt-4 md:mx-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
//             {error}
//           </div>
//         )}

//         {/* Main Content Area */}
//         <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50 pb-20 md:pb-6">
//           {/* Search Bar and Refresh Button */}
//           <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 space-y-2 md:space-y-0">
//             <div className="relative flex-1 md:max-w-md">
//               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                 <FiSearch className="text-gray-400" />
//               </div>
//               <input
//                 type="text"
//                 placeholder="Search users..."
//                 className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//               />
//             </div>
//             <button
//               onClick={handleRefresh}
//               className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//             >
//               <FiRefreshCw className="mr-2" />
//               Refresh
//             </button>
//           </div>

//           {/* Mobile Tabs */}
//           {isMobile && !loading && (
//             <div className="flex mb-4 bg-white rounded-lg shadow p-1">
//               <button
//                 onClick={() => setActiveTab("pending")}
//                 className={`flex-1 py-2 text-sm font-medium rounded-md ${activeTab === "pending" ? "bg-blue-100 text-blue-700" : "text-gray-600"}`}
//               >
//                 Pending
//               </button>
//               <button
//                 onClick={() => setActiveTab("approved")}
//                 className={`flex-1 py-2 text-sm font-medium rounded-md ${activeTab === "approved" ? "bg-blue-100 text-blue-700" : "text-gray-600"}`}
//               >
//                 Approved
//               </button>
//             </div>
//           )}

//           {/* Loading State */}
//           {loading && (
//             <div className="flex justify-center items-center py-12">
//               <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
//             </div>
//           )}

//           {/* Mobile Slider View */}
//           {!loading && (
//             <div className="md:hidden mb-6">
//               <div className="relative bg-white rounded-xl shadow-md p-6">
//                 {filteredUsers[activeTab].length > 0 ? (
//                   <>
//                     <div className="relative h-64 overflow-hidden">
//                       <div className="absolute inset-0 flex items-center justify-center">
//                         <div className="text-center">
//                           <p className="text-sm text-gray-500">Sample Code</p>
//                           <p className="text-lg font-medium mb-4">
//                             {filteredUsers[activeTab][currentSlide].sampleCode}
//                           </p>

//                           <p className="text-sm text-gray-500">User Name</p>
//                           <p className="text-lg font-medium mb-4">
//                             {filteredUsers[activeTab][currentSlide].userName}
//                           </p>

//                           <p className="text-sm text-gray-500">Email</p>
//                           <p className="text-lg font-medium mb-4">
//                             {filteredUsers[activeTab][currentSlide].email}
//                           </p>

//                           <p className="text-sm text-gray-500">Mobile</p>
//                           <p className="text-lg font-medium mb-4">
//                             {filteredUsers[activeTab][currentSlide].mobile}
//                           </p>

//                           <p className="text-sm text-gray-500">Category</p>
//                           <p className="text-lg font-medium mb-4">
//                             {filteredUsers[activeTab][currentSlide].userCategory}
//                           </p>

//                           <p className="text-sm text-gray-500">Address</p>
//                           <p className="text-lg font-medium">
//                             {filteredUsers[activeTab][currentSlide].address}
//                           </p>
//                         </div>
//                       </div>
//                     </div>
//                     <div className="flex justify-between mt-4">
//                       <button
//                         onClick={prevSlide}
//                         className="p-2 rounded-full bg-gray-200 hover:bg-gray-300"
//                       >
//                         <FiChevronLeft />
//                       </button>
//                       <div className="flex items-center">
//                         {filteredUsers[activeTab].map((_, index) => (
//                           <div
//                             key={index}
//                             className={`w-2 h-2 mx-1 rounded-full ${currentSlide === index ? "bg-blue-600" : "bg-gray-300"}`}
//                           ></div>
//                         ))}
//                       </div>
//                       <button
//                         onClick={nextSlide}
//                         className="p-2 rounded-full bg-gray-200 hover:bg-gray-300"
//                       >
//                         <FiChevronRight />
//                       </button>
//                     </div>
//                     <div className="flex justify-center mt-4 space-x-4">
//                       {activeTab === "pending" && (
//                         <button
//                           onClick={() => handleApprove(filteredUsers[activeTab][currentSlide].sampleCode)}
//                           disabled={actionLoading === filteredUsers[activeTab][currentSlide].sampleCode}
//                           className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
//                         >
//                           {actionLoading === filteredUsers[activeTab][currentSlide].sampleCode ? (
//                             <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
//                           ) : (
//                             <FiCheck className="mr-2" />
//                           )}
//                           Approve
//                         </button>
//                       )}
//                       <button
//                         onClick={() => handleDelete(filteredUsers[activeTab][currentSlide].sampleCode, activeTab)}
//                         disabled={actionLoading === filteredUsers[activeTab][currentSlide].sampleCode}
//                         className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
//                       >
//                         {actionLoading === filteredUsers[activeTab][currentSlide].sampleCode ? (
//                           <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
//                         ) : (
//                           <FiX className="mr-2" />
//                         )}
//                         Delete
//                       </button>
//                     </div>
//                   </>
//                 ) : (
//                   <div className="text-center py-10 text-gray-500">
//                     No {activeTab} users found
//                   </div>
//                 )}
//               </div>
//             </div>
//           )}

//           {/* Desktop Table View */}
//           {!loading && (
//             <div className="hidden md:block bg-white shadow rounded-lg overflow-hidden">
//               <div className="overflow-x-auto">
//                 <table className="min-w-full divide-y divide-gray-200">
//                   <thead className="bg-gray-50">
//                     <tr>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         Sample Code
//                       </th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         User Name
//                       </th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         Email
//                       </th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         Mobile
//                       </th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         Category
//                       </th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         Address
//                       </th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         Actions
//                       </th>
//                     </tr>
//                   </thead>
//                   <tbody className="bg-white divide-y divide-gray-200">
//                     {filteredUsers[activeTab].length > 0 ? (
//                       filteredUsers[activeTab].map((user) => (
//                         <tr key={user.sampleCode} className="hover:bg-gray-50">
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                             {user.sampleCode}
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
//                             {user.userName}
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                             {user.email}
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                             {user.mobile}
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                             {user.userCategory}
//                           </td>
//                           <td className="px-6 py-4 text-sm text-gray-500">
//                             {user.address}
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                             <div className="flex space-x-2">
//                               {activeTab === "pending" && (
//                                 <button
//                                   onClick={() => handleApprove(user.sampleCode)}
//                                   disabled={actionLoading === user.sampleCode}
//                                   className="flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 disabled:opacity-50"
//                                 >
//                                   {actionLoading === user.sampleCode ? (
//                                     <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-green-700 mr-1"></div>
//                                   ) : (
//                                     <FiCheck className="mr-1" />
//                                   )}
//                                   Approve
//                                 </button>
//                               )}
//                               <button
//                                 onClick={() => handleDelete(user.sampleCode, activeTab)}
//                                 disabled={actionLoading === user.sampleCode}
//                                 className="flex items-center px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 disabled:opacity-50"
//                               >
//                                 {actionLoading === user.sampleCode ? (
//                                   <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-red-700 mr-1"></div>
//                                 ) : (
//                                   <FiX className="mr-1" />
//                                 )}
//                                 Delete
//                               </button> 
//                             </div>
//                           </td>
//                         </tr>
//                       ))
//                     ) : (
//                       <tr>
//                         <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
//                           No {activeTab} users found
//                         </td>
//                       </tr>
//                     )}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           )}
//         </main>
//       </div>

//       {/* Mobile Bottom Navigation */}
//       {isMobile && (
//         <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg z-10 border-t border-gray-200">
//           <div className="flex justify-around items-center h-16">
//             <button
//               onClick={() => navigate('/dashboard')}
//               className="flex flex-col items-center justify-center p-2 text-gray-600 hover:text-blue-600"
//             >
//               <FiHome size={20} />
//               <span className="text-xs mt-1">Home</span>
//             </button>
//             <button
//               onClick={() => setActiveTab("pending")}
//               className={`flex flex-col items-center justify-center p-2 ${activeTab === "pending" ? "text-blue-600" : "text-gray-600"}`}
//             >
//               <FiList size={20} />
//               <span className="text-xs mt-1">Pending</span>
//             </button>
//             <button
//               onClick={() => setActiveTab("approved")}
//               className={`flex flex-col items-center justify-center p-2 ${activeTab === "approved" ? "text-blue-600" : "text-gray-600"}`}
//             >
//               <FiUsers size={20} />
//               <span className="text-xs mt-1">Approved</span>
//             </button>
//             <button
//               onClick={handleEWARFInterface}
//               className="flex flex-col items-center justify-center p-2 text-gray-600 hover:text-blue-600"
//             >
//               <FiBarChart2 size={20} />
//               <span className="text-xs mt-1">E-WARF</span>
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }