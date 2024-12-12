interface RequestUser {
  id: number;
  email: string;
  iat?: number;
  exp?: number;
}

declare namespace Express {
  export interface Request {
    user?: RequestUser;
  }
}

type AccountCustomer = {
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
};

type AccountCreationResponse = {
  status: string;
  message: string;
  data: {
    account_number: string;
    account_name: string;
    bank: string;
    customer: AccountCustomer;
    isPermanent: boolean;
    amount: number;
  };
};

type BanksResponse = {
  status: string;
  message: string;
  data: [
    {
      code: string;
      name: string;
    }
  ];
};

type MerchantCollectionsResponse = {
  status: string;
  message: string;
  data: [
    {
      id: number;
      email: string;
      bank: string;
      session_id: string;
      source: any;
      amount: number;
      account_number: string;
      created_at: string;
      updated_at: string;
      deleted_at: string;
    }
  ];
};

type TransactionTransferResponse = {
  status: string;
  message: string;
  data: {
    email: string;
    trx_ref: string;
    merchant_ref: number;
    amount: number;
    bank: string;
    bank_code: string;
    account_number: string;
    account_name: string;
    narration: string;
    fee: number;
    status: string;
    created_at: string;
    id: string;
  };
};

type WebhookData = {
  type: "transfer";
  fromAccountId: string;
  toAccount: string;
  fromAccountNumber: string;
  toAccountNumber: string;
  fromBankName: string;
  toBankName: string;
  amount: number;
  reference: string;
};
