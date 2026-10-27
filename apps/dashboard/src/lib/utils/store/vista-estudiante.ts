import { browser } from '$app/environment';
import { writable } from 'svelte/store';

import { ROLE } from '@cio/utils/constants';

/**
 * T28 — «Ver como estudiante».
 *
 * En una instalación propia, la interfaz de estudiante o de administrador la
 * decide SOLO el rol en la organización (ver `isStudentExperience` en app.ts).
 * El «Ver como estudiante» de upstream depende del subdominio de la nube y acá
 * no hace nada. Este interruptor deja que un administrador o un tutor vea el
 * campus como lo ve un estudiante sin cambiar de cuenta.
 *
 * Es solo de presentación: el servidor sigue autorizando con el rol real. Por
 * eso no hace falta protegerlo — un estudiante que lo encienda a mano no gana
 * nada, y además `rolPuedePrevisualizar` lo ignora para él.
 *
 * Vive en un archivo propio, sin importar `org.ts` ni `app.ts`, porque los dos
 * lo leen y se importan entre sí: ponerlo en cualquiera cerraría un ciclo.
 */

const CLAVE = 't28:vista-estudiante';

function leer(): boolean {
  if (!browser) return false;
  try {
    return localStorage.getItem(CLAVE) === '1';
  } catch {
    return false;
  }
}

export const vistaEstudiante = writable<boolean>(leer());

vistaEstudiante.subscribe((activa) => {
  if (!browser) return;
  try {
    if (activa) localStorage.setItem(CLAVE, '1');
    else localStorage.removeItem(CLAVE);
  } catch {
    // Navegación privada o almacenamiento bloqueado: el interruptor anda igual
    // durante la sesión, solo no se recuerda al recargar.
  }
});

/** Los roles que pueden previsualizar. El estudiante real nunca: ya está ahí. */
export function rolPuedePrevisualizar(roleId: number | undefined | null): boolean {
  return roleId === ROLE.ADMIN || roleId === ROLE.TUTOR;
}
