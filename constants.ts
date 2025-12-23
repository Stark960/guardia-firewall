
import { Rule, RuleType, BlockLog } from './types';

export const INITIAL_RULES: Rule[] = [
  { id: '1', type: RuleType.WHITELIST, value: '13800138000', label: '妈妈', createdAt: Date.now() - 1000000 },
  { id: '2', type: RuleType.BLACKLIST, value: '4001234567', label: '疑似诈骗', createdAt: Date.now() - 500000 },
  { id: '3', type: RuleType.CONTENT, value: '理财投资', createdAt: Date.now() - 200000 },
  { id: '4', type: RuleType.CONTENT, value: '中奖', createdAt: Date.now() - 100000 }
];

export const INITIAL_LOGS: BlockLog[] = [
  { 
    id: 'l1', 
    type: 'SMS', 
    number: '106900001234', 
    content: '恭喜您成为本周幸运星，点击链接领取您的中奖奖品！', 
    timestamp: Date.now() - 3600000, 
    reason: '内容过滤 (中奖)' 
  },
  { 
    id: 'l2', 
    type: 'CALL', 
    number: '4001234567', 
    timestamp: Date.now() - 7200000, 
    reason: '黑名单号码' 
  }
];
