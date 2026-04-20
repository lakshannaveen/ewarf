import React, { useState, useEffect, useRef, useCallback } from "react";
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
  FiSearch,
  FiRefreshCw,
  FiShield,
  FiBarChart2,
  FiActivity,
  FiTrendingUp,
  FiClock,
  FiEye,
  FiUserCheck,
  FiUserX,
  FiDatabase,
  FiPercent,
  FiCalendar,
  FiMessageSquare,
  FiAlertCircle,
  FiFilter,
  FiDownload,
  FiMail,
  FiArrowUp,
  FiChevronDown,
  FiPower,
  FiTrash2
} from "react-icons/fi";
import { useMediaQuery } from "react-responsive";

export default function AdminManagement() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
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
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [pendingAction, setPendingAction] = useState({ type: '', userId: '', userName: '' });
  const [visibleApprovedUsers, setVisibleApprovedUsers] = useState(8);
  const [dashboardStats, setDashboardStats] = useState({
    totalUsers: 0,
    pendingUsers: 0,
    approvedUsers: 0,
    pendingPercentage: 0,
    approvalRate: 0,
    todayRegistrations: 0,
    weeklyGrowth: 12.5
  });
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const tableContainerRef = useRef(null);
  const isMobile = useMediaQuery({ maxWidth: 768 });

  // Users state
  const [users, setUsers] = useState({ pending: [], approved: [] });

  // Function to format phone number with + and spaces
  const formatPhoneNumber = (phone) => {
    if (!phone) return "N/A";
    
    const cleaned = phone.toString().replace(/\D/g, '');
    
    if (cleaned.length === 0) return phone;
    
    if (cleaned.startsWith('94')) {
      if (cleaned.length === 12) {
        return `+${cleaned.substring(0, 2)} ${cleaned.substring(2, 4)} ${cleaned.substring(4, 7)} ${cleaned.substring(7)}`;
      } else if (cleaned.length === 11) {
        return `+${cleaned.substring(0, 2)} ${cleaned.substring(2, 5)} ${cleaned.substring(5, 8)} ${cleaned.substring(8)}`;
      } else if (cleaned.length === 10) {
        return `+${cleaned.substring(0, 2)} ${cleaned.substring(2, 4)} ${cleaned.substring(4, 7)} ${cleaned.substring(7)}`;
      }
    }
    
    let formatted = `+${cleaned}`;
    
    if (cleaned.length > 4) {
      formatted = formatted.replace(/(\d{3})(?=\d)/g, '$1 ');
    }
    
    return formatted;
  };

  // Function to sort approved users by date (newest first)
  const sortApprovedUsersNewestFirst = (approvedUsers) => {
    return [...approvedUsers].sort((a, b) => {
      if (a.registrationDate && b.registrationDate) {
        return new Date(b.registrationDate) - new Date(a.registrationDate);
      }
      return b.sampleCode - a.sampleCode;
    });
  };

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
        const pendingUsers = data.ResultSet
          .filter(user => user.Emp_Status === "Pending")
          .map(user => ({
            sampleCode: user.Emp_Id,
            userName: user.Emp_Name,
            email: user.Emp_Email,
            mobile: user.Emp_TelNo,
            formattedMobile: formatPhoneNumber(user.Emp_TelNo),
            address: user.Emp_Address,
            status: user.Emp_Status,
            registrationDate: new Date().toISOString().split('T')[0]
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
        const approvedUsers = data.ResultSet.map(user => ({
          sampleCode: user.Us_Id,
          userName: user.Us_Name,
          email: user.Us_Email,
          mobile: user.Us_TelNo,
          formattedMobile: formatPhoneNumber(user.Us_TelNo),
          address: user.Us_Address,
          status: "Approved",
          registrationDate: new Date().toISOString().split('T')[0]
        }));
        
        if (data.ResultSet.length > 0 && data.ResultSet[0].Us_ComName) {
          setCompanyName(data.ResultSet[0].Us_ComName);
        }
        
        return sortApprovedUsersNewestFirst(approvedUsers);
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
      
      const todayRegistrations = Math.floor(Math.random() * 10) + 1;
      const total = pending.length + approved.length;
      const pendingPercentage = total > 0 ? (pending.length / total) * 100 : 0;
      const approvalRate = total > 0 ? (approved.length / total) * 100 : 0;
      
      setUsers({
        pending: pending,
        approved: approved
      });
      
      setDashboardStats({
        totalUsers: total,
        pendingUsers: pending.length,
        approvedUsers: approved.length,
        pendingPercentage: pendingPercentage.toFixed(1),
        approvalRate: approvalRate.toFixed(1),
        todayRegistrations: todayRegistrations,
        weeklyGrowth: 12.5
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

  // Reset visible users when tab changes
  useEffect(() => {
    setVisibleApprovedUsers(8);
  }, [activeTab]);

  const handleRefresh = () => {
    fetchAllUsers();
    setVisibleApprovedUsers(8);
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

  // Filter users based on search query - MOVE THIS BEFORE loadMoreUsers
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

  // Load more users on scroll - MOVED AFTER filteredUsers definition
  const loadMoreUsers = useCallback(() => {
    if (activeTab === "approved" && !isLoadingMore && visibleApprovedUsers < filteredUsers.approved.length) {
      setIsLoadingMore(true);
      setTimeout(() => {
        setVisibleApprovedUsers(prev => Math.min(prev + 8, filteredUsers.approved.length));
        setIsLoadingMore(false);
      }, 500);
    }
  }, [activeTab, visibleApprovedUsers, filteredUsers.approved.length, isLoadingMore]);

  // Handle scroll for infinite loading
  const handleScroll = useCallback(() => {
    if (tableContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = tableContainerRef.current;
      if (scrollHeight - scrollTop <= clientHeight + 100) {
        loadMoreUsers();
      }
    }
  }, [loadMoreUsers]);

  // Scroll to top function
  const scrollToTop = () => {
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Show warning modal for actions
  const showActionWarning = (type, sampleCode, userName) => {
    setPendingAction({
      type: type,
      userId: sampleCode,
      userName: userName
    });
    setShowWarningModal(true);
  };

  const handleApprove = async () => {
    try {
      setActionLoading(pendingAction.userId);
      setShowWarningModal(false);
      
      const response = await fetch('https://esystems.cdl.lk/backend-test/ewharf/User/ActiveUser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          Emp_Id: pendingAction.userId
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.StatusCode === 200) {
        setSuccess(`User "${pendingAction.userName}" approved successfully!`);
        setTimeout(() => setSuccess(null), 5000);
        fetchAllUsers();
      } else {
        setError("Failed to approve user: " + (data.Message || "Unknown error"));
      }
    } catch (err) {
      console.error("Error approving user:", err);
      setError("Failed to approve user: " + err.message);
    } finally {
      setActionLoading(null);
      setPendingAction({ type: '', userId: '', userName: '' });
    }
  };

  const handleInactiveUser = async () => {
    try {
      setActionLoading(pendingAction.userId);
      setShowWarningModal(false);
      
      const response = await fetch(`https://esystems.cdl.lk/backend-test/ewharf/User/InactiveUser/?Emp_Id=${pendingAction.userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.StatusCode === 200) {
        setSuccess(`User "${pendingAction.userName}" has been set to inactive successfully!`);
        setTimeout(() => setSuccess(null), 5000);
        fetchAllUsers();
      } else {
        setError("Failed to set user inactive: " + (data.Message || "Unknown error"));
      }
    } catch (err) {
      console.error("Error setting user inactive:", err);
      setError("Failed to set user inactive: " + err.message);
    } finally {
      setActionLoading(null);
      setPendingAction({ type: '', userId: '', userName: '' });
    }
  };

  const handleDelete = async () => {
    try {
      setActionLoading(pendingAction.userId);
      setShowWarningModal(false);
      
      const response = await fetch('https://esystems.cdl.lk/backend-test/ewharf/User/DeleteSupplier', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          Emp_Id: pendingAction.userId
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.StatusCode === 200) {
        setSuccess(`User "${pendingAction.userName}" deleted successfully!`);
        setTimeout(() => setSuccess(null), 5000);
        fetchAllUsers();
      } else {
        setError("Failed to delete user: " + (data.Message || "Unknown error"));
      }
    } catch (err) {
      console.error("Error deleting user:", err);
      setError("Failed to delete user: " + err.message);
    } finally {
      setActionLoading(null);
      setPendingAction({ type: '', userId: '', userName: '' });
    }
  };

  const handleLogout = () => {
    setShowLogoutModal(false);
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
    window.open('/home', '_blank');
  };

  // Function to export user data
  const handleExportData = () => {
    const data = activeTab === "pending" ? users.pending : users.approved;
    const csvContent = "data:text/csv;charset=utf-8," 
      + ["ID,Name,Email,Phone,Address,Status,Date"].join(",") + "\n"
      + data.map(user => 
        `${user.sampleCode},"${user.userName}","${user.email}","${user.formattedMobile}","${user.address}",${user.status},${user.registrationDate}`
      ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${activeTab}_users_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setSuccess(`Exported ${data.length} ${activeTab} users successfully!`);
    setTimeout(() => setSuccess(null), 3000);
  };

  // Dashboard Component
  const Dashboard = () => (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl shadow-lg p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Welcome back, {adminName}!</h1>
            <p className="text-blue-100 mt-2">Here's what's happening with your users today.</p>
          </div>
          <div className="mt-4 md:mt-0">
            <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
              <FiCalendar className="mr-2" />
              <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users Card */}
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Users</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{dashboardStats.totalUsers}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-full">
              <FiUsers className="text-blue-600 text-2xl" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-blue-600">
            <FiTrendingUp className="mr-1" />
            <span>All registered users</span>
          </div>
        </div>

        {/* Pending Users Card */}
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending Approval</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">{dashboardStats.pendingUsers}</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-full">
              <FiClock className="text-yellow-600 text-2xl" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Pending percentage</span>
              <span>{dashboardStats.pendingPercentage}%</span>
            </div>
            <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-yellow-500 rounded-full transition-all duration-500"
                style={{ width: `${dashboardStats.pendingPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Today's Registrations Card */}
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Today's Registrations</p>
              <p className="text-3xl font-bold text-green-600 mt-2">+{dashboardStats.todayRegistrations}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-full">
              <FiUser className="text-green-600 text-2xl" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-green-600">
            <FiTrendingUp className="mr-1" />
            <span>New users today</span>
          </div>
        </div>

        {/* Approval Rate Card */}
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Approval Rate</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">{dashboardStats.approvalRate}%</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-full">
              <FiPercent className="text-purple-600 text-2xl" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-sm text-gray-500">
              <span>Weekly growth: {dashboardStats.weeklyGrowth}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions and Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800">Quick Actions</h3>
            <FiActivity className="text-gray-400" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => setActiveTab("pending")}
              className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-all duration-200"
            >
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg mr-3">
                  <FiUsers className="text-blue-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-800">Review Pending</p>
                  <p className="text-sm text-gray-600">{dashboardStats.pendingUsers} users waiting</p>
                </div>
              </div>
            </button>
            
            <button
              onClick={handleExportData}
              className="p-4 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-all duration-200"
            >
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg mr-3">
                  <FiDownload className="text-green-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-800">Export Data</p>
                  <p className="text-sm text-gray-600">Download user reports</p>
                </div>
              </div>
            </button>
            
            <button
              onClick={handleRefresh}
              className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-all duration-200"
            >
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg mr-3">
                  <FiRefreshCw className="text-purple-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-800">Refresh Data</p>
                  <p className="text-sm text-gray-600">Update all statistics</p>
                </div>
              </div>
            </button>
            
            <button
              onClick={() => {
                setSuccess("Settings feature coming soon!");
                setTimeout(() => setSuccess(null), 3000);
              }}
              className="p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg border border-yellow-200 transition-all duration-200"
            >
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg mr-3">
                  <FiFilter className="text-yellow-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-800">Filter Settings</p>
                  <p className="text-sm text-gray-600">Customize user views</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* System Health */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800">System Health</h3>
            <FiDatabase className="text-gray-400" />
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  <div>
                    <p className="font-medium text-gray-800">API Status</p>
                    <p className="text-sm text-gray-600">All systems operational</p>
                  </div>
                </div>
                <span className="text-green-600 font-medium">100%</span>
              </div>
            </div>
            
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                  <div>
                    <p className="font-medium text-gray-800">Database</p>
                    <p className="text-sm text-gray-600">Connection stable</p>
                  </div>
                </div>
                <span className="text-blue-600 font-medium">24/7</span>
              </div>
            </div>
            
            <div className="p-4 bg-yellow-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                  <div>
                    <p className="font-medium text-gray-800">Server Load</p>
                    <p className="text-sm text-gray-600">Moderate activity</p>
                  </div>
                </div>
                <span className="text-yellow-600 font-medium">65%</span>
              </div>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                  <div>
                    <p className="font-medium text-gray-800">Uptime</p>
                    <p className="text-sm text-gray-600">Last 30 days</p>
                  </div>
                </div>
                <span className="text-purple-600 font-medium">99.9%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Pending Users */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800">Top Pending Users</h3>
          <button 
            onClick={() => setActiveTab("pending")}
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
          >
            View All <FiChevronRight className="ml-1" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 text-sm font-medium text-gray-500">User ID</th>
                <th className="text-left py-3 text-sm font-medium text-gray-500">Name</th>
                <th className="text-left py-3 text-sm font-medium text-gray-500">Email</th>
                <th className="text-left py-3 text-sm font-medium text-gray-500">Phone</th>
                <th className="text-left py-3 text-sm font-medium text-gray-500">Registration Date</th>
                <th className="text-left py-3 text-sm font-medium text-gray-500">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.pending.slice(0, 5).map((user) => (
                <tr key={user.sampleCode} className="border-b hover:bg-gray-50">
                  <td className="py-3 text-sm font-mono text-gray-600">{user.sampleCode}</td>
                  <td className="py-3">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                        <FiUser className="text-blue-600" />
                      </div>
                      <span className="font-medium">{user.userName}</span>
                    </div>
                  </td>
                  <td className="py-3 text-sm text-gray-600">{user.email}</td>
                  <td className="py-3 text-sm text-gray-600 font-mono">
                    {user.formattedMobile || formatPhoneNumber(user.mobile)}
                  </td>
                  <td className="py-3 text-sm text-gray-600">{user.registrationDate}</td>
                  <td className="py-3">
                    <button
                      onClick={() => showActionWarning('approve', user.sampleCode, user.userName)}
                      className="text-sm px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                    >
                      Review
                    </button>
                  </td>
                </tr>
              ))}
              {users.pending.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-gray-500">
                    No pending users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-100 relative">
      {/* Warning Modal for Actions */}
      {showWarningModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full transform transition-all">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-red-100 rounded-full mr-3">
                  <FiAlertCircle className="text-red-600 text-2xl" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {pendingAction.type === 'approve' ? 'Approve User' : 
                   pendingAction.type === 'inactive' ? 'Set User Inactive' : 
                   'Delete User'}
                </h3>
              </div>
              
              <div className="mb-6">
                <p className="text-gray-600 mb-2">
                  {pendingAction.type === 'approve' 
                    ? `Are you sure you want to approve ${pendingAction.userName}?`
                    : pendingAction.type === 'inactive'
                    ? `Are you sure you want to set ${pendingAction.userName} to inactive? The user will lose access to the system.`
                    : `Are you sure you want to delete ${pendingAction.userName}? This action cannot be undone.`
                  }
                </p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-3">
                  <div className="flex items-start">
                    <FiAlertCircle className="text-yellow-500 mr-2 mt-0.5" />
                    <p className="text-sm text-yellow-700">
                      {pendingAction.type === 'approve' 
                        ? "The user will gain full access to the system immediately."
                        : pendingAction.type === 'inactive'
                        ? "The user will be marked as inactive and will lose system access."
                        : "All user data will be permanently removed from the system."
                      }
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowWarningModal(false);
                    setPendingAction({ type: '', userId: '', userName: '' });
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (pendingAction.type === 'approve') {
                      handleApprove();
                    } else if (pendingAction.type === 'inactive') {
                      handleInactiveUser();
                    } else {
                      handleDelete();
                    }
                  }}
                  disabled={actionLoading === pendingAction.userId}
                  className={`px-4 py-2 text-white rounded-lg transition-colors ${
                    pendingAction.type === 'approve' 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : pendingAction.type === 'inactive'
                      ? 'bg-orange-600 hover:bg-orange-700'
                      : 'bg-red-600 hover:bg-red-700'
                  } disabled:opacity-50`}
                >
                  {actionLoading === pendingAction.userId ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    pendingAction.type === 'approve' ? 'Yes, Approve' : 
                    pendingAction.type === 'inactive' ? 'Yes, Set Inactive' : 
                    'Yes, Delete'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Logout Warning Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full transform transition-all">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-blue-100 rounded-full mr-3">
                  <FiLogOut className="text-blue-600 text-2xl" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Confirm Logout
                </h3>
              </div>
              
              <div className="mb-6">
                <p className="text-gray-600 mb-2">
                  Are you sure you want to logout from the admin panel?
                </p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-3">
                  <div className="flex items-start">
                    <FiAlertCircle className="text-yellow-500 mr-2 mt-0.5" />
                    <p className="text-sm text-yellow-700">
                      You will be redirected to the login page and need to login again to access the admin panel.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Yes, Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
            className={`flex items-center p-4 ${activeTab === "dashboard" ? "bg-blue-700" : "hover:bg-blue-700"} cursor-pointer`}
            onClick={() => setActiveTab("dashboard")}
          >
            <FiHome className="mr-3" size={20} />
            {sidebarOpen && <span>Dashboard</span>}
          </div>
          <div
            className={`flex items-center p-4 ${activeTab === "pending" ? "bg-blue-700" : "hover:bg-blue-700"} cursor-pointer`}
            onClick={() => setActiveTab("pending")}
          >
            <FiUsers className="mr-3" size={20} />
            {sidebarOpen && <span>Pending Users</span>}
          </div>
          <div
            className={`flex items-center p-4 ${activeTab === "approved" ? "bg-blue-700" : "hover:bg-blue-700"} cursor-pointer`}
            onClick={() => setActiveTab("approved")}
          >
            <FiUserCheck className="mr-3" size={20} />
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
            className={`flex items-center p-4 ${activeTab === "dashboard" ? "bg-blue-700" : "hover:bg-blue-700"} cursor-pointer`}
            onClick={() => {
              setActiveTab("dashboard");
              setSidebarOpen(false);
            }}
          >
            <FiHome className="mr-3" size={20} />
            <span>Dashboard</span>
          </div>
          <div
            className={`flex items-center p-4 ${activeTab === "pending" ? "bg-blue-700" : "hover:bg-blue-700"} cursor-pointer`}
            onClick={() => {
              setActiveTab("pending");
              setSidebarOpen(false);
            }}
          >
            <FiUsers className="mr-3" size={20} />
            <span>Pending Users</span>
          </div>
          <div
            className={`flex items-center p-4 ${activeTab === "approved" ? "bg-blue-700" : "hover:bg-blue-700"} cursor-pointer`}
            onClick={() => {
              setActiveTab("approved");
              setSidebarOpen(false);
            }}
          >
            <FiUserCheck className="mr-3" size={20} />
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
                {activeTab === "dashboard" ? `${companyName} - Dashboard` : 
                 activeTab === "pending" ? "Pending User Management" :
                 activeTab === "approved" ? "Approved User Management" : companyName}
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
                      onClick={() => setShowLogoutModal(true)}
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
                  onClick={() => setShowLogoutModal(true)}
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
          <div className="mx-4 mt-4 md:mx-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center">
            <FiCheck className="mr-2" />
            {success}
          </div>
        )}
        {error && (
          <div className="mx-4 mt-4 md:mx-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center">
            <FiAlertCircle className="mr-2" />
            {error}
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50 pb-20 md:pb-6">
          {/* Dashboard View */}
          {activeTab === "dashboard" && !loading && <Dashboard />}
          
          {/* Users Management Views */}
          {(activeTab === "pending" || activeTab === "approved") && (
            <>
              {/* Search Bar and Actions */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 space-y-3 md:space-y-0">
                <div className="relative flex-1 md:max-w-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiSearch className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder={`Search ${activeTab} users...`}
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={handleExportData}
                    className="flex items-center px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <FiDownload className="mr-2" />
                    Export
                  </button>
                  <button
                    onClick={handleRefresh}
                    className="flex items-center px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <FiRefreshCw className="mr-2" />
                    Refresh
                  </button>
                </div>
              </div>

              {/* Stats Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg mr-3">
                      <FiUsers className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total {activeTab} Users</p>
                      <p className="text-xl font-bold text-gray-800">{filteredUsers[activeTab].length}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg mr-3">
                      <FiUserCheck className="text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Showing Results</p>
                      <p className="text-xl font-bold text-gray-800">
                        {activeTab === "approved" 
                          ? `${Math.min(visibleApprovedUsers, filteredUsers.approved.length)} of ${filteredUsers.approved.length}`
                          : `${filteredUsers.pending.length} of ${users.pending.length}`
                        }
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg mr-3">
                      <FiMail className="text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Filtered by</p>
                      <p className="text-xl font-bold text-gray-800">
                        {searchQuery ? `"${searchQuery}"` : "All"}
                      </p>
                    </div>
                  </div>
                </div>
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
              {!loading && activeTab !== "dashboard" && (
                <div className="md:hidden mb-6">
                  <div className="relative bg-white rounded-xl shadow-md p-6">
                    {filteredUsers[activeTab].length > 0 ? (
                      <>
                        <div className="relative h-64 overflow-hidden">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                              <p className="text-sm text-gray-500">User ID</p>
                              <p className="text-lg font-medium mb-4 font-mono">
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

                              <p className="text-sm text-gray-500">Phone</p>
                              <p className="text-lg font-medium mb-4 font-mono">
                                {filteredUsers[activeTab][currentSlide].formattedMobile || 
                                 formatPhoneNumber(filteredUsers[activeTab][currentSlide].mobile)}
                              </p>

                              <p className="text-sm text-gray-500">Status</p>
                              <p className="text-lg font-medium">
                                <span className={`px-2 py-1 rounded-full text-sm ${
                                  filteredUsers[activeTab][currentSlide].status === 'Approved' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {filteredUsers[activeTab][currentSlide].status}
                                </span>
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
                              onClick={() => showActionWarning('approve', filteredUsers[activeTab][currentSlide].sampleCode, filteredUsers[activeTab][currentSlide].userName)}
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
                          {activeTab === "approved" && (
                            <button
                              onClick={() => showActionWarning('inactive', filteredUsers[activeTab][currentSlide].sampleCode, filteredUsers[activeTab][currentSlide].userName)}
                              disabled={actionLoading === filteredUsers[activeTab][currentSlide].sampleCode}
                              className="flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
                            >
                              {actionLoading === filteredUsers[activeTab][currentSlide].sampleCode ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                              ) : (
                                <FiPower className="mr-2" />
                              )}
                              Inactive
                            </button>
                          )}
                          {/* <button
                            onClick={() => showActionWarning('delete', filteredUsers[activeTab][currentSlide].sampleCode, filteredUsers[activeTab][currentSlide].userName)}
                            disabled={actionLoading === filteredUsers[activeTab][currentSlide].sampleCode}
                            className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
                          >
                            {actionLoading === filteredUsers[activeTab][currentSlide].sampleCode ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                            ) : (
                              <FiTrash2 className="mr-2" />
                            )}
                            Delete
                          </button> */}
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

              {/* Desktop Table View with Scrollable Container */}
              {!loading && activeTab !== "dashboard" && (
                <div className="hidden md:block bg-white shadow rounded-xl overflow-hidden relative">
                  {/* Scrollable Table Container with sticky header */}
                  <div 
                    ref={tableContainerRef}
                    className="max-h-[calc(100vh-300px)] overflow-y-auto"
                    onScroll={activeTab === "approved" ? handleScroll : undefined}
                  >
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50 sticky top-0 z-10">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                            User ID
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                            User Name
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                            Email
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                            Phone
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                            Address
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                            Status
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {(activeTab === "pending" ? filteredUsers.pending : filteredUsers.approved.slice(0, visibleApprovedUsers)).map((user) => (
                          <tr key={user.sampleCode} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
                              {user.sampleCode}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                                  <FiUser className="text-blue-600" />
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{user.userName}</div>
                                  <div className="text-xs text-gray-500">Registered: {user.registrationDate}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {user.email}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
                              {user.formattedMobile || formatPhoneNumber(user.mobile)}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              <div className="max-w-xs truncate">{user.address}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                user.status === 'Approved' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {user.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                {activeTab === "pending" && (
                                  <button
                                    onClick={() => showActionWarning('approve', user.sampleCode, user.userName)}
                                    disabled={actionLoading === user.sampleCode}
                                    className="flex items-center px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 disabled:opacity-50 transition-colors"
                                  >
                                    {actionLoading === user.sampleCode ? (
                                      <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-green-700 mr-1"></div>
                                    ) : (
                                      <FiCheck className="mr-1" />
                                    )}
                                    Approve
                                  </button>
                                )}
                                {activeTab === "approved" && (
                                  <button
                                    onClick={() => showActionWarning('inactive', user.sampleCode, user.userName)}
                                    disabled={actionLoading === user.sampleCode}
                                    className="flex items-center px-3 py-1.5 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 disabled:opacity-50 transition-colors"
                                  >
                                    {actionLoading === user.sampleCode ? (
                                      <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-orange-700 mr-1"></div>
                                    ) : (
                                      <FiPower className="mr-1" />
                                    )}
                                    Inactive
                                  </button>
                                )}
                                {/* <button
                                  onClick={() => showActionWarning('delete', user.sampleCode, user.userName)}
                                  disabled={actionLoading === user.sampleCode}
                                  className="flex items-center px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 disabled:opacity-50 transition-colors"
                                >
                                  {actionLoading === user.sampleCode ? (
                                    <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-red-700 mr-1"></div>
                                  ) : (
                                    <FiTrash2 className="mr-1" />
                                  )}
                                  Delete
                                </button>  */}
                              </div>
                            </td>
                          </tr>
                        ))}
                        
                        {/* Loading More Indicator */}
                        {activeTab === "approved" && isLoadingMore && (
                          <tr>
                            <td colSpan="7" className="px-6 py-4 text-center">
                              <div className="flex justify-center items-center">
                                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500 mr-2"></div>
                                <span className="text-sm text-gray-500">Loading more users...</span>
                              </div>
                            </td>
                          </tr>
                        )}
                        
                        {/* Show More Indicator */}
                        {activeTab === "approved" && visibleApprovedUsers < filteredUsers.approved.length && !isLoadingMore && (
                          <tr>
                            <td colSpan="7" className="px-6 py-4 text-center">
                              <button
                                onClick={loadMoreUsers}
                                className="text-sm text-blue-600 hover:text-blue-800 flex items-center justify-center w-full"
                              >
                                <FiChevronDown className="mr-1" />
                                Scroll down or click to load more users ({filteredUsers.approved.length - visibleApprovedUsers} remaining)
                              </button>
                            </td>
                          </tr>
                        )}
                        
                        {filteredUsers[activeTab].length === 0 && (
                          <tr>
                            <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                              <div className="flex flex-col items-center">
                                <FiUsers className="text-gray-400 text-3xl mb-2" />
                                <p className="text-lg">No {activeTab} users found</p>
                                <p className="text-sm text-gray-400 mt-1">
                                  {searchQuery ? 'Try adjusting your search terms' : 'All users have been processed'}
                                </p>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Scroll to top button */}
                  {activeTab === "approved" && (
                    <button
                      onClick={scrollToTop}
                      className="absolute bottom-4 right-4 p-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors z-20"
                      title="Scroll to top"
                    >
                      <FiArrowUp size={20} />
                    </button>
                  )}
                  
                  {/* User Count Info */}
                  <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 text-sm text-gray-500">
                    Showing {Math.min(activeTab === "approved" ? visibleApprovedUsers : filteredUsers.pending.length, filteredUsers[activeTab].length)} of {filteredUsers[activeTab].length} {activeTab} users
                    {activeTab === "approved" && visibleApprovedUsers < filteredUsers.approved.length && (
                      <span className="ml-2 text-blue-600">(Scroll down to load more)</span>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg z-10 border-t border-gray-200">
          <div className="flex justify-around items-center h-16">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`flex flex-col items-center justify-center p-2 ${activeTab === "dashboard" ? "text-blue-600" : "text-gray-600"}`}
            >
              <FiHome size={20} />
              <span className="text-xs mt-1">Dashboard</span>
            </button>
            <button
              onClick={() => setActiveTab("pending")}
              className={`flex flex-col items-center justify-center p-2 ${activeTab === "pending" ? "text-blue-600" : "text-gray-600"}`}
            >
              <FiUsers size={20} />
              <span className="text-xs mt-1">Pending</span>
            </button>
            <button
              onClick={() => setActiveTab("approved")}
              className={`flex flex-col items-center justify-center p-2 ${activeTab === "approved" ? "text-blue-600" : "text-gray-600"}`}
            >
              <FiUserCheck size={20} />
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