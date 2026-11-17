"""Package existing images: a one-page PDF and a ten-layer OpenRaster file."""
from pathlib import Path
import json
import zipfile
import xml.etree.ElementTree as ET
from reportlab.pdfgen import canvas
from reportlab.lib.units import mm
from reportlab.lib.utils import ImageReader

HERE = Path(__file__).resolve().parent
manifest = json.loads((HERE / 'LAYERS.json').read_text())
width, height = manifest['native_px']
preview = HERE / 'Layered-Master-Preview.png'
pdf = canvas.Canvas(str(HERE / 'Layered-Master-Preview.pdf'), pagesize=(185*mm, 240*mm), pageCompression=1, invariant=1)
pdf.setTitle('The Vegetable Guru — cream layered working master')
pdf.setAuthor('John Lennon')
pdf.drawImage(ImageReader(str(preview)), 0, 0, width=185*mm, height=240*mm)
pdf.showPage()
pdf.save()

root = ET.Element('image', {'version': '0.0.3', 'w': str(width), 'h': str(height), 'name': 'The Vegetable Guru — cream layered master'})
stack = ET.SubElement(root, 'stack', {'name': 'Cover', 'opacity': '1.0', 'visibility': 'visible', 'composite-op': 'svg:src-over', 'isolation': 'isolate'})
with zipfile.ZipFile(HERE / 'Vegetable-Guru-Layered-Master.ora', 'w') as archive:
    archive.writestr('mimetype', 'image/openraster', compress_type=zipfile.ZIP_STORED)
    for layer in reversed(manifest['layers']):
        data_path = f'data/{layer["index"]:02d}-{layer["id"]}.png'
        ET.SubElement(stack, 'layer', {'name': layer['label'], 'src': data_path, 'x': '0', 'y': '0', 'opacity': '1.0', 'visibility': 'visible', 'composite-op': 'svg:multiply' if layer['id']=='wood-grain' else 'svg:src-over'})
        archive.write(HERE / layer['ora_file'], data_path, compress_type=zipfile.ZIP_DEFLATED)
    archive.writestr('stack.xml', ET.tostring(root, encoding='utf-8', xml_declaration=True), compress_type=zipfile.ZIP_DEFLATED)
    archive.write(preview, 'mergedimage.png', compress_type=zipfile.ZIP_DEFLATED)
    thumbnail = HERE / 'ora-layers/thumbnail.png'
    if thumbnail.exists():
        archive.write(thumbnail, 'Thumbnails/thumbnail.png', compress_type=zipfile.ZIP_DEFLATED)
print('PDF and OpenRaster package written.')
