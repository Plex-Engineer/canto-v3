import { useEffect } from "react";
import { useAccount, useConnect } from "wagmi";

const AUTOCONNECTED_CONNECTOR_IDS = ["safe", "injected"];

function useAutoConnect() {
  const { connect, connectors } = useConnect();

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
    if (safeConnector) {
      connect({ connector: safeConnector });
      return;
    }

    AUTOCONNECTED_CONNECTOR_IDS.forEach((connectorId) => {
      if (connectorId === AUTOCONNECTED_CONNECTOR_IDS[0]) return;

      const connectorInstance = connectors.find(
        (c) => c.id === connectorId && c.ready
      );
      if (connectorInstance) {
        connect({ connector: connectorInstance });
      }
    });
  }, [connect, connectors]);
}

export { useAutoConnect };
