import json

INPUT_FILE = "portfolio_data_raw.json"
OUTPUT_FILE = "portfolio_data.json"

with open(INPUT_FILE, "r", encoding="utf-8-sig") as file:
    data = json.load(file)

for item in data:
    model = item["model"]
    fields = item["fields"]

    if model == "academy.academy":
        fields["user"] = None
        fields["approved_by"] = None

    elif model == "academy.trainer":
        fields["approved_by"] = None

    elif model == "academy.course":
        fields["approved_by"] = None

with open(OUTPUT_FILE, "w", encoding="utf-8") as file:
    json.dump(data, file, ensure_ascii=False, indent=2)

print(f"Created {OUTPUT_FILE}")