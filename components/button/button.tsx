import localFont from "next/font/local";
import styles from "./button.module.scss";
import Image from "next/image";

const rm_mono = localFont({
  src: "../../fonts/rm-mono-regular.ttf",
  weight: "300",
  style: "normal",
});

const proto_mono = localFont({
  src: "../../fonts/proto-mono-regular.ttf",
  weight: "300",
  style: "normal",
});

interface Props {
  onClick?: () => void;
  height?: "small" | "medium" | "large" | number;
  width?: "contain" | "fill" | number;
  color?: "primary" | "secondary" | "accent";
  icon?: {
    url: string;
    position: "left" | "right";
    size?: number;
  };
  padding?: "sm" | "md" | "lg" | number;
  fontFamily?: "rm_mono" | "proto_mono";
  weight?: "regular" | "bold";
  children: React.ReactNode;
  isLoading?: boolean;
}

const Button = (props: Props) => {
  const getHeight = () => {
    switch (props.height) {
      case "small":
        return 35;
      case "medium":
        return 46;
      case "large":
        return 56;
      case undefined:
        return 46;
      default:
        return props.height;
    }
  };

  const getFontFamily = () => {
    switch (props.fontFamily) {
      case "rm_mono":
        return rm_mono.style.fontFamily;
      case "proto_mono":
        return proto_mono.style.fontFamily;
      default:
        return rm_mono.style.fontFamily;
    }
  };

  const getWidth = () => {
    switch (props.width) {
      case "contain":
        return "fit-content";
      case "fill":
        return "100%";
      case undefined:
        return "fit-content";
      default:
        return props.width;
    }
  };

  const getBGColor = () => {
    switch (props.color) {
      case "primary":
        return "var(--text-dark-color)";
      case "secondary":
        return "var(--card-surface-color)";
      case "accent":
        return "var(--extra-success-color)";
      case undefined:
        return "var(--text-dark-color)";
      default:
        return props.color;
    }
  };

  const getTextColor = () => {
    switch (props.color) {
      case "primary":
        return "var(--text-light-color)";
      case "secondary":
        return "var(--text-dark-color)";
      case "accent":
        return "var(--text-only-dark)";
      case undefined:
        return "var(--text-light-color)";
      default:
        return props.color;
    }
  };

  const getPadding = () => {
    switch (props.padding) {
      case "sm":
        return 10;
      case "md":
        return 20;
      case "lg":
        return 30;
      case undefined:
        return 20;
      default:
        return props.padding;
    }
  };

  return (
    <button
      className={styles.container}
      onClick={props.onClick}
      style={{
        height: getHeight() + "px",
        width: getWidth(),
        backgroundColor: getBGColor(),
        padding: getPadding() + "px",
        color: getTextColor(),
        fontFamily: getFontFamily(),
        gap: "12px",
        fontWeight: props.weight == "bold" ? "bold" : "normal",
        flexDirection: props.icon?.position == "right" ? "row-reverse" : "row",
      }}
    >
      {props.icon && (
        <Image
          src={props.icon.url}
          style={{
            filter:
              props.color == "primary"
                ? "invert(var(--light-mode))"
                : props.color == "accent"
                ? "invert(0)"
                : "invert(var(--dark-mode))",
          }}
          alt="icon"
          width={props.icon.size || 16}
          height={props.icon.size || 16}
          className={styles.icon}
        ></Image>
      )}
      {props.children}{" "}
      {props.isLoading && (
        <Image
          style={{
            filter:
              props.color == "primary"
                ? "invert(var(--light-mode))"
                : props.color == "accent"
                ? "invert(0)"
                : "invert(var(--dark-mode))",
          }}
          src="/loader.svg"
          alt="loading"
          width={22}
          height={22}
          className={styles.loader}
        ></Image>
      )}
    </button>
  );
};

export default Button;
