# Rear cover with portrait sticker

[Open the two-page review PDF](https://chatgpt.com/library?file_id=libfile_fde3_f-ed19569f5f748191bee0052d020ec895_968f6e806ba48191b80ffb1b7a35f663&account_id=personal). Page 1 shows the rear at 185 × 240 mm. Page 2 places it beside the selected front.

John requested removal of the guide counts, a cropped author photograph styled as a sticker, and a new headline for readers aged 50–70. “A book for muddy hands.” draws on his [introduction](../../../../introduction-revision/introduction.txt) and is proposed for review. The 57 mm portrait has a white rim and a soft shadow. A square crop of the [original 4K photograph](../../../../cover-photo-search/tomato-harvest-study/frames/T05_05m16s042_4K.png) keeps the face, hands and bowl of tomatoes inside the circle. The [revision settings](revision.json) specify the crop in source pixels.

The existing blurb, artwork and retail information come from the [first cream rear-cover proposal](../README.md). The guide-count strip and its rules have been removed. The author note and working price sit beside the photograph. Run `node docs/publication/cover-versions/version-1-1/rear-cream-harvest/build.cjs --portrait` from the root on macOS. The PDF is written to `output/pdf/rear-cream-harvest/portrait/`.

Both pages were rendered and inspected, with text fitting, embedded fonts, revised headline, omitted counts and retail details checked. The original front, woodgrain and harvest images matched the image data from the previous proof. The greenhouse photograph retains its registered source hash.
