"use client";

import type { ReactNode } from "react";

export interface Column<T> {
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
}

interface AdminTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  keyField: (row: T) => string;
  emptyMessage?: string;
}

export default function AdminTable<T>({ columns, rows, keyField, emptyMessage = "No records found." }: AdminTableProps<T>) {
  if (rows.length === 0) {
    return (
      <div className="glass rounded-2xl py-16 text-center text-sm text-foreground/50">{emptyMessage}</div>
    );
  }

  return (
    <div className="glass overflow-x-auto rounded-2xl">
      <table className="w-full min-w-[600px] text-left text-sm">
        <thead>
          <tr className="border-b border-border text-xs uppercase tracking-wider text-foreground/40">
            {columns.map((col) => (
              <th key={col.header} className={`px-4 py-3 font-medium ${col.className ?? ""}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((row) => (
            <tr key={keyField(row)} className="transition-colors hover:bg-white/[0.02]">
              {columns.map((col) => (
                <td key={col.header} className={`px-4 py-3 ${col.className ?? ""}`}>
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
