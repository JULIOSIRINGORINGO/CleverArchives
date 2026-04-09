"use client";

import { Wallet, Plus, ArrowUpRight, ArrowDownRight, FileText, PieChart } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { 
  Table, TableBody, TableCell, 
  TableHead, TableHeader, TableRow 
} from "@/components/ui/Table";

const accounts = [
  { code: "1101", name: "Operating Cash", type: "Asset", balance: "IDR 24,500,000" },
  { code: "1201", name: "Book Inventory", type: "Asset", balance: "IDR 150,000,000" },
  { code: "4101", name: "Membership Fees", type: "Income", balance: "IDR 5,400,000" },
  { code: "5101", name: "Maintenance Costs", type: "Expense", balance: "IDR 1,200,000" },
];

export default function AccountingPage() {
  const t = useTranslations("Accounting");
  return (
    <div className="space-y-8 animate-in fade-in duration-150 pb-12 px-2 md:px-0">
      <div className="sticky top-0 z-20 bg-[--color-background] -mx-6 px-6 pt-10 pb-6 border-b border-border/50 shadow-sm transition-all overflow-visible mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Accounting & COA</h1>
          </div>
          <div className="flex gap-3">
            <Button variant="outline"><FileText size={18} className="mr-2" /> {t("reports", { defaultValue: "Reports" })}</Button>
            <Button><Plus size={18} className="mr-2" /> {t("new_transaction", { defaultValue: "New Transaction" })}</Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-primary text-primary-foreground">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-80  tracking-wider">Total Liquidity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">IDR 24.5M</div>
            <div className="flex items-center gap-1 mt-1 text-xs opacity-80">
              <ArrowUpRight size={14} /> +IDR 1.2M this week
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">IDR 5,400,000</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">IDR 1,200,000</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Chart of Accounts</CardTitle>
          <Button variant="ghost" size="sm">View All</Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Account Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Balance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.map((account) => (
                <TableRow key={account.code}>
                  <TableCell className="font-mono text-xs">{account.code}</TableCell>
                  <TableCell className="font-semibold">{account.name}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 rounded-full bg-muted text-xs font-medium">
                      {account.type}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-semibold">{account.balance}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
