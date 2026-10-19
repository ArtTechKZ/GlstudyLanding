// Keep historical evidence intact when a later stage reruns an earlier check.
export function evidencePath(value) {
 const root=process.env.GL_QA_ROOT;
 return root?value.replace(/^(\/?)\.qa(?=\/|$)/,(_all,leading)=>leading+root.replace(/^\//,'')):value;
}
