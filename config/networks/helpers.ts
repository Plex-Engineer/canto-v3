const getEthAddressLink = (explorerUrl: string) => (address: string) =>
  `${explorerUrl}/address/${address}`;

const getEthTransactionLink = (explorerUrl: string) => (txnId: string) =>
  `${explorerUrl}/tx/${txnId}`;

const getCosmosAddressLink = (explorerUrl: string) => (address: string) =>
  `${explorerUrl}/accounts/${address}`;

const getCosmosTransactionLink = (explorerUrl: string) => (txnId: string) =>
  `${explorerUrl}/transactions/${txnId}`;

const checkCosmosAddress = (prefix: string) => (address: string) =>
  address.startsWith(prefix);

export {
  getEthAddressLink,
  getEthTransactionLink,
  getCosmosAddressLink,
  getCosmosTransactionLink,
  checkCosmosAddress,
};
