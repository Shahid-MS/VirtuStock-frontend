import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, Outlet } from "react-router";
import NotFound from "./pages/OtherPage/NotFound";

import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";

import IPO from "./pages/IPO/IPO";
import OpenIPOs from "./pages/IPO/OpenIPOs";
import GMPIPO from "./pages/GMP/GMPIPO";


import ProtectedRoute from "./components/auth/ProtectedRoute";
import PublicRoute from "./pages/AuthPages/PublicRoute";
import { PaginationProvider } from "./Pagination/IpoPaginationContext";
import { Home } from "./pages/Dashboard/Home";

import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./queryClient";
import { Toaster } from "sonner";
import "primereact/resources/themes/lara-light-blue/theme.css";
import "primereact/resources/primereact.min.css";
import { ConfirmDialog } from "primereact/confirmdialog";

import { useAuthInit } from "./Store/authSlice";
import Loading from "./pages/OtherPage/Loading";

// Rarely-visited and chart-heavy pages load on demand to keep the first bundle small.
const SignIn = lazy(() => import("./pages/AuthPages/SignIn"));
const SignUp = lazy(() => import("./pages/AuthPages/SignUp"));
const ResetPassword = lazy(() => import("./pages/AuthPages/ResetPassword"));
const CompareIPO = lazy(() => import("./pages/Comparison/CompareIPO"));
const UpdateIPO = lazy(() => import("./pages/Admin/IPO/UpdateIpo"));
const UserProfile = lazy(() => import("./pages/User/Profile/UserProfile"));
const UserDashboard = lazy(() => import("./pages/User/Dashboard/UserHome"));
const AppliedIPO = lazy(() => import("./pages/User/Dashboard/AppliedIPO/AppliedIPO"));
const AdminDashboard = lazy(() => import("./pages/Admin/Dashboard/AdminDashboard"));
const AboutUs = lazy(() => import("./pages/OtherPage/AboutUs"));
const Support = lazy(() => import("./pages/OtherPage/Support"));
const AdminIpo = lazy(() => import("./pages/Admin/Dashboard/AdminIpo"));
const AllIPOs = lazy(() => import("./pages/IPO/AllIPOs"));
const AllotmentPage = lazy(() => import("./pages/IPO/AllotmentPage"));

export default function App() {
  useAuthInit();
  return (
    <>
      <Toaster position="top-center" />
      <ConfirmDialog />
      <Router>
        <ScrollToTop />
        <QueryClientProvider client={queryClient}>
          <Suspense fallback={<Loading />}>
          <Routes>
            {/* Dashboard Layout */}
            <Route element={<AppLayout />}>
              {/* Home */}
              <Route
                index
                path="/"
                element={<Home />}
              />

              <Route path="/ipo">
                <Route
                  path="compare"
                  element={
                    <PaginationProvider storageKey="compare-ipos">
                      <CompareIPO />
                    </PaginationProvider>
                  }
                />
                <Route path="open" element={<OpenIPOs />} />
                <Route path="allotment" element={<AllotmentPage />} />
                <Route
                  path="all"
                  element={
                    <PaginationProvider storageKey="all-ipos">
                      <AllIPOs />
                    </PaginationProvider>
                  }
                />
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
                    <PaginationProvider storageKey="admin-ipos">
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
          </Suspense>
        </QueryClientProvider>
      </Router>
    </>
  );
}
