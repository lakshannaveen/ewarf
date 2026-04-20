// export default function Login() {
//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
//         {/* Header */}
//         <div className="text-center">
//           <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
//             Welcome Back
//           </h2>
//           <p className="mt-2 text-sm text-gray-600">
//             Sign in to your account
//           </p>
//         </div>

//         {/* Form */}
//         <form className="mt-8 space-y-6">
//           <div className="rounded-md shadow-sm space-y-4">
//             {/* Email */}
//             <div>
//               <label htmlFor="email" className="sr-only">
//                 Email address
//               </label>
//               <input
//                 id="email"
//                 name="email"
//                 type="email"
//                 required
//                 className="appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
//                 placeholder="Email address"
//               />
//             </div>

//             {/* Password */}
//             <div>
//               <label htmlFor="password" className="sr-only">
//                 Password
//               </label>
//               <input
//                 id="password"
//                 name="password"
//                 type="password"
//                 required
//                 className="appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
//                 placeholder="Password"
//               />
//             </div>
//           </div>

//           {/* Remember me and Forgot password */}
//           <div className="flex items-center justify-between">
//             <div className="flex items-center">
//               <input
//                 id="remember-me"
//                 name="remember-me"
//                 type="checkbox"
//                 className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
//               />
//               <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
//                 Remember me
//               </label>
//             </div>

//             <div className="text-sm">
//               <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
//                 Forgot your password?
//               </a>
//             </div>
//           </div>

//           {/* Login Button */}
//           <div>
//             <button
//               type="submit"
//               className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
//             >
//               Sign in
//             </button>
//           </div>

//           {/* Divider */}
//           <div className="relative">
//             <div className="absolute inset-0 flex items-center">
//               <div className="w-full border-t border-gray-300"></div>
//             </div>
//             <div className="relative flex justify-center text-sm">
//               <span className="px-2 bg-white text-gray-500">Or continue with</span>
//             </div>
//           </div>

//           {/* Social Login */}
//           <div className="grid grid-cols-2 gap-3">
//             <button
//               type="button"
//               className="flex items-center justify-center w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
//             >
//               Github
//             </button>
//             <button
//               type="button"
//               className="flex items-center justify-center w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
//             >
//               Twitter
//             </button>
//           </div>

//           {/* Sign up link */}
//           <p className="mt-2 text-center text-sm text-gray-600">
//             Don't have an account?{' '}
//             <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
//               Sign up
//             </a>
//           </p>
//         </form>
//       </div>
//     </div>
//   );
// }
// import React, { useState, useEffect, useRef } from "react";
// import PhoneInput from "react-phone-input-2";
// import "react-phone-input-2/lib/style.css";
// import logo from "../images/logo.png";
// import logo1 from "../images/Group 6.png";
// import { motion } from "framer-motion";
// import { FaMobileAlt } from "react-icons/fa";

// export default function Login() {
//   const [mobile, setMobile] = useState("");
//   const [error, setError] = useState("");
//   const [showOTPModal, setShowOTPModal] = useState(false);
//   const [otp, setOtp] = useState(Array(4).fill(""));
//   const [timer, setTimer] = useState(120); // 2 minutes countdown
//   const [isResendAllowed, setIsResendAllowed] = useState(false); // Track resend state
//   const [otpSentMessage, setOtpSentMessage] = useState(""); // Message for OTP sent
//   const [otpSuccessMessage, setOtpSuccessMessage] = useState(""); // OTP success message

//   // Create refs for OTP input fields
//   const inputRefs = useRef([]);
//   inputRefs.current = [];

//   const validateMobile = (mobile) => /^[0-9]{7,15}$/.test(mobile);

//   useEffect(() => {
//     let interval;
//     if (timer > 0) {
//       interval = setInterval(() => {
//         setTimer((prevTimer) => prevTimer - 1);
//       }, 1000);
//     } else {
//       clearInterval(interval);
//       setIsResendAllowed(true); // Allow resend OTP when timer ends
//     }

