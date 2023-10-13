import Text from "@/components/text";
import styles from "./ecoTile.module.scss";
import Icon from "@/components/icon/icon";

interface Props {
  name: string;
  description: string;
  image: string;
  link: string;
}

const EcoTile = (props: Props) => {
  return (
    <div className={styles.card}>
      <a href={props.link} target="_blank" className={styles["card-title"]}>
        <Text font="proto_mono" size="x-lg" theme="primary-light">
          {props.name}
        </Text>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="25"
          height="25"
          viewBox="0 0 25 25"
          fill="none"
        >
          <path
            d="M7.28135 4.46094H20.4813M20.4813 4.46094V17.6609M20.4813 4.46094L4.88135 20.0609"
            stroke="var(--text-light-color)"
            stroke-width="2"
            stroke-linejoin="round"
          />
        </svg>
      </a>

      <div className={styles["card-image"]}>
        <Icon
          themed
          icon={{
            url: props.image,
            size: {
              width: 200,
              height: 200,
            },
          }}
        />
      </div>
      <Text size="sm" theme="secondary-dark" className={styles.desc}>
        {props.description}
      </Text>
    </div>
  );
};

export default EcoTile;
