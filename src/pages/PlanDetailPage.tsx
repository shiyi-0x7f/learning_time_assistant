import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format, parseISO, isPast, isToday } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { usePlans } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Printer, Trash2, CalendarDays, List, CheckCircle2, Circle } from 'lucide-react';
import { Topic } from '@/lib/types';
import { cn } from '@/lib/utils';

export function PlanDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { plans, updatePlan, deletePlan } = usePlans();
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const plan = plans.find(p => p.id === id);

  const toggleTopicStatus = (topicId: string) => {
    if (!plan) return;
    const updatedTopics = plan.topics.map(t => 
      t.id === topicId ? { ...t, status: t.status === 'completed' ? 'pending' : 'completed' } as Topic : t
    );
    updatePlan({ ...plan, topics: updatedTopics });
  };

  const handleDelete = () => {
    if (id) {
      deletePlan(id);
      navigate('/');
    }
  };

  const groupedTopics = useMemo(() => {
    if (!plan) return [];
    
    // Group by date
    const groups: Record<string, Topic[]> = {};
    plan.topics.forEach(topic => {
      if (!groups[topic.assignedDate]) groups[topic.assignedDate] = [];
      groups[topic.assignedDate].push(topic);
    });

    // Convert to sorted array
    return Object.entries(groups)
      .map(([date, topics]) => ({ date, topics }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [plan]);

  if (!plan) return <div className="p-10 text-center text-gray-500">计划不存在</div>;

  const completedCount = plan.topics.filter(t => t.status === 'completed').length;
  const progress = Math.round((completedCount / plan.topics.length) * 100);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-24 print:bg-white print:pb-0 relative">
      {/* Non-Printable Header */}
      <header className="bg-white px-8 py-5 sticky top-0 z-10 border-b border-slate-200 print:hidden">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-lg hover:bg-slate-100 active:bg-slate-200 transition-colors">
              <ArrowLeft size={20} className="text-slate-700" />
            </button>
            <h1 className="text-[17px] font-bold text-slate-900 tracking-tight line-clamp-1">{plan.subject}计划</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => setShowDeleteConfirm(true)} title="删除计划">
              <Trash2 size={20} />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => window.print()} title="打印计划">
              <Printer size={20} />
            </Button>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            <span>总进度</span>
            <span className="text-blue-600">{progress}%</span>
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 transition-all duration-500 rounded-full" 
              style={{ width: `${progress}%` }} 
            />
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setViewMode('calendar')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-semibold rounded-lg transition-colors",
              viewMode === 'calendar' ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-800"
            )}
          >
            日历视图
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-semibold rounded-lg transition-colors",
              viewMode === 'list' ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-800"
            )}
          >
            列表模式
          </button>
        </div>
      </header>

      {/* Printable Header (Only visible when printing) */}
      <div className="hidden print:block text-center pt-8 pb-6 border-b-2 border-black mb-8">
        <h1 className="text-4xl font-bold font-serif mb-4">{plan.grade}{plan.term} {plan.subject} 学习计划</h1>
        <div className="flex justify-center gap-8 text-black/70">
          <p>每天学习时间: {plan.dailyTime}分钟</p>
          <p>总进度: {completedCount}/{plan.topics.length}</p>
        </div>
      </div>

      <div className="p-6">
        <div className={cn(
          viewMode === 'calendar' ? "space-y-6" : "space-y-4", "print:space-y-4"
        )}>
          {groupedTopics.map((group, index) => {
            const dateObj = parseISO(group.date);
            const _isToday = isToday(dateObj);
            const _isPast = isPast(dateObj) && !_isToday;
            const weekNumber = Math.floor(index / (7 - plan.restDays.length)) + 1;

            return (
              <div 
                key={group.date}
                className={cn(
                  "overflow-hidden break-inside-avoid shadow-none",
                  viewMode === 'calendar' 
                    ? `rounded-2xl border transition-colors ${_isToday ? "border-blue-200 bg-blue-50/30" : _isPast ? "border-slate-100 bg-slate-50 opacity-70" : "border-slate-200 bg-white"}`
                    : "border-b border-slate-100 pb-3",
                  "print:border-0 print:border-b print:border-black/20 print:pb-4 print:rounded-none"
                )}
              >
                <div className={cn(
                  "flex justify-between items-center group/header",
                  viewMode === 'calendar' ? "p-4 border-b border-slate-100/50 print:p-0 print:mb-2 bg-slate-50/30" : "mb-2"
                )}>
                  <div className="flex items-baseline gap-2">
                    <span className={cn(
                      "text-xs font-bold uppercase tracking-widest",
                      _isToday ? "text-blue-600" : "text-slate-500"
                    )}>
                      {_isToday ? "今日 " : ""}{format(dateObj, 'M.d')}
                    </span>
                    <span className="text-xs font-bold text-slate-400 opacity-60">
                      | {format(dateObj, 'EEEE', { locale: zhCN })}
                    </span>
                  </div>
                  {_isToday && viewMode === 'calendar' && (
                    <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-full">进行中</span>
                  )}
                </div>

                <div className={cn(
                   "flex flex-col",
                   viewMode === 'calendar' ? "p-3" : "pl-4",
                   "print:p-0"
                )}>
                  {group.topics.map(topic => {
                    const isCompleted = topic.status === 'completed';
                    return (
                      <button
                        key={topic.id}
                        onClick={() => toggleTopicStatus(topic.id)}
                        className={cn(
                          "flex items-center gap-4 text-left group w-full outline-none transition-all",
                          viewMode === 'calendar' 
                            ? "p-3 rounded-xl hover:bg-slate-50 active:scale-[0.98]" 
                            : "py-2.5 hover:bg-transparent",
                          "print:py-2 print:mx-0 print:hover:none"
                        )}
                      >
                        <div className={cn(
                          "transition-transform active:scale-95 group-hover:bg-slate-100 rounded-full",
                          "print:text-black"
                        )}>
                          {isCompleted ? (
                            <CheckCircle2 size={24} className="text-blue-500 print:text-black" />
                          ) : (
                            <Circle size={24} className="text-slate-300 print:text-black/30" />
                          )}
                        </div>
                        <span className={cn(
                          "text-sm font-bold transition-all flex-1 tracking-tight",
                          isCompleted ? "text-slate-400 line-through decoration-slate-300 decoration-2 font-medium" : "text-slate-800",
                          "print:text-black print:no-underline"
                        )}>
                          {topic.title}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm print:hidden">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-slate-900 mb-2 mt-2">删除计划？</h3>
            <p className="text-slate-500 text-sm mb-6">确定要删除当前的学习计划吗？删除之后将无法恢复进度。</p>
            <div className="flex gap-3 w-full">
              <Button variant="ghost" className="flex-1 bg-slate-100 hover:bg-slate-200" onClick={() => setShowDeleteConfirm(false)}>取消</Button>
              <Button variant="ghost" className="flex-1 bg-red-500 hover:bg-red-600 text-white" onClick={handleDelete}>确认删除</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
