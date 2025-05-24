"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X, BookOpen, ClipboardList } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { motion } from "framer-motion";
import { useUserContext } from "@/app/UserEnvProvider";

// 定义API响应的类型
interface CalendarData {
  courses: Course[];
}

interface Course {
  course_name: string;
  sections: Section[];
  assignments: Assignment[];
}

interface Section {
  name: string;
  schedules: string[];
}

interface Assignment {
  name: string;
  deadline: string;
}

// 日历中每天显示的事件类型
interface DayEvent {
  type: 'section' | 'assignment';
  name: string;
  courseName: string;
}

interface CalendarModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CalendarModal({ open, onOpenChange }: CalendarModalProps) {
  const [calendarData, setCalendarData] = useState<CalendarData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<Date[]>([]);
  const [events, setEvents] = useState<Map<string, DayEvent[]>>(new Map());
  const { token } = useUserContext();


  // 每当弹窗打开时获取数据
  useEffect(() => {
    if (open) {
      fetchCalendarData();
    }
  }, [open]);

  // 根据currentDate更新日历视图
  useEffect(() => {
    generateCalendarDays();
  }, [currentDate]);

  // 当日历数据变化时，处理事件
  useEffect(() => {
    if (calendarData) {
      processEvents();
    }
  }, [calendarData]);

