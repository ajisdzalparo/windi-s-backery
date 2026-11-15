"""Mengecilkan tekstur gambar di dalam file GLB (tanpa alat tambahan).

Pemakaian: python assets-src/shrink_glb.py <masuk.glb> <keluar.glb> [ukuran_maks=1024] [kualitas_jpeg=82]
"""

import io
import json
import struct
import sys

from PIL import Image


def pad4(data: bytes, fill: bytes = b"\x00") -> bytes:
    return data + fill * ((4 - len(data) % 4) % 4)


def main(src: str, dst: str, max_size: int = 1024, quality: int = 82) -> None:
    raw = open(src, "rb").read()
    magic, version, _ = struct.unpack("<4sII", raw[:12])
    assert magic == b"glTF" and version == 2, "bukan GLB versi 2"
    json_len = struct.unpack("<I", raw[12:16])[0]
    gltf = json.loads(raw[20 : 20 + json_len])
    bin_off = 20 + json_len
    bin_len = struct.unpack("<I", raw[bin_off : bin_off + 4])[0]
    blob = raw[bin_off + 8 : bin_off + 8 + bin_len]

    views = gltf["bufferViews"]
    image_views = {im["bufferView"]: i for i, im in enumerate(gltf.get("images", [])) if "bufferView" in im}

    # Susun ulang buffer: data biasa disalin, gambar dikecilkan & dikompres ulang.
    out = bytearray()
    for vi, view in enumerate(views):
        start = view.get("byteOffset", 0)
        data = blob[start : start + view["byteLength"]]
        if vi in image_views:
            img = Image.open(io.BytesIO(data)).convert("RGB")
            img.thumbnail((max_size, max_size), Image.LANCZOS)
            buf = io.BytesIO()
            img.save(buf, "JPEG", quality=quality, optimize=True)
            data = buf.getvalue()
            gltf["images"][image_views[vi]]["mimeType"] = "image/jpeg"
            print(f"gambar {image_views[vi]}: {view['byteLength'] // 1024} KB -> {len(data) // 1024} KB ({img.size[0]}x{img.size[1]})")
        while len(out) % 4:
            out.append(0)
        view["byteOffset"] = len(out)
        view["byteLength"] = len(data)
        out += data
    out = pad4(bytes(out))
    gltf["buffers"][0]["byteLength"] = len(out)

    js = pad4(json.dumps(gltf, separators=(",", ":")).encode(), b" ")
    total = 12 + 8 + len(js) + 8 + len(out)
    with open(dst, "wb") as f:
        f.write(struct.pack("<4sII", b"glTF", 2, total))
        f.write(struct.pack("<I4s", len(js), b"JSON") + js)
        f.write(struct.pack("<I4s", len(out), b"BIN\x00") + out)
    print(f"{src} ({len(raw) // 1024} KB) -> {dst} ({total // 1024} KB)")


if __name__ == "__main__":
    a = sys.argv[1:]
    main(a[0], a[1], int(a[2]) if len(a) > 2 else 1024, int(a[3]) if len(a) > 3 else 82)
