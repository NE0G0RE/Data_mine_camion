import { Truck, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { TruckStats } from "@/lib/types";

interface OverviewCardsProps {
  stats: TruckStats;
}

export default function OverviewCards({ stats }: OverviewCardsProps) {
  const cards = [
    {
      title: "Total Camions",
      value: stats.totalTrucks,
      icon: Truck,
      iconBg: "bg-blue-100",
      iconColor: "text-primary",
    },
    {
      title: "Installations OK",
      value: stats.installationsOk,
      icon: CheckCircle,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      textColor: "text-green-600",
    },
    {
      title: "En Attente",
      value: stats.pending,
      icon: Clock,
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
      textColor: "text-orange-600",
    },
    {
      title: "Problèmes",
      value: stats.issues,
      icon: AlertTriangle,
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      textColor: "text-red-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{card.title}</p>
                <p className={`text-2xl font-bold ${card.textColor || "text-gray-900"}`}>
                  {card.value}
                </p>
              </div>
              <div className={`w-12 h-12 ${card.iconBg} rounded-lg flex items-center justify-center`}>
                <card.icon className={`${card.iconColor} text-xl w-6 h-6`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
