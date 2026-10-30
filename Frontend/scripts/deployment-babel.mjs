// Keep native media/anchor URLs aligned with Router's basename, including data-driven URLs.
// React Router's `to` and Route's `path` remain relative to the router.
export function deploymentUrls({ types: t }, { siteUrl }) {
  return { visitor: {
    StringLiteral(path) {
      path.node.value = path.node.value.replace(/https:\/\/faizalamfaizi\.com(?=\/|$)/g, siteUrl);
    },
    TemplateElement(path) {
      for (const key of ['raw', 'cooked']) if(path.node.value[key]) path.node.value[key] = path.node.value[key].replace(/https:\/\/faizalamfaizi\.com(?=\/|$)/g, siteUrl);
    },
    JSXAttribute(path, state) {
      if (!['src', 'href', 'poster'].includes(path.node.name.name) || !path.node.value) return;
      const value = path.node.value;
      const expr = t.isStringLiteral(value) ? value : t.isJSXExpressionContainer(value) ? value.expression : null;
      if (!expr || t.isJSXEmptyExpression(expr)) return;
      path.node.value = t.jsxExpressionContainer(t.callExpression(t.identifier('__sitePath'), [expr]));
      state.needsSitePath = true;
    },
    Program: { exit(path, state) {
      if(state.needsSitePath) path.unshiftContainer('body', t.importDeclaration([t.importSpecifier(t.identifier('__sitePath'), t.identifier('sitePath'))], t.stringLiteral('/src/utils/deployment.js')));
    } },
  } };
}
