# Working Map 02 • editable sources

Open `working-map-02/Johns-Allotment-Photo-Map.pdf` for the eight-page walkthrough. Open `working-map-02/Johns-Allotment.blend` for the packed Blender model. In camera view, frames 1–6 select the model views. In the Original photographs scene, frames 1–9 select the stills. Use Rendered shading to see the photographs. Ground overlays are in a separate collection. The model was built with Blender 4.3.2. The Mac Blender MCP connection has not been tested.

`source/layout.py` contains the geometry, camera poses, unit conversion and reference captions shared by both builders. The PDF builder also draws the image annotations and plan labels. Update both when the flyover changes the positions.

From this atlas directory, the following commands build a working copy in `allotment-atlas/`. They require Python with Pillow and ReportLab, and Blender. Set `BLENDER` to the Mac executable if it is outside your PATH, for example `/Applications/Blender.app/Contents/MacOS/Blender`.

```sh
python3 source/build_guide.py
"${BLENDER:-blender}" --background --python-exit-code 1 --python source/build_scene.py
"${BLENDER:-blender}" --background allotment-atlas/Johns-Allotment.blend --python-exit-code 1 --python source/check_scene.py
```

The Noto fonts and their licence are included beside the builders. The nine reference stills, two derived ground overlays and a shed-end detail are also included. The source register in the pack distinguishes existing stills from the requested 01:52 pass. The check script renders two review images beside the source files. Adjust its frame counts if you extend the gallery.
