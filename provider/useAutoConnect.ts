import { useEffect } from "react";
import { useAccount, useConnect } from "wagmi";

const AUTOCONNECTED_CONNECTOR_IDS = ["safe"];

function useAutoConnect() {
  const { connect, connectors } = useConnect();
  const { connector } = useAccount();

  const onDisconnect = () => {
    const safeConnector = connectors.find(
      (c) => c.id === AUTOCONNECTED_CONNECTOR_IDS[0] && c.ready
    );
    if (safeConnector) {
      connect({ connector: safeConnector });
    }
  };

  useAccount({ onDisconnect });

  useEffect(() => {
    const safeConnector = connectors.find(
      (c) => c.id === AUTOCONNECTED_CONNECTOR_IDS[0] && c.ready
    );
    if (!safeConnector || connector === safeConnector) return;
    connect({ connector: safeConnector });
  }, [connectors, connector, connect]);
}

export { useAutoConnect };
