'use client';

import { EVENT } from '@/constants/mixpanel';
import { cn } from '@/lib/cn';
import { mp } from '@/lib/mixpanel';
import { ProductQuery } from '@/shared/api/gql/graphql';

export default function CommunityReaction({
  product,
}: {
  product: NonNullable<ProductQuery['product']>;
}) {
  const nanSafe = (num: number) => (isNaN(num) ? 0 : num);
  const positiveCount = product?.positiveCommunityReactionCount || 0;
  const negativeCount = product?.negativeCommunityReactionCount || 0;

  const allCount = positiveCount + negativeCount;

  const positivePercent = nanSafe((positiveCount / allCount) * 100).toFixed(0);
  const negativePercent = nanSafe((negativeCount / allCount) * 100).toFixed(0);

  const isPositiveMax = +positivePercent === 100;

  const handleCommunityLinkClick = () => {
    mp.track(EVENT.COMMUNITY_LINK_CLICK.NAME, {
      page: EVENT.PAGE.DETAIL,
    });
  };

  return (
    <>
      {/* @TODO: remove after add hotdeal index section */}
      <div className="px-5">
        <hr />
      </div>
      <section className="px-5">
        <h2 className="pb-3">커뮤니티 반응</h2>
        <div className="rounded border p-5">
          <div className="flex justify-between">
            <div className="inline-flex items-center gap-x-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
              >
                <rect width="20" height="20" fill="white" />
                <path
                  d="M15.8506 14.6287C15.7284 15.1254 15.5431 15.6221 15.279 16.0952C14.3999 17.6761 12.8978 18.5158 10.8202 18.5947C7.68605 18.7129 5.60843 18.1531 4.45727 16.8797C3.51899 15.835 3.20755 14.3093 3.50322 12.212C3.52688 12.0385 3.55447 11.869 3.57813 11.7074C3.58207 11.6719 3.58995 11.6364 3.5939 11.6009C4.08669 9.13697 4.55977 8.64024 4.55977 8.64024C4.55977 8.64024 6.08546 12.1213 6.79902 9.83083C6.96854 9.28678 7.06316 8.77822 7.12624 8.29331C7.13018 8.27754 7.13018 8.25783 7.13412 8.23812C7.36672 7.41023 7.44162 6.66907 7.51258 5.94762C7.52835 5.79781 7.54412 5.65194 7.55989 5.50608V5.49425C7.55989 5.49425 7.56778 5.47454 7.57172 5.46271C7.74518 4.92261 8.02115 4.37068 8.47057 3.77539C8.47057 3.77539 8.84904 6.38128 9.94895 7.12638C11.0449 7.87543 12.953 8.26966 13.3827 10.2172C13.8124 12.1686 14.3368 10.6114 14.3368 10.6114C14.3368 10.6114 14.5733 11.3013 15.3854 12.3066C15.6456 12.6338 15.8743 13.5445 15.8506 14.6287Z"
                  fill="#9EF22E"
                />
                <path
                  d="M10.4691 11.1745C10.665 11.1745 10.8239 11.0156 10.8239 10.8197C10.8239 10.6237 10.665 10.4648 10.4691 10.4648C10.2731 10.4648 10.1143 10.6237 10.1143 10.8197C10.1143 11.0156 10.2731 11.1745 10.4691 11.1745Z"
                  fill="black"
                />
                <path
                  d="M8.90022 11.1745C9.09618 11.1745 9.25503 11.0156 9.25503 10.8197C9.25503 10.6237 9.09618 10.4648 8.90022 10.4648C8.70426 10.4648 8.54541 10.6237 8.54541 10.8197C8.54541 11.0156 8.70426 11.1745 8.90022 11.1745Z"
                  fill="black"
                />
                <path
                  d="M9.29447 12.9962C8.56908 12.9962 8.12753 12.46 7.98167 12.117C7.91859 11.9672 7.98561 11.7938 8.13542 11.7307C8.28523 11.6676 8.45869 11.7346 8.52177 11.8844C8.55331 11.9593 8.86081 12.5901 9.62168 12.3536C9.77938 12.3023 9.94495 12.393 9.99226 12.5468C10.0396 12.7044 9.95284 12.87 9.79909 12.9173C9.61774 12.9725 9.44822 13.0001 9.29053 13.0001L9.29447 12.9962Z"
                  fill="black"
                />
                <mask
                  id="path-5-outside-1_1192_12483"
                  maskUnits="userSpaceOnUse"
                  x="2"
                  y="0.5"
                  width="15"
                  height="19"
                  fill="black"
                >
                  <rect fill="white" x="2" y="0.5" width="15" height="19" />
                  <path d="M16.1148 10.9025C16.0202 10.7369 15.9256 10.5674 15.8349 10.4018C15.4249 9.6567 15.1647 9.19545 14.944 9.04564L14.7311 8.89977L14.6483 9.14814C14.5734 9.37286 14.4275 9.61728 14.3644 9.63699C14.3644 9.63305 14.1989 9.56603 14.0215 8.75391C13.6627 7.11784 12.3972 6.47523 11.2815 5.91148C10.9307 5.73013 10.5956 5.56061 10.3156 5.37138C9.24333 4.6381 8.84515 1.99279 8.84121 1.9652L8.77025 1.5L8.4864 1.87846C7.3786 3.34502 7.25245 4.5908 7.12235 5.90754C7.04745 6.66841 6.9686 7.45294 6.69658 8.32814C6.5586 8.75785 6.38908 9.00227 6.21561 9.0141H6.19984C5.7583 9.0141 5.05656 7.87082 4.69781 7.05082L4.56377 6.73937L4.35877 7.01139C4.33512 7.04687 3.72011 7.9063 3.11299 12.1561C2.7976 14.3757 3.14059 16.0078 4.1656 17.1432C5.03291 18.1051 6.37331 18.6886 8.23015 18.9054C8.54948 18.9449 8.88064 18.9725 9.2315 18.9843C9.45622 18.9961 9.68487 19.004 9.92141 19.004H10.0279C10.2881 19.004 10.5561 19.0001 10.8321 18.9882C10.8676 18.9882 10.9031 18.9843 10.9346 18.9803C13.0792 18.8739 14.6995 17.9435 15.626 16.2877C16.7614 14.2495 16.5445 11.6634 16.1148 10.9025ZM15.8507 14.628C15.7285 15.1247 15.5432 15.6215 15.2791 16.0945C14.8375 16.887 14.2422 17.4901 13.4971 17.908C13.4064 17.9593 13.3118 18.0105 13.2133 18.0539C12.9334 18.1879 12.6298 18.2983 12.3105 18.3811C12.2001 18.4126 12.0858 18.4363 11.9714 18.46C11.861 18.4836 11.7428 18.5033 11.6284 18.5191C11.5062 18.5388 11.384 18.5546 11.2579 18.5625C11.1357 18.5743 11.0095 18.5822 10.8833 18.59C10.8636 18.594 10.84 18.594 10.8203 18.594C10.5088 18.6058 10.2092 18.6098 9.92141 18.6098C9.68487 18.6098 9.45228 18.6019 9.2315 18.59C9.04227 18.5822 8.85698 18.5703 8.67958 18.5546C8.54159 18.5427 8.40756 18.5309 8.27746 18.5151C8.16707 18.5033 8.06063 18.4875 7.95419 18.4718C7.85957 18.46 7.76495 18.4442 7.67428 18.4284C7.45745 18.389 7.24851 18.3456 7.05139 18.2983C6.96072 18.2747 6.87004 18.251 6.77937 18.2234C6.72023 18.2076 6.66504 18.1919 6.60985 18.1761C6.49946 18.1406 6.39302 18.1051 6.29052 18.0657C6.10128 17.9948 5.92388 17.9199 5.7583 17.841C5.69917 17.8095 5.64003 17.7819 5.58484 17.7503C5.26945 17.5808 4.98954 17.3837 4.74512 17.1629C4.69781 17.1235 4.65445 17.0841 4.61502 17.0407C4.55983 16.9895 4.50858 16.9343 4.45733 16.8791C3.51905 15.8344 3.20761 14.3087 3.50328 12.2113C3.52694 12.0379 3.55453 11.8684 3.57819 11.7067C3.58213 11.6712 3.59001 11.6358 3.59396 11.6003C3.96059 9.22699 4.3154 8.08765 4.51646 7.58697C4.84368 8.24535 5.51782 9.40834 6.20379 9.40834C6.21561 9.40834 6.22744 9.40834 6.23927 9.40834C6.59802 9.38862 6.87793 9.06535 7.0711 8.45035C7.09476 8.37938 7.11447 8.30842 7.13418 8.2414C7.36678 7.41351 7.44168 6.67235 7.51264 5.9509C7.52841 5.80109 7.54418 5.65523 7.55995 5.50936V5.49753C7.67428 4.48435 7.83986 3.55396 8.53371 2.49741C8.71112 3.33713 9.16843 5.06782 10.0949 5.70254C10.3945 5.90359 10.7375 6.081 11.1041 6.26629C12.1922 6.81822 13.3158 7.38986 13.6351 8.84064C13.8125 9.64882 14.0293 10.0155 14.3408 10.0312C14.6049 10.0549 14.7784 9.79863 14.8967 9.57786C15.0622 9.81834 15.2869 10.2244 15.488 10.595C15.5826 10.7606 15.6772 10.9301 15.7718 11.0996C16.032 11.5648 16.241 13.0787 15.8507 14.6319V14.628Z" />
                </mask>
                <path
                  d="M16.1148 10.9025C16.0202 10.7369 15.9256 10.5674 15.8349 10.4018C15.4249 9.6567 15.1647 9.19545 14.944 9.04564L14.7311 8.89977L14.6483 9.14814C14.5734 9.37286 14.4275 9.61728 14.3644 9.63699C14.3644 9.63305 14.1989 9.56603 14.0215 8.75391C13.6627 7.11784 12.3972 6.47523 11.2815 5.91148C10.9307 5.73013 10.5956 5.56061 10.3156 5.37138C9.24333 4.6381 8.84515 1.99279 8.84121 1.9652L8.77025 1.5L8.4864 1.87846C7.3786 3.34502 7.25245 4.5908 7.12235 5.90754C7.04745 6.66841 6.9686 7.45294 6.69658 8.32814C6.5586 8.75785 6.38908 9.00227 6.21561 9.0141H6.19984C5.7583 9.0141 5.05656 7.87082 4.69781 7.05082L4.56377 6.73937L4.35877 7.01139C4.33512 7.04687 3.72011 7.9063 3.11299 12.1561C2.7976 14.3757 3.14059 16.0078 4.1656 17.1432C5.03291 18.1051 6.37331 18.6886 8.23015 18.9054C8.54948 18.9449 8.88064 18.9725 9.2315 18.9843C9.45622 18.9961 9.68487 19.004 9.92141 19.004H10.0279C10.2881 19.004 10.5561 19.0001 10.8321 18.9882C10.8676 18.9882 10.9031 18.9843 10.9346 18.9803C13.0792 18.8739 14.6995 17.9435 15.626 16.2877C16.7614 14.2495 16.5445 11.6634 16.1148 10.9025ZM15.8507 14.628C15.7285 15.1247 15.5432 15.6215 15.2791 16.0945C14.8375 16.887 14.2422 17.4901 13.4971 17.908C13.4064 17.9593 13.3118 18.0105 13.2133 18.0539C12.9334 18.1879 12.6298 18.2983 12.3105 18.3811C12.2001 18.4126 12.0858 18.4363 11.9714 18.46C11.861 18.4836 11.7428 18.5033 11.6284 18.5191C11.5062 18.5388 11.384 18.5546 11.2579 18.5625C11.1357 18.5743 11.0095 18.5822 10.8833 18.59C10.8636 18.594 10.84 18.594 10.8203 18.594C10.5088 18.6058 10.2092 18.6098 9.92141 18.6098C9.68487 18.6098 9.45228 18.6019 9.2315 18.59C9.04227 18.5822 8.85698 18.5703 8.67958 18.5546C8.54159 18.5427 8.40756 18.5309 8.27746 18.5151C8.16707 18.5033 8.06063 18.4875 7.95419 18.4718C7.85957 18.46 7.76495 18.4442 7.67428 18.4284C7.45745 18.389 7.24851 18.3456 7.05139 18.2983C6.96072 18.2747 6.87004 18.251 6.77937 18.2234C6.72023 18.2076 6.66504 18.1919 6.60985 18.1761C6.49946 18.1406 6.39302 18.1051 6.29052 18.0657C6.10128 17.9948 5.92388 17.9199 5.7583 17.841C5.69917 17.8095 5.64003 17.7819 5.58484 17.7503C5.26945 17.5808 4.98954 17.3837 4.74512 17.1629C4.69781 17.1235 4.65445 17.0841 4.61502 17.0407C4.55983 16.9895 4.50858 16.9343 4.45733 16.8791C3.51905 15.8344 3.20761 14.3087 3.50328 12.2113C3.52694 12.0379 3.55453 11.8684 3.57819 11.7067C3.58213 11.6712 3.59001 11.6358 3.59396 11.6003C3.96059 9.22699 4.3154 8.08765 4.51646 7.58697C4.84368 8.24535 5.51782 9.40834 6.20379 9.40834C6.21561 9.40834 6.22744 9.40834 6.23927 9.40834C6.59802 9.38862 6.87793 9.06535 7.0711 8.45035C7.09476 8.37938 7.11447 8.30842 7.13418 8.2414C7.36678 7.41351 7.44168 6.67235 7.51264 5.9509C7.52841 5.80109 7.54418 5.65523 7.55995 5.50936V5.49753C7.67428 4.48435 7.83986 3.55396 8.53371 2.49741C8.71112 3.33713 9.16843 5.06782 10.0949 5.70254C10.3945 5.90359 10.7375 6.081 11.1041 6.26629C12.1922 6.81822 13.3158 7.38986 13.6351 8.84064C13.8125 9.64882 14.0293 10.0155 14.3408 10.0312C14.6049 10.0549 14.7784 9.79863 14.8967 9.57786C15.0622 9.81834 15.2869 10.2244 15.488 10.595C15.5826 10.7606 15.6772 10.9301 15.7718 11.0996C16.032 11.5648 16.241 13.0787 15.8507 14.6319V14.628Z"
                  fill="black"
                />
                <path
                  d="M16.1148 10.9025C16.0202 10.7369 15.9256 10.5674 15.8349 10.4018C15.4249 9.6567 15.1647 9.19545 14.944 9.04564L14.7311 8.89977L14.6483 9.14814C14.5734 9.37286 14.4275 9.61728 14.3644 9.63699C14.3644 9.63305 14.1989 9.56603 14.0215 8.75391C13.6627 7.11784 12.3972 6.47523 11.2815 5.91148C10.9307 5.73013 10.5956 5.56061 10.3156 5.37138C9.24333 4.6381 8.84515 1.99279 8.84121 1.9652L8.77025 1.5L8.4864 1.87846C7.3786 3.34502 7.25245 4.5908 7.12235 5.90754C7.04745 6.66841 6.9686 7.45294 6.69658 8.32814C6.5586 8.75785 6.38908 9.00227 6.21561 9.0141H6.19984C5.7583 9.0141 5.05656 7.87082 4.69781 7.05082L4.56377 6.73937L4.35877 7.01139C4.33512 7.04687 3.72011 7.9063 3.11299 12.1561C2.7976 14.3757 3.14059 16.0078 4.1656 17.1432C5.03291 18.1051 6.37331 18.6886 8.23015 18.9054C8.54948 18.9449 8.88064 18.9725 9.2315 18.9843C9.45622 18.9961 9.68487 19.004 9.92141 19.004H10.0279C10.2881 19.004 10.5561 19.0001 10.8321 18.9882C10.8676 18.9882 10.9031 18.9843 10.9346 18.9803C13.0792 18.8739 14.6995 17.9435 15.626 16.2877C16.7614 14.2495 16.5445 11.6634 16.1148 10.9025ZM15.8507 14.628C15.7285 15.1247 15.5432 15.6215 15.2791 16.0945C14.8375 16.887 14.2422 17.4901 13.4971 17.908C13.4064 17.9593 13.3118 18.0105 13.2133 18.0539C12.9334 18.1879 12.6298 18.2983 12.3105 18.3811C12.2001 18.4126 12.0858 18.4363 11.9714 18.46C11.861 18.4836 11.7428 18.5033 11.6284 18.5191C11.5062 18.5388 11.384 18.5546 11.2579 18.5625C11.1357 18.5743 11.0095 18.5822 10.8833 18.59C10.8636 18.594 10.84 18.594 10.8203 18.594C10.5088 18.6058 10.2092 18.6098 9.92141 18.6098C9.68487 18.6098 9.45228 18.6019 9.2315 18.59C9.04227 18.5822 8.85698 18.5703 8.67958 18.5546C8.54159 18.5427 8.40756 18.5309 8.27746 18.5151C8.16707 18.5033 8.06063 18.4875 7.95419 18.4718C7.85957 18.46 7.76495 18.4442 7.67428 18.4284C7.45745 18.389 7.24851 18.3456 7.05139 18.2983C6.96072 18.2747 6.87004 18.251 6.77937 18.2234C6.72023 18.2076 6.66504 18.1919 6.60985 18.1761C6.49946 18.1406 6.39302 18.1051 6.29052 18.0657C6.10128 17.9948 5.92388 17.9199 5.7583 17.841C5.69917 17.8095 5.64003 17.7819 5.58484 17.7503C5.26945 17.5808 4.98954 17.3837 4.74512 17.1629C4.69781 17.1235 4.65445 17.0841 4.61502 17.0407C4.55983 16.9895 4.50858 16.9343 4.45733 16.8791C3.51905 15.8344 3.20761 14.3087 3.50328 12.2113C3.52694 12.0379 3.55453 11.8684 3.57819 11.7067C3.58213 11.6712 3.59001 11.6358 3.59396 11.6003C3.96059 9.22699 4.3154 8.08765 4.51646 7.58697C4.84368 8.24535 5.51782 9.40834 6.20379 9.40834C6.21561 9.40834 6.22744 9.40834 6.23927 9.40834C6.59802 9.38862 6.87793 9.06535 7.0711 8.45035C7.09476 8.37938 7.11447 8.30842 7.13418 8.2414C7.36678 7.41351 7.44168 6.67235 7.51264 5.9509C7.52841 5.80109 7.54418 5.65523 7.55995 5.50936V5.49753C7.67428 4.48435 7.83986 3.55396 8.53371 2.49741C8.71112 3.33713 9.16843 5.06782 10.0949 5.70254C10.3945 5.90359 10.7375 6.081 11.1041 6.26629C12.1922 6.81822 13.3158 7.38986 13.6351 8.84064C13.8125 9.64882 14.0293 10.0155 14.3408 10.0312C14.6049 10.0549 14.7784 9.79863 14.8967 9.57786C15.0622 9.81834 15.2869 10.2244 15.488 10.595C15.5826 10.7606 15.6772 10.9301 15.7718 11.0996C16.032 11.5648 16.241 13.0787 15.8507 14.6319V14.628Z"
                  stroke="black"
                  strokeWidth="0.2"
                  mask="url(#path-5-outside-1_1192_12483)"
                />
              </svg>
              <span className="font-semibold text-gray-900">구매하고 싶어요!</span>
            </div>

            <div className="inline-flex items-center gap-x-1">
              <span className="text-gray-600">조금 아쉬워요</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
              >
                <rect width="20" height="20" fill="white" />
                <path
                  d="M15.8506 14.6287C15.7284 15.1254 15.5431 15.6221 15.279 16.0952C14.3999 17.6761 12.8978 18.5158 10.8202 18.5947C7.68605 18.7129 5.60843 18.1531 4.45727 16.8797C3.51899 15.835 3.20755 14.3093 3.50322 12.212C3.52688 12.0385 3.55447 11.869 3.57813 11.7074C3.58207 11.6719 3.58995 11.6364 3.5939 11.6009C4.08669 9.13697 4.55977 8.64024 4.55977 8.64024C4.55977 8.64024 6.08546 12.1213 6.79902 9.83083C6.96854 9.28678 7.06316 8.77822 7.12624 8.29331C7.13018 8.27754 7.13018 8.25783 7.13412 8.23812C7.36672 7.41023 7.44162 6.66907 7.51258 5.94762C7.52835 5.79781 7.54412 5.65194 7.55989 5.50608V5.49425C7.55989 5.49425 7.56778 5.47454 7.57172 5.46271C7.74518 4.92261 8.02115 4.37068 8.47057 3.77539C8.47057 3.77539 8.84904 6.38128 9.94895 7.12638C11.0449 7.87543 12.953 8.26966 13.3827 10.2172C13.8124 12.1686 14.3368 10.6114 14.3368 10.6114C14.3368 10.6114 14.5733 11.3013 15.3854 12.3066C15.6456 12.6338 15.8743 13.5445 15.8506 14.6287Z"
                  fill="#D0D5DD"
                />
                <path
                  d="M10.4691 11.1745C10.665 11.1745 10.8239 11.0156 10.8239 10.8197C10.8239 10.6237 10.665 10.4648 10.4691 10.4648C10.2731 10.4648 10.1143 10.6237 10.1143 10.8197C10.1143 11.0156 10.2731 11.1745 10.4691 11.1745Z"
                  fill="#667085"
                />
                <path
                  d="M8.90022 11.1745C9.09618 11.1745 9.25503 11.0156 9.25503 10.8197C9.25503 10.6237 9.09618 10.4648 8.90022 10.4648C8.70426 10.4648 8.54541 10.6237 8.54541 10.8197C8.54541 11.0156 8.70426 11.1745 8.90022 11.1745Z"
                  fill="#667085"
                />
                <path
                  d="M9.56893 11.81C10.1473 11.3722 10.823 11.5332 11.1463 11.7186C11.287 11.8 11.3382 11.9788 11.2569 12.1195C11.1755 12.2602 10.9967 12.3114 10.856 12.2301C10.7857 12.1894 10.1598 11.8721 9.69589 12.5199C9.60109 12.6559 9.41435 12.6836 9.28383 12.5895C9.15093 12.4924 9.12015 12.308 9.21418 12.1775C9.32546 12.024 9.44397 11.8997 9.5697 11.8045L9.56893 11.81Z"
                  fill="#667085"
                />
                <mask
                  id="path-5-outside-1_1192_12494"
                  maskUnits="userSpaceOnUse"
                  x="2"
                  y="0.5"
                  width="15"
                  height="19"
                  fill="black"
                >
                  <rect fill="white" x="2" y="0.5" width="15" height="19" />
                  <path d="M16.1148 10.9025C16.0202 10.7369 15.9256 10.5674 15.8349 10.4018C15.4249 9.6567 15.1647 9.19545 14.944 9.04564L14.7311 8.89977L14.6483 9.14814C14.5734 9.37286 14.4275 9.61728 14.3644 9.63699C14.3644 9.63305 14.1989 9.56603 14.0215 8.75391C13.6627 7.11784 12.3972 6.47523 11.2815 5.91148C10.9307 5.73013 10.5956 5.56061 10.3156 5.37138C9.24333 4.6381 8.84515 1.99279 8.84121 1.9652L8.77025 1.5L8.4864 1.87846C7.3786 3.34502 7.25245 4.5908 7.12235 5.90754C7.04745 6.66841 6.9686 7.45294 6.69658 8.32814C6.5586 8.75785 6.38908 9.00227 6.21561 9.0141H6.19984C5.7583 9.0141 5.05656 7.87082 4.69781 7.05082L4.56377 6.73937L4.35877 7.01139C4.33512 7.04687 3.72011 7.9063 3.11299 12.1561C2.7976 14.3757 3.14059 16.0078 4.1656 17.1432C5.03291 18.1051 6.37331 18.6886 8.23015 18.9054C8.54948 18.9449 8.88064 18.9725 9.2315 18.9843C9.45622 18.9961 9.68487 19.004 9.92141 19.004H10.0279C10.2881 19.004 10.5561 19.0001 10.8321 18.9882C10.8676 18.9882 10.9031 18.9843 10.9346 18.9803C13.0792 18.8739 14.6995 17.9435 15.626 16.2877C16.7614 14.2495 16.5445 11.6634 16.1148 10.9025ZM15.8507 14.628C15.7285 15.1247 15.5432 15.6215 15.2791 16.0945C14.8375 16.887 14.2422 17.4901 13.4971 17.908C13.4064 17.9593 13.3118 18.0105 13.2133 18.0539C12.9334 18.1879 12.6298 18.2983 12.3105 18.3811C12.2001 18.4126 12.0858 18.4363 11.9714 18.46C11.861 18.4836 11.7428 18.5033 11.6284 18.5191C11.5062 18.5388 11.384 18.5546 11.2579 18.5625C11.1357 18.5743 11.0095 18.5822 10.8833 18.59C10.8636 18.594 10.84 18.594 10.8203 18.594C10.5088 18.6058 10.2092 18.6098 9.92141 18.6098C9.68487 18.6098 9.45228 18.6019 9.2315 18.59C9.04227 18.5822 8.85698 18.5703 8.67958 18.5546C8.54159 18.5427 8.40756 18.5309 8.27746 18.5151C8.16707 18.5033 8.06063 18.4875 7.95419 18.4718C7.85957 18.46 7.76495 18.4442 7.67428 18.4284C7.45745 18.389 7.24851 18.3456 7.05139 18.2983C6.96072 18.2747 6.87004 18.251 6.77937 18.2234C6.72023 18.2076 6.66504 18.1919 6.60985 18.1761C6.49946 18.1406 6.39302 18.1051 6.29052 18.0657C6.10128 17.9948 5.92388 17.9199 5.7583 17.841C5.69917 17.8095 5.64003 17.7819 5.58484 17.7503C5.26945 17.5808 4.98954 17.3837 4.74512 17.1629C4.69781 17.1235 4.65445 17.0841 4.61502 17.0407C4.55983 16.9895 4.50858 16.9343 4.45733 16.8791C3.51905 15.8344 3.20761 14.3087 3.50328 12.2113C3.52694 12.0379 3.55453 11.8684 3.57819 11.7067C3.58213 11.6712 3.59001 11.6358 3.59396 11.6003C3.96059 9.22699 4.3154 8.08765 4.51646 7.58697C4.84368 8.24535 5.51782 9.40834 6.20379 9.40834C6.21561 9.40834 6.22744 9.40834 6.23927 9.40834C6.59802 9.38862 6.87793 9.06535 7.0711 8.45035C7.09476 8.37938 7.11447 8.30842 7.13418 8.2414C7.36678 7.41351 7.44168 6.67235 7.51264 5.9509C7.52841 5.80109 7.54418 5.65523 7.55995 5.50936V5.49753C7.67428 4.48435 7.83986 3.55396 8.53371 2.49741C8.71112 3.33713 9.16843 5.06782 10.0949 5.70254C10.3945 5.90359 10.7375 6.081 11.1041 6.26629C12.1922 6.81822 13.3158 7.38986 13.6351 8.84064C13.8125 9.64882 14.0293 10.0155 14.3408 10.0312C14.6049 10.0549 14.7784 9.79863 14.8967 9.57786C15.0622 9.81834 15.2869 10.2244 15.488 10.595C15.5826 10.7606 15.6772 10.9301 15.7718 11.0996C16.032 11.5648 16.241 13.0787 15.8507 14.6319V14.628Z" />
                </mask>
                <path
                  d="M16.1148 10.9025C16.0202 10.7369 15.9256 10.5674 15.8349 10.4018C15.4249 9.6567 15.1647 9.19545 14.944 9.04564L14.7311 8.89977L14.6483 9.14814C14.5734 9.37286 14.4275 9.61728 14.3644 9.63699C14.3644 9.63305 14.1989 9.56603 14.0215 8.75391C13.6627 7.11784 12.3972 6.47523 11.2815 5.91148C10.9307 5.73013 10.5956 5.56061 10.3156 5.37138C9.24333 4.6381 8.84515 1.99279 8.84121 1.9652L8.77025 1.5L8.4864 1.87846C7.3786 3.34502 7.25245 4.5908 7.12235 5.90754C7.04745 6.66841 6.9686 7.45294 6.69658 8.32814C6.5586 8.75785 6.38908 9.00227 6.21561 9.0141H6.19984C5.7583 9.0141 5.05656 7.87082 4.69781 7.05082L4.56377 6.73937L4.35877 7.01139C4.33512 7.04687 3.72011 7.9063 3.11299 12.1561C2.7976 14.3757 3.14059 16.0078 4.1656 17.1432C5.03291 18.1051 6.37331 18.6886 8.23015 18.9054C8.54948 18.9449 8.88064 18.9725 9.2315 18.9843C9.45622 18.9961 9.68487 19.004 9.92141 19.004H10.0279C10.2881 19.004 10.5561 19.0001 10.8321 18.9882C10.8676 18.9882 10.9031 18.9843 10.9346 18.9803C13.0792 18.8739 14.6995 17.9435 15.626 16.2877C16.7614 14.2495 16.5445 11.6634 16.1148 10.9025ZM15.8507 14.628C15.7285 15.1247 15.5432 15.6215 15.2791 16.0945C14.8375 16.887 14.2422 17.4901 13.4971 17.908C13.4064 17.9593 13.3118 18.0105 13.2133 18.0539C12.9334 18.1879 12.6298 18.2983 12.3105 18.3811C12.2001 18.4126 12.0858 18.4363 11.9714 18.46C11.861 18.4836 11.7428 18.5033 11.6284 18.5191C11.5062 18.5388 11.384 18.5546 11.2579 18.5625C11.1357 18.5743 11.0095 18.5822 10.8833 18.59C10.8636 18.594 10.84 18.594 10.8203 18.594C10.5088 18.6058 10.2092 18.6098 9.92141 18.6098C9.68487 18.6098 9.45228 18.6019 9.2315 18.59C9.04227 18.5822 8.85698 18.5703 8.67958 18.5546C8.54159 18.5427 8.40756 18.5309 8.27746 18.5151C8.16707 18.5033 8.06063 18.4875 7.95419 18.4718C7.85957 18.46 7.76495 18.4442 7.67428 18.4284C7.45745 18.389 7.24851 18.3456 7.05139 18.2983C6.96072 18.2747 6.87004 18.251 6.77937 18.2234C6.72023 18.2076 6.66504 18.1919 6.60985 18.1761C6.49946 18.1406 6.39302 18.1051 6.29052 18.0657C6.10128 17.9948 5.92388 17.9199 5.7583 17.841C5.69917 17.8095 5.64003 17.7819 5.58484 17.7503C5.26945 17.5808 4.98954 17.3837 4.74512 17.1629C4.69781 17.1235 4.65445 17.0841 4.61502 17.0407C4.55983 16.9895 4.50858 16.9343 4.45733 16.8791C3.51905 15.8344 3.20761 14.3087 3.50328 12.2113C3.52694 12.0379 3.55453 11.8684 3.57819 11.7067C3.58213 11.6712 3.59001 11.6358 3.59396 11.6003C3.96059 9.22699 4.3154 8.08765 4.51646 7.58697C4.84368 8.24535 5.51782 9.40834 6.20379 9.40834C6.21561 9.40834 6.22744 9.40834 6.23927 9.40834C6.59802 9.38862 6.87793 9.06535 7.0711 8.45035C7.09476 8.37938 7.11447 8.30842 7.13418 8.2414C7.36678 7.41351 7.44168 6.67235 7.51264 5.9509C7.52841 5.80109 7.54418 5.65523 7.55995 5.50936V5.49753C7.67428 4.48435 7.83986 3.55396 8.53371 2.49741C8.71112 3.33713 9.16843 5.06782 10.0949 5.70254C10.3945 5.90359 10.7375 6.081 11.1041 6.26629C12.1922 6.81822 13.3158 7.38986 13.6351 8.84064C13.8125 9.64882 14.0293 10.0155 14.3408 10.0312C14.6049 10.0549 14.7784 9.79863 14.8967 9.57786C15.0622 9.81834 15.2869 10.2244 15.488 10.595C15.5826 10.7606 15.6772 10.9301 15.7718 11.0996C16.032 11.5648 16.241 13.0787 15.8507 14.6319V14.628Z"
                  fill="#667085"
                />
                <path
                  d="M16.1148 10.9025C16.0202 10.7369 15.9256 10.5674 15.8349 10.4018C15.4249 9.6567 15.1647 9.19545 14.944 9.04564L14.7311 8.89977L14.6483 9.14814C14.5734 9.37286 14.4275 9.61728 14.3644 9.63699C14.3644 9.63305 14.1989 9.56603 14.0215 8.75391C13.6627 7.11784 12.3972 6.47523 11.2815 5.91148C10.9307 5.73013 10.5956 5.56061 10.3156 5.37138C9.24333 4.6381 8.84515 1.99279 8.84121 1.9652L8.77025 1.5L8.4864 1.87846C7.3786 3.34502 7.25245 4.5908 7.12235 5.90754C7.04745 6.66841 6.9686 7.45294 6.69658 8.32814C6.5586 8.75785 6.38908 9.00227 6.21561 9.0141H6.19984C5.7583 9.0141 5.05656 7.87082 4.69781 7.05082L4.56377 6.73937L4.35877 7.01139C4.33512 7.04687 3.72011 7.9063 3.11299 12.1561C2.7976 14.3757 3.14059 16.0078 4.1656 17.1432C5.03291 18.1051 6.37331 18.6886 8.23015 18.9054C8.54948 18.9449 8.88064 18.9725 9.2315 18.9843C9.45622 18.9961 9.68487 19.004 9.92141 19.004H10.0279C10.2881 19.004 10.5561 19.0001 10.8321 18.9882C10.8676 18.9882 10.9031 18.9843 10.9346 18.9803C13.0792 18.8739 14.6995 17.9435 15.626 16.2877C16.7614 14.2495 16.5445 11.6634 16.1148 10.9025ZM15.8507 14.628C15.7285 15.1247 15.5432 15.6215 15.2791 16.0945C14.8375 16.887 14.2422 17.4901 13.4971 17.908C13.4064 17.9593 13.3118 18.0105 13.2133 18.0539C12.9334 18.1879 12.6298 18.2983 12.3105 18.3811C12.2001 18.4126 12.0858 18.4363 11.9714 18.46C11.861 18.4836 11.7428 18.5033 11.6284 18.5191C11.5062 18.5388 11.384 18.5546 11.2579 18.5625C11.1357 18.5743 11.0095 18.5822 10.8833 18.59C10.8636 18.594 10.84 18.594 10.8203 18.594C10.5088 18.6058 10.2092 18.6098 9.92141 18.6098C9.68487 18.6098 9.45228 18.6019 9.2315 18.59C9.04227 18.5822 8.85698 18.5703 8.67958 18.5546C8.54159 18.5427 8.40756 18.5309 8.27746 18.5151C8.16707 18.5033 8.06063 18.4875 7.95419 18.4718C7.85957 18.46 7.76495 18.4442 7.67428 18.4284C7.45745 18.389 7.24851 18.3456 7.05139 18.2983C6.96072 18.2747 6.87004 18.251 6.77937 18.2234C6.72023 18.2076 6.66504 18.1919 6.60985 18.1761C6.49946 18.1406 6.39302 18.1051 6.29052 18.0657C6.10128 17.9948 5.92388 17.9199 5.7583 17.841C5.69917 17.8095 5.64003 17.7819 5.58484 17.7503C5.26945 17.5808 4.98954 17.3837 4.74512 17.1629C4.69781 17.1235 4.65445 17.0841 4.61502 17.0407C4.55983 16.9895 4.50858 16.9343 4.45733 16.8791C3.51905 15.8344 3.20761 14.3087 3.50328 12.2113C3.52694 12.0379 3.55453 11.8684 3.57819 11.7067C3.58213 11.6712 3.59001 11.6358 3.59396 11.6003C3.96059 9.22699 4.3154 8.08765 4.51646 7.58697C4.84368 8.24535 5.51782 9.40834 6.20379 9.40834C6.21561 9.40834 6.22744 9.40834 6.23927 9.40834C6.59802 9.38862 6.87793 9.06535 7.0711 8.45035C7.09476 8.37938 7.11447 8.30842 7.13418 8.2414C7.36678 7.41351 7.44168 6.67235 7.51264 5.9509C7.52841 5.80109 7.54418 5.65523 7.55995 5.50936V5.49753C7.67428 4.48435 7.83986 3.55396 8.53371 2.49741C8.71112 3.33713 9.16843 5.06782 10.0949 5.70254C10.3945 5.90359 10.7375 6.081 11.1041 6.26629C12.1922 6.81822 13.3158 7.38986 13.6351 8.84064C13.8125 9.64882 14.0293 10.0155 14.3408 10.0312C14.6049 10.0549 14.7784 9.79863 14.8967 9.57786C15.0622 9.81834 15.2869 10.2244 15.488 10.595C15.5826 10.7606 15.6772 10.9301 15.7718 11.0996C16.032 11.5648 16.241 13.0787 15.8507 14.6319V14.628Z"
                  stroke="#667085"
                  strokeWidth="0.2"
                  mask="url(#path-5-outside-1_1192_12494)"
                />
              </svg>
            </div>
          </div>
          <div className="relative h-7 w-full rounded-full bg-gray-200">
            <div
              className={cn('absolute h-full rounded-l-full bg-gray-900', {
                'rounded-full': isPositiveMax,
              })}
              style={{ width: `${positivePercent}%`, transition: 'width 2s ease-in-out' }}
            ></div>
            <div className="relative flex h-full items-center justify-between px-2">
              <span className="text-sm font-semibold text-primary-600">{positivePercent}%</span>
              <span className="right-2 text-sm text-gray-700">{negativePercent}%</span>
            </div>
          </div>
          <a
            href={product.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleCommunityLinkClick}
            className="flex items-center justify-end pt-5"
          >
            <p className="pt-0.5 text-xs text-gray-500">
              ‘{product.provider.nameKr ?? '커뮤니티'}’ 실제 반응 보러가기
            </p>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
            >
              <path
                d="M5.71436 12.5706L10.2858 7.99916L5.71436 3.42773"
                stroke="#98A2B3"
                strokeLinecap="square"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </div>
      </section>
    </>
  );
}
