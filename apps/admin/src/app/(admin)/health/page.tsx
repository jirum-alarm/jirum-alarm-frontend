import ServiceHealth from './components/ServiceHealth';

const HealthPage = () => (
  <>
    <div className="mb-6">
      <h2 className="text-2xl font-semibold text-black dark:text-white">서비스 점검</h2>
      <p className="mt-1 text-sm text-bodydark2">
        깨지면 확인하고 고칠 것 — 중요도 순(수익 → 크롤러 → …). 색은 실시간, 회색은 알람이 왔을 때
        펼쳐 보는 절차.
      </p>
    </div>
    <ServiceHealth />
  </>
);

export default HealthPage;
