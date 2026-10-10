import ServiceHealth from './components/ServiceHealth';

const HealthPage = () => (
  <>
    <div className="mb-6">
      <h2 className="text-2xl font-semibold text-black dark:text-white">서비스 점검</h2>
      <p className="mt-1 text-sm text-bodydark2">
        지금 문제인 것만 위에 — 눌러서 확인·고치는 법을 본다.
      </p>
    </div>
    <ServiceHealth />
  </>
);

export default HealthPage;
