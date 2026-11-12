export type Gender = 'male' | 'female';

export interface Spouse {
  id: string;
  nameBn: string;
  nameEn: string;
  gender: Gender;
  notes?: string;
}

export interface FamilyMember {
  id: string;
  nameBn: string;
  nameEn: string;
  aliasBn?: string;
  aliasEn?: string;
  gender: Gender;
  generation: number; // 1 to 6
  generationNameBn: string;
  generationNameEn: string;
  parentId?: string; // id of bloodline parent
  secondaryParentId?: string; // e.g. mother if recorded
  spouse?: Spouse;
  branchId: string; // 'root' | 'haran' | 'torabuddin' | 'jorap' | 'tamez' | 'nidan' | 'nazrul' | 'samsul' | 'abu_mostofa' | 'mohammad_ali' | 'ahammed_ali'
  branchNameBn: string;
  branchNameEn: string;
  order: number; // birth order
  isDirectDescendant: boolean;
  notesBn?: string;
  notesEn?: string;
  childrenIds: string[];
}

export type ViewMode = 'sketch_horizontal' | 'vertical_tree' | 'generation_matrix' | 'branch_view';

export type Language = 'bn' | 'en';
