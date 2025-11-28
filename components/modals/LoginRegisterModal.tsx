// // components/modals/LoginRegisterModal.tsx
// import React, { useState } from "react";
// import Modal from "../common/Modal";
// import { UserRole } from "../../types"; // Import from project root
// // We will create the API functions later in Step 2

// interface LoginRegisterModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   onSuccess: (user: any) => void; // Function to update App.tsx state on success
//   apiCalls: {
//     login: (email: string, password: string) => Promise<any>;
//     register: (
//       name: string,
//       email: string,
//       password: string,
//       role: UserRole
//     ) => Promise<any>;
//   };
// }

// const LoginRegisterModal: React.FC<LoginRegisterModalProps> = ({
//   isOpen,
//   onClose,
//   onSuccess,
//   apiCalls,
// }) => {
//   const [isLogin, setIsLogin] = useState(true);
//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [role, setRole] = useState<UserRole>(UserRole.STUDENT);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState("");

//   const resetForm = () => {
//     setName("");
//     setEmail("");
//     setPassword("");
//     setRole(UserRole.STUDENT);
//     setError("");
//     setIsLoading(false);
//   };

//   const handleFormSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError("");
//     setIsLoading(true);

//     try {
//       let user;
//       if (isLogin) {
//         user = await apiCalls.login(email, password);
//       } else {
//         user = await apiCalls.register(name, email, password, role);
//       }

//       onSuccess(user);
//       resetForm();
//       onClose();
//     } catch (err: any) {
//       // Display error message from the backend (e.g., Invalid credentials, User already exists)
//       setError(
//         err.response?.data?.message ||
//           "Authentication failed. Please try again."
//       );
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Note: The Google Login button will be fully functional in Phase 3
//   const handleGoogleLogin = () => {
//     // Redirect to the backend's Google OAuth initiation endpoint
//     // The backend will handle the OAuth flow and the final redirect to the client.
//     window.location.href = `${
//       (import.meta as any).env?.VITE_API_URL || "http://localhost:5000"
//     }/api/auth/google`;
//   };

//   return (
//     <Modal
//       isOpen={isOpen}
//       onClose={() => {
//         resetForm();
//         onClose();
//       }}
//       title={isLogin ? "Login to MessMate" : "Create New Account"}
//       size="sm"
//     >
//       <form onSubmit={handleFormSubmit} className="space-y-5">
//         {!isLogin && (
//           <div>
//             <label className="block text-sm font-medium text-gray-700">
//               Full Name
//             </label>
//             <input
//               type="text"
//               value={name}
//               onChange={(e) => setName(e.target.value)}
//               required={!isLogin}
//               className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
//             />
//           </div>
//         )}
//         <div>
//           <label className="block text-sm font-medium text-gray-700">
//             Email Address
//           </label>
//           <input
//             type="email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             required
//             className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
//           />
//         </div>
//         <div>
//           <label className="block text-sm font-medium text-gray-700">
//             Password
//           </label>
//           <input
//             type="password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             required
//             className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
//           />
//         </div>
//         {!isLogin && (
//           <div>
//             <label className="block text-sm font-medium text-gray-700">
//               I am a:
//             </label>
//             <select
//               value={role}
//               onChange={(e) => setRole(e.target.value as UserRole)}
//               className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
//             >
//               <option value={UserRole.STUDENT}>
//                 Student (Find Mess & Review)
//               </option>
//               <option value={UserRole.OWNER}>Mess Owner (Add Listing)</option>
//             </select>
//           </div>
//         )}

//         {error && <p className="text-sm text-red-600 font-medium">{error}</p>}

//         <button
//           type="submit"
//           disabled={isLoading}
//           className="w-full py-2 px-4 bg-primary text-white font-semibold rounded-md hover:bg-primary-dark transition-colors disabled:bg-gray-400"
//         >
//           {isLoading
//             ? isLogin
//               ? "Logging in..."
//               : "Registering..."
//             : isLogin
//             ? "Login"
//             : "Register"}
//         </button>
//       </form>

//       <div className="mt-4 text-center">
//         <button
//           onClick={() => {
//             setIsLogin(!isLogin);
//             resetForm();
//           }}
//           className="text-sm text-primary hover:text-primary-dark font-medium"
//           type="button"
//         >
//           {isLogin
//             ? "Need an account? Register here."
//             : "Already have an account? Login here."}
//         </button>
//       </div>

//       <div className="relative mt-6">
//         <div className="absolute inset-0 flex items-center">
//           <div className="w-full border-t border-gray-300" />
//         </div>
//         <div className="relative flex justify-center text-sm">
//           <span className="px-2 bg-white text-gray-500">Or continue with</span>
//         </div>
//       </div>

//       <button
//         onClick={handleGoogleLogin}
//         disabled={isLoading}
//         className="w-full mt-4 flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
//       >
//         <svg className="w-5 h-5 mr-2" viewBox="0 0 48 48">
//           <path
//             fill="#FFC107"
//             d="M43.611 20.083H42V20H24v8h11.309c-1.666 5.766-7.398 9.5-13.309 9.5-9.87 0-17.892-8.022-17.892-17.892s8.022-17.892 17.892-17.892c5.38 0 9.774 2.227 12.87 5.093l5.631-5.466C39.462 4.418 34.032 2 24 2 11.855 2 2 11.855 2 24s9.855 22 22 22 22-9.855 22-22c0-1.724-.221-3.41-.628-5.017z"
//           />
//           <path
//             fill="#FF3D00"
//             d="M5.145 20.083h1.776v3.917h-1.776z"
//             transform="rotate(-90 8.033 22.042)"
//           />
//           <path
//             fill="#4CAF50"
//             d="M5.145 20.083h1.776v3.917h-1.776z"
//             transform="rotate(0 8.033 26.042)"
//           />
//           <path
//             fill="#1976D2"
//             d="M5.145 20.083h1.776v3.917h-1.776z"
//             transform="rotate(90 8.033 28.042)"
//           />
//         </svg>
//         Sign in with Google
//       </button>
//     </Modal>
//   );
// };

