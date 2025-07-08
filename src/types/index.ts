export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  status: 'active' | 'blocked';
  lastLogin?: string;
}

export interface CSVData {
  COMPANY: string;
  PRODUCT: string;
  VERSION: string;
  TABLE: string;
  MANDT: string;
  RECORD_NO: string;
  PARAM_NAME: string;
  PARAM_VALUE: string;
  PARAM_GROUP: string;
  DEP_RECORD_NO: string;
  PARAM_TYPE: string;
  PARAM_SCOPE: string;
  PARAM_COMMENT: string;
  ACTIVE: string;
  FLAG_NO_CHANGE: string;
  ENABLE_RULE: string;
  ENABLE_LANGU_VAL: string;
  RULE_CAT: string;
  RULE_ID: string;
  RULE_INPUT: string;
  CREATED_BY: string;
  CREATED_TS: string;
  CHANGED_BY: string;
  CHANGED_TS: string;
}

export interface ComparisonResult {
  paramName: string;
  company1Value: string;
  company2Value: string;
  isDifferent: boolean;
  table: string;
  paramGroup: string;
}