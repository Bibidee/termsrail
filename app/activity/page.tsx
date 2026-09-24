'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  aggregateActivityEvents,
  clientFor,
  getAuthorizedAccount,
  requireContract,
  Eip1193,
  readAllRecords,
  ActivityEvent,
} from '../../lib/genlayer';

const parse = (raw: string): Record<string, unknown> => {
  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return {};
  }
};

export default function Activity() {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [status, setStatus] = useState('LOADING CANONICAL ACTIVITY…');

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void (async () => {
        try {
          const provider = (window as Window & { ethereum?: Eip1193 }).ethereum;
          if (!provider) throw Error('CONNECT WALLET TO LOAD CANONICAL ACTIVITY');
          const account = await getAuthorizedAccount(provider);
          if (!account) throw Error('CONNECT WALLET TO LOAD CANONICAL ACTIVITY');
          const client = clientFor(account as `0x${string}`, provider);
          const [plans, escrows, receipts] = await Promise.all([
            readAllRecords(
              (offset, limit) =>
                client.readContract({
                  address: requireContract(),
                  functionName: 'get_plans',
                  args: [offset, limit] as never[],
                }) as Promise<string[]>,
            ),
            readAllRecords(
              (offset, limit) =>
                client.readContract({
                  address: requireContract(),
                  functionName: 'get_escrows',
                  args: [offset, limit] as never[],
                }) as Promise<string[]>,
            ),
            readAllRecords(
              (offset, limit) =>
                client.readContract({
                  address: requireContract(),
                  functionName: 'get_receipts',
                  args: [offset, limit] as never[],
                }) as Promise<string[]>,
            ),
          ]);

          const escrowIds = escrows
            .map(parse)
            .map((row) => String(row.escrow_id ?? ''))
            .filter(Boolean);
          const linked = await Promise.all(
            escrowIds.map(async (escrowId) => {
              const [completions, disputes] = await Promise.all([
                readAllRecords(
                  (offset, limit) =>
                    client.readContract({
                      address: requireContract(),
                      functionName: 'get_completions',
                      args: [escrowId, offset, limit] as never[],
                    }) as Promise<string[]>,
                ),
                readAllRecords(
                  (offset, limit) =>
                    client.readContract({
                      address: requireContract(),
                      functionName: 'get_disputes',
                      args: [escrowId, offset, limit] as never[],
                    }) as Promise<string[]>,
                ),
              ]);
              return { completions, disputes };
            }),
          );

          const records = [
            ...plans.map((raw) => ({ kind: 'plan' as const, raw })),
            ...escrows.map((raw) => ({ kind: 'escrow' as const, raw })),
            ...receipts.map((raw) => ({ kind: 'receipt' as const, raw })),
            ...linked.flatMap((group) => [
              ...group.completions.map((raw) => ({ kind: 'completion' as const, raw })),
              ...group.disputes.map((raw) => ({ kind: 'dispute' as const, raw })),
            ]),
          ];
          setEvents(aggregateActivityEvents(records));
          setStatus('CANONICAL ACTIVITY LOADED');
        } catch (error) {
          setStatus(error instanceof Error ? error.message : 'ACTIVITY READ FAILED');
        }
      })();
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="shell">
      <p className="kicker">NETWORK / ACTIVITY</p>
      <h1>Activity</h1>
      <p className="lede">Canonical plan, escrow, receipt, evidence and dispute events.</p>
      {events.length ? (
        <div className="change-feed">
          {events.map((event, index) => (
            <article className="panel" key={`${event.event}-${event.id}-${index}`}>
              <div className="panel-title">
                <span>{event.event}</span>
                <span className="mono">
                  {event.timestamp ? new Date(event.timestamp * 1000).toLocaleString() : '—'}
                </span>
              </div>
              <h2>{event.status ?? 'RECORDED'}</h2>
              <Link className="text-link" href={event.href}>
                OPEN RECORD →
              </Link>
            </article>
          ))}
        </div>
      ) : (
        <section className="empty-state">
          <h2>{status}</h2>
          <p>Canonical events will appear as v2 records are created.</p>
        </section>
      )}
    </div>
  );
}
