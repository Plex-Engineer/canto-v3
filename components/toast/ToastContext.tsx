import { createContext, Context } from "react";
import { ToastItem } from "./ToastContainer";

interface ContextType {
  add: (toast: Partial<ToastItem>) => void;
}

export const ToastContext = createContext<ContextType>({
  add: (toast: Partial<ToastItem>) => {},
});
