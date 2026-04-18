"use client";

import { useState, useEffect } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther, formatEther } from "viem";
import { addresses, marketAbi, erc20Abi } from "@/lib/contracts";
import { fmtPct, fmtZkLTC, fmtTokens } from "@/lib/format";

type Side = "YES" | "NO";
type Tab = "Buy" | "Sell" | "Liquidity";

export function TradeBox({
  market, resolved, yesPct, initialSide,
}: {
  market: `0x${string}`; resolved: boolean; yesPct: number; initialSide?: Side;
}) {
  const { address: user } = useAccount();
  const [tab, setTab] = useState<Tab>("Buy");
  const [side, setSide] = useState<Side>(initialSide ?? "YES");
  const [amount, setAmount] = useState("");
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  useEffect(() => { if (initialSide) setSide(initialSide); }, [initialSide]);

  const currentPrice = side === "YES" ? yesPct : 100 - yesPct;

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: addresses.collateral, abi: erc20Abi, functionName: "allowance",
    args: user ? [user, market] : undefined, query: { enabled: Boolean(user) },
  });
  const { data: balance } = useReadContract({
    address: addresses.collateral, abi: erc20Abi, functionName: "balanceOf",
    args: user ? [user] : undefined, query: { enabled: Boolean(user) },
  });
  const { data: yesBal, refetch: refetchYes } = useReadContract({
    address: market, abi: marketAbi, functionName: "yesBalance",
    args: user ? [user] : undefined, query: { enabled: Boolean(user) },
  });
  const { data: noBal, refetch: refetchNo } = useReadContract({
    address: market, abi: marketAbi, functionName: "noBalance",
    args: user ? [user] : undefined, query: { enabled: Boolean(user) },
  });
  const { data: liqBal, refetch: refetchLiq } = useReadContract({
    address: market, abi: marketAbi, functionName: "liquidity",
    args: user ? [user] : undefined, query: { enabled: Boolean(user) },
  });

  const { writeContract, data: txHash, isPending, reset } = useWriteContract();
  const { isLoading: waiting, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  useEffect(() => {
    if (isSuccess && txHash) {
      refetchAllowance(); refetchYes(); refetchNo(); refetchLiq();
      const t = setTimeout(() => { reset(); setAmount(""); }, 1500);
      return () => clearTimeout(t);
    }
  }, [isSuccess, txHash, refetchAllowance, refetchYes, refetchNo, refetchLiq, reset]);

  const parsedAmount = amount ? parseEther(amount) : 0n;
  const balanceBig = (balance as bigint) ?? 0n;
  const yesBalBig = (yesBal as bigint) ?? 0n;
  const noBalBig = (noBal as bigint) ?? 0n;
  const liqBalBig = (liqBal as bigint) ?? 0n;

  const sideBal = side === "YES" ? yesBalBig : noBalBig;

  // Context-dependent limits
  const maxForTab = tab === "Sell" ? sideBal : tab === "Liquidity" ? balanceBig : balanceBig;
  const insufficient = parsedAmount > maxForTab;
  const needsApproval = tab === "Buy" && user && parsedAmount > 0n && (allowance ?? 0n) < parsedAmount;
  const needsApprovalLiq = tab === "Liquidity" && user && parsedAmount > 0n && (allowance ?? 0n) < parsedAmount;

  const estTokens = parsedAmount > 0n && currentPrice > 0 ? Number(formatEther(parsedAmount)) / (currentPrice / 100) : 0;
  const estProceeds = parsedAmount > 0n ? Number(formatEther(parsedAmount)) * (currentPrice / 100) : 0;

  const approve = () => writeContract({
    address: addresses.collateral, abi: erc20Abi, functionName: "approve",
    args: [market, 2n ** 256n - 1n],
  });
  const buy = () => writeContract({
    address: market, abi: marketAbi, functionName: "buy",
    args: [side === "YES" ? 1n : 0n, parsedAmount, 0n],
  });
  const sell = () => writeContract({
    address: market, abi: marketAbi, functionName: "sell",
    args: [side === "YES" ? 1n : 0n, parsedAmount, 0n],
  });
  const addLiq = () => writeContract({
    address: market, abi: marketAbi, functionName: "addLiquidity", args: [parsedAmount],
  });
  const removeLiq = () => writeContract({
    address: market, abi: marketAbi, functionName: "removeLiquidity", args: [parsedAmount],
  });
  const redeem = () => writeContract({
    address: market, abi: marketAbi, functionName: "redeem", args: [],
  });

  if (!mounted) return <div className="h-[500px] rounded-xl border border-ink-200 bg-paper-pure" />;

  if (!user) {
    return (
      <div className="rounded-xl border border-ink-200 bg-paper-pure p-5">
        <div className="text-[10px] font-semibold uppercase tracking-[0.15em] text-ink-500">Trade</div>
        <div className="mt-4 rounded-lg border-2 border-dashed border-ink-200 bg-paper-off p-8 text-center">
          <p className="text-sm font-semibold text-ink-pure">Connect wallet to trade</p>
          <p className="mt-1 text-xs text-ink-500">You need zkLTC on LiteForge testnet</p>
        </div>
      </div>
    );
  }

  if (resolved) {
    return (
      <div className="rounded-xl border border-ink-200 bg-paper-pure p-5">
        <div className="text-[10px] font-semibold uppercase tracking-[0.15em] text-ink-500">Your Position</div>
        <div className="mt-4 space-y-2">
          <PositionRow label="YES shares" amount={yesBalBig} color="bull" />
          <PositionRow label="NO shares" amount={noBalBig} color="bear" />
          {liqBalBig > 0n && <PositionRow label="LP shares" amount={liqBalBig} color="brand" />}
        </div>
        <button onClick={redeem} disabled={isPending || waiting}
          className="btn-ink mt-4 w-full rounded-lg px-4 py-3 text-sm">
          {waiting ? "Confirming..." : isPending ? "Approve in wallet..." : "Redeem winnings"}
        </button>
      </div>
    );
  }

  const tabButtons: Tab[] = ["Buy", "Sell", "Liquidity"];

  return (
    <div className="rounded-xl border border-ink-200 bg-paper-pure">
      {/* Tabs */}
      <div className="flex items-center border-b border-ink-200 px-4">
        {tabButtons.map((t) => (
          <button key={t} onClick={() => { setTab(t); setAmount(""); }}
            className={`tab-btn ${tab === t ? "active" : ""}`}>
            {t}
          </button>
        ))}
        <span className="ml-auto font-mono text-[10px] font-medium uppercase tracking-widest text-ink-400">FPMM</span>
      </div>

      <div className="p-5">
        {/* Side selector — shown on Buy and Sell */}
        {(tab === "Buy" || tab === "Sell") && (
          <div className="mb-4 grid grid-cols-2 gap-2">
            <SideButton active={side === "YES"} onClick={() => setSide("YES")} label={`${tab} YES`} price={yesPct} color="bull" />
            <SideButton active={side === "NO"} onClick={() => setSide("NO")} label={`${tab} NO`} price={100 - yesPct} color="bear" />
          </div>
        )}

        {/* Info box for Liquidity */}
        {tab === "Liquidity" && (
          <div className="mb-4 rounded-lg border border-brand/20 bg-brand/5 p-3 text-xs text-ink-700">
            <div className="font-semibold text-brand">Provide liquidity</div>
            <p className="mt-1 leading-relaxed">
              Deposit zkLTC to earn a share of trading fees. Your LP position settles against the winning side at resolution.
            </p>
          </div>
        )}

        {/* Amount */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-[10px] font-semibold uppercase tracking-[0.15em] text-ink-500">Amount</label>
            <span className="text-[11px] text-ink-500">
              {tab === "Sell" ? `${side} shares:` : tab === "Liquidity" ? "Balance:" : "Balance:"}{" "}
              <span className="font-mono font-semibold text-ink-800 tabular">
                {fmtTokens(maxForTab)}
              </span>{" "}
              {tab === "Sell" ? "" : "zkLTC"}
            </span>
          </div>
          <div className="relative">
            <input type="text" inputMode="decimal" value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
              placeholder="0.00"
              className="w-full rounded-lg border border-ink-200 bg-paper-off px-4 py-3 pr-20 font-display text-2xl font-semibold text-ink-pure tabular placeholder:text-ink-300 focus:border-ink-pure focus:bg-paper-pure focus:outline-none" />
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 font-mono text-xs font-semibold text-ink-500">
              {tab === "Sell" ? side : "zkLTC"}
            </span>
          </div>
          <div className="mt-2 grid grid-cols-4 gap-1.5">
            {[0.25, 0.5, 0.75, 1].map((frac) => (
              <button key={frac}
                onClick={() => setAmount(formatEther((maxForTab * BigInt(Math.floor(frac * 100))) / 100n))}
                className="rounded-md border border-ink-200 bg-paper-off py-1.5 text-[11px] font-semibold text-ink-700 transition hover:border-ink-pure">
                {frac === 1 ? "MAX" : `${Math.round(frac * 100)}%`}
              </button>
            ))}
          </div>
        </div>

        {/* Preview */}
        {parsedAmount > 0n && !insufficient && tab === "Buy" && (
          <PreviewBox rows={[
            ["Avg price", `${fmtPct(currentPrice)}¢`],
            [`${side} shares`, estTokens.toFixed(4)],
            ["Payout if wins", `${estTokens.toFixed(4)} zkLTC`, true],
            ["Max profit", `+${(estTokens - Number(amount || 0)).toFixed(4)} zkLTC`, false, "bull"],
          ]} />
        )}
        {parsedAmount > 0n && !insufficient && tab === "Sell" && (
          <PreviewBox rows={[
            ["Selling", `${amount} ${side} shares`],
            ["Avg price", `${fmtPct(currentPrice)}¢`],
            ["You receive", `~${estProceeds.toFixed(4)} zkLTC`, true],
          ]} />
        )}
        {parsedAmount > 0n && !insufficient && tab === "Liquidity" && (
          <PreviewBox rows={[
            ["Depositing", `${amount} zkLTC`],
            ["Your LP position", fmtTokens(liqBalBig)],
            ["Fee earnings", "pro-rata from 2% trade fees"],
          ]} />
        )}

        {/* CTA */}
        <button
          onClick={() => {
            if (tab === "Buy") { (needsApproval ? approve : buy)(); }
            else if (tab === "Sell") { sell(); }
            else { (needsApprovalLiq ? approve : addLiq)(); }
          }}
          disabled={!parsedAmount || insufficient || isPending || waiting}
          className={`mt-4 w-full rounded-lg px-4 py-3.5 text-sm font-semibold transition ${
            tab === "Buy" && !needsApproval && side === "YES" ? "btn-bull" :
            tab === "Buy" && !needsApproval && side === "NO" ? "btn-bear" :
            tab === "Sell" ? "btn-ink" :
            tab === "Liquidity" && !needsApprovalLiq ? "btn-ink" :
            "btn-ink"
          } disabled:cursor-not-allowed disabled:opacity-40`}>
          {waiting ? "Confirming onchain..." :
           isPending ? "Approve in wallet..." :
           insufficient ? "Insufficient balance" :
           parsedAmount === 0n ? "Enter amount" :
           tab === "Buy" && needsApproval ? "Approve zkLTC" :
           tab === "Buy" ? `Buy ${side} — ${amount} zkLTC` :
           tab === "Sell" ? `Sell ${amount} ${side}` :
           tab === "Liquidity" && needsApprovalLiq ? "Approve zkLTC" :
           `Add ${amount} zkLTC liquidity`}
        </button>

        {tab === "Liquidity" && liqBalBig > 0n && (
          <button onClick={removeLiq} disabled={isPending || waiting}
            className="mt-2 w-full rounded-lg border border-ink-300 bg-paper-pure px-4 py-2.5 text-xs font-semibold text-ink-700 transition hover:border-ink-pure">
            Remove all LP ({fmtTokens(liqBalBig)})
          </button>
        )}

        {/* Position strip */}
        <div className="mt-5 border-t border-ink-100 pt-4">
          <div className="mb-2.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-ink-500">Your Position</div>
          <div className="grid grid-cols-3 gap-2">
            <MiniPos label="YES" amount={yesBalBig} color="bull" />
            <MiniPos label="NO" amount={noBalBig} color="bear" />
            <MiniPos label="LP" amount={liqBalBig} color="brand" />
          </div>
        </div>
      </div>
    </div>
  );
}

function SideButton({ active, onClick, label, price, color }: {
  active: boolean; onClick: () => void; label: string; price: number; color: "bull" | "bear";
}) {
  const bg = color === "bull" ? "bg-bull" : "bg-bear";
  const hover = color === "bull" ? "hover:border-bull hover:text-bull" : "hover:border-bear hover:text-bear";
  return (
    <button onClick={onClick}
      className={`flex flex-col items-start gap-0.5 rounded-lg border p-3 transition ${
        active ? `${bg} border-transparent text-white` : `border-ink-200 bg-paper-pure text-ink-700 ${hover}`
      }`}>
      <span className="text-[11px] font-semibold uppercase tracking-wider">{label}</span>
      <span className={`font-display text-xl font-bold tracking-tighter tabular ${active ? "text-white" : "text-ink-pure"}`}>
        {fmtPct(price, 0)}<span className={`text-sm ${active ? "text-white" : "text-ink-500"}`}>¢</span>
      </span>
    </button>
  );
}

function PreviewBox({ rows }: { rows: Array<[string, string, boolean?, string?]> }) {
  return (
    <div className="mt-4 rounded-lg border border-ink-200 bg-paper-off p-3">
      {rows.map(([label, value, bold, accent], i) => (
        <div key={i} className={`flex items-center justify-between py-1 text-xs ${i > 0 && i < rows.length - 1 ? "" : ""}`}>
          <span className="text-ink-500">{label}</span>
          <span className={`font-mono font-semibold tabular ${
            accent === "bull" ? "text-bull" : bold ? "text-ink-pure" : "text-ink-800"
          }`}>{value}</span>
        </div>
      ))}
    </div>
  );
}

function PositionRow({ label, amount, color }: { label: string; amount: bigint; color: "bull" | "bear" | "brand" }) {
  const dot = color === "bull" ? "bg-bull" : color === "bear" ? "bg-bear" : "bg-brand";
  return (
    <div className="flex items-center justify-between rounded-lg border border-ink-200 bg-paper-off px-4 py-3">
      <span className="flex items-center gap-2 text-xs font-semibold text-ink-800">
        <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />{label}
      </span>
      <span className="font-mono text-base font-semibold text-ink-pure tabular">{fmtTokens(amount)}</span>
    </div>
  );
}

function MiniPos({ label, amount, color }: { label: string; amount: bigint; color: "bull" | "bear" | "brand" }) {
  const ct = color === "bull" ? "text-bull" : color === "bear" ? "text-bear" : "text-brand";
  return (
    <div className="rounded-md border border-ink-200 bg-paper-off px-2.5 py-2">
      <span className={`block text-[10px] font-semibold uppercase tracking-widest ${ct}`}>{label}</span>
      <span className="mt-0.5 block font-mono text-sm font-semibold text-ink-pure tabular">{fmtTokens(amount)}</span>
    </div>
  );
}
