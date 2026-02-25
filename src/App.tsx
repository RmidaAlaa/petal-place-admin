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
import { EmailProvider } from "./contexts/EmailContext";
import { ReviewProvider } from "./contexts/ReviewContext";
import ErrorBoundary from "./components/ErrorBoundary";
import Marketplace from "./pages/Marketplace";
import Admin from "./pages/Admin";
import BouquetBuilder from "./pages/BouquetBuilderPage";
import Categories from "./pages/Categories";
import ProductDetailPage from "./pages/ProductDetailPage";
import CheckoutPage from "./pages/CheckoutPage";
import SearchResults from "./pages/SearchResults";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import WishlistPage from "./components/WishlistPage";
import Occasions from "./pages/Occasions";
import GiftBoxes from "./pages/GiftBoxes";
import Partners from "./pages/Partners";
import Success from "./pages/Success";
import ImportProducts from "./pages/ImportProducts";
import Login from "./pages/Login";
import ContactUs from "./pages/ContactUs";
import ImpactDetails from "./pages/ImpactDetails";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <CurrencyProvider>
          <EmailProvider>
            <AuthProvider>
              <FavoritesProvider>
                <WishlistProvider>
                  <RecentlyViewedProvider>
                    <CartProvider>
                      <ReviewProvider>
                        <TooltipProvider>
                          <Toaster />
                          <Sonner />
                          <BrowserRouter>
                            <Routes>
                              <Route path="/" element={<Marketplace />} />
                              <Route path="/search" element={<SearchResults />} />
                              <Route path="/product/:id" element={<ProductDetailPage />} />
                              <Route path="/builder" element={<BouquetBuilder />} />
                              <Route path="/categories" element={<Categories />} />
                              <Route path="/checkout" element={
                                <ProtectedRoute>
                                  <CheckoutPage />
                                </ProtectedRoute>
                              } />
                              <Route path="/profile" element={
                                <ProtectedRoute>
                                  <Profile />
                                </ProtectedRoute>
                              } />
                              <Route path="/wishlist" element={
                                <ProtectedRoute>
                                  <WishlistPage />
                                </ProtectedRoute>
                              } />
                              <Route path="/occasions" element={<Occasions />} />
                              <Route path="/gift-boxes" element={<GiftBoxes />} />
                              <Route path="/partners" element={<Partners />} />
                              <Route path="/contact" element={<ContactUs />} />
                              <Route path="/impact" element={<ImpactDetails />} />
                              <Route path="/success" element={<Success />} />
                              <Route path="/admin" element={
                                <ProtectedRoute requiredRole="admin">
                                  <Admin />
                                </ProtectedRoute>
                              } />
                              <Route path="/import" element={
                                <ProtectedRoute requiredRole="admin">
                                  <ImportProducts />
                                </ProtectedRoute>
                              } />
                              <Route path="/login" element={<Login />} />
                              <Route path="*" element={<NotFound />} />
                            </Routes>
                          </BrowserRouter>
                        </TooltipProvider>
                      </ReviewProvider>
                    </CartProvider>
                  </RecentlyViewedProvider>
                </WishlistProvider>
              </FavoritesProvider>
            </AuthProvider>
          </EmailProvider>
        </CurrencyProvider>
      </LanguageProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;