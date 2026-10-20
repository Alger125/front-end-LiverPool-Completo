import type { StructureNode } from '../types/gestionEstructuras.types';

export function filterStructureTree(
  nodes: StructureNode[],
  search: string,
): StructureNode[] {
  const normalizedSearch = search.trim().toLowerCase();

  if (!normalizedSearch) {
    return nodes;
  }

  return nodes.reduce<StructureNode[]>((result, node) => {
    const filteredChildren = node.hijos
      ? filterStructureTree(node.hijos, normalizedSearch)
      : [];

    const nodeMatches = [
      node.nombre,
      node.responsable,
      node.resumen,
    ].some((value) =>
      value.toLowerCase().includes(normalizedSearch),
    );

    if (nodeMatches || filteredChildren.length > 0) {
      result.push({
        ...node,
        hijos: filteredChildren,
      });
    }

    return result;
  }, []);
}