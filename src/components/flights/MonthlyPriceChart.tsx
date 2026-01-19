import { useMemo } from "react";
import { motion } from "framer-motion";
import { Loader2, TrendingDown } from "lucide-react";
import { MonthlyPrice } from "@/hooks/useFlightMonthly";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface MonthlyPriceChartProps {
  monthly: MonthlyPrice[];
  cheapestMonth: MonthlyPrice | null;
  isLoading: boolean;
  onMonthClick: (month: string) => void;
}

const MONTHS_SHORT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

export function MonthlyPriceChart({
  monthly,
  cheapestMonth,
  isLoading,
  onMonthClick,
}: MonthlyPriceChartProps) {
  const chartData = useMemo(() => {
    return monthly.map((item) => {
      const [year, month] = item.month.split('-');
      const monthIndex = parseInt(month) - 1;
      return {
        ...item,
        name: MONTHS_SHORT[monthIndex],
        fullName: `${MONTHS_SHORT[monthIndex]} ${year}`,
        isCheapest: cheapestMonth?.month === item.month,
      };
    });
  }, [monthly, cheapestMonth]);

  const formatPrice = (value: number) => {
    if (value >= 1000) {
      return `R$${(value / 1000).toFixed(1)}k`;
    }
    return `R$${value}`;
  };

  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (monthly.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-2xl p-4 md:p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Melhores Meses para Viajar</h3>
        {cheapestMonth && (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <TrendingDown className="h-4 w-4" />
            <span>
              <span className="font-medium">
                {MONTHS_SHORT[parseInt(cheapestMonth.month.split('-')[1]) - 1]}
              </span>
              {' '}é mais barato
            </span>
          </div>
        )}
      </div>

      <div className="h-[200px] md:h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
          >
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tickFormatter={formatPrice}
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={60}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
                      <p className="font-semibold">{data.fullName}</p>
                      <p className="text-lg font-bold text-primary">
                        R$ {data.price.toLocaleString('pt-BR')}
                      </p>
                      <p className="text-sm text-muted-foreground">{data.airline}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar
              dataKey="price"
              radius={[4, 4, 0, 0]}
              cursor="pointer"
              onClick={(data) => onMonthClick(data.month)}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.isCheapest ? 'hsl(var(--chart-2))' : 'hsl(var(--primary))'}
                  fillOpacity={entry.isCheapest ? 1 : 0.7}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <p className="text-xs text-center text-muted-foreground mt-2">
        Clique em uma barra para ver o calendário do mês
      </p>
    </motion.div>
  );
}
