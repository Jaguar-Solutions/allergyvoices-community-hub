import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import LoadingSpinner from "@/components/LoadingSpinner";

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

            {/* Removed for now — restaurants section will return later */}
            <Route path="/restaurants" element={<Navigate to="/dining" replace />} />
            <Route path="/restaurant-submission" element={<Navigate to="/dining" replace />} />
            <Route path="/restaurant-directory" element={<Navigate to="/dining" replace />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
