import json
import os
import sys

sys.path.append(os.path.join(os.path.dirname(__file__)))
from raw_part1 import RAW_PART1
from raw_part2 import RAW_PART2
from raw_part3 import RAW_PART3
from cleaner_helper import clean_record

all_raw = RAW_PART1 + RAW_PART2 + RAW_PART3
print(f"Total raw records loaded: {len(all_raw)}")

assert len(all_raw) == 325, f"Expected 325 records, got {len(all_raw)}"

# Check IDs
ids = [r["id"] for r in all_raw]
assert len(set(ids)) == 325, "Duplicate IDs found!"
for i in range(1, 326):
    expected_id = f"venice_{i:04d}"
    assert expected_id in ids, f"Missing {expected_id}"

print("All 325 IDs verified strictly from venice_0001 to venice_0325!")

# 1. Save raw archive
data_dir = os.path.join(os.getcwd(), "data")
os.makedirs(data_dir, exist_ok=True)

raw_path = os.path.join(data_dir, "venice_archive_raw.json")
with open(raw_path, "w", encoding="utf-8") as f:
    json.dump(all_raw, f, indent=2, ensure_ascii=False)
print(f"Saved {raw_path}")

# 2. Process all records through cleaner_helper
cleaned_records = []
for r in all_raw:
    c = clean_record(r)
    # Ensure coordinates object is preserved as well for leaflet/map compatibility
    c["coordinates"] = {
        "lat": c["lat"],
        "lng": c["lng"]
    }
    cleaned_records.append(c)

archive_json_path = os.path.join(data_dir, "venice_archive.json")
with open(archive_json_path, "w", encoding="utf-8") as f:
    json.dump(cleaned_records, f, indent=2, ensure_ascii=False)
print(f"Saved {archive_json_path} ({len(cleaned_records)} records)")

# 3. Write src/data/veniceArchive.ts
ts_path = os.path.join(os.getcwd(), "src", "data", "veniceArchive.ts")
with open(ts_path, "w", encoding="utf-8") as f:
    f.write("// Venice Historical Archive - Verified Public Domain Records\n")
    f.write("// All 325 verified paintings and vintage photographs with authentic historic dates\n")
    f.write("import { HistoricalImage } from '../types';\n\n")
    f.write("export const VENICE_ARCHIVE_RECORDS: HistoricalImage[] = ")
    f.write(json.dumps(cleaned_records, indent=2, ensure_ascii=False))
    f.write(";\n\n")
    f.write("export default VENICE_ARCHIVE_RECORDS;\n")
print(f"Saved {ts_path} ({len(cleaned_records)} records)")

print("SUCCESS: 325 records completely compiled!")
