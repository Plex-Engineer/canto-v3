"use client";

import Text from "@/components/text";
import Toggle from "@/components/toggle";
import { useEffect, useState } from "react";

const ThemeButton = () => {
  const [name, setName] = useState("dark");

  function setTheme(themeName: string) {
    themeName =
      themeName === "dark" || themeName === "light" ? themeName : "dark";
    document.body.classList.add(themeName);

    document.body.classList.remove(themeName == "dark" ? "light" : "dark");
    localStorage.setItem("theme", themeName);
    setName(themeName == "dark" ? "light" : "dark");
  }
  useEffect(() => {
    setTheme(localStorage.getItem("theme") as string);
    const themeName = localStorage.getItem("theme");

    setName(
      (localStorage.getItem("theme") as string) == "dark" ? "light" : "dark"
    );
  }, []);

  return (
    // <button
    //   style={{
    //     paddingLeft: "1rem",
    //     height: "100%",
    //   }}
    //   onClick={() => {
    //     document.body.classList.contains("dark")
    //       ? setTheme("light")
    //       : setTheme("dark");
    //   }}
    // >
    //   {/* <Text size="x-sm" font="proto_mono">
    //     {name + " "} Theme
    //   </Text> */}

    // </button>
    <Toggle
      value={name == "dark"}
      onChange={() => {
        document.body.classList.contains("dark")
          ? setTheme("light")
          : setTheme("dark");
      }}
    >
      Test
    </Toggle>
  );
};

export default ThemeButton;
