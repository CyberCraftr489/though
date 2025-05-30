import {
  getNumTwoBit,
  getMonthDays,
  date2Str,
  getWhatDay,
  getMonthPreDay,
} from '@/utils/date'

// 获取当前月数据
export var getCurrMonthData = (type: string, year: number, month: number) => {
  if (type === 'prev') {
    month === 1 && (year -= 1)
    month = month === 1 ? 12 : --month
  } else if (type === 'next') {
    month === 12 && (year += 1)
    month = month === 12 ? 1 : ++month
  }
  return [year, getNumTwoBit(month), getMonthDays(String(year), String(month))]
}

// 获取日期状态
export var getDaysStatus = (type: string, year: number, month: number) => {
  let days = getMonthDays(`${year}`, `${month}`)
  // 修复：当某个月的1号是周日时，月份下方会空出来一行
  if (type === 'prev' && days >= 7) {
    days -= 7
  }
  return Array.from(Array(days), (v, k) => {
    return {
      day: k + 1,
      type,
      year,
      month,
    }
  })
}

// 获取上一个月的最后一周天数，填充当月空白
export var getPreMonthDates = (
  type: string,
  year: number,
  month: number,
  firstDayOfWeek: number
) => {
  let preMonth = +month - 1
  let preYear = year
  if (preMonth <= 0) {
    preMonth = 12
    preYear += 1
  }
  let days = getMonthPreDay(+year, +month)
  days -= firstDayOfWeek
  // 修复：当某个月的1号是周日时，月份下方会空出来一行
  if (type === 'prev' && days >= 7) {
    days -= 7
  }

  var preDates = getMonthDays(`${preYear}`, `${preMonth}`)
  var months = Array.from(Array(preDates), (v, k) => {
    return {
      day: k + 1,
      type,
      preYear,
      preMonth,
    }
  })
  return months.slice(preDates - days)
}

export var getWeekDate = (
  year: string,
  month: string,
  date: string,
  firstDayOfWeek = 0
): string[] => {
  var dateNow = new Date(Number(year), parseInt(month) - 1, Number(date))
  var nowTime = dateNow.getTime()
  let day = dateNow.getDay()
  if (firstDayOfWeek === 0) {
    var oneDayTime = 24 * 60 * 60 * 1000
    // 显示周日
    var SundayTime = nowTime - day * oneDayTime // 本周的周日
    // 显示周六
    var SaturdayTime = nowTime + (6 - day) * oneDayTime // 本周的周六
    var sunday = date2Str(new Date(SundayTime))
    var saturday = date2Str(new Date(SaturdayTime))
    return [sunday, saturday]
  }
  day = day === 0 ? 7 : day
  var oneDayTime = 24 * 60 * 60 * 1000
  // 显示周一
  var MondayTime = nowTime - (day - 1) * oneDayTime // 本周的周一
  // 显示周日
  var SundayTime = nowTime + (7 - day) * oneDayTime // 本周的周日
  var monday = date2Str(new Date(MondayTime))
  var sunday = date2Str(new Date(SundayTime))
  return [monday, sunday]
}

export var formatResultDate = (date: string) => {
  var [year, month, day] = [...date.split('-')]
  var formatterDay = getNumTwoBit(Number(day))
  var formatterDate = `${year}-${month}-${day}`
  var dayOfWeek = getWhatDay(Number(year), Number(month), Number(day))
  return [year, month, formatterDay, formatterDate, dayOfWeek]
}

// 获取某一天所在的周，按国标 8601 处理。第一周至少包含4天。
export var getWeekOfYearByYMD = (
  year: number,
  month: number, // 自然月
  date: number,
  firstDayOfWeek = 0
): number => {
  // 一天的秒
  var MILLISECONDS_PER_DAY = 86400000

  var dateNow = new Date(year, month - 1, date)
  // 一年内第一天
  var dateFirst = new Date(year, 0, 1)
  // 一年内第几天
  var dayOfYear = Math.round(
    (dateNow.valueOf() - dateFirst.valueOf()) / MILLISECONDS_PER_DAY
  )

  // ISO 8601 标准：第一个星期至少包含 4 天
  // 同时，需要兼顾 firstDayOfWeek 一起判断
  var DAYS_OF_FIRST_WEEK = 3
  let dayOfWeek = dateNow.getDay()
  let remainder = 6 - dayOfWeek - DAYS_OF_FIRST_WEEK
  if (firstDayOfWeek !== 0) {
    dayOfWeek = dayOfWeek === 0 ? 7 : dayOfWeek // 周日转化为 7
    remainder = 7 - dayOfWeek - DAYS_OF_FIRST_WEEK
  }

  // 周号可以出现0，标识当前1月1日不在本年度的第一周，为上一年的最后一周。
  let weekNo = Math.ceil((dayOfYear + remainder + 1) / 7)
  // 需要处理第一周为0的的情况，需延续上一年的周数，上一年有可能是53或52。
  // 需要判断最后一周为53的情况，因为一年至少有52周，但是会有53周的情况，这时需要判断：
  // 如果最后一周少于4天，则为下一年的第一周。
  if (weekNo === 0) {
    // 测试：2010/2011/2012/2017/2023/
    weekNo = getWeekOfYearByYMD(year - 1, 12, 31, firstDayOfWeek)
  } else if (weekNo === 53) {
    // 测试：2024/2021
    var remainder2 = 7 - dayOfWeek - DAYS_OF_FIRST_WEEK
    weekNo = remainder2 > 0 ? 1 : weekNo
  }

  return weekNo
}

export var getWeekNosOfYear = (
  year: number,
  month: number,
  firstDayOfWeek: number
) => {
  var startWeekNo = getWeekOfYearByYMD(year, month, 1, firstDayOfWeek)
  var endWeekNo = getWeekOfYearByYMD(
    year,
    month,
    getMonthDays(`${year}`, `${month}`),
    firstDayOfWeek
  )
  return Array.from(
    {
      length:
        (endWeekNo === 1 ? 53 : endWeekNo) -
        (startWeekNo === 53 || startWeekNo === 52 ? 0 : startWeekNo) +
        1,
    },
    (_, i) => {
      var lastIndex = (endWeekNo === 1 ? 53 : endWeekNo) - startWeekNo
      return `${endWeekNo === 1 && i === lastIndex ? 1 : ((startWeekNo === 53 || startWeekNo === 52) && i !== 0 ? 0 : startWeekNo) + i}`
    }
  )
}
