import { createContext, Context } from "react";
import { ToastItem } from "./ToastContainer";

interface ContextType {
  add: (toast: ToastItem) => void;
}

export const ToastContext = createContext<ContextType>({
  add: (toast: ToastItem) => {},
});
