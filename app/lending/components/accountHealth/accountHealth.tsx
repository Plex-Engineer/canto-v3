import Item from "../item";

interface Props {
  title: string;
  items: {
    name: string | React.ReactNode;
    value: string;
    postChild?: React.ReactNode;
    theme?:
      | "primary-light"
      | "primary-dark"
      | "secondary-light"
      | "secondary-dark"
      | undefined;
  }[];
}

const AccountHealth = (props: Props) => {
  return (
    <div>
      <h2>{props.title}</h2>
      {props.items.map((item, i) => (
        <Item key={i} {...item} />
      ))}
    </div>
  );
};

export default AccountHealth;
