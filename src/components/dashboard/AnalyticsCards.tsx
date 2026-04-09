"use client";

import { Card, CardContent } from "@/components/ui/Card";
import { CountUp } from "@/components/ui/CountUp";
import {
  Users,
  CalendarDays,
  UserCheck,
  CheckCircle,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface AnalyticsCardsProps {
  totalBookings: number;
  completedBookings: number;
  totalRevenue: number;
  recentRevenue: number;
  uniqueClients?: number;
  newPatientsLast30?: number;
  honorationRate?: number;
  isMedical?: boolean;
}

export function AnalyticsCards({
  totalBookings,
  completedBookings,
  totalRevenue,
  recentRevenue,
  uniqueClients = 0,
  newPatientsLast30 = 0,
  honorationRate = 100,
  isMedical = false,
}: AnalyticsCardsProps) {
  if (isMedical) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 stagger-children">
        <Card className="rounded-2xl border-0 shadow-sm card-hover">
          <CardContent className="py-5 text-center">
            <Users className="h-6 w-6 text-emerald-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-[#0C1B2A] dark:text-white">
              <CountUp end={uniqueClients} duration={2000} />
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Patients</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-0 shadow-sm card-hover">
          <CardContent className="py-5 text-center">
            <CalendarDays className="h-6 w-6 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-[#0C1B2A] dark:text-white">
              <CountUp end={completedBookings} duration={2000} />
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Consultations effectuées
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-0 shadow-sm card-hover">
          <CardContent className="py-5 text-center">
            <CheckCircle className="h-6 w-6 text-emerald-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-emerald-600">
              <CountUp end={honorationRate} duration={2000} suffix="%" />
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Taux d&apos;honoration
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-0 shadow-sm card-hover">
          <CardContent className="py-5 text-center">
            <UserCheck className="h-6 w-6 text-violet-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-violet-600">
              <CountUp end={newPatientsLast30} duration={2000} />
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Nouveaux patients (30j)
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 stagger-children">
      <Card className="rounded-2xl border-0 shadow-sm card-hover">
        <CardContent className="py-5 text-center">
          <p className="text-2xl font-bold text-[#0C1B2A] dark:text-white">
            <CountUp end={totalBookings} duration={2000} />
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total RDV</p>
        </CardContent>
      </Card>
      <Card className="rounded-2xl border-0 shadow-sm card-hover">
        <CardContent className="py-5 text-center">
          <p className="text-2xl font-bold text-[#0C1B2A] dark:text-white">
            <CountUp end={completedBookings} duration={2000} />
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Terminés</p>
        </CardContent>
      </Card>
      <Card className="rounded-2xl border-0 shadow-sm card-hover">
        <CardContent className="py-5 text-center">
          <p className="text-2xl font-bold bg-gradient-to-r from-[#0066FF] to-[#00B4D8] bg-clip-text text-transparent">
            {formatPrice(totalRevenue)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Revenu total</p>
        </CardContent>
      </Card>
      <Card className="rounded-2xl border-0 shadow-sm card-hover">
        <CardContent className="py-5 text-center">
          <p className="text-2xl font-bold text-emerald-600">
            {formatPrice(recentRevenue)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">30 derniers jours</p>
        </CardContent>
      </Card>
    </div>
  );
}
