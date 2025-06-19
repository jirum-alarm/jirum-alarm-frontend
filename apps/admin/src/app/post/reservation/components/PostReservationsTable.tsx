'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useInView } from 'react-intersection-observer';

import Switcher from '@/components/Switchers/SwitcherOne';
import { dateFormatter } from '@/utils/date';
import { getParticle } from '@/utils/text';

type Reservation = {
  id: number;
  name: string;
  image: string;
  timestamp: number;
  status: 'reserved' | 'waitting' | 'canceled' | 'completed';
  link?: string;
};

const data: Reservation[] = [
  {
    id: 1,
    name: '6월 첫째주 핫딜 안내',
    image: 'https://via.placeholder.com/150',
    timestamp: Date.now(),
    status: 'waitting',
  },
  {
    id: 2,
    name: '5월 네째주 핫딜 안내',
    image: 'https://via.placeholder.com/150',
    timestamp: Date.now(),
    status: 'reserved',
  },
  {
    id: 3,
    name: '5월 셋째주 핫딜 안내',
    image: 'https://via.placeholder.com/150',
    timestamp: Date.now(),

    status: 'completed',
    link: 'https://instagram.com',
  },
];

export default function PostReservationsTable() {
  const router = useRouter();

  const handleRemoveHotdealKeyword = (id: number, keyword: string) => {
    return (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (confirm(`정말 "${keyword}"${getParticle(keyword)} 삭제하시겠습니까?`)) {
        /* empty */
      }
    };
  };

  const handleChangeOption = (e: React.ChangeEvent<HTMLInputElement>) => {};

  const handleLinkTo = (id: number) => {
    router.push(`/post/reservation/${id}`);
  };

  const { ref: viewRef } = useInView({
    threshold: 0,
    onChange: (inView) => {
      if (!inView) return;
    },
  });

  return (
    <div className="w-full rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <div className="flex w-full items-center justify-end gap-2 p-2">
        <span>준비중</span>
        <Switcher onChange={handleChangeOption} isEnabled={false} />
        <span>예약 완료</span>
      </div>

      <div className="max-w-full overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-2 text-left dark:bg-meta-4">
              <th className="min-w-[150px] px-4 py-4 text-center font-medium text-black dark:text-white xl:pl-11">
                ID
              </th>
              <th className="min-w-[100px] px-4 py-4 text-center font-medium text-black dark:text-white">
                예약 이름
              </th>
              <th className="min-w-[100px] px-4 py-4 text-center font-medium text-black dark:text-white">
                대표 이미지
              </th>
              <th className="min-w-[100px] px-4 py-4 text-center font-medium text-black dark:text-white">
                예약일
              </th>
              <th className="min-w-[120px] px-4 py-4 text-center font-medium text-black dark:text-white">
                상태
              </th>
              <th className="px-4 py-4 text-center font-medium text-black dark:text-white">액션</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr
                key={item.id}
                onClick={() => handleLinkTo(item.id)}
                className="cursor-pointer hover:bg-slate-50"
              >
                <td className="border-b border-[#eee] pl-9 text-center dark:border-strokedark xl:pl-11">
                  <Link className="block h-full p-4" href={`/hotdeal/keyword/${item.id}`}>
                    <h5 className="font-medium text-black dark:text-white">
                      <span>{item.id}</span>
                    </h5>
                  </Link>
                </td>
                <td className="border-b border-[#eee] text-center dark:border-strokedark">
                  <Link className="block h-full p-4" href={`/hotdeal/keyword/${item.id}`}>
                    <p className="font-semibold text-black dark:text-white">
                      <span>{item.name}</span>
                    </p>
                  </Link>
                </td>
                <td className="border-b border-[#eee] text-center dark:border-strokedark">
                  <Link className="block h-full p-4" href={`/hotdeal/keyword/${item.id}`}>
                    <img src={item.image} width={150} height={150} alt="instagram image" />
                  </Link>
                </td>
                <td className="border-b border-[#eee] text-center dark:border-strokedark">
                  <Link className="block h-full p-4" href={`/hotdeal/keyword/${item.id}`}>
                    <span className="text-xs text-slate-400">{dateFormatter(item.timestamp)}</span>
                  </Link>
                </td>

                <td className="border-b border-[#eee] text-center dark:border-strokedark">
                  <Link className="block h-full p-4" href={`/hotdeal/keyword/${item.id}`}>
                    <p className="text-black dark:text-white">
                      <Status status={item.status} link={item.link} />
                    </p>
                  </Link>
                </td>

                <td className="border-b border-[#eee] dark:border-strokedark">
                  <div className="flex items-center justify-center space-x-3.5">
                    <button
                      className="rounded-md p-2 text-sm hover:bg-rose-100 hover:text-danger"
                      onClick={handleRemoveHotdealKeyword(item.id, item.name)}
                    >
                      삭제
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div ref={viewRef} />
      </div>
    </div>
  );
}

function Status({
  status,
  link,
}: {
  status: 'reserved' | 'waitting' | 'canceled' | 'completed';
  link?: string;
}) {
  const statusMap = {
    reserved: '예약 완료',
    waitting: '대기중',
    canceled: '취소됨',
    completed: '완료됨',
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (link) {
      window.open(link, '_blank');
      return;
    }

    alert('예약 수정 다이얼로그 자리 ㅇㅅㅇ');
  };

  return (
    <button
      onClick={handleClick}
      className="rounded-md p-2 text-sm hover:bg-purple-100 hover:text-primary"
    >
      {statusMap[status]}
      {link && (
        <>
          <br />
          (보러가기)
        </>
      )}
    </button>
  );
}
