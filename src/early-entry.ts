import { getEarlyRuntime } from './features/early-runtime';
getEarlyRuntime(window.__GL_EARLY_LABELS__);

import { installConnect } from './features/connect';
installConnect();
