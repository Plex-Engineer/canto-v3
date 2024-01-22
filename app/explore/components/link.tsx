import Container from "@/components/container/container";
import Text from "@/components/text";
import Image from "next/image";
import React from "react";
import style from "./link.module.scss";
import Analytics from "@/provider/analytics";

interface Props {
  title: string;
  description: string;
  link: string;
  image: string;
  backgroundColor?: string;
}
const ExploreLink = ({
  title,
  description,
  link,
  image,
  backgroundColor,
}: Props) => {
  return (
    <a
      className={style.container}
      href={link}
      target="_blank"
      onClick={() =>
        Analytics.actions.events.externalLinkClicked({ Website: title })
      }
    >
      <Container
        direction="row"
        gap={20}
        center={{
          horizontal: true,
          vertical: true,
        }}
      >
        <Image
          height={100}
          width={100}
          src={image}
          alt={title}
          style={{ backgroundColor: backgroundColor }}
        />
        <Container>
          <Text size="x-sm">
            <span
              style={{
                fontSize: "16px",
                textDecoration: "underline",
                fontWeight: 600,
              }}
            >
              {title}
            </span>{" "}
            {description}
          </Text>
        </Container>
      </Container>
    </a>
  );
};

export default ExploreLink;
