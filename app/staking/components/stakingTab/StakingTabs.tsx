
import styles from './StakingTabs.module.scss';
import Text from "@/components/text";

interface StakingTabsProps{
    handleTabChange: (txType: string)=> void;
    activeTab: string
}

export const StakingTabs = (props: StakingTabsProps) => {
    return (
            <div className={styles.Tabs}>
                <div onClick={() => props.handleTabChange('delegate')} className={props.activeTab === 'delegate' ? styles.activeTab : styles.Tab}><Text font='proto_mono'>Delegate</Text></div>
                <div onClick={() => props.handleTabChange('undelegate')} className={props.activeTab === 'undelegate' ? styles.activeTab : styles.Tab}><Text font='proto_mono'>Undelegate</Text></div>
                <div onClick={() => props.handleTabChange('redelegate')} className={props.activeTab === 'redelegate' ? styles.activeTab : styles.Tab}><Text font='proto_mono'>Redelegate</Text></div>
            </div>
    );
}