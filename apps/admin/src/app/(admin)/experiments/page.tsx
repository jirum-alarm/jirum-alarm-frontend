import ExperimentList from './components/ExperimentList';

const ExperimentsPage = () => (
  <>
    <div className="mb-6">
      <h2 className="text-2xl font-semibold text-black dark:text-white">실험</h2>
      <p className="mt-1 text-sm text-bodydark2">
        모든 실험과 「배포 뒤 확인할 것」 — 판독일이 지난 것부터. 등록·판독은 서버 레포
        src/experiment/README.md 절차대로.
      </p>
    </div>
    <ExperimentList />
  </>
);

export default ExperimentsPage;
