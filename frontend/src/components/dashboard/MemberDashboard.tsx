"use client";

import React from "react";
import { useLocale, useTranslations } from "next-intl";
import { BookOpen, BookMarked, Star, Activity, CalendarCheck, Target as TargetIcon } from "lucide-react";
import Link from "next/link";

// Hooks
import { useDashboardStats, useReadingActivity, useSmartRecommendations } from "@/hooks/useDashboardData";
import { useAuth } from "@/contexts/AuthContext";

// Layout & UI Components
import { DashboardPage } from "@/components/layout/DashboardPage";
import { DashboardSection } from "@/components/layout/DashboardSection";
import { WelcomeHeader } from "@/components/ui/WelcomeHeader";
import { StatCard } from "@/components/ui/StatCard";
import { ChartCard } from "@/components/ui/ChartCard";
import { Button } from "@/components/ui/Button";

// Feature Components
import { RecommendationCarousel } from "@/components/features/books/RecommendationCarousel";
import { DigitalCollectionCard } from "@/components/dashboard/DigitalCollectionCard";

export default function MemberDashboard() {
  const { user } = useAuth();
  const locale = useLocale();
  const t = useTranslations("Dashboard");

  // Data Logic extracted to hooks
  const { stats, borrowings, loading } = useDashboardStats();
  const { chartData, timeRange, setTimeRange, timeRangeOptions } = useReadingActivity(borrowings);
  const { recommendations, loading: recsLoading } = useSmartRecommendations();

  return (
    <DashboardPage hideHeader>
      <DashboardSection layout="full">
        <DashboardSection layout="stat-grid">
          <Link href={`/${locale}/borrowings`}>
            <StatCard
              title={t("currentReads")}
              value={stats.activeBorrowings}
              icon={BookOpen}
              trend={t("status_active")}
              variant="blue"
              loading={loading}
            />
          </Link>
          <Link href={`/${locale}/history`}>
            <StatCard
              title={t("booksRead")}
              value={stats.historyCount}
              icon={BookMarked}
              trend={t("status_completed")}
              variant="emerald"
              loading={loading}
            />
          </Link>
          <Link href={`/${locale}/catalog`}>
            <StatCard
              title={t("readingGoal")}
              value={stats.historyCount}
              target={stats.readingGoal}
              progress={stats.readingGoalProgress}
              icon={TargetIcon}
              variant="amber"
              isGoal
              completedLabel={t("completed")}
              targetLabel={t("target")}
              loading={loading}
            />
          </Link>
          <Link href={`/${locale}/borrowings`}>
            <StatCard
              title={t("dueSoonTitle")}
              value={stats.mustReturnTotal}
              icon={CalendarCheck}
              trend={stats.overdueCount > 0 
                ? `${stats.dueSoonCount} ${t("status_soon")} • ${stats.overdueCount} ${t("status_late")}` 
                : `${stats.dueSoonCount} ${t("status_soon")}`}
              variant="red"
              loading={loading}
            />
          </Link>
        </DashboardSection>

        <DashboardSection layout="chart-sidebar">
          <DashboardSection.Main>
            <ChartCard
              title={t("readingActivity")}
              subtitle={t("activitySubtitle")}
              icon={<Activity size={22} />}
              data={chartData}
              unitLabel={t("books_unit")}
              segments={timeRangeOptions}
              activeSegment={timeRange}
              onSegmentChange={setTimeRange}
            />
          </DashboardSection.Main>

          <DashboardSection.Side>
            <DigitalCollectionCard />
          </DashboardSection.Side>
        </DashboardSection>

        <DashboardSection layout="full">
          <RecommendationCarousel
            title={t("recommended")}
            books={recommendations}
            loading={recsLoading}
            viewAllHref={`/${locale}/catalog`}
            viewAllLabel={t("viewAll")}
            emptyLabel={t("no_recommendations")}
            unknownAuthorLabel={t("unknown_author")}
            localePrefix={`/${locale}`}
          />
        </DashboardSection>
      </DashboardSection>
    </DashboardPage>
  );
}