// export default LoginRegisterModal;

// components/modals/LoginRegisterModal.tsx

// components/modals/LoginRegisterModal.tsx
import React, { useState } from "react";
import Modal from "../common/Modal";
import { UserRole } from "../../types"; // Import from project root
// We will create the API functions later in Step 2

interface LoginRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: any) => void; // Function to update App.tsx state on success
  apiCalls: {
    login: (email: string, password: string) => Promise<any>;
    register: (
      name: string,
      email: string,
      password: string,
      role: UserRole
    ) => Promise<any>;
  };
}

const API_URL = (import.meta as any).env?.VITE_API_URL || "http://localhost:5000";
const GOOGLE_LOGIN_URL = `${API_URL}/api/auth/google`;

const LoginRegisterModal: React.FC<LoginRegisterModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  apiCalls,
}) => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>(UserRole.STUDENT);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const resetForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setRole(UserRole.STUDENT);
    setError("");
    setIsLoading(false);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      let user;
      if (isLogin) {
        user = await apiCalls.login(email, password);
      } else {
        user = await apiCalls.register(name, email, password, role);
      }

      onSuccess(user);
      resetForm();
      onClose();
    } catch (err: any) {
      // Display error message from the backend (e.g., Invalid credentials, User already exists)
      setError(
        err.response?.data?.message ||
          "Authentication failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Google Login Handler: Redirects the browser to the backend's OAuth initiation endpoint.
   */
  const handleGoogleLogin = () => {
    window.location.href = GOOGLE_LOGIN_URL;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        resetForm();
        onClose();
      }}
      title={isLogin ? "Login to MessMate" : "Create New Account"}
      size="sm"
    >
      <form onSubmit={handleFormSubmit} className="space-y-5">
        {!isLogin && (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required={!isLogin}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            />
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
          />
        </div>
        {!isLogin && (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              I am a:
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            >
              <option value={UserRole.STUDENT}>
                Student (Find Mess & Review)
              </option>
              <option value={UserRole.OWNER}>Mess Owner (Add Listing)</option>
            </select>
          </div>
        )}

        {error && <p className="text-sm text-red-600 font-medium">{error}</p>}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2 px-4 bg-primary text-white font-semibold rounded-md hover:bg-primary-dark transition-colors disabled:bg-gray-400"
        >
          {isLoading
            ? isLogin
              ? "Logging in..."
              : "Registering..."
            : isLogin
            ? "Login"
            : "Register"}
        </button>
      </form>

      <div className="mt-4 text-center">
        <button
          onClick={() => {
            setIsLogin(!isLogin);
            resetForm();
          }}
          className="text-sm text-primary hover:text-primary-dark font-medium"
          type="button"
        >
          {isLogin
            ? "Need an account? Register here."
            : "Already have an account? Login here."}
        </button>
      </div>

      {/* --- Conditional Google Auth Section --- */}
      {isLogin && (
        <>
          <div className="relative mt-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                Or continue with
              </span>
            </div>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full mt-4 flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            {/* Using a standard Google Icon SVG */}
            <svg className="w-5 h-5 mr-2" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.694-5.26 7.641-10.303 7.641c-7.393 0-13.417-6.024-13.417-13.417s6.024-13.417 13.417-13.417c3.473 0 6.643 1.343 9.034 3.535l4.516-4.517C35.093 5.928 30.083 4 24 4C11.85 4 2 13.85 2 26s9.85 22 22 22s22-9.85 22-22c0-1.875-0.219-3.75-0.625-5.5Z"/>
              <path fill="#FF3D00" d="M6.307 14.891l5.448 4.226c-1.397 3.525-1.397 7.423 0 10.948L6.307 37.109C3.12 30.825 3.12 17.175 6.307 14.891Z"/>
              <path fill="#4CAF50" d="M24 44c5.166 0 9.866-1.97 13.44-5.195l-4.516-4.516c-2.422 1.66-5.462 2.673-8.924 2.673c-4.994 0-9.284-2.864-11.458-7.079l-5.448 4.226C14.134 42.03 18.834 44 24 44Z"/>
              <path fill="#1976D2" d="M43.611 20.083h-2.022c-0.27-0.742-0.548-1.467-0.9-2.164H24v-4h18.689c-0.457-1.748-1.284-3.411-2.492-4.887L36.195 4.887C33.15 2.156 28.799 0 24 0C11.85 0 2 9.85 2 22c0 1.875 0.219 3.75 0.625 5.5h4.148c-0.277-1.602-0.422-3.238-0.422-5.5s0.145-3.898 0.422-5.5Z"/>
            </svg>
            Sign in with Google
          </button>
        </>
      )}
      {/* --- End Conditional Google Auth Section --- */}
    </Modal>
  );
};

export default LoginRegisterModal;