import Store from '../store';
import Family from '../models/family';
import { byGender, relToNode, withId } from '../utils';
import { newUnit } from '../utils/units';
import { setDefaultUnitShift } from '../utils/setDefaultUnitShift';
import getChildUnits from './getChildUnits';
import { FamilyType, IFamilyNode } from '../types';

export default (store: Store) => {
  return (parentIDs: string[], type: FamilyType = 'root', isMain: boolean = false): Family => {
    const family = new Family(store.getNextId(), type, isMain);

    const parents = parentIDs.map(id => store.getNode(id));
    if (family.main) parents.sort(byGender(store.root.gender));

    family.pUnits.push(newUnit(family.id, parents));

    // CHILDREN
    let children: IFamilyNode[];

    if (parents.length === 1) {
      children = parents[0].children.map(relToNode(store));
    }
    else {
      const firstParent = parents[0];
      const secondParent = parents[1];

      children = firstParent.children
        .filter(rel => secondParent.children.find(withId(rel.id)))
        .map(relToNode(store));
    }

    // CHILDREN's SPOUSES
    children.forEach(child => {
      getChildUnits(store, family.id, child).forEach(unit => {
        family.cUnits.push(unit);
      });
    });

    setDefaultUnitShift(family);
    return family;
  };
};
