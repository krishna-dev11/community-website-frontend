import { Route, Routes } from "react-router-dom";
import "./App.css";
import HomePage from "./Pages/HomePage";
import Login from "./Pages/Login";
import Signup from "./Pages/Signup";
import NavBar from "./Components/Common/NavBar";
import EnterOtp from "./Pages/EnterOtp";
import ForgotPassword from "./Pages/ForgotPassword";
import ResendEmail from "./Pages/ResendEmail";
import UpdatePassword from "./Pages/UpdatePassword";
import AboutPage from "./Pages/AboutPage";
import ContactUsPage from "./Pages/ContactUsPage";
import ResestCompletePage from "./Pages/ResestCompletePage";
import OpenRoute from "./Components/Core/Auth/OpenRoute";
import Dashboard from "./Pages/Dashboard";
import PrivateRoute from "./Components/Core/Auth/PrivateRoute";
import MyProfile from "./Components/Core/DashBoard/RightPart/MyProfile";
import SettingIndex from "./Components/Core/DashBoard/RightPart/Settings/SettingIndex";
import MemberDirectory from "./Components/Core/DashBoard/RightPart/MemberDirectory";
import AdminRegistrationQueue from "./Components/Core/DashBoard/RightPart/AdminRegistrationQueue";
import FamilyHub from "./Components/Core/DashBoard/RightPart/FamilyHub";
import CommunityHub from "./Components/Core/DashBoard/RightPart/CommunityHub";
import CommunityAdmin from "./Components/Core/DashBoard/RightPart/CommunityAdmin";
import ContentAdmin from "./Components/Core/DashBoard/RightPart/ContentAdmin";
import FinanceAdmin from "./Components/Core/DashBoard/RightPart/FinanceAdmin";
import NotFound from "./Components/Common/NotFound";
import AIGeminiChat from "./Components/Common/AIGeminiChat";
import PublicResourcePage from "./Pages/PublicResourcePage";
import DonatePage from "./Pages/DonatePage";
import NotificationsPage from "./Pages/NotificationsPage";
import MatrimonialPage from "./Pages/MatrimonialPage";

function App() {

  return (
    <div className="h-screen bg-black">
      
      <NavBar />
      <div><AIGeminiChat/></div>
      
      <Routes >
        <Route path="*" element={<NotFound />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactUsPage />} />
        <Route path="/notices" element={<PublicResourcePage type="notices" />} />
        <Route path="/publications" element={<PublicResourcePage type="publications" />} />
        <Route path="/gallery" element={<PublicResourcePage type="gallery" />} />
        <Route path="/jobs" element={<PublicResourcePage type="jobs" />} />
        <Route path="/scholarships" element={<PublicResourcePage type="scholarships" />} />
        <Route path="/achievements" element={<PublicResourcePage type="achievements" />} />
        <Route path="/condolence" element={<PublicResourcePage type="condolence" />} />
        <Route path="/donate" element={<DonatePage />} />
        <Route
          path="/matrimonial"
          element={
            <PrivateRoute>
              <MatrimonialPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <PrivateRoute>
              <NotificationsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/discussion"
          element={
            <PrivateRoute>
              <CommunityHub />
            </PrivateRoute>
          }
        />

        <Route
          path="/login"
          element={
            <OpenRoute>
              <Login />
            </OpenRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <OpenRoute>
              <Signup />
            </OpenRoute>
          }
        />
        <Route
          path="/enterOtp"
          element={
            <OpenRoute>
              <EnterOtp />
            </OpenRoute>
          }
        />
        <Route
          path="/forgotPassword"
          element={
            <OpenRoute>
              <ForgotPassword />
            </OpenRoute>
          }
        />
        <Route
          path="/update-password/:id"
          element={
            <OpenRoute>
              <UpdatePassword />
            </OpenRoute>
          }
        />
        <Route
          path="/resendToken"
          element={
            <OpenRoute>
              <ResendEmail />
            </OpenRoute>
          }
        />
        <Route
          path="/resetCompletePage"
          element={
            <OpenRoute>
              <ResestCompletePage />
            </OpenRoute>
          }
        />

        <Route
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        >
          <Route path="/dashboard/my-profile" element={<MyProfile />} />
          <Route path="/dashboard/directory" element={<MemberDirectory />} />
          <Route path="/dashboard/family" element={<FamilyHub />} />
          <Route path="/dashboard/community" element={<CommunityHub />} />
          <Route path="/dashboard/admin/registrations" element={<AdminRegistrationQueue />} />
          <Route path="/dashboard/admin/community" element={<CommunityAdmin />} />
          <Route path="/dashboard/admin/content" element={<ContentAdmin />} />
          <Route path="/dashboard/admin/finance" element={<FinanceAdmin />} />
          <Route path="/dashboard/setting" element={<SettingIndex />} />

        </Route>

      </Routes>

    </div>
  );
}

export default App;
