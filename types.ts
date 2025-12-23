
export enum FirewallStatus {
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED'
}

export enum RuleType {
  BLACKLIST = 'BLACKLIST',
  WHITELIST = 'WHITELIST',
  CONTENT = 'CONTENT'
}

export interface Rule {
  id: string;
  type: RuleType;
  value: string; 
  createdAt: number;
  label?: string;
}

export interface BlockLog {
  id: string;
  type: 'SMS' | 'CALL' | 'AUTO_REPLY';
  number: string;
  content?: string;
  timestamp: number;
  reason: string;
}

export interface AppState {
  rules: Rule[];
  logs: BlockLog[];
  status: FirewallStatus;
  autoReplyEnabled: boolean;
  autoReplyMessage: string;
}
