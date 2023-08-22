"use client";

import Text from "@/components/text";

interface PropLinkButton {
  text: string;
}

const FooterButton = ({ text }: PropLinkButton) => {
  return (
    <button
      style={{
        height: "100%",
      }}
      onClick={() => {
        if (document.body.classList.contains("dark")) {
          document.body.classList.add("light");

          document.body.classList.remove("dark");
        } else {
          document.body.classList.add("dark");
          document.body.classList.remove("light");
        }

        if (document.body.classList.contains("dark")) {
          localStorage.setItem("theme", "dark");
        } else {
          localStorage.setItem("theme", "light");
        }
      }}
    >
      <Text size="x-sm" name="proto_mono">
        {text}
      </Text>
    </button>
  );
};

export default FooterButton;
