<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import { Button } from '@cio/ui/base/button';
  import EyeIcon from '@lucide/svelte/icons/eye';
  import EyeOffIcon from '@lucide/svelte/icons/eye-off';
  import { ROLE } from '@cio/utils/constants';
  import { currentOrg, currentOrgPath } from '$lib/utils/store/org';
  import { rolPuedePrevisualizar, vistaEstudiante } from '$lib/utils/store/vista-estudiante';
  import { t } from '$lib/utils/functions/translations';

  // T28 — el interruptor de la cabecera. Se decide con el rol REAL
  // (`currentOrg.roleId`), no con `isOrgStudent`: en vista de estudiante ese
  // store ya dice «estudiante», y el botón para volver desaparecería.
  const visible = $derived(rolPuedePrevisualizar($currentOrg.roleId));

  const etiqueta = $derived(
    $vistaEstudiante
      ? $currentOrg.roleId === ROLE.TUTOR
        ? $t('t28.vista_estudiante.volver_tutor')
        : $t('t28.vista_estudiante.volver_admin')
      : $t('t28.vista_estudiante.ver')
  );

  // Dentro de una formación o un grupo se queda en la misma página, que es
  // justo lo que se quiere comparar. Desde cualquier otro lado salta al inicio
  // de la otra vista: /lms no tiene equivalente en /org, ni al revés.
  function alternar() {
    const activar = !$vistaEstudiante;
    vistaEstudiante.set(activar);

    const path = page.url.pathname;
    if (path.startsWith('/courses/') || path.startsWith('/cohorts/')) return;

    goto(activar ? '/lms' : $currentOrgPath);
  }
</script>

{#if visible}
  <Button
    variant={$vistaEstudiante ? 'default' : 'outline'}
    size="sm"
    onclick={alternar}
    aria-pressed={$vistaEstudiante}
    aria-label={etiqueta}
    title={etiqueta}
  >
    {#if $vistaEstudiante}
      <EyeOffIcon size={14} />
    {:else}
      <EyeIcon size={14} />
    {/if}
    <span class="hidden sm:inline">{etiqueta}</span>
  </Button>
{/if}
