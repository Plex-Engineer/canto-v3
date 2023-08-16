export interface Validator {
  operator_address: string;
  jailed: boolean;
  status: string;
  tokens: string;
  description: {
    moniker: string;
    identity: string;
    website: string;
    security_contact: string;
    details: string;
  };
  comission: string;
}
