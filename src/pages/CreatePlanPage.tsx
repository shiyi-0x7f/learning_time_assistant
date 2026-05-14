import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { differenceInDays, parseISO, addDays, getDay, isBefore } from 'date-fns';
import { usePlans } from '@/lib/store';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Calculator, ArrowLeft } from 'lucide-react';
import { Plan, Topic } from '@/lib/types';

const WEEKDAYS = [
  { id: 1, label: '一' },
  { id: 2, label: '二' },
  { id: 3, label: '三' },
  { id: 4, label: '四' },
  { id: 5, label: '五' },
  { id: 6, label: '六' },
  { id: 0, label: '日' },
];

export function CreatePlanPage() {
  const navigate = useNavigate();
  const { addPlan } = usePlans();

  const [subject, setSubject] = useState('数学');
  const [grade, setGrade] = useState('初二');
  const [term, setTerm] = useState('下学期');
  const [totalTopics, setTotalTopics] = useState(48);
  const [dailyTime, setDailyTime] = useState(30);
  
  // Set default dates
  const today = new Date();
  const defaultEnd = addDays(today, 60);
  const [startDate, setStartDate] = useState(today.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(defaultEnd.toISOString().split('T')[0]);
  const [restDays, setRestDays] = useState<number[]>([0]); // Default rest on Sunday

  const toggleRestDay = (dayIndex: number) => {
    setRestDays(prev => 
      prev.includes(dayIndex) 
        ? prev.filter(d => d !== dayIndex) 
        : [...prev, dayIndex]
    );
  };

  // Calculation Logic
  const calcResults = useMemo(() => {
    try {
      const start = parseISO(startDate);
      const end = parseISO(endDate);
      
      if (isBefore(end, start)) return null;

      let validDays = 0;
      let bufferDays = 0;
      let totalDays = differenceInDays(end, start) + 1;

      for (let i = 0; i < totalDays; i++) {
        const currentDate = addDays(start, i);
        if (!restDays.includes(getDay(currentDate))) {
          validDays++;
        }
      }

      const dailyCount = validDays > 0 ? Math.ceil(totalTopics / validDays) : 0;
      const actualDaysNeeded = dailyCount > 0 ? Math.ceil(totalTopics / dailyCount) : 0;
      bufferDays = validDays - actualDaysNeeded;

      return { totalDays, validDays, dailyCount, actualDaysNeeded, bufferDays };
    } catch (e) {
      return null;
    }
  }, [startDate, endDate, restDays, totalTopics]);

  const [hasTemplate, setHasTemplate] = useState(false);
  const [templateTopics, setTemplateTopics] = useState<string[]>([]);

  const templates = [
    { 
      label: '初一上数学',
      subject: '数学',
      grade: '初一',
      term: '上学期',
      topics: [
        '正数和负数', '有理数', '数轴', '相反数', '绝对值', 
        '有理数的加法', '有理数的减法', '有理数的乘法', '有理数的除法', '乘方', '科学记数法',
        '用字母表示数', '单项式', '多项式', '同类项', '合并同类项', '去括号',
        '一元一次方程', '等式的性质', '解方程(一)', '解方程(二)', '实际问题与方程式',
        '几何图形初步', '直线、射线、线段', '角', '角的比较与运算', '余角和补角'
      ] 
    },
    { 
      label: '初一下数学',
      subject: '数学',
      grade: '初一',
      term: '下学期',
      topics: [
        '相交线', '垂线', '平行线及其判定', '平行线的性质', '平移',
        '实数', '平方根', '立方根', 
        '平面直角坐标系', '坐标方法的简单应用',
        '二元一次方程组', '代入消元法', '加减消元法', '实际应用',
        '不等式', '一元一次不等式', '一元一次不等式组',
        '全面调查与抽样调查', '直方图'
      ] 
    },
    { 
      label: '初二下数学',
      subject: '数学',
      grade: '初二',
      term: '下学期',
      topics: [
        '二次根式', '乘除法', '加减法', 
        '勾股定理', '勾股定理逆定理', 
        '平行四边形', '矩形', '菱形', '正方形', 
        '变量与函数', '正比例函数', '一次函数', '函数方程不等式', 
        '数据分析'
      ] 
    },
    { 
      label: '初二下英语',
      subject: '英语',
      grade: '初二',
      term: '下学期',
      topics: ['Unit 1', 'Unit 2', 'Unit 3', 'Unit 4', 'Unit 5', 'Unit 6', 'Unit 7', 'Unit 8', 'Unit 9', 'Unit 10'] 
    }
  ];

  const applyTemplate = (t: typeof templates[0]) => {
    setSubject(t.subject);
    setGrade(t.grade);
    setTerm(t.term);
    setTotalTopics(t.topics.length);
    setHasTemplate(true);
    setTemplateTopics(t.topics);
  };

  const handleCreate = () => {
    if (!calcResults || calcResults.validDays <= 0) return;

    const start = parseISO(startDate);
    const topics: Topic[] = [];
    let currentTopicIndex = 1;
    let daysIterated = 0;
    
    // Generate Topics
    while (currentTopicIndex <= totalTopics) {
      const currentDate = addDays(start, daysIterated);
      // Skip rest days
      if (!restDays.includes(getDay(currentDate))) {
        // Assign topics for this day
        let assignedToday = 0;
        while (assignedToday < calcResults.dailyCount && currentTopicIndex <= totalTopics) {
          topics.push({
            id: uuidv4(),
            title: hasTemplate && templateTopics[currentTopicIndex - 1] 
              ? templateTopics[currentTopicIndex - 1] 
              : `知识点 ${currentTopicIndex}`,
            assignedDate: currentDate.toISOString().split('T')[0],
            status: 'pending'
          });
          currentTopicIndex++;
          assignedToday++;
        }
      }
      daysIterated++;
    }

    const newPlan: Plan = {
      id: uuidv4(),
      subject,
      grade,
      term,
      totalTopics,
      dailyTime,
      startDate,
      endDate,
      restDays,
      status: 'active',
      createdAt: new Date().toISOString(),
      topics
    };

    addPlan(newPlan);
    navigate('/');
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 pb-20">
      <header className="bg-white px-8 py-5 flex items-center gap-3 sticky top-0 z-10 border-b border-slate-200">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-lg hover:bg-slate-100 active:bg-slate-200 transition-colors">
          <ArrowLeft size={20} className="text-slate-700" />
        </button>
        <h1 className="text-[17px] font-bold text-slate-900 tracking-tight">创建专属学习计划</h1>
      </header>

      <div className="p-6 space-y-6">
        <Card>
          <CardContent className="p-6 space-y-5">
            <div className="flex gap-4">
              <div className="flex-1">
                <Label>学科</Label>
                <Input value={subject} onChange={e => setSubject(e.target.value)} />
              </div>
              <div className="flex-1">
                <Label>年级</Label>
                <Input value={grade} onChange={e => setGrade(e.target.value)} />
              </div>
              <div className="flex-1">
                <Label>学期</Label>
                <Input value={term} onChange={e => setTerm(e.target.value)} />
              </div>
            </div>

            <div>
              <Label className="text-gray-400 text-xs uppercase">快速填充模板</Label>
              <div className="flex gap-2 pt-1 pb-2 overflow-x-auto hide-scrollbar">
                {templates.map(t => (
                  <Button 
                    key={t.label} 
                    variant="soft" 
                    size="sm" 
                    onClick={() => applyTemplate(t)}
                    className="whitespace-nowrap shrink-0"
                  >
                    {t.label} ({t.topics.length})
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <Label>知识点数量</Label>
                <Input type="number" value={totalTopics} onChange={e => setTotalTopics(Number(e.target.value) || 0)} />
              </div>
              <div className="flex-1">
                <Label>每日时长(分钟)</Label>
                <Input type="number" value={dailyTime} onChange={e => setDailyTime(Number(e.target.value) || 0)} />
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <Label>开始日期</Label>
                <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
              </div>
              <div className="flex-1">
                <Label>截止日期</Label>
                <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
              </div>
            </div>

            <div>
              <Label>每周休息日</Label>
              <div className="flex justify-between mt-2">
                {WEEKDAYS.map(day => {
                  const isRest = restDays.includes(day.id);
                  return (
                    <button
                      key={day.id}
                      onClick={() => toggleRestDay(day.id)}
                      className={`w-10 h-10 rounded-full font-medium text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500
                        ${isRest 
                          ? 'bg-slate-100 text-slate-500 shadow-inner' 
                          : 'bg-blue-50 text-blue-700 border border-blue-100 hover:bg-blue-100'}`}
                    >
                      {day.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {calcResults && calcResults.validDays > 0 ? (
          <Card className="bg-blue-600 text-white border-0 overflow-hidden relative shadow-lg shadow-blue-200">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Calculator size={100} strokeWidth={1} />
            </div>
            <CardContent className="p-6 relative z-10 w-full">
              <h3 className="text-blue-100 font-bold tracking-tight mb-4 flex items-center gap-2">
                <Calculator size={18} />
                智能计算结果
              </h3>
              
              <div className="grid grid-cols-2 gap-y-6 gap-x-4 mb-4">
                <div>
                  <div className="text-blue-200 text-[10px] uppercase tracking-wider mb-1 font-bold">总可用天数</div>
                  <div className="text-2xl font-bold font-mono">{calcResults.validDays} <span className="text-blue-300 text-sm font-sans font-medium">天</span></div>
                </div>
                <div>
                  <div className="text-blue-200 text-[10px] uppercase tracking-wider mb-1 font-bold">每日需学</div>
                  <div className="text-2xl font-bold font-mono">{calcResults.dailyCount} <span className="text-blue-300 text-sm font-sans font-medium">个知识点</span></div>
                </div>
                <div>
                  <div className="text-blue-200 text-[10px] uppercase tracking-wider mb-1 font-bold">预计完成</div>
                  <div className="text-2xl font-bold font-mono">{calcResults.actualDaysNeeded} <span className="text-blue-300 text-sm font-sans font-medium">天</span></div>
                </div>
                <div>
                  <div className="text-blue-200 text-[10px] uppercase tracking-wider mb-1 font-bold">剩余缓冲期</div>
                  <div className="text-2xl font-bold font-mono">{calcResults.bufferDays} <span className="text-blue-300 text-sm font-sans font-medium">天</span></div>
                </div>
              </div>

              {calcResults.bufferDays < 0 && (
                <div className="bg-rose-500/20 text-rose-100 px-3 py-2 rounded-xl text-xs mt-2 border border-rose-500/30 font-medium">
                  提示：当前设定强度过大，时间不足以复习所有知识点。建议增加天数或减少知识点。
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="text-center p-6 text-slate-500 text-sm">
            请确保起始日期早于截止日期，且中间包含可学习的天数。
          </div>
        )}

        <div className="pt-2">
          <Button 
            size="lg" 
            className="w-full shadow-md" 
            onClick={handleCreate}
            disabled={!calcResults || calcResults.validDays <= 0}
          >
            一键生成计划
          </Button>
        </div>
      </div>
    </div>
  );
}