  // 获取日历数据
  const fetchCalendarData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(process.env.NEXT_PUBLIC_API_URL + '/courses/calendar', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch calendar data: ${response.status}`);
      }

      const data = await response.json();
      setCalendarData(data);
    } catch (error) {
      console.error('Error fetching calendar data:', error);
      setError('Failed to load calendar data. Please try again later.');

      // 使用模拟数据进行开发测试
      setCalendarData({
        "courses": [
          {
            "sections": [
              {
                "name": "动器都院入实制育极。",
                "schedules": [
                  "2025-05-07 10:00:00"
                ]
              }
            ],
            "course_name": "黄治文",
            "assignments": [
              {
                "name": "沐万佳",
                "deadline": "2024-09-01 23:59:59"
              },
              {
                "name": "禾敏",
                "deadline": "2025-12-27 23:59:59"
              }
            ]
          },
          {
            "sections": [
              {
                "name": "油明细难备广。",
                "schedules": [
                  "2024-05-10 14:00:00",
                  "2024-06-13 09:00:00",
                  "2025-08-14 16:00:00"
                ]
              },
              {
                "name": "九响小水明石去。",
                "schedules": [
                  "2024-08-27 11:00:00"
                ]
              },
              {
                "name": "劳广包整资布。",
                "schedules": [
                  "2025-04-13 13:30:00"
                ]
              }
            ],
            "course_name": "崔娟",
            "assignments": [
              {
                "name": "鄂国秀",
                "deadline": "2025-07-10 23:59:59"
              }
            ]
          }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  // 生成当前月份的日历天数
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // 获取当月第一天
    const firstDay = new Date(year, month, 1);
    // 获取当月最后一天
    const lastDay = new Date(year, month + 1, 0);

    // 确定日历的起始日期（上月末尾几天）
    const startDay = new Date(firstDay);
    startDay.setDate(startDay.getDate() - startDay.getDay());

    // 确定日历的结束日期（下月开始几天）
    const endDay = new Date(lastDay);
    const daysToAdd = 6 - endDay.getDay();
    endDay.setDate(endDay.getDate() + daysToAdd);

    // 生成所有日历天数
    const days: Date[] = [];
    let currentDay = new Date(startDay);

    while (currentDay <= endDay) {
      days.push(new Date(currentDay));
      currentDay.setDate(currentDay.getDate() + 1);
    }

    setCalendarDays(days);
  };

  // 处理课程和作业事件
  const processEvents = () => {
    if (!calendarData) return;

    const newEvents = new Map<string, DayEvent[]>();

    calendarData.courses.forEach(course => {
      // 处理课程安排
      course.sections.forEach(section => {
        section.schedules.forEach(schedule => {
          // schedule现在是字符串，格式为"2025-05-24 10:00:00"
          // 提取日期部分 YYYY-MM-DD
          const dateKey = schedule.split(' ')[0];

          const event: DayEvent = {
            type: 'section',
            name: section.name,
            courseName: course.course_name
          };

          if (newEvents.has(dateKey)) {
            newEvents.get(dateKey)!.push(event);
          } else {
            newEvents.set(dateKey, [event]);
          }
        });
      });

      // 处理作业截止日期
      course.assignments.forEach(assignment => {
        // assignment.deadline现在是字符串，格式为"2025-05-24 10:00:00"
        // 提取日期部分 YYYY-MM-DD
        const dateKey = assignment.deadline.split(' ')[0];

        const event: DayEvent = {
          type: 'assignment',
          name: assignment.name,
          courseName: course.course_name
        };

        if (newEvents.has(dateKey)) {
          newEvents.get(dateKey)!.push(event);
        } else {
          newEvents.set(dateKey, [event]);
        }
      });
    });

    setEvents(newEvents);
  };

  // 切换到上个月
  const prevMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };

  // 切换到下个月
  const nextMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };

  // 获取当天的事件
  const getDayEvents = (day: Date) => {
    // 将日期格式化为与后端相同的格式: YYYY-MM-DD
    const dateStr = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
    return events.get(dateStr) || [];
  };

  // 判断是否是当前月份
  const isCurrentMonth = (day: Date) => {
    return day.getMonth() === currentDate.getMonth();
  };

  // 判断是否是今天
  const isToday = (day: Date) => {
    const today = new Date();
    return day.getDate() === today.getDate() &&
      day.getMonth() === today.getMonth() &&
      day.getFullYear() === today.getFullYear();
  };

  // 渲染日历头部
  const renderHeader = () => {
    const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

    return (
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-xl font-semibold tracking-tight">{monthName}</h3>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentDate(new Date())}
            className="text-xs font-medium px-3 h-7"
          >
            Today
          </Button>
          <div className="flex border rounded bg-card">
            <Button variant="ghost" size="icon" className="rounded-none h-7 w-7 border-r" onClick={prevMonth}>
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-none h-7 w-7" onClick={nextMonth}>
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  // 渲染星期头部
  const renderWeekdays = () => {
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <div className="grid grid-cols-7 text-center border-b">
        {weekdays.map(day => (
          <div key={day} className="py-1.5 text-xs font-medium text-muted-foreground">
            {day}
          </div>
        ))}
      </div>
    );
  };

  // 渲染日历天数
  const renderDays = () => {
    if (loading) {
      return (
        <div className="grid grid-cols-7 border-collapse">
          {Array.from({ length: 35 }).map((_, index) => (
            <Skeleton key={index} className="h-28 border-r border-b last:border-r-0" />
          ))}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-7 border-collapse">
        {calendarDays.map((day, index) => {
          const dayEvents = getDayEvents(day);
          const hasEvents = dayEvents.length > 0;
          const isCurrentDay = isToday(day);
          const isWeekend = day.getDay() === 0 || day.getDay() === 6;
          const isLastInRow = (index + 1) % 7 === 0;

          return (
            <div
              key={day.toISOString()}
              className={`h-28 relative border-r border-b ${isLastInRow ? 'border-r-0' : ''}
                ${isCurrentMonth(day)
                  ? isWeekend ? 'bg-card/80' : 'bg-card'
                  : isWeekend ? 'bg-muted/30' : 'bg-muted/20 text-muted-foreground'} 
                ${isCurrentDay ? 'bg-primary/5' : ''}
                hover:bg-accent/10 transition-colors duration-150`}
            >
              <div className={`p-2
                ${isCurrentDay ? 'after:absolute after:top-0 after:left-0 after:w-full after:h-[2px] after:bg-primary' : ''}`}>
                <span className={`text-sm ${isCurrentDay ? 'font-medium text-primary' : isCurrentMonth(day) ? '' : 'text-muted-foreground'}`}>
                  {day.getDate()}
                </span>
              </div>

              {/* 显示事件 */}
              <div className="p-[3px] pt-0 overflow-hidden">
                {dayEvents.length > 0 && (
                  <div className="flex flex-col gap-1 mt-1 overflow-hidden">
                    {dayEvents.slice(0, 3).map((event, i) => (
                      <Tooltip key={i}>
                        <TooltipTrigger asChild>
                          <div
                            className={`px-1.5 py-0.5 text-xs leading-tight truncate rounded-[2px]
                              ${event.type === 'section'
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200'
                                : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-200'}`}
                          >
                            {event.name.length > 18
                              ? `${event.name.substring(0, 18)}...`
                              : event.name}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" sideOffset={4}>
                          <div className="text-sm font-medium">{event.name}</div>
                          <div className="text-xs text-muted-foreground">{event.courseName}</div>
                        </TooltipContent>
                      </Tooltip>
                    ))}

                    {dayEvents.length > 3 && (
                      <div className="text-xs text-muted-foreground text-center mt-0.5">
                        +{dayEvents.length - 3} more
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // 渲染日历事件列表
  const renderEventsList = () => {
    // 获取当前月份所有事件
    const currentMonthEvents: { date: string; events: DayEvent[] }[] = [];

    events.forEach((eventList, dateKey) => {
      // 创建日期对象，但只用于比较月份和年份
      const dateParts = dateKey.split('-').map(part => parseInt(part, 10));
      // 注意：JavaScript月份是0-11，所以需要减1
      const month = dateParts[1] - 1;
      const year = dateParts[0];

      if (month === currentDate.getMonth() && year === currentDate.getFullYear()) {
        currentMonthEvents.push({
          date: dateKey,
          events: eventList
        });
      }
    });

    // 按日期排序
    currentMonthEvents.sort((a, b) => {
      // 比较YYYY-MM-DD格式的字符串
      return a.date.localeCompare(b.date);
    });

    if (currentMonthEvents.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center p-4 text-muted-foreground h-full">
          <CalendarIcon className="h-8 w-8 mb-2 opacity-30" />
          <p>No events for this month</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <h3 className="text-base font-medium tracking-tight">Events This Month</h3>
        <div className="space-y-3">
          {currentMonthEvents.map(({ date, events }) => {
            // 解析日期部分，仅用于格式化显示
            const dateParts = date.split('-').map(part => parseInt(part, 10));
            // 创建本地日期对象用于格式化
            const displayDate = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);

            // 检查是否是今天（根据年月日判断而非时间戳）
            const today = new Date();
            const isCurrentDay = today.getFullYear() === dateParts[0] &&
              today.getMonth() === dateParts[1] - 1 &&
              today.getDate() === dateParts[2];

            return (
              <div key={date} className="border border-border rounded-md overflow-hidden">
                <div className={`p-2 border-b border-border flex justify-between items-center
                  ${isCurrentDay ? 'bg-primary/10' : 'bg-muted/20'}`}>
                  <span className="font-medium">
                    {displayDate.toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                  {isCurrentDay && <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 font-normal">Today</Badge>}
                </div>
                <div className="divide-y divide-border/50">
                  {events.map((event, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-2.5 text-sm hover:bg-accent/10 transition-colors duration-100"
                    >
                      {event.type === 'section' ? (
                        <BookOpen className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                      ) : (
                        <ClipboardList className="h-3.5 w-3.5 text-red-600 dark:text-red-400 shrink-0" />
                      )}
                      <div className="flex-1 overflow-hidden">
                        <div className="font-medium truncate">{event.name}</div>
                        <div className="text-xs text-muted-foreground">{event.courseName}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[95vw] max-h-[90vh] flex flex-col overflow-hidden p-0 gap-0">
        <div className="flex flex-col h-[90vh] overflow-hidden">
          <div className="p-3 border-b">
            {renderHeader()}
          </div>

          <div className="flex flex-col lg:flex-row overflow-hidden flex-1">
            <div className="flex-1 overflow-hidden flex flex-col">
              {renderWeekdays()}
              <div className="overflow-y-auto flex-1">
                {renderDays()}
              </div>
            </div>

            <div className="w-full lg:w-[320px] border-t lg:border-t-0 lg:border-l p-4 overflow-y-auto">
              {renderEventsList()}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}