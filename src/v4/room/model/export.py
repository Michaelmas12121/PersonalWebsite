"""Generate the portfolio desk GLB and a matching lightweight fallback image.

Run textures.mjs first, then Blender in background mode with this file.
The site loads the export; Blender is never a runtime dependency.
"""
import sys
from pathlib import Path

import bpy

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[3]
sys.dont_write_bytecode = True
sys.path.insert(0, str(HERE))
import kit
import layout
from optimize import optimize

kit.ROOT = str(ROOT / 'docs/local/room-builder')
OUTPUT = ROOT / 'src/assets/room'
OUTPUT.mkdir(parents=True, exist_ok=True)
scene = bpy.context.scene
layout.build(scene)
kit.set_mode('beauty')

# Omit the reference author's identity, branded projects and themed mascot.
REMOVE = ('mask', 'echo_', 'badge', 'shroom', 'pot', 'soil', 'rt_', 'pawn', 'fries', 'plate', 'neon_', 'sticky_c')
for ob in list(bpy.data.objects):
    if ob.name.startswith(REMOVE):
        bpy.data.objects.remove(ob, do_unlink=True)

# These stable keys retain the existing content destinations and incoming hashes.
TARGETS = {
    'notebook': 'figure', 'contact': 'figure',
    'monitor': 'monitor', 'keyboard': 'monitor',
    'board': 'mac', 'zine-preuni': 'activities',
    'trophy': 'achievements', 'camera': 'window', 'photos': 'window',
}
PORTALS = {'mon_screen': 'monitor', 'board_face': 'mac', 'polaroid_b': 'window', 'zine_preuni': 'activities'}
for ob in bpy.data.objects:
    if ob.type != 'MESH':
        continue
    target = TARGETS.get(ob.get('hot'))
    if target:
        ob['target'] = target
    if 'hot' in ob:
        del ob['hot']
    if ob.name in PORTALS:
        ob['portal'] = PORTALS[ob.name]
    if ob.name.startswith('tower') or ob.name == 'ground':
        ob['backdrop'] = True
    # Beveled edges catch the light without a heavy all-over wireframe.
    if len(ob.data.polygons) == 6 and not ob.name.startswith('tower'):
        bevel = ob.modifiers.new('Soft edges', 'BEVEL')
        bevel.width = min(min(ob.dimensions) * 0.15, 0.006)
        bevel.segments = 2
    for mat in ob.data.materials:
        if mat:
            mat.use_backface_culling = True

# A restrained studio palette replaces the bright accessory colors.
PALETTE = {
    'rug': '#484f4a', 'rug_in': '#667069', 'floor': '#a8a49a',
    'hp': '#596762', 'hp_pad': '#78877e', 'leaf_a': '#60795a', 'leaf_b': '#819476',
    'gold': '#b9a475', 'cap_#ff7a3d': '#b58a65', 'nb_pen': '#966b56',
    'vinyl_sleeve': '#8c816c', 'vinyl_stripe': '#b9a580',
    'vinyl_label': '#b9a580', 'mug_band': '#7f938a',
    'edge_#2f9e77': '#647b6b', 'cam_ring': '#aa7965',
}
# Use matte metals: the browser lighting should remain readable without an HDRI.
for mat in bpy.data.materials:
    if mat.node_tree:
        for node in mat.node_tree.nodes:
            if node.type == 'BSDF_PRINCIPLED':
                color = PALETTE.get(mat.name)
                if mat.name.startswith('pen') and mat.name[3:].isdigit():
                    color = ['#b07a64', '#7c8e92', '#b39b6b', '#758877'][int(mat.name[3:]) % 4]
                if color:
                    node.inputs['Base Color'].default_value = kit.rgb(color)
                    mat.diffuse_color = kit.rgb(color)
                if mat.name in {'tex_wood.png', 'tex_notebook.png'}:
                    node.inputs['Roughness'].default_value = 0.88
                node.inputs['Metallic'].default_value = min(node.inputs['Metallic'].default_value, 0.35)
                node.inputs['Roughness'].default_value = max(node.inputs['Roughness'].default_value, 0.38)

# Remove colored decorative spill from the offline fallback as well.
for ob in list(bpy.data.objects):
    if ob.type == 'LIGHT' and ob.name.startswith(('strip_', 'neon_', 'puck_')):
        bpy.data.objects.remove(ob, do_unlink=True)

world = scene.world or bpy.data.worlds.new('World')
scene.world = world
world.use_nodes = True
background = next(n for n in world.node_tree.nodes if n.type == 'BACKGROUND')
background.inputs['Color'].default_value = kit.rgb('#c9dce7')
background.inputs['Strength'].default_value = 0.5

# Export only geometry, materials and metadata; browser lights are authored there.
for ob in bpy.context.selected_objects:
    ob.select_set(False)
for ob in bpy.data.objects:
    if ob.type in {'MESH', 'EMPTY'}:
        ob.select_set(True)
bpy.ops.export_scene.gltf(
    filepath=str(OUTPUT / 'desk-room.glb'), export_format='GLB',
    use_selection=True, export_apply=True, export_extras=True,
    export_cameras=False, export_lights=False, export_animations=False,
    export_image_format='JPEG', export_jpeg_quality=85,
    export_copyright='Desk geometry: Copyright (c) 2025-2026 Evan Lin. MIT; see /room-license.txt.',
)
optimize(OUTPUT / 'desk-room.glb')

# Blender and glTF use different up axes: (x, y, z) becomes (x, z, -y).
cam = scene.camera
print('CAMERA', tuple(cam.location), 'lens', cam.data.lens)
scene.render.engine = 'CYCLES'
scene.cycles.samples = 32
scene.cycles.use_denoising = True
scene.render.resolution_x = 1600
scene.render.resolution_y = 1000
scene.render.resolution_percentage = 100
scene.view_settings.view_transform = 'AgX'
scene.view_settings.look = 'AgX - Medium High Contrast'
scene.render.image_settings.file_format = 'PNG'
scene.render.image_settings.color_mode = 'RGB'
scene.render.filepath = str(ROOT / 'docs/local/room-builder/desk-poster.png')
try:
    prefs = bpy.context.preferences.addons['cycles'].preferences
    prefs.compute_device_type = 'METAL'
    prefs.get_devices()
    for device in prefs.devices:
        device.use = True
    scene.cycles.device = 'GPU'
except Exception:
    scene.cycles.device = 'CPU'
bpy.ops.render.render(write_still=True)
print('Exported desk scene and fallback render.')
