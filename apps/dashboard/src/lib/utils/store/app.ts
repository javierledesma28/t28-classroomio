import { currentOrg, currentOrgPath } from './org';
import { derived, writable } from 'svelte/store';

import { PUBLIC_IS_SELFHOSTED } from '$env/static/public';
import { ROLE } from '@cio/utils/constants';
import { rolPuedePrevisualizar, vistaEstudiante } from './vista-estudiante';

export const globalStore = writable<{
  isDark: boolean;
  isOrgSite: boolean;
  orgSiteName: string;
}>({
  isDark: false,
  isOrgSite: false,
  orgSiteName: ''
});

// T28: con «Ver como estudiante» encendido, un admin o tutor cuenta como
// estudiante en toda la interfaz — redirecciones, candados de lección y
// botones de edición incluidos. El rol real queda en `currentOrg.roleId`.
export const isOrgStudent = derived([currentOrg, vistaEstudiante], ([$currentOrg, $vista]) => {
  if ($currentOrg.roleId === 0) return null;

  if ($vista && rolPuedePrevisualizar($currentOrg.roleId)) return true;

  return $currentOrg.roleId === ROLE.STUDENT;
});

/**
 * The goal of this store is to determine whether we should display the app in student or admin/teacher mode.
 * Cloud: orgSite is always student (a teacher on an org subdomain sees the student view).
 * Self-hosted: derived from isOrgStudent (role-based).
 */
export const isStudentExperience = derived([globalStore, isOrgStudent], ([$gs, $isStudent]) => {
  const isCloud = PUBLIC_IS_SELFHOSTED !== 'true';
  if (isCloud) return $gs.isOrgSite;

  return $isStudent ?? false;
});

/**
 * The root path for navigation: '/lms' for students, '/org/{siteName}' for admin/teacher
 */
export const basePath = derived([isStudentExperience, currentOrgPath], ([$isStudent, $orgPath]) =>
  $isStudent ? '/lms' : $orgPath
);
