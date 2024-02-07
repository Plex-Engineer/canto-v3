"use client"
import { toast } from "react-toastify";

const successColor = "var(--toast-success-color)";
const errorColor ="var(--toast-failure-color)";
const backgroundColor = "rgb(var(--light-color))"

export function toastHandler(
  message: string,
  successful: boolean,
  toastId: string | number,
  autoClose?: number
) {
      toast(message, {
        theme: document.body.classList.contains("dark") ? "dark" : "light",
        position: "top-right",
        autoClose: autoClose ?? 5000,
        toastId: toastId,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progressClassName: successful ? "toast-success" : "toast-error",
        style: {
            fontFamily:"var(--proto-mono)",
            border: `2px solid ${successful ? successColor : errorColor}`,
            borderRadius: "0px",
            paddingBottom: "3px",
            background: backgroundColor,
            color: `${successful ? successColor : errorColor}`,
            height: "100px",
            fontSize: "20px",
        },
    });
}
