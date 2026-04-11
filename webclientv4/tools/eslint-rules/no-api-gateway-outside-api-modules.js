/** @type {import('eslint').Rule.RuleModule} */
const rule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'apiGateway calls are only allowed inside *api.ts modules',
    },
    messages: {
      outsideApiModule:
        'apiGateway.{{method}} called outside an *api.ts module. Use or create an api module for this endpoint.',
    },
    schema: [],
  },

  create(context) {
    const filename = context.filename;

    // Allow api modules (canonical owners) and spec files (mock freely).
    // Use case-insensitive check — api modules use camelCase (e.g. bankAccountApi.ts).
    if (/[Aa]pi\.ts$/.test(filename)) return {};
    if (filename.endsWith('.spec.ts')) return {};

    const methods = new Set(['get', 'post', 'put', 'delete', 'patch']);

    return {
      CallExpression(node) {
        const callee = node.callee;
        if (callee.type !== 'MemberExpression') return;
        if (callee.object.type !== 'Identifier' || callee.object.name !== 'apiGateway') return;
        if (callee.property.type !== 'Identifier') return;
        if (!methods.has(callee.property.name)) return;
        context.report({
          node,
          messageId: 'outsideApiModule',
          data: { method: callee.property.name },
        });
      },
    };
  },
};

export default rule;
