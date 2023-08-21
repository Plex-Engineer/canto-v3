import Container from "@/components/container/container";
import Tabs from "@/components/tabs/tabs";
import Text from "@/components/text";

export default function BridgePage() {
  return (
    <Container
      height="100vm"
      backgroundColor="background: var(--card-background-color, #C1C1C1)"
      center
    >
      <Container
        height="500px"
        width="700px"
        backgroundColor="var(--card-sub-surface-color, #DFDFDF)"
      >
        <Tabs
          tabs={[
            {
              title: "bridge in",
              content: <Text>Tab 1</Text>,
            },
            {
              title: "bridge out",
              content: <Text>Tab 2</Text>,
            },
            {
              title: "Recovery",
              isDisabled: true,
              content: <Text>Tab 3</Text>,
            },
            {
              title: "tx history",
              content: <Text>Tab 4</Text>,
            },
          ]}
        />
      </Container>
    </Container>
  );
}
