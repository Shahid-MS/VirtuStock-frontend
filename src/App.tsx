import { BrowserRouter as Router, Routes, Route, Outlet } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";

import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";

import IPO from "./pages/IPO/IPO";
import OpenIPOs from "./pages/IPO/OpenIPOs";
import CompareIPO from "./pages/Comparison/CompareIPO";
import GMPIPO from "./pages/GMP/GMPIPO";

import UpdateIPO from "./pages/Admin/IPO/UpdateIpo";

import ProtectedRoute from "./components/auth/ProtectedRoute";
import PublicRoute from "./pages/AuthPages/PublicRoute";
import ResetPassword from "./pages/AuthPages/ResetPassword";
import { PaginationProvider } from "./Pagination/IpoPaginationContext";
import { Home } from "./pages/Dashboard/Home";

import UserProfile from "./pages/User/Profile/UserProfile";
import UserDashboard from "./pages/User/Dashboard/UserHome";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./queryClient";
import { Toaster } from "sonner";
import AppliedIPO from "./pages/User/Dashboard/AppliedIPO/AppliedIPO";
import "primereact/resources/themes/lara-light-blue/theme.css";
import "primereact/resources/primereact.min.css";
import { ConfirmDialog } from "primereact/confirmdialog";

import AdminIpo from "./pages/Admin/Dashboard/AdminIpo";
import AdminDashboard from "./pages/Admin/Dashboard/AdminDashboard";
import AboutUs from "./pages/OtherPage/AboutUs";
import Support from "./pages/OtherPage/Support";
import { useAuthInit } from "./Store/authSlice";

export default function App() {
  useAuthInit();
  return (
    <>
      <Toaster position="top-center" />
      <ConfirmDialog />
      <Router>
        <ScrollToTop />
        <QueryClientProvider client={queryClient}>
          <Routes>
            {/* Dashboard Layout */}
            <Route element={<AppLayout />}>
              {/* Home */}
              <Route
                index
                path="/"
                element={
                  <PaginationProvider>
                    <Home />
                  </PaginationProvider>
                }
              />

              <Route path="/ipo">
                <Route
                  path="compare"
                  element={
                    <PaginationProvider>
                      <CompareIPO />
                    </PaginationProvider>
                  }
                />
                <Route path="open" element={<OpenIPOs />} />
                <Route path=":id" element={<IPO />} />
                <Route path="gmp/:id" element={<GMPIPO />} />
              </Route>

              {/* Admin */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requiredRoles={["ROLE_ADMIN"]}>
                    <Outlet />
                  </ProtectedRoute>
                }
              >
                <Route path="" element={<AdminDashboard />} />
                <Route
                  path="ipo"
                  element={
                    <PaginationProvider>
                      <AdminIpo />
                    </PaginationProvider>
                  }
                />

                <Route path="ipo/:id" element={<UpdateIPO />} />
              </Route>

              {/* User */}
              <Route
                path="/user"
                element={
                  <ProtectedRoute requiredRoles={["ROLE_USER"]}>
                    <Outlet />
                  </ProtectedRoute>
                }
              >
                <Route path="" element={<UserDashboard />} />
                <Route path="applied-ipo/:id" element={<AppliedIPO />} />
                <Route path="profile" element={<UserProfile />} />
              </Route>
              <Route path="/about-us" element={<AboutUs />} />
              <Route path="/support" element={<Support />} />
            </Route>

            {/* Auth Layout */}
            <Route
              path="/signin"
              element={
                <PublicRoute>
                  <SignIn />
                </PublicRoute>
              }
            />
            <Route
              path="/signup"
              element={
                <PublicRoute>
                  <SignUp />
                </PublicRoute>
              }
            />
            <Route
              path="/reset-password"
              element={
                <PublicRoute>
                  <ResetPassword />
                </PublicRoute>
              }
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </QueryClientProvider>
      </Router>
    </>
  );
}
