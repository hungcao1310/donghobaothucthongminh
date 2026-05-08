import { createContext, useContext, useState, ReactNode } from "react";

interface NavigationContextType {
  currentPage: string;
  params: any;
  navigate: (path: string, params?: any) => void;
  goBack: () => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [currentPage, setCurrentPage] = useState("home");
  const [params, setParams] = useState<any>({});
  const [history, setHistory] = useState<Array<{ page: string; params: any }>>([{ page: "home", params: {} }]);

  const navigate = (path: string, newParams?: any) => {
    // Normalize empty path or "/" to "home"
    const normalizedPath = (path === "" || path === "/") ? "home" : path;
    setHistory([...history, { page: normalizedPath, params: newParams || {} }]);
    setCurrentPage(normalizedPath);
    setParams(newParams || {});
  };

  const goBack = () => {
    if (history.length > 1) {
      const newHistory = history.slice(0, -1);
      const previous = newHistory[newHistory.length - 1];
      setHistory(newHistory);
      setCurrentPage(previous.page);
      setParams(previous.params);
    }
  };

  return (
    <NavigationContext.Provider value={{ currentPage, params, navigate, goBack }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error("useNavigation must be used within NavigationProvider");
  }
  return context;
}

export function useParams() {
  const { params } = useNavigation();
  return params;
}
