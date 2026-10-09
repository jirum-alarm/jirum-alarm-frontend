'use client';

import { useState } from 'react';

import { useConfirm } from '@/components/Confirm';
import { useToast } from '@/components/Toast';
import { AdminPermissionsQuery } from '@/generated/gql/graphql';
import {
  useAdminPermissions,
  useAssignAdminRole,
  useCreateAdminRole,
  useDeleteAdminRole,
  useUpdateAdminRole,
} from '@/hooks/graphql/permission';
import { SECTION_LABELS } from '@/lib/adminSection';

type Draft = { name: string; sections: string[] };

const toDrafts = (adminRoles?: AdminPermissionsQuery['adminRoles']): Record<number, Draft> =>
  Object.fromEntries((adminRoles ?? []).map((r) => [r.id, { name: r.name, sections: r.sections }]));

const cardClass =
  'rounded-xs border border-stroke bg-white p-3 sm:p-5 shadow-default dark:border-strokedark dark:bg-boxdark';
const thClass = 'px-3 py-2 text-left text-xs font-semibold text-bodydark2 whitespace-nowrap';
const tdClass = 'px-3 py-2 text-sm text-black dark:text-white';
const inputClass =
  'w-full md:w-36 rounded-sm border border-stroke bg-transparent px-2 py-1 text-sm outline-hidden focus:border-primary dark:border-strokedark';
const buttonClass =
  'rounded-sm px-3 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40 md:py-1';

// 체크박스는 작아서 폰에서 누르기 어렵다 — label 로 감싸 32px 누름 영역을 준다(md 이상은 원래 크기).
const checkboxLabelClass =
  'inline-flex h-8 w-8 cursor-pointer items-center justify-center md:h-auto md:w-auto';

const toggle = (list: string[], key: string) =>
  list.includes(key) ? list.filter((k) => k !== key) : [...list, key];

const sameDraft = (a: Draft, b: Draft) =>
  a.name === b.name && [...a.sections].sort().join() === [...b.sections].sort().join();

const errorMessage = (e: unknown) => (e instanceof Error ? e.message : '요청이 실패했습니다');

