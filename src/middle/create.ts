import Store from '../store';
import { createChildUnitsFunc } from '../utils/createChildUnitsFunc';
import { createFamilyFunc } from '../children/create';
import { getSpouseNodesFunc } from '../utils/getSpouseNodesFunc';
import { setDefaultUnitShift } from '../utils/setDefaultUnitShift';
import { flat, hasDiffParents, prop, withRelType } from '../utils';
import { newFamily, rightOf } from '../utils/family';
import { Family, FamilyType, RelType } from '../types';
import { fixOverlaps } from './fixOverlaps';

export const middle = (store: Store): Store => {
  const rootParents = store.root.parents;
  let families: Family[] = [];

  if (!rootParents.length) {
    const family = newFamily(store.getNextId(), FamilyType.root, true);
    family.children = createChildUnitsFunc(store)(family.id, store.root);
    setDefaultUnitShift(family);
    families.push(family);
  }
  else {
    const createFamily = createFamilyFunc(store);

    if (hasDiffParents(store.root)) {
      // Show: parents, my spouses, my siblings (for both parents)
      // Hide: another spouses for parents, half-siblings (for both parents)
      const bloodParentIDs = rootParents
        .filter(withRelType(RelType.blood))
        .map(prop('id'));

      const adoptedParentIDs = rootParents
        .filter(withRelType(RelType.adopted))
        .map(prop('id'));

      const bloodFamily = createFamily(bloodParentIDs, FamilyType.root, true);
      const adoptedFamily = createFamily(adoptedParentIDs);

      fixOverlaps(bloodFamily, adoptedFamily);
      families = [bloodFamily, adoptedFamily];
    }
    else {
      // Show: parents + their spouses, my siblings + half-siblings, my spouses
      const parentIDs = rootParents.map(prop('id'));
      const mainFamily = createFamily(parentIDs, FamilyType.root, true);

      families.push(mainFamily);

      const parents = mainFamily.parents
        .map(prop('nodes'))
        .reduce(flat);

      if (parents.length === 2) {
        const { left, right } = getSpouseNodesFunc(store, parents);
        families = [
          ...left.map(node => createFamily([node.id])),
          ...families,
          ...right.map(node => createFamily([node.id])),
        ];
      }
    }
  }

  if (families.length > 1) {
    for (let i = 1; i < families.length; i++) {
      families[i].X = rightOf(families[i - 1]);
    }
  }

  families.forEach(family => store.families.set(family.id, family));

  return store;
};
