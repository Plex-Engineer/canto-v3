"use client";

import Text from "@/components/text";
import { useEffect } from "react";

interface PropLinkButton {
  text: string;
}

const FooterButton = ({ text }: PropLinkButton) => {
  function setTheme(themeName: string) {
    themeName =
      themeName === "dark" || themeName === "light" ? themeName : "dark";
    document.body.classList.add(themeName);
    document.body.classList.remove(themeName == "dark" ? "light" : "dark");
    localStorage.setItem("theme", themeName);
  }
  useEffect(() => {
    setTheme(localStorage.getItem("theme") as string);
  }, []);
  return (
    <button
      style={{
        height: "100%",
      }}
      onClick={() => {
        document.body.classList.contains("dark")
          ? setTheme("light")
          : setTheme("dark");
      }}
    >
      <Text size="x-sm" font="proto_mono">
        {text}
      </Text>
    </button>
  );
};

export default FooterButton;