//     return () => clearInterval(interval);
//   }, [timer]);

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (!mobile.trim()) {
//       setError("Please enter your mobile number.");
//       return;
//     }
//     if (!validateMobile(mobile.replace(/[^0-9]/g, ""))) {
//       setError("Please enter a valid mobile number.");
//       return;
//     }
//     setError("");
//     setShowOTPModal(true);
//     setTimer(120); // Reset timer when OTP modal is shown
//     setIsResendAllowed(false); // Disable resend while timer is active
//     setOtpSentMessage(""); // Clear previous message before sending a new OTP
//   };

//   const handleOtpChange = (index, value) => {
//     if (!/^[0-9]?$/.test(value)) return;
//     const newOtp = [...otp];
//     newOtp[index] = value;
//     setOtp(newOtp);

//     // Move focus to the next input if a digit is entered
//     if (value && index < otp.length - 1) {
//       inputRefs.current[index + 1].focus();
//     }
//   };

//   const handleOtpSubmit = (e) => {
//     e.preventDefault();
//     if (otp.some((digit) => digit === "")) {
//       alert("Please enter the full OTP.");
//       return;
//     }

//     // Show success popup after OTP is successfully entered
//     setOtpSuccessMessage("OTP added successfully!");

//     setTimeout(() => {
//       setOtpSuccessMessage(""); // Hide success message after 3 seconds
//     }, 3000);

//     // You can do other actions here after the OTP verification, e.g., logging in the user
//     alert("OTP verified successfully! You are now logged in.");
//     setShowOTPModal(false);
//   };

//   const handleResendOTP = () => {
//     setOtp(Array(4).fill("")); // Clear OTP input
//     setTimer(120); // Reset the timer
//     setIsResendAllowed(false); // Disable resend while the timer is running

//     // Add your logic here for resending the OTP (e.g., API call)
//     setOtpSentMessage("OTP has been sent successfully!"); // Show OTP sent message
//     alert("OTP has been resent!"); // Optionally show a browser alert
//   };

//   const formatTime = (seconds) => {
//     const minutes = Math.floor(seconds / 60);
//     const remainingSeconds = seconds % 60;
//     return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
//   };

//   return (
//     <div className="min-h-screen flex flex-col md:flex-row relative overflow-hidden">
//       <motion.div className="md:w-2/3 w-full bg-gradient-to-br from-blue-600 to-blue-400 relative p-8 flex flex-col justify-center items-center text-white text-center">
//         <motion.div className="max-w-md relative">
//           <div className="flex items-center gap-2 mb-6">
//             <img src={logo} alt="CDPLC Logo" className="w-14 h-14 drop-shadow-lg" />
//             <div>
//               <h1 className="text-2xl font-bold">Colombo Dockyard PLC</h1>
//               <p className="text-sm italic">...an odyssey of Excellence</p>
//             </div>
//           </div>
//           <p className="text-lg mb-6">Login and select categories effortlessly!</p>
//         </motion.div>
//       </motion.div>

//       <motion.div className="md:w-1/3 w-full bg-gray-50 p-8 flex flex-col justify-center items-center relative overflow-hidden">
//         <motion.div className="w-full max-w-md bg-white p-6 rounded-2xl shadow-lg">
//           <div className="text-center mb-6">
//             <img src={logo1} alt="CDPLC Logo" className="w-15 h-45 drop-shadow-lg" />
//           </div>
//           <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">Sign in</h2>
//           <form className="space-y-4" onSubmit={handleSubmit}>
//             <div className="relative">
//               <FaMobileAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
//               <PhoneInput
//                 country={"lk"}
//                 value={mobile}
//                 onChange={setMobile}
//                 inputClass="w-full pl-12 pr-4 py-3 rounded-lg bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
//               />
//             </div>
//             {error && <p className="text-red-500 text-sm text-center mt-2">{error}</p>}
//             <button type="submit" className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-all duration-300 shadow-md font-semibold mt-4">LOGIN</button>
//           </form>
//         </motion.div>
//       </motion.div>

//       {showOTPModal && (
//         <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-10">
//           <motion.div className="bg-white px-4 sm:px-8 py-10 rounded-xl shadow max-w-md mx-auto text-center">
//             <h1 className="text-2xl font-bold mb-1">Mobile Phone Verification</h1>
//             <p className="text-[15px] text-slate-500">Enter the 4-digit verification code sent to your phone.</p>

//             {/* OTP Sent Message Box */}
//             {otpSentMessage && (
//               <div className="mt-4 text-green-500 font-semibold">
//                 {otpSentMessage}
//               </div>
//             )}

//             {/* OTP Success Message Popup */}
//             {otpSuccessMessage && (
//               <div className="mt-4 text-green-600 font-semibold p-2 bg-green-100 rounded-md shadow-md">
//                 {otpSuccessMessage}
//               </div>
//             )}

//             <form onSubmit={handleOtpSubmit} className="mt-6">
//               <div className="flex items-center justify-center gap-3">
//                 {otp.map((digit, index) => (
//                   <input
//                     key={index}
//                     type="text"
//                     className="w-14 h-14 text-center text-2xl font-extrabold bg-slate-100 border border-transparent rounded p-4 focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
//                     maxLength="1"
//                     value={digit}
//                     onChange={(e) => handleOtpChange(index, e.target.value)}
//                     ref={(el) => inputRefs.current[index] = el} // Store references for each input
//                   />
//                 ))}
//               </div>
//               <div className="mt-4 text-sm text-gray-500">
//                 <p>Time left: {formatTime(timer)}</p>
//                 <button
//                   type="button"
//                   onClick={handleResendOTP}
//                   disabled={!isResendAllowed}
//                   className={`mt-2 w-full bg-indigo-500 text-white py-3 rounded-lg ${!isResendAllowed ? "cursor-not-allowed opacity-50" : ""}`}
//                 >
//                   {isResendAllowed ? "Resend OTP" : "Resend OTP in " + formatTime(timer)}
//                 </button>
//               </div>
//               <button type="submit" className="w-full bg-indigo-500 text-white py-3 rounded-lg mt-4 hover:bg-indigo-600 transition">Verify Account</button>
//             </form>
//           </motion.div>
//         </div>
//       )}
//     </div>
//   );
// }

// import React, { useState, useEffect, useRef } from "react";
// import PhoneInput from "react-phone-input-2";
// import "react-phone-input-2/lib/style.css";
// // import logo from "../images/logo.png";
// import logo1 from "../images/New Project55.png";
// import logo2 from "../images/New Project (1).png";
// import bgImage from "../images/pexels-wolfgang-weiser-467045605-30825820.jpg";
// import { motion } from "framer-motion";
// import { FaMobileAlt } from "react-icons/fa";

// export default function Login() {
//   const [mobile, setMobile] = useState("");
//   const [error, setError] = useState("");
//   const [showOTPModal, setShowOTPModal] = useState(false);
//   const [otp, setOtp] = useState(["", "", "", ""]);
//   const [timer, setTimer] = useState(90); // 90 seconds for countdown
//   const [otpSent, setOtpSent] = useState(false); // Track OTP sent status
//   const [otpSentMessage, setOtpSentMessage] = useState(""); // Success message for OTP
//   const inputRefs = useRef([]);

//   // Validate the mobile number
//   const validateMobile = (mobile) => /^[0-9]{7,15}$/.test(mobile);

//   // Validate OTP
//   const validateOtp = (otp) => otp.join("").length === 4;

//   // Handle form submission
//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (!mobile.trim()) {
//       setError("Please enter your mobile number.");
//       return;
//     }
//     if (!validateMobile(mobile.replace(/[^0-9]/g, ""))) {
//       setError("Please enter a valid mobile number.");
//       return;
//     }
//     setError("");
//     setOtpSent(true);
//     setOtpSentMessage("OTP sent successfully to your mobile number.");
//     setShowOTPModal(true);

//     // Start the timer
//     const countdown = setInterval(() => {
//       setTimer((prev) => {
//         if (prev === 1) {
//           clearInterval(countdown);
//           return 0;
//         }
//         return prev - 1;
//       });
//     }, 1000);
//   };

//   // Handle OTP submission
//   const handleOtpSubmit = (e) => {
//     e.preventDefault();
//     if (!validateOtp(otp)) {
//       alert("Please enter a valid 4-digit OTP.");
//       return;
//     }
//     alert("OTP verified successfully! You are now logged in.");
//     setShowOTPModal(false);
//   };

//   // Resend OTP
//   const handleResendOtp = () => {
//     setOtp(["", "", "", ""]); // Clear OTP field
//     setTimer(90); // Reset the timer
//     setOtpSent(false); // Reset OTP sent status
//     setOtpSentMessage("OTP sent successfully to your mobile number."); // Reset OTP success message
//     setShowOTPModal(true); // Reopen OTP modal
//   };

//   // Handle OTP input change
//   const handleOtpChange = (e, index) => {
//     const value = e.target.value.replace(/[^0-9]/g, "");
//     if (value.length > 0) {
//       otp[index] = value;
//       setOtp([...otp]);

//       // Focus the next input after entering a value
//       if (index < 3 && value.length === 1) {
//         inputRefs.current[index + 1].focus();
//       }
//     }
//   };

//   // Handle backspace to focus on the previous input
//   const handleBackspace = (e, index) => {
//     if (e.key === "Backspace" && otp[index] === "") {
//       if (index > 0) {
//         inputRefs.current[index - 1].focus();
//       }
//     }
//   };

//   // Format time for the countdown
//   const formatTime = (seconds) => {
//     const minutes = Math.floor(seconds / 60);
//     const secondsRemaining = seconds % 60;
//     return `${minutes}:${secondsRemaining < 10 ? "0" : ""}${secondsRemaining}`;
//   };

//   return (
//     <div className="min-h-screen flex flex-col md:flex-row">

//    {/* Left Side - With Background Image */}
// <div
//   className="md:w-2/3 w-full min-h-screen relative p-6 flex flex-col justify-center md:justify-start items-center md:items-start text-white text-center"
//   style={{
//     backgroundImage: `url(${bgImage})`, // Set imported image as background
//     backgroundSize: "cover",
//     backgroundPosition: "center",
//   }}
// >
//   <motion.div
//     initial={{ opacity: 0, y: -20 }}
//     animate={{ opacity: 1, y: 0 }}
//     transition={{ duration: 0.8 }}
//     className="absolute top-10 left-1/3 transform -translate-x-1/2 flex flex-col items-center"
//   >
//     {/* Logo Positioned at the Top Center */}
//     <div>
//       <img src={logo2} alt="Company Image" className="w-48 md:w-72" />
//     </div>
//   </motion.div>
// </div>

//       {/* Right Side - Modern UI */}
// <div className="md:w-2/4 w-full bg-white flex flex-col justify-center items-center px-8 py-14">
//   <motion.div
//     initial={{ opacity: 0, y: 20 }}
//     animate={{ opacity: 1, y: 0 }}
//     transition={{ duration: 0.8 }}
//     className="w-full max-w-lg bg-white p-12 rounded-3xl shadow-2xl border border-gray-200"
//   >
//     {/* Logo */}
//     <div className="flex justify-center">
//       <img src={logo1} alt="CDPLC Logo" className="w-40 h-40 mb-6" />
//     </div>

//     {/* Sign In Title */}
//     <h2 className="text-4xl font-extrabold text-gray-900 text-center mb-4">Welcome Back</h2>
//     <p className="text-gray-500 text-center mb-8 text-lg">
//       Log in to continue and explore more features.
//     </p>

//     {/* Login Form */}
//     <form className="space-y-6" onSubmit={handleSubmit}>
//       {/* Phone Number Input */}
//       <div className="relative">
//         <PhoneInput
//           country={"lk"} // Default to Sri Lanka
//           value={mobile}
//           onChange={setMobile}
//           inputClass="!w-full !py-4 !pl-10 !pr-4 !rounded-xl !bg-gray-100 !border !border-gray-300 focus:!outline-none focus:!ring-2 focus:!ring-blue-600 !text-gray-700 text-lg"
//           onlyCountries={["us", "gb", "in", "lk", "au", "ca", "de", "fr", "cn", "jp", "br"]}
//           international
//         />
//       </div>

//       {error && <p className="text-red-500 text-sm text-center">{error}</p>}

//       {/* Login Button */}
//       <button
//         type="submit"
//         className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white py-4 rounded-xl font-semibold text-lg hover:shadow-lg hover:scale-105 transition-all duration-300"
//       >
//         Login
//       </button>

//       <p className="text-gray-500 text-center mt-6 text-sm">
//         By logging in, you agree to our{" "}
//         <a href="#" className="text-blue-600 font-medium hover:underline">Terms & Conditions</a> and{" "}
//         <a href="#" className="text-blue-600 font-medium hover:underline">Privacy Policy</a>.
//       </p>
//     </form>
//   </motion.div>
// </div>

//       {/* OTP Modal */}
//       {showOTPModal && (
//         <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-10">
//           <motion.div
//             initial={{ opacity: 0, y: -20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.8 }}
//             className="bg-white w-full sm:w-96 p-8 rounded-2xl shadow-xl"
//           >
//             <h3 className="text-3xl font-semibold text-center mb-6 text-gray-900">Enter the 4-Digit OTP</h3>
//             <p className="text-gray-600 text-center mb-6">We have sent a 4-digit One-Time Password (OTP) to your registered mobile number. </p>
//             {otpSent && (
//               <div className="flex justify-center items-center text-lg font-semibold text-green-600 mb-4">
//                 <span>{otpSentMessage}</span>
//               </div>
//             )}

//             {otpSent && (
//               <div className="flex justify-center items-center text-lg font-semibold text-gray-700 mb-4">
//                 <span>Time remaining: {formatTime(timer)}</span>
//               </div>
//             )}

//             <form onSubmit={handleOtpSubmit}>
//               <div className="flex justify-between space-x-4 mb-6">
//                 {otp.map((value, index) => (
//                   <input
//                     key={index}
//                     type="text"
//                     maxLength="1"
//                     value={value}
//                     onChange={(e) => handleOtpChange(e, index)}
//                     onKeyDown={(e) => handleBackspace(e, index)}
//                     ref={(el) => (inputRefs.current[index] = el)}
//                     className="w-14 h-14 text-2xl text-center rounded-lg border-2 border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   />
//                 ))}
//               </div>

//               <button
//                 type="submit"
//                 className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-300 shadow-md"
//               >
//                 Verify OTP
//               </button>
//             </form>

//             {timer === 0 && (
//               <div className="text-center mt-4">
//                 <button
//                   onClick={handleResendOtp}
//                   className="text-blue-600 hover:underline"
//                 >
//                   Resend OTP
//                 </button>
//               </div>
//             )}
//           </motion.div>
//         </div>
//       )}
//     </div>
//   );
// }

// import React, { useState, useRef, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import PhoneInput from "react-phone-input-2";
// import "react-phone-input-2/lib/style.css";
// import Swal from "sweetalert2";
// import logo1 from "../images/New Project55.png";
// import logo2 from "../images/New Project (1).png";
// import bgImage from "../images/photo-colombo-101923.jpg";
// import { motion } from "framer-motion";
// import axios from "axios";

// export default function AuthForm() {
//   const navigate = useNavigate();
//   const [authView, setAuthView] = useState("login"); // 'login', 'signup', 'admin'
//   const [mobile, setMobile] = useState("");
//   const [otp, setOtp] = useState(["", "", "", "", ""]);
//   const [showOtpModal, setShowOtpModal] = useState(false);
//   const [username, setUsername] = useState("");
//   const [timer, setTimer] = useState(60);
//   const [canResend, setCanResend] = useState(false);
//   const [backendotpcode, setBackendotpcode] = useState("");
//   const [companies, setCompanies] = useState([]);
//   const [companiesLoading, setCompaniesLoading] = useState(false);
//   const [companiesLoaded, setCompaniesLoaded] = useState(false);

//   // Admin login state
//   const [adminCredentials, setAdminCredentials] = useState({
//     username: "",
//     password: ""
//   });

//   const [signupData, setSignupData] = useState({
//     name: "",
//     company: "",
//     phone: "",
//     email: "",
//     address: "",
//   });

//   const inputRefs = useRef([]);
//   const validateMobile = (mobile) => /^[0-9]{7,15}$/.test(mobile);
//   const validateOtp = (otp) => otp.join("").length === 5;

//   const fetchCompanies = async () => {
//     if (companiesLoaded || companiesLoading) return;
//     setCompaniesLoading(true);
//     try {
//       const response = await axios.get("https://esystems.cdl.lk/backend-test/ewharf/User/Companydetails");
//       if (response.data && response.data.ResultSet) {
//         setCompanies(response.data.ResultSet);
//         setCompaniesLoaded(true);
//       }
//     } catch (error) {
//       console.error("Error fetching companies:", error);
//     } finally {
//       setCompaniesLoading(false);
//     }
//   };

//   const toggleAuthView = (view) => {
//     setAuthView(view);
//     setMobile("");
//     setAdminCredentials({ username: "", password: "" });
//     setSignupData({
//       name: "",
//       company: "",
//       phone: "",
//       email: "",
//       address: "",
//     });
//   };

//   // Admin Login
//   const handleAdminLogin = async (e) => {
//     e.preventDefault();
    
//     if (!adminCredentials.username.trim() || !adminCredentials.password.trim()) {
//       Swal.fire("Error", "Please enter both username and password", "error");
//       return;
//     }

//     // Hardcoded admin credentials
//     if (adminCredentials.username === "Admin" && adminCredentials.password === "Admin") {
//       Swal.fire({
//         title: "Login Successful!",
//         text: "Welcome to Admin Panel",
//         icon: "success",
//         timer: 1500,
//         showConfirmButton: false
//       }).then(() => {
//         navigate("/admin");
//       });
//     } else {
//       Swal.fire("Invalid Credentials", "Please check your username and password", "error");
//     }
//   };

//   // User Login
//   const handleLoginSubmit = async (e) => {
//     e.preventDefault();
//     if (!mobile.trim() || !validateMobile(mobile.replace(/[^0-9]/g, ""))) {
//       Swal.fire(
//         "Invalid Mobile Number",
//         "Please enter a valid mobile number.",
//         "error"
//       );
//       return;
//     }
//     try {
//       const response = await axios.post(
//         `https://esystems.cdl.lk/backend-test/ewharf/ValueList/login?contact=${mobile}`
//       );
//       const receivedOtp = response.data.otpcode;
//       const username = response.data.username;
//       setUsername(username);
//       localStorage.setItem("username_store", username);
//       setBackendotpcode(receivedOtp);
//       Swal.fire("OTP Sent!", `OTP has been sent to ${mobile}.`, "success").then(
//         () => {
//           setShowOtpModal(true);
//           setTimer(60);
//           setOtp(["", "", "", "", ""]);
//           startCountdown();
//         }
//       );
//     } catch (error) {
//       Swal.fire("Error", "Failed to send OTP. Please try again.", "error");
//       console.error("Login error:", error);
//     }
//   };

//   // Signup
//   const handleSignupSubmit = async (e) => {
//     e.preventDefault();
//     if (
//       !signupData.name.trim() ||
//       !signupData.company ||
//       !signupData.phone ||
//       !signupData.email.trim() ||
//       !signupData.address.trim()
//     ) {
//       Swal.fire("Incomplete Form", "Please fill all required fields.", "error");
//       return;
//     }
//     if (!validateMobile(signupData.phone.replace(/[^0-9]/g, ""))) {
//       Swal.fire(
//         "Invalid Phone Number",
//         "Please enter a valid phone number.",
//         "error"
//       );
//       return;
//     }
//     try {
//       const params = new URLSearchParams({
//         Emp_TelNo: signupData.phone,
//         Emp_ComId: signupData.company,
//         Emp_Name: signupData.name,
//         Emp_Rol: "E",
//         Emp_Email: signupData.email,
//         Emp_Address: signupData.address,
//       });
//       const res = await axios.post(
//         `https://esystems.cdl.lk/backend-test/ewharf/User/UserRegister?${params.toString()}`
//       );
//       Swal.fire(
//         "Request Submitted!",
//         res.data.message || "Your request has been sent to admin for approval.",
//         "success"
//       ).then(() => {
//         setAuthView("login");
//       });
//     } catch (error) {
//       Swal.fire(
//         "Error",
//         "Failed to submit request. Please try again.",
//         "error"
//       );
//       console.error("Signup error:", error);
//     }
//   };

//   const handleOtpSubmit = (e) => {
//     e.preventDefault();
//     const enteredOtp = otp.join("");
//     if (!validateOtp(otp)) {
//       Swal.fire("Invalid OTP", "Please enter a valid 5-digit OTP.", "error");
//       return;
//     }
//     if (enteredOtp !== backendotpcode.toString()) {
//       Swal.fire(
//         "Incorrect OTP",
//         "The OTP you entered does not match.",
//         "error"
//       );
//       return;
//     }
//     Swal.fire({
//       title: "Login Successful",
//       text: "You have been successfully logged in!",
//       icon: "success",
//       timer: 2000,
//       showConfirmButton: false,
//     }).then(() => {
//       navigate("/home");
//     });
//   };

//   const handleResendOtp = () => {
//     Swal.fire(
//       "OTP Resent!",
//       `A new OTP has been sent to ${mobile}.`,
//       "info"
//     ).then(() => {
//       setOtp(["", "", "", "", ""]);
//       setTimer(60);
//       setCanResend(false);
//       startCountdown();
//     });
//   };

//   const startCountdown = () => {
//     const countdown = setInterval(() => {
//       setTimer((prev) => {
//         if (prev === 1) {
//           clearInterval(countdown);
//           setCanResend(true);
//           return 0;
//         }
//         return prev - 1;
//       });
//     }, 1000);
//   };

//   const handleOtpChange = (e, index) => {
//     const value = e.target.value.replace(/[^0-9]/g, "");
//     if (value.length > 0) {
//       otp[index] = value;
//       setOtp([...otp]);
//       if (index < 4 && value.length === 1) {
//         inputRefs.current[index + 1].focus();
//       }
//     }
//   };

//   const handleBackspace = (e, index) => {
//     if (e.key === "Backspace" && otp[index] === "" && index > 0) {
//       inputRefs.current[index - 1].focus();
//     }
//   };

//   const handleSignupChange = (e) => {
//     const { name, value } = e.target;
//     setSignupData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   const handleAdminChange = (e) => {
//     const { name, value } = e.target;
//     setAdminCredentials((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   return (
//     <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-r from-blue-500 to-purple-600">
//       {/* Left Side */}
//       <motion.div
//         className="md:w-5/5 w-full min-h-screen relative p-10 flex flex-col justify-center items-center text-white text-center"
//         style={{
//           backgroundImage: `url(${bgImage})`,
//           backgroundSize: "cover",
//           backgroundPosition: "center",
//         }}
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         transition={{ duration: 1 }}
//       >
//         <img src={logo2} alt="Company" className="w-48 md:w-72 mb-8" />
//         <motion.div
//           className="bg-black bg-opacity-50 p-6 rounded-xl"
//           initial={{ y: 20, opacity: 0 }}
//           animate={{ y: 0, opacity: 1 }}
//           transition={{ delay: 0.3 }}
//         >
//           <h2 className="text-3xl font-bold mb-4">
//             {authView === "login" && "Welcome Back!"}
//             {authView === "signup" && "Join Us Today!"}
//             {authView === "admin" && "Admin Access"}
//           </h2>
//           <p className="text-lg">
//             {authView === "login" && "Enter your credentials to access your account."}
//             {authView === "signup" && "Create an account to get started with our services."}
//             {authView === "admin" && "Administrator login portal for system management."}
//           </p>
//         </motion.div>
//       </motion.div>

//       {/* Right Side */}
//       <motion.div
//         className="md:w-3/5 w-full bg-white flex flex-col justify-center items-center px-8 py-14 relative"
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         transition={{ duration: 1, delay: 0.2 }}
//       >
//         <motion.div
//           className="relative w-full max-w-lg bg-white p-12 rounded-3xl shadow-xl"
//           whileHover={{ scale: 1.02 }}
//           transition={{ type: "spring", stiffness: 300 }}
//         >
//           <div className="flex justify-center mb-6">
//             <img src={logo1} alt="CDPLC" className="w-40 h-40" />
//           </div>

//           {/* Toggle Buttons */}
//           <div className="flex justify-center mb-8">
//             <div className="bg-gray-100 p-1 rounded-full inline-flex">
//               <button
//                 onClick={() => toggleAuthView("login")}
//                 className={`px-6 py-2 rounded-full font-medium transition-all ${
//                   authView === "login"
//                     ? "bg-blue-600 text-white shadow-md"
//                     : "text-gray-600 hover:text-gray-800"
//                 }`}
//               >
//                 Login
//               </button>
//               <button
//                 onClick={() => toggleAuthView("signup")}
//                 className={`px-6 py-2 rounded-full font-medium transition-all ${
//                   authView === "signup"
//                     ? "bg-blue-600 text-white shadow-md"
//                     : "text-gray-600 hover:text-gray-800"
//                 }`}
//               >
//                 Sign Up
//               </button>
//               <button
//                 onClick={() => toggleAuthView("admin")}
//                 className={`px-6 py-2 rounded-full font-medium transition-all ${
//                   authView === "admin"
//                     ? "bg-blue-600 text-white shadow-md"
//                     : "text-gray-600 hover:text-gray-800"
//                 }`}
//               >
//                 Admin
//               </button>
//             </div>
//           </div>

//           {authView === "login" ? (
//             // Login Form
//             <>
//               <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-4">
//                 Login to Your Account
//               </h2>
//               <p className="text-gray-500 text-center mb-8 text-lg">
//                 Enter your phone number to receive OTP
//               </p>
//               <form className="space-y-6" onSubmit={handleLoginSubmit}>
//                 <PhoneInput
//                   country={"lk"}
//                   value={mobile}
//                   onChange={setMobile}
//                   inputClass="!w-full !py-4 !rounded-xl !bg-gray-100 !border !border-gray-300 focus:!outline-none focus:!ring-2 focus:!ring-blue-600 !text-gray-700 text-lg"
//                   onlyCountries={[
//                     "us",
//                     "gb",
//                     "in",
//                     "lk",
//                     "au",
//                     "ca",
//                     "de",
//                     "fr",
//                     "cn",
//                     "jp",
//                     "br",
//                   ]}
//                   international
//                 />
//                 <motion.button
//                   type="submit"
//                   className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white py-4 rounded-xl font-semibold text-lg hover:shadow-lg"
//                   whileHover={{ scale: 1.02 }}
//                   whileTap={{ scale: 0.98 }}
//                 >
//                   Send OTP
//                 </motion.button>
//               </form>
//             </>
//           ) : authView === "signup" ? (
//             // Signup Form
//             <>
//               <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-4">
//                 Create New Account
//               </h2>
//               <p className="text-gray-500 text-center mb-8 text-lg">
//                 Fill in your details to register
//               </p>
//               <form className="space-y-6" onSubmit={handleSignupSubmit}>
//                 <div className="space-y-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Full Name
//                     </label>
//                     <input
//                       type="text"
//                       name="name"
//                       value={signupData.name}
//                       onChange={handleSignupChange}
//                       className="w-full px-4 py-3 rounded-xl bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-700 text-lg"
//                       placeholder="Enter your full name"
//                       required
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Company
//                     </label>
//                     <select
//                       name="company"
//                       value={signupData.company}
//                       onChange={handleSignupChange}
//                       onFocus={fetchCompanies}
//                       className="w-full px-4 py-3 rounded-xl bg-gray-100 border border-gray-300 
//             focus:outline-none focus:ring-2 focus:ring-blue-600 
//             text-gray-700 text-lg"
//                       required
//                     >
//                       <option value="" disabled>
//                         {companiesLoading
//                           ? "Loading companies..."
//                           : "Select your company"}
//                       </option>

//                       {companies.map((c) => (
//                         <option key={c.Com_ID} value={c.Com_ID}>
//                           {c.Com_Name}
//                         </option>
//                       ))}
//                     </select>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Phone Number
//                     </label>
//                     <PhoneInput
//                       country={"lk"}
//                       value={signupData.phone}
//                       onChange={(phone) =>
//                         setSignupData({ ...signupData, phone })
//                       }
//                       inputClass="!w-full !py-3 !rounded-xl !bg-gray-100 !border !border-gray-300 focus:!outline-none focus:!ring-2 focus:!ring-blue-600 !text-gray-700 text-lg"
//                       onlyCountries={[
//                         "us",
//                         "gb",
//                         "in",
//                         "lk",
//                         "au",
//                         "ca",
//                         "de",
//                         "fr",
//                         "cn",
//                         "jp",
//                         "br",
//                       ]}
//                       international
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Email
//                     </label>
//                     <input
//                       type="email"
//                       name="email"
//                       value={signupData.email}
//                       onChange={handleSignupChange}
//                       className="w-full px-4 py-3 rounded-xl bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-700 text-lg"
//                       placeholder="Enter your email"
//                       required
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Address
//                     </label>
//                     <input
//                       type="text"
//                       name="address"
//                       value={signupData.address}
//                       onChange={handleSignupChange}
//                       className="w-full px-4 py-3 rounded-xl bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-700 text-lg"
//                       placeholder="Enter your address"
//                       required
//                     />
//                   </div>
//                 </div>

//                 <motion.button
//                   type="submit"
//                   className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white py-4 rounded-xl font-semibold text-lg hover:shadow-lg"
//                   whileHover={{ scale: 1.02 }}
//                   whileTap={{ scale: 0.98 }}
//                 >
//                   Submit Request
//                 </motion.button>
//               </form>
//             </>
//           ) : (
//             // Admin Login Form
//             <>
//               <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-4">
//                 Admin Login
//               </h2>
//               <p className="text-gray-500 text-center mb-8 text-lg">
//                 Enter administrator credentials
//               </p>
//               <form className="space-y-6" onSubmit={handleAdminLogin}>
//                 <div className="space-y-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Username
//                     </label>
//                     <input
//                       type="text"
//                       name="username"
//                       value={adminCredentials.username}
//                       onChange={handleAdminChange}
//                       className="w-full px-4 py-3 rounded-xl bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-700 text-lg"
//                       placeholder="Enter admin username"
//                       required
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Password
//                     </label>
//                     <input
//                       type="password"
//                       name="password"
//                       value={adminCredentials.password}
//                       onChange={handleAdminChange}
//                       className="w-full px-4 py-3 rounded-xl bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-700 text-lg"
//                       placeholder="Enter admin password"
//                       required
//                     />
//                   </div>
//                 </div>

//                 <motion.button
//                   type="submit"
//                   className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white py-4 rounded-xl font-semibold text-lg hover:shadow-lg"
//                   whileHover={{ scale: 1.02 }}
//                   whileTap={{ scale: 0.98 }}
//                 >
//                   Login as Admin
//                 </motion.button>
//               </form>
//             </>
//           )}

//           <div className="mt-6 text-center">
//             {authView === "login" && (
//               <div className="space-y-2">
//                 <button
//                   onClick={() => toggleAuthView("signup")}
//                   className="text-blue-600 hover:text-blue-800 font-medium block"
//                 >
//                   Don't have an account? Sign Up
//                 </button>
//                 <button
//                   onClick={() => toggleAuthView("admin")}
//                   className="text-gray-600 hover:text-gray-800 font-medium block"
//                 >
//                   Admin Access
//                 </button>
//               </div>
//             )}
//             {authView === "signup" && (
//               <div className="space-y-2">
//                 <button
//                   onClick={() => toggleAuthView("login")}
//                   className="text-blue-600 hover:text-blue-800 font-medium block"
//                 >
//                   Already have an account? Login
//                 </button>
//                 <button
//                   onClick={() => toggleAuthView("admin")}
//                   className="text-gray-600 hover:text-gray-800 font-medium block"
//                 >
//                   Admin Access
//                 </button>
//               </div>
//             )}
//             {authView === "admin" && (
//               <div className="space-y-2">
//                 <button
//                   onClick={() => toggleAuthView("login")}
//                   className="text-blue-600 hover:text-blue-800 font-medium block"
//                 >
//                   User Login
//                 </button>
//                 <button
//                   onClick={() => toggleAuthView("signup")}
//                   className="text-blue-600 hover:text-blue-800 font-medium block"
//                 >
//                   User Sign Up
//                 </button>
//               </div>
//             )}
//           </div>
//         </motion.div>
//       </motion.div>

//       {/* OTP Modal */}
//       {showOtpModal && (
//         <motion.div
//           className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-10"
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//         >
//           <motion.div
//             className="bg-white w-full sm:w-96 p-8 rounded-2xl shadow-xl"
//             initial={{ y: -20, opacity: 0 }}
//             animate={{ y: 0, opacity: 1 }}
//           >
//             <h3 className="text-3xl font-semibold text-center mb-6 text-gray-900">
//               Enter the 5-Digit OTP
//             </h3>
//             <p className="text-center text-gray-500 mb-6">Sent to {mobile}</p>
//             <form onSubmit={handleOtpSubmit}>
//               <div className="flex justify-center space-x-2 mb-6">
//                 {otp.map((value, index) => (
//                   <input
//                     key={index}
//                     type="text"
//                     maxLength="1"
//                     value={value}
//                     onChange={(e) => handleOtpChange(e, index)}
//                     onKeyDown={(e) => handleBackspace(e, index)}
//                     ref={(el) => (inputRefs.current[index] = el)}
//                     className="w-14 h-14 text-2xl text-center rounded-lg border-2 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                   />
//                 ))}
//               </div>
//               <motion.button
//                 type="submit"
//                 className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-300"
//                 whileHover={{ scale: 1.02 }}
//                 whileTap={{ scale: 0.98 }}
//               >
//                 Verify OTP
//               </motion.button>
//             </form>
//             <div className="mt-4 text-center text-sm text-gray-500">
//               {canResend ? (
//                 <button
//                   onClick={handleResendOtp}
//                   className="text-blue-600 hover:underline font-medium"
//                 >
//                   Resend OTP
//                 </button>
//               ) : (
//                 <p>Resend OTP in {timer}s</p>
//               )}
//             </div>
//           </motion.div>
//         </motion.div>
//       )}
//     </div>
//   );
// }




// import React, { useState, useRef, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import PhoneInput from "react-phone-input-2";
// import "react-phone-input-2/lib/style.css";
// import Swal from "sweetalert2";
// import logo1 from "../images/New Project55.png";
// import logo2 from "../images/New Project (1).png";
// import bgImage from "../images/photo-colombo-101923.jpg";
// import { motion } from "framer-motion";
// import axios from "axios";

// export default function AuthForm() {
//   const navigate = useNavigate();
//   const [isLoginView, setIsLoginView] = useState(true);
//   const [mobile, setMobile] = useState("");
//   const [otp, setOtp] = useState(["", "", "", "", ""]);
//   const [showOtpModal, setShowOtpModal] = useState(false);
//   const [username, setUsername] = useState("");
//   const [timer, setTimer] = useState(60);
//   const [canResend, setCanResend] = useState(false);
//   const [backendotpcode, setBackendotpcode] = useState("");
//   const [companies, setCompanies] = useState([]);
//   const [companiesLoading, setCompaniesLoading] = useState(false);
//   const [companiesLoaded, setCompaniesLoaded] = useState(false);
//   const [userType, setUserType] = useState("");
//   const [showRoleModal, setShowRoleModal] = useState(false);

//   const [signupData, setSignupData] = useState({
//     name: "",
//     company: "",
//     phone: "",
//     email: "",
//     address: "",
//   });

//   const inputRefs = useRef([]);
//   const validateMobile = (mobile) => /^[0-9]{7,15}$/.test(mobile);
//   const validateOtp = (otp) => otp.join("").length === 5;

//   const fetchCompanies = async () => {
//     if (companiesLoaded || companiesLoading) return;
//     setCompaniesLoading(true);
//     try {
//       const response = await axios.get("https://esystems.cdl.lk/backend-test/ewharf/User/Companydetails");
//       if (response.data && response.data.ResultSet) {
//         setCompanies(response.data.ResultSet);
//         setCompaniesLoaded(true);
//       }
//     } catch (error) {
//       console.error("Error fetching companies:", error);
//     } finally {
//       setCompaniesLoading(false);
//     }
//   };

//   const toggleAuthView = () => {
//     setIsLoginView(!isLoginView);
//     setMobile("");
//     setSignupData({
//       name: "",
//       company: "",
//       phone: "",
//       email: "",
//       address: "",
//     });
//   };

//   // Login
//   const handleLoginSubmit = async (e) => {
//     e.preventDefault();
//     if (!mobile.trim() || !validateMobile(mobile.replace(/[^0-9]/g, ""))) {
//       Swal.fire(
//         "Invalid Mobile Number",
//         "Please enter a valid mobile number.",
//         "error"
//       );
//       return;
//     }
//     try {
//       const response = await axios.post(
//         `https://esystems.cdl.lk/backend-test/ewharf/ValueList/login?contact=${mobile}`
//       );
//       const receivedOtp = response.data.otpcode;
//       const username = response.data.username;
//       const comid = response.data.comid;
//       const userType = response.data.usertype;
      
//       setUsername(username);
//       setUserType(userType);
//       localStorage.setItem("username_store", username);
//       localStorage.setItem("comid", comid);
//       setBackendotpcode(receivedOtp);
      
//       Swal.fire("OTP Sent!", `OTP has been sent to ${mobile}.`, "success").then(
//         () => {
//           setShowOtpModal(true);
//           setTimer(60);
//           setOtp(["", "", "", "", ""]);
//           startCountdown();
//         }
//       );
//     } catch (error) {
//       Swal.fire("Error", "Failed to send OTP. Please try again.", "error");
//       console.error("Login error:", error);
//     }
//   };

//   // Signup
//   const handleSignupSubmit = async (e) => {
//     e.preventDefault();
//     if (
//       !signupData.name.trim() ||
//       !signupData.company ||
//       !signupData.phone ||
//       !signupData.email.trim() ||
//       !signupData.address.trim()
//     ) {
//       Swal.fire("Incomplete Form", "Please fill all required fields.", "error");
//       return;
//     }
//     if (!validateMobile(signupData.phone.replace(/[^0-9]/g, ""))) {
//       Swal.fire(
//         "Invalid Phone Number",
//         "Please enter a valid phone number.",
//         "error"
//       );
//       return;
//     }
//     try {
//       const params = new URLSearchParams({
//         Emp_TelNo: signupData.phone,
//         Emp_ComId: signupData.company,
//         Emp_Name: signupData.name,
//         Emp_Rol: "E",
//         Emp_Email: signupData.email,
//         Emp_Address: signupData.address,
//       });
//       const res = await axios.post(
//         `https://esystems.cdl.lk/backend-test/ewharf/User/UserRegister?${params.toString()}`
//       );
//       Swal.fire(
//         "Request Submitted!",
//         res.data.message || "Your request has been sent to admin for approval.",
//         "success"
//       ).then(() => {
//         setIsLoginView(true);
//       });
//     } catch (error) {
//       Swal.fire(
//         "Error",
//         "Failed to submit request. Please try again.",
//         "error"
//       );
//       console.error("Signup error:", error);
//     }
//   };

//   // Handle role selection for admin-capable users
//   const handleRoleSelection = (role) => {
//     localStorage.setItem("role_store", role);
    
//     if (role === "Admin") {
//       navigate("/admin");
//     } else {
//       navigate("/home");
//     }
//     setShowOtpModal(false);
//     setShowRoleModal(false);
//   };

//   const handleOtpSubmit = (e) => {
//     e.preventDefault();
//     const enteredOtp = otp.join("");
//     if (!validateOtp(otp)) {
//       Swal.fire("Invalid OTP", "Please enter a valid 5-digit OTP.", "error");
//       return;
//     }
//     if (enteredOtp !== backendotpcode.toString()) {
//       Swal.fire(
//         "Incorrect OTP",
//         "The OTP you entered does not match.",
//         "error"
//       );
//       return;
//     }

//     // Successful OTP verification
//     if (userType === "A") {
//       // Admin-capable user - show role selection modal
//       setShowOtpModal(false);
//       setShowRoleModal(true);
//     } else {
//       // Regular user - proceed to home
//       Swal.fire({
//         title: "Login Successful",
//         text: "You have been successfully logged in!",
//         icon: "success",
//         timer: 2000,
//         showConfirmButton: false,
//       }).then(() => {
//         setShowOtpModal(false);
//         navigate("/home");
//       });
//     }
//   };

//   const handleResendOtp = () => {
//     Swal.fire(
//       "OTP Resent!",
//       `A new OTP has been sent to ${mobile}.`,
//       "info"
//     ).then(() => {
//       setOtp(["", "", "", "", ""]);
//       setTimer(60);
//       setCanResend(false);
//       startCountdown();
//     });
//   };

//   const startCountdown = () => {
//     const countdown = setInterval(() => {
//       setTimer((prev) => {
//         if (prev === 1) {
//           clearInterval(countdown);
//           setCanResend(true);
//           return 0;
//         }
//         return prev - 1;
//       });
//     }, 1000);
//   };

//   const handleOtpChange = (e, index) => {
//     const value = e.target.value.replace(/[^0-9]/g, "");
//     if (value.length > 0) {
//       otp[index] = value;
//       setOtp([...otp]);
//       if (index < 4 && value.length === 1) {
//         inputRefs.current[index + 1].focus();
//       }
//     }
//   };

//   const handleBackspace = (e, index) => {
//     if (e.key === "Backspace" && otp[index] === "" && index > 0) {
//       inputRefs.current[index - 1].focus();
//     }
//   };

//   const handleSignupChange = (e) => {
//     const { name, value } = e.target;
//     setSignupData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   return (
//     <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-r from-blue-500 to-purple-600">
//       {/* Left Side */}
//       <motion.div
//         className="md:w-5/5 w-full min-h-screen relative p-10 flex flex-col justify-center items-center text-white text-center"
//         style={{
//           backgroundImage: `url(${bgImage})`,
//           backgroundSize: "cover",
//           backgroundPosition: "center",
//         }}
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         transition={{ duration: 1 }}
//       >
//         <img src={logo2} alt="Company" className="w-48 md:w-72 mb-8" />
//         <motion.div
//           className="bg-black bg-opacity-50 p-6 rounded-xl"
//           initial={{ y: 20, opacity: 0 }}
//           animate={{ y: 0, opacity: 1 }}
//           transition={{ delay: 0.3 }}
//         >
//           <h2 className="text-3xl font-bold mb-4">
//             {isLoginView ? "Welcome Back!" : "Join Us Today!"}
//           </h2>
//           <p className="text-lg">
//             {isLoginView
//               ? "Enter your credentials to access your account."
//               : "Create an account to get started with our services."}
//           </p>
//         </motion.div>
//       </motion.div>

//       {/* Right Side */}
//       <motion.div
//         className="md:w-3/5 w-full bg-white flex flex-col justify-center items-center px-8 py-14 relative"
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         transition={{ duration: 1, delay: 0.2 }}
//       >
//         <motion.div
//           className="relative w-full max-w-lg bg-white p-12 rounded-3xl shadow-xl"
//           whileHover={{ scale: 1.02 }}
//           transition={{ type: "spring", stiffness: 300 }}
//         >
//           <div className="flex justify-center mb-6">
//             <img src={logo1} alt="CDPLC" className="w-40 h-40" />
//           </div>

//           {/* Toggle Buttons */}
//           <div className="flex justify-center mb-8">
//             <div className="bg-gray-100 p-1 rounded-full inline-flex">
//               <button
//                 onClick={() => setIsLoginView(true)}
//                 className={`px-6 py-2 rounded-full font-medium transition-all ${
//                   isLoginView
//                     ? "bg-blue-600 text-white shadow-md"
//                     : "text-gray-600 hover:text-gray-800"
//                 }`}
//               >
//                 Login
//               </button>
//               <button
//                 onClick={() => setIsLoginView(false)}
//                 className={`px-6 py-2 rounded-full font-medium transition-all ${
//                   !isLoginView
//                     ? "bg-blue-600 text-white shadow-md"
//                     : "text-gray-600 hover:text-gray-800"
//                 }`}
//               >
//                 Sign Up
//               </button>
//             </div>
//           </div>

//           {isLoginView ? (
//             // Login Form
//             <>
//               <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-4">
//                 Login to Your Account
//               </h2>
//               <p className="text-gray-500 text-center mb-8 text-lg">
//                 Enter your phone number to receive OTP
//               </p>
//               <form className="space-y-6" onSubmit={handleLoginSubmit}>
//                 <PhoneInput
//                   country={"lk"}
//                   value={mobile}
//                   onChange={setMobile}
//                   inputClass="!w-full !py-4 !rounded-xl !bg-gray-100 !border !border-gray-300 focus:!outline-none focus:!ring-2 focus:!ring-blue-600 !text-gray-700 text-lg"
//                   onlyCountries={[
//                     "us",
//                     "gb",
//                     "in",
//                     "lk",
//                     "au",
//                     "ca",
//                     "de",
//                     "fr",
//                     "cn",
//                     "jp",
//                     "br",
//                   ]}
//                   international
//                 />
//                 <motion.button
//                   type="submit"
//                   className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white py-4 rounded-xl font-semibold text-lg hover:shadow-lg"
//                   whileHover={{ scale: 1.02 }}
//                   whileTap={{ scale: 0.98 }}
//                 >
//                   Send OTP
//                 </motion.button>
//               </form>
//             </>
//           ) : (
//             // Signup Form
//             <>
//               <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-4">
//                 Create New Account
//               </h2>
//               <p className="text-gray-500 text-center mb-8 text-lg">
//                 Fill in your details to register
//               </p>
//               <form className="space-y-6" onSubmit={handleSignupSubmit}>
//                 <div className="space-y-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Full Name
//                     </label>
//                     <input
//                       type="text"
//                       name="name"
//                       value={signupData.name}
//                       onChange={handleSignupChange}
//                       className="w-full px-4 py-3 rounded-xl bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-700 text-lg"
//                       placeholder="Enter your full name"
//                       required
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Company
//                     </label>
//                     <select
//                       name="company"
//                       value={signupData.company}
//                       onChange={handleSignupChange}
//                       onFocus={fetchCompanies}
//                       className="w-full px-4 py-3 rounded-xl bg-gray-100 border border-gray-300 
//             focus:outline-none focus:ring-2 focus:ring-blue-600 
//             text-gray-700 text-lg"
//                       required
//                     >
//                       <option value="" disabled>
//                         {companiesLoading
//                           ? "Loading companies..."
//                           : "Select your company"}
//                       </option>

//                       {companies.map((c) => (
//                         <option key={c.Com_ID} value={c.Com_ID}>
//                           {c.Com_Name}
//                         </option>
//                       ))}
//                     </select>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Phone Number
//                     </label>
//                     <PhoneInput
//                       country={"lk"}
//                       value={signupData.phone}
//                       onChange={(phone) =>
//                         setSignupData({ ...signupData, phone })
//                       }
//                       inputClass="!w-full !py-3 !rounded-xl !bg-gray-100 !border !border-gray-300 focus:!outline-none focus:!ring-2 focus:!ring-blue-600 !text-gray-700 text-lg"
//                       onlyCountries={[
//                         "us",
//                         "gb",
//                         "in",
//                         "lk",
//                         "au",
//                         "ca",
//                         "de",
//                         "fr",
//                         "cn",
//                         "jp",
//                         "br",
//                       ]}
//                       international
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Email
//                     </label>
//                     <input
//                       type="email"
//                       name="email"
//                       value={signupData.email}
//                       onChange={handleSignupChange}
//                       className="w-full px-4 py-3 rounded-xl bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-700 text-lg"
//                       placeholder="Enter your email"
//                       required
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Address
//                     </label>
//                     <input
//                       type="text"
//                       name="address"
//                       value={signupData.address}
//                       onChange={handleSignupChange}
//                       className="w-full px-4 py-3 rounded-xl bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-700 text-lg"
//                       placeholder="Enter your address"
//                       required
//                     />
//                   </div>
//                 </div>

//                 <motion.button
//                   type="submit"
//                   className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white py-4 rounded-xl font-semibold text-lg hover:shadow-lg"
//                   whileHover={{ scale: 1.02 }}
//                   whileTap={{ scale: 0.98 }}
//                 >
//                   Submit Request
//                 </motion.button>
//               </form>
//             </>
//           )}

//           <div className="mt-6 text-center">
//             <button
//               onClick={toggleAuthView}
//               className="text-blue-600 hover:text-blue-800 font-medium"
//             >
//               {isLoginView
//                 ? "Don't have an account? Sign Up"
//                 : "Already have an account? Login"}
//             </button>
//           </div>
//         </motion.div>
//       </motion.div>

//       {/* OTP Modal */}
//       {showOtpModal && (
//         <motion.div
//           className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-10"
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//         >
//           <motion.div
//             className="bg-white w-full sm:w-96 p-8 rounded-2xl shadow-xl"
//             initial={{ y: -20, opacity: 0 }}
//             animate={{ y: 0, opacity: 1 }}
//           >
//             <h3 className="text-3xl font-semibold text-center mb-6 text-gray-900">
//               Enter the 5-Digit OTP
//             </h3>
//             <p className="text-center text-gray-500 mb-6">Sent to {mobile}</p>
//             <form onSubmit={handleOtpSubmit}>
//               <div className="flex justify-center space-x-2 mb-6">
//                 {otp.map((value, index) => (
//                   <input
//                     key={index}
//                     type="text"
//                     maxLength="1"
//                     value={value}
//                     onChange={(e) => handleOtpChange(e, index)}
//                     onKeyDown={(e) => handleBackspace(e, index)}
//                     ref={(el) => (inputRefs.current[index] = el)}
//                     className="w-14 h-14 text-2xl text-center rounded-lg border-2 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                   />
//                 ))}
//               </div>
//               <motion.button
//                 type="submit"
//                 className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-300"
//                 whileHover={{ scale: 1.02 }}
//                 whileTap={{ scale: 0.98 }}
//               >
//                 Verify OTP
//               </motion.button>
//             </form>
//             <div className="mt-4 text-center text-sm text-gray-500">
//               {canResend ? (
//                 <button
//                   onClick={handleResendOtp}
//                   className="text-blue-600 hover:underline font-medium"
//                 >
//                   Resend OTP
//                 </button>
//               ) : (
//                 <p>Resend OTP in {timer}s</p>
//               )}
//             </div>
//           </motion.div>
//         </motion.div>
//       )}

//       {/* Role Selection Modal */}
//       {showRoleModal && (
//         <motion.div
//           className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-20"
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//         >
//           <motion.div
//             className="bg-white w-full max-w-md p-8 rounded-3xl shadow-2xl"
//             initial={{ scale: 0.9, opacity: 0 }}
//             animate={{ scale: 1, opacity: 1 }}
//             transition={{ type: "spring", stiffness: 300 }}
//           >
//             <div className="text-center mb-8">
//               <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
//                 <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
//                 </svg>
//               </div>
//               <h3 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Role</h3>
//               <p className="text-gray-600">You have admin privileges. Select how you'd like to proceed.</p>
//             </div>

//             <div className="space-y-4">
//               <motion.button
//                 onClick={() => handleRoleSelection("Admin")}
//                 className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white py-4 rounded-xl font-semibold text-lg hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-3"
//                 whileHover={{ scale: 1.02, y: -2 }}
//                 whileTap={{ scale: 0.98 }}
//               >
//                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
//                 </svg>
//                 <span>Continue as Admin</span>
//               </motion.button>

//               <motion.button
//                 onClick={() => handleRoleSelection("User")}
//                 className="w-full bg-gradient-to-r from-gray-600 to-gray-500 text-white py-4 rounded-xl font-semibold text-lg hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-3"
//                 whileHover={{ scale: 1.02, y: -2 }}
//                 whileTap={{ scale: 0.98 }}
//               >
//                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
//                 </svg>
//                 <span>Continue as User</span>
//               </motion.button>
//             </div>

//             <div className="mt-6 text-center">
//               <p className="text-sm text-gray-500">
//                 Admin access provides full system control while User access offers standard features.
//               </p>
//             </div>
//           </motion.div>
//         </motion.div>
//       )}
//     </div>
//   );
// }
















// import React, { useState, useRef, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import PhoneInput from "react-phone-input-2";
// import "react-phone-input-2/lib/style.css";
// import Swal from "sweetalert2";
// import logo1 from "../images/New Project55.png";
// import logo2 from "../images/New Project (1).png";
// import bgImage from "../images/photo-colombo-101923.jpg";
// import { motion } from "framer-motion";
// import axios from "axios";

// export default function AuthForm() {
//   const navigate = useNavigate();
//   const [isLoginView, setIsLoginView] = useState(true);
//   const [mobile, setMobile] = useState("");
//   const [otp, setOtp] = useState(["", "", "", "", ""]);
//   const [showOtpModal, setShowOtpModal] = useState(false);
//   const [username, setUsername] = useState("");
//   const [timer, setTimer] = useState(60);
//   const [canResend, setCanResend] = useState(false);
//   const [backendotpcode, setBackendotpcode] = useState("");
//   const [userType, setUserType] = useState("");
//   const [showRoleModal, setShowRoleModal] = useState(false);

//   const [signupData, setSignupData] = useState({
//     name: "",
//     companyCode: "", // Changed from company to companyCode
//     phone: "",
//     email: "",
//     address: "",
//   });

//   const inputRefs = useRef([]);
//   const validateMobile = (mobile) => /^[0-9]{7,15}$/.test(mobile);
//   const validateOtp = (otp) => otp.join("").length === 5;

//   const toggleAuthView = () => {
//     setIsLoginView(!isLoginView);
//     setMobile("");
//     setSignupData({
//       name: "",
//       companyCode: "",
//       phone: "",
//       email: "",
//       address: "",
//     });
//   };

//   // Login
//   const handleLoginSubmit = async (e) => {
//     e.preventDefault();
//     if (!mobile.trim() || !validateMobile(mobile.replace(/[^0-9]/g, ""))) {
//       Swal.fire(
//         "Invalid Mobile Number",
//         "Please enter a valid mobile number.",
//         "error"
//       );
//       return;
//     }
//     try {
//       const response = await axios.post(
//         `https://esystems.cdl.lk/backend-test/ewharf/ValueList/login?contact=${mobile}`
//       );
//       const receivedOtp = response.data.otpcode;
//       const username = response.data.username;
//       const comid = response.data.comid;
//       const userType = response.data.usertype;
      
//       setUsername(username);
//       setUserType(userType);
//       localStorage.setItem("username_store", username);
//       localStorage.setItem("comid", comid);
//       setBackendotpcode(receivedOtp);
      
//       Swal.fire("OTP Sent!", `OTP has been sent to ${mobile}.`, "success").then(
//         () => {
//           setShowOtpModal(true);
//           setTimer(60);
//           setOtp(["", "", "", "", ""]);
//           startCountdown();
//         }
//       );
//     } catch (error) {
//       Swal.fire("Error", "Failed to send OTP. Please try again.", "error");
//       console.error("Login error:", error);
//     }
//   };

//   // Signup
//   const handleSignupSubmit = async (e) => {
//     e.preventDefault();
//     if (
//       !signupData.name.trim() ||
//       !signupData.companyCode.trim() || // Changed validation
//       !signupData.phone ||
//       !signupData.email.trim() ||
//       !signupData.address.trim()
//     ) {
//       Swal.fire("Incomplete Form", "Please fill all required fields.", "error");
//       return;
//     }
//     if (!validateMobile(signupData.phone.replace(/[^0-9]/g, ""))) {
//       Swal.fire(
//         "Invalid Phone Number",
//         "Please enter a valid phone number.",
//         "error"
//       );
//       return;
//     }
//     try {
//       const params = new URLSearchParams({
//         Emp_TelNo: signupData.phone,
//         Emp_ComId: signupData.companyCode, // Using companyCode directly
//         Emp_Name: signupData.name,
//         Emp_Rol: "E",
//         Emp_Email: signupData.email,
//         Emp_Address: signupData.address,
//       });
//       const res = await axios.post(
//         `https://esystems.cdl.lk/backend-test/ewharf/User/UserRegister?${params.toString()}`
//       );
//       Swal.fire(
//         "Request Submitted!",
//         res.data.message || "Your request has been sent to admin for approval.",
//         "success"
//       ).then(() => {
//         setIsLoginView(true);
//       });
//     } catch (error) {
//       Swal.fire(
//         "Error",
//         "Failed to submit request. Please try again.",
//         "error"
//       );
//       console.error("Signup error:", error);
//     }
//   };

//   // Handle role selection for admin-capable users
//   const handleRoleSelection = (role) => {
//     localStorage.setItem("role_store", role);
    
//     if (role === "Admin") {
//       navigate("/admin");
//     } else {
//       navigate("/home");
//     }
//     setShowOtpModal(false);
//     setShowRoleModal(false);
//   };

//   const handleOtpSubmit = (e) => {
//     e.preventDefault();
//     const enteredOtp = otp.join("");
//     if (!validateOtp(otp)) {
//       Swal.fire("Invalid OTP", "Please enter a valid 5-digit OTP.", "error");
//       return;
//     }
//     if (enteredOtp !== backendotpcode.toString()) {
//       Swal.fire(
//         "Incorrect OTP",
//         "The OTP you entered does not match.",
//         "error"
//       );
//       return;
//     }

//     // Successful OTP verification
//     if (userType === "A") {
//       // Admin-capable user - show role selection modal
//       setShowOtpModal(false);
//       setShowRoleModal(true);
//     } else {
//       // Regular user - proceed to home
//       Swal.fire({
//         title: "Login Successful",
//         text: "You have been successfully logged in!",
//         icon: "success",
//         timer: 2000,
//         showConfirmButton: false,
//       }).then(() => {
//         setShowOtpModal(false);
//         navigate("/home");
//       });
//     }
//   };

//   const handleResendOtp = () => {
//     Swal.fire(
//       "OTP Resent!",
//       `A new OTP has been sent to ${mobile}.`,
//       "info"
//     ).then(() => {
//       setOtp(["", "", "", "", ""]);
//       setTimer(60);
//       setCanResend(false);
//       startCountdown();
//     });
//   };

//   const startCountdown = () => {
//     const countdown = setInterval(() => {
//       setTimer((prev) => {
//         if (prev === 1) {
//           clearInterval(countdown);
//           setCanResend(true);
//           return 0;
//         }
//         return prev - 1;
//       });
//     }, 1000);
//   };

//   const handleOtpChange = (e, index) => {
//     const value = e.target.value.replace(/[^0-9]/g, "");
//     if (value.length > 0) {
//       otp[index] = value;
//       setOtp([...otp]);
//       if (index < 4 && value.length === 1) {
//         inputRefs.current[index + 1].focus();
//       }
//     }
//   };

//   const handleBackspace = (e, index) => {
//     if (e.key === "Backspace" && otp[index] === "" && index > 0) {
//       inputRefs.current[index - 1].focus();
//     }
//   };

//   const handleSignupChange = (e) => {
//     const { name, value } = e.target;
//     setSignupData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   return (
//     <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-r from-blue-500 to-purple-600">
//       {/* Left Side */}
//       <motion.div
//         className="md:w-5/5 w-full min-h-screen relative p-10 flex flex-col justify-center items-center text-white text-center"
//         style={{
//           backgroundImage: `url(${bgImage})`,
//           backgroundSize: "cover",
//           backgroundPosition: "center",
//         }}
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         transition={{ duration: 1 }}
//       >
//         <img src={logo2} alt="Company" className="w-48 md:w-72 mb-8" />
//         <motion.div
//           className="bg-black bg-opacity-50 p-6 rounded-xl"
//           initial={{ y: 20, opacity: 0 }}
//           animate={{ y: 0, opacity: 1 }}
//           transition={{ delay: 0.3 }}
//         >
//           <h2 className="text-3xl font-bold mb-4">
//             {isLoginView ? "Welcome Back!" : "Join Us Today!"}
//           </h2>
//           <p className="text-lg">
//             {isLoginView
//               ? "Enter your credentials to access your account."
//               : "Create an account to get started with our services."}
//           </p>
//         </motion.div>
//       </motion.div>

//       {/* Right Side */}
//       <motion.div
//         className="md:w-3/5 w-full bg-white flex flex-col justify-center items-center px-8 py-14 relative"
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         transition={{ duration: 1, delay: 0.2 }}
//       >
//         <motion.div
//           className="relative w-full max-w-lg bg-white p-12 rounded-3xl shadow-xl"
//           whileHover={{ scale: 1.02 }}
//           transition={{ type: "spring", stiffness: 300 }}
//         >
//           <div className="flex justify-center mb-6">
//             <img src={logo1} alt="CDPLC" className="w-40 h-40" />
//           </div>

//           {/* Toggle Buttons */}
//           <div className="flex justify-center mb-8">
//             <div className="bg-gray-100 p-1 rounded-full inline-flex">
//               <button
//                 onClick={() => setIsLoginView(true)}
//                 className={`px-6 py-2 rounded-full font-medium transition-all ${
//                   isLoginView
//                     ? "bg-blue-600 text-white shadow-md"
//                     : "text-gray-600 hover:text-gray-800"
//                 }`}
//               >
//                 Login
//               </button>
//               <button
//                 onClick={() => setIsLoginView(false)}
//                 className={`px-6 py-2 rounded-full font-medium transition-all ${
//                   !isLoginView
//                     ? "bg-blue-600 text-white shadow-md"
//                     : "text-gray-600 hover:text-gray-800"
//                 }`}
//               >
//                 Sign Up
//               </button>
//             </div>
//           </div>

//           {isLoginView ? (
//             // Login Form
//             <>
//               <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-4">
//                 Login to Your Account
//               </h2>
//               <p className="text-gray-500 text-center mb-8 text-lg">
//                 Enter your phone number to receive OTP
//               </p>
//               <form className="space-y-6" onSubmit={handleLoginSubmit}>
//                 <PhoneInput
//                   country={"lk"}
//                   value={mobile}
//                   onChange={setMobile}
//                   inputClass="!w-full !py-4 !rounded-xl !bg-gray-100 !border !border-gray-300 focus:!outline-none focus:!ring-2 focus:!ring-blue-600 !text-gray-700 text-lg"
//                   onlyCountries={[
//                     "us",
//                     "gb",
//                     "in",
//                     "lk",
//                     "au",
//                     "ca",
//                     "de",
//                     "fr",
//                     "cn",
//                     "jp",
//                     "br",
//                   ]}
//                   international
//                 />
//                 <motion.button
//                   type="submit"
//                   className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white py-4 rounded-xl font-semibold text-lg hover:shadow-lg"
//                   whileHover={{ scale: 1.02 }}
//                   whileTap={{ scale: 0.98 }}
//                 >
//                   Send OTP
//                 </motion.button>
//               </form>
//             </>
//           ) : (
//             // Signup Form
//             <>
//               <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-4">
//                 Create New Account
//               </h2>
//               <p className="text-gray-500 text-center mb-8 text-lg">
//                 Fill in your details to register
//               </p>
//               <form className="space-y-6" onSubmit={handleSignupSubmit}>
//                 <div className="space-y-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Full Name
//                     </label>
//                     <input
//                       type="text"
//                       name="name"
//                       value={signupData.name}
//                       onChange={handleSignupChange}
//                       className="w-full px-4 py-3 rounded-xl bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-700 text-lg"
//                       placeholder="Enter your full name"
//                       required
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Company Code
//                     </label>
//                     <input
//                       type="text"
//                       name="companyCode"
//                       value={signupData.companyCode}
//                       onChange={handleSignupChange}
//                       className="w-full px-4 py-3 rounded-xl bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-700 text-lg"
//                       placeholder="Enter your company code"
//                       required
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Phone Number
//                     </label>
//                     <PhoneInput
//                       country={"lk"}
//                       value={signupData.phone}
//                       onChange={(phone) =>
//                         setSignupData({ ...signupData, phone })
//                       }
//                       inputClass="!w-full !py-3 !rounded-xl !bg-gray-100 !border !border-gray-300 focus:!outline-none focus:!ring-2 focus:!ring-blue-600 !text-gray-700 text-lg"
//                       onlyCountries={[
//                         "us",
//                         "gb",
//                         "in",
//                         "lk",
//                         "au",
//                         "ca",
//                         "de",
//                         "fr",
//                         "cn",
//                         "jp",
//                         "br",
//                       ]}
//                       international
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Email
//                     </label>
//                     <input
//                       type="email"
//                       name="email"
//                       value={signupData.email}
//                       onChange={handleSignupChange}
//                       className="w-full px-4 py-3 rounded-xl bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-700 text-lg"
//                       placeholder="Enter your email"
//                       required
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Address
//                     </label>
//                     <input
//                       type="text"
//                       name="address"
//                       value={signupData.address}
//                       onChange={handleSignupChange}
//                       className="w-full px-4 py-3 rounded-xl bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-700 text-lg"
//                       placeholder="Enter your address"
//                       required
//                     />
//                   </div>
//                 </div>

//                 <motion.button
//                   type="submit"
//                   className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white py-4 rounded-xl font-semibold text-lg hover:shadow-lg"
//                   whileHover={{ scale: 1.02 }}
//                   whileTap={{ scale: 0.98 }}
//                 >
//                   Submit Request
//                 </motion.button>
//               </form>
//             </>
//           )}

//           <div className="mt-6 text-center">
//             <button
//               onClick={toggleAuthView}
//               className="text-blue-600 hover:text-blue-800 font-medium"
//             >
//               {isLoginView
//                 ? "Don't have an account? Sign Up"
//                 : "Already have an account? Login"}
//             </button>
//           </div>
//         </motion.div>
//       </motion.div>

//       {/* OTP Modal */}
//       {showOtpModal && (
//         <motion.div
//           className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-10"
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//         >
//           <motion.div
//             className="bg-white w-full sm:w-96 p-8 rounded-2xl shadow-xl"
//             initial={{ y: -20, opacity: 0 }}
//             animate={{ y: 0, opacity: 1 }}
//           >
//             <h3 className="text-3xl font-semibold text-center mb-6 text-gray-900">
//               Enter the 5-Digit OTP
//             </h3>
//             <p className="text-center text-gray-500 mb-6">Sent to {mobile}</p>
//             <form onSubmit={handleOtpSubmit}>
//               <div className="flex justify-center space-x-2 mb-6">
//                 {otp.map((value, index) => (
//                   <input
//                     key={index}
//                     type="text"
//                     maxLength="1"
//                     value={value}
//                     onChange={(e) => handleOtpChange(e, index)}
//                     onKeyDown={(e) => handleBackspace(e, index)}
//                     ref={(el) => (inputRefs.current[index] = el)}
//                     className="w-14 h-14 text-2xl text-center rounded-lg border-2 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                   />
//                 ))}
//               </div>
//               <motion.button
//                 type="submit"
//                 className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-300"
//                 whileHover={{ scale: 1.02 }}
//                 whileTap={{ scale: 0.98 }}
//               >
//                 Verify OTP
//               </motion.button>
//             </form>
//             <div className="mt-4 text-center text-sm text-gray-500">
//               {canResend ? (
//                 <button
//                   onClick={handleResendOtp}
//                   className="text-blue-600 hover:underline font-medium"
//                 >
//                   Resend OTP
//                 </button>
//               ) : (
//                 <p>Resend OTP in {timer}s</p>
//               )}
//             </div>
//           </motion.div>
//         </motion.div>
//       )}

//       {/* Role Selection Modal */}
//       {showRoleModal && (
//         <motion.div
//           className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-20"
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//         >
//           <motion.div
//             className="bg-white w-full max-w-md p-8 rounded-3xl shadow-2xl"
//             initial={{ scale: 0.9, opacity: 0 }}
//             animate={{ scale: 1, opacity: 1 }}
//             transition={{ type: "spring", stiffness: 300 }}
//           >
//             <div className="text-center mb-8">
//               <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
//                 <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
//                 </svg>
//               </div>
//               <h3 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Role</h3>
//               <p className="text-gray-600">You have admin privileges. Select how you'd like to proceed.</p>
//             </div>

//             <div className="space-y-4">
//               <motion.button
//                 onClick={() => handleRoleSelection("Admin")}
//                 className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white py-4 rounded-xl font-semibold text-lg hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-3"
//                 whileHover={{ scale: 1.02, y: -2 }}
//                 whileTap={{ scale: 0.98 }}
//               >
//                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
//                 </svg>
//                 <span>Continue as Admin</span>
//               </motion.button>

//               <motion.button
//                 onClick={() => handleRoleSelection("User")}
//                 className="w-full bg-gradient-to-r from-gray-600 to-gray-500 text-white py-4 rounded-xl font-semibold text-lg hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-3"
//                 whileHover={{ scale: 1.02, y: -2 }}
//                 whileTap={{ scale: 0.98 }}
//               >
//                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
//                 </svg>
//                 <span>Continue as User</span>
//               </motion.button>
//             </div>

//             <div className="mt-6 text-center">
//               <p className="text-sm text-gray-500">
//                 Admin access provides full system control while User access offers standard features.
//               </p>
//             </div>
//           </motion.div>
//         </motion.div>
//       )}
//     </div>
//   );
// }










import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import Swal from "sweetalert2";
import logo1 from "../images/New Project55.png";
import logo2 from "../images/New Project (1).png";
import bgImage from "../images/photo-colombo-101923.jpg";
import { motion } from "framer-motion";
import axios from "axios";

export default function AuthForm() {
  const navigate = useNavigate();
  const [isLoginView, setIsLoginView] = useState(true);
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", ""]);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [username, setUsername] = useState("");
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [backendotpcode, setBackendotpcode] = useState("");
  const [userType, setUserType] = useState("");
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [signupData, setSignupData] = useState({
    name: "",
    companyCode: "",
    phone: "",
    email: "",
    address: "",
  });

  const inputRefs = useRef([]);

  const toggleAuthView = () => {
    setIsLoginView(!isLoginView);
    setMobile("");
    setSignupData({
      name: "",
      companyCode: "",
      phone: "",
      email: "",
      address: "",
    });
  };

  // Login - Send OTP
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    
    // Clean the mobile number
    const cleanMobile = mobile.replace(/[^0-9]/g, "");
    
    if (!cleanMobile || cleanMobile.length < 7) {
      Swal.fire({
        title: "Invalid Mobile Number",
        text: "Please enter a valid mobile number.",
        icon: "error"
      });
      return;
    }

    setIsLoading(true);

    try {
      // Call the OTP API endpoint
      const response = await axios.post(
        `https://esystems.cdl.lk/backend-test/ewharf/ValueList/login?contact=${cleanMobile}`
      );
      
      console.log("API Response:", response.data);
      
      // If we get here, the number is registered
      if (response.data && response.data.otpcode) {
        const receivedOtp = response.data.otpcode;
        const username = response.data.username || "";
        const comid = response.data.comid || "";
        const userType = response.data.usertype || "";
        
        setUsername(username);
        setUserType(userType);
        localStorage.setItem("username_store", username);
        localStorage.setItem("comid", comid);
        setBackendotpcode(receivedOtp);
        
        Swal.fire({
          title: "Success!",
          text: `OTP has been sent to ${mobile}.`,
          icon: "success",
          timer: 2000,
          showConfirmButton: false
        });
        
        // Show OTP modal
        setShowOtpModal(true);
        setTimer(60);
        setOtp(["", "", "", "", ""]);
        startCountdown();
        
        // Focus first OTP input
        setTimeout(() => {
          if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
          }
        }, 100);
      } else {
        // If API returns success but no OTP code
        throw new Error("No OTP received from server");
      }
      
    } catch (error) {
      console.error("Login error details:", error);
      
      // Check error response
      if (error.response) {
        // Server responded with error status
        const status = error.response.status;
        const data = error.response.data;
        
        if (status === 404 || status === 400) {
          // Number not found or not registered
          Swal.fire({
            title: "Number Not Registered",
            html: `
              <div style="text-align: left;">
                <p>This mobile number <strong>${mobile}</strong> is not registered in our system.</p>
                <p style="margin-top: 10px;">Please:</p>
                <ol style="text-align: left; margin-left: 20px; margin-top: 10px;">
                  <li>Sign up first to create an account</li>
                  <li>Or contact your administrator</li>
                </ol>
              </div>
            `,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Go to Sign Up",
            cancelButtonText: "Try Again",
            allowOutsideClick: false
          }).then((result) => {
            if (result.isConfirmed) {
              setIsLoginView(false);
              // Auto-fill the phone number in signup form
              setSignupData(prev => ({ ...prev, phone: mobile }));
            }
          });
        } else if (status === 500) {
          Swal.fire({
            title: "Server Error",
            text: "Server is temporarily unavailable. Please try again later.",
            icon: "error"
          });
        } else {
          Swal.fire({
            title: "Error",
            text: data.message || "Failed to send OTP. Please try again.",
            icon: "error"
          });
        }
      } else if (error.request) {
        // Request was made but no response
        Swal.fire({
          title: "Network Error",
          text: "Please check your internet connection and try again.",
          icon: "error"
        });
      } else {
        // Other errors
        Swal.fire({
          title: "Error",
          text: error.message || "Failed to send OTP. Please try again.",
          icon: "error"
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Signup
  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    if (
      !signupData.name.trim() ||
      !signupData.companyCode.trim() ||
      !signupData.phone ||
      !signupData.email.trim() ||
      !signupData.address.trim()
    ) {
      Swal.fire("Incomplete Form", "Please fill all required fields.", "error");
      return;
    }
    
    const cleanPhone = signupData.phone.replace(/[^0-9]/g, "");
    
    if (cleanPhone.length < 7) {
      Swal.fire(
        "Invalid Phone Number",
        "Please enter a valid phone number.",
        "error"
      );
      return;
    }

    setIsLoading(true);

    try {
      const params = new URLSearchParams({
        Emp_TelNo: cleanPhone,
        Emp_ComId: signupData.companyCode,
        Emp_Name: signupData.name,
        Emp_Rol: "E",
        Emp_Email: signupData.email,
        Emp_Address: signupData.address,
      });
      
      const res = await axios.post(
        `https://esystems.cdl.lk/backend-test/ewharf/User/UserRegister?${params.toString()}`
      );
      
      Swal.fire({
        title: "Success!",
        text: res.data.message || "Your request has been sent to admin for approval.",
        icon: "success",
        showConfirmButton: true
      }).then(() => {
        setIsLoginView(true);
        // Clear signup form
        setSignupData({
          name: "",
          companyCode: "",
          phone: "",
          email: "",
          address: "",
        });
      });
      
    } catch (error) {
      console.error("Signup error:", error);
      
      let errorMessage = "Failed to submit request. Please try again.";
      
      if (error.response) {
        const data = error.response.data;
        if (data && data.message) {
          errorMessage = data.message;
        }
        
        // Check if number already exists
        if (error.response.status === 400 && 
            (errorMessage.includes("already") || errorMessage.includes("exists"))) {
          Swal.fire({
            title: "Already Registered",
            html: `
              <div style="text-align: left;">
                <p>This phone number <strong>${signupData.phone}</strong> is already registered.</p>
                <p style="margin-top: 10px;">Please:</p>
                <ol style="text-align: left; margin-left: 20px; margin-top: 10px;">
                  <li>Try logging in instead</li>
                  <li>Or use a different phone number</li>
                </ol>
              </div>
            `,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Go to Login",
            cancelButtonText: "Try Different Number"
          }).then((result) => {
            if (result.isConfirmed) {
              setIsLoginView(true);
              setMobile(signupData.phone);
            }
          });
          return;
        }
      }
      
      Swal.fire("Error", errorMessage, "error");
      
    } finally {
      setIsLoading(false);
    }
  };

  // Handle role selection for admin-capable users
  const handleRoleSelection = (role) => {
    localStorage.setItem("role_store", role);
    
    if (role === "Admin") {
      navigate("/admin");
    } else {
      navigate("/home");
    }
    setShowOtpModal(false);
    setShowRoleModal(false);
  };

  // OTP Verification
  const handleOtpSubmit = (e) => {
    e.preventDefault();
    const enteredOtp = otp.join("");
    
    if (enteredOtp.length !== 5) {
      Swal.fire("Invalid OTP", "Please enter a valid 5-digit OTP.", "error");
      return;
    }
    
    if (enteredOtp !== backendotpcode.toString()) {
      Swal.fire("Incorrect OTP", "The OTP you entered does not match.", "error");
      return;
    }

    // Successful OTP verification
    if (userType === "A") {
      // Admin-capable user - show role selection modal
      setShowOtpModal(false);
      setShowRoleModal(true);
    } else {
      // Regular user - proceed to home
      Swal.fire({
        title: "Login Successful!",
        text: "Welcome to the system.",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      }).then(() => {
        setShowOtpModal(false);
        navigate("/home");
      });
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    const cleanMobile = mobile.replace(/[^0-9]/g, "");
    
    if (!cleanMobile) {
      Swal.fire("Error", "Mobile number not found.", "error");
      return;
    }

    try {
      const response = await axios.post(
        `https://esystems.cdl.lk/backend-test/ewharf/ValueList/login?contact=${cleanMobile}`
      );
      
      if (response.data && response.data.otpcode) {
        setBackendotpcode(response.data.otpcode);
        
        Swal.fire({
          title: "OTP Resent!",
          text: `A new OTP has been sent to ${mobile}.`,
          icon: "info",
          timer: 1500,
          showConfirmButton: false
        }).then(() => {
          setOtp(["", "", "", "", ""]);
          setTimer(60);
          setCanResend(false);
          startCountdown();
          
          // Focus first OTP input
          setTimeout(() => {
            if (inputRefs.current[0]) {
              inputRefs.current[0].focus();
            }
          }, 100);
        });
      }
    } catch (error) {
      if (error.response && (error.response.status === 404 || error.response.status === 400)) {
        Swal.fire({
          title: "Registration Issue",
          text: "Cannot resend OTP. Your number may no longer be registered.",
          icon: "error"
        }).then(() => {
          setShowOtpModal(false);
        });
      } else {
        Swal.fire("Error", "Failed to resend OTP. Please try again.", "error");
      }
    }
  };

  // Start countdown timer
  const startCountdown = () => {
    const countdown = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(countdown);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Handle OTP input change
  const handleOtpChange = (e, index) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    
    if (value.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      
      // Auto-focus next input
      if (value.length === 1 && index < 4) {
        setTimeout(() => {
          if (inputRefs.current[index + 1]) {
            inputRefs.current[index + 1].focus();
          }
        }, 10);
      }
    }
  };

  // Handle backspace in OTP inputs
  const handleBackspace = (e, index) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      setTimeout(() => {
        if (inputRefs.current[index - 1]) {
          inputRefs.current[index - 1].focus();
        }
      }, 10);
    }
  };

  // Handle signup form changes
  const handleSignupChange = (e) => {
    const { name, value } = e.target;
    setSignupData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Auto-focus first OTP input when modal opens
  useEffect(() => {
    if (showOtpModal && inputRefs.current[0]) {
      setTimeout(() => {
        inputRefs.current[0].focus();
      }, 300);
    }
  }, [showOtpModal]);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-r from-blue-500 to-purple-600">
      {/* Left Side - Image Background */}
      <motion.div
        className="md:w-5/5 w-full min-h-screen relative p-10 flex flex-col justify-center items-center text-white text-center"
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <img src={logo2} alt="Company" className="w-48 md:w-72 mb-8" />
        <motion.div
          className="bg-black bg-opacity-50 p-6 rounded-xl"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-3xl font-bold mb-4">
            {isLoginView ? "Welcome Back!" : "Join Us Today!"}
          </h2>
          <p className="text-lg">
            {isLoginView
              ? "Enter your credentials to access your account."
              : "Create an account to get started with our services."}
          </p>
        </motion.div>
      </motion.div>

      {/* Right Side - Form */}
      <motion.div
        className="md:w-3/5 w-full bg-white flex flex-col justify-center items-center px-8 py-14 relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.2 }}
      >
        <motion.div
          className="relative w-full max-w-lg bg-white p-12 rounded-3xl shadow-xl"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="flex justify-center mb-6">
            <img src={logo1} alt="CDPLC" className="w-40 h-40" />
          </div>

          {/* Toggle Buttons */}
          <div className="flex justify-center mb-8">
            <div className="bg-gray-100 p-1 rounded-full inline-flex">
              <button
                onClick={() => setIsLoginView(true)}
                className={`px-6 py-2 rounded-full font-medium transition-all ${
                  isLoginView
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                Login
              </button>
              <button
                onClick={() => setIsLoginView(false)}
                className={`px-6 py-2 rounded-full font-medium transition-all ${
                  !isLoginView
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                Sign Up
              </button>
            </div>
          </div>

          {isLoginView ? (
            // Login Form
            <>
              <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-4">
                Login to Your Account
              </h2>
              <p className="text-gray-500 text-center mb-8 text-lg">
                Enter your phone number to receive OTP
              </p>
              <form className="space-y-6" onSubmit={handleLoginSubmit}>
                <PhoneInput
                  country={"lk"}
                  value={mobile}
                  onChange={setMobile}
                  inputClass="!w-full !py-4 !rounded-xl !bg-gray-100 !border !border-gray-300 focus:!outline-none focus:!ring-2 focus:!ring-blue-600 !text-gray-700 text-lg"
                  onlyCountries={["lk"]}
                  international
                  disabled={isLoading}
                />
                <motion.button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white py-4 rounded-xl font-semibold text-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                  whileHover={{ scale: isLoading ? 1 : 1.02 }}
                  whileTap={{ scale: isLoading ? 1 : 0.98 }}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </div>
                  ) : (
                    "Send OTP"
                  )}
                </motion.button>
              </form>
            </>
          ) : (
            // Signup Form
            <>
              <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-4">
                Create New Account
              </h2>
              <p className="text-gray-500 text-center mb-8 text-lg">
                Fill in your details to register
              </p>
              <form className="space-y-6" onSubmit={handleSignupSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={signupData.name}
                      onChange={handleSignupChange}
                      className="w-full px-4 py-3 rounded-xl bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-700 text-lg"
                      placeholder="Enter your full name"
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company Code *
                    </label>
                    <input
                      type="text"
                      name="companyCode"
                      value={signupData.companyCode}
                      onChange={handleSignupChange}
                      className="w-full px-4 py-3 rounded-xl bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-700 text-lg"
                      placeholder="Enter your company code"
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <PhoneInput
                      country={"lk"}
                      value={signupData.phone}
                      onChange={(phone) =>
                        setSignupData({ ...signupData, phone })
                      }
                      inputClass="!w-full !py-3 !rounded-xl !bg-gray-100 !border !border-gray-300 focus:!outline-none focus:!ring-2 focus:!ring-blue-600 !text-gray-700 text-lg"
                      onlyCountries={["lk"]}
                      international
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={signupData.email}
                      onChange={handleSignupChange}
                      className="w-full px-4 py-3 rounded-xl bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-700 text-lg"
                      placeholder="Enter your email"
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address *
                    </label>
                    <textarea
                      name="address"
                      value={signupData.address}
                      onChange={handleSignupChange}
                      className="w-full px-4 py-3 rounded-xl bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-700 text-lg"
                      placeholder="Enter your address"
                      rows="3"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <motion.button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white py-4 rounded-xl font-semibold text-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                  whileHover={{ scale: isLoading ? 1 : 1.02 }}
                  whileTap={{ scale: isLoading ? 1 : 0.98 }}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </div>
                  ) : (
                    "Submit Request"
                  )}
                </motion.button>
              </form>
            </>
          )}

          <div className="mt-6 text-center">
            <button
              onClick={toggleAuthView}
              className="text-blue-600 hover:text-blue-800 font-medium disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoginView
                ? "Don't have an account? Sign Up"
                : "Already have an account? Login"}
            </button>
          </div>
        </motion.div>
      </motion.div>

      {/* OTP Modal */}
      {showOtpModal && (
        <motion.div
          className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="bg-white w-full sm:w-96 p-8 rounded-2xl shadow-xl"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <h3 className="text-3xl font-semibold text-center mb-6 text-gray-900">
              Enter the 5-Digit OTP
            </h3>
            <p className="text-center text-gray-500 mb-6">Sent to {mobile}</p>
            
            <form onSubmit={handleOtpSubmit}>
              <div className="flex justify-center space-x-2 mb-6">
                {[0, 1, 2, 3, 4].map((index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength="1"
                    value={otp[index]}
                    onChange={(e) => handleOtpChange(e, index)}
                    onKeyDown={(e) => handleBackspace(e, index)}
                    ref={(el) => (inputRefs.current[index] = el)}
                    className="w-14 h-14 text-2xl text-center rounded-lg border-2 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                ))}
              </div>
              
              <motion.button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-300 mb-4"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Verify OTP
              </motion.button>
            </form>
            
            <div className="mt-4 text-center text-sm text-gray-500">
              {canResend ? (
                <button
                  onClick={handleResendOtp}
                  className="text-blue-600 hover:underline font-medium"
                >
                  Resend OTP
                </button>
              ) : (
                <p>Resend OTP in {timer}s</p>
              )}
            </div>
            
            <div className="mt-4 text-center">
              <button
                onClick={() => {
                  setShowOtpModal(false);
                  setOtp(["", "", "", "", ""]);
                }}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                Back to login
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Role Selection Modal */}
      {showRoleModal && (
        <motion.div
          className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="bg-white w-full max-w-md p-8 rounded-3xl shadow-2xl"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Role</h3>
              <p className="text-gray-600">You have admin privileges. Select how you'd like to proceed.</p>
            </div>

            <div className="space-y-4">
              <motion.button
                onClick={() => handleRoleSelection("Admin")}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white py-4 rounded-xl font-semibold text-lg hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-3"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Continue as Admin</span>
              </motion.button>

              <motion.button
                onClick={() => handleRoleSelection("User")}
                className="w-full bg-gradient-to-r from-gray-600 to-gray-500 text-white py-4 rounded-xl font-semibold text-lg hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-3"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>Continue as User</span>
              </motion.button>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                Admin access provides full system control while User access offers standard features.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
  }





































// import React, { useState, useRef, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import PhoneInput from "react-phone-input-2";
// import "react-phone-input-2/lib/style.css";
// import Swal from "sweetalert2";
// import logo1 from "../images/New Project55.png";
// import logo2 from "../images/New Project (1).png";
// import bgImage from "../images/photo-colombo-101923.jpg";
// import { motion } from "framer-motion";
// import axios from "axios";

// export default function AuthForm() {
//   const navigate = useNavigate();
//   const [isLoginView, setIsLoginView] = useState(true);
//   const [mobile, setMobile] = useState("");
//   const [otp, setOtp] = useState(["", "", "", "", ""]);
//   const [showOtpModal, setShowOtpModal] = useState(false);
//   const [username, setUsername] = useState("");
//   const [timer, setTimer] = useState(60);
//   const [canResend, setCanResend] = useState(false);
//   const [backendotpcode, setBackendotpcode] = useState("");
//   const [companies, setCompanies] = useState([]);
//   const [companiesLoading, setCompaniesLoading] = useState(false); // <-- add this
//   const [companiesLoaded, setCompaniesLoaded] = useState(false);

//   const [signupData, setSignupData] = useState({
//     name: "",
//     company: "",
//     phone: "",
//     email: "",
//     address: "",
//   });

//   const inputRefs = useRef([]);
//   const validateMobile = (mobile) => /^[0-9]{7,15}$/.test(mobile);
//   const validateOtp = (otp) => otp.join("").length === 5;

//   // Load company list from API
//   // useEffect(() => {
//   //   axios.get("https://esystems.cdl.lk/backend-test/ewharf/User/Companydetails")
//   //     .then((res) => {
//   //       console.log("Company API response:", res.data);
//   //       const companyList = Array.isArray(res.data)
//   //         ? res.data
//   //         : Array.isArray(res.data.data)
//   //         ? res.data.data
//   //         : [];
//   //       setCompanies(companyList);
//   //     })
//   //     .catch((err) => {
//   //       console.error("Error loading companies:", err);
//   //       Swal.fire("Error", "Failed to load company list.", "error");
//   //     });
//   // }, []);

//   // Function to fetch companies only when dropdown clicked



  
//   const fetchCompanies = async () => {
//   if (companiesLoaded || companiesLoading) return;
//   setCompaniesLoading(true);
//   try {
//     const response = await axios.get("https://esystems.cdl.lk/backend-test/ewharf/User/Companydetails");
//     if (response.data && response.data.ResultSet) {
//       setCompanies(response.data.ResultSet);
//       setCompaniesLoaded(true);
//     }
//   } catch (error) {
//     console.error("Error fetching companies:", error);
//   } finally {
//     setCompaniesLoading(false);
//   }
// };

//   const toggleAuthView = () => {
//     setIsLoginView(!isLoginView);
//     setMobile("");
//     setSignupData({
//       name: "",
//       company: "",
//       phone: "",
//       email: "",
//       address: "",
//     });
//   };

//   // Login
//   const handleLoginSubmit = async (e) => {
//     e.preventDefault();
//     if (!mobile.trim() || !validateMobile(mobile.replace(/[^0-9]/g, ""))) {
//       Swal.fire(
//         "Invalid Mobile Number",
//         "Please enter a valid mobile number.",
//         "error"
//       );
//       return;
//     }
//     try {
//       const response = await axios.post(
//         `https://esystems.cdl.lk/backend-test/ewharf/ValueList/login?contact=${mobile}`
//       );
//       const receivedOtp = response.data.otpcode;
//       const username = response.data.username;
//       setUsername(username);
//       localStorage.setItem("username_store", username);
//       setBackendotpcode(receivedOtp);
//       Swal.fire("OTP Sent!", `OTP has been sent to ${mobile}.`, "success").then(
//         () => {
//           setShowOtpModal(true);
//           setTimer(60);
//           setOtp(["", "", "", "", ""]);
//           startCountdown();
//         }
//       );
//     } catch (error) {
//       Swal.fire("Error", "Failed to send OTP. Please try again.", "error");
//       console.error("Login error:", error);
//     }
//   };

//   // Signup
//   const handleSignupSubmit = async (e) => {
//     e.preventDefault();
//     if (
//       !signupData.name.trim() ||
//       !signupData.company ||
//       !signupData.phone ||
//       !signupData.email.trim() ||
//       !signupData.address.trim()
//     ) {
//       Swal.fire("Incomplete Form", "Please fill all required fields.", "error");
//       return;
//     }
//     if (!validateMobile(signupData.phone.replace(/[^0-9]/g, ""))) {
//       Swal.fire(
//         "Invalid Phone Number",
//         "Please enter a valid phone number.",
//         "error"
//       );
//       return;
//     }
//     try {
//       const params = new URLSearchParams({
//         Emp_TelNo: signupData.phone,
//         Emp_ComId: signupData.company,
//         Emp_Name: signupData.name,
//         Emp_Rol: "E",
//         Emp_Email: signupData.email,
//         Emp_Address: signupData.address,
//       });
//       const res = await axios.post(
//         `https://esystems.cdl.lk/backend-test/ewharf/User/UserRegister?${params.toString()}`
//       );
//       Swal.fire(
//         "Request Submitted!",
//         res.data.message || "Your request has been sent to admin for approval.",
//         "success"
//       ).then(() => {
//         setIsLoginView(true);
//       });
//     } catch (error) {
//       Swal.fire(
//         "Error",
//         "Failed to submit request. Please try again.",
//         "error"
//       );
//       console.error("Signup error:", error);
//     }
//   };

//   const handleOtpSubmit = (e) => {
//     e.preventDefault();
//     const enteredOtp = otp.join("");
//     if (!validateOtp(otp)) {
//       Swal.fire("Invalid OTP", "Please enter a valid 5-digit OTP.", "error");
//       return;
//     }
//     if (enteredOtp !== backendotpcode.toString()) {
//       Swal.fire(
//         "Incorrect OTP",
//         "The OTP you entered does not match.",
//         "error"
//       );
//       return;
//     }
//     Swal.fire({
//       title: "Login Successful",
//       text: "You have been successfully logged in!",
//       icon: "success",
//       timer: 2000,
//       showConfirmButton: false,
//     }).then(() => {
//       navigate("/home");
//     });
//   };

//   const handleResendOtp = () => {
//     Swal.fire(
//       "OTP Resent!",
//       `A new OTP has been sent to ${mobile}.`,
//       "info"
//     ).then(() => {
//       setOtp(["", "", "", "", ""]);
//       setTimer(60);
//       setCanResend(false);
//       startCountdown();
//     });
//   };

//   const startCountdown = () => {
//     const countdown = setInterval(() => {
//       setTimer((prev) => {
//         if (prev === 1) {
//           clearInterval(countdown);
//           setCanResend(true);
//           return 0;
//         }
//         return prev - 1;
//       });
//     }, 1000);
//   };

//   const handleOtpChange = (e, index) => {
//     const value = e.target.value.replace(/[^0-9]/g, "");
//     if (value.length > 0) {
//       otp[index] = value;
//       setOtp([...otp]);
//       if (index < 4 && value.length === 1) {
//         inputRefs.current[index + 1].focus();
//       }
//     }
//   };

//   const handleBackspace = (e, index) => {
//     if (e.key === "Backspace" && otp[index] === "" && index > 0) {
//       inputRefs.current[index - 1].focus();
//     }
//   };

//   const handleSignupChange = (e) => {
//     const { name, value } = e.target;
//     setSignupData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   return (
//     <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-r from-blue-500 to-purple-600">
//       {/* Left Side */}
//       <motion.div
//         className="md:w-5/5 w-full min-h-screen relative p-10 flex flex-col justify-center items-center text-white text-center"
//         style={{
//           backgroundImage: `url(${bgImage})`,
//           backgroundSize: "cover",
//           backgroundPosition: "center",
//         }}
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         transition={{ duration: 1 }}
//       >
//         <img src={logo2} alt="Company" className="w-48 md:w-72 mb-8" />
//         <motion.div
//           className="bg-black bg-opacity-50 p-6 rounded-xl"
//           initial={{ y: 20, opacity: 0 }}
//           animate={{ y: 0, opacity: 1 }}
//           transition={{ delay: 0.3 }}
//         >
//           <h2 className="text-3xl font-bold mb-4">
//             {isLoginView ? "Welcome Back!" : "Join Us Today!"}
//           </h2>
//           <p className="text-lg">
//             {isLoginView
//               ? "Enter your credentials to access your account."
//               : "Create an account to get started with our services."}
//           </p>
//         </motion.div>
//       </motion.div>

//       {/* Right Side */}
//       <motion.div
//         className="md:w-3/5 w-full bg-white flex flex-col justify-center items-center px-8 py-14 relative"
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         transition={{ duration: 1, delay: 0.2 }}
//       >
//         <motion.div
//           className="relative w-full max-w-lg bg-white p-12 rounded-3xl shadow-xl"
//           whileHover={{ scale: 1.02 }}
//           transition={{ type: "spring", stiffness: 300 }}
//         >
//           <div className="flex justify-center mb-6">
//             <img src={logo1} alt="CDPLC" className="w-40 h-40" />
//           </div>

//           {/* Toggle Buttons */}
//           <div className="flex justify-center mb-8">
//             <div className="bg-gray-100 p-1 rounded-full inline-flex">
//               <button
//                 onClick={() => setIsLoginView(true)}
//                 className={`px-6 py-2 rounded-full font-medium transition-all ${
//                   isLoginView
//                     ? "bg-blue-600 text-white shadow-md"
//                     : "text-gray-600 hover:text-gray-800"
//                 }`}
//               >
//                 Login
//               </button>
//               <button
//                 onClick={() => setIsLoginView(false)}
//                 className={`px-6 py-2 rounded-full font-medium transition-all ${
//                   !isLoginView
//                     ? "bg-blue-600 text-white shadow-md"
//                     : "text-gray-600 hover:text-gray-800"
//                 }`}
//               >
//                 Sign Up
//               </button>
//             </div>
//           </div>

//           {isLoginView ? (
//             // Login Form
//             <>
//               <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-4">
//                 Login to Your Account
//               </h2>
//               <p className="text-gray-500 text-center mb-8 text-lg">
//                 Enter your phone number to receive OTP
//               </p>
//               <form className="space-y-6" onSubmit={handleLoginSubmit}>
//                 <PhoneInput
//                   country={"lk"}
//                   value={mobile}
//                   onChange={setMobile}
//                   inputClass="!w-full !py-4 !rounded-xl !bg-gray-100 !border !border-gray-300 focus:!outline-none focus:!ring-2 focus:!ring-blue-600 !text-gray-700 text-lg"
//                   onlyCountries={[
//                     "us",
//                     "gb",
//                     "in",
//                     "lk",
//                     "au",
//                     "ca",
//                     "de",
//                     "fr",
//                     "cn",
//                     "jp",
//                     "br",
//                   ]}
//                   international
//                 />
//                 <motion.button
//                   type="submit"
//                   className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white py-4 rounded-xl font-semibold text-lg hover:shadow-lg"
//                   whileHover={{ scale: 1.02 }}
//                   whileTap={{ scale: 0.98 }}
//                 >
//                   Send OTP
//                 </motion.button>
//               </form>
//             </>
//           ) : (
//             // Signup Form
//             <>
//               <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-4">
//                 Create New Account
//               </h2>
//               <p className="text-gray-500 text-center mb-8 text-lg">
//                 Fill in your details to register
//               </p>
//               <form className="space-y-6" onSubmit={handleSignupSubmit}>
//                 <div className="space-y-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Full Name
//                     </label>
//                     <input
//                       type="text"
//                       name="name"
//                       value={signupData.name}
//                       onChange={handleSignupChange}
//                       className="w-full px-4 py-3 rounded-xl bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-700 text-lg"
//                       placeholder="Enter your full name"
//                       required
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Company
//                     </label>
//                     <select
//                       name="company"
//                       value={signupData.company}
//                       onChange={handleSignupChange}
//                       onFocus={fetchCompanies} // lazy load when focused
//                       className="w-full px-4 py-3 rounded-xl bg-gray-100 border border-gray-300 
//             focus:outline-none focus:ring-2 focus:ring-blue-600 
//             text-gray-700 text-lg"
//                       required
//                     >
//                       <option value="" disabled>
//                         {companiesLoading
//                           ? "Loading companies..."
//                           : "Select your company"}
//                       </option>

//                       {companies.map((c) => (
//                         <option key={c.Com_ID} value={c.Com_ID}>
//                           {c.Com_Name}
//                         </option>
//                       ))}
//                     </select>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Phone Number
//                     </label>
//                     <PhoneInput
//                       country={"lk"}
//                       value={signupData.phone}
//                       onChange={(phone) =>
//                         setSignupData({ ...signupData, phone })
//                       }
//                       inputClass="!w-full !py-3 !rounded-xl !bg-gray-100 !border !border-gray-300 focus:!outline-none focus:!ring-2 focus:!ring-blue-600 !text-gray-700 text-lg"
//                       onlyCountries={[
//                         "us",
//                         "gb",
//                         "in",
//                         "lk",
//                         "au",
//                         "ca",
//                         "de",
//                         "fr",
//                         "cn",
//                         "jp",
//                         "br",
//                       ]}
//                       international
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Email
//                     </label>
//                     <input
//                       type="email"
//                       name="email"
//                       value={signupData.email}
//                       onChange={handleSignupChange}
//                       className="w-full px-4 py-3 rounded-xl bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-700 text-lg"
//                       placeholder="Enter your email"
//                       required
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Address
//                     </label>
//                     <input
//                       type="text"
//                       name="address"
//                       value={signupData.address}
//                       onChange={handleSignupChange}
//                       className="w-full px-4 py-3 rounded-xl bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-700 text-lg"
//                       placeholder="Enter your address"
//                       required
//                     />
//                   </div>
//                 </div>

//                 <motion.button
//                   type="submit"
//                   className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white py-4 rounded-xl font-semibold text-lg hover:shadow-lg"
//                   whileHover={{ scale: 1.02 }}
//                   whileTap={{ scale: 0.98 }}
//                 >
//                   Submit Request
//                 </motion.button>
//               </form>
//             </>
//           )}

//           <div className="mt-6 text-center">
//             <button
//               onClick={toggleAuthView}
//               className="text-blue-600 hover:text-blue-800 font-medium"
//             >
//               {isLoginView
//                 ? "Don't have an account? Sign Up"
//                 : "Already have an account? Login"}
//             </button>
//           </div>
//         </motion.div>
//       </motion.div>

//       {/* OTP Modal */}
//       {showOtpModal && (
//         <motion.div
//           className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-10"
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//         >
//           <motion.div
//             className="bg-white w-full sm:w-96 p-8 rounded-2xl shadow-xl"
//             initial={{ y: -20, opacity: 0 }}
//             animate={{ y: 0, opacity: 1 }}
//           >
//             <h3 className="text-3xl font-semibold text-center mb-6 text-gray-900">
//               Enter the 5-Digit OTP
//             </h3>
//             <p className="text-center text-gray-500 mb-6">Sent to {mobile}</p>
//             <form onSubmit={handleOtpSubmit}>
//               <div className="flex justify-center space-x-2 mb-6">
//                 {otp.map((value, index) => (
//                   <input
//                     key={index}
//                     type="text"
//                     maxLength="1"
//                     value={value}
//                     onChange={(e) => handleOtpChange(e, index)}
//                     onKeyDown={(e) => handleBackspace(e, index)}
//                     ref={(el) => (inputRefs.current[index] = el)}
//                     className="w-14 h-14 text-2xl text-center rounded-lg border-2 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                   />
//                 ))}
//               </div>
//               <motion.button
//                 type="submit"
//                 className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-300"
//                 whileHover={{ scale: 1.02 }}
//                 whileTap={{ scale: 0.98 }}
//               >
//                 Verify OTP
//               </motion.button>
//             </form>
//             <div className="mt-4 text-center text-sm text-gray-500">
//               {canResend ? (
//                 <button
//                   onClick={handleResendOtp}
//                   className="text-blue-600 hover:underline font-medium"
//                 >
//                   Resend OTP
//                 </button>
//               ) : (
//                 <p>Resend OTP in {timer}s</p>
//               )}
//             </div>
//           </motion.div>
//         </motion.div>
//       )}
//     </div>
//   );
// }












// import React, { useState, useRef } from "react";
// import { useNavigate } from "react-router-dom";
// import PhoneInput from "react-phone-input-2";
// import "react-phone-input-2/lib/style.css";
// import Swal from "sweetalert2";
// import logo1 from "../images/New Project55.png";
// import logo2 from "../images/New Project (1).png";
// import bgImage from "../images/photo-colombo-101923.jpg";
// import { motion } from "framer-motion";
// import axios from "axios";

// export default function AuthForm() {
//   const navigate = useNavigate();
//   const [isLoginView, setIsLoginView] = useState(true);
//   const [mobile, setMobile] = useState("");
//   const [otp, setOtp] = useState(["", "", "", "", ""]);
//   const [showOtpModal, setShowOtpModal] = useState(false);
//   const [username, setUsername] = useState("");
//   const [timer, setTimer] = useState(60);
//   const [canResend, setCanResend] = useState(false);
//   const [backendotpcode, setBackendotpcode] = useState("");

//   // Signup form state
//   const [signupData, setSignupData] = useState({
//     name: "",
//     company: "",
//     phone: ""
//   });

//   const companies = [
//     "Company A",
//     "Company B",
//     "Company C",
//     "Company D",
//     "Other"
//   ];

//   const inputRefs = useRef([]);
//   const validateMobile = (mobile) => /^[0-9]{7,15}$/.test(mobile);
//   const validateOtp = (otp) => otp.join("").length === 5;

//   // Toggle between login and signup views
//   const toggleAuthView = () => {
//     setIsLoginView(!isLoginView);
//     setMobile("");
//     setSignupData({
//       name: "",
//       company: "",
//       phone: ""
//     });
//   };

//   // Handle Login Submission
//   const handleLoginSubmit = async (e) => {
//     e.preventDefault();

//     if (!mobile.trim() || !validateMobile(mobile.replace(/[^0-9]/g, ""))) {
//       Swal.fire({
//         title: "Invalid Mobile Number",
//         text: "Please enter a valid mobile number.",
//         icon: "error",
//         confirmButtonText: "Try Again",
//       });
//       return;
//     }

//     try {
//       const response = await axios.post(`https://esystems.cdl.lk/backend-test/ewharf/ValueList/login?contact=${mobile}`);
//       const receivedOtp = response.data.otpcode;
//       const username = response.data.username;

//       setUsername(username);
//       localStorage.setItem("username_store", username);
//       setBackendotpcode(receivedOtp);

//       Swal.fire({
//         title: "OTP Sent!",
//         text: `OTP has been sent to ${mobile}.`,
//         icon: "success",
//         confirmButtonText: "Enter OTP",
//       }).then(() => {
//         setShowOtpModal(true);
//         setTimer(60);
//         setOtp(["", "", "", "", ""]);
//         startCountdown();
//       });
//     } catch (error) {
//       Swal.fire({
//         title: "Error",
//         text: "Failed to send OTP. Please try again.",
//         icon: "error",
//         confirmButtonText: "Retry",
//       });
//       console.error("Login error:", error);
//     }
//   };

//   // Handle Signup Submission
//   const handleSignupSubmit = async (e) => {
//     e.preventDefault();

//     if (!signupData.name.trim() || !signupData.company || !signupData.phone) {
//       Swal.fire({
//         title: "Incomplete Form",
//         text: "Please fill all required fields.",
//         icon: "error",
//         confirmButtonText: "OK",
//       });
//       return;
//     }

//     if (!validateMobile(signupData.phone.replace(/[^0-9]/g, ""))) {
//       Swal.fire({
//         title: "Invalid Phone Number",
//         text: "Please enter a valid phone number.",
//         icon: "error",
//         confirmButtonText: "Try Again",
//       });
//       return;
//     }

//     try {
//       // Here you would typically send the signup data to your backend
//       // For demonstration, we'll simulate an API call
//       await new Promise(resolve => setTimeout(resolve, 1000));

//       Swal.fire({
//         title: "Request Submitted!",
//         text: "Your request has been sent to admin for approval.",
//         icon: "success",
//         confirmButtonText: "OK",
//       }).then(() => {
//         // Switch back to login view after successful signup
//         setIsLoginView(true);
//       });

//     } catch (error) {
//       Swal.fire({
//         title: "Error",
//         text: "Failed to submit request. Please try again.",
//         icon: "error",
//         confirmButtonText: "Retry",
//       });
//       console.error("Signup error:", error);
//     }
//   };

//   // OTP Verification
//   const handleOtpSubmit = (e) => {
//     e.preventDefault();

//     const enteredOtp = otp.join("");

//     if (!validateOtp(otp)) {
//       Swal.fire({
//         title: "Invalid OTP",
//         text: "Please enter a valid 5-digit OTP.",
//         icon: "error",
//         confirmButtonText: "Try Again",
//       });
//       return;
//     }

//     if (enteredOtp !== backendotpcode.toString()) {
//       Swal.fire({
//         title: "Incorrect OTP",
//         text: "The OTP you entered does not match.",
//         icon: "error",
//         confirmButtonText: "Retry",
//       });
//       return;
//     }

//     Swal.fire({
//       title: "Login Successful",
//       text: "You have been successfully logged in!",
//       icon: "success",
//       timer: 2000,
//       showConfirmButton: false,
//     }).then(() => {
//       navigate("/home");
//     });
//   };

//   // Resend OTP
//   const handleResendOtp = () => {
//     Swal.fire({
//       title: "OTP Resent!",
//       text: `A new OTP has been sent to ${mobile}.`,
//       icon: "info",
//       confirmButtonText: "OK",
//     }).then(() => {
//       setOtp(["", "", "", "", ""]);
//       setTimer(60);
//       setCanResend(false);
//       startCountdown();
//     });
//   };

//   // OTP Countdown Timer
//   const startCountdown = () => {
//     const countdown = setInterval(() => {
//       setTimer((prev) => {
//         if (prev === 1) {
//           clearInterval(countdown);
//           setCanResend(true);
//           return 0;
//         }
//         return prev - 1;
//       });
//     }, 1000);
//   };

//   // Handle OTP Input Changes
//   const handleOtpChange = (e, index) => {
//     const value = e.target.value.replace(/[^0-9]/g, "");
//     if (value.length > 0) {
//       otp[index] = value;
//       setOtp([...otp]);
//       if (index < 4 && value.length === 1) {
//         inputRefs.current[index + 1].focus();
//       }
//     }
//   };

//   // Handle Backspace in OTP Input
//   const handleBackspace = (e, index) => {
//     if (e.key === "Backspace" && otp[index] === "") {
//       if (index > 0) {
//         inputRefs.current[index - 1].focus();
//       }
//     }
//   };

//   // Handle signup form changes
//   const handleSignupChange = (e) => {
//     const { name, value } = e.target;
//     setSignupData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   return (
//     <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-r from-blue-500 to-purple-600">
//       {/* Left Side */}
//       <motion.div
//         className="md:w-5/5 w-full min-h-screen relative p-10 flex flex-col justify-center items-center text-white text-center"
//         style={{ backgroundImage: `url(${bgImage})`, backgroundSize: "cover", backgroundPosition: "center" }}
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         transition={{ duration: 1 }}
//       >
//         <img src={logo2} alt="Company Image" className="w-48 md:w-72 mb-8" />
//         <motion.div
//           className="bg-black bg-opacity-50 p-6 rounded-xl"
//           initial={{ y: 20, opacity: 0 }}
//           animate={{ y: 0, opacity: 1 }}
//           transition={{ delay: 0.3 }}
//         >
//           <h2 className="text-3xl font-bold mb-4">
//             {isLoginView ? "Welcome Back!" : "Join Us Today!"}
//           </h2>
//           <p className="text-lg">
//             {isLoginView
//               ? "Enter your credentials to access your account."
//               : "Create an account to get started with our services."}
//           </p>
//         </motion.div>
//       </motion.div>

//       {/* Right Side */}
//       <motion.div
//         className="md:w-3/5 w-full bg-white flex flex-col justify-center items-center px-8 py-14 relative"
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         transition={{ duration: 1, delay: 0.2 }}
//       >
//         <motion.div
//           className="relative w-full max-w-lg bg-white p-12 rounded-3xl shadow-xl"
//           whileHover={{ scale: 1.02 }}
//           transition={{ type: "spring", stiffness: 300 }}
//         >
//           <div className="flex justify-center mb-6">
//             <img src={logo1} alt="CDPLC Logo" className="w-40 h-40" />
//           </div>

//           {/* Toggle between Login and Signup */}
//           <div className="flex justify-center mb-8">
//             <div className="bg-gray-100 p-1 rounded-full inline-flex">
//               <button
//                 onClick={() => setIsLoginView(true)}
//                 className={`px-6 py-2 rounded-full font-medium transition-all ${isLoginView ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:text-gray-800'}`}
//               >
//                 Login
//               </button>
//               <button
//                 onClick={() => setIsLoginView(false)}
//                 className={`px-6 py-2 rounded-full font-medium transition-all ${!isLoginView ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:text-gray-800'}`}
//               >
//                 Sign Up
//               </button>
//             </div>
//           </div>

//           {isLoginView ? (
//             // Login Form
//             <>
//               <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-4">Login to Your Account</h2>
//               <p className="text-gray-500 text-center mb-8 text-lg">Enter your phone number to receive OTP</p>
//               <form className="space-y-6" onSubmit={handleLoginSubmit}>
//                 <PhoneInput
//                   country={"lk"}
//                   value={mobile}
//                   onChange={setMobile}
//                   inputClass="!w-full !py-4 !rounded-xl !bg-gray-100 !border !border-gray-300 focus:!outline-none focus:!ring-2 focus:!ring-blue-600 !text-gray-700 text-lg"
//                   onlyCountries={["us", "gb", "in", "lk", "au", "ca", "de", "fr", "cn", "jp", "br"]}
//                   international
//                 />
//                 <motion.button
//                   type="submit"
//                   className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white py-4 rounded-xl font-semibold text-lg hover:shadow-lg"
//                   whileHover={{ scale: 1.02 }}
//                   whileTap={{ scale: 0.98 }}
//                 >
//                   Send OTP
//                 </motion.button>
//               </form>
//             </>
//           ) : (
//             // Signup Form
//             <>
//               <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-4">Create New Account</h2>
//               <p className="text-gray-500 text-center mb-8 text-lg">Fill in your details to register</p>
//               <form className="space-y-6" onSubmit={handleSignupSubmit}>
//                 <div className="space-y-4">
//                   <div>
//                     <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
//                     <input
//                       type="text"
//                       id="name"
//                       name="name"
//                       value={signupData.name}
//                       onChange={handleSignupChange}
//                       className="w-full px-4 py-3 rounded-xl bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-700 text-lg"
//                       placeholder="Enter your full name"
//                       required
//                     />
//                   </div>

//                   <div>
//                     <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">Company</label>
//                     <select
//                       id="company"
//                       name="company"
//                       value={signupData.company}
//                       onChange={handleSignupChange}
//                       className="w-full px-4 py-3 rounded-xl bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-700 text-lg"
//                       required
//                     >
//                       <option value="">Select your company</option>
//                       {companies.map((company, index) => (
//                         <option key={index} value={company}>{company}</option>
//                       ))}
//                     </select>
//                   </div>

//                   <div>
//                     <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
//                     <PhoneInput
//                       country={"lk"}
//                       value={signupData.phone}
//                       onChange={(phone) => setSignupData({...signupData, phone})}
//                       inputClass="!w-full !py-3 !rounded-xl !bg-gray-100 !border !border-gray-300 focus:!outline-none focus:!ring-2 focus:!ring-blue-600 !text-gray-700 text-lg"
//                       onlyCountries={["us", "gb", "in", "lk", "au", "ca", "de", "fr", "cn", "jp", "br"]}
//                       international
//                     />
//                   </div>
//                 </div>

//                 <motion.button
//                   type="submit"
//                   className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white py-4 rounded-xl font-semibold text-lg hover:shadow-lg"
//                   whileHover={{ scale: 1.02 }}
//                   whileTap={{ scale: 0.98 }}
//                 >
//                   Submit Request
//                 </motion.button>
//               </form>
//             </>
//           )}

//           <div className="mt-6 text-center">
//             <button
//               onClick={toggleAuthView}
//               className="text-blue-600 hover:text-blue-800 font-medium"
//             >
//               {isLoginView
//                 ? "Don't have an account? Sign Up"
//                 : "Already have an account? Login"}
//             </button>
//           </div>
//         </motion.div>
//       </motion.div>

//       {/* OTP Modal */}
//       {showOtpModal && (
//         <motion.div
//           className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-10"
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//         >
//           <motion.div
//             className="bg-white w-full sm:w-96 p-8 rounded-2xl shadow-xl"
//             initial={{ y: -20, opacity: 0 }}
//             animate={{ y: 0, opacity: 1 }}
//           >
//             <h3 className="text-3xl font-semibold text-center mb-6 text-gray-900">Enter the 5-Digit OTP</h3>
//             <p className="text-center text-gray-500 mb-6">Sent to {mobile}</p>

//             <form onSubmit={handleOtpSubmit}>
//               <div className="flex justify-center space-x-2 mb-6">
//                 {otp.map((value, index) => (
//                   <input
//                     key={index}
//                     type="text"
//                     maxLength="1"
//                     value={value}
//                     onChange={(e) => handleOtpChange(e, index)}
//                     onKeyDown={(e) => handleBackspace(e, index)}
//                     ref={(el) => (inputRefs.current[index] = el)}
//                     className="w-14 h-14 text-2xl text-center rounded-lg border-2 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                   />
//                 ))}
//               </div>

//               <motion.button
//                 type="submit"
//                 className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-300"
//                 whileHover={{ scale: 1.02 }}
//                 whileTap={{ scale: 0.98 }}
//               >
//                 Verify OTP
//               </motion.button>
//             </form>

//             {/* Countdown Timer and Resend OTP Button */}
//             <div className="mt-4 text-center text-sm text-gray-500">
//               {canResend ? (
//                 <button
//                   onClick={handleResendOtp}
//                   className="text-blue-600 hover:underline font-medium"
//                 >
//                   Resend OTP
//                 </button>
//               ) : (
//                 <p>Resend OTP in {timer}s</p>
//               )}
//             </div>
//           </motion.div>
//         </motion.div>
//       )}
//     </div>
//   );
// }
