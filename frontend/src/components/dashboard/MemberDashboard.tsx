"use client";

import { useTranslations, useLocale } from "next-intl";
import { 
  BookOpen, BookMarked, Star, ChevronRight, Sparkles, Bookmark, ArrowUpRight, Clock, Activity, TrendingUp, CalendarCheck
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { apiService } from "@/services/api";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/Skeleton";
import { PageHeader } from "@/components/layout/PageHeader";

export default function MemberDashboard() {
  const { user } = useAuth();
  const t = useTranslations("Dashboard");
  const locale = useLocale();
  const [stats, setStats] = useState({
    activeBorrowings: 0,
    historyCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("week");
  const [borrowings, setBorrowings] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [statsData, listData] = await Promise.all([
          apiService.borrowings.stats(),
          apiService.borrowings.list({ status: 'active' })
        ]);
        setStats({ 
          activeBorrowings: statsData.activeCount || 0, 
          historyCount: statsData.historyCount || 0 
        });
        setBorrowings(listData.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Helper to calculate books due soon (within 2 days)
  const dueSoonCount = borrowings.filter(b => {
    if (!b.due_date) return false;
    const dueDate = new Date(b.due_date);
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 2;
  }).length;

  const getChartData = () => {
    // Basic aggregation by borrow_date
    const countsByDate: Record<string, number> = {};
    borrowings.forEach(b => {
      if (b.borrow_date) {
        countsByDate[b.borrow_date] = (countsByDate[b.borrow_date] || 0) + 1;
      }
    });

    switch (timeRange) {
      case "month":
        return [
          { name: 'W1', count: 2 }, { name: 'W2', count: 4 }, 
          { name: 'W3', count: 1 }, { name: 'W4', count: borrowings.length || 0 }
        ];
      case "year":
        return [
          { name: 'Jan', count: 5 }, { name: 'Feb', count: 8 }, 
          { name: 'Mar', count: borrowings.length || 0 }
        ];
      default: // week
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const result = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const dateStr = d.toISOString().split('T')[0];
          result.push({
            name: days[d.getDay()],
            count: countsByDate[dateStr] || 0
          });
        }
        return result;
    }
  };

  const chartData = getChartData();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12 px-2 md:px-0">
      <PageHeader
        title={t("welcome", { name: user?.name || "Member" }) + "!"}
        subtitle={t("description")}
        badge={t("summary")}
      >
        <Link href={`/${locale}/catalog`}>
          <Button size="sm" className="rounded-lg h-9 text-xs font-bold shadow-sm hover:-translate-y-0.5 transition-all">
            {t("viewAll")} <ChevronRight size={14} className="ml-1" />
          </Button>
        </Link>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { title: t("currentReads"), value: stats.activeBorrowings, icon: BookOpen, trend: t("status_active"), bg: "from-blue-600 to-blue-400", bgLight: "bg-blue-50/50", href: "/borrowings" },
          { title: t("booksRead"), value: stats.historyCount, icon: BookMarked, trend: t("status_completed"), bg: "from-emerald-600 to-emerald-400", bgLight: "bg-emerald-50/50", href: "/history" },
          { title: t("readingGoal"), value: "12", icon: Star, trend: t("status_target"), bg: "from-amber-600 to-orange-400", bgLight: "bg-amber-50/50", href: "/catalog", isGoal: true },
          { title: t("dueSoonTitle"), value: dueSoonCount, icon: CalendarCheck, trend: t("status_soon"), bg: "from-red-600 to-rose-400", bgLight: "bg-red-50/50", href: "/borrowings" },
        ].map((stat, i) => (
          <Link href={`/${locale}${stat.href}`} key={i}>
            <Card className={cn("group relative overflow-hidden rounded-xl border shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer h-full min-h-[140px]", stat.bgLight)}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-muted-foreground font-bold text-xs">{stat.title}</h3>
                    {loading ? (
                      <Skeleton className="h-8 w-12 mt-2" />
                    ) : (
                      <div className="text-2xl font-bold mt-1.5 tabular-nums">
                        {stat.isGoal ? (
                          <div className="flex items-end gap-1">
                            <span className="text-2xl">{stats.historyCount}</span>
                            <span className="text-muted-foreground text-sm font-bold mb-1">/ {stat.value}</span>
                          </div>
                        ) : stat.value}
                      </div>
                    )}
                  </div>
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm group-hover:scale-105 group-hover:rotate-3 transition-transform bg-gradient-to-br",
                    stat.bg
                  )}>
                    <stat.icon size={20} />
                  </div>
                </div>

                {stat.isGoal && (
                  <div className="mt-4 space-y-1.5">
                    <div className="flex justify-between text-[10px] font-bold text-muted-foreground">
                      <span>{Math.round((stats.historyCount / 12) * 100)}% {t("completed")}</span>
                      <span>Target: 12</span>
                    </div>
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden border border-black/5 shadow-inner">
                      <div 
                        className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-1000 ease-out rounded-full" 
                        style={{ width: `${Math.min((stats.historyCount / 12) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {!stat.isGoal && (
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className={cn("w-1.5 h-1.5 rounded-full", stat.trend === "Segera" ? "bg-red-500" : "bg-emerald-500")}></span>
                      <span className="text-xs font-bold text-muted-foreground leading-none">
                        {stat.trend}
                      </span>
                    </div>
                    <ArrowUpRight size={14} className="text-primary opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                  </div>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <Card className="md:col-span-8 rounded-xl border shadow-sm overflow-hidden bg-card/60 backdrop-blur-sm">
          <CardHeader className="p-5 pb-0">
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                    <Activity size={16} />
                  </div>
                <div>
                   <CardTitle className="text-base font-bold">{t("readingActivity")}</CardTitle>
                  <p className="text-[10px] font-bold text-muted-foreground mt-0.5">{t("activitySubtitle")}</p>
                </div>
              </div>
              
              <div className="flex items-center bg-muted/50 p-1 rounded-lg border border-border/50 overflow-x-auto">
                {["week", "month", "year"].map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={cn(
                      "px-3 py-1 text-[10px] font-bold rounded-md transition-all whitespace-nowrap",
                      timeRange === range 
                        ? "bg-white text-primary shadow-sm" 
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {t(`range_${range}`)}
                  </button>
                ))}
              </div>
              </div>
          </CardHeader>
          <CardContent className="p-5 pt-8">
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 700, fill: '#64748B' }} 
                    dy={10}
                  />
                  <YAxis hide />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white border shadow-xl p-3 rounded-xl flex items-center gap-2">
                             <TrendingUp size={16} className="text-primary" />
                             <span className="font-bold text-sm">{payload[0].value} {t("books_unit")}</span>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="count" 
                    stroke="var(--color-primary)" 
                    strokeWidth={4} 
                    fillOpacity={1} 
                    fill="url(#colorCount)" 
                    animationDuration={2000}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-4 rounded-xl border shadow-sm bg-gradient-to-br from-primary to-blue-600 p-6 text-primary-foreground relative overflow-hidden flex flex-col justify-end min-h-[300px]">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
          
          <div className="relative z-10">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center mb-4 border border-white/10">
              <Clock size={20} className="text-white" />
            </div>
            <h3 className="text-xl font-bold leading-tight mb-2">
              {t("digitalCollection").split(' ').map((word, index) => (
                <React.Fragment key={index}>
                  {word}{index === 0 && <br/>}
                </React.Fragment>
              ))}
            </h3>
            <p className="text-xs font-bold text-white/80 mb-5 max-w-[200px] leading-relaxed">
              {t("digitalAccess")}
            </p>
            <Link href={`/${locale}/ebooks`}>
              <Button size="sm" className="w-full bg-white text-primary hover:bg-white/90 rounded-lg h-9 font-bold shadow-sm transition-all">
                {t("goToEbooks")}
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      <Card className="rounded-xl border shadow-sm overflow-hidden bg-card">
          <CardHeader className="p-5 pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Sparkles size={16} />
                </div>
                <CardTitle className="text-base font-bold">{t("recommended")}</CardTitle>
              </div>
              <Link href={`/${locale}/catalog`}>
                <Button variant="ghost" size="sm" className="text-primary font-bold text-xs hover:bg-primary/5 rounded-lg h-8 px-2">
                  {t("viewAll")}
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none snap-x [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="min-w-[140px] snap-start group cursor-pointer">
                  <div className="aspect-[3/4] rounded-lg bg-muted overflow-hidden relative mb-2 shadow-sm border border-border/50 group-hover:shadow-md transition-shadow">
                    <img 
                      src={`https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&q=80&sig=${i}`} 
                      alt="Book Cover" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <h4 className="font-bold text-sm line-clamp-1 group-hover:text-primary transition-colors">The Midnight Library</h4>
                  <p className="text-xs font-bold text-muted-foreground mt-0.5">Matt Haig</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
    </div>
  );
}
