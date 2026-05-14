import { useNavigate } from 'react-router-dom';
import { usePlans } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CalendarPlus, BookOpen, CheckCircle, ChevronRight } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export function HomePage() {
  const { plans, isLoaded } = usePlans();
  const navigate = useNavigate();

  if (!isLoaded) return null;

  return (
    <div className="flex flex-col min-h-screen">
      <header className="pt-12 pb-6 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-slate-50 -z-10" />
        <div className="flex items-center gap-3 mb-2 relative z-10">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">学习计划助手</h1>
        </div>
        <p className="text-slate-500 text-sm pl-13">让规划看得见，让坚持看得见</p>
      </header>

      <div className="flex-1 px-6 pb-24">
        {plans.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center mt-10">
            <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 mb-6">
              <CalendarPlus size={40} strokeWidth={1.5} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">还没有学习计划</h3>
            <p className="text-slate-500 text-sm mb-8 px-4">创建你的第一个学习计划，把大目标拆解成每天的小本本</p>
            <Button size="lg" className="w-full max-w-xs shadow-md" onClick={() => navigate('/create')}>
              创建我的计划
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-end">
              <h2 className="text-xl font-bold text-slate-900">我的计划</h2>
              <Button variant="soft" size="sm" onClick={() => navigate('/create')}>+ 新建计划</Button>
            </div>
            
            <div className="grid gap-4">
              {plans.map(plan => {
                const completed = plan.topics.filter(t => t.status === 'completed').length;
                const total = plan.topics.length;
                const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
                
                return (
                  <Card 
                    key={plan.id} 
                    className="cursor-pointer hover:border-slate-300 transition-all active:scale-[0.98]"
                    onClick={() => navigate(`/plan/${plan.id}`)}
                  >
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="inline-block px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-md uppercase tracking-wider mb-2">
                            {plan.grade} · {plan.term}
                          </div>
                          <h3 className="text-lg font-bold text-slate-900">{plan.subject}学习计划</h3>
                          <p className="text-sm text-slate-500 mt-1">
                            {format(parseISO(plan.endDate), 'MMM do', { locale: zhCN })} 截止
                          </p>
                        </div>
                        <div className="w-12 h-12 rounded-full border-[3px] border-slate-100 flex items-center justify-center relative">
                          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 36 36">
                            <path
                              className="text-slate-100"
                              strokeWidth="3"
                              fill="none"
                              stroke="currentColor"
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                            <path
                              className="text-blue-500"
                              strokeDasharray={`${percent}, 100`}
                              strokeWidth="3"
                              strokeLinecap="round"
                              fill="none"
                              stroke="currentColor"
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                          </svg>
                          <span className="text-[10px] font-bold text-slate-700">{percent}%</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm bg-slate-50 rounded-xl p-3 border border-slate-100">
                        <div className="flex items-center gap-2 text-slate-600 font-medium">
                          <CheckCircle size={16} className={completed === total && total > 0 ? "text-blue-500" : "text-slate-400"} />
                          已完成 {completed}/{total}
                        </div>
                        <ChevronRight size={18} className="text-slate-400" />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
