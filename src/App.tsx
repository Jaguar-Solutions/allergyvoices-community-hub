import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorBoundary from "@/components/ErrorBoundary";

// Home is part of the initial bundle (it's the landing page).
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Everything else is lazy-loaded so the initial JS payload stays small.
const Findings = lazy(() => import("./pages/Findings"));
const FindingDetail = lazy(() => import("./pages/FindingDetail"));
const Recalls = lazy(() => import("./pages/Recalls"));
const Resources = lazy(() => import("./pages/Resources"));
const ResourceDetail = lazy(() => import("./pages/ResourceDetail"));
const Allergens = lazy(() => import("./pages/Allergens"));
const AllergenHub = lazy(() => import("./pages/AllergenHub"));
const Directory = lazy(() => import("./pages/Directory"));
const DiningOut = lazy(() => import("./pages/DiningOut"));
const SchoolTeens = lazy(() => import("./pages/SchoolTeens"));
const About = lazy(() => import("./pages/About"));

// Restaurant Allergy Transparency & Recognition Program
const ProgramLanding = lazy(() => import("./pages/restaurants/ProgramLanding"));
const RestaurantSurvey = lazy(() => import("./pages/restaurants/Survey"));
const RestaurantSubmitted = lazy(() => import("./pages/restaurants/Submitted"));
const RestaurantDirectory = lazy(() => import("./pages/restaurants/Directory"));
const RestaurantFieldMode = lazy(() => import("./pages/restaurants/FieldMode"));
const RestaurantProfile = lazy(() => import("./pages/restaurants/Profile"));

// Admin (auth-gated inside the components themselves)
const AdminSubmissions = lazy(() => import("./pages/admin/Submissions"));
const AdminRestaurantDetail = lazy(() => import("./pages/admin/RestaurantDetail"));

const queryClient = new QueryClient();

const RouteFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <LoadingSpinner />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        {/* Catches render errors and, importantly for offline use, failures to
            load a lazy route chunk — otherwise those hang on a spinner. */}
        <ErrorBoundary>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<Index />} />

            {/* Latest Medical Findings */}
            <Route path="/findings" element={<Findings />} />
            <Route path="/findings/:slug" element={<FindingDetail />} />

            {/* Recalls and Alerts */}
            <Route path="/recalls" element={<Recalls />} />

            {/* Family Resource Center */}
            <Route path="/resources" element={<Resources />} />
            <Route path="/resources/:slug" element={<ResourceDetail />} />

            {/* Allergen Hubs */}
            <Route path="/allergens" element={<Allergens />} />
            <Route path="/allergens/:allergen" element={<AllergenHub />} />

            {/* Dining Out */}
            <Route path="/dining" element={<DiningOut />} />
            <Route path="/dining-out" element={<Navigate to="/dining" replace />} />

            {/* Schools & Teens */}
            <Route path="/schools-teens" element={<SchoolTeens />} />
            <Route path="/school-teens" element={<Navigate to="/schools-teens" replace />} />

            {/* Local Directory */}
            <Route path="/directory" element={<Directory />} />

            {/* Restaurant transparency program.
                The static child routes are declared before the :slug profile
                route so a reserved word can never resolve to a listing. */}
            <Route path="/restaurants" element={<ProgramLanding />} />
            <Route path="/restaurants/participate" element={<RestaurantSurvey />} />
            <Route path="/restaurants/submitted" element={<RestaurantSubmitted />} />
            <Route path="/restaurants/directory" element={<RestaurantDirectory />} />
            <Route path="/restaurants/field" element={<RestaurantFieldMode />} />
            <Route path="/restaurants/:slug" element={<RestaurantProfile />} />

            {/* Admin */}
            <Route path="/admin" element={<AdminSubmissions />} />
            <Route path="/admin/restaurants/:id" element={<AdminRestaurantDetail />} />

            {/* About / Editorial Policy */}
            <Route path="/about" element={<About />} />

            {/* Legacy redirects: blog moved into Findings */}
            <Route
              path="/blog/fda-food-allergen-thresholds"
              element={<Navigate to="/findings/2025-11-fda-allergen-thresholds" replace />}
            />
            <Route path="/blog" element={<Navigate to="/findings" replace />} />
            <Route path="/blog/:slug" element={<Navigate to="/findings" replace />} />

            {/* Legacy redirect */}
            <Route path="/safe-shopping" element={<Navigate to="/resources" replace />} />

            {/* Legacy restaurant URLs from the original build */}
            <Route
              path="/restaurant-submission"
              element={<Navigate to="/restaurants/participate" replace />}
            />
            <Route
              path="/restaurant-directory"
              element={<Navigate to="/restaurants/directory" replace />}
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        </ErrorBoundary>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
