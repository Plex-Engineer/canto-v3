import Text from "@/components/text";
import styles from "../lp.module.scss";
import Icon from "@/components/icon/icon";
import Container from "@/components/container/container";
import Button from "@/components/button/button";

interface Props {
  onClick: () => void;
  value: string;
}

const Rewards = (props: Props) => {
  return (
    <section className={styles.rewards}>
      <div>
        <Text
          font="proto_mono"
          size="lg"
          style={{
            color: "#000",
          }}
        >
          Rewards
        </Text>

        <Container
          direction="row"
          gap={6}
          center={{
            vertical: true,
          }}
        >
          <Text
            font="proto_mono"
            size="x-lg"
            style={{
              fontSize: "36px",
              color: "#000",
            }}
          >
            {props.value}
          </Text>
          <Icon
            icon={{
              url: "./tokens/canto.svg",
              size: 24,
            }}
          />
        </Container>
      </div>

      <Button onClick={props.onClick} disabled={Number(props.value) === 0}>
        Claim
      </Button>
    </section>
  );
};

export default Rewards;
