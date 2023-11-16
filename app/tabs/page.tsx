import Container from "@/components/container/container";
import Tabs from "@/components/nTabs/tabs";
import Text from "@/components/text";

export default function page() {
  return (
    <div>
      <Container width="700px" height="400px" margin="lg">
        <Tabs
          defaultIndex={0}
          shadows={true}
          tabs={[
            {
              title: "Tab 1",
              content: (
                <Container
                  center={{
                    horizontal: true,
                    vertical: true,
                  }}
                  height="100%"
                  width="100%"
                >
                  <Text font="proto_mono" size="md">
                    Tab 1 content
                  </Text>
                </Container>
              ),
            },
            {
              title: "Tab 2",
              isDisabled: true,
              content: <div>Tab 2 content</div>,
            },
            {
              title: "Tab 3",
              content: (
                <Container
                  center={{
                    horizontal: true,
                    vertical: true,
                  }}
                  height="100%"
                  width="100%"
                >
                  <Text font="proto_mono" size="md">
                    Tab 3 content
                  </Text>
                </Container>
              ),
            },
          ]}
        />
      </Container>
    </div>
  );
}
