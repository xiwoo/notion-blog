
import { BetaAnalyticsDataClient } from '@google-analytics/data';

// 환경 변수에서 GA4 속성 ID와 서비스 계정 자격 증명을 가져옵니다.
// GA4_PROPERTY_ID는 숫자 형식의 속성 ID여야 합니다.
const propertyId = process.env.GA4_PROPERTY_ID;
// GOOGLE_APPLICATION_CREDENTIALS_JSON은 서비스 계정 키 JSON 문자열입니다.
// 파싱 오류를 방지하기 위해 기본값으로 빈 객체를 제공합니다.
const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON || '{}');

// Google Analytics Data API 클라이언트 초기화
const analyticsDataClient = new BetaAnalyticsDataClient({
  credentials,
});

// 날짜를 'YYYY-MM-DD' 형식으로 포맷하는 헬퍼 함수
function getFormattedDate(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// 어제 날짜를 'YYYY-MM-DD' 형식으로 가져오는 헬퍼 함수
function getYesterdayDate(): string {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1); // 오늘 날짜에서 하루를 뺍니다.
  return getFormattedDate(yesterday);
}

// Analytics Data API 보고서를 실행하는 헬퍼 함수
async function runAnalyticsReport(
  dateRanges: Array<{ startDate: string; endDate: string }>,
  metrics: Array<{ name: string }>,
  dimensions: Array<{ name: string }> = [] // dimensions는 선택 사항
) {
  if (!propertyId) {
    throw new Error('GA4_PROPERTY_ID 환경 변수가 설정되지 않았습니다.');
  }
  const [response] = await analyticsDataClient.runReport({
    property: `properties/${propertyId}`,
    dateRanges,
    metrics,
    dimensions,
  });
  return response;
}
async function runRealtimeAnalyticsReport(
   metrics: Array<{ name: string }>,
   dimensions: Array<{ name: string }> = [],
   minutesAgo: number = 29 // 기본값: 지난 30분
) {
   if (!propertyId) {
      throw new Error('GA4_PROPERTY_ID 환경 변수가 설정되지 않았습니다.');
   }
   const [response] = await analyticsDataClient.runRealtimeReport({
      property: `properties/${propertyId}`,
      metrics,
      dimensions,
      minuteRanges: [{ startMinutesAgo: minutesAgo, endMinutesAgo: 0 }], // 지난 'minutesAgo'분부터 현재까지
   });
   return response;
}

export async function getAnalyticsData() {
  try {
    const todayFormatted = getFormattedDate(new Date());
    const yesterdayFormatted = getYesterdayDate();

    // Promise.all을 사용하여 total, today, realtime, yesterday 데이터를 병렬로 조회합니다.
    const [totalResponse, todayResponse, realtimeResponse, yesterdayResponse] = await Promise.all([
      // 1. 전체 페이지 뷰 (Total) 조회: GA4 속성 생성 시점부터 오늘까지의 총 페이지 뷰
      runAnalyticsReport(
        [{ startDate: '2020-01-01', endDate: todayFormatted }], // GA4가 시작된 대략적인 시점부터
        [{ name: 'screenPageViews' }] // 페이지 뷰 측정항목
      ),
      // 2. 오늘 페이지 뷰 (Today) 조회: 오늘 하루의 페이지 뷰
      runAnalyticsReport(
        [{ startDate: todayFormatted, endDate: todayFormatted }],
        [{ name: 'screenPageViews' }]
      ),
      // 3. 현재 페이지 뷰 (Realtime) 조회: 현재(30분 기준) 페이지 뷰
      runRealtimeAnalyticsReport(
        [{ name: 'screenPageViews' }]
      ),
      // 4. 어제 페이지 뷰 (Yesterday) 조회: 어제 하루의 페이지 뷰
      runAnalyticsReport(
        [{ startDate: yesterdayFormatted, endDate: yesterdayFormatted }],
        [{ name: 'screenPageViews' }]
      ),
    ]);

    // 각 응답에서 페이지 뷰 값을 추출합니다.
    // 데이터가 없을 경우 '0'으로 기본값을 설정합니다.
    const totalViews = totalResponse.rows?.[0]?.metricValues?.[0]?.value || '0';
    const todayViews = todayResponse.rows?.[0]?.metricValues?.[0]?.value || '0';
    const realtimeViews = realtimeResponse.rows?.[0]?.metricValues?.[0]?.value || '0';
    const yesterdayViews = yesterdayResponse.rows?.[0]?.metricValues?.[0]?.value || '0';

    return {
      total: totalViews,
      today: todayViews,
      realtime: realtimeViews,
      yesterday: yesterdayViews,
    };
  } catch (error) {
    console.error('GA4 데이터 조회 중 오류 발생:', error);
    // 오류 발생 시 null을 반환하여 UI에서 처리할 수 있도록 합니다.
    return null;
  }
}
