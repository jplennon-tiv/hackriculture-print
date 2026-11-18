# Protected photos · settled rear cover 04

[Download the protected native SVG, layered PDF and sixteen individual crops](https://chatgpt.com/library?file_id=libfile_fde3_f-9dfe2ee73ed88191b56f6a73d75f40a4_968f6e806ba48191b80ffb1b7a35f663&account_id=personal). The full local recovery archive below adds the PSD, OpenRaster and pre-crop originals.

The sixteen [numbered crops](crops/) are the exact native JPEG streams verified against the settled PDF. Each file is read-only. The [manifest](MANIFEST.json) binds the print placement and SHA-256 of each crop to its original working image and crop settings. The revision 04 renderer uses [verified byte copies](copy-crops.cjs). For a future photographic change, make a new revision and preserve this set.

The [recovery archive](../../../../../../../../output/cover-archives/protected-rear-04/The-Vegetable-Guru-Protected-Rear-04.zip) includes Photoshop, Inkscape SVG and OpenRaster masters; a separate layered PDF with the original live footer; all sixteen embedded crops; all sixteen full source images; the settled reference PDF; and integrity checks. The archive is kept in generated output outside Git. The frozen 4.3 MB crop set and its manifest live alongside this document in the project.

The [packager](package.py) reads the original settled proof and verifies both sets of source hashes. Use the project Python runtime. To create a separate recovery package, pass a new directory via `--destination`. [Archive usage and restore instructions](ARCHIVE-NOTES.md).

Checks on 18 November 2026 covered the archive CRC and every SHA-256, all sixteen PSD pixel and position locks, the ORA and Inkscape locks and the PDF layer visibility locks. Independently decoded all embedded native photo streams, opened the PSD merged view, inspected its layer table and compared its potato-photo layer with the corresponding ORA layer. Rendering the layered PDF and independently recompositing the OpenRaster layers both reproduced the settled reference exactly at 406.4 ppi.
