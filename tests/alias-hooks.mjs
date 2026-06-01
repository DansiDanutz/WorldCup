// Resolve hook so the bare `node --test` runner understands the `@/` path
// alias (mapped to ./src) the way tsc and Next do. Runtime value imports
// between lib modules use `@/`, which Node would otherwise fail to resolve.
export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith("@/")) {
    const target = new URL(`../src/${specifier.slice(2)}.ts`, import.meta.url).href;

    return nextResolve(target, context);
  }

  return nextResolve(specifier, context);
}
