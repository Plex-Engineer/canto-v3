"use client";
import { Tab, Tabs as TabsContainer, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import "./tabs.scss";
import Text from "../text";
interface Props {
  defaultIndex?: number;
  tabs: {
    title: string;
    isDisabled?: boolean;
    onClick?: () => void;
    content: React.ReactNode;
  }[];
}

const Tabs = (props: Props) => {
  return (
    <TabsContainer defaultIndex={props.defaultIndex ?? 0}>
      <TabList>
        {props.tabs.map((tab, index) => (
          <Tab key={index} disabled={tab.isDisabled} onClick={tab.onClick}>
            <Text font="proto_mono" size="md">
              {tab.title}
            </Text>
          </Tab>
        ))}
      </TabList>
      <>
        {props.tabs.map((tab, index) => (
          <TabPanel key={index}>{tab.content}</TabPanel>
        ))}
      </>
    </TabsContainer>
  );
};

export default Tabs;
