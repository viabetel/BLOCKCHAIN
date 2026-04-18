import { formatEther } from "viem";

/**
 * Compact number formatter. Handles everything from 0.0001 up to trillions.
 * Never outputs more than 5 visible chars before the unit.
 */
export function fmtCompact(n: number, opts?: { maxDecimals?: number }): string {
  if (!isFinite(n) || n === 0) return "0";
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  const max = opts?.maxDecimals ?? 2;

  if (abs < 0.0001) return sign + "<0.0001";
  if (abs < 1) return sign + abs.toFixed(4).replace(/\.?0+$/, "");
  if (abs < 1_000) return sign + abs.toFixed(max).replace(/\.?0+$/, "");
  if (abs < 1_000_000) return sign + (abs / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  if (abs < 1_000_000_000) return sign + (abs / 1_000_000).toFixed(2).replace(/\.?0+$/, "") + "M";
  if (abs < 1_000_000_000_000) return sign + (abs / 1_000_000_000).toFixed(2).replace(/\.?0+$/, "") + "B";
  return sign + (abs / 1_000_000_000_000).toFixed(2).replace(/\.?0+$/, "") + "T";
}

/**
 * Format a bigint wei amount as compact zkLTC.
 */
export function fmtZkLTC(value: bigint | undefined | null): string {
  if (value == null) return "0";
  return fmtCompact(Number(formatEther(value)));
}

/**
 * Exact zkLTC balance, up to 4 decimals. Use in balance labels.
 */
export function fmtZkLTCExact(value: bigint | undefined | null): string {
  if (value == null) return "0.00";
  const n = Number(formatEther(value));
  if (n === 0) return "0.00";
  if (Math.abs(n) >= 1_000_000) return fmtCompact(n);
  if (Math.abs(n) >= 1) return n.toFixed(2);
  if (Math.abs(n) >= 0.01) return n.toFixed(4);
  if (Math.abs(n) >= 0.0001) return n.toFixed(4);
  return "<0.0001";
}

/**
 * Token balances (YES / NO / LP shares).
 */
export function fmtTokens(value: bigint | undefined | null): string {
  if (value == null) return "0";
  return fmtCompact(Number(formatEther(value)));
}

export function fmtPct(value: number, decimals = 1): string {
  if (!isFinite(value)) return "0.0";
  return value.toFixed(decimals);
}

export function fmtCents(pct: number): string {
  if (!isFinite(pct)) return "0.0";
  return pct.toFixed(1);
}

export function fmtAddress(addr: string): string {
  if (!addr) return "";
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export function fmtTimeLeft(deadline: Date): string {
  const now = Date.now();
  const diff = deadline.getTime() - now;
  if (diff <= 0) return "ended";
  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  if (days >= 30) return `${Math.floor(days / 30)}mo`;
  if (days >= 1) return `${days}d`;
  if (hours >= 1) return `${hours}h`;
  return "<1h";
}

/**
 * Convert a raw log (non-latin question text) into a safe display value.
 * Also detects Portuguese/other-language markets.
 */
export function isEnglishQuestion(q: string): boolean {
  return /^[\x00-\x7F]*$/.test(q) && !/\b(fecha|acima|abaixo|antes|depois|será)\b/i.test(q);
}

export function inferCategory(q: string): string {
  const lower = q.toLowerCase();
  if (/\bltc\b|litecoin|\bbtc\b|bitcoin|\beth\b|ethereum|price|\$\d/.test(lower)) return "Crypto";
  if (/tge|token|mainnet|launch/.test(lower)) return "Launch";
  if (/etf|sec|regulation|policy/.test(lower)) return "Policy";
  if (/builders|program|treasury|team/.test(lower)) return "Ecosystem";
  return "General";
}
