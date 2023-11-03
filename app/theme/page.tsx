import Button from "@/components/button/button";
import Container from "@/components/container/container";
import Icon from "@/components/icon/icon";
import Spacer from "@/components/layout/spacer";
import Table from "@/components/table/table";
import Text from "@/components/text";
import Toggle from "@/components/toggle";

export default function Theme() {
  // has a checkbox to toggle between light and dark mode
  return (
    <div>
      <Table
        title="Table"
        headers={[
          {
            value: "Name",
            ratio: 4,
          },
          {
            value: "Price",
            ratio: 1,
          },
          {
            value: "Brand",
            ratio: 2,
          },
          {
            value: "Rent",
            ratio: 1,
          },
          {
            value: "Value",
            ratio: 1,
          },
          {
            value: "Action",
            ratio: 4,
          },
        ]}
        content={[
          [
            <Container key="test" direction="row" gap={10}>
              <Spacer width="20px" />

              <Icon
                icon={{
                  url: "/icons/usdc.svg",
                  size: 24,
                }}
              />
              <Text>USD Coin</Text>
            </Container>,
            "2",
            "3,00,23,000.23",
            "4",
            "5",
            <Container key="ad" gap={10} direction="row">
              <Button width={100}>Add</Button>{" "}
              <Button width={100}>Remove</Button>
            </Container>,
            ,
          ],
          [
            <Container key="test" direction="row" gap={10}>
              <Spacer width="20px" />

              <Icon
                icon={{
                  url: "/icons/note.svg",
                  size: 24,
                }}
              />
              <Text>Note</Text>
            </Container>,
            ,
            "2",
            "3,00,23,000.23",
            "4",
            "5",
            <Container key="ad" gap={10} direction="row">
              <Button width={100}>Add</Button>{" "}
              <Button width={100}>Remove</Button>
            </Container>,
          ],
          [
            <Container key="test" direction="row" gap={10}>
              <Spacer width="20px" />

              <Icon
                icon={{
                  url: "/icons/cNote.svg",
                  size: 24,
                }}
              />
              <Text>Collateral Note</Text>
            </Container>,
            ,
            "2",
            "3,00,23,000.23",
            "4",
            "5",
            <Container key="ad" gap={10} direction="row">
              <Button width={100}>Add</Button>{" "}
              <Button width={100}>Remove</Button>
            </Container>,
            ,
          ],
          [
            <Container key="test" direction="row" gap={10}>
              <Spacer width="20px" />

              <Icon
                icon={{
                  url: "/icons/atom.svg",
                  size: 24,
                }}
              />
              <Text>Atom</Text>
            </Container>,
            ,
            "2",
            "3,00,23,000.23",
            "4",
            "5",
            <Container key="ad" gap={10} direction="row">
              <Button width={100}>Add</Button>{" "}
              <Button width={100}>Remove</Button>
            </Container>,
            ,
          ],
          [
            <Container key="test" direction="row" gap={10}>
              <Spacer width="20px" />

              <Icon
                icon={{
                  url: "/icons/canto.svg",
                  size: 24,
                }}
              />
              <Text>Wrapped Canto</Text>
            </Container>,
            ,
            "2",
            "3,00,23,000.23",
            "4",
            "5",
            <Container key="ad" gap={10} direction="row">
              <Button width={100}>Add</Button>{" "}
              <Button width={100}>Remove</Button>
            </Container>,
            ,
          ],
          [
            <Container key="test" direction="row" gap={10}>
              <Spacer width="20px" />

              <Icon
                icon={{
                  url: "/icons/cmdx.svg",
                  size: 24,
                }}
              />
              <Text>Comdex</Text>
            </Container>,
            ,
            "2",
            "3,00,23,000.23",
            "4",
            "5",
            <Container key="ad" gap={10} direction="row">
              <Button width={100}>Add</Button>{" "}
              <Button width={100}>Remove</Button>
            </Container>,
            ,
          ],
          [
            <Container key="test" direction="row" gap={10}>
              <Spacer width="20px" />
              <Icon
                icon={{
                  url: "/icons/matic.svg",
                  size: 24,
                }}
              />
              <Text>Matic</Text>
            </Container>,
            ,
            "2",
            "3,00,23,000.23",
            "4",
            "5",
            <Container key="ad" gap={10} direction="row">
              <Button width={100}>Add</Button>{" "}
              <Button width={100}>Remove</Button>
            </Container>,
            ,
          ],
        ]}
      />
    </div>
  );
}
