import re

with open('app/src/components/Molecule3DmolVSEPREmbed.tsx', 'r') as f:
    content = f.read()

# Find molecules that might have incomplete groups
mol_blocks = re.findall(r'([A-Z][A-Z0-9_]*):\s*\{[^}]*name:\s*"([^"]+)"[^}]*atomList:\s*\[([\s\S]*?)\][^}]*hasLonePairs:', content)

print('Vérification des groupes CH3, CH2, NH2, OH:')
print('=' * 80)

for mol_id, name, atom_list in mol_blocks[:60]:  # First 60 molecules
    atoms = re.findall(r"elem:\s*'([A-Z][a-z]*)'", atom_list)
    coords = re.findall(r"x:\s*([-\d.]+),\s*y:\s*([-\d.]+),\s*z:\s*([-\d.]+)", atom_list)
    
    c_count = atoms.count('C')
    h_count = atoms.count('H')
    
    # Check for potential CH3 group (C with possibly 3 H nearby)
    if 'C' in atoms and len(atoms) <= 20:
        # Simple heuristic: if formula suggests CH3 but few H
        # C6H5CH3 should have 5+3 = 8 H but cycle only has 5 H positions
        pass

# Look for specific patterns - molecules where I expect CH2 or CH3
interesting = ['C6H5CH2CHO', 'C6H5CH2COOH', 'C6H5CH2NH2', 'PHENOL', 'ANILINE', 
               'C2H5OH', 'CH3CHO', 'CH3COCH3', 'C2H5NH2']

for mol_id, name, atom_list in mol_blocks:
    if mol_id in interesting or any(x in name for x in ['éthyl', 'méthyl', 'aldéhyde', 'cétone', 'amine']):
        atoms = re.findall(r"elem:\s*'([A-Z][a-z]*)'", atom_list)
        h_count = atoms.count('H')
        print(f"{mol_id:15} | {name:30} | {len(atoms)} atoms, {h_count} H")
