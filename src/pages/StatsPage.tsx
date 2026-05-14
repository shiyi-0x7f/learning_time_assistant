import { usePlans } from '@/lib/store';
import { Card, CardContent } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Zap, Target, BookCheck } from 'lucide-react';
import { differenceInDays, parseISO } from 'date-fns';

export function StatsPage() {
  const { plans, isLoaded } = usePlans();

  if (!isLoaded) return null;

  const totalTopics = plans.reduce((acc, plan) => acc + plan.topics.length, 0);
  const completedTopics = plans.reduce((acc, plan) => acc + plan.topics.filter(t => t.status === 'completed').length, 0);
  const pendingTopics = totalTopics - completedTopics;

  // Calculate consecutive days
  const completedDates = new Set<string>();
  plans.forEach(plan => {
    plan.topics.forEach(topic => {
      if (topic.status === 'completed') {
         completedDates.add(topic.assignedDate);
      }
    });
  });

  const sortedDates = Array.from(completedDates)
    .map(dateStr => parseISO(dateStr))
    .sort((a, b) => a.getTime() - b.getTime());

  let maxConsecutive = 0;
  let currentConsecutive = 0;

  for (let i = 0; i < sortedDates.length; i++) {
     if (i === 0) {
        currentConsecutive = 1;
     } else {
        const diff = differenceInDays(sortedDates[i], sortedDates[i-1]);
        if (diff === 1) {
           currentConsecutive++;
        } else if (diff > 1) {
           currentConsecutive = 1;
        }
     }
     if (currentConsecutive > maxConsecutive) {
        maxConsecutive = currentConsecutive;
     }
  }

  const activePlans = plans.filter(p => p.status === 'active').length;

  const chartData = [
    { name: '已完成', value: completedTopics },
    { name: '未完成', value: pendingTopics > 0 ? pendingTopics : 1 }, // prevent blank chart if total 0
  ];
  const COLORS = ['#3b82f6', '#f1f5f9'];

  const percent = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 pb-20">
      <header className="bg-white px-8 pt-12 pb-6 sticky top-0 z-10 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">学习统计</h1>
        <p className="text-slate-500 text-sm mt-1">你的努力都有痕迹</p>
      </header>

      <div className="p-6 space-y-6">
        {/* Main Stat Ring */}
        <Card className="overflow-hidden relative bg-white border border-slate-200">
          <CardContent className="p-8 flex flex-col items-center justify-center">
            <div className="w-48 h-48 relative cursor-pointer active:scale-95 transition-transform">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                    cornerRadius={10}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val: number) => val} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-4xl font-bold text-slate-900 tabular-nums tracking-tighter">{percent}%</span>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mt-1">总完成率</span>
              </div>
            </div>
            
            <div className="flex gap-8 mt-6 w-full justify-center">
              <div className="text-center p-3 bg-slate-50 rounded-2xl w-24 border border-slate-100">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">已完成</div>
                <div className="text-xl font-bold text-slate-900">{completedTopics}</div>
              </div>
              <div className="text-center p-3 bg-slate-50 rounded-2xl w-24 border border-slate-100">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">未完成</div>
                <div className="text-xl font-bold text-slate-900">{pendingTopics}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Small Data Cards */}
        <Card className="border-blue-100 bg-blue-50 relative overflow-hidden shadow-none">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-sm">
                <Zap size={16} className="fill-white" />
              </div>
              <span className="font-bold text-blue-900 text-sm">最高连续学习</span>
            </div>
            <div className="text-3xl font-bold text-blue-950 tracking-tight">{maxConsecutive} <span className="text-xl">天</span></div>
            <p className="text-blue-700/80 text-xs mt-1">
              {maxConsecutive > 0 ? `你曾经连续坚持学习了 ${maxConsecutive} 天，继续保持！` : '还没有完成任何学习目标，今天就开始吧！'}
            </p>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
