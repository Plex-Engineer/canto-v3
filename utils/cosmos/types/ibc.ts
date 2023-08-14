export const IBC_MSG_TYPES = {
  MsgValue: [
    { name: "source_port", type: "string" },
    { name: "source_channel", type: "string" },
    { name: "token", type: "TypeToken" },
    { name: "sender", type: "string" },
    { name: "receiver", type: "string" },
    { name: "timeout_height", type: "TypeTimeoutHeight" },
    { name: "timeout_timestamp", type: "uint64" },
  ],
  TypeToken: [
    { name: "denom", type: "string" },
    { name: "amount", type: "string" },
  ],
  TypeTimeoutHeight: [
    { name: "revision_number", type: "uint64" },
    { name: "revision_height", type: "uint64" },
  ],
};
