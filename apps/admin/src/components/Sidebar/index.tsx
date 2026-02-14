'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useEffect, useRef } from 'react';

import SvgLogo from '../icons/Logo';

import SidebarLinkGroup from './SidebarLinkGroup';

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (arg: boolean) => void;
  sidebarExpanded: boolean;
  setSidebarExpanded: (arg: boolean) => void;
}

const Sidebar = ({
  sidebarOpen,
  setSidebarOpen,
  sidebarExpanded,
  setSidebarExpanded,
}: SidebarProps) => {
  const pathname = usePathname();

  const trigger = useRef<any>(null);
  const sidebar = useRef<any>(null);

  const openSidebar = () => {
    setSidebarExpanded(true);
  };

  // close on click outside
  useEffect(() => {
    const clickHandler = ({ target }: MouseEvent) => {
      if (!sidebar.current || !trigger.current) return;
      if (!sidebarOpen || sidebar.current.contains(target) || trigger.current.contains(target))
        return;
      setSidebarOpen(false);
    };
    document.addEventListener('click', clickHandler);
    return () => document.removeEventListener('click', clickHandler);
  });

  // close if the esc key is pressed
  useEffect(() => {
    const keyHandler = ({ key }: KeyboardEvent) => {
      if (!sidebarOpen || key !== 'Escape') return;
      setSidebarOpen(false);
    };
    document.addEventListener('keydown', keyHandler);
    return () => document.removeEventListener('keydown', keyHandler);
  });

  return (
    <aside
      ref={sidebar}
      className={`fixed left-0 top-0 z-9999 flex h-screen flex-col overflow-y-hidden bg-black duration-300 ease-linear dark:bg-boxdark lg:translate-x-0 ${
        sidebarExpanded ? 'w-72.5' : 'w-20'
      } ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
    >
      {/* <!-- SIDEBAR HEADER --> */}
      <div
        className={`flex items-center justify-between gap-2 px-6 py-5.5 lg:py-6.5 ${
          !sidebarExpanded && 'justify-center px-4'
        }`}
      >
        <Link href="/">
          <div className="flex w-full items-center gap-2">
            <SvgLogo />
            {sidebarExpanded && <span className="mt-3 text-3xl text-white">지름알림</span>}
          </div>
        </Link>

        {sidebarExpanded ? (
          <button
            ref={trigger}
            onClick={() => {
              if (window.innerWidth >= 1024) {
                setSidebarExpanded(false);
              } else {
                setSidebarOpen(!sidebarOpen);
              }
            }}
            aria-controls="sidebar"
            aria-expanded={sidebarOpen}
            className="block"
          >
            <svg
              className="fill-current text-white"
              width="20"
              height="18"
              viewBox="0 0 20 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M19 8.175H2.98748L9.36248 1.6875C9.69998 1.35 9.69998 0.825 9.36248 0.4875C9.02498 0.15 8.49998 0.15 8.16248 0.4875L0.399976 8.3625C0.0624756 8.7 0.0624756 9.225 0.399976 9.5625L8.16248 17.4375C8.31248 17.5875 8.53748 17.7 8.76248 17.7C8.98748 17.7 9.17498 17.625 9.36248 17.475C9.69998 17.1375 9.69998 16.6125 9.36248 16.275L3.02498 9.8625H19C19.45 9.8625 19.825 9.4875 19.825 9.0375C19.825 8.55 19.45 8.175 19 8.175Z"
                fill=""
              />
            </svg>
          </button>
        ) : (
          <button onClick={() => setSidebarExpanded(true)} className="hidden text-white lg:block">
            <svg
              className="fill-current"
              width="20"
              height="18"
              viewBox="0 0 20 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M1.00002 8.175H17.0125L10.6375 1.6875C10.3 1.35 10.3 0.825 10.6375 0.4875C10.975 0.15 11.5 0.15 11.8375 0.4875L19.6 8.3625C19.9375 8.7 19.9375 9.225 19.6 9.5625L11.8375 17.4375C11.6875 17.5875 11.4625 17.7 11.2375 17.7C11.0125 17.7 10.825 17.625 10.6375 17.475C10.3 17.1375 10.3 16.6125 10.6375 16.275L16.975 9.8625H1.00002C0.550024 9.8625 0.175024 9.4875 0.175024 9.0375C0.175024 8.55 0.550024 8.175 1.00002 8.175Z"
                fill="currentColor"
              />
            </svg>
          </button>
        )}
      </div>
      {/* <!-- SIDEBAR HEADER --> */}

      <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
        {/* <!-- Sidebar Menu --> */}
        <nav className={`mt-5 px-4 py-4 lg:mt-9 lg:px-6 ${!sidebarExpanded && 'lg:px-2'}`}>
          {/* <!-- Menu Group --> */}
          <div>
            <h3
              className={`mb-4 ml-4 text-sm font-semibold text-bodydark2 ${
                !sidebarExpanded && 'hidden'
              }`}
            >
              MENU
            </h3>

            <ul className="mb-6 flex flex-col gap-1.5">
              <SidebarLinkGroup activeCondition={pathname === '/' || pathname.startsWith('/stats')}>
                {(handleClick, open) => {
                  return (
                    <React.Fragment>
                      <MenuGroup
                        name="대시보드"
                        isSelectedPath={pathname === '/' || pathname.startsWith('/stats')}
                        open={open}
                        sidebarExpanded={sidebarExpanded}
                        openSidebar={openSidebar}
                        handleClick={handleClick}
                        icon={<DashboardIcon />}
                      />
                      <SubMenu open={open} sidebarExpanded={sidebarExpanded}>
                        <SubMenuItem name="홈" linkTo="/" pathname={pathname} />
                        <SubMenuItem name="통계" linkTo="/stats" pathname={pathname} />
                      </SubMenu>
                    </React.Fragment>
                  );
                }}
              </SidebarLinkGroup>

              <SidebarLinkGroup activeCondition={pathname.startsWith('/hotdeal')}>
                {(handleClick, open) => {
                  return (
                    <React.Fragment>
                      <MenuGroup
                        name="핫딜"
                        isSelectedPath={pathname.startsWith('/hotdeal')}
                        open={open}
                        sidebarExpanded={sidebarExpanded}
                        openSidebar={openSidebar}
                        handleClick={handleClick}
                        icon={<HotdealIcon />}
                      />
                      <SubMenu open={open} sidebarExpanded={sidebarExpanded}>
                        <SubMenuItem name="키워드" linkTo="/hotdeal/keyword" pathname={pathname} />
                      </SubMenu>
                    </React.Fragment>
                  );
                }}
              </SidebarLinkGroup>
              <SidebarLinkGroup activeCondition={pathname.startsWith('/product')}>
                {(handleClick, open) => {
                  return (
                    <React.Fragment>
                      <MenuGroup
                        name="상품"
                        isSelectedPath={pathname.startsWith('/product')}
                        open={open}
                        sidebarExpanded={sidebarExpanded}
                        openSidebar={openSidebar}
                        handleClick={handleClick}
                        icon={<ProductIcon />}
                      />
                      <SubMenu open={open} sidebarExpanded={sidebarExpanded}>
                        <SubMenuItem name="목록" linkTo="/product/list" pathname={pathname} />
                        <SubMenuItem name="매칭" linkTo="/product/matching" pathname={pathname} />
                      </SubMenu>
                    </React.Fragment>
                  );
                }}
              </SidebarLinkGroup>
            </ul>
          </div>

          <div className="mt-5 lg:mt-9">
            <h3
              className={`mb-4 ml-4 text-sm font-semibold text-bodydark2 ${
                !sidebarExpanded && 'hidden'
              }`}
            >
              SYSTEM
            </h3>

            <ul className="mb-6 flex flex-col gap-1.5">
              <SidebarLinkGroup activeCondition={pathname.startsWith('/category')}>
                {(handleClick, open) => {
                  return (
                    <React.Fragment>
                      <MenuGroup
                        name="카테고리"
                        isSelectedPath={pathname.startsWith('/category')}
                        open={open}
                        sidebarExpanded={sidebarExpanded}
                        openSidebar={openSidebar}
                        handleClick={handleClick}
                        icon={<CategoryIcon />}
                      />
                      <SubMenu open={open} sidebarExpanded={sidebarExpanded}>
                        <SubMenuItem name="목록" linkTo="/category" pathname={pathname} />
                      </SubMenu>
                    </React.Fragment>
                  );
                }}
              </SidebarLinkGroup>

              <SidebarLinkGroup activeCondition={pathname.startsWith('/user')}>
                {(handleClick, open) => {
                  return (
                    <React.Fragment>
                      <MenuGroup
                        name="사용자"
                        isSelectedPath={pathname.startsWith('/user')}
                        open={open}
                        sidebarExpanded={sidebarExpanded}
                        openSidebar={openSidebar}
                        handleClick={handleClick}
                        icon={<UserIcon />}
                      />
                      <SubMenu open={open} sidebarExpanded={sidebarExpanded}>
                        <SubMenuItem name="목록" linkTo="/user" pathname={pathname} />
                      </SubMenu>
                    </React.Fragment>
                  );
                }}
              </SidebarLinkGroup>

              <SidebarLinkGroup activeCondition={pathname.startsWith('/notification')}>
                {(handleClick, open) => {
                  return (
                    <React.Fragment>
                      <MenuGroup
                        name="알림"
                        isSelectedPath={pathname.startsWith('/notification')}
                        open={open}
                        sidebarExpanded={sidebarExpanded}
                        openSidebar={openSidebar}
                        handleClick={handleClick}
                        icon={<BellIcon />}
                      />
                      <SubMenu open={open} sidebarExpanded={sidebarExpanded}>
                        <SubMenuItem
                          name="발송 및 내역"
                          linkTo="/notification"
                          pathname={pathname}
                        />
                      </SubMenu>
                    </React.Fragment>
                  );
                }}
              </SidebarLinkGroup>
            </ul>
          </div>

          <div className="mt-5 lg:mt-9">
            <h3
              className={`mb-4 ml-4 text-sm font-semibold text-bodydark2 ${
                !sidebarExpanded && 'hidden'
              }`}
            >
              ARCHIVE
            </h3>

            <ul className="mb-6 flex flex-col gap-1.5">
              <SidebarLinkGroup activeCondition={pathname.startsWith('/post')}>
                {(handleClick, open) => {
                  return (
                    <React.Fragment>
                      <MenuGroup
                        name="포스트"
                        isSelectedPath={pathname.startsWith('/post')}
                        open={open}
                        sidebarExpanded={sidebarExpanded}
                        openSidebar={openSidebar}
                        handleClick={handleClick}
                        icon={<PostIcon />}
                      />
                      <SubMenu open={open} sidebarExpanded={sidebarExpanded}>
                        <SubMenuItem
                          name="예약 목록"
                          linkTo="/post/reservation"
                          pathname={pathname}
                        />
                      </SubMenu>
                    </React.Fragment>
                  );
                }}
              </SidebarLinkGroup>
            </ul>
          </div>
        </nav>
        {/* <!-- Sidebar Menu --> */}
      </div>
    </aside>
  );
};

export default Sidebar;

function MenuGroup({
  name,
  isSelectedPath,
  open,
  sidebarExpanded,
  openSidebar,
  handleClick,
  icon,
}: {
  name: string;
  isSelectedPath: boolean;
  open: boolean;
  sidebarExpanded: boolean;
  openSidebar: () => void;
  handleClick: () => void;
  icon?: React.ReactNode;
}) {
  return (
    <Link
      href="#"
      className={`group relative flex items-center gap-2.5 rounded-sm px-4 py-2 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${
        isSelectedPath && 'bg-graydark dark:bg-meta-4'
      } ${!sidebarExpanded && 'justify-center px-2'}`}
      onClick={(e) => {
        e.preventDefault();
        if (sidebarExpanded) {
          handleClick();
        } else {
          openSidebar();
        }
      }}
    >
      {icon || <MenuGroupIcon />}
      {sidebarExpanded && name}
      {sidebarExpanded && <MenuGroupArrowIcon open={open} />}
    </Link>
  );
}

function SubMenu({
  open,
  sidebarExpanded,
  children,
}: {
  open: boolean;
  sidebarExpanded: boolean;
  children: React.ReactNode;
}) {
  if (!sidebarExpanded) return null;
  return (
    <div className={`translate transform overflow-hidden ${!open && 'hidden'}`}>
      <ul className="mb-5.5 mt-4 flex flex-col gap-2.5 pl-6">{children}</ul>
    </div>
  );
}

function SubMenuItem({
  name,
  pathname,
  linkTo,
}: {
  name: string;
  pathname: string;
  linkTo: string;
}) {
  return (
    <li>
      <Link
        href={linkTo}
        className={`group relative flex items-center gap-2.5 rounded-md px-4 font-medium text-bodydark2 duration-300 ease-in-out hover:text-white ${
          pathname.includes(linkTo) && 'text-white'
        }`}
      >
        {name}
      </Link>
    </li>
  );
}

function HotdealIcon() {
  return (
    <svg
      className="fill-current"
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M13.8375 8.71875C13.5281 8.325 13.0781 7.95938 12.6 7.62188C12.0094 7.22812 11.3344 6.8625 10.5188 6.55312C10.0406 6.38437 9.53437 6.24375 9 6.1875C8.4375 6.13125 7.89375 6.15938 7.36875 6.27188L7.34062 6.24375C7.2 6.13125 7.05937 6.01875 6.91875 5.90625C6.01875 5.25938 5.4 4.3875 5.4 3.375C5.4 3.00938 5.48437 2.67188 5.625 2.3625C4.19062 2.98125 3.15 4.35938 3.15 6.01875C3.15 8.24063 4.97813 10.0688 7.2 10.0688C7.3125 10.0688 7.425 10.0688 7.5375 10.0406C6.60937 10.4344 5.9625 11.3625 5.9625 12.4312C5.9625 13.9219 7.17188 15.1312 8.6625 15.1312C9.47812 15.1312 10.2094 14.7656 10.7156 14.2031C11.5312 13.3875 12.0375 12.2344 12.0375 11.025C12.0375 10.3781 11.925 9.75938 11.7281 9.225C12.5156 9.87188 13.0781 10.8 13.0781 11.8406C13.0781 12.6562 12.7406 13.4437 12.15 14.0344L12.9656 14.85C13.8094 14.0344 14.3156 12.9938 14.3156 11.8406C14.3156 10.6031 13.9219 9.53438 13.1906 8.74688C13.4437 8.74688 13.6687 8.71875 13.8375 8.71875Z"
        fill=""
      />
    </svg>
  );
}

function ProductIcon() {
  return (
    <svg
      className="fill-current"
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M15.75 3.375H2.25C1.62891 3.375 1.125 3.87891 1.125 4.5V13.5C1.125 14.1211 1.62891 14.625 2.25 14.625H15.75C16.3711 14.625 16.875 14.1211 16.875 13.5V4.5C16.875 3.87891 16.3711 3.375 15.75 3.375ZM15.75 13.5H2.25V4.5H15.75V13.5Z"
        fill=""
      />
      <path d="M10.125 6.75H4.5V7.875H10.125V6.75ZM13.5 10.125H4.5V11.25H13.5V10.125Z" fill="" />
    </svg>
  );
}

function PostIcon() {
  return (
    <svg
      className="fill-current"
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M15 1.5H3C2.17157 1.5 1.5 2.17157 1.5 3V15C1.5 15.8284 2.17157 16.5 3 16.5H15C15.8284 16.5 16.5 15.8284 16.5 15V3C16.5 2.17157 15.8284 1.5 15 1.5ZM15 3V15H3V3H15Z"
        fill=""
      />
      <path
        d="M5.25 5.25H12.75V6.75H5.25V5.25ZM5.25 8.25H12.75V9.75H5.25V8.25ZM5.25 11.25H9.75V12.75H5.25V11.25Z"
        fill=""
      />
    </svg>
  );
}

function MenuGroupIcon() {
  return (
    <svg
      className="fill-current"
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M1.43425 7.5093H2.278C2.44675 7.5093 2.55925 7.3968 2.58737 7.31243L2.98112 6.32805H5.90612L6.27175 7.31243C6.328 7.48118 6.46862 7.5093 6.58112 7.5093H7.453C7.76237 7.48118 7.87487 7.25618 7.76237 7.03118L5.428 1.4343C5.37175 1.26555 5.3155 1.23743 5.14675 1.23743H3.88112C3.76862 1.23743 3.59987 1.29368 3.57175 1.4343L1.153 7.08743C1.0405 7.2843 1.20925 7.5093 1.43425 7.5093ZM4.47175 2.98118L5.3155 5.17493H3.59987L4.47175 2.98118Z"
        fill=""
      />
      <path
        d="M10.1249 2.5031H16.8749C17.2124 2.5031 17.5218 2.22185 17.5218 1.85623C17.5218 1.4906 17.2405 1.20935 16.8749 1.20935H10.1249C9.7874 1.20935 9.47803 1.4906 9.47803 1.85623C9.47803 2.22185 9.75928 2.5031 10.1249 2.5031Z"
        fill=""
      />
      <path
        d="M16.8749 6.21558H10.1249C9.7874 6.21558 9.47803 6.49683 9.47803 6.86245C9.47803 7.22808 9.75928 7.50933 10.1249 7.50933H16.8749C17.2124 7.50933 17.5218 7.22808 17.5218 6.86245C17.5218 6.49683 17.2124 6.21558 16.8749 6.21558Z"
        fill=""
      />
      <path
        d="M16.875 11.1656H1.77187C1.43438 11.1656 1.125 11.4469 1.125 11.8125C1.125 12.1781 1.40625 12.4594 1.77187 12.4594H16.875C17.2125 12.4594 17.5219 12.1781 17.5219 11.8125C17.5219 11.4469 17.2125 11.1656 16.875 11.1656Z"
        fill=""
      />
      <path
        d="M16.875 16.1156H1.77187C1.43438 16.1156 1.125 16.3969 1.125 16.7625C1.125 17.1281 1.40625 17.4094 1.77187 17.4094H16.875C17.2125 17.4094 17.5219 17.1281 17.5219 16.7625C17.5219 16.3969 17.2125 16.1156 16.875 16.1156Z"
        fill="white"
      />
    </svg>
  );
}

function DashboardIcon() {
  return (
    <svg
      className="fill-current"
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6.10322 0.956299H2.53135C1.5751 0.956299 0.787598 1.7438 0.787598 2.70005V6.27192C0.787598 7.22817 1.5751 8.01567 2.53135 8.01567H6.10322C7.05947 8.01567 7.84697 7.22817 7.84697 6.27192V2.70005C7.84697 1.7438 7.05947 0.956299 6.10322 0.956299ZM6.60947 6.27192C6.60947 6.55005 6.38135 6.77817 6.10322 6.77817H2.53135C2.25322 6.77817 2.0251 6.55005 2.0251 6.27192V2.70005C2.0251 2.42192 2.25322 2.19380 2.53135 2.19380H6.10322C6.38135 2.19380 6.60947 2.42192 6.60947 2.70005V6.27192Z"
        fill=""
      />
      <path
        d="M15.4689 0.956299H11.8971C10.9408 0.956299 10.1533 1.7438 10.1533 2.70005V6.27192C10.1533 7.22817 10.9408 8.01567 11.8971 8.01567H15.4689C16.4252 8.01567 17.2127 7.22817 17.2127 6.27192V2.70005C17.2127 1.7438 16.4252 0.956299 15.4689 0.956299ZM15.9752 6.27192C15.9752 6.55005 15.7471 6.77817 15.4689 6.77817H11.8971C11.6189 6.77817 11.3908 6.55005 11.3908 6.27192V2.70005C11.3908 2.42192 11.6189 2.19380 11.8971 2.19380H15.4689C15.7471 2.19380 15.9752 2.42192 15.9752 2.70005V6.27192Z"
        fill=""
      />
      <path
        d="M6.10322 9.92822H2.53135C1.5751 9.92822 0.787598 10.7157 0.787598 11.672V15.2438C0.787598 16.2001 1.5751 16.9876 2.53135 16.9876H6.10322C7.05947 16.9876 7.84697 16.2001 7.84697 15.2438V11.672C7.84697 10.7157 7.05947 9.92822 6.10322 9.92822ZM6.60947 15.2438C6.60947 15.522 6.38135 15.7501 6.10322 15.7501H2.53135C2.25322 15.7501 2.0251 15.522 2.0251 15.2438V11.672C2.0251 11.3938 2.25322 11.1657 2.53135 11.1657H6.10322C6.38135 11.1657 6.60947 11.3938 6.60947 11.672V15.2438Z"
        fill=""
      />
      <path
        d="M15.4689 9.92822H11.8971C10.9408 9.92822 10.1533 10.7157 10.1533 11.672V15.2438C10.1533 16.2001 10.9408 16.9876 11.8971 16.9876H15.4689C16.4252 16.9876 17.2127 16.2001 17.2127 15.2438V11.672C17.2127 10.7157 16.4252 9.92822 15.4689 9.92822ZM15.9752 15.2438C15.9752 15.522 15.7471 15.7501 15.4689 15.7501H11.8971C11.6189 15.7501 11.3908 15.522 11.3908 15.2438V11.672C11.3908 11.3938 11.6189 11.1657 11.8971 11.1657H15.4689C15.7471 11.1657 15.9752 11.3938 15.9752 11.672V15.2438Z"
        fill=""
      />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg
      className="fill-current"
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M9.0002 7.79065C11.0814 7.79065 12.7689 6.1594 12.7689 4.1344C12.7689 2.1094 11.0814 0.478149 9.0002 0.478149C6.91895 0.478149 5.23145 2.1094 5.23145 4.1344C5.23145 6.1594 6.91895 7.79065 9.0002 7.79065ZM9.0002 1.7719C10.3783 1.7719 11.5314 2.8688 11.5314 4.1906C11.5314 5.5125 10.3783 6.6094 9.0002 6.6094C7.62207 6.6094 6.46895 5.5125 6.46895 4.1906C6.46895 2.8688 7.62207 1.7719 9.0002 1.7719Z"
        fill=""
      />
      <path
        d="M10.8283 9.05627H7.17207C4.16269 9.05627 1.71582 11.5594 1.71582 14.6250C1.71582 14.9813 2.01582 15.2813 2.37207 15.2813H15.6283C15.9846 15.2813 16.2846 14.9813 16.2846 14.6250C16.2846 11.5594 13.8377 9.05627 10.8283 9.05627ZM3.01582 13.9688C3.24082 11.7563 5.04082 10.0500 7.17207 10.0500H10.8283C12.9596 10.0500 14.7596 11.7563 14.9846 13.9688H3.01582Z"
        fill=""
      />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg
      className="fill-current"
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M16.1999 14.9343L15.6374 14.0624C15.5249 13.8937 15.4687 13.7249 15.4687 13.528V7.67182C15.4687 4.25932 12.6562 1.44682 9.24365 1.44682C9.24365 1.44682 9.2249 1.44682 9.20615 1.44682C5.8124 1.46557 3.01865 4.27807 3.01865 7.67182V13.528C3.01865 13.7249 2.96240 13.8937 2.84990 14.0624L2.28740 14.9343C2.06240 15.2999 2.24990 15.7499 2.66240 15.7499H15.8249C16.2374 15.7499 16.4249 15.2999 16.1999 14.9343ZM3.94990 14.5124L3.98740 14.4562C4.23740 14.0437 4.36865 13.5937 4.36865 13.1062V7.67182C4.36865 5.01557 6.54365 2.81557 9.21865 2.79682C11.8749 2.79682 14.0624 4.98432 14.0624 7.67182V13.1062C14.0624 13.5937 14.1937 14.0437 14.4437 14.4562L14.4812 14.5124H3.94990Z"
        fill=""
      />
      <path
        d="M8.99993 17.2125C9.84368 17.2125 10.5187 16.5375 10.5187 15.6938H7.48118C7.48118 16.5375 8.15618 17.2125 8.99993 17.2125Z"
        fill=""
      />
    </svg>
  );
}

function CategoryIcon() {
  return (
    <svg
      className="fill-current"
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2.25 2.25H7.5V7.5H2.25V2.25ZM3.75 3.75V6H6V3.75H3.75ZM10.5 2.25H15.75V7.5H10.5V2.25ZM12 3.75V6H14.25V3.75H12ZM2.25 10.5H7.5V15.75H2.25V10.5ZM3.75 12V14.25H6V12H3.75ZM10.5 10.5H15.75V15.75H10.5V10.5ZM12 12V14.25H14.25V12H12Z"
        fill=""
      />
    </svg>
  );
}

function MenuGroupArrowIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`absolute right-4 top-1/2 -translate-y-1/2 fill-current ${open && 'rotate-180'}`}
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4.41107 6.9107C4.73651 6.58527 5.26414 6.58527 5.58958 6.9107L10.0003 11.3214L14.4111 6.91071C14.7365 6.58527 15.2641 6.58527 15.5896 6.91071C15.915 7.23614 15.915 7.76378 15.5896 8.08922L10.5896 13.0892C10.2641 13.4147 9.73651 13.4147 9.41107 13.0892L4.41107 8.08922C4.08563 7.76378 4.08563 7.23614 4.41107 6.9107Z"
        fill=""
      />
    </svg>
  );
}
