import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Categories from "./pages/Categories";
import Database from "./pages/Database";
import DatabaseSearch from "./pages/DatabaseSearch";
import DatabaseSearchSEO from "./pages/DatabaseSearchSEO";
import ToolDetail from "./pages/ToolDetail";
import CategoryDetail from "./pages/CategoryDetail";
import Blog from "./pages/Blog";
import About from "./pages/About";
import Contact from "./pages/Contact";
import AdminDashboard from "./pages/AdminDashboard";
import AdvancedSearch from "./pages/AdvancedSearch";
import Navigation from "./components/Navigation";
import Footer from "./components/Footer";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <div className="flex flex-col min-h-screen">
      <Navigation />
      <main className="flex-1 bg-white">
        <Switch>
          <Route path={"/admin"} component={AdminDashboard} />
          <Route path={"/search"} component={AdvancedSearch} />
          <Route path={"/"} component={Home} />
          <Route path={"/categories"} component={Categories} />
          <Route path={"/database"} component={Database} />
          <Route path={"/database/search"} component={DatabaseSearchSEO} />
          <Route path={"/category/:slug"} component={CategoryDetail} />
          <Route path={"/tool/:slug"} component={ToolDetail} />
          <Route path={"/blog"} component={Blog} />
          <Route path={"/about"} component={About} />
          <Route path={"/contact"} component={Contact} />
          <Route path={"/404"} component={NotFound} />
          {/* Final fallback route */}
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
