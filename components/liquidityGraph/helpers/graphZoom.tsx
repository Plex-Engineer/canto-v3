import Button from "@/components/button/button";
import ButtonHold from "@/components/button/pressAndHold";
import Container from "@/components/container/container";
import Icon from "@/components/icon/icon";
import Spacer from "@/components/layout/spacer";
import Text from "@/components/text";

interface Props {
  title: string;
  zoomIn: () => void;
  zoomOut: () => void;
  reset: () => void;
}
export const GraphZoom = ({ title, zoomIn, zoomOut, reset }: Props) => (
  <Container direction="row" gap={"auto"} width="100%">
    <Text>{title}</Text>
    <Spacer height="8px" />
    <Container direction="row" gap={4}>
      <ButtonHold
        color="secondary"
        height={"small"}
        width={20}
        onHold={zoomOut}
        interval={50}
      >
        <Icon
          themed
          icon={{ url: "/zoom-out.svg", size: { width: 24, height: 24 } }}
        />
      </ButtonHold>
      <ButtonHold
        height={"small"}
        width={20}
        color="secondary"
        onHold={zoomIn}
        interval={50}
      >
        <Icon
          themed
          icon={{ url: "/zoom-in.svg", size: { width: 24, height: 24 } }}
        />
      </ButtonHold>
      <Button height={"small"} width={20} color="secondary" onClick={reset}>
        <Icon
          themed
          icon={{ url: "/reset.svg", size: { width: 28, height: 28 } }}
        />
      </Button>
    </Container>
  </Container>
);
