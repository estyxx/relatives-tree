import { SIZE } from '../constants';
import { max } from '../utils';
import { nodeCount, rightSide } from '../utils/units';
import { FamilyType, Unit } from '../types';

class Family {

  id: number;
  type: FamilyType;
  main: boolean;
  pID: number | null;
  cID: number | null;
  top: number;
  left: number;
  pUnits: Unit[];
  cUnits: Unit[];

  constructor(id: number, type: FamilyType, isMain: boolean = false) {
    this.id = id;
    this.type = type;
    this.main = isMain;

    this.pID = null;
    this.cID = null;

    this.top = 0;
    this.left = 0;

    this.pUnits = [];
    this.cUnits = [];
  }

  get width(): number {
    return max([...this.pUnits, ...this.cUnits].map(rightSide));
  }

  get height(): number {
    return this.pUnits.length ? SIZE * 2 : SIZE;
  }

  get right(): number {
    return this.left + this.width;
  }

  get pCount(): number {
    return this.pUnits.reduce((a, b) => a + nodeCount(b), 0);
  }

  get cCount(): number {
    return this.cUnits.reduce((a, b) => a + nodeCount(b), 0);
  }

  get pUnitsWithParents() {
    return this.pUnits.filter(unit => (
      !!unit.nodes.find(node => !!node.parents.length)
    ));
  }

  get cUnitsWithChildren() {
    return this.cUnits.filter(unit => (
      !!unit.nodes.find(node => !!node.children.length)
    ));
  }

}

export default Family;
