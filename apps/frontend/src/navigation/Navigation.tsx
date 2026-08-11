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
import TransactionsScreen from "../screens/Transactions/TransactionsScreen";
import { DemoNotifications } from "../components/DemoNotifications";
import ProtectedRoute from "../components/Common/ProtectedRoute";

const Navigation: React.FC = () => (
  <Routes>
    <Route path="/" element={<LandingPage />} />
    <Route path="/market" element={<MarketScreen />} />
    <Route path="/trade/:symbol" element={<MarketScreen />} />
    <Route path="/landing" element={<LandingPage />} />
    <Route path="/members/signin" element={<SigninScreen />} />
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
       element={<CapitalScreen />}
    />
    <Route
      path="/dashboard"
      element={
        <ProtectedRoute>
          <DashboardScreen />
        </ProtectedRoute>
      }
    />
    <Route path="/members/signup" element={<SignupScreen />} />
    <Route
      path="/transactions"
      element={
        <ProtectedRoute>
          <TransactionsScreen />
        </ProtectedRoute>
      }
    />
    <Route path="/members/forgot-password" element={<ForgotScreen />} />
    <Route
      path="/demo"
      element={
        <ProtectedRoute>
          <DemoNotifications />
        </ProtectedRoute>
      }
    />
    <Route path="*" element={<NotFoundScreen />} />
  </Routes>
);

export default Navigation;
