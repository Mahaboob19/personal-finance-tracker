import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency, getMonthName } from "../../utils/formatters.js";

const COLORS = [
  "#6366f1", // Indigo
  "#ec4899", // Pink
  "#f59e0b", // Amber
  "#10b981", // Emerald
  "#06b6d4", // Cyan
  "#8b5cf6", // Purple
  "#f43f5e", // Rose
  "#64748b", // Slate
];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 rounded-xl shadow-lg border border-slate-100 text-xs space-y-1">
        <p className="font-bold text-slate-800">{data.category}</p>
        <p className="text-slate-600 font-semibold">{formatCurrency(data.total)}</p>
        <p className="text-slate-400">{data.percentage}% of total expenses</p>
      </div>
    );
  }
  return null;
};

const CategoryPieChart = ({
  data,
  month,
  year,
  onMonthChange,
  onYearChange,
}) => {
  const hasData = data && data.length > 0;

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Expenses by Category</h2>
            <p className="text-xs text-slate-500">Breakdown of spending allocation</p>
          </div>
          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            <select
              value={month}
              onChange={(e) => onMonthChange(parseInt(e.target.value, 10))}
              className="bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 px-2.5 py-1.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              {[...Array(12)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {getMonthName(i + 1)}
                </option>
              ))}
            </select>
            <select
              value={year}
              onChange={(e) => onYearChange(parseInt(e.target.value, 10))}
              className="bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 px-2 py-1.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              {[2024, 2025, 2026, 2027].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        {hasData ? (
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="total"
                  nameKey="category"
                >
                  {data.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                      stroke="#ffffff"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-60 flex flex-col items-center justify-center text-center p-4">
            <p className="text-3xl mb-2">🏷️</p>
            <p className="text-sm font-semibold text-slate-600">No expense records</p>
            <p className="text-xs text-slate-400 mt-1 max-w-[200px]">
              No expenses recorded for {getMonthName(month)} {year}
            </p>
          </div>
        )}
      </div>

      {/* Category Pills Legend */}
      {hasData && (
        <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-50 max-h-24 overflow-y-auto">
          {data.map((item, index) => (
            <div
              key={item.category}
              className="flex items-center gap-1.5 text-xs bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100"
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="font-medium text-slate-700 truncate max-w-[100px]">
                {item.category}
              </span>
              <span className="font-bold text-slate-500">{item.percentage}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryPieChart;
