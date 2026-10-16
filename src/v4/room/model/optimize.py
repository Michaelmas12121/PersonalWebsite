"""Deduplicate identical GLB buffer ranges without changing geometry or textures."""
import json
from pathlib import Path
import struct


def optimize(path):
    path = Path(path)
    original = path.read_bytes()
    json_length, json_type = struct.unpack_from('<II', original, 12)
    assert json_type == 0x4E4F534A
    document = json.loads(original[20:20 + json_length])
    binary_header = 20 + json_length
    binary_length, binary_type = struct.unpack_from('<II', original, binary_header)
    assert binary_type == 0x004E4942
    binary = original[binary_header + 8:binary_header + 8 + binary_length]
    packed = bytearray()
    offsets = {}
    for view in document['bufferViews']:
        assert view.get('buffer', 0) == 0
        start = view.get('byteOffset', 0)
        payload = binary[start:start + view['byteLength']]
        if payload not in offsets:
            packed.extend(b'\0' * (-len(packed) % 4))
            offsets[payload] = len(packed)
            packed.extend(payload)
        view['byteOffset'] = offsets[payload]
    document['buffers'][0]['byteLength'] = len(packed)
    encoded = json.dumps(document, separators=(',', ':'), ensure_ascii=True).encode()
    encoded += b' ' * (-len(encoded) % 4)
    packed.extend(b'\0' * (-len(packed) % 4))
    result = (struct.pack('<III', 0x46546C67, 2, 28 + len(encoded) + len(packed))
              + struct.pack('<II', len(encoded), json_type) + encoded
              + struct.pack('<II', len(packed), binary_type) + packed)
    if len(result) < len(original):
        path.write_bytes(result)
    print(f'Lossless GLB packing: {len(original):,} -> {min(len(original), len(result)):,} bytes')


if __name__ == '__main__':
    optimize(Path(__file__).resolve().parents[3] / 'assets/room/desk-room.glb')
