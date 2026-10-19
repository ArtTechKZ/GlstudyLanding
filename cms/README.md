# CMS source boundary

The public DEMO builds entirely from the committed approved snapshot; it never starts or calls Directus in the browser. See `snapshots/README.md`.

The source adapters implement paginated approved-only export, native file verification, publication windows, snapshot validation and isolated candidate builds. Live CMS access is opt-in and server-only. `env.example` has no real credentials; runtime and databases are excluded. Local Directus 12.5 pipeline was verified in an administrator test contour; positive editor/manager/build-service access remains blocked by the installed permission mode. No license bypass or broad public permission was added.

The optional native operation sends only signed events to a fixed loopback build service. It does not deploy to Pages. Production requires lawful least-privilege roles, HTTPS, TFA, secret management, backup/restore and review of remaining dependency advisories. Do not point public builds at changing live content during acceptance.
