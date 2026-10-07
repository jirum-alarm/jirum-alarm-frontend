import { BrandProduct } from '@/hooks/graphql/brandProduct';

type Props = {
  activeTab: 'brands' | 'details';
  setActiveTab: (tab: 'brands' | 'details') => void;
  expandedItems: BrandProduct[];
};

// 좌측 탭: 브랜드 아이템 / 상세 상품.
const LeftPanelTabs = ({ activeTab, setActiveTab, expandedItems }: Props) => (
  <div className="border-b border-stroke px-3 py-2 dark:border-strokedark">
    <div className="flex space-x-1">
      <button
        onClick={() => setActiveTab('brands')}
        className={`rounded px-3 py-2 text-xs font-medium transition-colors lg:py-1.5 ${
          activeTab === 'brands'
            ? 'bg-primary text-white'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-meta-4 dark:text-gray-300 dark:hover:bg-meta-3'
        }`}
      >
        브랜드 아이템
      </button>
      <button
        onClick={() => setActiveTab('details')}
        className={`rounded px-3 py-2 text-xs font-medium transition-colors lg:py-1.5 ${
          activeTab === 'details'
            ? 'bg-primary text-white'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-meta-4 dark:text-gray-300 dark:hover:bg-meta-3'
        }`}
      >
        상세 상품 ({expandedItems.length > 0 ? expandedItems.length : '-'})
      </button>
    </div>
  </div>
);

export default LeftPanelTabs;
