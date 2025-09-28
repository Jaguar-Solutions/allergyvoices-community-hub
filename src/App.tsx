import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import SafeShopping from "./pages/SafeShopping";
import DiningOut from "./pages/DiningOut";
import SchoolTeens from "./pages/SchoolTeens";
import About from "./pages/About";
import Restaurants from "./pages/Restaurants";
import RestaurantSubmission from "./pages/RestaurantSubmission";
import RestaurantDirectory from "./pages/RestaurantDirectory";
import AdminPanel from "./pages/AdminPanel";

const queryClient = new QueryClient();

const App = () => {
  // Check if we're in dev mode
  const isDevMode = import.meta.env.VITE_DEV_MODE === 'true';

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/safe-shopping" element={<SafeShopping />} />
              <Route path="/dining-out" element={<DiningOut />} />
              <Route path="/school-teens" element={<SchoolTeens />} />
              <Route path="/about" element={<About />} />
              <Route path="/restaurants" element={<Restaurants />} />
              <Route path="/restaurant-submission" element={<Navigate to="/restaurants" replace />} />
              {/* Only show directory route in dev mode */}
              {isDevMode && <Route path="/restaurant-directory" element={<RestaurantDirectory />} />}
              <Route path="/admin" element={<AdminPanel />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
