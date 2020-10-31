import Store from '../store';
import { nodeCount, sameAs } from '../utils/units';
import { countUnits, fRight, widthOf } from '../utils/family';
import { Family, Unit } from '../types';

export default (store: Store) => {
  return function(family: Family): void {
    if (!family.cID) return;
    let right = 0;

    while (family) {
      const fUnit = family.cUnits[0];

      if (family.pUnits.length === 2 && countUnits(family.pUnits) > 2) {
        fUnit.pos = Math.floor(family.pUnits[1].pos / 2);
      }

      const shift = fUnit.pos;
      right = Math.max(right, fRight(family));

      const cFamily = store.getFamily(family.cID as number); // TODO

      // root family
      if (!cFamily.cID) {
        fUnit.pos = (widthOf(family) - nodeCount(fUnit) * 2) / 2;
        break;
      }

      const pUnit = cFamily.pUnits.find(sameAs(fUnit)) as Unit; // TODO
      const uIndex = cFamily.pUnits.findIndex(unit => (
        unit.nodes[0].id === fUnit.nodes[0].id
      ));

      if (uIndex === 0 && pUnit.pos === 0) {
        const left = family.left + shift;
        cFamily.left = Math.max(cFamily.left, left);
      }
      else {
        pUnit.pos = family.left + fUnit.pos - cFamily.left;
      }

      const next = cFamily.pUnits[uIndex + 1];

      if (next) {
        const diff = right - (cFamily.left + next.pos);

        if (diff > 0) {
          for (let i = uIndex + 1; i < cFamily.pUnits.length; i++) {
            cFamily.pUnits[i].pos += diff;
          }
        }
      }

      family = cFamily;
    }
  };
};
