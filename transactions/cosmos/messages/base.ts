/**
 * @dev use this for creating all EIP object types in messages
 * @param msgValues object of msgValue types for EIP712 message
 * @returns object of types for EIP712 message
 */
export function generateCosmosEIPTypes(msgValues: object) {
  const types = {
    EIP712Domain: [
      { name: "name", type: "string" },
      { name: "version", type: "string" },
      { name: "chainId", type: "uint256" },
      { name: "verifyingContract", type: "string" },
      { name: "salt", type: "string" },
    ],
    Tx: [
      { name: "account_number", type: "string" },
      { name: "chain_id", type: "string" },
      { name: "fee", type: "Fee" },
      { name: "memo", type: "string" },
      { name: "msgs", type: "Msg[]" },
      { name: "sequence", type: "string" },
    ],
    Fee: [
      { name: "feePayer", type: "string" },
      { name: "amount", type: "Coin[]" },
      { name: "gas", type: "string" },
    ],
    Coin: [
      { name: "denom", type: "string" },
      { name: "amount", type: "string" },
    ],
    Msg: [
      { name: "type", type: "string" },
      { name: "value", type: "MsgValue" },
    ],
  };
  Object.assign(types, msgValues);
  return types;
}