const PermissionManager = () => {
  const toast = useToast();
  const confirm = useConfirm();
  const { data, loading } = useAdminPermissions();
  const [createRole] = useCreateAdminRole();
  const [updateRole] = useUpdateAdminRole();
  const [deleteRole] = useDeleteAdminRole();
  const [assignRole] = useAssignAdminRole();

  const sections = data?.adminSections ?? [];
  const roles = data?.adminRoles ?? [];
  const users = data?.adminUsersWithRole ?? [];

  const [drafts, setDrafts] = useState<Record<number, Draft>>(() => toDrafts(data?.adminRoles));
  const [newRole, setNewRole] = useState<Draft>({ name: '', sections: [] });

  // 서버 값이 새로 오면(저장·삭제 후 refetch) 편집 초안을 서버 값으로 맞춘다 — effect 대신 렌더 중 비교로.
  const [syncedRoles, setSyncedRoles] = useState(data?.adminRoles);
  if (data?.adminRoles !== syncedRoles) {
    setSyncedRoles(data?.adminRoles);
    setDrafts(toDrafts(data?.adminRoles));
  }

  const run = async (action: () => Promise<unknown>, done: string) => {
    try {
      await action();
      toast.success(done);
    } catch (e) {
      toast.error(errorMessage(e));
    }
  };

  const handleCreate = () =>
    run(async () => {
      await createRole({ variables: newRole });
      setNewRole({ name: '', sections: [] });
    }, '역할을 만들었습니다');

  const handleDelete = async (id: number, name: string) => {
    const memberCount = users.filter((u) => u.roleId === id).length;
    const ok = await confirm({
      title: `'${name}' 역할 삭제`,
      message: memberCount
        ? `이 역할의 계정 ${memberCount}개는 역할 없음이 되어 어떤 메뉴도 못 봅니다.`
        : '이 역할을 삭제합니다.',
    });
    if (ok) await run(() => deleteRole({ variables: { id } }), '역할을 삭제했습니다');
  };

  if (loading && !data) return <p className="text-sm text-bodydark2">불러오는 중…</p>;

  return (
    <div className="flex flex-col gap-6">
      <div className={cardClass}>
        <h3 className="mb-3 font-semibold text-black dark:text-white">역할별 접근 섹션</h3>
        <div className="overflow-x-auto">
          <table className="table-cards w-full">
            <thead>
              <tr className="border-b border-stroke dark:border-strokedark">
                <th className={thClass}>역할</th>
                {sections.map((key) => (
                  <th key={key} className={thClass.replace('text-left', 'text-center')}>
                    {SECTION_LABELS[key] ?? key}
                  </th>
                ))}
                <th className={thClass} />
              </tr>
            </thead>
            <tbody>
              {roles.map((role) => {
                const draft = drafts[role.id] ?? { name: role.name, sections: role.sections };
                const dirty = !sameDraft(draft, { name: role.name, sections: role.sections });
                return (
                  <tr key={role.id} className="border-b border-stroke dark:border-strokedark">
                    <td className={tdClass}>
                      {role.isSystem ? (
                        <span className="font-medium">
                          {role.name}{' '}
                          <span className="text-xs text-bodydark2">(전체 + 권한 관리)</span>
                        </span>
                      ) : (
                        <input
                          className={inputClass}
                          value={draft.name}
                          onChange={(e) =>
                            setDrafts({ ...drafts, [role.id]: { ...draft, name: e.target.value } })
                          }
                        />
                      )}
                    </td>
                    {sections.map((key) => (
                      <td
                        key={key}
                        data-label={SECTION_LABELS[key] ?? key}
                        className={`${tdClass} text-center`}
                      >
                        <label className={checkboxLabelClass}>
                          <input
                            type="checkbox"
                            aria-label={`${role.name} ${SECTION_LABELS[key] ?? key}`}
                            checked={role.isSystem || draft.sections.includes(key)}
                            disabled={role.isSystem}
                            onChange={() =>
                              setDrafts({
                                ...drafts,
                                [role.id]: { ...draft, sections: toggle(draft.sections, key) },
                              })
                            }
                          />
                        </label>
                      </td>
                    ))}
                    <td
                      data-label="actions"
                      className={`${tdClass} md:whitespace-nowrap ${role.isSystem ? 'hidden md:table-cell' : ''}`}
                    >
                      {!role.isSystem && (
                        <div className="flex gap-2">
                          <button
                            className={`${buttonClass} bg-primary`}
                            disabled={!dirty}
                            onClick={() =>
                              run(
                                () => updateRole({ variables: { id: role.id, ...draft } }),
                                '저장했습니다',
                              )
                            }
                          >
                            저장
                          </button>
                          <button
                            className={`${buttonClass} bg-danger`}
                            onClick={() => handleDelete(role.id, role.name)}
                          >
                            삭제
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
              <tr>
                <td className={tdClass}>
                  <input
                    className={inputClass}
                    placeholder="새 역할 이름"
                    value={newRole.name}
                    onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                  />
                </td>
                {sections.map((key) => (
                  <td
                    key={key}
                    data-label={SECTION_LABELS[key] ?? key}
                    className={`${tdClass} text-center`}
                  >
                    <label className={checkboxLabelClass}>
                      <input
                        type="checkbox"
                        aria-label={`새 역할 ${SECTION_LABELS[key] ?? key}`}
                        checked={newRole.sections.includes(key)}
                        onChange={() =>
                          setNewRole({ ...newRole, sections: toggle(newRole.sections, key) })
                        }
                      />
                    </label>
                  </td>
                ))}
                <td data-label="actions" className={tdClass}>
                  <button
                    className={`${buttonClass} bg-primary`}
                    disabled={!newRole.name.trim()}
                    onClick={handleCreate}
                  >
                    추가
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className={cardClass}>
        <h3 className="mb-3 font-semibold text-black dark:text-white">계정별 역할</h3>
        <div className="overflow-x-auto">
          <table className="table-cards w-full">
            <thead>
              <tr className="border-b border-stroke dark:border-strokedark">
                <th className={thClass}>ID</th>
                <th className={thClass}>이름</th>
                <th className={thClass}>이메일</th>
                <th className={thClass}>역할</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-stroke dark:border-strokedark">
                  <td data-label="ID" className={tdClass}>
                    {user.id}
                  </td>
                  <td className={`${tdClass} font-medium md:font-normal`}>{user.name}</td>
                  <td data-label="이메일" className={`${tdClass} md:whitespace-nowrap`}>
                    {user.email}
                  </td>
                  <td data-label="역할" className={tdClass}>
                    <select
                      className="rounded-sm border border-stroke bg-transparent px-2 py-2 text-sm md:py-1 dark:border-strokedark dark:bg-boxdark"
                      value={user.roleId ?? ''}
                      onChange={(e) =>
                        run(
                          () =>
                            assignRole({
                              variables: {
                                adminUserId: user.id,
                                roleId: e.target.value ? Number(e.target.value) : null,
                              },
                            }),
                          '역할을 바꿨습니다',
                        )
                      }
                    >
                      <option value="">역할 없음</option>
                      {roles.map((role) => (
                        <option key={role.id} value={role.id}>
                          {role.name}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PermissionManager;
