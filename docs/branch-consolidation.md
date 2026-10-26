# Consolidación de ramas — 2026-10-26

Rama de trabajo: `testing`. La referencia original permanece sin cambios. Todas las referencias de la tabla son ancestros de testing antes de archivar las ramas.

| Referencia anterior | Commit | Archivo |
| --- | --- | --- |
| `refs/heads/main` | `58a3c61725e109accfb89daf7738665bdc54d135` | Conservada sin cambios |
| `refs/heads/work` | `58a3c61725e109accfb89daf7738665bdc54d135` | archive/2026-10-26/work |
| `refs/remotes/origin/feat/password-recovery` | `fbd135317be1779b46129812f39b54fe0afbf72d` | archive/2026-10-26/feat/password-recovery |
| `refs/remotes/origin/main` | `58a3c61725e109accfb89daf7738665bdc54d135` | Conservada sin cambios |

Para recuperar una punta antigua: `git switch -c recuperacion <etiqueta>`. Las etiquetas mantienen el historial aunque se retiren las ramas. No se hizo squash ni force push.

Los PR anteriores describen entregas históricas; su cierre al retirar ramas no significa una fusión hacia master/main. La consolidación está en testing.
