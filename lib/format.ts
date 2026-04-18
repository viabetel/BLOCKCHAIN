import { formatEther } from "viem";

export function fmtZkLTC(value: bigint | undefined | null, decimals = 2): string {
  if (value == null) return "0.00";
  const n = Number(formatEther(value));
  if (n === 0) return "0.00";
  if (n < 0.0001) return "<0.0001";
  if (n < 1) return n.toFixed(4);
  if (n < 100) return n.toFixed(decimals);
  if (n < 10_000) return n.toFixed(1);
  if (n < 1_000_000) return (n / 1_000).toFixed(1) + "K";
  return (n / 1_000_000).toFixed(2) + "M";
}

export function fmtPct(value: number, decimals = 1): string {
  if (!isFinite(value)) return "0.0";
  return value.toFixed(decimals);
}

export function fmtCents(pct: number): string {
  if (!isFinite(pct)) return "0.0";
  return pct.toFixed(1);
}

export function fmtTokens(value: bigint | undefined | null): string {
  if (value == null) return "0.0000";
  const n = Number(formatEther(value));
  if (n === 0) return "0.0000";
  if (n < 0.0001) return "<0.0001";
  return n.toFixed(4);
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

export function inferCategory(q: string): string {
  const lower = q.toLowerCase();
  if (/\bltc\b|litecoin|\bbtc\b|bitcoin|\beth\b|ethereum|price|\$\d/.test(lower)) return "Crypto";
  if (/tge|token|mainnet|launch/.test(lower)) return "Launch";
  if (/etf|sec|regulation|policy/.test(lower)) return "Policy";
  if (/builders|program|treasury|team/.test(lower)) return "Ecosystem";
  return "General";
}
