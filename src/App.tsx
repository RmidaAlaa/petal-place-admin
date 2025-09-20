import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "./contexts/CartContext";
import { AuthProvider } from "./contexts/AuthContext";
import { FavoritesProvider } from "./contexts/FavoritesContext";
import { WishlistProvider } from "./contexts/WishlistContext";
import { RecentlyViewedProvider } from "./contexts/RecentlyViewedContext";
import { CurrencyProvider } from "./contexts/CurrencyContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import Marketplace from "./pages/Marketplace";
import Admin from "./pages/Admin";
import BouquetBuilder from "./pages/BouquetBuilderPage";
import Categories from "./pages/Categories";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import WishlistPage from "./components/WishlistPage";
import Occasions from "./pages/Occasions";
import GiftBoxes from "./pages/GiftBoxes";
import Partners from "./pages/Partners";
import Success from "./pages/Success";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <CurrencyProvider>
        <AuthProvider>
          <FavoritesProvider>
            <WishlistProvider>
              <RecentlyViewedProvider>
                <CartProvider>
                  <TooltipProvider>
                    <Toaster />
                    <Sonner />
                    <BrowserRouter>
                      <Routes>
                        <Route path="/" element={<Marketplace />} />
                        <Route path="/builder" element={<BouquetBuilder />} />
                        <Route path="/categories" element={<Categories />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/wishlist" element={<WishlistPage />} />
                        <Route path="/occasions" element={<Occasions />} />
                        <Route path="/gift-boxes" element={<GiftBoxes />} />
                        <Route path="/partners" element={<Partners />} />
                        <Route path="/success" element={<Success />} />
                        <Route path="/admin" element={<Admin />} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </BrowserRouter>
                  </TooltipProvider>
                </CartProvider>
              </RecentlyViewedProvider>
            </WishlistProvider>
          </FavoritesProvider>
        </AuthProvider>
      </CurrencyProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;