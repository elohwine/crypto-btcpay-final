import { Routes, Route } from "react-router-dom";

// pages
import MarketScreen from "../screens/Market/MarketScreen";
import LandingPage from "../screens/Landing/LandingPage";
import SigninScreen from "../screens/Members/SigninScreen";
import SignupScreen from "../screens/Members/SignupScreen";
import ForgotScreen from "../screens/Members/ForgotScreen";
import ProfileScreen from "../screens/Members/ProfileScreen";
import CapitalScreen from "../screens/Capital/CapitalScreen";
import NotFoundScreen from "../screens/NotFound/NotFoundScreen";
import DashboardScreen from "../screens/Dashboard/DashboardScreen";
import AboutScreen from "../screens/About/AboutScreen";
import SupportScreen from "../screens/Support/SupportScreen";
import PlansScreen from "../screens/Plans/PlansScreen";
import AccountsScreen from "../screens/Accounts/AccountsScreen";
import DepositScreen from "../screens/Deposit/DepositScreen";
import LiveSupportScreen from "../screens/LiveSupport/LiveSupportScreen";
import MessagesScreen from "../screens/Messages/MessagesScreen";
import WalletScreen from "../screens/Wallet/WalletScreen";
import SettingsScreen from "../screens/Settings/SettingsScreen";
import AdminScreen from "../screens/Admin/AdminScreen";
import { DemoNotifications } from "../components/DemoNotifications";
import ProtectedRoute from "../components/Common/ProtectedRoute";

const Navigation: React.FC = () => (
  <Routes>
    <Route path="/" element={<LandingPage />} />
    <Route path="/about" element={<AboutScreen />} />
    <Route path="/market" element={<MarketScreen />} />
    <Route path="/plans" element={<PlansScreen />} />
    <Route path="/landing" element={<LandingPage />} />
    <Route path="/members/signin" element={<SigninScreen />} />
    <Route path="/members/signup" element={<SignupScreen />} />
    <Route path="/members/forgot-password" element={<ForgotScreen />} />

    {/* Protected Routes */}
    <Route
      path="/members"
      element={
        <ProtectedRoute>
          <ProfileScreen />
        </ProtectedRoute>
      }
    />
    <Route
      path="/capital"
      element={
        <ProtectedRoute>
          <CapitalScreen />
        </ProtectedRoute>
      }
    />
    <Route
      path="/dashboard"
      element={
        <ProtectedRoute>
          <DashboardScreen />
        </ProtectedRoute>
      }
    />
    <Route
      path="/accounts"
      element={
        <ProtectedRoute>
          <AccountsScreen />
        </ProtectedRoute>
      }
    />
    <Route
      path="/deposit"
      element={
        <ProtectedRoute>
          <DepositScreen />
        </ProtectedRoute>
      }
    />
    <Route
      path="/wallet"
      element={
        <ProtectedRoute>
          <WalletScreen />
        </ProtectedRoute>
      }
    />
    <Route
      path="/messages"
      element={
        <ProtectedRoute>
          <MessagesScreen />
        </ProtectedRoute>
      }
    />
    <Route
      path="/settings"
      element={
        <ProtectedRoute>
          <SettingsScreen />
        </ProtectedRoute>
      }
    />
    <Route
      path="/admin"
      element={
        <ProtectedRoute>
          <AdminScreen />
        </ProtectedRoute>
      }
    />
    <Route
      path="/demo"
      element={
        <ProtectedRoute>
          <DemoNotifications />
        </ProtectedRoute>
      }
    />

    {/* Public Routes */}
    <Route path="/support" element={<SupportScreen />} />
    <Route path="/live-support" element={<LiveSupportScreen />} />
    <Route path="*" element={<NotFoundScreen />} />
  </Routes>
);

export default Navigation;
